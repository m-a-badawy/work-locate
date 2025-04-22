import mongoose from 'mongoose';
import winston from 'winston';
import config from 'config';

export default () => {
    const db = config.get('db');
    mongoose.connect(db)
        .then(() => winston.info(`Connected to ${db}`))
        .catch((err) => winston.error(`Error connecting to ${db}:`, err));
};
