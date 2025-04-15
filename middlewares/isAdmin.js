export default (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied, you are not admin');
    next();
};
