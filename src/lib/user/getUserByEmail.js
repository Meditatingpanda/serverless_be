import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const getUserByEmail = async (email) => {
  const params = {
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
  };

  try {
    const result = await dynamoDb.query(params).promise();
    return result.Items || null;
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to get user by email");
  }
};
