import Joi from 'joi';

export default (login) => {
    const schema = Joi.object({
        email: Joi.string().email().min(5).max(255).trim().required(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(login);
};