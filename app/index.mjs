import bodyParser from 'body-parser';
import logger from 'pino-http';
import polka from 'polka';

import { verify, handler as github } from './routes/github.mjs';

const { handler } = polka()
  .use(logger())
  .post('/github/:repo?', bodyParser.json({ verify: verify }), github);

export default handler;
