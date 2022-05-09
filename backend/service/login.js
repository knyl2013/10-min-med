const AWS = require('aws-sdk');
const util = require('../util/util');
const auth = require('../util/auth');
const bcrypt = require('bcryptjs');
AWS.config.update({
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function login(user) {
  const email = user.email;
  const password = user.password;
  if (!user || !email || !password) {
    return util.buildResponse(401, {
      message: 'email and password are required'
    })
  }

  const dynamoUser = await getUser(email);
  if (!dynamoUser || !dynamoUser.email) {
    return util.buildResponse(403, { message: 'user does not exist' });
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return util.buildResponse(403, { message: 'password is incorrect' });
  }

  const userInfo = {
    email: dynamoUser.email,
    completedDays: dynamoUser.completedDays
  };
  const token = auth.generateToken(userInfo);
  const response = {
    user: userInfo,
    token: token
  };
  return util.buildResponse(200, response);
}

async function getUser(email) {
  const params = {
    TableName: userTable,
    Key: {
      email: email
    }
  };

  return await dynamodb.get(params).promise()
    .then(response => {
      return response.Item;
    })
    .catch(err => {
      console.log('There is an error getting user', err);
    });
}

module.exports.login = login;