import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import { UserType } from "../../enums/CommonEnum.js";
import AWS from "aws-sdk";
import getUserById from "../../lib/user/getUserById.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getMaintenanceRequests = async (event, context) => {
  const { userId } = context.authorizer.claims;

  // Validate user type
  const user = await getUserById(userId);

  if (user.Item.userType !== UserType.INSPECTOR) {
    throw createError.Forbidden(
      "Only inspectors can view maintenance requests"
    );
  }

  try {
    const result = await dynamoDb
      .scan({
        TableName: process.env.MAINTENANCE_REQUESTS_TABLE_NAME,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "PENDING",
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(getMaintenanceRequests);
