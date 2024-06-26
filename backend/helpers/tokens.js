const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
// The actual stored info, to be accessed 
  let payload = {
    username: user.username,
    isHCP: user.isHCP,
    email: user.email,
    id: user.id
  };

  // sign and return token 
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
