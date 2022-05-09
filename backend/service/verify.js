const AWS = require('aws-sdk');
const util = require('../util/util');
const auth = require('../util/auth');
AWS.config.update({
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function verify(requestBody) {
  if (!requestBody.user || !requestBody.token) {
    return util.buildResponse(401, { verified: false, message: 'Token / User is empty' });
  }
  const user = requestBody.user;
  const token = requestBody.token;
  const verification = auth.verifyToken(user.email, token);
  if (!verification.verified) {
    return util.buildResponse(401, verification);
  }
  const dynamoUser = await getUser(user.email);
  const userInfo = {
    email: dynamoUser.email,
    completedDays: dynamoUser.completedDays
  };
  return util.buildResponse(200, {
    verified: true,
    message: 'success',
    user: userInfo,
    token: token
  });
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

module.exports.verify = verify;