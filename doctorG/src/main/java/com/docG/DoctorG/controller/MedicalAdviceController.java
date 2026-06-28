package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.MedicalAdviceRequest;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.ai.rag.ingestion.MedicalDocumentLoader;
import com.docG.DoctorG.ai.rag.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medical-advice")
@RequiredArgsConstructor
public class MedicalAdviceController {

    private final RagService ragService;
    private final MedicalDocumentLoader documentLoader;

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<String>> queryAdvice(@RequestBody MedicalAdviceRequest request) {
        String advice = ragService.generateHomeCareAdvice(request.getQuery());
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("Home care advice retrieved successfully")
                        .data(advice)
                        .build()
        );
    }

    @PostMapping("/ingest")
    public ResponseEntity<ApiResponse<String>> ingestDocuments() {
        documentLoader.ingestDocuments();
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("Medical documents ingested successfully into vector database")
                        .data("Ingestion completed")
                        .build()
        );
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadDocument(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Please select a file to upload")
                            .build()
            );
        }
        try {
            documentLoader.ingestDocument(file.getOriginalFilename(), file.getInputStream());
            return ResponseEntity.ok(
                    ApiResponse.<String>builder()
                            .success(true)
                            .message("Document " + file.getOriginalFilename() + " uploaded and ingested successfully")
                            .data("Ingestion completed")
                            .build()
            );
        } catch (Exception e) {
            String rootMsg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.internalServerError().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Failed to ingest document: " + rootMsg)
                            .build()
            );
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearDatabase() {
        try {
            documentLoader.clearDatabase();
            return ResponseEntity.ok(
                    ApiResponse.<String>builder()
                            .success(true)
                            .message("Vector database cleared successfully")
                            .data("Cleared")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Failed to clear database: " + e.getMessage())
                            .build()
            );
        }
    }
}
