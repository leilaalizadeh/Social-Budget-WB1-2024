import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import API from '../API.mjs';
import { Budget } from '../../../server/SBModels.mjs';

function BudgetTable(props) {
    const sortedBudgets = [...props.budgets];
    return (
        <Table striped>
            <thead>
                <tr>
                    <th>budget</th>
                    <th>year</th>
                    <th>phase</th>
                    <th>actions</th>
                </tr>
            </thead>
            <tbody>
                {sortedBudgets.map((b) => <BudgetRow changePhase={props.changePhase} budget={b} key={b.id} loggedIn={props.loggedIn} user={props.user} admin={props.admin} />)}
            </tbody>
        </Table>
    );
}
function BudgetRow(props) {
    return (
        <tr>
            <BudgetRowData budgets={props.budget} />
            {props.loggedIn && <BudgetAction changePhase={props.changePhase} budget={props.budget} admin={props.admin} user={props.user} />}
        </tr>
    );
}
function BudgetRowData(props) {
    return (
        <>
            <td>{props.budgets.budget} Euro</td>
            <td>{props.budgets.year}</td>
            <td>{props.budgets.phase}</td>
        </>
    );
}
function BudgetAction(props) {
    return (
        <td>
            <Button variant='success' onClick={() => props.changePhase(props.budget.id, props.budget.phase, "change")}
                disabled={props.budget.phase == 3}>Next Phase</Button>

            <Button id="dangerBtn" variant='danger' onClick={() => props.changePhase(props.budget.id, props.budget.phase, "reset")}
                disabled={props.budget.phase == 1 || props.budget.phase == 2 || props.budget.phase == null}>Reset</Button>

        </td>
    );
}
function BudgetLayout(props) {
    if (props.loggedIn && props.admin) {
        const [budget, setBudget] = useState([]);
        const [addBtn, setAddBtn] = useState(0);

        const getBudget = async () => {
            const result = await API.getBudget();
            if (result.length == 0)
                setAddBtn(0);
            else
                setAddBtn(result[0].phase);

            setBudget(result);
        }

        useEffect(() => {
            getBudget();
        }, []);

        const changePhase = (id, phase, type) => {
            setBudget(oldBudgets => {
                return oldBudgets.map(b => {
                    if (b.id === id) {
                        let budget;
                        if (type == "change")
                            budget = new Budget(b.id, b.budget, b.phase + 1, b.year, b.description);
                        else
                            budget = new Budget(b.id, b.budget, b.phase, b.year, b.description);
                        return budget;
                    }
                    else
                        return b;
                });
            });
            if (type == "change") {
                API.changePhase(id, phase + 1)
                    .then(() => getBudget())
                    .catch(e => JSON.stringify(e.message.error));
            }
            if (type == "reset") {
                API.reset()
                    .then(() => getBudget())
                    .catch(e => JSON.stringify(e.message.error));
            }
        }

        return (
            <>
                <Row>
                    <Col as='h3'>Budget</Col>
                </Row>
                <Row>
                    <Col lg={10} className="mx-auto">
                        <BudgetTable budgets={budget} changePhase={changePhase} admin={props.admin} loggedIn={props.loggedIn} />
                        {(props.loggedIn && props.admin && addBtn < 1) && <Link className="btn btn-primary mb-4" to="addBudget">Add</Link>}
                    </Col>
                </Row>
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
function BudgetForm(props) {

    const navigate = useNavigate();

    const [waiting, setWaiting] = useState(false);

    //const [budget, setBudget] = useState(props.budget ? props.budget.text : "");
    //const [year, setYear] = useState(props.year ? props.budget.year : "");

    const [budget, setBudget] = useState(0);
    const [year, setYear] = useState(0);
    const [phase, setPhase] = useState(1);

    const handleSubmit = (event) => {
        event.preventDefault();

        const budgetValues = { budget, year, phase };


        setWaiting(true);

        if (props.mode === 'edit') {
            API.updateAnswer({ id: props.answer.id, ...answer, score: props.answer.score })
                .then(() => navigate(`/questions/${questionId}`));
        } else {
            API.addBudget(budgetValues)
                .then(() => navigate(`/budget`));
        }
    }

    return (
        <>
            {waiting && <Alert variant='secondary'>Please, wait for the server's answer...</Alert>}

            <Col>
                <Form onSubmit={handleSubmit}>

                    <Form.Group className='mb-3'>
                        <Form.Label>Budget</Form.Label>
                        <div className="d-flex">
                            <Form.Control type="number" required onChange={(event) => setBudget(event.target.value)} />
                            <span className="input-group-text">Euro</span>
                        </div>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Year</Form.Label>
                        <Form.Control type="number" maxLength="4" onChange={(event) => setYear(event.target.value)}></Form.Control>
                    </Form.Group>
                    {props.mode === 'add' && <Button variant='success' type='submit' disabled={waiting}>Add</Button>}
                    {props.mode === 'edit' && <Button variant='primary' type='submit' disabled={waiting}>Update</Button>}
                    <Link className='btn btn-danger mx-2 my-2' to={'/budget'} relative='path'>Cancel</Link>
                </Form>
            </Col>
        </>
    );
}
function AddBudgetLayout(props) {
    if (props.loggedIn && props.admin) {
        const location = useLocation();
        const editableBudget = location.state;
        return (
            <> {<>
                <Row>
                    <Col md={6} as='p'>
                        <strong>Budget Form</strong>
                    </Col>
                </Row>
                {
                    props.mode === 'edit' && !editableBudget ?
                        <Row>
                            <Col md={6}>
                                <p>Budget not found!</p>
                                <Link className='btn btn-danger' to={`/budget`}>Go back</Link>
                            </Col>
                        </Row>
                        : <BudgetForm mode={props.mode} budget={editableBudget} addBudget={props.addBudegt} updateBudget={props.updateBudget} user={props.user} />
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
export { BudgetLayout, AddBudgetLayout };



/*
 {(addBtn >= 1) &&
                    <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/proposals'} relative='path'>My Proposals</Link></Col>

                    </Row>
                }
                {(addBtn == 2 || addBtn == 3) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/preferences'} relative='path'>My Preference</Link></Col>
                    </Row>
                }
                {(addBtn == 3) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/approvedProposals'} relative='path'>Approved List</Link></Col>
                    </Row>
                }
                    */