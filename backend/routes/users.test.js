"use strict";

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const Encounter = require("../models/encounter");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
  testAppointmentIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /users", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      users: [
        { username: "u1", firstName: "U1F", lastName: "U1L", email: "user1@user.com", isHCP: true},
        { username: "u2", firstName: "U2F", lastName: "U2L", email: "user2@user.com", isHCP: false},
        { username: "u3", firstName: "U3F", lastName: "U3L", email: "patient3@patient.com", isHCP: false},
        
      ],
    });
  });

  test("unauthorized for non-HCP", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /users/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
        .get("/users/u1")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: { username: "u1", firstName: "U1F", lastName: "U1L", email: "user1@user.com", isHCP: true, id: expect.any(Number), appointments: [
            {
               datetime: "2023-12-01T10:00:00.000Z",
               id: expect.any(Number),
               patient_id: expect.any(Number),
               user_id: expect.any(Number),
             },
           {
               datetime: "2023-12-01T10:00:00.000Z",
               id: expect.any(Number),
               patient_id: expect.any(Number),
               user_id: expect.any(Number),
             },
             {
              datetime: "2023-12-01T10:00:00.000Z",
              id: expect.any(Number),
              patient_id: expect.any(Number),
              user_id: expect.any(Number),
            }
           ], 
           encounters:  [
                {
                  datetime: expect.any(String),
                  id: expect.any(Number),
                  patientId: expect.any(Number),
                  patient_id: expect.any(Number),
                  results: null,
                  signed: false,
                  signed_at: null,
                  signed_by: null,
                  user_id: expect.any(Number),
                }
              ],
          
          
          },
    });
  });

  test("unauthorized for other user", async function () {
    const resp = await request(app)
        .get("/users/u1")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get("/users/nope")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401); //middleware uses same 401 unauthorized
  });
});

describe("GET /users/:username/appointments", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
        .get("/users/u3/appointments")
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.body).toEqual({
      appointments: [
        { datetime: "2023-12-01T10:00:00.000Z",
          drFirstName: "U1F",
          drLastName: "U1L",
          id: expect.any(Number),
          patientFirstName: "P3F",
          patientLastName: "P3L",
          pid: expect.any(Number)},
      ],
    });
  });

  test("unauthorized for other user", async function () {
    const resp = await request(app)
        .get("/users/u1/appointments")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /users/:username/encounters", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
        .get("/users/u1/encounters")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      encounters: [
        { datetime: expect.any(String),
          drFirstName: "U1F",
          drLastName: "U1L",
          id: expect.any(Number),
          patientFirstName: "P1F",
          patientLastName: "P1L",
          pid: expect.any(Number),

         },
      ],
    });
  });

  test("unauthorized for other user", async function () {
    const resp = await request(app)
        .get("/users/u1/encounters")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("GET /users/:username/encounters/unsigned", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .get("/users/u1/encounters/unsigned")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      encounters: [
        { datetime: expect.any(String),
          drFirstName: "U1F",
          drLastName: "U1L",
          id: expect.any(Number),
          patientFirstName: "P1F",
          patientLastName: "P1L",
         },
      ],
    });
  });

  test("unauthorized for non-HCP", async function () {
    const resp = await request(app)
        .get("/users/u2/encounters/unsigned")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("PATCH /users/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
        .patch("/users/u1")
        .send({ firstName: "New" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: { username: "u1", firstName: "New", lastName: "U1L", email: "user1@user.com", isHCP: true },
    });
  });

  test("unauthorized for other user", async function () {
    const resp = await request(app)
        .patch("/users/u1")
        .send({ firstName: "New" })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch("/users/u1")
        .send({ firstName: 42 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});