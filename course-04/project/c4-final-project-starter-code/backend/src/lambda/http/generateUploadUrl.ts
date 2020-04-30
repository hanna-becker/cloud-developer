import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {createLogger} from "../../utils/logger";

const logger = createLogger('generateUploadUrl');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('event: ', event);
  const todoId = event.pathParameters.todoId;
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  logger.info('todoId: ', todoId);
  return undefined
};
