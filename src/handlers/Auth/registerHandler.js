import { getUserByEmail } from "../../lib/user/getUserByEmail.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import AWS from "aws-sdk";
import { UserType } from "../../enums/CommonEnum.js";
import { sendEmail } from "../../lib/mail/sendMail.js";
import { v4 as uuid } from "uuid";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const registerHandler = async (event, context) => {
  try {
    const { email, userType } = JSON.parse(event.body);

    if (!email || !userType) {
      throw new createError.BadRequest("Email and userType are required");
    }

    const user = await getUserByEmail(email);
    if (user) {
      throw new createError.Conflict("User already exists");
    }

    if (!Object.values(UserType).includes(userType)) {
      throw new createError.BadRequest("Invalid user type");
    }

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      userId: uuid(),
      email,
      userType,
      password: hashedPassword,
    };

    await dynamoDb
      .put({
        TableName: process.env.USERS_TABLE_NAME,
        Item: newUser,
      })
      .promise();

    await sendEmail(email, "TEMP_PASSWORD", {
      tempPassword: password,
      name: userType,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    console.error("Error in registerHandler:", error);

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

export const handler = registerHandler;
