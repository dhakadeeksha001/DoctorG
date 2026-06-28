package com.docG.DoctorG.ai.rag.service;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public EmbeddingService() {
        this.embeddingModel = OllamaEmbeddingModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("nomic-embed-text")
                .build();
    }

    public EmbeddingModel getEmbeddingModel() {
        return this.embeddingModel;
    }

    public Embedding embed(TextSegment textSegment) {
        return embeddingModel.embed(textSegment).content();
    }
}
