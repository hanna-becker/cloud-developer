import 'source-map-support/register'
import {getAllGroups} from '../../businessLogic/groups';
import * as express from 'express'
import {Request, Response} from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'

const app: express.Application = express();

app.get('/groups', async (_req: Request, res: Response) => {
    const groups = await getAllGroups();

    res.append('Access-Control-Allow-Origin', '*').json({
        items: groups
    });
});

// Create Express server
const server = awsServerlessExpress.createServer(app);
// Pass API Gateway events to the Express server
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
};
