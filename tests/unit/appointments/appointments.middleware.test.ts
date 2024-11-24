import { Request, Response, NextFunction } from 'express';
import { isTimeSlotValid, validateBody, validateBookAppointment, validateCancelAppointmentReq, validateUpdateAppointmentReq } from '../../../src/appointments/appointments.middleware';
import { STATUS_CODES } from '../../../src/constants';
import { appointments } from '../../../src/types';
jest.mock('../../../src/types', () => ({
    appointments: [
      {
        patient: { email: 'test@example.com' },
        doctorName: 'Dr.ABC',
        timeSlot: '10:00 AM - 11:00 AM',
      },
    ],
    availableDoctors: ['Dr.ABC', 'Dr. Johnson'],
  }));

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
        email: "test@example.com1",
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
        email: "test@example.com1",
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

describe('validateUpdateAppointmentReq', () => {
let req: Request;
let res: Response;
let next: NextFunction;
beforeEach(() => {
    req = {
    body: {},
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
it('should return 404 if appointment not found', async () => {
    req.body = {
    email: 'non-existent@example.com',
    originalTimeSlot: '10:00 AM - 11:00 AM',
    newTimeSlot: '11:00 AM - 12:00 PM',
    };
    await validateUpdateAppointmentReq(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Original appointment not found.' });
});
it('should return 409 if new time slot already booked', async () => {
    req.body = {
    email: 'test@example.com',
    originalTimeSlot: '10:00 AM - 11:00 AM',
    newTimeSlot: '10:00 AM - 11:00 AM',
    };
    await validateUpdateAppointmentReq(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CONFLICT);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'New time slot already booked.' });
});
it('should call next if valid update appointment request', async () => {
    req.body = {
    email: 'test@example.com',
    originalTimeSlot: '10:00 AM - 11:00 AM',
    newTimeSlot: '11:00 AM - 12:00 PM',
    };
    await validateUpdateAppointmentReq(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
});
});

describe('validateCancelAppointmentReq', () => {
let req: Request;
let res: Response;
let next: NextFunction;
beforeEach(() => {
    req = {
    body: {},
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
it('should return bad request if email or timeSlot is missing', async () => {
    req.body = { email: 'test@example.com' };
    await validateCancelAppointmentReq(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required.' });
});
it('should return not found if appointment is not found', async () => {
    req.body = { email: 'test@example.com', timeSlot: '10:00 AM - 11:00 AM' };
    appointments.findIndex = jest.fn().mockReturnValue(-1);
    await validateCancelAppointmentReq(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Appointment not found.' });
});
it('should call next if appointment is found', async () => {
    req.body = { email: 'test@example.com', timeSlot: '10:00 AM - 11:00 AM' };
    appointments.findIndex = jest.fn().mockReturnValue(0);
    await validateCancelAppointmentReq(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
});
});

describe('validateBookAppointment', () => {
let req: Request;
let res: Response;
let next: NextFunction;
beforeEach(() => {
    req = {
    body: {},
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
it('should return 400 for invalid doctor name', async () => {
    req.body = {
        email: 'test@example.com',
        timeSlot: '10:00 AM - 11:00 AM',
        doctorName: 'Invalid Doctor',
    };
    await validateBookAppointment(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid doctor name.' });
});
it('should return 409 for time slot already booked', async () => {
    req.body = {
        email: 'test@example.com',
        timeSlot: '10:00 AM - 11:00 AM',
        doctorName: 'Dr.ABC',
    };
    await validateBookAppointment(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CONFLICT);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Time slot already booked.' });
});
it('should return 409 for appointment already exists at the same time slot', async () => {
    req.body = {
        email: 'test@example.com',
        timeSlot: '10:00 AM - 11:00 AM',
        doctorName: 'Dr.XYZ',
    };
    await validateBookAppointment(req, res, next);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CONFLICT);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'An Appointment already exists at this time slot' });
});
it('should call next() for valid booking request', async () => {
    req.body = {
        email: 'test1@example.com',
        timeSlot: '10:00 AM - 11:00 AM',
        doctorName: 'Dr.XYZ',
    };
    await validateBookAppointment(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
});
});