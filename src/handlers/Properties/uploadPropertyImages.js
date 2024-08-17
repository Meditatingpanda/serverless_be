import createError from "http-errors";
import { UserType } from "../../enums/CommonEnum.js";
import AWS from "aws-sdk";
import uploadS3 from "../../lib/s3/uploadS3.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const uploadPropertyImages = async (event, context) => {
  try {
    const { userId } = event.requestContext.authorizer.lambda;
    const { propertyId } = event.pathParameters;

    // Validate user type
    const { Item: user } = await dynamoDb
      .get({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userId },
      })
      .promise();

    if (!user || user.userType !== UserType.LANDLORD) {
      throw new createError.Forbidden(
        "Only landlords can upload property images"
      );
    }

    // Get property from propertyId
    const { Item: property } = await dynamoDb
      .get({
        TableName: process.env.PROPERTIES_TABLE_NAME,
        Key: { propertyId },
      })
      .promise();

    if (!property) {
      throw new createError.NotFound("Property not found");
    }

    if (property.ownerId !== userId) {
      throw new createError.Forbidden(
        "You are not allowed to upload images to this property"
      );
    }

    // Handle multiple image uploads
    const images = event.multipart.imgs;
    console.log("images", images);
    if (!images || !Array.isArray(images)) {
      throw new createError.BadRequest("No images provided");
    }

    const uploadedImages = await Promise.all(
      images.map(async (image, index) => {
        const fileName = `${propertyId}_${index}_${Date.now()}.jpg`;
        const imageUrl = await uploadS3(image, fileName);
        return imageUrl;
      })
    );

    // Update property with new image URLs
    const updatedProperty = await dynamoDb
      .update({
        TableName: process.env.PROPERTIES_TABLE_NAME,
        Key: { propertyId },
        UpdateExpression:
          "SET images = list_append(if_not_exists(images, :empty_list), :new_images)",
        ExpressionAttributeValues: {
          ":empty_list": [],
          ":new_images": uploadedImages,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Images uploaded successfully",
        property: updatedProperty.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error uploading property images:", error);

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

export const handler = uploadPropertyImages;
