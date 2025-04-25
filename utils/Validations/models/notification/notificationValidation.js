import Joi from 'joi';

export default (notification) => {
    const schema = Joi.object({
        content: Joi.string().min(1).max(500).required(),
        type: Joi.string().valid('reservation', 'promotion', 'system').required(),
        customerId: Joi.objectId().required(),
    });

    return schema.validate(notification);
}
