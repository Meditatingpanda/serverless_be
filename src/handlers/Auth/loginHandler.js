import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commonMiddleware } from "../../lib/commonMiddleware";
import { getUserByEmail } from "../../lib/user/getUserByEmail";

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
  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    statusCode: 200,
    body: {
      token,
      msg: "Login successful",
    },
  };
};

export const handler = commonMiddleware(loginHandler);
