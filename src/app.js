import expireReservationsJob from '../startUp/expireReservationsJob.js';
import joiValidation from '../startUp/joiValidation.js';
import configApp from '../startUp/configApp.js';
import production from '../startUp/prod.js';
import logging from '../startUp/logging.js';
import config from '../startUp/config.js';
import routes from '../startUp/routes.js';
import db from '../startUp/db.js';
import express from 'express';
import winston from 'winston';
import http from 'http';

const app = express();
const server = http.createServer(app);

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
  winston.info(`Listening on port ${port}...`);
});

export default server;
