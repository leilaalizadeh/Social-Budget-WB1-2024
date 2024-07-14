import { db } from './db.mjs';
import crypto from 'crypto';
import { Proposal, CustomError, Preference, ProposalView, User } from './SBModels.mjs';

/**
 * add new budget
 * @param {*} budget int
 * @param {*} year int
 * @param {*} phase int
 * @returns the id of the new row
 */
export const addBudget = (budget, year, phase) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * from budget';
        db.get(sql, [], (err, row) => {
            if (err)
                reject(new CustomError(500, err))
            else if (row == undefined) {
                sql = 'INSERT INTO budget(budget,year,phase) VALUES(?,?,?)';
                db.run(sql, [budget, year, phase], function (err) {
                    if (err)
                        reject(new CustomError(500, err))
                    else
                        resolve(this.id);
                });
            }
            else
                reject(new CustomError(402, "you cannot add new budget, you already defiend a budget"))
        });
    });
}
/**
 * Change the phase
 * @param {*} id budget table id
 * @param {*} phase 
 * @returns 
 */
export const changePhase = (id, phase) => {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE budget SET phase = ? where id = ?';
        db.run(sql, [phase, id], function (err) {
            if (err)
                reject(new CustomError(500, err))
            else
                resolve(this.changes);
        });
    });
}
/**
 * ِdelete all the data of these three table preference, proposal  and budegt
 * @returns 
 */
export const reset = () => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE from preference`;
        db.run(sql, [], function (err) {
            if (err)
                reject(new CustomError(500, err))
            else {
                const sql = `DELETE from proposal`;
                db.run(sql, [], function (err) {
                    if (err)
                        reject(new CustomError(500, err))
                    else {
                        const sql = `DELETE from budget`;
                        db.run(sql, [], function (err) {
                            if (err)
                                reject(new CustomError(500, err))
                            else {
                                resolve(this.changes);
                            }
                        })
                    }
                })
            }
        })
    })

}
/**
 * Get the details of current budget 
 * @returns 
 */
export const getBudget = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * from budget';
        db.all(sql, [], (err, row) => {
            if (err)
                reject(new CustomError(500, err))
            else if (row === undefined) {
                resolve([]);
            }
            else {

                resolve(row);
            }
        });
    });
}
/**
 * Get the phase of the budget table
 * @returns 
 */
export const getPhase = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT phase from budget';
        db.get(sql, [], (err, row) => {
            if (err)
                reject(new CustomError(500, err))
            else if (row === undefined) {
                resolve({ phase: 0 });
            }
            else {
                resolve(row);
            }
        });
    });
}

/**
 * add new proposal
 * @param {*} description Text
 * @param {*} cost int
 * @param {*} userId int
 * @returns 
 */
export const addProposal = (description, cost, userId) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * from proposal where user_id = ?';
        db.all(sql, [userId], (err, row) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row === undefined || row.length < 3) {
                let sql = 'SELECT * from budget';
                db.get(sql, [], (err, row) => {
                    if (err)
                        reject(new CustomError(500, err));
                    else if (row == undefined)
                        reject(new CustomError(402, "Proposal phase is still closed ..."));
                    else if (row.phase == 2 || row.phase == 3)
                        reject(new CustomError(402, "The phase has changed. You cannot insert a proposal during phase" + row.phase));
                    else {
                        if (row.budget >= cost) {
                            sql = 'INSERT INTO proposal(user_id, description, cost) VALUES(?,?,?)';
                            db.run(sql, [userId, description, cost], function (err) {
                                if (err)
                                    reject(new CustomError(500, err));
                                else
                                    resolve(this.id);
                            });
                        }
                        else
                            reject(new CustomError(402, "Your proposal's cost is more than next year budget."));

                    }
                });
            }
            else
                reject(new CustomError(402, "You cannot insert more than 3 proposals."));
        });
    });
}
/**
 * update the proposal
 * @param {*} id 
 * @param {*} description 
 * @param {*} cost 
 * @param {*} user_id  curent user
 * @returns 
 */
export const editProposal = (id, description, cost, user_id) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * from budget';
        db.get(sql, [], (err, row1) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row1 == undefined)
                reject(new CustomError(402, "The budget is reseted..."));
            else if (row1.phase == 1) {
                let sql = 'SELECT * from proposal where id = ?';
                db.get(sql, [id], (err, row) => {

                    if (err)
                        reject(new CustomError(500, err));
                    else if (row == undefined)
                        reject(new CustomError(402, "Not Found"));
                    else if (user_id == row.user_id) {
                        if (row1.budget >= cost) {
                            const sql = 'UPDATE proposal SET description = ? , cost = ? WHERE id = ?';
                            db.run(sql, [description, cost, id], function (err) {
                                if (err) reject(new CustomError(500, err));
                                resolve(this.changes);
                            });
                        }
                        else {
                            reject(new CustomError(402, "Your proposal's cost is more than next year budget."));
                        }
                    }
                    else {
                        reject(new CustomError(402, "You can edit your own proposal not others."));
                    }
                });
            }
            else
                reject(new CustomError(402, "You cannot modify proposal in this phase."));
        });
    });
}
/**
 * Delete a proposal
 * @param {*} id 
 * @returns 
 */
export const deleteProposal = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM preference WHERE proposal_id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(new CustomError(500, err));
            else {
                let sql = 'SELECT * from budget';
                db.get(sql, [], (err, row) => {
                    if (err)
                        reject(new CustomError(500, err));
                    else if (row == undefined)
                        reject(new CustomError(402, "Proposal phase is still closed ..."));
                    else if (row.phase == 2 || row.phase == 3)
                        reject(new CustomError(402, "Phase is changed. You cannot insert proposal. phase: " + row.phase));
                    else {
                        const sql = `DELETE from proposal where id = ?`;
                        db.run(sql, [id], function (err) {
                            if (err) {
                                reject(new CustomError(500, err));
                            }
                            else {
                                resolve(this.changes);
                            }
                        })
                    }
                })
            }
        })
    })
}
/**
 * Get current user proposals
 * @param {*} userId 
 * @returns List of the proposals
 */
export const getUserProposals = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT p.id,p.description,p.cost from proposal p join user u on p.user_id == u.id where p.user_id = ? ';
        db.all(sql, [userId], (err, row) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row === undefined) {
                resolve([]);
            }
            else {
                const proposal = row.map((q) => new Proposal(q.id, userId, q.description, q.cost));
                resolve(proposal);
            }
        });
    });
}
/**
 * Get users preference
 * @param {*} userId 
 * @returns List of the proposals + preferences of the current user
 */
export const getOtherProposals = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT p.id,p.description,p.cost from proposal p join user u on p.user_id == u.id where u.id != ? ';
        db.all(sql, [userId], (err, row1) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row1 === undefined) {
                resolve([]);
            }
            else {
                const sql = `
                SELECT pre.id as preference_id, pro.id as proposal_id, pro.description, pro.cost,pre.score
                FROM proposal pro
                JOIN preference pre
                ON pro.id = pre.proposal_id
                JOIN user
                ON pre.user_id = user.id
                where user.id = ?;
                `
                db.all(sql, [userId], (err, row) => {
                    if (err)
                        reject(new CustomError(500, err));
                    else if (row === undefined) {
                        resolve([]);
                    }
                    else {
                        const preference = row.map((q) => new Preference(q.preference_id, q.proposal_id, q.description, q.cost, q.score));

                        const proposal = row1.map((p) => {
                            const pre = preference.filter(a => a.proposal_id == p.id)[0];
                            const preference_id = (pre == undefined ? 0 : pre.preference_id);
                            const score1 = (pre == undefined ? 0 : pre.score);
                            return new Preference(preference_id, p.id, p.description, p.cost, score1);

                        });
                        resolve(proposal);
                    }
                });
            }
        });
    });
}
/**
 * Add new score or edit the current score or delete the score 
 * @param {*} preference_id 
 * @param {*} proposal_id 
 * @param {*} user_id 
 * @param {*} score if score = 0 the code delete the row from preference
 * @returns 
 */
export const addPreference = (preference_id, proposal_id, user_id, score) => {
    return new Promise((resolve, reject) => {
        if (score > 3 || score < 0)
            reject(new CustomError(402, "The score should be between 1 and 3 "));
        let sql = 'SELECT phase from budget';
        db.get(sql, [], (err, row) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row == undefined)
                reject(new CustomError(402, "The budget is reseted..."));
            else if (row.phase == 2) {
                if (score == 0) {
                    const sql = `DELETE from preference where id=?`;
                    db.run(sql, [preference_id], function (err) {
                        if (err) {
                            reject(new CustomError(500, err));
                        }
                        else {
                            resolve(this.changes);
                        }
                    });
                }
                else {
                    let sql = 'SELECT * from proposal where id = ?';
                    db.get(sql, [proposal_id], (err, row) => {
                        if (err)
                            reject(new CustomError(500, err));
                        else if (row == undefined)
                            reject(new CustomError(404, "Not Found ... "));
                        else if (row.user_id == user_id) {
                            reject(new CustomError(402, "You cannot add preference to your own proposal"));
                        }
                        else {
                            let sql = 'SELECT * from preference where proposal_id = ? and user_id = ?';
                            db.get(sql, [proposal_id, user_id], (err, row) => {
                                if (err)
                                    reject(new CustomError(500, err));
                                else if (row != undefined) {
                                    const sql = 'UPDATE preference SET score = ? WHERE id = ?';
                                    db.run(sql, [score, row.id], function (err) {
                                        if (err) reject(new CustomError(500, err));
                                        resolve(this.changes);
                                    });
                                }
                                else {
                                    sql = 'INSERT INTO preference(user_id, proposal_id, score) VALUES(?,?,?)';
                                    db.run(sql, [user_id, proposal_id, score], function (err) {
                                        if (err) reject(new CustomError(500, err));
                                        resolve(this.id);
                                    });
                                }
                            });
                        }
                    });
                }
            }
            else
                reject(new CustomError(402, "You cannot modify preference in this phase."));
        });
    });
}
/**
 * Delete score the user give to the proposal frpm preference table
 * @param {*} id 
 * @returns 
 */
export const deletePreference = (id) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT phase from budget';
        db.get(sql, [], (err, row) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row == undefined)
                reject(new CustomError(404, "The budget is reseted..."));
            else if (row.phase == 2) {
                const sql = `DELETE from preference where id=?`;
                db.run(sql, [id], function (err) {
                    if (err) {
                        reject(new CustomError(500, err));
                    }
                    else {
                        resolve(this.changes);
                    }
                });
            }
            else
                reject(new CustomError(402, "You cannot modify preference in this phase."));
        });
    });

}

/**
 * 
 * @param {*} username 
 * @param {*} password 
 * @returns 
 */
export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(new CustomError(500, err));
            }
            else if (row === undefined) {
                resolve(false);
            }
            else {
                const user = { id: row.id, username: row.username, name: row.name, isAdmin: row.isAdmin };

                crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
                    if (err) reject(new CustomError(500, err));
                    if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};

/**
 * Get all the approved and unapproved proposals - approved with its author
 * @returns 
 */
export const getApprovedProposals = (type) => {
    return new Promise((resolve, reject) => {

        const sql = `
                select pro.id,pro.description,pro.user_id, pro.cost, sum(pre.score) as scores
                from proposal pro
                Left join preference pre
                on pro.id == pre.proposal_id
                group by pro.id
                ORDER by scores DESC
                `
        db.all(sql, [], (err, row1) => {
            if (err)
                reject(new CustomError(500, err));
            else if (row1 === undefined) {
                resolve([]);
            }
            else {
                const sql = 'SELECT * FROM user';
                db.all(sql, [], (err, row2) => {
                    if (err) {
                        reject(new CustomError(500, err));
                    }
                    else {
                        const sql = 'SELECT budget FROM budget';
                        db.get(sql, [], (err, row) => {
                            if (err) {
                                reject(new CustomError(500, err));
                            }
                            else {
                                const users = row2.map((u) => new User(u.id, u.username));

                                const list1 = [];

                                let cost = 0;
                                let status = false;
                                const result = row1.map((p) => {
                                    if (row.budget >= cost + p.cost && status == false) {
                                        cost = cost + p.cost;
                                        const user = users.find(a => a.id == p.user_id)?.username;
                                        list1.push(new ProposalView(p.id, user, p.description, p.cost, (p.scores == null ? 0 : p.scores)));
                                    }
                                    else {
                                        status = true;
                                        if (type != "anounymous")
                                            list1.push(new ProposalView(p.id, "***", p.description, p.cost, (p.scores == null ? 0 : p.scores)));
                                    }
                                });
                                // console.log(list1.length);
                                //console.log(list2.length);
                                //console.log([...list1, ...list2].length);
                                // resolve([...list1, ...list2]);
                                resolve(list1);
                            }
                        });

                    }
                });
            }
        });

    });
}