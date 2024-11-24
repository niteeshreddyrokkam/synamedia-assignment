import Ajv from 'ajv';

const ajv = new Ajv();
require('ajv-formats')(ajv);

const bookAppointmentSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string', minLength: 1 },
    lastName: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    timeSlot: {
      type: 'string',
      pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM) - (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
    },
    doctorName: { type: 'string', minLength: 1 }
  },
  required: ['firstName', 'lastName', 'email', 'timeSlot', 'doctorName'],
  additionalProperties: false,
};

const cancelAppointmentschema = {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      timeSlot: {
        type: 'string',
        pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM) - (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
      },
    },
    required: ['email', 'timeSlot'],
    additionalProperties: false,
};

const updateAppointmentschema = {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      originalTimeSlot: {
        type: 'string',
        pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM) - (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
      },
      newTimeSlot: {
        type: 'string',
        pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM) - (1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$'
      },
    },
    required: ['email', 'originalTimeSlot', 'newTimeSlot'],
    additionalProperties: false,
};

export const validateUpdateAppointment = ajv.compile(updateAppointmentschema);
export const validateCancelAppointment = ajv.compile(cancelAppointmentschema)
export const vadlidateBookAppointment =  ajv.compile(bookAppointmentSchema);
