const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default dynamoDb
