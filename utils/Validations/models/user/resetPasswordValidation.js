import Joi from 'joi';

export default (resetPassword) => {
    const schema = Joi.object({
        newPassword: Joi.string().min(6).max(1024).trim().required(),
        confirmPassword: Joi.string().min(6).max(1024).required()
    });

    return schema.validate(resetPassword);
};
