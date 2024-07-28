import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import { v4 as uuid } from "uuid";
import { UserType } from "../../enums/CommonEnum.js";

const createUserHandler = async (event, context) => {
  const { email, phone, userType, firstName, lastName, profilePicture } =
    event.body;
  if (userType === UserType.ADMIN) {
    throw createError.BadRequest("Admin user creation is not allowed");
  }
  if (!email || !phone || !userType || !firstName || !lastName) {
    throw createError.BadRequest("All fields are required");
  }
  if (!Object.values(UserType).includes(userType)) {
    throw createError.BadRequest("Invalid user type");
  }
  const userId = uuid();
  try {
    const user = {
      userId,
      email,
      phone,
      userType,
      firstName,
      lastName,
      profilePicture,
    };
    await dynamoDbClient
      .put({
        TableName: process.env.USERS_TABLE_NAME,
        Item: user,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to create user");
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ userId, msg: "User created successfully" }),
  };
};

export const handler = commonMiddleware(createUserHandler);
