import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { bookAppointment, cancelAppointment, getAllAppointmentsForDoctor, getAppointmentDetailsForPatient, updateAppointment } from "./appointments/appointments.controller.js";
import { SERVER_PORT } from "./constants.js";
import { validateBody, validateBookAppointment, validateCancelAppointmentReq, validateUpdateAppointmentReq } from "./appointments/appointments.middleware.js";

const app = express();
const PORT = SERVER_PORT || 3000;

app.use(bodyParser.json());

// Book an appointment
app.post("/bookAppointment", validateBody, validateBookAppointment, bookAppointment);

// View appointment details by patient email
app.get("/appointments/:email", getAppointmentDetailsForPatient);

// View all appointments for a doctor
app.get("/appointments/doctor/:doctorName", getAllAppointmentsForDoctor);

// Cancel an appointment
app.delete("/cancelAppointment", validateBody, validateCancelAppointmentReq, cancelAppointment);

// Update an appointment
app.put("/updateAppointment", validateBody, validateUpdateAppointmentReq, updateAppointment);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
