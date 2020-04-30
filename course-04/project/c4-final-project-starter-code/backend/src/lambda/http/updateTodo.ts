import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {updateTodoItem} from "../businessLogic/todoItems";
import {createLogger} from "../../utils/logger";


const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);

    const todoId: string = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

    if (!todoId) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: 'Path must contain todoId'
        }
    }

    const {message, success} = await updateTodoItem(todoId, updatedTodo);

    if (success) {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: `Successfully updated todo item with id ${todoId}`
        }
    }

    return {
        statusCode: 404,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: message
    }
};
