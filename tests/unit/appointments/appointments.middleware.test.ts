import { Request, Response, NextFunction } from 'express';
import { isTimeSlotValid, validateBody } from '../../../src/appointments/appointments.middleware';
import { STATUS_CODES } from '../../../src/constants';

jest.mock('../../../src/validation-schemas/appointment', () => ({
  vadlidateBookAppointment: jest.fn(() => ({ valid: true, errors: [] })),
  validateCancelAppointment: jest.fn(() => ({ valid: true, errors: [] })),
  validateUpdateAppointment: jest.fn(() => ({ valid: true, errors: [] })),
}));

jest.mock('../../../src/appointments/appointments.middleware', () => ({
  isTimeSlotValid: jest.fn(() => true),
  ...jest.requireActual('../../../src/appointments/appointments.middleware'),
}));

describe('validateBody function', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      method: 'POST',
      url: '/bookAppointment',
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com1",
        timeSlot: "12:00 PM - 1:00 PM",
        doctorName: "Dr.ABC"          
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate book appointment request', async () => {
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should validate cancel appointment request', async () => {
    req.method = 'DELETE';
    req.url = '/cancelAppointment';
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should validate update appointment request', async () => {
    req.method = 'PUT';
    req.url = '/updateAppointment';
    req.body = {
        email: "john.doe@example.com1",
        originalTimeSlot: "12:00 PM - 1:00 PM",
        newTimeSlot: "2:00 PM - 3:00 PM"
    };      
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return error for invalid time slot in book appointment request', async () => {
    req.body.timeSlot = '2:00 PM - 3:00 AM';
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid time slot' });
  });

  it('should return error for invalid time slot in update appointment request', async () => {
    req.method = 'PUT';
    req.url = '/updateAppointment';
    req.body.originalTimeSlot = '2:00 PM - 3:00 AM';
    req.body.newTimeSlot = '3:00 PM - 4:00 PM';
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid original time slot' });
  });

  it('should return error for invalid original and new time slots in update appointment request', async () => {
    req.method = 'PUT';
    req.url = '/updateAppointment';
    req.body.originalTimeSlot = '2:00 PM - 3:00 AM';
    req.body.newTimeSlot = '3:00 PM - 4:00 PM';
    await validateBody(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid original time slot' });
  });

  it('should call next function when validation is successful', async () => {
    await validateBody(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});