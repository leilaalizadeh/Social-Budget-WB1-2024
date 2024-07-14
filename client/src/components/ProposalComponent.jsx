import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import API from '../API.mjs';

function ProposalsTable(props) {
    const sortedProposals = [...props.proposals];
    return (
        <Table striped>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sortedProposals.map((b) => <ProposalsRow deleteProposal={props.deleteProposal} phase={props.phase} proposal={b} key={b.id} loggedIn={props.loggedIn} user={props.user} />)}
            </tbody>
        </Table>
    );

}
function ProposalsRow(props) {
    return (
        <tr>
            <ProposalsRowData proposals={props.proposal} />
            {props.loggedIn && <ProposalsAction deleteProposal={props.deleteProposal} phase={props.phase} proposal={props.proposal} user={props.user} />}
        </tr>
    );
}
function ProposalsRowData(props) {
    return (
        <>
            <td>{props.proposals.description}</td>
            <td>{props.proposals.cost} Euro</td>
        </>
    );
}
function ProposalsAction(props) {
    if (props.phase == 1) {
        return (
            <td>
                <Link variant='warning' state={props.proposal} to={`/Proposals/editProposal/${props.proposal.id}`}><i className='bi bi-pencil-square'></i></Link>
                <Button id="dangerBtn" onClick={() => props.deleteProposal(props.proposal.id)} variant='danger'><i className='bi bi-trash'></i></Button>

            </td>
        );
    }
    return (<td></td>);
}
function ProposalsLayout(props) {
    if (props.loggedIn) {
        const [proposals, setProposals] = useState([]);
        const [addBtn, setAddBtn] = useState(0);
        const [phase, setPhase] = useState(0);
        const [budget, setBudget] = useState([]);
        const [error, setError] = useState(null);


        const getBudgetData = async () => {
            const result = await API.getBudget();
            setBudget(result[0]);
            setPhase(result[0].phase);
        }
        const getUserProposals = async () => {
            const result = await API.getUserProposals(props.user.id);
            if (result.length == 3)
                setAddBtn(0);

            setProposals(result);
        }

        useEffect(() => {
            getUserProposals(props.user.id);
            getBudgetData();
        }, []);

        const deleteProposal = (id) => {
            setProposals(oldProposal => {
                if (phase == 1)
                    return oldProposal.filter(a => a.id != id);
                else {
                    setError("You cannot modify proposal in this phase.");
                    return oldProposal;
                }
            });
            if (phase == 1) {
                API.deleteProposal(id)
                    .then(() => getUserProposals())
                    .catch(e => setError(e.message.error));
            }
            else
                setError("You cannot modify oldProposal in this phase.");

        }
        if (phase < 1) {
            return (
                <>
                    <Row>
                        <Col as='h3'>Proposal phase is still closed ... </Col>
                    </Row>
                </>
            );
        }
        else {
            return (
                <>
                    {(phase == 2 || phase == 3) && <Row >
                        <Col className='danger' as='h2'>You cannot modify your proposals in this phase...</Col>
                    </Row>
                    }

                    <Row>
                        <Col as='h3'>Proposals: year {budget.year}, <a className='danger'> {budget.budget} Euro</a></Col>
                    </Row>
                    <Row>
                        <Col lg={10} className="mx-auto">
                            <ProposalsTable phase={phase} deleteProposal={deleteProposal} proposals={proposals} loggedIn={props.loggedIn} />
                            {(props.loggedIn && addBtn == 0 && phase == 1) && <Link className="btn btn-primary mb-4" to="addProposal">Add</Link>}
                        </Col>
                    </Row>
                </>
            );
        }
    }
    else
        return (<>
            <Row>
                <Col as='h3'>You don't have permission to access this page.</Col>
            </Row>
        </>)
}
function ProposalForm(props) {

    const navigate = useNavigate();

    const [waiting, setWaiting] = useState(false);
    const [error, setError] = useState(null);

    const [description, setDescription] = useState(props.proposal ? props.proposal.description : "");
    const [cost, setCost] = useState(props.proposal ? props.proposal.cost : "");

    const handleSubmit = (event) => {
        event.preventDefault();

        const proposalsValues = { description, cost, user: props.user.id };

        setWaiting(true); // Set waiting state to true


        if (props.mode === 'edit') {
            API.editProposal({ id: props.proposal.id, description: description, cost: cost, userId: props.user.id })
                .then(() => navigate(`/proposals`))
                .catch((e) => {
                    setError(JSON.stringify(e.message.error));
                    setWaiting(false);
                });
        } else {
            API.addProposal(proposalsValues)
                .then(() => navigate(`/proposals`))
                .catch((e) => {
                    setError(JSON.stringify(e.message.error));
                    setWaiting(false);
                    //JSON.stringify(error)
                })
        }
    }

    return (
        <div>
            {error && <Alert variant='danger' onClose={() => setError(null)} dismissible>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>description</Form.Label>
                    <Form.Control type="text" id="description" required={true} value={description} onChange={(event) => setDescription(event.target.value)}></Form.Control>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Cost</Form.Label>
                    <div className="d-flex">
                        <Form.Control type="number" value={cost} onChange={(event) => setCost(event.target.value)} />
                        <span className="input-group-text">Euro</span>
                    </div>
                </Form.Group>
                {props.mode === 'add' && <Button variant='success' type='submit' disabled={waiting}>Add</Button>}
                {props.mode === 'edit' && <Button variant='primary' type='submit' disabled={waiting}>Update</Button>}
                <Link className='btn btn-danger mx-2 my-2' to={'/proposals'} relative='path'>Cancel</Link>
            </Form>
            <Outlet />
        </div>
    );
}
function AddEditProposalsLayout(props) {
    if (props.loggedIn) {
        const location = useLocation();
        const editableProposals = location.state;

        return (
            <> {<>
                <Row>
                    <Col md={6} as='p'>
                        <strong>Proposal Form</strong>
                    </Col>
                </Row>
                {
                    props.mode === 'edit' && !editableProposals ?
                        <Row>
                            <Col md={6}>
                                <p>Proposal not found!</p>
                                <Link className='btn btn-danger' to={`/budget`}>Go back</Link>
                            </Col>
                        </Row>
                        : <ProposalForm mode={props.mode} proposal={editableProposals} addProposal={props.addProposal} updateProposal={props.updateProposal} user={props.user} />
                }</>
            }
            </>
        );
    }
    else
        return (<>
            <Row>
                <Col as='h3'>You don't have permission to access this page.</Col>
            </Row>
        </>)

}
export { ProposalsLayout, AddEditProposalsLayout };

/*
{(phase >= 1) && props.admin && <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/budget'} relative='path'>Budget</Link></Col>

                    </Row>
                    }
                    {(phase == 2 || phase == 3) && <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/preferences'} relative='path'>My Preference</Link></Col>
                    </Row>
                    }
                    {(phase == 3) && <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/approvedProposals'} relative='path'>Approved List</Link></Col>
                    </Row>
                    }*/
