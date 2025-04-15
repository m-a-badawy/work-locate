import winston from 'winston';
import 'express-async-errors';
import 'winston-mongodb';

export default () => {
    winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'error.log' }),
            new winston.transports.MongoDB({
                db: process.env.NODE_ENV === 'test' 
                    ? 'mongodb://localhost:27017/workLocate_test' 
                    : 'mongodb://localhost:27017/workLocate',
                level: 'info'
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: 'ExceptionHandler.log' })
        ],
        rejectionHandlers: [
            new winston.transports.File({ filename: 'rejectionHandler.log' })
        ]
    });

    winston.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
