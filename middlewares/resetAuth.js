import jwt from 'jsonwebtoken';
import config from 'config';

export default (req, res, next) => {
    const token = req.header('x-reset-token');

    if (!token) return res.status(401).json({ success: false, message: 'Access denied. No reset token provided.' });

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

        if (decoded.purpose !== 'resetPassword') return res.status(403).json({ success: false,  message: 'Invalid token purpose.' });

        req.user = jwt.verify(token, config.get('jwtPrivateKey'));
        next();

    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired reset token.' });
    }
};
