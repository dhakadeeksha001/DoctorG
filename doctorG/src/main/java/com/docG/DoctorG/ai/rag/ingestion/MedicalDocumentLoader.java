package com.docG.DoctorG.ai.rag.ingestion;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.data.embedding.Embedding;
import com.docG.DoctorG.ai.rag.retriever.RetrieverService;
import com.docG.DoctorG.ai.rag.service.EmbeddingService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class MedicalDocumentLoader {

    private final PdfParserService pdfParserService;
    private final EmbeddingService embeddingService;
    private final RetrieverService retrieverService;

    public MedicalDocumentLoader(PdfParserService pdfParserService,
                                 EmbeddingService embeddingService,
                                 RetrieverService retrieverService) {
        this.pdfParserService = pdfParserService;
        this.embeddingService = embeddingService;
        this.retrieverService = retrieverService;
    }

    public void ingestDocuments() {
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:medical-docs/*.pdf");
            
            List<Document> documents = new ArrayList<>();
            for (Resource resource : resources) {
                try (InputStream inputStream = resource.getInputStream()) {
                    String parsedText = pdfParserService.parsePdf(inputStream);
                    if (parsedText != null && !parsedText.trim().isEmpty()) {
                        Document document = Document.from(parsedText);
                        document.metadata().put("source", resource.getFilename());
                        documents.add(document);
                    } else {
                        System.out.println("Warning: Skipping " + resource.getFilename() + " as no text could be extracted.");
                    }
                }
            }

            if (documents.isEmpty()) {
                throw new RuntimeException("No valid PDF documents with extractable text found in medical-docs folder.");
            }

            // Split into segments
            DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
            List<TextSegment> segments = new ArrayList<>();
            for (Document doc : documents) {
                segments.addAll(splitter.split(doc));
            }

            // Embed segments
            List<Embedding> embeddings = embeddingService.getEmbeddingModel().embedAll(segments).content();

            // Store in Qdrant
            retrieverService.getEmbeddingStore().addAll(embeddings, segments);
            
        } catch (Exception e) {
            throw new RuntimeException("Ingestion pipeline failed", e);
        }
    }

    public void ingestDocument(String filename, InputStream inputStream) {
        try {
            String parsedText = pdfParserService.parsePdf(inputStream);
            if (parsedText == null || parsedText.trim().isEmpty()) {
                throw new IllegalArgumentException("No text could be extracted from " + filename);
            }

            Document document = Document.from(parsedText);
            document.metadata().put("source", filename);

            // Split into segments
            DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
            List<TextSegment> segments = splitter.split(document);

            // Embed segments
            List<Embedding> embeddings = embeddingService.getEmbeddingModel().embedAll(segments).content();

            // Store in Qdrant
            retrieverService.getEmbeddingStore().addAll(embeddings, segments);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Single document ingestion failed for: " + filename, e);
        }
    }

    public void clearDatabase() {
        retrieverService.clearCollection();
    }
}
