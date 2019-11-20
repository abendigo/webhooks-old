import bodyParser from 'body-parser';
import logger from 'pino-http';
import polka from 'polka';

import { verify, handler as github } from './github';

const { handler } = polka()
  .use(logger())
  // .use(bodyParser.json({ verify: verify }))
  .post('/github/:repo?', bodyParser.json({ verify: verify }), github);

export default handler;
