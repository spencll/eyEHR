"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {ensureCorrectUserOrHCP, isHCP} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const Encounter = require("../models/encounter")

const patientNewSchema = require("../schemas/patientNew.json");
const patientUpdateSchema = require("../schemas/patientUpdate.json");
const User = require("../models/user")

const router = express.Router();

// List of all patients, only accessible as HCP
router.get("/", isHCP, async function (req, res, next) {
  try {
    const { query } = req.query;
    let patients;
    query? patients = await Patient.queryPatient(query) : patients= await Patient.findAll()
    return res.json({ patients});
  } catch (err) {
    return next(err);
  }
});

// Patients search, only accessible as HCP
router.get("/search", isHCP, async function (req, res, next) {
  try {
    const patients = await Patient.queryPatient(req.params);
    return res.json({ patients});
  } catch (err) {
    return next(err);
  }
});


// Only own user or HCP can access this specific patient 
router.get("/:pid", ensureCorrectUserOrHCP, async function (req, res, next) {
  try {
    const patient = await Patient.get(req.params.pid);
    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
});

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

// Register patient 
router.post("/", isHCP, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, patientNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const patient = await Patient.register(req.body);
    return res.status(201).json({patient});
  } catch (err) {
    return next(err);
  }
});



// Change patient info 
// Patching user email as well if user is the patient 
router.patch("/:pid", ensureCorrectUserOrHCP,  async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, patientUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    // Updating patient
    let patient = await Patient.get(req.params.pid)
    let email = patient.email
    patient = await Patient.update(req.params.pid, req.body);

    // See if patient email is associated with user
    let user;
    try {
      user = await User.getByEmail(email);
    } catch (err) {
    }

    // patching patient user's email if changed 
    const newEmail= req.body.email || patient.email
    if (user) await User.update(user.username,{email: newEmail})

    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
});


//GET appointments for patient
router.get("/:pid/appointments", async function (req,res,next){
  try {
    const appointments= await Appointment.getPatientAppointments(req.params.pid);
    return res.json({appointments});
  } catch (err) {
    return next(err);
  }
})

// POST patient appointment 
router.post("/:pid/appointments/add", isHCP, async function (req,res,next){

  try {

    const { datetime, userId } = req.body;
    // Fix date time insertion
    const appointment = await Appointment.makeAppointment(datetime, userId, req.params.pid)
    return res.json({appointment });
  } catch (err) {
    return next(err);
  }
})

// EDIT patient appointment
router.patch("/:pid/appointments/:aid/edit", isHCP, async function (req, res, next) {
  try {
    // No date specified 
    if (!req.body) {
      throw new BadRequestError();
    }

    // Update appointment
    const appointment = await Appointment.update(req.params.aid, req.body);

    return res.json({ appointment});
  } catch (err) {
    return next(err);
  }
});

// DELETE patient appointment 
router.delete("/:pid/appointments/:aid", isHCP, async function (req, res, next) {
  try {
    await Appointment.remove(req.params.aid);
    return res.json({message: "appointment removed"});
  } catch (err) {
    return next(err);
  }
});

// POST patient encounter
router.post("/:pid/encounters/add", isHCP, async function (req,res,next){

  try {
   
    const encounter = await Encounter.makeEncounter(req.body, req.params.pid)
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
})
// GET all patient encounters
router.get("/:pid/encounters", ensureCorrectUserOrHCP, async function (req,res,next){
  try {

    const encounters = await Encounter.getEncounters(req.params.pid)
    return res.json({encounters});
  } catch (err) {
    return next(err);
  }
})

//GET patient encounter
router.get("/:pid/encounters/:eid", ensureCorrectUserOrHCP, async function (req,res,next){

  try {

    const encounter = await Encounter.get(req.params.eid)
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
})

//PATCH patient encounter
router.patch("/:pid/encounters/:eid", isHCP, async function (req,res,next){

  try {

    const encounter = await Encounter.update(req.params.eid, req.body)
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
})


//Sign patient encounter 
router.patch("/:pid/encounters/:eid/sign", isHCP, async function (req,res,next){

  try {

    const encounter = await Encounter.signEncounter(req.params.eid, req.body)
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
})

//Unsign patient encounter 
router.patch("/:pid/encounters/:eid/unsign", isHCP, async function (req,res,next){

  try {

    const encounter = await Encounter.unsignEncounter(req.params.eid)
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
})

// DELETE patient appointment 
router.delete("/:pid/encounters/:eid", isHCP, async function (req, res, next) {
  try {
    await Encounter.remove(req.params.eid);
    return res.json({ message: "encounter deleted" })
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
