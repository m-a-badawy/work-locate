import Joi from 'joi';

export default (register) => {
    const schema = Joi.object({
        firstName: Joi.string().min(5).max(255).required(),
        lastName: Joi.string().min(5).max(255).required(),
        email: Joi.string().email().min(5).max(255).trim().required(),
        phone: Joi.string().min(10).max(20).required(),
        password: Joi.string().min(6).max(1024).required(),
        confirmPassword: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(register);
};