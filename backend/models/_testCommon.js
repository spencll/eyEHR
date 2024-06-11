const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testAppointmentIds = []
const testPatientIds = []
const testUserIds = []

async function commonBeforeAll() {


  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM patients");
  await db.query("DELETE FROM appointments");

  // await db.query(`
  //   INSERT INTO companies(handle, name, num_employees, description, logo_url)
  //   VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
  //          ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
  //          ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  // const resultsJobs = await db.query(`
  //   INSERT INTO jobs (title, salary, equity, company_handle)
  //   VALUES ('Job1', 100, '0.1', 'c1'),
  //          ('Job2', 200, '0.2', 'c1'),
  //          ('Job3', 300, '0', 'c1'),
  //          ('Job4', NULL, NULL, 'c1')
  //   RETURNING id`);

  // testJobIds.splice(0, 0, ...resultsJobs.rows.map(r => r.id));

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


  const resultsPatients = await db.query(
    `INSERT INTO patients(id, first_name,
   last_name,
   email, dob, age, cell)
  VALUES (1,'P1F', 'P1L', 'p1@email.com','01/01/1111',1,'(111) 111-1111'),
         (2,'P2F', 'P2L', 'p2@email.com','02/02/2222',2,'(222) 222-2222')
         RETURNING *`
);
testPatientIds.splice(0, 0, ...resultsPatients.rows.map(r => r.id));

 // Test appointments, stores appointmentIds to stimulate db 
const resultsAppointments = await db.query(
  `INSERT INTO appointments(id, datetime, user_id, patient_id)
VALUES  (1, '2011-01-11T10:00:00Z', 1, 1),
        (2, '2022-02-21T10:00:00Z', 2, 2)
       RETURNING *`
);
testAppointmentIds.splice(0, 0, ...resultsAppointments.rows.map(r => r.id));

  // await db.query(`
  //       INSERT INTO applications(username, job_id)
  //       VALUES ('u1', $1)`,
  //     [testJobIds[0]]);
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
  testAppointmentIds
};