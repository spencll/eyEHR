"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


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
    try{
    const result = await db.query(
        `INSERT INTO appointments (datetime, user_id, patient_id)
        VALUES ($1, $2, $3) RETURNING datetime, id`,
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
    return appointment}
    catch (error) {
      throw new BadRequestError(`Error making appointment: ${error.message}`);
  }
  }

//   Find today's appointments (useful for HCP)
static async findTodaysAppointments(username) {
    try {
        const result = await db.query(`
            SELECT a.id, a.datetime, p.first_name AS "patientFirstName", p.id AS "pid",
            p.last_name AS "patientLastName", 
            u.first_name AS "drFirstName",
            u.last_name AS "drLastName"
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

// Find all appointments 
static async findAllAppointments(email) {
  try {
      const result = await db.query(`
      SELECT a.id, a.datetime, p.first_name AS "patientFirstName", p.id AS "pid",
      p.last_name AS "patientLastName", 
      u.first_name AS "drFirstName",
      u.last_name AS "drLastName"
          FROM appointments AS a
          JOIN users AS u ON a.user_id=u.id
          JOIN patients AS p ON a.patient_id = p.id
          WHERE p.email = $1
      `,[email]);
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
    const appointmentId = "$" + (values.length + 1);

    const querySql = `UPDATE appointments
                      SET ${setCols} 
                      WHERE id = ${appointmentId} 
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
           WHERE id = $1
           RETURNING id`,
        [apptId],
    );
    const appointment = result.rows[0];

    if (!appointment) throw new NotFoundError(`Appointment not found`);
  }

}


module.exports = Appointment;
