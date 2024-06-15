"use strict";

const db = require("../db.js");

const User = require("../models/user");
const Appointment = require("../models/appointment.js")
const Encounter = require("../models/encounter.js")
const Patient = require("../models/patient.js")
const { createToken } = require("../helpers/tokens");

let testUserUsernames = []
let testPatientIds = []
let testUserIds = []
let testEncountersIds = []
let testAppointmentIds = []

async function commonBeforeAll() {

   // noinspection SqlWithoutWhere
   await db.query("DELETE FROM users");
   await db.query("DELETE FROM patients");
   await db.query("DELETE FROM appointments");
   await db.query("DELETE FROM encounters");

  // Test patients 
  const patient1 = await Patient.register(
      {
        firstName: "P1F",
        lastName: "P1L",
        email: "patient1@patient.com",
        dob: "01/01/1111",
        age: 1,
        cell: "(111) 111-1111"
      });
  const patient2 = await Patient.register(
        {
          firstName: "P2F",
          lastName: "P2L",
          email: "patient2@patient.com",
          dob: "02/02/2222",
          age: 2,
          cell: "(222) 222-2222"
        });

    const patient3 = await Patient.register(
          {
            firstName: "P3F",
            lastName: "P3L",
            email: "patient3@patient.com",
            dob: "03/03/3333",
            age: 3,
            cell: "(333) 333-3333"
          });

    testPatientIds.push(patient1.id, patient2.id, patient3.id);

           // Test users
   const user1 = await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isHCP: true,
  });
  const user2 = await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isHCP: false,
  });

  // User3 is patient3, hence email is the same 
  const user3= await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "patient3@patient.com",
    password: "password3",
    isHCP: false,
  });

 testUserIds.push(user1.id, user2.id, user3.id)
 testUserUsernames.push(user1.username, user2.username, user3.username)

  const encounter1 = await Encounter.makeEncounter({userId: user1.id},patient1.id)
  const encounter2 = await Encounter.makeEncounter({userId: user2.id},patient2.id)
  const encounter3 = await Encounter.makeEncounter({userId: user3.id},patient3.id)

  testEncountersIds.push(encounter1.id,encounter2.id,encounter3.id)

  const appointment1= await Appointment.makeAppointment(new Date("2023-12-01T10:00:00Z"),user1.id,patient1.id)
  const appointment2= await Appointment.makeAppointment(new Date("2023-12-01T10:00:00Z"),user1.id,patient2.id)
  const appointment3= await Appointment.makeAppointment(new Date("2023-12-01T10:00:00Z"),user1.id,patient3.id)

 testAppointmentIds.push(appointment1.id,appointment2.id,appointment3.id)


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


const u1Token = createToken({username: "u1",
  isHCP: true,
  email: "user1@user.com",
  id: testUserIds[0]});

// Regular user token 
const u2Token = createToken({username: "u2",
  isHCP: false,
  email: "user2@user.com",
  id: testUserIds[1]});

  // Patient user token
  const u3Token = createToken({username: "u3",
    isHCP: false,
    email: "patient3@patient.com",
    id: testUserIds[2]});


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testPatientIds,
  testUserIds,
  testEncountersIds,
  testAppointmentIds,
  testUserUsernames,
  u1Token,
  u2Token,
  u3Token
};
