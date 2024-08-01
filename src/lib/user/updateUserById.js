import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const updateUserById = async (userId, user) => {
  const {
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
  } = user;
  const params = {
    TableName: process.env.USERS_TABLE_NAME,
    Key: { userId },
    UpdateExpression:
      "set #firstName = :firstName, #lastName = :lastName, #phone = :phone, #address = :address, #city = :city, #state = :state, #country = :country, #postalCode = :postalCode",
    ExpressionAttributeNames: {
      "#firstName": "firstName",
      "#lastName": "lastName",
      "#phone": "phone",
      "#address": "address",
      "#city": "city",
      "#state": "state",
      "#country": "country",
      "#postalCode": "postalCode",
    },
    ExpressionAttributeValues: {
      ":firstName": firstName,
      ":lastName": lastName,
      ":phone": phone,
      ":address": address,
      ":city": city,
      ":state": state,
      ":country": country,
      ":postalCode": postalCode,
    },
    ReturnValues: "ALL_NEW", // Add this line to return updated attributes
  };
  try {
    const result = await dynamoDb.update(params).promise();
    return result.Attributes; // Return the updated user data
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError("Failed to update user");
  }
};
