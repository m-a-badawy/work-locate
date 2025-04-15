import Joi from 'joi';

export default (changePassword) => {
    const schema = Joi.object({
        seatsBooked: Joi.number().min(1),
        minutesToArrive: Joi.number().integer().min(1),
        status: Joi.string().valid('pending', 'confirmed', 'active', 'cancelled')
    });

    return schema.validate(changePassword);
};
