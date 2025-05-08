import { getIo } from '../startUp/socket.js';

export default (req, res, next) => {
  req.io = getIo();
  next();
};
