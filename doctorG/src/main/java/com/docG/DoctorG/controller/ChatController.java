package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.ChatRequest;
import com.docG.DoctorG.dto.response.ChatResponse;
import com.docG.DoctorG.service.ChatService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.docG.DoctorG.agent.SymptomCollectionAgent;

@RestController
@RequestMapping("/api/patient/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SymptomCollectionAgent symptomCollectionAgent;

    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(
            @RequestBody ChatRequest request) {

        return ResponseEntity.ok(
                chatService.sendMessage(request));
    }
}