export interface Appointment {
    patient: {
      firstName: string;
      lastName: string;
      email: string;
    };
    doctorName: string;
    timeSlot: string;
  }
  
export const appointments: Appointment[] = [];
  