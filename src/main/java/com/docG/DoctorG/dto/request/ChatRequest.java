package com.docG.DoctorG.dto.request;

import lombok.Data;

@Data
public class ChatRequest {

    private String sessionId;

    private String message;

}
