"use strict";

const request = require("supertest");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Encounter = require("../models/encounter.js")
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

describe("Encounter.makeEncounter", function () {
    test("creates a new encounter", async function () {
        const userId = testUserIds[0]
        const patientId =testPatientIds[0]
      const encounter = await Encounter.makeEncounter({ userId }, patientId);

      expect(encounter).toEqual({
        id: expect.any(Number),
        datetime: expect.any(Date),
        user_id: userId,
        patient_id: patientId,
        results: null,
        signed: false,
        signed_at: null,
        signed_by: null,
        message: "Successfully created encounter"
      });
      
    });
  });


  
  describe("Encounter.getEncounters", function () {
    test("gets all encounters for a patient", async function () {
      const encounters = await Encounter.getEncounters(1);
      expect(encounters).toEqual(expect.any(Array));
      expect(encounters.length).toBeGreaterThan(0);
    });
  });
  
  describe("Encounter.getUnsignedEncounters", function () {
    test("gets all unsigned encounters for a HCP", async function () {
      const encounters = await Encounter.getUnsignedEncounters("u1");
      expect(encounters).toEqual(expect.any(Array));
      expect(encounters.length).toBeGreaterThan(0);
    });
  });
  
  describe("Encounter.getUserEncounters", function () {
    test("gets all encounters for a user (non HCP)", async function () {
      const encounters = await Encounter.getUserEncounters("u2@email.com");
      expect(encounters).toEqual(expect.any(Array));
      expect(encounters.length).toBeGreaterThan(0);
    });
  });
  
  describe("Encounter.findTodaysEncounters", function () {
    test("gets all encounters for today for a HCP", async function () {
      const encounters = await Encounter.findTodaysEncounters("u1");
      expect(encounters).toEqual(expect.any(Array));
    });
  });
  
  describe("Encounter.get", function () {
    test("gets an encounter by id", async function () {
      const encounter = await Encounter.get(1);
      expect(encounter).toEqual(expect.any(Object));
    });
  });
  
  describe("Encounter.update", function () {
    test("updates an encounter by id", async function () {
      const encounter = await Encounter.update(1, {results:"Updated results"});
      expect(encounter).toEqual(expect.any(Object));
    });
  });
  
  describe("Encounter.remove", function () {
    test("deletes an encounter by id", async function () {
      await Encounter.remove(1);
      const encounters = await Encounter.getEncounters(1);
      expect(encounters).toEqual([]);
    });
  });
  
  describe("Encounter.signEncounter", function () {
    test("signs an encounter", async function () {
      const signedEncounter = await Encounter.signEncounter(2, { signedBy: "u1" });
      expect(signedEncounter).toEqual(expect.any(Object));
      expect(signedEncounter.signed).toBe(true);
      expect(signedEncounter.signedBy).toBe("u1");
    });
  });
  
  describe("Encounter.unsignEncounter", function () {
    test("unsigns an encounter", async function () {
      const unsignedEncounter = await Encounter.unsignEncounter(2);
      expect(unsignedEncounter).toEqual(expect.any(Object));
      expect(unsignedEncounter.signed).toBe(false);
      expect(unsignedEncounter.signedBy).toBeNull();
    });
  });