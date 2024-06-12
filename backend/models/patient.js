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

  // Patient look up by email 
  static async getByEmail(email) {
    const patientRes = await db.query(
          `SELECT 
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM patients
           WHERE email = $1`,
        [email],
    );

    const patient = patientRes.rows[0];


    return patient;
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  //Registering patient 
  static async register(
      {firstName, lastName, email, dob, age, cell}) {

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
            email, dob, age, cell)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id,first_name AS "firstName", last_name AS "lastName", email`,
        [
          firstName,
          lastName,
          email, dob, age, cell
        ]
    );

    const patient = result.rows[0];

    return patient;
  }


//   Find all patients (probably not useful)
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

  //  Querying for patient
  static async queryPatient(query) {
    const result = await db.query(
          `SELECT id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email, dob, age, cell
           FROM patients
           WHERE CONCAT(first_name, ', ', last_name) ILIKE $1
           OR CONCAT(last_name, ', ', first_name) ILIKE $1
           OR dob ILIKE $1
       ORDER BY last_name`,
      [`%${query}%`],
    );

    return result.rows;
  }


// Access patient via patient id 
  static async get(pid) {
    const patientRes = await db.query(
          `SELECT 
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email, dob, age, cell
           FROM patients
           WHERE id = $1`,
        [pid],
    );

    const patient = patientRes.rows[0];

    if (!patient) throw new NotFoundError(`Patient not found`);

    // Appending encounter/appointment arrays 
    const encountersRes = await db.query(
          `SELECT 
        e.*,
        u.first_name AS "drFirstName",
        u.last_name AS "drLastName"
           FROM encounters AS e
           LEFT JOIN users AS u ON e.user_id = u.id
           WHERE e.patient_id = $1
           ORDER BY e.datetime`
           , [pid]);
        
    // Adding encounters property to patient
    patient.encounters = encountersRes.rows

    const appointmentRes = await db.query(
      `SELECT 
        a.*,
        u.first_name AS "drFirstName",
        u.last_name AS "drLastName"
     FROM appointments AS a
     LEFT JOIN users AS u ON a.user_id = u.id
     WHERE a.patient_id = $1`, [pid]);
    
// Adding encounters property to patient
patient.appointments = appointmentRes.rows

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

}


module.exports = Patient;
