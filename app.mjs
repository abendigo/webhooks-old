import bodyParser from 'body-parser';
import logger from 'express-pino-logger';
import polka from 'polka';

const github = (request, response, next) => {
  request.log.info('github');
  console.log('github', request.body);
  response.end();
};

const { handler } = polka()
  .use(logger())
  .use(bodyParser.json())
  .post('/github', github);

export const app = handler;
