import http from 'http';
import { app } from './app.mjs';

const server = http.createServer(app);
server.listen(8080);
