import { Request, Response } from 'express';
import { bookAppointment, cancelAppointment, getAllAppointmentsForDoctor, getAppointmentDetailsForPatient, updateAppointment } from '../../../src/appointments/appointments.controller';
import { STATUS_CODES } from '../../../src/constants';
import logger from '../../../src/logger/logger';
import { appointments } from '../../../src/types';
jest.mock('../../../src/logger/logger');

describe('bookAppointment', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {
      body: {},
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should book an appointment with valid request body', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      timeSlot: '10:00 AM - 11:00 AM',
      doctorName: 'Dr. Smith',
    };

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Appointment booked.',
      appointments: expect.any(Array),
    });
    expect(logger.info).toHaveBeenCalledTimes(1);
  });

  it('should book multiple appointments', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      timeSlot: '10:00 AM - 11:00 AM',
      doctorName: 'Dr. Smith',
    };

    await bookAppointment(req, res);
    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(res.json).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Appointment booked.',
      appointments: expect.any(Array),
    });
    expect(logger.info).toHaveBeenCalledTimes(2);
  });
});

describe('getAppointmentDetailsForPatient', () => {
    let req: Request;
    let res: Response;
    beforeEach(() => {
      appointments.length = 0;
      req = {
        params: {},
      } as Request;
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    });

    afterEach(() => {
      jest.clearAllMocks();
      appointments.length = 0;
    });
    it('should retrieve appointment details for a patient with existing appointments', async () => {
      
      const mockAppointments = [
            {
                "patient": {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@example.com"
                },
                "doctorName": "Dr.ABC",
                "timeSlot": "12:00 PM - 1:00 PM"
            }
      ];
      appointments.push(mockAppointments[0]);
      req.params.email = 'john.doe@example.com';
      await getAppointmentDetailsForPatient(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ appointments: [appointments[0]] });
      expect(logger.info).toHaveBeenCalledTimes(1);
    });
    it('should return not found for a patient with no appointments', async () => {
      req.params.email = 'unknown@example.com';
      await getAppointmentDetailsForPatient(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'No appointments found.' });
    });
});

describe('getAllAppointmentsForDoctor', () => {
    let req: Request;
    let res: Response;
    beforeEach(() => {
      req = {
        params: {},
      } as Request;
      res = {
        json: jest.fn(),
      } as unknown as Response;
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should retrieve appointments for a doctor with existing appointments', async () => {
      const doctorName = 'Dr. Smith';
      appointments.push({
        doctorName,
        patient: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        timeSlot: '10:00 AM - 11:00 AM',
      });
      req.params.doctorName = doctorName;
      await getAllAppointmentsForDoctor(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ appointments: [appointments[0]] });
      expect(logger.info).toHaveBeenCalledTimes(1);
    });
    it('should return empty array if doctor has no appointments', async () => {
      const doctorName = 'Dr. Smith1';
      req.params.doctorName = doctorName;
      await getAllAppointmentsForDoctor(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ appointments: [] });
      expect(logger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelAppointment', () => {
    let req: Request;
    let res: Response;
    beforeEach(() => {
      appointments.length = 0;
      req = {
        body: {},
      } as Request;
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    });
    afterEach(() => {
      jest.clearAllMocks();
      appointments.length = 0;
    });
    it('should cancel appointment with valid request body', async () => {
      const appointment = {
        patient: { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
        doctorName: "Dr.Smith",
        timeSlot: '10:00 AM - 11:00 AM',
      };
      appointments.push(appointment);
      req.body = { email: 'john.doe@example.com', timeSlot: '10:00 AM - 11:00 AM' };
      await cancelAppointment(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment canceled.' });
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(appointments.length).toBe(0);
    });
  });

  describe('updateAppointment', () => {
    let req: Request;
    let res: Response;
    beforeEach(() => {
      req = {
        body: {},
      } as Request;
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      jest.clearAllMocks();
    });
    it('should update appointment with valid request body', async () => {
      const email = 'test@example.com';
      const originalTimeSlot = '10:00 AM - 11:00 AM';
      const newTimeSlot = '11:00 AM - 12:00 PM';
      const appointment = {
        patient: {
          email,
          firstName: 'John',
          lastName: 'Doe',
        },
        doctorName: 'Dr. Smith',
        timeSlot: originalTimeSlot,
      };
      req.body = {
        email,
        originalTimeSlot,
        newTimeSlot,
      };
      appointments.push(appointment);
      await updateAppointment(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Appointment updated.',
        appointment,
      });
      expect(logger.info).toHaveBeenCalledWith(
        `Appointment updated: ${JSON.stringify({
          email,
          originalTimeSlot,
          newTimeSlot,
        })}`
      );
    });
  });