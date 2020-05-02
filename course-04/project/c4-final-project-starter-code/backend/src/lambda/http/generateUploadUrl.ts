import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import * as uuid from 'uuid'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {getUploadUrl, storeAttachmentUrlInDb, todoItemExists} from "../businessLogic/todoItems";
import {getUserId} from "../utils";

const logger = createLogger('generateUploadUrl');

// TODO: separate business/access logic from lambda layer
const bucketName = process.env.IMAGES_S3_BUCKET;


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

    const attachmentId = uuid.v4();
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`;

    const {message, success} = await storeAttachmentUrlInDb(userId, todoId, attachmentUrl);

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

    const uploadUrl = getUploadUrl(attachmentId);

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
