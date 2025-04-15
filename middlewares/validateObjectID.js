import mongoose from 'mongoose';

export default (...ids) => (req, res, next) => {
    for (const id of ids) if (!mongoose.Types.ObjectId.isValid(req.params[id]))  return res.status(400).send(`Invalid ${id} parameter.` );
    next();
}
