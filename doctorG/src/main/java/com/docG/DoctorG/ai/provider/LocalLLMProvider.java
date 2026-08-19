package com.docG.DoctorG.ai.provider;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.EnumMap;
import java.util.Map;

public class LocalLLMProvider implements LLMProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalLLMProvider.class);

    private final String baseUrl;
    private final String symptomModel;
    private final String careModel;
    private final int timeoutSeconds;
    private final int healthCheckTimeoutMs;

    private final Map<AgentType, ChatLanguageModel> modelMap = new EnumMap<>(AgentType.class);

    public LocalLLMProvider(String baseUrl, String symptomModel, String careModel, int timeoutSeconds, int healthCheckTimeoutMs) {
        this.baseUrl = baseUrl != null ? baseUrl.replaceAll("/+$", "") : "http://localhost:11434";
        this.symptomModel = symptomModel;
        this.careModel = careModel;
        this.timeoutSeconds = timeoutSeconds;
        this.healthCheckTimeoutMs = healthCheckTimeoutMs;

        initModels();
    }

    private void initModels() {
        modelMap.put(AgentType.SYMPTOM, OllamaChatModel.builder()
                .baseUrl(this.baseUrl)
                .modelName(this.symptomModel)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build());

        modelMap.put(AgentType.CARE, OllamaChatModel.builder()
                .baseUrl(this.baseUrl)
                .modelName(this.careModel)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build());
    }

    @Override
    public ChatLanguageModel getChatModel(AgentType agentType) {
        return modelMap.get(agentType);
    }

    @Override
    public boolean isAvailable() {
        try {
            URL url = URI.create(baseUrl + "/api/tags").toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(healthCheckTimeoutMs);
            connection.setReadTimeout(healthCheckTimeoutMs);
            int responseCode = connection.getResponseCode();
            connection.disconnect();
            return responseCode == 200;
        } catch (Exception e) {
            log.debug("Local LLM health check failed at {}: {}", baseUrl, e.getMessage());
            return false;
        }
    }

    @Override
    public String getProviderType() {
        return "LOCAL";
    }

    @Override
    public String getModelName(AgentType agentType) {
        return agentType == AgentType.SYMPTOM ? symptomModel : careModel;
    }
}
