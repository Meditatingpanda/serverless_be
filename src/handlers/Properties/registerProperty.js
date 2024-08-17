// landlord can register a property and update details
import createError from "http-errors";
import { v4 as uuid } from "uuid";
import { UserType } from "../../enums/CommonEnum.js";
import { PropertyInspectionStatus } from "../../enums/PropertyEnums.js";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const registerProperty = async (event, context) => {
  try {
    const { userId } = event.requestContext.authorizer.lambda;
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      propertyType,
      rent,
    } = JSON.parse(event.body);

    // Validate user type
    const { Item: user } = await dynamoDb
      .get({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userId },
      })
      .promise();

    if (!user || user.userType !== UserType.LANDLORD) {
      throw new createError.Forbidden("Only landlords can register properties");
    }
    
    const property = {
      propertyId: uuid(),
      ownerId: userId,
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      propertyType,
      rent,
      verificationStatus: PropertyInspectionStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb
      .put({
        TableName: process.env.PROPERTIES_TABLE_NAME,
        Item: property,
      })
      .promise();
    console.log("Property registered successfully");

    return {
      statusCode: 201,
      body: JSON.stringify(property),
    };
  } catch (error) {
    console.error("Error registering property:", error);

    if (error instanceof createError.HttpError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export const handler = registerProperty;
