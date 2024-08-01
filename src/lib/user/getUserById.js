import aws from "aws-sdk";

const dynamoDb = new aws.DynamoDB.DocumentClient();

const getUserById = async (id) => {
  const result = await dynamoDb
    .get({
      TableName: process.env.USERS_TABLE_NAME,
      Key: {
        id,
      },
    })
    .promise();

  return result.Item || null;
};

export default getUserById;
