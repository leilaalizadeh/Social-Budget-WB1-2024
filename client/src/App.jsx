import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { LoginForm } from './components/AuthComponents';
import NavHeader from "./components/NavHeader";
import ApprovedLayout from "./components/ApprovedProposals";
import ApprovedAnLayout from "./components/IndexPageComponent";
import { BudgetLayout, AddBudgetLayout } from "./components/BudgetComponents";
import { ProposalsLayout, AddEditProposalsLayout } from './components/ProposalComponent';
import NotFound from "./components/NotFoundComponent";
import API from './API.mjs';
import { PreferenceLayout } from './components/PreferenceComponent';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkAdmin, setAdmin] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');


  useEffect(() => {
    const checkAuth = async () => {
      await API.getUserInfo().then(a => {
        if (a != null) {
          setName({ msg: `Welcome ${a.username}!`, type: 'success' });
          setLoggedIn(true);
          setUser(a);
          if (a.isAdmin == 1)
            setAdmin(true);
          else
            setAdmin(false);
        }
      }).catch(e => {
        //console.log(e);
      });
    };
    checkAuth();
  }, []);


  const handleLogin = async (credentials) => {
    await API.logIn(credentials).then(a => {
      setUser(a);
      setName({ msg: `Welcome ${a.username}!`, type: 'success' });
      setLoggedIn(true);
      if (a.isAdmin == 1)
        setAdmin(true);
      else
        setAdmin(false);
      setMessage('');
    }).catch(e => {
      setMessage({ msg: e.message, type: 'danger' });
    })
  };

  const handleLogout = async () => {
    await API.logOut();

    setLoggedIn(false);
    setAdmin(false);
    setMessage('');
    setName('');
  };

  return (
    <Routes>
      <Route element={<>
        <NavHeader admin={checkAdmin} loggedIn={loggedIn} username={name.msg} handleLogout={handleLogout} />
        <Container fluid className='mt-3'>
          {message && <Row>
            <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
          </Row>}
          <Outlet />
        </Container>
      </>
      }>
        <Route index element={
          <ApprovedAnLayout loggedIn={loggedIn} admin={checkAdmin} />
        } />
        <Route path='/approvedProposals' element={
          <ApprovedLayout loggedIn={loggedIn} admin={checkAdmin} />
        } />
        <Route path='/budget' element={
          <BudgetLayout admin={checkAdmin} loggedIn={loggedIn} user={user} />
        } />
        <Route path="/budget/addBudget" element={
          <AddBudgetLayout admin={checkAdmin} loggedIn={loggedIn} mode="add" user={user} />
        } />
        <Route path='/proposals' element={
          <ProposalsLayout admin={checkAdmin} loggedIn={loggedIn} user={user} />
        } />
        <Route path="/proposals/addProposal" element={
          <AddEditProposalsLayout loggedIn={loggedIn} mode="add" user={user} />
        } />
        <Route path="/Proposals/editProposal/:proposalId" element={
          <AddEditProposalsLayout loggedIn={loggedIn} mode="edit" user={user} />
        } />

        <Route path='/preferences' element={
          <PreferenceLayout admin={checkAdmin} loggedIn={loggedIn} user={user} />
        } />
        <Route path="*" element={<NotFound />} />
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' />  : <LoginForm login={handleLogin} />
        } />
      </Route>
    </Routes>);

}

export default App
