"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {ensureCorrectUserOrAdmin, ensureCorrectUserOrHCP, isHCP} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const { createToken } = require("../helpers/tokens");
const patientNewSchema = require("../schemas/patientNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const patientUpdateSchema = require("../schemas/patientUpdate.json");
const User = require("../models/user")

const router = express.Router();

// List of all patients, only accessible as HCP
router.get("/", isHCP, async function (req, res, next) {
  try {
    const patients = await Patient.findAll();
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

    const user = await Patient.register(req.body);
    return res.status(201).json({ user});
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// Change patient info 
// Patching user email as well if user is the patient 
router.patch("/:pid", ensureCorrectUserOrHCP,  async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, patientUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    // getting patient/user info
    let patient = await Patient.get(req.params.pid)
    let user = await User.getByEmail(patient.email)
    // patching patient info
    patient = await Patient.update(req.params.pid, req.body);

    // patching patient user's email if changed 
    const newEmail= req.body.email || patient.email
    user = await User.update(user.username,{email: newEmail})

    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
});

//encounters
router.get("/:pid/encounters", async function (req,res,next){



  
})
//appointments
router.get("/:pid/appointments", async function (req,res,next){




})


/** POST /[username]/jobs/[id]  { state } => { application }
 *
 * Returns {"applied": jobId}
 *
 * Authorization required: admin or same-user-as-:username
 * */

router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const jobId = +req.params.id;
    await User.applyToJob(req.params.username, jobId);
    return res.json({ applied: jobId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
