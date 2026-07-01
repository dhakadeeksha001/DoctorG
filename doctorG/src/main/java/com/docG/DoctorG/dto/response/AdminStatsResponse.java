package com.docG.DoctorG.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalPatients;
    private long activeSessions;
    private long totalDoctors;
}
