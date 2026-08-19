package com.docG.DoctorG.ai.rag.service;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(
            @org.springframework.beans.factory.annotation.Value("${embedding.provider:ollama}") String provider,
            @org.springframework.beans.factory.annotation.Value("${embedding.ollama.base-url:http://localhost:11434}") String ollamaBaseUrl,
            @org.springframework.beans.factory.annotation.Value("${embedding.ollama.model-name:nomic-embed-text}") String ollamaModelName,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.base-url:}") String openAiBaseUrl,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.model-name:}") String openAiModelName,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.api-key:}") String openAiApiKey,
            @org.springframework.beans.factory.annotation.Value("${embedding.gemini.api-key:}") String geminiApiKey,
            @org.springframework.beans.factory.annotation.Value("${embedding.gemini.model-name:gemini-embedding-2}") String geminiModelName) {
            
        if ("openai".equalsIgnoreCase(provider)) {
            var builder = dev.langchain4j.model.openai.OpenAiEmbeddingModel.builder()
                    .modelName(openAiModelName);
            if (openAiBaseUrl != null && !openAiBaseUrl.isBlank()) {
                builder.baseUrl(openAiBaseUrl);
            }
            if (openAiApiKey != null && !openAiApiKey.isBlank()) {
                builder.apiKey(openAiApiKey);
            }
            this.embeddingModel = builder.build();
        } else if ("gemini".equalsIgnoreCase(provider)) {
            this.embeddingModel = dev.langchain4j.model.googleai.GoogleAiEmbeddingModel.builder()
                    .apiKey(geminiApiKey)
                    .modelName(geminiModelName)
                    .build();
        } else if ("ollama".equalsIgnoreCase(provider)) {
            this.embeddingModel = OllamaEmbeddingModel.builder()
                    .baseUrl(ollamaBaseUrl)
                    .modelName(ollamaModelName)
                    .build();
        } else {
            throw new IllegalArgumentException("Unknown embedding provider: " + provider);
        }
    }

    public EmbeddingModel getEmbeddingModel() {
        return this.embeddingModel;
    }

    public Embedding embed(TextSegment textSegment) {
        return embeddingModel.embed(textSegment).content();
    }
}
