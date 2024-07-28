import { commonMiddleware } from "../../lib/commonMiddleware.js";

const registerHandler = async (event, context) => {
  const { email, password } = event.body;
  return {
    statusCode: 200,
    body: JSON.stringify({ email, password }),
  };
};

export const handler = commonMiddleware(registerHandler);
