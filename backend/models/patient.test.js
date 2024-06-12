"use strict";

const request = require("supertest");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Patient = require("../models/patient.js")
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAppointmentIds,
  testPatientIds,
  testUserIds,
  testEncountersIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** Test register function */
describe("register", () => {
    test("should register a new patient", async () => {
      const newPatient = {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        dob: "1985-05-15",
        age: 36,
        cell: "(333) 333-3333"
      };
  
      const patient = await Patient.register(newPatient);
  
      expect(patient).toEqual({
        id: expect.any(Number),
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com"
      });
    });
  
    test("should throw error for duplicate email", async () => {
      try {
        await Patient.register({
          firstName: "Duplicate",
          lastName: "Email",
          email: "p1@email.com", // Existing email
          dob: "1985-05-15",
          age: 36,
          cell: "(333) 333-3333"
        });
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
  
  /** Test getByEmail function */
  describe("getByEmail", () => {
    test("should get a patient by email", async () => {
      const patient = await Patient.getByEmail("p1@email.com");
      expect(patient).toEqual({
        firstName: "P1F",
        lastName: "P1L",
        email: "p1@email.com"
      });
    });
  
    test("should return undefined for non-existing email", async () => {
      const patient = await Patient.getByEmail("nonexistent@example.com");
      expect(patient).toBeUndefined();
    });
  });
  
  /** Test findAll function */
  describe("findAll", () => {
    test("should find all patients", async () => {
      const patients = await Patient.findAll();
      expect(patients.length).toEqual(2);
      expect(patients).toEqual(expect.arrayContaining([
        {
          firstName: "P1F",
          lastName: "P1L",
          email: "p1@email.com"
        },
        {
          firstName: "P2F",
          lastName: "P2L",
          email: "u2@email.com"
        }
      ]));
    });
  });
  
  /** Test queryPatient function */
  describe("queryPatient", () => {
    test("should query patients by name", async () => {
      const patients = await Patient.queryPatient("P1L");
      expect(patients).toEqual([
        {
          id: expect.any(Number),
          firstName: "P1F",
          lastName: "P1L",
          email: "p1@email.com",
          dob: "01/01/1111",
          age: 1,
          cell: "(111) 111-1111"
        }
      ]);
    });
  });
  
  /** Test get function */
  describe("get", () => {
    test("should get a patient by id", async () => {
      const patient = await Patient.get(testPatientIds[0]);
      expect(patient).toEqual({
        firstName: "P1F",
        lastName: "P1L",
        email: "p1@email.com",
        dob: "01/01/1111",
        age: 1,
        cell: "(111) 111-1111",
        encounters: [{
            datetime: new Date('2023-01-01T10:00:00Z'),
            drFirstName: "U1F",
            drLastName: "U1L",
            id: 1,
            patient_id: 1,
            results: null,
            signed: false,
            signed_at: null,
            signed_by: null,
            user_id: 1
          }],
        appointments: [
          {
            id: testAppointmentIds[0],
            datetime: new Date('2011-01-11T10:00:00Z'),
            user_id: testUserIds[0],
            patient_id: testPatientIds[0],
            drFirstName: "U1F",
            drLastName: "U1L"
          }
        ]
      });
    });
  
    test("should throw NotFoundError for non-existing id", async () => {
      try {
        await Patient.get(999);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
  /** Test update function */
  describe("update", () => {
    test("should update patient data", async () => {
      const updatedData = {
        firstName: "P1FUpdated",
        lastName: "P1LUpdated"
      };
  
      const patient = await Patient.update(testPatientIds[0], updatedData);
  
      expect(patient).toEqual({
        firstName: "P1FUpdated",
        lastName: "P1LUpdated",
        email: "p1@email.com"
      });
    });
  
    test("should throw NotFoundError for non-existing id", async () => {
      try {
        await Patient.update(999, { firstName: "Ghost" });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
