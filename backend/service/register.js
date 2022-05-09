const AWS = require('aws-sdk');
const util = require('../util/util');
const bcrypt = require('bcryptjs');
AWS.config.update({
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function register(userInfo) {
  const email = userInfo.email;
  const password = userInfo.password;
  if (!email || !password) {
    return util.buildResponse(401, {
      message: 'Email/Password is missing'
    });
  }

  const dynamoUser = await getUser(email);
  if (dynamoUser && dynamoUser.email) {
    return util.buildResponse(401, {
      message: 'email already exists in the database'
    });
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user = {
    email: email,
    password: encryptedPW,
    completedDays: []
  }

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse) {
    return util.buildResponse(503, { message: 'Server Error. Please try again later' });
  }

  return util.buildResponse(200, { email: email, completedDays: [] });
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

async function saveUser(user) {
  const params = {
    TableName: userTable,
    Item: user
  };
  return await dynamodb.put(params).promise()
    .then(() => {
      return true
    })
    .catch(err => {
      console.log('There is an error saving user', err);
    });
}

module.exports.register = register;