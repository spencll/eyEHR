"use strict";

const request = require("supertest");
const db = require("../db.js");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const Patient = require("../models/patient.js")
const app = require("../app");
const User = require("./user.js")
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

/** Test authenticate function */
describe("authenticate", () => {
  test("works with valid credentials", async () => {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isHCP: true,
    });
  });

  test("unauth with invalid credentials", async () => {
    try {
      await User.authenticate("u1", "wrongpassword");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if user not found", async () => {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/** Test register function */
describe("register", () => {
  const newUser = {
    username: "new",
    password: "password",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    isHCP: false
  };

  test("works", async () => {
    let user = await User.register(newUser);
    expect(user).toEqual({
      username: "new",
      firstName: "Test",
      lastName: "Tester",
      email: "test@test.com",
      isHCP: false,
      id: user.id
    });

    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_hcp).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async () => {
    try {
      await User.register(newUser);
      await User.register(newUser);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/** Test findAll function */
describe("findAll", () => {
  test("works", async () => {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isHCP: true,
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
        isHCP: false,
      },
    ]);
  });
});

/** Test get function */
describe("get", () => {
  test("works", async () => {
    let user = await User.get("u1");
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isHCP: true,
      encounters: expect.any(Array),
      appointments: expect.any(Array),
    });
  });

  test("not found if no such user", async () => {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** Test getByEmail function */
describe("getByEmail", () => {
  test("works", async () => {
    const user = await User.getByEmail("u1@email.com");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
    });
  });

  test("not found if no such user", async () => {
    try {
      await User.getByEmail("nope@example.com");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** Test getHCPByName function */
describe("getHCPByName", () => {
  test("works", async () => {
    const user = await User.getHCPByName("U1F", "U1L");
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
    });
  });

  test("not found if no such user", async () => {
    try {
      await User.getHCPByName("Nope", "Nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** Test update function */
describe("update", () => {
  const updateData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@test.com",
    isHCP: true,
  };

  test("works", async () => {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      firstName: "NewF",
      lastName: "NewL",
      email: "new@test.com",
      isHCP: true,
    });
  });

  test("works: set password", async () => {
    let user = await User.update("u1", {
      password: "newpassword",
    });
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isHCP: true,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async () => {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});