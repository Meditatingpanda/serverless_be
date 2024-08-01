import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createError from "http-errors";
import { UserType } from "../../enums/CommonEnum.js";
import getUserById from "../../lib/user/getUserById.js";
import { updateUserById } from "../../lib/user/updateUserById.js";

const updateUserHandler = async (event, context) => {
  const { userId } = event.pathParameters;
  const {
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
  } = event.body;

  const user = await getUserById(userId);
  if (!user) {
    throw createError.NotFound("User not found");
  }
  if (user.userType === UserType.ADMIN) {
    throw createError.BadRequest("Admin user update is not allowed");
  }
  if (
    !firstName ||
    !lastName ||
    !phone ||
    !address ||
    !city ||
    !state ||
    !country ||
    !postalCode
  ) {
    throw createError.BadRequest("All fields are required");
  }
  if (!Object.values(UserType).includes(user.userType)) {
    throw createError.BadRequest("Invalid user type");
  }

  try {
    const updatedUser = await updateUserById(userId, {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        userId: updatedUser.userId,
        msg: "User updated successfully",
      }),
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to update user");
  }
};

export const handler = commonMiddleware(updateUserHandler);
