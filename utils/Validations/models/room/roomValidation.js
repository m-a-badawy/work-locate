import Joi from 'joi';

export default (room) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        type: Joi.string().valid('meeting', 'Personal', 'shared space', 'cabin').required(),
        capacity: Joi.number().min(1).max(100).required(),
        pricePerHour: Joi.number().min(1).required(),
        availabilityStatus: Joi.string().valid('available', 'unavailable').default('available').required(),
        isBooked: Joi.boolean().default(false),
        duration: Joi.number().min(0).optional(),
        amenities: Joi.array().items(Joi.string()).optional()
    });

    return schema.validate(room);
}
