const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {

// The actual stored info 
  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  // sign and return token 
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
