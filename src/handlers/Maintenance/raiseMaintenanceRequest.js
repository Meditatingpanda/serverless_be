import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import { v4 as uuid } from "uuid";
import { UserType } from "../../enums/CommonEnum.js";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const raiseMaintenanceRequest = async (event, context) => {
  const { userId } = context.authorizer.claims;
  const { propertyId, description } = event.body;

  // Validate user type
  const user = await dynamoDb.get({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId },
  }).promise();

  if (user.Item.userType !== UserType.TENANT) {
    throw createError.Forbidden("Only tenants can raise maintenance requests");
  }

  const maintenanceRequest = {
    requestId: uuid(),
    propertyId,
    tenantId: userId,
    description,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamoDb.put({
      TableName: process.env.MAINTENANCE_REQUESTS_TABLE_NAME,
      Item: maintenanceRequest,
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(maintenanceRequest),
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(raiseMaintenanceRequest);