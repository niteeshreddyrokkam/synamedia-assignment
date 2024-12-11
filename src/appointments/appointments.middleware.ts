import { availableDoctors, STATUS_CODES } from "../constants";
import { appointments } from "../types";
import { NextFunction, Request, Response } from "express";
import { validateUpdateAppointment, validateCancelAppointment, vadlidateBookAppointment } from "../validation-schemas/appointment";
import { parseTime } from "../utils";
import { time } from "console";

export function validateBody(req: Request, res: Response, next: NextFunction): any {
    const isBookAppointmentRequest = req.method === 'POST' && req.url === '/bookAppointment';
    const isCancelAppointmentRequest = req.method === 'DELETE' && req.url === '/cancelAppointment';
    const valid = isBookAppointmentRequest ? vadlidateBookAppointment(req.body) : isCancelAppointmentRequest ? validateCancelAppointment(req.body) : validateUpdateAppointment(req.body);

    if (!valid) {
        return res.status(400).json({
        error: 'Validation failed',
        details: isBookAppointmentRequest ? vadlidateBookAppointment.errors : isCancelAppointmentRequest ? validateCancelAppointment.errors : validateUpdateAppointment.errors
        });
    }

    if (!isBookAppointmentRequest && !isCancelAppointmentRequest) {
        const {originalTimeSlot, newTimeSlot} = req.body;
        if (!isTimeSlotValid(originalTimeSlot, req.body, true)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid original time slot" });
        }
        
        if (!isTimeSlotValid(newTimeSlot, req.body, false)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid new time slot" });
        }

        return next();
    }

    const { timeSlot } = req.body;
    if (!isTimeSlotValid(timeSlot, req.body, isCancelAppointmentRequest)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid time slot" });
    }

    next();
}

/**
 * Checks if a given time slot string is valid.
 * A time slot string is valid if it is in the format "HH:MM AM/PM - HH:MM AM/PM"
 * and the start time is before the end time.
 * @param timeSlot The time slot string to check.
 * @param payload The request body.
 * @param skipTimeSlotConflictValidation If true, skip the time slot conflict validation.
 * @returns True if the time slot is valid, false otherwise.
 */
export function isTimeSlotValid(timeSlot: string, payload: any, skipTimeSlotConflictValidation = false): boolean {
    // Split the time slot into from and to times
    const [fromTime, toTime] = timeSlot.split(" - ");
    const fromMinutes = parseTime(fromTime.trim());
    const toMinutes = parseTime(toTime.trim());

    let conflictExists = false;
    if (!skipTimeSlotConflictValidation) {
        appointments.forEach((appt) => {
            const timeSlotStart = parseTime(appt.timeSlot.split(" - ")[0].trim());
            const timeSlotEnd = parseTime(appt.timeSlot.split(" - ")[1].trim());
           if (appt.doctorName === payload.doctorName) {
                if ((timeSlotStart < fromMinutes && timeSlotEnd > fromMinutes) || (timeSlotStart < toMinutes && timeSlotEnd > toMinutes)) {
                    conflictExists = true;
                }
           }
    
           if (appt.patient.email === payload.email) {
            if ((timeSlotStart < fromMinutes && timeSlotEnd > fromMinutes) || (timeSlotStart < toMinutes && timeSlotEnd > toMinutes)) {
                conflictExists = true;
            }
           }
        });
    
        if (conflictExists) {
            return false;
        }   
    }

    return fromMinutes <= toMinutes;
}

export function validateBookAppointment(req: Request, res: Response, next: NextFunction): any {
    const { email, timeSlot, doctorName } = req.body;
    if (!availableDoctors.includes(doctorName)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid doctor name." });
    }
  
    const existingAppointment = appointments.find(
      (appt) => appt.doctorName === doctorName && appt.timeSlot === timeSlot
    );
  
    if (existingAppointment) {
      return res.status(STATUS_CODES.CONFLICT).json({ message: "Time slot already booked." });
    }

    const isAppointmentExistsAlready = appointments.find(
      (appt) => appt.patient.email === email && appt.timeSlot === timeSlot
    );
  
    if (isAppointmentExistsAlready) {
      return res.status(STATUS_CODES.CONFLICT).json({ message: "An Appointment already exists at this time slot" });
    }

    next();
}

export function validateUpdateAppointmentReq(req: Request, res: Response, next: NextFunction): any {
    const { email, originalTimeSlot, newTimeSlot } = req.body;
    const appointment = appointments.find(
      (appt) => appt.patient.email === email && appt.timeSlot === originalTimeSlot
    );
  
    if (!appointment) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Original appointment not found." });
    }
  
    const slotConflict = appointments.find(
      (appt) =>
        appt.doctorName === appointment.doctorName && appt.timeSlot === newTimeSlot
    );
  
    if (slotConflict) {
      return res.status(STATUS_CODES.CONFLICT).json({ message: "New time slot already booked." });
    }

    next();
}

export function validateCancelAppointmentReq(req: Request, res: Response, next: NextFunction): any {
    const { email, timeSlot } = req.body;
    if (!email || !timeSlot) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "All fields are required." });
    }

    const index = appointments.findIndex(
      (appt) => appt.patient.email === email && appt.timeSlot === timeSlot
    );
  
    if (index === -1) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Appointment not found." });
    }

    next();
}