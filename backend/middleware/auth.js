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
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
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


// Misnamed, should be ensureCorrectPatientOrHCP
// Leaving it alone to avoid having to rewrite tests

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


async function ensureCorrectUser(req, res, next) {
  try {
    // Logged in user
    const user = res.locals.user;
    
    // Checking correct user via common email 
    if (!(user && (user.username===req.params.username))) {
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
  ensureCorrectUser
};
