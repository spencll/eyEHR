const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testEncountersIds = []
const testAppointmentIds = []
const testPatientIds = []
const testUserIds = []

async function commonBeforeAll() {


  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM patients");
  await db.query("DELETE FROM appointments");
  await db.query("DELETE FROM encounters");

 
  // Test users, stores userIds to stimulate db 
  const resultsUsers = await db.query(`
        INSERT INTO users(id, username,
                          password,
                          first_name,
                          last_name,
                          email, is_HCP)
        VALUES (1,'u1', $1, 'U1F', 'U1L', 'u1@email.com', $3),
               (2,'u2', $2, 'U2F', 'U2L', 'u2@email.com', $4)
        RETURNING *`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        true, false
      ]);
      testUserIds.splice(0, 0, ...resultsUsers.rows.map(r => r.id));


      // Need to use u2 as email, user2 = patient2
  const resultsPatients = await db.query(
    `INSERT INTO patients(id, first_name,
   last_name,
   email, dob, age, cell)
  VALUES (1,'P1F', 'P1L', 'p1@email.com','01/01/1111',1,'(111) 111-1111'),
         (2,'P2F', 'P2L', 'u2@email.com','02/02/2222',2,'(222) 222-2222')
         RETURNING *`
);
testPatientIds.splice(0, 0, ...resultsPatients.rows.map(r => r.id));

 // Test appointments, stores appointmentIds to stimulate db 
const resultsAppointments = await db.query(
  `INSERT INTO appointments(id, datetime, user_id, patient_id)
VALUES  (1, $1, 1, 1),
        (2, $2, 2, 2)
       RETURNING *`,[new Date('2011-01-11T10:00:00Z'), new Date('2022-02-21T10:00:00Z')]);

testAppointmentIds.splice(0, 0, ...resultsAppointments.rows.map(r => r.id));

const resultsEncounters = await db.query(
  `INSERT INTO encounters (id, datetime, user_id, patient_id, signed)
   VALUES (1, $1, 1, 1, false),
          (2, $2, 2, 2, false)
          RETURNING *`,[new Date('2023-01-01T10:00:00Z'), new Date('2023-01-02T11:00:00Z')]);

testEncountersIds.splice(0, 0, ...resultsEncounters.rows.map(r => r.id));
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUserIds,
  testPatientIds,
  testAppointmentIds,
  testEncountersIds
};