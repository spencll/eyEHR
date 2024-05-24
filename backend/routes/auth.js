"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

// Login 
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);

    // Letting back end handle token and sessions
  
    req.session.token= token; 

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

// Regular sign up for user. If email exists in patients, add patient id to payload 

router.post("/register", async function (req, res, next) {
  try {
    // Schema
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

      // Check if an invitation code is provided in the request body
      const { invitationCode } = req.body;
      let newUser;
      if (invitationCode) {

        if (invitationCode !== "69") {
          throw new BadRequestError("Invalid invitation code");
        }
       newUser = await User.register({ ...req.body, isHCP: true });
      }
      else{
        newUser = await User.register({ ...req.body, isHCP: false });
        }

    

      // Create token and store to session 
    const token = createToken(newUser);
    req.session.token= token

    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

//Logout user by destroying session
router.post('/logout', (req, res) => {
  // Destroy the session associated with the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Logout failed');
    }
    // Session destroyed successfully
    res.clearCookie('connect.sid'); // Clear session cookie
    return res.sendStatus(200); // Send success response
  });
});


module.exports = router;
