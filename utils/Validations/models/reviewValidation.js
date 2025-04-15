import Joi from 'joi';
import joiObjectid from 'joi-objectid';

const JoiObjectId = joiObjectid(Joi);

export default (review) => {
    const schema = Joi.object({
        customerId: JoiObjectId().required(),
        customerId: JoiObjectId().required(),
        workspaceId: JoiObjectId().required(),
    });

    return schema.validate(review);
}
