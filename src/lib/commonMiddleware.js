import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";

export const commonMiddleware = (handler) => {
  return middy()
    .use(httpErrorHandler())
    .use(jsonBodyParser())
    .use(httpEventNormalizer())
    .use({
      before: (request) => {
        const { event } = request;
        event.context = event.context || {};
        event.context.callbackWaitsForEmptyEventLoop = false;
      },
    })
    .handler(handler);
};