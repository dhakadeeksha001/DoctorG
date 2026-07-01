package com.docG.DoctorG.serviceimpl;

import com.docG.DoctorG.dto.request.BookAppointmentRequest;
import com.docG.DoctorG.dto.response.AppointmentResponse;
import com.docG.DoctorG.entity.Appointment;
import com.docG.DoctorG.entity.AppointmentStatus;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.exception.ApiException;
import com.docG.DoctorG.repository.AppointmentRepository;
import com.docG.DoctorG.repository.DoctorProfileRepository;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Override
    @Transactional
    public AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("Patient not found", HttpStatus.NOT_FOUND));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        if (doctor.getRole() != com.docG.DoctorG.entity.Role.DOCTOR) {
            throw new ApiException("User is not a doctor", HttpStatus.BAD_REQUEST);
        }

        LocalDate date;
        try {
            date = LocalDate.parse(request.getAppointmentDate());
        } catch (DateTimeParseException e) {
            throw new ApiException("Invalid date format. Use YYYY-MM-DD", HttpStatus.BAD_REQUEST);
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("Patient not found", HttpStatus.NOT_FOUND));

        return appointmentRepository.findByPatientOrderByAppointmentDateDesc(patient)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        return appointmentRepository.findByDoctorOrderByAppointmentDateDesc(doctor)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId, String email, boolean isDoctor) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ApiException("Appointment not found", HttpStatus.NOT_FOUND));

        // Security check: Ensure the canceling user is either the patient or the doctor of the appointment
        if (isDoctor) {
            if (!appointment.getDoctor().getEmail().equalsIgnoreCase(email)) {
                throw new ApiException("Unauthorized to cancel this appointment", HttpStatus.FORBIDDEN);
            }
        } else {
            if (!appointment.getPatient().getEmail().equalsIgnoreCase(email)) {
                throw new ApiException("Unauthorized to cancel this appointment", HttpStatus.FORBIDDEN);
            }
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse rescheduleAppointment(Long appointmentId, String email, String newDate, String newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ApiException("Appointment not found", HttpStatus.NOT_FOUND));

        // Rescheduling is typically done by the patient
        if (!appointment.getPatient().getEmail().equalsIgnoreCase(email)) {
            throw new ApiException("Unauthorized to reschedule this appointment", HttpStatus.FORBIDDEN);
        }

        LocalDate date;
        try {
            date = LocalDate.parse(newDate);
        } catch (DateTimeParseException e) {
            throw new ApiException("Invalid date format. Use YYYY-MM-DD", HttpStatus.BAD_REQUEST);
        }

        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(newTime);
        // Reset status to PENDING upon rescheduling
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long appointmentId, String doctorEmail, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ApiException("Appointment not found", HttpStatus.NOT_FOUND));

        if (!appointment.getDoctor().getEmail().equalsIgnoreCase(doctorEmail)) {
            throw new ApiException("Unauthorized to update this appointment status", HttpStatus.FORBIDDEN);
        }

        try {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointment.setStatus(appointmentStatus);
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid appointment status: " + status, HttpStatus.BAD_REQUEST);
        }

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        String specialty = "General Practitioner";
        DoctorProfile doctorProfile = doctorProfileRepository.findByUser(appointment.getDoctor()).orElse(null);
        if (doctorProfile != null && doctorProfile.getSpecialization() != null) {
            specialty = doctorProfile.getSpecialization();
        }

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .doctorSpecialty(specialty)
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .appointmentDate(appointment.getAppointmentDate().toString())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus().name())
                .reason(appointment.getReason())
                .patientAge(appointment.getPatient().getAge())
                .patientGender(appointment.getPatient().getGender())
                .build();
    }
}
