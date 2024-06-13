"use strict";
const db = require("../db.js");
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  isHCP
} = require("./auth");

// Fake middleware to mimic original one. I tried mocking the Patient.get request
//but it creates open handle error when test runs. 
async function ensureCorrectUserOrHCPFake(req, res, next) {
  try {
    // Logged in user
    const user = res.locals.user;
    
    // Fetch patient data from fake database
    //Original line: const patient = await Patient.get(req.params.pid)
    const patient = fakeDatabase.patients[req.params.pid];

    // Checking correct user via common email
    if (!(user && (user.isHCP || patient.email === user.email))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// Simulated fake database
const fakeDatabase = {
  patients: {
    1: { id: 1, name: "Patient One", email: "patient1@example.com" },
    2: { id: 2, name: "Patient Two", email: "patient2@example.com" },
  },
};

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isHCP: true, email: "test@user.com", id: 1 }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isHCP: true, email: "test@user.com", id: 1 }, "wrong");


afterAll(async ()=>{
  await db.end();
});

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isHCP: true,
        email: "test@user.com",
        id: 1
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isHCP: true, email: "test@user.com", id: 1 } } };
    const next = jest.fn();

    ensureLoggedIn(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    ensureLoggedIn(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe("isHCP", function () {
  test("works: HCP user", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isHCP: true } } };
    const next = jest.fn();

    isHCP(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("unauth if not HCP", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isHCP: false } } };
    const next = jest.fn();

    isHCP(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  test("unauth if no user", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    isHCP(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe("ensureCorrectUserOrHCP", function () {
  test("works: correct user", async function () {
    const req = { params: { pid: "1" } };
    const res = { locals: { user: { username: "test", email: "test@user.com" } } };
    const next = jest.fn();

    await ensureCorrectUserOrHCPFake(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("works: HCP user", async function () {
    const req = { params: { pid: "1" } };
    const res = { locals: { user: { username: "test", isHCP: true } } };
    const next = jest.fn();

    await ensureCorrectUserOrHCPFake(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("unauth: mismatch", async function () {
    const req = { params: { pid: "1" } };
    const res = { locals: { user: { username: "test", email: "wrong@user.com", isHCP: false } } };
    const next = jest.fn();


    await ensureCorrectUserOrHCPFake(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  test("unauth: if anon", async function () {
    const req = { params: { pid: "1" } };
    const res = { locals: {} };
    const next = jest.fn();

    await ensureCorrectUserOrHCPFake(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
