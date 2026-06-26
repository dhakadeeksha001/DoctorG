package com.docG.DoctorG.config;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class OllamaConfig {

    @Value("${langchain4j.ollama.chat-model.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${langchain4j.ollama.chat-model.model-name:qwen3:1.7b}")
    private String modelName;

    @Value("${langchain4j.ollama.chat-model.temperature:0.1}")
    private Double temperature;

    @Bean
    public ChatModel chatModel() {
        return OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(temperature)
                .timeout(Duration.ofMinutes(3))
                .build();
    }
}