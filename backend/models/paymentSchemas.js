import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  ticketPrice: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Ticket price must be a valid number.',
      'number.positive': 'Ticket price must be a positive number.',
      'any.required': 'Ticket price is required.',
    }),
});