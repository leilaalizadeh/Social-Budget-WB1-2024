import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Alert, Row, Col, Table } from 'react-bootstrap';
import API from '../API.mjs';
import { PreferenceView } from '../../../server/SBModels.mjs';

function PreferenceTable(props) {
    const sortedPreference = [...props.preference];
    return (
        <Table striped>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Score</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sortedPreference.map((b) => <PreferenceRow phase={props.phase} deletePreference={props.deletePreference} addPreference={props.addPreference} preference={b} key={b.proposal_id} loggedIn={props.loggedIn} user={props.user} />)}
            </tbody>
        </Table>
    );
}
function PreferenceRow(props) {
    return (
        <tr>
            <PreferenceRowData preference={props.preference} />
            {props.loggedIn && <PreferenceAction phase={props.phase} deletePreference={props.deletePreference} addPreference={props.addPreference} preference={props.preference} user={props.user} />}
        </tr>
    );
}
function PreferenceRowData(props) {
    return (
        <>
            <td>{props.preference.description}</td>
            <td>{props.preference.cost} Euro</td>
            <td>{props.preference.score}</td>
        </>
    );
}
function PreferenceAction(props) {
    if (props.phase == 2) {
        return (
            <td>
                <Button variant='success'
                    onClick={() => props.addPreference(props.preference.preference_id, props.preference.proposal_id, props.user.id, props.preference.score, 1)}>
                    <i className='bi bi-arrow-up'></i></Button>
                <Button id="down" variant='warning'
                    onClick={() => props.addPreference(props.preference.preference_id, props.preference.proposal_id, props.user.id, props.preference.score, -1)}>
                    <i className='bi bi-arrow-down'></i></Button>
                <Button id="down" variant='danger'
                    onClick={() => props.deletePreference(props.preference.preference_id)}>
                    <i className='bi bi-trash'></i></Button>
            </td>
        );
    }
    else {
        return (<><td></td></>)
    }
}
function PreferenceLayout(props) {
    if (props.loggedIn) {
        const [preference, setPreference] = useState([]);
        const [phase, setPhase] = useState(0);
        const [error, setError] = useState(null);

        const getBudgetData = async () => {
            const result = await API.getPhase();
            setPhase(result.phase);
        }
        const getUserPreferences = async () => {
            const result = await API.getOtherProposals(props.user.id);
            setPreference(result);
        }

        useEffect(() => {
            getUserPreferences(props.user.id);
            getBudgetData();
        }, []);

        const addPreference = (preference_id, proposal_id, user_id, score, type) => {
            setPreference(oldPreference => {
                const newScore = score + type;
                if (newScore > 3 || newScore < 0) {
                    setError("The score should be between 1 and 3.");
                    return oldPreference;
                }
                else {
                    return oldPreference.map(b => {

                        if (b.preference_id === preference_id && b.proposal_id == proposal_id) {
                            let newPreference;

                            newPreference = new PreferenceView(b.preference_id, b.proposal_id, b.user_id, b.score);

                            return newPreference;
                        }
                        else
                            return b;
                    });
                }
            });
            const newScore = score + type;
            if (newScore > 3 || newScore < 0)
                setError("The score should be between 1 and 3");
            else {
                API.addPreference(preference_id, proposal_id, user_id, newScore)
                    .then(() => getUserPreferences())
                    .catch(e => setError(JSON.stringify(e.message.error)));
            }
        }
        const deletePreference = (id) => {
            setPreference(oldPreference => {
                if (id != 0) {
                    if (phase == 2)
                        return oldPreference.filter(a => a.preference_id != id);
                    else {
                        setError("You cannot modify preference in this phase.");
                        return oldPreference;
                    }
                }
                else {
                    setError("You do not add preference for this proposal.");
                    return oldPreference;
                }
            });
            if (id != 0) {
                if (phase == 2) {
                    API.deletePreference(id)
                        .then(() => getUserPreferences())
                        .catch(e => setError(JSON.stringify(e.message.error)));
                }
                else
                    setError("You cannot modify preference in this phase.");
            }
            else
                setError("You do not add preference for this proposal.");

        }
        if (phase <= 1) {
            return (
                <>
                    <Row>
                        <Col as='h3'>
                            Wait until Phase 2 to add your preferences.</Col>
                    </Row>
                </>
            );
        }

        else {
            return (
                <>
                    {(phase == 3 || phase == 1) && <Row >
                        <Col className='danger' as='h2'>You cannot modify your preferences in this phase...</Col>
                    </Row>
                    }

                    <Row>
                        {error && <Alert variant='danger' onClose={() => setError(null)} dismissible>{error}</Alert>}
                    </Row>

                    <Row>
                        <Col as='h3'>My Preference</Col>

                    </Row>
                    <Row>
                        <Col lg={10} className="mx-auto">
                            <PreferenceTable phase={phase} deletePreference={deletePreference} addPreference={addPreference} user={props.user} preference={preference} loggedIn={props.loggedIn} />
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

export { PreferenceLayout };






/* {(phase >= 1) && props.admin && <Row>
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/budget'} relative='path'>Budget</Link></Col>
                    </Row>
                    }
                    {(phase == 2 || phase == 3) && <Row >
                        <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/proposals'} relative='path'>My proposals</Link></Col>
                    </Row>
                    }
                    {(phase == 3) &&
                        <Row >
                            <Col as='h2'><Link className='btn btn-success mx-2 my-2' to={'/approvedProposals'} relative='path'>Approved List</Link></Col>
                        </Row>
                    } */
