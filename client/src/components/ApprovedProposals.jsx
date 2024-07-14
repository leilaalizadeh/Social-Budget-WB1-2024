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
function ApprovedLayout(props) {
    if (props.loggedIn) {

        const [approved, setApproved] = useState([]);
        const [phase, setPhase] = useState(null);

        const getPhase = async () => {
            const result = await API.getPhase();
            setPhase(result.phase);
        }
        const getApprovedProposals = async () => {

            let result = await API.getApprovedProposals();
            setApproved(result);
        }

        useEffect(() => {
            getPhase();
            getApprovedProposals();

        }, []);


        if (phase != 3) {
            return (
                <>
                    {props.loggedIn &&
                        <Row>
                            <Col as='h3'>Wait until phase 3 to see approved proposals...</Col>
                        </Row>
                    }

                </>
            );
        }
        else {
            return (
                <>

                    <Row>
                        <Col as='h3'>Approved Proposals List</Col>
                    </Row>
                    <Row>
                        <Col lg={10} className="mx-auto">
                            <ApprovedTable lists={approved} />
                        </Col>
                    </Row>
                </>
            );
        }
    } else
        return (<>
            <Row>
                <Col as='h3'>You don't have permission to access this page.</Col>
            </Row>
        </>)
}



export default ApprovedLayout;
