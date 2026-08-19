package com.docG.DoctorG.ai.provider;

import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class DynamicChatLanguageModel implements ChatLanguageModel {

    private static final Logger log = LoggerFactory.getLogger(DynamicChatLanguageModel.class);

    private final AgentType agentType;
    private final LLMService llmService;

    public DynamicChatLanguageModel(AgentType agentType, LLMService llmService) {
        this.agentType = agentType;
        this.llmService = llmService;
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages) {
        LLMProvider provider = llmService.getActiveProvider();
        String modelName = provider.getModelName(agentType);

        if ("GROQ".equals(provider.getProviderType())) {
            log.info("Using Groq model: {} for {} Agent", modelName, formatAgentName(agentType));
        } else {
            log.info("Using Local LLM model: {} for {} Agent", modelName, formatAgentName(agentType));
        }

        try {
            return provider.getChatModel(agentType).generate(messages);
        } catch (Exception e) {
            if ("LOCAL".equals(provider.getProviderType())) {
                log.warn("Local LLM execution failed for {} Agent: {}. Marking local LLM unavailable and falling back to GROQ.",
                        formatAgentName(agentType), e.getMessage());
                
                llmService.markLocalUnavailable();
                LLMProvider groqProvider = llmService.getGroqProvider();
                
                if (groqProvider != null && groqProvider.isAvailable()) {
                    String groqModel = groqProvider.getModelName(agentType);
                    log.info("Using Groq model: {} for {} Agent", groqModel, formatAgentName(agentType));
                    try {
                        return groqProvider.getChatModel(agentType).generate(messages);
                    } catch (Exception groqException) {
                        log.error("Groq fallback execution failed for {} Agent: {}", formatAgentName(agentType), groqException.getMessage());
                        throw new RuntimeException("LLM request failed on both Local LLM and Groq fallback: " + groqException.getMessage(), groqException);
                    }
                } else {
                    log.error("Groq provider is unavailable or not configured. Cannot perform fallback.");
                    throw new RuntimeException("Local LLM failed and Groq fallback is unavailable: " + e.getMessage(), e);
                }
            } else {
                log.error("Groq LLM execution failed for {} Agent: {}", formatAgentName(agentType), e.getMessage());
                throw new RuntimeException("Groq LLM service request failed: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, List<ToolSpecification> toolSpecifications) {
        LLMProvider provider = llmService.getActiveProvider();
        try {
            return provider.getChatModel(agentType).generate(messages, toolSpecifications);
        } catch (Exception e) {
            if ("LOCAL".equals(provider.getProviderType())) {
                llmService.markLocalUnavailable();
                LLMProvider groqProvider = llmService.getGroqProvider();
                if (groqProvider != null && groqProvider.isAvailable()) {
                    return groqProvider.getChatModel(agentType).generate(messages, toolSpecifications);
                }
            }
            throw new RuntimeException("LLM request failed: " + e.getMessage(), e);
        }
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, ToolSpecification toolSpecification) {
        LLMProvider provider = llmService.getActiveProvider();
        try {
            return provider.getChatModel(agentType).generate(messages, toolSpecification);
        } catch (Exception e) {
            if ("LOCAL".equals(provider.getProviderType())) {
                llmService.markLocalUnavailable();
                LLMProvider groqProvider = llmService.getGroqProvider();
                if (groqProvider != null && groqProvider.isAvailable()) {
                    return groqProvider.getChatModel(agentType).generate(messages, toolSpecification);
                }
            }
            throw new RuntimeException("LLM request failed: " + e.getMessage(), e);
        }
    }

    private String formatAgentName(AgentType agentType) {
        return agentType == AgentType.SYMPTOM ? "Symptom" : "Care";
    }
}
