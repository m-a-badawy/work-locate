import Joi from 'joi';

export default (reservation) => {
    const schema = Joi.object({
        minutesToArrive: Joi.number().integer().min(1).required(),
        seatsBooked: Joi.number().integer().min(1).required()
    });

    return schema.validate(reservation);
}
