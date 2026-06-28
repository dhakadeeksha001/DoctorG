package com.docG.DoctorG.ai.rag.retriever;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.*;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.WithVectorsSelectorFactory;
import io.qdrant.client.WithPayloadSelectorFactory;
import io.qdrant.client.grpc.Points.ScoredPoint;
import io.qdrant.client.grpc.Points.SearchPoints;
import io.qdrant.client.grpc.Points.Vector;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CustomQdrantEmbeddingStore implements EmbeddingStore<TextSegment> {

    private final QdrantEmbeddingStore delegate;
    private final String host;
    private final int port;
    private final String collectionName;

    public CustomQdrantEmbeddingStore(String host, int port, String collectionName) {
        this.host = host;
        this.port = port;
        this.collectionName = collectionName;
        this.delegate = QdrantEmbeddingStore.builder()
                .host(host)
                .port(port)
                .collectionName(collectionName)
                .build();
    }

    @Override
    public String add(Embedding embedding) {
        return delegate.add(embedding);
    }

    @Override
    public void add(String id, Embedding embedding) {
        delegate.add(id, embedding);
    }

    @Override
    public String add(Embedding embedding, TextSegment textSegment) {
        return delegate.add(embedding, textSegment);
    }

    @Override
    public List<String> addAll(List<Embedding> embeddings) {
        return delegate.addAll(embeddings);
    }

    @Override
    public List<String> addAll(List<Embedding> embeddings, List<TextSegment> textSegments) {
        return delegate.addAll(embeddings, textSegments);
    }

    @Override
    public EmbeddingSearchResult<TextSegment> search(EmbeddingSearchRequest request) {
        try (QdrantClient client = new QdrantClient(
                QdrantGrpcClient.newBuilder(host, port, false).build()
        )) {
            SearchPoints searchPoints = SearchPoints.newBuilder()
                    .setCollectionName(collectionName)
                    .addAllVector(request.queryEmbedding().vectorAsList())
                    .setLimit(request.maxResults())
                    .setWithVectors(WithVectorsSelectorFactory.enable(true))
                    .setWithPayload(WithPayloadSelectorFactory.enable(true))
                    .build();

            List<ScoredPoint> points = client.searchAsync(searchPoints).get();

            List<EmbeddingMatch<TextSegment>> matches = new ArrayList<>();
            for (ScoredPoint point : points) {
                // Map the payload to TextSegment
                String text = "";
                if (point.getPayloadMap().containsKey("text_segment")) {
                    text = point.getPayloadMap().get("text_segment").getStringValue();
                } else if (point.getPayloadMap().containsKey("text")) {
                    text = point.getPayloadMap().get("text").getStringValue();
                } else {
                    text = point.getPayloadMap().values().stream()
                            .map(v -> v.getStringValue())
                            .filter(s -> s != null && !s.isEmpty())
                            .findFirst()
                            .orElse("");
                }
                
                if (text == null || text.trim().isEmpty()) {
                    text = "[Empty Segment]";
                }
                TextSegment segment = TextSegment.from(text);

                // Extract vector
                List<Float> floatList = null;
                if (point.hasVectors()) {
                    if (point.getVectors().hasVector()) {
                        floatList = point.getVectors().getVector().getDataList();
                    } else if (point.getVectors().hasVectors()) {
                        Map<String, Vector> map = point.getVectors().getVectors().getVectorsMap();
                        if (map.containsKey("")) {
                            floatList = map.get("").getDataList();
                        } else if (!map.isEmpty()) {
                            floatList = map.values().iterator().next().getDataList();
                        }
                    }
                }

                Embedding embedding = null;
                if (floatList != null && !floatList.isEmpty()) {
                    float[] vector = new float[floatList.size()];
                    for (int i = 0; i < floatList.size(); i++) {
                        vector[i] = floatList.get(i);
                    }
                    embedding = Embedding.from(vector);
                }

                double score = point.getScore();
                String id = point.getId().hasUuid() ? point.getId().getUuid() : String.valueOf(point.getId().getNum());
                matches.add(new EmbeddingMatch<>(score, id, embedding, segment));
            }

            // Filter by minScore
            matches = matches.stream()
                    .filter(m -> m.score() >= request.minScore())
                    .collect(Collectors.toList());

            return new EmbeddingSearchResult<>(matches);

        } catch (Exception e) {
            throw new RuntimeException("Custom Qdrant search failed", e);
        }
    }
}
