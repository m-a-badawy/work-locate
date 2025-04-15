import Joi from 'joi';

export default (payment) => {
    const schema = Joi.object({
        amount: Joi.number().min(1).required(),
        paymentMethod: Joi.string().valid('credit_card', 'paypal', 'bank_transfer').required(),
        paymentStatus: Joi.string().valid('pending', 'completed', 'failed').required(),
        transactionDate: Joi.date().iso().required(),
        customerId: Joi.objectId().required(),
        reservationId: Joi.objectId().required(),
    });
    return schema.validate(payment);
}
