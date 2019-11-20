import http from 'http';
import handler from './app.mjs';

const port = process.env.PORT || 8080;

const server = http.createServer(handler);
server.listen(port);
