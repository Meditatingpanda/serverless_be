import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const loginHandler = async (event, context) => {
  const { email, password } = event.body;

  

  return {
    statusCode: 200,
    body: {
      email,
      password,
    },
  };
};

export const handler = middy()
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .handler(loginHandler);
