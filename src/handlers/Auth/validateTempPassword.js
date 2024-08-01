import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { getUserByEmail } from "../../lib/user/getUserByEmail.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import { updateUserById } from "../../lib/user/updateUserById.js";

const validateTempPassword = async (event, context) => {
  const { email, tempPassword, password } = event.body;
  if (!email || !tempPassword || !password) {
    throw createError.BadRequest("All fields are required");
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw createError.Conflict("User not found");
  }

  const isPasswordValid = await bcrypt.compare(tempPassword, user.password);

  if (!isPasswordValid) {
    throw createError.Unauthorized("Invalid password");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserById(user.userId, { password: hashedPassword });
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to hash password");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ msg: "Password validated successfully" }),
  };
};

export const handler = commonMiddleware(validateTempPassword);
