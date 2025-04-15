import Joi from 'joi';

export default (data) => {
    const schema = Joi.object({
        confirmedArrival: Joi.boolean().valid(true).required()
    });

    return schema.validate(data);
}