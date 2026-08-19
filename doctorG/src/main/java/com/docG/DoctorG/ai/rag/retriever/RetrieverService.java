package com.docG.DoctorG.ai.rag.retriever;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import com.docG.DoctorG.ai.rag.service.EmbeddingService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RetrieverService {

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingService embeddingService;
    private final String qdrantHost;
    private final int qdrantPort;
    private final String qdrantApiKey;
    private final boolean qdrantUseTls;
    private final int qdrantDimension;

    public RetrieverService(
            EmbeddingService embeddingService,
            @org.springframework.beans.factory.annotation.Value("${qdrant.host:localhost}") String qdrantHost,
            @org.springframework.beans.factory.annotation.Value("${qdrant.port:6334}") int qdrantPort,
            @org.springframework.beans.factory.annotation.Value("${qdrant.api-key:}") String qdrantApiKey,
            @org.springframework.beans.factory.annotation.Value("${qdrant.use-tls:false}") boolean qdrantUseTls,
            @org.springframework.beans.factory.annotation.Value("${embedding.dimension:768}") int qdrantDimension) {
        this.embeddingService = embeddingService;
        this.qdrantHost = qdrantHost;
        this.qdrantPort = qdrantPort;
        this.qdrantApiKey = qdrantApiKey;
        this.qdrantUseTls = qdrantUseTls;
        this.qdrantDimension = qdrantDimension;
        
        var grpcBuilder = io.qdrant.client.QdrantGrpcClient.newBuilder(qdrantHost, qdrantPort, qdrantUseTls);
        if (qdrantApiKey != null && !qdrantApiKey.isBlank()) {
            grpcBuilder.withApiKey(qdrantApiKey);
        }
        
        // Ensure the Qdrant collection exists before initializing QdrantEmbeddingStore
        try (io.qdrant.client.QdrantClient client = new io.qdrant.client.QdrantClient(grpcBuilder.build())) {
            String collectionName = "medical_docs";
            try {
                client.createCollectionAsync(
                        collectionName,
                        io.qdrant.client.grpc.Collections.VectorParams.newBuilder()
                                .setDistance(io.qdrant.client.grpc.Collections.Distance.Cosine)
                                .setSize(qdrantDimension)
                                .build()
                ).get();
            } catch (Exception e) {
                // Ignore if it already exists or fails due to existence
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Qdrant collection", e);
        }

        this.embeddingStore = new CustomQdrantEmbeddingStore(qdrantHost, qdrantPort, qdrantApiKey, qdrantUseTls, "medical_docs");
    }

    public List<TextSegment> retrieve(String query, int maxResults, double minScore) {
        Embedding queryEmbedding = embeddingService.getEmbeddingModel().embed(query).content();
        
        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(maxResults)
                .minScore(minScore)
                .build();

        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(searchRequest);
        
        return searchResult.matches().stream()
                .map(EmbeddingMatch::embedded)
                .collect(Collectors.toList());
    }

    public void clearCollection() {
        var grpcBuilder = io.qdrant.client.QdrantGrpcClient.newBuilder(qdrantHost, qdrantPort, qdrantUseTls);
        if (qdrantApiKey != null && !qdrantApiKey.isBlank()) {
            grpcBuilder.withApiKey(qdrantApiKey);
        }
        
        try (io.qdrant.client.QdrantClient client = new io.qdrant.client.QdrantClient(grpcBuilder.build())) {
            String collectionName = "medical_docs";
            try {
                client.deleteCollectionAsync(collectionName).get();
            } catch (Exception e) {
                // Ignore if it doesn't exist
            }
            client.createCollectionAsync(
                    collectionName,
                    io.qdrant.client.grpc.Collections.VectorParams.newBuilder()
                            .setDistance(io.qdrant.client.grpc.Collections.Distance.Cosine)
                            .setSize(qdrantDimension)
                            .build()
            ).get();
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear Qdrant collection", e);
        }
    }

    public EmbeddingStore<TextSegment> getEmbeddingStore() {
        return this.embeddingStore;
    }
}
