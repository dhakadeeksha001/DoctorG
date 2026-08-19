package com.docG.DoctorG.ai.provider;

import dev.langchain4j.model.chat.ChatLanguageModel;

public interface LLMProvider {
    
    ChatLanguageModel getChatModel(AgentType agentType);

    boolean isAvailable();

    String getProviderType();

    String getModelName(AgentType agentType);
}
