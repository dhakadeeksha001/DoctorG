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
            @org.springframework.beans.factory.annotation.Value("${embedding.dimension:768}") Integer dimension,
            @org.springframework.beans.factory.annotation.Value("${embedding.ollama.base-url:http://localhost:11434}") String ollamaBaseUrl,
            @org.springframework.beans.factory.annotation.Value("${embedding.ollama.model-name:nomic-embed-text}") String ollamaModelName,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.base-url:}") String openAiBaseUrl,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.model-name:}") String openAiModelName,
            @org.springframework.beans.factory.annotation.Value("${embedding.openai.api-key:}") String openAiApiKey,
            @org.springframework.beans.factory.annotation.Value("${embedding.gemini.api-key:}") String geminiApiKey,
            @org.springframework.beans.factory.annotation.Value("${embedding.gemini.model-name:gemini-embedding-2}") String geminiModelName) {
            
        String resolvedProvider = provider;
        if ("ollama".equalsIgnoreCase(resolvedProvider)) {
            if (!isOllamaAvailable(ollamaBaseUrl)) {
                System.out.println("WARN: Ollama is unreachable at " + ollamaBaseUrl + ". Falling back to Gemini embedding provider.");
                resolvedProvider = "gemini";
            }
        }

        if ("openai".equalsIgnoreCase(resolvedProvider)) {
            var builder = dev.langchain4j.model.openai.OpenAiEmbeddingModel.builder()
                    .modelName(openAiModelName);
            if (openAiBaseUrl != null && !openAiBaseUrl.isBlank()) {
                builder.baseUrl(openAiBaseUrl);
            }
            if (openAiApiKey != null && !openAiApiKey.isBlank()) {
                builder.apiKey(openAiApiKey);
            }
            this.embeddingModel = builder.build();
        } else if ("gemini".equalsIgnoreCase(resolvedProvider)) {
            this.embeddingModel = dev.langchain4j.model.googleai.GoogleAiEmbeddingModel.builder()
                    .apiKey(geminiApiKey)
                    .modelName(geminiModelName)
                    .outputDimensionality(dimension)
                    .build();
        } else if ("ollama".equalsIgnoreCase(resolvedProvider)) {
            this.embeddingModel = OllamaEmbeddingModel.builder()
                    .baseUrl(ollamaBaseUrl)
                    .modelName(ollamaModelName)
                    .build();
        } else {
            throw new IllegalArgumentException("Unknown embedding provider: " + resolvedProvider);
        }
    }

    private boolean isOllamaAvailable(String urlStr) {
        try {
            java.net.URL url = new java.net.URL(urlStr);
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(1000); // 1 second connection timeout
            connection.setReadTimeout(1000);
            int responseCode = connection.getResponseCode();
            return responseCode == 200 || responseCode == 204;
        } catch (Exception e) {
            return false;
        }
    }

    public EmbeddingModel getEmbeddingModel() {
        return this.embeddingModel;
    }

    public Embedding embed(TextSegment textSegment) {
        return embeddingModel.embed(textSegment).content();
    }
}
