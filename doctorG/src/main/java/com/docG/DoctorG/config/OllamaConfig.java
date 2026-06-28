package com.docG.DoctorG.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;

@Configuration
public class OllamaConfig {

    @Bean
    public ChatLanguageModel chatModel() {

        return OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("qwen3:1.7b")
                .temperature(0.2)
                .timeout(Duration.ofSeconds(600))
                .build();
    }
}