package com.docG.DoctorG.service;

import java.util.List;

public interface RedisMemoryService {

    void appendUserMessage(String sessionId, String message);

    void appendAssistantMessage(String sessionId, String message);

    List<String> getConversation(String sessionId);

    void clearConversation(String sessionId);

}