import expireReservationsJob from '../startUp/expireReservationsJob.js';
import joiValidation from '../startUp/joiValidation.js';
import attachIo from '../middlewares/socket.js';
import configApp from '../startUp/configApp.js';
import initSocket from '../startUp/socket.js';
import logging from '../startUp/logging.js';
import production from '../startUp/prod.js';
import config from '../startUp/config.js';
import routes from '../startUp/routes.js';
import db from '../startUp/db.js';
import express from 'express';
import winston from 'winston';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(attachIo(io));

configApp(app);
joiValidation();
logging();
config();
routes(app);
db();
expireReservationsJob();
production(app);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  winston.info(`🚀 Listening on port ${port}...`);
});

export default app;
