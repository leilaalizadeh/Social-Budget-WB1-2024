import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import { getUser, getBudget, addBudget, changePhase, reset, getUserProposals, addProposal, getOtherProposals, addPreference, deletePreference, editProposal, deleteProposal, getApprovedProposals, getPhase } from './sb-dao.mjs';
import { CustomError } from "./SBModels.mjs";


const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if (!user)
    return cb(null, false, 'Incorrect username or password.');
  return cb(null, user);
}));
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

app.use(session({
  secret: "shhhhh... it's a secret code!",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.session());

app.listen(port, () => {
  console.log(`API server started at http://localhost:${port}`);
});
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authorized' });
}
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin == 1) return next();
  return res.status(401).json({ error: "User is not an admin", status: 401 })
}

/**
 * Post /api/sessions Login user
 */
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      return res.status(401).send(info);
    }
    req.login(user, (err) => {
      if (err)
        return next(err);
      return res.status(201).json(req.user);
    });
  })(req, res, next);
});
/**
 * GET /api/sessions/current    current user
 */
app.get('/api/sessions/current', (req, res) => {

  if (req.isAuthenticated()) {
    res.json(req.user);
  }
  else
    res.status(401);
});
/**
 * DELETE /api/session/current  log out user
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});
/**
 * Get /api/getPhase - All the user can get the phase of the current budget 
 */
app.get('/api/getPhase', async (req, res) => {
  try {
    const budget = await getPhase();
    res.json(budget);
  } catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Get /api/getBudget - the information of the current budget
 */
app.get('/api/getBudget', isLoggedIn, async (req, res) => {
  try {
    const budget = await getBudget();
    res.json(budget);
  }
  catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Post /api/addBudget
 */
app.post('/api/addBudget', isAdmin,
  [
    check('budget').notEmpty().isNumeric(),
    check('year').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newBudget = req.body;

    try {
      const id = await addBudget(newBudget.budget, newBudget.year, newBudget.phase);
      res.status(201).location(id).end();
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.code).json({ error: e.message });
      } else {
        res.status(503).json({ error: e.message });
      }
    }
  });
/**
 * Put/api/changePhase/:id
 */
app.put('/api/changePhase/:id', isAdmin, [], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    await changePhase(req.params.id, req.body.phase);
    res.status(200).end();
  } catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Delete /api/reset
 */
app.delete('/api/reset', isAdmin, [], async (req, res) => {
  try {
    await reset();
    res.status(200).end();
  } catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Get /api/userProposals/:id
 */
app.get('/api/userProposals/:id', isLoggedIn, async (req, res) => {
  try {
    const proposal = await getUserProposals(req.params.id);
    res.json(proposal);
  }
  catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Get /api/otherPrposals/:id
 */
app.get('/api/othersProposals/:id', isLoggedIn, async (req, res) => {
  try {
    const proposal = await getOtherProposals(req.params.id);
    res.json(proposal);
  }
  catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Post /api/addProposal
 */
app.post('/api/addProposal', isLoggedIn,
  [
    check('description').notEmpty(),
    check('cost').notEmpty().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newProposal = req.body;

    try {
      const id = await addProposal(newProposal.description, newProposal.cost, newProposal.userId);
      res.status(201).location(id).end();
    }
    catch (e) {
      if (e instanceof CustomError) {
        res.status(e.code).json({ error: e.message });
      } else {
        res.status(503).json({ error: e.message });
      }
    }
  });
/**
 * Put /api/editProposal/:id
 */
app.put('/api/editProposal/:id', isLoggedIn,
  [
    check('description').notEmpty(),
    check('cost').notEmpty().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newProposal = req.body;

    try {
      const id = await editProposal(req.params.id, newProposal.description, newProposal.cost, newProposal.userId);
      res.status(201).location(id).end();
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.code).json({ error: e.message });
      } else {
        res.status(503).json({ error: e.message });
      }
    }
  });
/**
 * Delete /api/deleteProposal/:id
 */
app.delete('/api/deleteProposal/:id', isLoggedIn, [], async (req, res) => {
  try {
    await deleteProposal(req.params.id);
    res.status(200).end();
  } catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});

/**
 * Post /api/addPreference
 */
app.post('/api/addPreference', isLoggedIn,
  [
    check('score').notEmpty().isNumeric()
      .isInt({ min: 0, max: 3 })
      .withMessage('Score must be an integer between 1 and 3')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newPreference = req.body;

    try {
      const id = await addPreference(newPreference.preference_id, newPreference.proposal_id, newPreference.user_id, newPreference.score);
      res.status(201).location(id).end();
    } catch (e) {
      if (e instanceof CustomError) {
        res.status(e.code).json({ error: e.message });
      } else {
        res.status(503).json({ error: e.message });
      }
    }
  });
/**
 * Delete /api/deletePreference/:id
 */
app.delete('/api/deletePreference/:id', isLoggedIn, [], async (req, res) => {
  try {
    await deletePreference(req.params.id);
    res.status(200).end();
  } catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Get /api/getApprovedProposals
 */
app.get('/api/getApprovedProposals', isLoggedIn, async (req, res) => {
  try {
    const preference = await getApprovedProposals();
    res.json(preference);
  }
  catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});
/**
 * Get /api/getJustApprovedProposals
 */
app.get('/api/getJustApprovedProposals', async (req, res) => {
  try {
    const preference = await getApprovedProposals("anounymous");
    res.json(preference);
  }
  catch (e) {
    if (e instanceof CustomError) {
      res.status(e.code).json({ error: e.message });
    } else {
      res.status(503).json({ error: e.message });
    }
  }
});


