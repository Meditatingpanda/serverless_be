import aws from "aws-sdk";

const dynamoDb = new aws.DynamoDB.DocumentClient();
export const getPropertiesOwnedByUserId = async (userId) => {
    const result = await dynamoDb.query({
        TableName: process.env.PROPERTIES_TABLE_NAME,
        IndexName: 'OwnerIndex',
        KeyConditionExpression: 'ownerId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    return result.Items;
};