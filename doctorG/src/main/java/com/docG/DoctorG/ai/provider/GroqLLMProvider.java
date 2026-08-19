package com.docG.DoctorG.ai.provider;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.EnumMap;
import java.util.Map;

public class GroqLLMProvider implements LLMProvider {

    private static final Logger log = LoggerFactory.getLogger(GroqLLMProvider.class);

    private final String apiKey;
    private final String symptomModel;
    private final String careModel;

    private final Map<AgentType, ChatLanguageModel> modelMap = new EnumMap<>(AgentType.class);

    public GroqLLMProvider(String apiKey, String symptomModel, String careModel) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.symptomModel = symptomModel != null && !symptomModel.isBlank() ? symptomModel : "allam-2-7b";
        this.careModel = careModel != null && !careModel.isBlank() ? careModel : "qwen/qwen3.6-27b";

        if (isAvailable()) {
            initModels();
        }
    }

    private void initModels() {
        modelMap.put(AgentType.SYMPTOM, OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl("https://api.groq.com/openai/v1")
                .modelName(symptomModel)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(60))
                .build());

        modelMap.put(AgentType.CARE, OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl("https://api.groq.com/openai/v1")
                .modelName(careModel)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(60))
                .build());
    }

    @Override
    public ChatLanguageModel getChatModel(AgentType agentType) {
        if (!isAvailable()) {
            throw new IllegalStateException("Groq API key is missing or invalid. Cannot build Groq ChatModel.");
        }
        return modelMap.get(agentType);
    }

    @Override
    public boolean isAvailable() {
        return !apiKey.isBlank();
    }

    @Override
    public String getProviderType() {
        return "GROQ";
    }

    @Override
    public String getModelName(AgentType agentType) {
        return agentType == AgentType.SYMPTOM ? symptomModel : careModel;
    }
}
