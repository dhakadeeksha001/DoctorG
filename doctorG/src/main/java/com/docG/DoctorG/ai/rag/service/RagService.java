package com.docG.DoctorG.ai.rag.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import com.docG.DoctorG.ai.rag.prompt.MedicalAdvicePrompt;
import com.docG.DoctorG.ai.rag.retriever.RetrieverService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final RetrieverService retrieverService;
    private final ChatLanguageModel chatModel;

    public RagService(RetrieverService retrieverService, @Qualifier("careChatModel") ChatLanguageModel chatModel) {
        this.retrieverService = retrieverService;
        this.chatModel = chatModel;
    }

    public String generateHomeCareAdvice(String userQuery) {
        // Retrieve relevant context segments
        List<TextSegment> relevantSegments = retrieverService.retrieve(userQuery, 2, 0.7);
        
        String context = relevantSegments.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n"));

        // Build prompt with system constraints using central prompt component
        String systemInstructions = MedicalAdvicePrompt.buildSystemPrompt(context);

        List<ChatMessage> messages = new ArrayList<>();
        messages.add(SystemMessage.from(systemInstructions));
        messages.add(UserMessage.from(userQuery));

        AiMessage response = chatModel.generate(messages).content();
        return response.text();
    }
}
