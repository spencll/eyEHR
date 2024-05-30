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
           VALUES (NOW(), $1, $2) RETURNING *`,
        [userId, patientId]
    );

    const encounter = result.rows[0];
    encounter.message= "Successfully created encounter"

    return encounter;
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

  
  static async findTodaysEncounters(username) {
    try {
        const result = await db.query(`
            SELECT e.id, e.datetime, p.first_name AS "patientFirstName",
            p.last_name AS "patientLastName",
            u.first_name AS "drFirstName",
            u.last_name AS "drLastName"
            FROM encounters AS e 
            JOIN users AS u ON e.user_id=u.id
            JOIN patients AS p ON e.patient_id = p.id
            WHERE DATE(datetime) = CURRENT_DATE AND u.username = $1
        `,[username]);
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving today's encounters: ${error.message}`);
    }
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
  static async update(eid, results) {

    const result = await db.query(
        `UPDATE encounters
        SET results = $1
        WHERE id = $2
        RETURNING *`,
      [results,eid]
  );

  const encounter= result.rows[0];

  return encounter;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(eid) {
    await db.query(
          `DELETE
           FROM encounters
           WHERE id = $1`,
        [eid],
    );
  }

 
}


module.exports = Encounter;
