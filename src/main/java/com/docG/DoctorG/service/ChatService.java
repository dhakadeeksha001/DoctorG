package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.ChatRequest;
import com.docG.DoctorG.dto.response.ChatResponse;

public interface ChatService {

    ChatResponse sendMessage(ChatRequest request);

}