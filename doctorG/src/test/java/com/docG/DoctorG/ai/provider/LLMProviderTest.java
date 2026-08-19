package com.docG.DoctorG.ai.provider;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LLMProviderTest {

    private LLMProvider localProvider;
    private LLMProvider groqProvider;
    private ChatLanguageModel localSymptomChatModel;
    private ChatLanguageModel groqSymptomChatModel;
    private ChatLanguageModel groqCareChatModel;

    @BeforeEach
    void setUp() {
        localProvider = mock(LLMProvider.class);
        groqProvider = mock(LLMProvider.class);
        localSymptomChatModel = mock(ChatLanguageModel.class);
        groqSymptomChatModel = mock(ChatLanguageModel.class);
        groqCareChatModel = mock(ChatLanguageModel.class);

        when(localProvider.getProviderType()).thenReturn("LOCAL");
        when(groqProvider.getProviderType()).thenReturn("GROQ");

        when(groqProvider.isAvailable()).thenReturn(true);
        when(groqProvider.getModelName(AgentType.SYMPTOM)).thenReturn("allam-2-7b");
        when(groqProvider.getModelName(AgentType.CARE)).thenReturn("qwen/qwen3.6-27b");
        when(groqProvider.getChatModel(AgentType.SYMPTOM)).thenReturn(groqSymptomChatModel);
        when(groqProvider.getChatModel(AgentType.CARE)).thenReturn(groqCareChatModel);

        when(localProvider.getModelName(AgentType.SYMPTOM)).thenReturn("qwen3:1.7b");
        when(localProvider.getModelName(AgentType.CARE)).thenReturn("qwen3:1.7b");
        when(localProvider.getChatModel(AgentType.SYMPTOM)).thenReturn(localSymptomChatModel);
    }

    @Test
    void whenLocalLLMIsAvailable_localProviderIsSelected() {
        when(localProvider.isAvailable()).thenReturn(true);

        LLMService llmService = new LLMService(localProvider, groqProvider, 1);
        LLMProvider selectedProvider = llmService.getActiveProvider();

        assertEquals("LOCAL", selectedProvider.getProviderType());
        assertTrue(llmService.isLocalLLMAvailable());
    }

    @Test
    void whenLocalLLMIsUnavailable_groqProviderIsSelected() {
        when(localProvider.isAvailable()).thenReturn(false);

        LLMService llmService = new LLMService(localProvider, groqProvider, 1);
        LLMProvider selectedProvider = llmService.getActiveProvider();

        assertEquals("GROQ", selectedProvider.getProviderType());
        assertFalse(llmService.isLocalLLMAvailable());
    }

    @Test
    void whenLocalLLMFailsAtRuntime_fallbackToGroqWorks() {
        when(localProvider.isAvailable()).thenReturn(true);
        when(localSymptomChatModel.generate(anyList()))
                .thenThrow(new RuntimeException("Connection refused to Ollama"));

        when(groqSymptomChatModel.generate(anyList()))
                .thenReturn(Response.from(AiMessage.from("Groq response: How can I help you?")));

        LLMService llmService = new LLMService(localProvider, groqProvider, 60);
        DynamicChatLanguageModel dynamicModel = new DynamicChatLanguageModel(AgentType.SYMPTOM, llmService);

        List<ChatMessage> messages = List.of(UserMessage.from("I have a fever"));
        Response<AiMessage> response = dynamicModel.generate(messages);

        assertNotNull(response);
        assertEquals("Groq response: How can I help you?", response.content().text());
        assertFalse(llmService.isLocalLLMAvailable(), "Local provider should be marked unavailable after runtime failure");
        verify(groqSymptomChatModel, times(1)).generate(messages);
    }

    @Test
    void symptomAgentUsesAllam27bWhenGroqIsSelected() {
        GroqLLMProvider provider = new GroqLLMProvider("dummy-key-123", "allam-2-7b", "qwen/qwen3.6-27b");
        assertEquals("allam-2-7b", provider.getModelName(AgentType.SYMPTOM));
    }

    @Test
    void careAgentUsesQwen3627bWhenGroqIsSelected() {
        GroqLLMProvider provider = new GroqLLMProvider("dummy-key-123", "allam-2-7b", "qwen/qwen3.6-27b");
        assertEquals("qwen/qwen3.6-27b", provider.getModelName(AgentType.CARE));
    }

    @Test
    void groqProviderUnavailableIfApiKeyIsEmpty() {
        GroqLLMProvider provider = new GroqLLMProvider("", "allam-2-7b", "qwen/qwen3.6-27b");
        assertFalse(provider.isAvailable());
        assertThrows(IllegalStateException.class, () -> provider.getChatModel(AgentType.SYMPTOM));
    }
}
