import jwt from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied, no token provided.');

    try {
        req.user = jwt.verify(token, config.get('jwtPrivateKey'));
        next();
    } catch {
        res.status(401).send('Invalid or expired token.');
    }
};