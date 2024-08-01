import AWS from "aws-sdk";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const updateUserById = async (userId, user) => {
  const updateableFields = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "city",
    "state",
    "country",
    "postalCode",
    "password",
  ];

  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const field of updateableFields) {
    if (field in user) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = user[field];
    }
  }

  if (updateExpressions.length === 0) {
    throw createError.BadRequest("No valid fields to update");
  }
  console.log("Updating user with ID:", userId);
  console.log("Update fields:", user);

  const params = {
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId }, // Explicitly use userId as the key
    UpdateExpression: `set ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  console.log("DynamoDB update params:", JSON.stringify(params, null, 2));

  try {
    const result = await dynamoDb.update(params).promise();
    console.log("Update successful. Result:", JSON.stringify(result, null, 2));
    return result.Attributes;
  } catch (error) {
    console.error("DynamoDB update error:", error);
    if (error.code === "ValidationException") {
      console.error("Validation error details:", error.message);
      throw createError.BadRequest(`Invalid user data or ID: ${error.message}`);
    }
    throw createError.InternalServerError("Failed to update user");
  }
};

export const updateUser = async (userId, updateFields) => {
  try {
    const result = await updateUserById(userId, updateFields);
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
