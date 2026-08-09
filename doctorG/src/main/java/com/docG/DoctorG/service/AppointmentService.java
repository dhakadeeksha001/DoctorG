package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.BookAppointmentRequest;
import com.docG.DoctorG.dto.response.AppointmentResponse;
import java.util.List;

public interface AppointmentService {
    AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request);
    List<AppointmentResponse> getPatientAppointments(String patientEmail);
    List<AppointmentResponse> getDoctorAppointments(String doctorEmail);
    AppointmentResponse cancelAppointment(Long appointmentId, String email, boolean isDoctor);
    AppointmentResponse rescheduleAppointment(Long appointmentId, String email, String newDate, String newTime);
    AppointmentResponse updateAppointmentStatus(Long appointmentId, String doctorEmail, String status);
}
