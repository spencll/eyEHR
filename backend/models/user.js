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

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user, result is row of objects 
    const result = await db.query(
          `SELECT id, username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email, 
                  is_HCP AS "isHCP"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      // Delete temp user object password for secruity 
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/


  // Accepts object of keys 
  static async register(
      { username, password, firstName, lastName, email, isHCP }) {

    // Username check
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    // Hashing the password to store in database
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_HCP)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_HCP AS "isHCP", id`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isHCP,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_HCP AS "isHCP"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT id, username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email, is_HCP AS "isHCP"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

     // Appending encounter/appointment arrays 
     const encountersRes = await db.query(
      `SELECT e.*, p.id AS "patientId" 
       FROM encounters AS e
       JOIN patients AS p ON e.patient_id = p.id
       WHERE e.user_id = $1`
       
       , [user.id]);
    

// Adding encounters property to patient
user.encounters = encountersRes.rows

const appointmentRes = await db.query(
  `SELECT * 
   FROM appointments AS a
   WHERE a.user_id = $1`, [user.id]);

// Adding encounters property to patient
user.appointments = appointmentRes.rows
    return user;
  }

  // Get user by email 
  static async getByEmail(email) {
    const userRes = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE email = $1`,
        [email],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with email: ${email}`);

    return user;
  }

  // Use to get user id via name for appointment creation
  static async getHCPByName(firstName, lastName) {
    const userRes = await db.query(
          `SELECT id, username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE first_name = $1 AND last_name= $2`,
        [firstName,lastName],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No HCP with name: ${firstName} ${lastName}`);

    return user;
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

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    // function to extract columns AS and $ values from data 
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isHCP: "is_hcp",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_HCP AS "isHCP"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }



}


module.exports = User;
