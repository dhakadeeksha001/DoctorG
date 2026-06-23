package com.docG.DoctorG.serviceimpl;

import com.docG.DoctorG.dto.request.ChatRequest;
import com.docG.DoctorG.dto.response.ChatResponse;
import com.docG.DoctorG.service.ChatService;
import com.docG.DoctorG.service.RedisMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.docG.DoctorG.agent.SymptomCollectionAgent;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

        private final SymptomCollectionAgent symptomCollectionAgent;
        private final RedisMemoryService redisMemoryService;

        @Override
        public ChatResponse sendMessage(ChatRequest request) {

                redisMemoryService.appendUserMessage(
                                request.getSessionId(),
                                request.getMessage());

                String reply = symptomCollectionAgent.chat(
                                request.getSessionId(),
                                request.getMessage());

                redisMemoryService.appendAssistantMessage(
                                request.getSessionId(),
                                reply);

                return ChatResponse.builder()
                                .reply(reply)
                                .build();
        }
}