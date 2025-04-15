import Joi from 'joi';

export default (changePassword) => {
    const schema = Joi.object({
        oldPassword: Joi.string().min(6).max(1024).required(),
        newPassword: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(changePassword);
};