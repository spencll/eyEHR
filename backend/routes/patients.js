"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {ensureCorrectUserOrAdmin, ensureCorrectUserOrHCP, isHCP} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Patient = require("../models/patient");
const { createToken } = require("../helpers/tokens");
const patientNewSchema = require("../schemas/patientNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

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


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/


// Middleware requirements: logged in pid patient or HCP
router.patch("/:pid",  async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const patient = await Patient.update(req.params.pid, req.body);
    return res.json({ patient });
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
