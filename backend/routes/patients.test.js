"use strict";

const request = require("supertest");
const app = require("../app");

const {
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
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /patients", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .get("/patients")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      patients: [
        {
          id: testPatientIds[0],
          firstName: "P1F",
          lastName: "P1L",
          email: "patient1@patient.com",
          dob: "01/01/1111",
          age: 1,
          cell: "(111) 111-1111"
        },
        {
          id: testPatientIds[1],
          firstName: "P2F",
          lastName: "P2L",
          email: "patient2@patient.com",
          dob: "02/02/2222",
          age: 2,
          cell: "(222) 222-2222"
        },
        {
          id: testPatientIds[2],
          firstName: "P3F",
          lastName: "P3L",
          email: "patient3@patient.com",
          dob: "03/03/3333",
          age: 3,
          cell: "(333) 333-3333"
        },
      ],
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .get("/patients")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /patients", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .post("/patients")
        .send({
          firstName: "P4F",
          lastName: "P4L",
          email: "patient4@patient.com",
          dob: "04/04/4444",
          age: 4,
          cell: "(444) 444-4444"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      patient: {
        id: expect.any(Number),
        firstName: "P4F",
        lastName: "P4L",
        email: "patient4@patient.com",
        dob: "04/04/4444",
        age: 4,
        cell: "(444) 444-4444"
      },
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .post("/patients")
        .send({
          firstName: "P4F",
          lastName: "P4L",
          email: "patient4@patient.com",
          dob: "04/04/4444",
          age: 4,
          cell: "(444) 444-4444"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/patients")
        .send({
          firstName: "P4F",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/patients")
        .send({
          firstName: "P4F",
          lastName: "P4L",
          email: "not-an-email",
          dob: "04/04/4444",
          age: 4,
          cell: "(444) 444-4444"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

describe("PATCH /patients/:pid", function () {
  test("works for correct user or HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}`)
        .send({
          firstName: "P1F-updated",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      patient: {
        id: testPatientIds[0],
        firstName: "P1F-updated",
        lastName: "P1L",
        email: "patient1@patient.com",
        dob: "01/01/1111",
        age: 1,
        cell: "(111) 111-1111"
      },
    });
  });

  test("updates user email as well if patient is user", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[2]}`)
        .send({
          email: "newuseremail@user.com",
        })
        .set("authorization", `Bearer ${u1Token}`);

        const resp2 = await request(app)
        .get(`/users/${testUserUsernames[2]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp2.body.user.email).toEqual("newuseremail@user.com");
  });

  test("unauth for non-correct user or non-HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}`)
        .send({
          firstName: "P1F-updated",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if patient not found", async function () {
    const resp = await request(app)
        .patch(`/patients/0`)
        .send({
          firstName: "nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}`)
        .send({
          email: "not-an-email",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});



describe("POST /patients/:pid/appointments/add", function () {
  test("works for HCP", async function () {
    const datetime= new Date("2023-12-01T10:00:00Z")
    const resp = await request(app)
        .post(`/patients/${testPatientIds[0]}/appointments/add`)
        .send({
          datetime,
          userId: testUserIds[0],
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      appointment: {
        id: expect.any(Number),
        datetime: "2023-12-01T15:00:00.000Z", //datetime is altered
             doctor: {
                  firstName: "U1F",
                  lastName: "U1L",
                 },
                 message: "Appointment scheduled!",
             patient:  {
                   email: "patient1@patient.com",
                   firstName: "P1F",
                   lastName: "P1L",
                 },
      },
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .post(`/patients/${testPatientIds[0]}/appointments/add`)
        .send({
          datetime: new Date("2023-12-01T10:00:00Z"),
          userId: testUserIds[0],
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("PATCH /patients/:pid/appointments/:aid/edit", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}/appointments/${testAppointmentIds[0]}/edit`)
        .send({
          datetime: new Date("2025-12-01T10:00:00Z"),
        })
        .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      appointment: {
        datetime: "2025-12-01T15:00:00.000Z", //adjusting for time conversions 
      },
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}/appointments/${testAppointmentIds[0]}/edit`)
        .send({
          datetime: new Date("2024-12-01T10:00:00Z"),
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("DELETE /patients/:pid/appointments/:aid", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .delete(`/patients/${testPatientIds[0]}/appointments/${testAppointmentIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ message: "appointment removed" });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .delete(`/patients/${testPatientIds[0]}/appointments/${testAppointmentIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /patients/:pid/encounters/add", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .post(`/patients/${testPatientIds[0]}/encounters/add`)
        .send({
          userId: testUserIds[0],
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      encounter: {
        datetime: expect.any(String),
        id: expect.any(Number),
        user_id: testUserIds[0],
        patient_id: testPatientIds[0],
        message: "Successfully created encounter",
        results: null,
           signed: false,
           signed_at: null,
           signed_by: null,
      },
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .post(`/patients/${testPatientIds[0]}/encounters/add`)
        .send({
          userId: testUserIds[0],
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("PATCH /patients/:pid/encounters/:eid", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}/encounters/${testEncountersIds[0]}`)
        .send({
          reason: "Patient needs glasses"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      encounter: {
        datetime: expect.any(String),
        id: testEncountersIds[0],
        user_id: testUserIds[0],
        patient_id: testPatientIds[0],
       results: {
        reason: "Patient needs glasses"
       },
       signed: false,
       signed_at: null,
       signed_by: null,
      },
    });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .patch(`/patients/${testPatientIds[0]}/encounters/${testEncountersIds[0]}`)
        .send({
          userId: testUserIds[1],
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

describe("DELETE /patients/:pid/encounters/:eid", function () {
  test("works for HCP", async function () {
    const resp = await request(app)
        .delete(`/patients/${testPatientIds[0]}/encounters/${testEncountersIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ message: "encounter deleted" });
  });

  test("unauth for non-HCP", async function () {
    const resp = await request(app)
        .delete(`/patients/${testPatientIds[0]}/encounters/${testEncountersIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});
