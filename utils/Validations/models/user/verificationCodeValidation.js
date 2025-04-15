import Joi from 'joi';

export default (resetPassword) => {
    const schema = Joi.object({
        verificationCode: Joi.number().integer().min(100000).max(999999).required()
    });

    return schema.validate(resetPassword);
};
