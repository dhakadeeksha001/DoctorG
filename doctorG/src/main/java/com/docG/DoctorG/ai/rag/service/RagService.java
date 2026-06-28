package com.docG.DoctorG.ai.rag.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import com.docG.DoctorG.ai.rag.retriever.RetrieverService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final RetrieverService retrieverService;
    private final ChatLanguageModel chatModel;

    public RagService(RetrieverService retrieverService) {
        this.retrieverService = retrieverService;
        this.chatModel = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("qwen3:1.7b")
                .temperature(0.2)
                .build();
    }

    public String generateHomeCareAdvice(String userQuery) {
        // Retrieve relevant context segments
        List<TextSegment> relevantSegments = retrieverService.retrieve(userQuery, 2, 0.4);
        
        String context = relevantSegments.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n"));

        // Build prompt with system constraints
        String systemInstructions = 
            "You are DoctorG, an educational home care assistant.\n" +
            "Your behavior must adhere to these rules strictly:\n" +
            "1. Use the provided context from trusted medical documents to generate evidence-based home care recommendations.\n" +
            "2. NEVER diagnose diseases or identify specific conditions. If asked, refuse to diagnose.\n" +
            "3. NEVER prescribe or suggest specific medications. If asked for prescriptions, refuse.\n" +
            "4. Always provide warning signs indicating when to seek urgent/emergency care.\n" +
            "5. Suggest professional consultation when appropriate.\n" +
            "6. Answer in maximum 3 sentences only.\n\n" +
            "Context:\n" + context;

        List<ChatMessage> messages = new ArrayList<>();
        messages.add(SystemMessage.from(systemInstructions));
        messages.add(UserMessage.from(userQuery));

        AiMessage response = chatModel.generate(messages).content();
        return response.text();
    }
}
