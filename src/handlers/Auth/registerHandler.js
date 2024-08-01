import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { getUserByEmail } from "../../lib/user/getUserByEmail.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import AWS from "aws-sdk";
import { UserType } from "../../enums/CommonEnum.js";
import { sendEmail } from "../../lib/mail/sendMail.js";
import {v4 as uuid} from 'uuid'
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const registerHandler = async (event, context) => {
  const { email, userType } = event.body;

  const user = await getUserByEmail(email);
  console.log("user", user);
  if (user) {
    throw createError.Conflict("User already exists");
  }
  if (!Object.values(UserType).includes(userType)) {
    throw createError.BadRequest("Invalid user type");
  }

  const password = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(password, 10);
  // store it

  try {
    await dynamoDb
      .put({
        TableName: process.env.USERS_TABLE_NAME,
        Item: {
          userId: uuid(),
          email,
          userType,
          password: hashedPassword,
        },
      })
      .promise();

    // sent temp password to email
    await sendEmail(email, "TEMP_PASSWORD", { tempPassword: password });
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to register user");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ msg: "User registered successfully" }),
  };
};

export const handler = commonMiddleware(registerHandler);
