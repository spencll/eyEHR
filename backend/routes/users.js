"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin,ensureLoggedIn} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Patient = require("../models/patient")
const Appointment = require("../models/appointment")
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/patientNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();



/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/",  async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//GET today's appointments for user 
router.get("/:username/appointments", async function (req,res,next){
  try {
    const appointments= await Appointment.findTodaysAppointments(req.params.username);
    return res.json({appointments});
  } catch (err) {
    return next(err);
  }
})

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// 
router.patch("/:username", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Update user 
    const user = await User.update(req.params.username, req.body);

    // Get patient by email
    const patient = await Patient.getByEmail(user.email)
    
     // patching patient user's email if changed as well 
     const newEmail= req.body.email || user.email
     patient = await User.update(patient.id,{email: newEmail})

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
