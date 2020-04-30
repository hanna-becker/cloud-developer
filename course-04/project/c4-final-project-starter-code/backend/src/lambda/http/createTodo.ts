import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'

import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {createTodoItem} from "../businessLogic/todoItems";
import {getUserId} from "../utils";
import {TodoItem} from "../../models/TodoItem";
import {createLogger} from "../../utils/logger";

const logger = createLogger('createTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    logger.info('event: ', event);
    // TODO: remove fake user id
    const userId = getUserId(event) || '123';

    const todoItem: TodoItem = await createTodoItem(newTodo, userId);

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            todoItem
        })
    }
};
