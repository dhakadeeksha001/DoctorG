package com.docG.DoctorG.controller;

import com.docG.DoctorG.ai.provider.AgentType;
import com.docG.DoctorG.ai.provider.LLMProvider;
import com.docG.DoctorG.ai.provider.LLMService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final LLMService llmService;

    public HealthController(LLMService llmService) {
        this.llmService = llmService;
    }

    @GetMapping("/health")
    public String health() {
        return "DoctorG Backend Running";
    }

    @GetMapping("/api/llm/health")
    public ResponseEntity<Map<String, Object>> llmHealth() {
        boolean localAvailable = llmService.isLocalLLMAvailable();
        LLMProvider activeProvider = llmService.getActiveProvider();
        LLMProvider groqProvider = llmService.getGroqProvider();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("localLLM", localAvailable ? "AVAILABLE" : "UNAVAILABLE");
        response.put("activeProvider", activeProvider.getProviderType());
        response.put("groqConfigured", groqProvider != null && groqProvider.isAvailable());
        response.put("symptomModel", activeProvider.getModelName(AgentType.SYMPTOM));
        response.put("careModel", activeProvider.getModelName(AgentType.CARE));

        return ResponseEntity.ok(response);
    }
}
