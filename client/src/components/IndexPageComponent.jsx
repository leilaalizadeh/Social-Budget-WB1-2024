import { useState, useEffect } from 'react';
import { Row, Col, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import API from '../API.mjs';
function ApprovedTable(props) {
    const sortedApproved = [...props.lists];
    return (
        <Table striped>
            <thead>
                <tr>
                    <th>description</th>
                    <th>cost</th>
                    <th>score</th>
                    <th>author</th>
                </tr>
            </thead>
            <tbody>
                {sortedApproved.map((b) => <ApprovedRow key={b.id} lists={b} />)}
            </tbody>
        </Table>
    );
}
function ApprovedRow(props) {
    return (
        <tr>
            <ApprovedRowData lists={props.lists} />
        </tr>
    );
}
function ApprovedRowData(props) {
    return (
        <>
            <td>{props.lists.description}</td>
            <td>{props.lists.cost}</td>
            <td>{props.lists.score}</td>
            <td>{props.lists.username}</td>
        </>
    );
}
function ApprovedAnLayout(props) {

    const [approved, setApproved] = useState([]);
    const [phase, setPhase] = useState(null);

    const getPhase = async () => {
        const result = await API.getPhase();
        setPhase(result.phase);
    }
    const getApprovedProposals = async () => {

        let result = await API.getJustApprovedProposals();
        setApproved(result);
    }

    useEffect(() => {
        getPhase();
        getApprovedProposals();

    }, []);


    if (phase != 3) {
        return (
            <>
                {!props.loggedIn &&
                    <Row>
                        <Col as='h3'>The proposal definition phase is ongoing ...</Col>
                    </Row>
                }
                {(props.admin) &&
                    <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/budget'} relative='path'>Budget</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/proposals'} relative='path'>My Proposals</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/preferences'} relative='path'>My Preference</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/approvedProposals'} relative='path'>Approved List</Link></Col>
                    </Row>
                }
            </>
        );
    }
    else {
        return (
            <>
                {(props.admin) &&
                    <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/budget'} relative='path'>Budget</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/proposals'} relative='path'>My Proposals</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/preferences'} relative='path'>My Preference</Link></Col>
                    </Row>
                }
                {(props.loggedIn) &&
                    <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/approvedProposals'} relative='path'>Approved List</Link></Col>
                    </Row>
                }

                {(!props.loggedIn) &&
                    <Row>
                        <Col as='h3'>Approved Proposals</Col>
                    </Row>
                }
                {(!props.loggedIn) &&
                    <Row>
                        <Col lg={10} className="mx-auto">
                            <ApprovedTable lists={approved} />
                        </Col>
                    </Row>
                }
            </>
        );
    }
}

export default ApprovedAnLayout;