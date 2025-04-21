import Joi from 'joi';

export default (review) => {
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().min(5).max(500).optional()
    });

    return schema.validate(review);
};