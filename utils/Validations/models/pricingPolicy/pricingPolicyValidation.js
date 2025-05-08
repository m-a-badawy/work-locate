import Joi from 'joi';

export default (price) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(500).required(),
        discountPercentage: Joi.number().min(0).max(100).required(),
    });
    return schema.validate(price);
}
