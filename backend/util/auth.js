const jwt = require('jsonwebtoken');
function generateToken(userInfo) {
  if (!userInfo) {
    return null;
  }
  return jwt.sign(userInfo, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

function verifyToken(email, token) {
  return jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
    if (err) {
      return {
        verified: false,
        message: 'invalid token'
      };
    }

    if (res.email != email) {
      return {
        verified: false,
        message: 'invalid email'
      };
    }

    return {
      verified: true,
      message: 'verified'
    }
  })
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;