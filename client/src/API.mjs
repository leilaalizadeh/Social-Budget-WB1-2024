const SERVER_URL = 'http://localhost:3001';
import CustomError from "../SBModels.mjs";

/**
 * user log in
 * @param {*} credentials username and password for login
 * @returns the information of the user
 */
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user
  }
  else {
    const errMessage = await response.text();
    throw new CustomError(response.status, errMessage);
  }
};
/**
 * Get the current user information
 * @returns the information of the current user 
 */
const getUserInfo = async () => {
  try {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      if (response.status == 401)
        return null;
      throw new CustomError(response.status, user);
    }
  }
  catch (e) {
    if (e.status == 401)
      return null;
  }
};
/**
 * Log out current user
 * @returns null if the user log out 
 */
const logOut = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}
/**
 * Get the current phase 
 * @returns the phase of the budget 
 */
const getPhase = async () => {
  const response = await fetch(SERVER_URL + '/api/getPhase', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const budgetJson = await response.json();
    return budgetJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * Add new budget
 * @param {*} budget - {budget:int, year: int, phase: int}
 * @returns null if the budget is created
 */
const addBudget = async (budget) => {
  const response = await fetch(`${SERVER_URL}/api/addBudget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget: budget.budget, year: budget.year, phase: budget.phase }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
  else return null;
}
/**
 * Get the budgets data
 * @returns the list of the budgets
 */
const getBudget = async () => {
  const response = await fetch(SERVER_URL + '/api/getBudget', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const budgetJson = await response.json();
    return budgetJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * Change to the next phase
 * @param {*} id the id to change
 * @param {*} phase the phase value
 * @returns 
 */
const changePhase = async (id, phase) => {
  const response = await fetch(`${SERVER_URL}/api/changePhase/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase: phase }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
  else return null;
}
/**
 * Delete all the information from all the tables
 * @returns null if the response is OK
 */
const reset = async () => {
  const response = await fetch(SERVER_URL + '/api/reset', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (response.ok)
    return null;
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * The list of the proposals of the current user
 * @param {*} id the id o the user who is log in to the system
 * @returns 
 */
const getUserProposals = async (id) => {
  const response = await fetch(SERVER_URL + '/api/userProposals/' + id, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (response.ok) {
    const proposalJson = await response.json();
    return proposalJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * The list of the proposals of the other users
 * @param {*} id The id of the current user
 * @returns the list of the proposals
 */
const getOtherProposals = async (id) => {
  const response = await fetch(SERVER_URL + '/api/othersProposals/' + id, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const proposalJson = await response.json();
    return proposalJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * Add new proposal, Each user can add 3 proposal
 * @param {*} proposal description:text, cost:int,userId: int
 * @returns null if new proposal is created
 */
const addProposal = async (proposal) => {
  const response = await fetch(SERVER_URL + `/api/addProposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: proposal.description, cost: proposal.cost, userId: proposal.user }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
  else return null;
}
/**
 * Update the information of the proposal 
 * @param {*} proposal 
 * @returns null if the proposal is updated
 */
const editProposal = async (proposal) => {
  const response = await fetch(SERVER_URL + `/api/editProposal/` + proposal.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: proposal.description, cost: proposal.cost, userId: proposal.userId }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
  else return null;
}
/**
 * Delete the proposal
 * @param {*} id the id of the proposal to delete
 * @returns null if the proposal is deleted
 */
const deleteProposal = async (id) => {
  const response = await fetch(SERVER_URL + '/api/deleteProposal/' + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (response.ok)
    return null;
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}


/**
 * add or update the preference
 * @param {*} preference_id the id of the preference to update
 * @param {*} proposal_id the id of the proposal that the user want to add score
 * @param {*} user_id the id of the current user
 * @param {*} score number between 0 and 3
 * @returns null if the preference is created
 */
const addPreference = async (preference_id, proposal_id, user_id, score) => {
  const response = await fetch(`${SERVER_URL}/api/addPreference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preference_id: preference_id,
      proposal_id: proposal_id,
      user_id: user_id,
      score: score
    }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
  else return null;
}
/**
 * dlete the preference 
 * @param {*} id the id of the preference to be deleted
 * @returns null if the preference is deleted
 */
const deletePreference = async (id) => {
  const response = await fetch(SERVER_URL + '/api/deletePreference/' + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (response.ok)
    return null;
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * 
 * @returns the list of the proposals which are approved
 */
const getApprovedProposals = async () => {
  const response = await fetch(SERVER_URL + '/api/getApprovedProposals', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const proposalJson = await response.json();
    return proposalJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}
/**
 * 
 * @returns the list af approved proposals
 */
const getJustApprovedProposals = async () => {
  const response = await fetch(SERVER_URL + '/api/getJustApprovedProposals', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const proposalJson = await response.json();
    return proposalJson;
  }
  else {
    const errMessage = await response.json();
    throw new CustomError(response.status, errMessage);
  }
}

const API = { logIn, logOut, getUserInfo, addBudget, getBudget, changePhase, reset, getUserProposals, addProposal, deleteProposal, getOtherProposals, addPreference, deletePreference, editProposal, getApprovedProposals, getJustApprovedProposals, getPhase };
export default API;