import bodyParser from 'body-parser';
import logger from 'pino-http';
import polka from 'polka';

import { verify, handler as github } from './routes/github.mjs';

const ensureContentType = expected => (request, response, next) => {
  const { 'content-type': actual } = request.headers;

  if (actual !== expected) {
    response.statusCode = 403;
    response.end('Invalid Content-Type.');
  } else {
    next();
  }
};

const { handler } = polka()
  .use(logger())
  .post('/github/:repo?', ensureContentType('application/json'), bodyParser.json({ verify: verify }), github);

export default handler;
