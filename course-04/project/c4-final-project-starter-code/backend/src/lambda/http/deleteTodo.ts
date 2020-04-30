import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {deleteTodoItem} from "../businessLogic/todoItems";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";


const logger = createLogger('deleteTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);

    const todoId = event.pathParameters.todoId;
    const userId: string = getUserId(event);

    const {message, success} = await deleteTodoItem(todoId, userId);

    if (success) {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: `Successfully deleted todo item with id ${todoId}`
        }
    }

    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: message
    }
};
