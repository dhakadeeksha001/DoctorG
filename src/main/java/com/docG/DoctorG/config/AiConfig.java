package com.docG.DoctorG.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.docG.DoctorG.agent.SymptomCollectionAgent;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;

@Configuration
public class AiConfig {

    @Bean
    public SymptomCollectionAgent symptomCollectionAgent(
            ChatModel chatModel,
            ChatMemoryProvider chatMemoryProvider) {

        return AiServices.builder(SymptomCollectionAgent.class)
                .chatModel(chatModel)
                .chatMemoryProvider(chatMemoryProvider)
                .build();
    }
}