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

class Appointment {


  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  //Making appointment 
  static async makeAppointment(datetime, userId, patientId) {
    const result = await db.query(
        `INSERT INTO appointments (datetime, user_id, patient_id)
        VALUES ($1, $2, $3) RETURNING datetime`,
        [
          datetime,
          userId,
          patientId
        ]
    );

    // Just making json return look nicer 
    const patientRes = await db.query(
        `SELECT first_name as "firstName",
        last_name as "lastName", email
         FROM patients AS p
         WHERE p.id = $1`, [patientId]);

         const hcpRes = await db.query(
            `SELECT first_name as "firstName",
            last_name as "lastName"
             FROM users AS u
             WHERE u.id = $1`, [userId]);

    const appointment= result.rows[0];
    appointment.message= 'Appointment scheduled!'        
    appointment.patient = patientRes.rows[0]
    appointment.doctor = hcpRes.rows[0]
    return appointment
  }

//   Find all appointments for today  
static async findTodaysAppointments(username) {
    try {
        const result = await db.query(`
            SELECT a.id, a.datetime, p.first_name AS "patientFirstName",
            p.last_name AS "patientLastName"
            FROM appointments AS a
            JOIN users AS u ON a.user_id=u.id
            JOIN patients AS p ON a.patient_id = p.id
            WHERE DATE(datetime) = CURRENT_DATE AND u.username = $1
        `,[username]);
        return result.rows;
    } catch (error) {
        throw new Error(`Error retrieving today's appointments: ${error.message}`);
    }
}

// Access patient via patient id 
  static async getPatientAppointments(pid) {
    const apptRes = await db.query(
          `SELECT a.id,
          a.datetime AS "datetime",
          u.first_name AS "drFirstName",
          u.last_name AS "drLastName",
          p.first_name AS "patientFirstName",
          p.last_name AS "patientLastName"
      FROM 
          appointments AS a
      JOIN 
          users AS u ON a.user_id = u.id
      JOIN 
          patients AS p ON a.patient_id = p.id
      WHERE 
          a.patient_id = $1`,
        [pid],
    );

//Array of appointments for patient     
    const appointments= apptRes.rows;   

    //Empty appointment array is fine
    return appointments;
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

  static async update(aid, data) {

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
        });
    const patientIDVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE appointments
                      SET ${setCols} 
                      WHERE id = ${patientIDVarIdx} 
                      RETURNING 
                                datetime`;

    // The actual query
    const result = await db.query(querySql, [...values, aid]);
    const appointment = result.rows[0];

    if (!appointment) throw new NotFoundError(`Appointment not found`);

    return appointment;
  }

  /** Remove appointment */

  static async remove(apptId) {
    let result = await db.query(
          `DELETE
           FROM appointments
           WHERE id = $1`,
        [apptId],
    );


    if (!result) throw new NotFoundError(`Appointment not found`);
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


module.exports = Appointment;
