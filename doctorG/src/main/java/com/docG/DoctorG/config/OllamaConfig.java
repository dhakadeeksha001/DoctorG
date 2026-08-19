package com.docG.DoctorG.config;

import com.docG.DoctorG.ai.provider.AgentType;
import com.docG.DoctorG.ai.provider.DynamicChatLanguageModel;
import com.docG.DoctorG.ai.provider.GroqLLMProvider;
import com.docG.DoctorG.ai.provider.LLMProvider;
import com.docG.DoctorG.ai.provider.LLMService;
import com.docG.DoctorG.ai.provider.LocalLLMProvider;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class OllamaConfig {

    @Value("${llm.local.url:http://localhost:11434}")
    private String localUrl;

    @Value("${llm.local.symptom-model:qwen3:1.7b}")
    private String localSymptomModel;

    @Value("${llm.local.care-model:qwen3:1.7b}")
    private String localCareModel;

    @Value("${llm.local.timeout-seconds:600}")
    private int localTimeoutSeconds;

    @Value("${llm.local.health-check-timeout-ms:2000}")
    private int localHealthCheckTimeoutMs;

    @Value("${llm.local.cache-ttl-seconds:30}")
    private long cacheTtlSeconds;

    @Value("${llm.groq.api-key:}")
    private String groqApiKey;

    @Value("${llm.groq.symptom-model:allam-2-7b}")
    private String groqSymptomModel;

    @Value("${llm.groq.care-model:qwen/qwen3.6-27b}")
    private String groqCareModel;

    @Bean
    public LLMProvider localLLMProvider() {
        return new LocalLLMProvider(
                localUrl,
                localSymptomModel,
                localCareModel,
                localTimeoutSeconds,
                localHealthCheckTimeoutMs
        );
    }

    @Bean
    public LLMProvider groqLLMProvider() {
        return new GroqLLMProvider(
                groqApiKey,
                groqSymptomModel,
                groqCareModel
        );
    }

    @Bean
    public LLMService llmService(
            @Qualifier("localLLMProvider") LLMProvider localProvider,
            @Qualifier("groqLLMProvider") LLMProvider groqProvider) {
        return new LLMService(localProvider, groqProvider, cacheTtlSeconds);
    }

    @Bean
    @Qualifier("symptomChatModel")
    public ChatLanguageModel symptomChatModel(LLMService llmService) {
        return new DynamicChatLanguageModel(AgentType.SYMPTOM, llmService);
    }

    @Bean
    @Qualifier("careChatModel")
    public ChatLanguageModel careChatModel(LLMService llmService) {
        return new DynamicChatLanguageModel(AgentType.CARE, llmService);
    }

    @Bean
    @Primary
    public ChatLanguageModel chatModel(@Qualifier("symptomChatModel") ChatLanguageModel symptomChatModel) {
        return symptomChatModel;
    }
}