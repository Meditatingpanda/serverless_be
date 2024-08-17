import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../../lib/user/getUserByEmail.js";

const loginHandler = async (event, context) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      throw new createError.BadRequest("All fields are required");
    }

    const user = await getUserByEmail(email);
    if (!user) {
      throw new createError.Unauthorized("User Does not exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new createError.Unauthorized("Invalid credentials");
    }
   

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ token, msg: "Login successful" }),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

export const handler = loginHandler
