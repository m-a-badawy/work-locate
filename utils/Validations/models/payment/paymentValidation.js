import Joi from 'joi';

export default function validatePayment(payment) {
  const schema = Joi.object({
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cash', 'phone wallet').required()
  });

  return schema.validate(payment, { abortEarly: false });
}
