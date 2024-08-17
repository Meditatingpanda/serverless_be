import { getUserByEmail } from "../../lib/user/getUserByEmail.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import { updateUserById } from "../../lib/user/updateUserById.js";

const validateTempPassword = async (event, context) => {
  try {
    const { email, tempPassword, password } = JSON.parse(event.body);
    if (!email || !tempPassword || !password) {
      throw createError.BadRequest("All fields are required");
    }

    const user = await getUserByEmail(email);

    if (!user) {
      throw createError.NotFound("User not found");
    }

    const isPasswordValid = await bcrypt.compare(tempPassword, user.password);

    if (!isPasswordValid) {
      throw createError.Unauthorized("Invalid temporary password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserById(user.userId, { password: hashedPassword });

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: "Password updated successfully" }),
    };
  } catch (error) {
    console.error("Error in validateTempPassword:", error);
    
    if (error instanceof createError.HttpError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export const handler = validateTempPassword;