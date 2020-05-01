import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import * as AWS from 'aws-sdk'

import * as uuid from 'uuid'

const logger = createLogger('generateUploadUrl');

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event);
    const todoId = event.pathParameters.todoId;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    // TODO: check that todo item exists
    logger.info('todoId: ', todoId);

    const imageId = uuid.v4();
    const url = getUploadUrl(imageId);
    logger.info('url: ', url);

    // TODO: save image url in db todo item

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            url
        })
    };

};

// TODO: separate business logic from lambda layer
function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: parseInt(urlExpiration)
    })
}
