export default (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') return res.status(403).send('Access denied, you are not owner or admin');
    next();
};
