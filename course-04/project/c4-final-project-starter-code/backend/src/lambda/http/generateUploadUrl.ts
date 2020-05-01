import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {todoItemExists} from "../businessLogic/todoItems";
import {getUserId} from "../utils";

const logger = createLogger('generateUploadUrl');

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);
    const todoId = event.pathParameters.todoId;
    const userId: string = getUserId(event);
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    // TODO: check that todo item exists

    const validTodoId = await todoItemExists(userId, todoId);

    if (!validTodoId) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    const imageId = uuid.v4();
    const uploadUrl = getUploadUrl(imageId);
    logger.info('uploadUrl: ', uploadUrl);

    // TODO: save image uploadUrl in db todo item

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            uploadUrl
        })
    };

});

// TODO: Do we need this?
handler.use(
    cors({
        credentials: true
    })
);

// TODO: separate business logic from lambda layer
function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    })
}
