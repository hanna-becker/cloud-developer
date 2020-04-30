import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoItem} from "../../models/TodoItem";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";

// TODO: use x-ray
// const XAWS = AWSXRay.captureAWS(AWS);

export class TodoItemsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoItemsTable = process.env.TODOS_TABLE) {
    }

    async getAllTodoItems(): Promise<TodoItem[]> {
        console.log('Getting all TODO items');

        const result = await this.docClient.scan({
            TableName: this.todoItemsTable
        }).promise();

        const items = result.Items;
        return items as TodoItem[];
    }

    async getTodoItemById(todoId: string): Promise<TodoItem> {
        console.log(`Getting TODO item with todoId ${todoId}`);

        const result = await this.docClient.get({
            TableName: this.todoItemsTable,
            Key: {"todoId": todoId}
        }).promise();

        return result.Item as TodoItem;
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoItemsTable,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async updateTodoItem(todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<{ message: string; success: boolean; }> {
        try {
            const {name, dueDate, done} = updateTodoRequest;
            await this.docClient.update({
                TableName: this.todoItemsTable,
                Key: {"todoId": todoId},
                UpdateExpression: "set #nm=:n, dueDate=:dd, done=:do",
                ExpressionAttributeNames: {
                    "#nm": "name"
                },
                ExpressionAttributeValues: {
                    ":n": name,
                    ":dd": dueDate,
                    ":do": done
                },
                ReturnValues: "UPDATED_NEW"
            }).promise();
            return {
                message: `Successfully deleted todo item with id ${todoId}`,
                success: true
            };
        } catch (e) {
            return {
                message: JSON.stringify(e),
                success: false
            };
        }
    }

    async deleteTodoItem(todoId: string): Promise<{ message: string; success: boolean; }> {
        try {
            await this.docClient.delete({
                TableName: this.todoItemsTable,
                Key: {"todoId": todoId}
            }).promise();
            return {
                message: `Successfully deleted todo item with id ${todoId}`,
                success: true
            };
        } catch (e) {
            return {
                message: JSON.stringify(e),
                success: false
            };
        }
    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance');
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new AWS.DynamoDB.DocumentClient();
}
