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

class Encounter {

  /** Make encounter
   *
   * Returns {message: "Successfully created encounter", datetime}
   *
   * Throws BadRequestError on duplicates.
   **/

  //Making encounter
  static async makeEncounter(userId, patientId) {

    const result = await db.query(
          `INSERT INTO encounters
           (datetime,
            user_id,
            patient_id)
           VALUES (NOW(), $1, $2) RETURNING datetime`,
        [userId, patientId]
    );

    const patient = result.rows[0];
    patient.message= "Successfully created encounter"

    return patient;
  }


//Get all encounters for patient 
  static async getEncounters(pid) {
    const result = await db.query(
          `SELECT *
           FROM encounters
           WHERE patient_id = $1
           ORDER BY datetime`,[pid],
    );

    return result.rows;
  }


// Access single encounter
  static async get(eid) {
    const encounterRes = await db.query(
          `SELECT *
           FROM encounters
           WHERE id = $1`,
        [eid],
    );

    const encounter = encounterRes.rows[0];

    if (!encounter) throw new NotFoundError(`Encounter not found`);

    return encounter;
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

//The only thing you can change in encounter is the exam data (results).
  static async update(results) {

    const result = await db.query(
        `UPDATE encounters
        SET results = $1 RETURNING *`,
      [results]
  );

  const encounter= result.rows[0];

  return encounter;
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


module.exports = Encounter;
