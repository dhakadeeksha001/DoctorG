package com.docG.DoctorG.config;

import com.docG.DoctorG.agent.SymptomCollectionAgent;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public SymptomCollectionAgent symptomCollectionAgent(
            @Qualifier("symptomChatModel") ChatLanguageModel chatModel,
            ChatMemoryProvider chatMemoryProvider) {

        return AiServices.builder(SymptomCollectionAgent.class)
                .chatLanguageModel(chatModel)
                .chatMemoryProvider(chatMemoryProvider)
                .build();
    }
}