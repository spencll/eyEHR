"use strict";

const request = require("supertest");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Appointment = require("../models/appointment.js");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAppointmentIds,
  testPatientIds,
  testUserIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** makeAppointment */

describe("makeAppointment", function () {
  test("works", async function () {
    const datetime = new Date("2023-12-01T10:00:00Z")
    const userId = testUserIds[0];
    const patientId = testPatientIds[0];

    let appointment = await Appointment.makeAppointment(datetime, userId, patientId);
    expect(appointment).toEqual({
      datetime,
      message: 'Appointment scheduled!',
      patient: {
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String)
      },
      doctor: {
        firstName: expect.any(String),
        lastName: expect.any(String)
      }
    });

    const result = await db.query(
      `SELECT datetime, user_id, patient_id
       FROM appointments
       WHERE datetime = $1 AND user_id = $2 AND patient_id = $3`,
      [datetime, userId, patientId]
    );

    expect(result.rows).toEqual([{
      datetime,
      user_id: userId,
      patient_id: patientId
    }]);
  });

  test("bad request with invalid data", async function () {
    try {
      await Appointment.makeAppointment(null, null, null);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findTodaysAppointments */

describe("findTodaysAppointments", function () {
  test("works", async function () {
    const username = "testuser";
    let appointments = await Appointment.findTodaysAppointments(username);
    expect(appointments).toEqual(expect.any(Array));
  });

  test("not found if no appointments today", async function () {
    const username = "noappointments";
    let appointments = await Appointment.findTodaysAppointments(username);
    expect(appointments).toEqual([]);
  });
});

/************************************** findAllAppointments */

describe("findAllAppointments", function () {
  test("works", async function () {
    const email = "testpatient@example.com";
    let appointments = await Appointment.findAllAppointments(email);
    expect(appointments).toEqual(expect.any(Array));
  });

  test("not found if no appointments for email", async function () {
    const email = "noappointments@example.com";
    let appointments = await Appointment.findAllAppointments(email);
    expect(appointments).toEqual([]);
  });
});

/************************************** getPatientAppointments */

describe("getPatientAppointments", function () {
  test("works", async function () {
    const pid = testPatientIds[0];
    let appointments = await Appointment.getPatientAppointments(pid);
    expect(appointments).toEqual(expect.any(Array));
  });

  test("not found if no appointments for patient", async function () {
    const pid = 9999;
    let appointments = await Appointment.getPatientAppointments(pid);
    expect(appointments).toEqual([]);
  });
});

/************************************** update */

describe("update", function () {
  test("works", async function () {
    const aid = testAppointmentIds[0];
    const updateData = {
      datetime: new Date("2023-12-01T11:00:00Z")
    };
    const res = new Date("2023-12-01T11:00:00Z")

    let appointment = await Appointment.update(aid, updateData);
    expect(appointment).toEqual({
      datetime: res
    });

    const result = await db.query(
      `SELECT datetime
       FROM appointments
       WHERE id = $1`,
      [aid]
    );
    expect(result.rows).toEqual([{ datetime: updateData.datetime }]);
  });

  test("not found if no such appointment", async function () {
    try {
      const updateData = {
        datetime: "2023-12-01T11:00:00Z"
      };
      await Appointment.update(9999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Appointment.update(testAppointmentIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const aid = testAppointmentIds[0];
    await Appointment.remove(aid);
    const res = await db.query(
      `SELECT id
       FROM appointments
       WHERE id = $1`,
      [aid]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such appointment", async function () {
    try {
      await Appointment.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
