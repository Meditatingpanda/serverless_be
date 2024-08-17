// landlord can register a property and update details
import createError from "http-errors";
import { getPropertiesOwnedByUserId } from "../../lib/properties/PropertyUtils.js";

const getPropertiesOwned = async (event, context) => {
  try {
    const { userId } = event.requestContext.authorizer.lambda;
    console.log("userId", userId);
    const property = await getPropertiesOwnedByUserId(userId);
    if (!property) {
      throw createError.NotFound("Property not found");
    }
    return {
      statusCode: 200,
      body: JSON.stringify(property),
    };
  } catch (error) {
    console.error("Error getting properties owned by user:", error);

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

export const handler = getPropertiesOwned;
