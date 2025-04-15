import Joi from 'joi';

export default (updateWorkingSpace) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    location: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number().required()).length(2).required()
      }).required(),
    address: Joi.string().min(10).max(200).required(),
    description: Joi.string().min(10).max(500).required(),
    amenities: Joi.array().items(Joi.string()).required(),
    roomCounter: Joi.number().integer().required()
});

  return schema.validateAsync(updateWorkingSpace);
}
