import http from 'http';
import handler from './app/index.mjs';

const port = process.env.PORT || 80;

const server = http.createServer(handler);
server.listen(port);
