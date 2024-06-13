"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll, u1Token, u2Token 
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const user1 = {
  username: "u1",
  password: "password1"
};

const user2 = {
  username: "u2",
  password: "password2"
};

const newUser = {
  username: "newUser",
  firstName: "First",
  lastName: "Last",
  email: "new@user.com",
  password: "newPassword"
};

const newHCPUser = {
  ...newUser,
  invitationCode: "69"
};
/************************************** POST /auth/token */

describe("POST /auth/token", () => {
  test("works for valid user", async () => {
    const resp = await request(app)
      .post("/auth/token")
      .send(user1);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth for invalid user", async () => {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: "invalid", password: "wrong" });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: "u1" });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const resp = await request(app)
      .post("/auth/token")
      .send({ username: 123, password: 456 });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", () => {
  test("works for new user", async () => {
    const resp = await request(app)
      .post("/auth/register")
      .send(newUser);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("works for new HCP user with invitation code", async () => {
    const resp = await request(app)
      .post("/auth/register")
      .send(newHCPUser);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "new",
        password: "password",
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "new",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "not-an-email",
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid invitation code", async () => {
    const resp = await request(app)
      .post("/auth/register")
      .send({ ...newUser, invitationCode: "invalid" });
    expect(resp.statusCode).toEqual(400);
  });
});
