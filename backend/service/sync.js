const AWS = require('aws-sdk');
const util = require('../util/util');
const auth = require('../util/auth');
AWS.config.update({
  region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function sync(requestBody) {
  if (!requestBody.user || !requestBody.token || !requestBody.user.completedDays) {
    return util.buildResponse(401, { synced: false, message: 'Token / User / User.completedDays is empty' });
  }
  const user = requestBody.user;
  const token = requestBody.token;
  const completedDays = user.completedDays
  const verification = auth.verifyToken(user.email, token);
  const merge = (a, b) => {
    const ans = [];
    for (const item of a) {
      ans.push(item);
    }
    for (const item of b) {
      ans.push(item);
    }
    return ans.filter((v, i, a) => a.indexOf(v) === i).sort();
  };
  if (!verification.verified) {
    return util.buildResponse(401, verification);
  }
  const dynamoUser = await getUser(user.email);
  dynamoUser.completedDays = merge(dynamoUser.completedDays, completedDays);
  saveUser(dynamoUser);
  const userInfo = {
    email: dynamoUser.email,
    completedDays: dynamoUser.completedDays
  };
  return util.buildResponse(200, {
    synced: true,
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

module.exports.sync = sync;