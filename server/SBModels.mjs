function User(id,username, passowrd, salt, isAdmin) {
    this.id = id;
    this.username = username;
    this.passowrd = passowrd;
    this.salt = salt;
    this.isAdmin = isAdmin;
}
function Budget(id, budget, phase, year, description) {
    this.id = id;
    this.budget = budget;
    this.phase = phase;
    this.year = year;
    this.description = description;
}
function Proposal(id, user_id, description, cost) {
    this.id = id;
    this.user_id = user_id;
    this.description = description;
    this.cost = cost;
}
function ProposalView(id, username, description, cost, score) {
    this.id = id;
    this.username = username;
    this.description = description;
    this.cost = cost;
    this.score = score;
}
function Preference(preference_id, proposal_id, description, cost, score) {
    this.preference_id = preference_id;
    this.proposal_id = proposal_id;
    this.description = description;
    this.cost = cost;
    this.score = score;
}
function PreferenceView(preference_id, proposal_id, user_id, score) {
    this.preference_id = preference_id;
    this.proposal_id = proposal_id;
    this.user_id = user_id;
    this.score = score;
}

function CustomError(code, message) {
    this.code = code;
    this.message = message;
}
export { User, Budget, Proposal, Preference, CustomError, PreferenceView, ProposalView };