const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { createToken } = require("../helpers/tokens");

describe("createToken", function () {
  test("returns a token with the correct payload", function () {
    const user = {
      username: "testuser",
      isHCP: true,
      email: "testuser@test.com",
      id: 1
    };

    const token = createToken(user);
    const payload = jwt.verify(token, SECRET_KEY);

    expect(payload).toEqual({
      username: "testuser",
      isHCP: true,
      email: "testuser@test.com",
      id: 1,
      iat: expect.any(Number) // `iat` is the issued at timestamp
    });
  });

  test("returns a valid JWT", function () {
    const user = {
      username: "testuser",
      isHCP: false,
      email: "testuser2@test.com",
      id: 2
    };

    const token = createToken(user);
    const payload = jwt.verify(token, SECRET_KEY);

    expect(payload).toMatchObject({
      username: "testuser",
      isHCP: false,
      email: "testuser2@test.com",
      id: 2
    });
  });

  test("throws an error with an invalid token", function () {
    const invalidToken = "invalid.token.here";

    expect(() => jwt.verify(invalidToken, SECRET_KEY)).toThrow();
  });
});
