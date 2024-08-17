import jwt from "jsonwebtoken";
import createError from "http-errors";

const generatePolicy = (principalId, methodArn, claims) => {
  const apiGatewayWildcard = methodArn 
    ? methodArn.split("/", 2).join("/") + "/*"
    : "*";

  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: apiGatewayWildcard,
        },
      ],
    },
    context: claims,
  };
};

export async function handler(event, context) {
  if (!event.headers.authorization) {
    throw createError.Unauthorized("Unauthorized: No auth token");
  }

  const token = event.headers.authorization.replace("Bearer ", "");

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    const policy = generatePolicy(claims.userId, event.methodArn, claims);
    return policy;
  } catch (error) {
    console.log(error);
    throw createError.Unauthorized("Unauthorized", error);
  }
}