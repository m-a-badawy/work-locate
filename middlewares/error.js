import winston from 'winston';

export default (err, req, res, next) => {
    winston.error(err.message, { metadata: err });
    res.status(500).send('Something went wrong: ' + err.message);
};
