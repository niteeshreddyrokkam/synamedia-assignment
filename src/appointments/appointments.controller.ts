import { STATUS_CODES } from "../constants";
import logger from "../logger/logger";
import { appointments, Appointment } from "../types";
import { Request, Response } from "express";

/** 
 * Adding the business-logic in controller itself,
 * instead of service as there is nothing to be done here
**/
export async function bookAppointment(req: Request, res: Response): Promise<any> {
    const { firstName, lastName, email, timeSlot, doctorName } = req.body;
    const appointment: Appointment = {
      patient: { firstName, lastName, email },
      doctorName,
      timeSlot,
    };
  
    appointments.push(appointment);
    logger.info(`Appointment booked: ${JSON.stringify(appointment)}`);
    return res.status(STATUS_CODES.CREATED).json({ message: "Appointment booked.", appointments });
  }

  export async function getAppointmentDetailsForPatient(req: Request, res: Response): Promise<any> {
    const { email } = req.params;
  
    const patientAppointments = appointments.filter(
      (appt) => appt.patient.email === email
    );
  
    if (patientAppointments.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "No appointments found." });
    }
  
    logger.info(`Patient appointments: ${JSON.stringify(patientAppointments)}`);
    res.json({ appointments: patientAppointments });
  }

  export async function getAllAppointmentsForDoctor(req: Request, res: Response): Promise<any> {
    const { doctorName } = req.params;
  
    const doctorAppointments = appointments.filter(
      (appt) => appt.doctorName === doctorName
    );
  
    logger.info(`Doctor appointments: ${JSON.stringify(doctorAppointments)}`);
    return res.json({ appointments: doctorAppointments });
  }

  export async function cancelAppointment(req: Request, res: Response): Promise<any> {
    const { email, timeSlot } = req.body;
    const index = appointments.findIndex(
      (appt) => appt.patient.email === email && appt.timeSlot === timeSlot
    );
  
    appointments.splice(index, 1);
    logger.info(`Appointment canceled: ${JSON.stringify({ email, timeSlot })}`);

    return res.json({ message: "Appointment canceled." });
  }

  export async function updateAppointment(req: Request, res: Response): Promise<any> {
    const { email, originalTimeSlot, newTimeSlot } = req.body;
    const appointment = appointments.find(
      (appt) => appt.patient.email === email && appt.timeSlot === originalTimeSlot
    );
    appointment.timeSlot = newTimeSlot;
    logger.info(`Appointment updated: ${JSON.stringify({ email, originalTimeSlot, newTimeSlot })}`);

    return res.json({ message: "Appointment updated.", appointment });
  }