export default (req, res, next) => {
    if (req.user.role !== 'customer') return res.status(403).send('Access denied, you are not customer...');
    next();
};
