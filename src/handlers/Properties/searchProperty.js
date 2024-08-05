import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const searchProperties = async (event, context) => {
  const { location } = event.queryStringParameters;

  if (!location) {
    throw createError.BadRequest("Location is required for search");
  }

  try {
    const result = await dynamoDb.query({
      TableName: process.env.PROPERTIES_TABLE_NAME,
      IndexName: "LocationIndex",
      KeyConditionExpression: "location = :location",
      ExpressionAttributeValues: {
        ":location": location,
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError(error);
  }
};

export const handler = commonMiddleware(searchProperties);