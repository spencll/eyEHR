"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class Patient {


  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  //Registering patient 
  static async register(
      {firstName, lastName, email}) {

    // Checking for duplicate email
    const duplicateCheck = await db.query(
          `SELECT email
           FROM patients
           WHERE email= $1`,
        [email],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const result = await db.query(
          `INSERT INTO patients
           (first_name,
            last_name,
            email)
           VALUES ($1, $2, $3)
           RETURNING first_name AS "firstName", last_name AS "lastName", email`,
        [
          firstName,
          lastName,
          email
        ]
    );

    const patient = result.rows[0];

    return patient;
  }


//   Find all patients 
  static async findAll() {
    const result = await db.query(
          `SELECT 
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM patients
           ORDER BY last_name`,
    );

    return result.rows;
  }


// Access patient via patient id 
  static async get(pid) {
    const patientRes = await db.query(
          `SELECT 
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM patients
           WHERE id = $1`,
        [pid],
    );

    const patient = patientRes.rows[0];

    if (!patient) throw new NotFoundError(`Patient not found`);

    const encountersRes = await db.query(
          `SELECT * 
           FROM encounters AS e
           WHERE e.patient_id = $1`, [pid]);
        
    // Adding encounters property to patient
    patient.encounters = encountersRes.rows
    return patient;
  }


  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(pid, data) {

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isHCP: "is_HCP",
        });
    const patientIDVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE patients
                      SET ${setCols} 
                      WHERE id = ${patientIDVarIdx} 
                      RETURNING 
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email`;

    // The actual query
    const result = await db.query(querySql, [...values, pid]);
    const patient = result.rows[0];

    if (!patient) throw new NotFoundError(`Patient not found`);

    return patient;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Apply for job: update db, returns undefined.
   *
   * - username: username applying for job
   * - jobId: job id
   **/



  static async applyToJob(username, jobId) {
    const preCheck = await db.query(
          `SELECT id
           FROM jobs
           WHERE id = $1`, [jobId]);
    const job = preCheck.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);

    const preCheck2 = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`, [username]);
    const user = preCheck2.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
          `INSERT INTO applications (job_id, username)
           VALUES ($1, $2)`,
        [jobId, username]);
  }
}


module.exports = Patient;
