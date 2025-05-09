export default (type) =>{
    return (req, res, next) => {
      req.body.entityType = type;
      next();
    };
}
  