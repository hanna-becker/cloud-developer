import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import {getUserId} from "../../auth/utils";

const docClient = new AWS.DynamoDB.DocumentClient();
const groupsTable = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event);

    const newItem = {
        id: uuid.v4(),
        userId: getUserIdFromEvent(event),
        ...(JSON.parse(event.body))
    };

    await docClient.put({
        TableName: groupsTable,
        Item: newItem
    }).promise();

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            newItem
        })
    }
};

const getUserIdFromEvent = (event: APIGatewayProxyEvent) => {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
    return getUserId(jwtToken);
};
