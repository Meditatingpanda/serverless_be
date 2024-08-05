import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import { UserType } from "../../enums/CommonEnum.js";
import { PropertyStatus } from "../../enums/PropertyEnums.js";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const verifyProperty = async (event, context) => {
  const { userId } = context.authorizer.claims;
  const { propertyId, status, comments } = event.body;

  // Validate user type
  const user = await dynamoDb.get({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId },
  }).promise();

  if (user.Item.userType !== UserType.INSPECTOR) {
    throw createError.Forbidden("Only inspectors can verify properties");
  }

  try {
    const result = await dynamoDb.update({
      TableName: process.env.PROPERTIES_TABLE_NAME,
      Key: { propertyId },
      UpdateExpression: "set #status = :status, inspectorComments = :comments, inspectedAt = :inspectedAt",
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':comments': comments,
        ':inspectedAt': new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(verifyProperty);