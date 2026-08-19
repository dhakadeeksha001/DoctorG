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
            @org.springframework.beans.factory.annotation.Value("${langchain4j.ollama.embedding-model.base-url:http://localhost:11434}") String baseUrl,
            @org.springframework.beans.factory.annotation.Value("${langchain4j.ollama.embedding-model.model-name:nomic-embed-text}") String modelName) {
        this.embeddingModel = OllamaEmbeddingModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .build();
    }

    public EmbeddingModel getEmbeddingModel() {
        return this.embeddingModel;
    }

    public Embedding embed(TextSegment textSegment) {
        return embeddingModel.embed(textSegment).content();
    }
}
