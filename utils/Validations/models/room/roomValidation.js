import Joi from 'joi';
import joiObjectid from 'joi-objectid';

const JoiObjectId = joiObjectid(Joi);

export default (review) => {
    const schema = Joi.object({
        rating: Joi.number().min(1).max(5).optional(),
        comment: Joi.string().min(5).max(500).optional(),
    });

    return schema.validate(review);
};
