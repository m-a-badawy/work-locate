import Joi from 'joi';

export default (forgetPassword) => {
    const schema = Joi.object({
        email: Joi.string().email().min(5).max(255).trim().required(),
    });

    return schema.validate(forgetPassword);
};