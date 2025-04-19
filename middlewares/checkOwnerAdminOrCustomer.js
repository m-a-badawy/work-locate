export default (req, res, next) => {
    if ( req.user.role !== 'admin' && req.user.role !== 'owner' && req.user.role !==  'customer' ) 
        return res.status(403).json({ success: false, message: 'Access denied, you are neither owner, admin, nor the customer.' });
    next();
};
