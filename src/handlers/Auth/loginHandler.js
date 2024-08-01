import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { getUserByEmail } from "../../lib/user/getUserByEmail.js";

const loginHandler = async (event, context) => {
  const { email, password } = event.body;
  if (!email || !password) {
    throw createError.BadRequest("All fields are required");
  }
  const user = await getUserByEmail(email);
  if (!user) {
    throw createError.Unauthorized("User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError.Unauthorized("Invalid password");
  }
  console.log("user", user);
  console.log("secret", process.env.JWT_SECRET);
  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ token, msg: "Login successful" }),
  };
};

export const handler = commonMiddleware(loginHandler);
