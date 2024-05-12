"use strict";

/** Convenience middleware to handle common auth cases in routes. */
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Patient = require("../models/patient");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

// Global middleware 
// Verify JWT token that's stored in session after login/sign up
// Store payload in user in locals 

function authenticateJWT(req, res, next) {
  console.log(req.session.token)
  try {
    const token = req.session.token

    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

// Is HCP 
function isHCP(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isHCP) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}



// Checks to see right user by checking email 

async function ensureCorrectUserOrHCP(req, res, next) {
  try {
    // Logged in user
    const user = res.locals.user;
    // Getting patient via parem patient id
    const patient = await Patient.get(req.params.pid)


    // Checking correct user via common email 
    if (!(user && (user.isHCP || patient.email === user.email))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isHCP,
  ensureCorrectUserOrHCP,
  ensureAdmin,ensureCorrectUserOrAdmin
};
