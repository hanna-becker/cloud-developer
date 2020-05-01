import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {storeAttachmentUrlInDb, todoItemExists} from "../businessLogic/todoItems";
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

    const isTodoIdValid = await todoItemExists(userId, todoId);

    if (!isTodoIdValid) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    const imageId = uuid.v4();
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;

    const {message, success} = await storeAttachmentUrlInDb(userId, todoId, imageUrl);

    if (!success) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message
            })
        };
    }

    const uploadUrl = getUploadUrl(imageId);

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
