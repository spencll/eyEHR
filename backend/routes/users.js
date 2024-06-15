"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {ensureLoggedIn, ensureCorrectUserOrHCP, isHCP, ensureCorrectUser} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Patient = require("../models/patient")
const Appointment = require("../models/appointment")
const Encounters = require("../models/encounter")
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

// Only used during dev
router.get("/", isHCP,  async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


router.get("/:username", ensureCorrectUser, async function (req, res, next) {

  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//GET today's appointments for HCP, all appointments for regular user
router.get("/:username/appointments", ensureCorrectUser, async function (req,res,next){
  try {
    let appointments;
    const user = await User.get(req.params.username);
    
    // today's appointment if HCP, all appointments if regular user 
    user.isHCP? appointments= await Appointment.findTodaysAppointments(user.username):  appointments= await Appointment.findAllAppointments(user.email)
    return res.json({appointments});
  } catch (err) {
    return next(err);
  }
})

//GET today's encounters for HCP, all encounters for regular user
router.get("/:username/encounters", ensureCorrectUser, async function (req,res,next){
  try {
    let encounters;
    const user = await User.get(req.params.username);
    // today's appointment if HCP, all appointments if regular user 
    user.isHCP? encounters= await Encounters.findTodaysEncounters(user.username): encounters= await Encounters.getUserEncounters(user.email)
    return res.json({encounters});
  } catch (err) {
    return next(err);
  }
})

//GET all unsigned encounters 
router.get("/:username/encounters/unsigned",ensureCorrectUser, isHCP, async function (req,res,next){
  try {
    let encounters;
    const user = await User.get(req.params.username);
    encounters= await Encounters.getUnsignedEncounters(user.username)
    return res.json({encounters});
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
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Update user 
    const user = await User.update(req.params.username, req.body);
    const newEmail= req.body.email || user.email

     //Updates patient email too if user is a patient 
     const patient = await Patient.getByEmail(user.email) 
     if (patient) await Patient.update(patient.id,{email: newEmail})

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
