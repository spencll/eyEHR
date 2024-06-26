"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


/** Related functions for users. */

class Encounter {

  /** Make encounter
   *
   * Returns {message: "Successfully created encounter", datetime}
   *
   * Throws BadRequestError on duplicates.
   **/

  //Making encounter
  static async makeEncounter({userId}, patientId) {

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

 //Get all unsigned encounters for HCP
 static async getUnsignedEncounters(username) {
  const result = await db.query(
        `SELECT e.id, e.datetime, p.first_name AS "patientFirstName",
        p.last_name AS "patientLastName",
        u.first_name AS "drFirstName",
        u.last_name AS "drLastName",
        p.id AS "pid"
         FROM encounters AS e 
         JOIN users AS u ON e.user_id=u.id
         JOIN patients AS p ON e.patient_id = p.id
         WHERE u.username = $1 AND e.signed = $2
         ORDER BY datetime`,[username,false],
  );

  return result.rows;
}

  //Get all encounters for user (non HCP)
  static async getUserEncounters(email) {
    const result = await db.query(
          `SELECT e.id, e.datetime, p.first_name AS "patientFirstName",
          p.last_name AS "patientLastName",
          u.first_name AS "drFirstName",
          u.last_name AS "drLastName", p.id AS "pid"
           FROM encounters AS e 
           JOIN users AS u ON e.user_id=u.id
           JOIN patients AS p ON e.patient_id = p.id
           WHERE p.email = $1
           ORDER BY datetime`,[email],
    );

    return result.rows;
  }
  

  
  static async findTodaysEncounters(username) {
    try {
        const result = await db.query(`
            SELECT e.id, e.datetime, p.first_name AS "patientFirstName",
            p.last_name AS "patientLastName",
            p.id AS "pid",
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
          `SELECT e.id, e.datetime, 
          e.user_id AS "uid",
          e.signed,
          e.signed_at AS "signedAt",
          e.signed_by AS "signedBy",
          p.first_name AS "patientFirstName",
          p.last_name AS "patientLastName",
          u.first_name AS "drFirstName",
          u.last_name AS "drLastName",
          e.results
          FROM encounters AS e 
          JOIN users AS u ON e.user_id=u.id
          JOIN patients AS p ON e.patient_id = p.id
           WHERE e.id = $1`,
        [eid],
    );

    const encounter = encounterRes.rows[0];

    if (!encounter) throw new NotFoundError(`Encounter not found`);

    return encounter;
  }


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

  //Signing encounter 
  static async signEncounter(eid, {signedBy}) {

    try {
      const result = await db.query(
        `UPDATE encounters
        SET signed = $1, signed_by = $2, signed_at = NOW()
        WHERE id = $3
        RETURNING results, signed, 
        signed_by AS "signedBy",
        signed_at AS "signedAt"`,
        [true, signedBy, eid]
      );

      if (result.rows.length === 0) {
        throw NotFoundError;
      }

      const signedEncounter = result.rows[0];
      signedEncounter.message = "Successfully signed encounter";

      return signedEncounter;

    } catch (error) {
      console.error('Error signing encounter:', error.message);
      throw BadRequestError(error);  
    }
  }

    //Signing encounter 
    static async unsignEncounter(eid) {

      try {
        const result = await db.query(
          `UPDATE encounters
          SET signed = $1, signed_by = $2, signed_at = $3
          WHERE id = $4
          RETURNING results, signed, 
          signed_by AS "signedBy",
          signed_at AS "signedAt"`,
          [false, null, null, eid]
        );
  
        if (result.rows.length === 0) {
          throw NotFoundError;
        }
  
        const unsignedEncounter = result.rows[0];
        unsignedEncounter.message = "Unsigned encounter";
  
        return unsignedEncounter;
  
      } catch (error) {
        console.error('Error unsigning encounter:', error.message);
        throw BadRequestError(error);  
      }
    }


}


module.exports = Encounter;
