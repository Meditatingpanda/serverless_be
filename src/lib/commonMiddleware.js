import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";

export const commonMiddleware = (handler) => {
  return middy(handler).use([
    httpErrorHandler(),
    jsonBodyParser(),
    httpEventNormalizer(),
  ]);
};
