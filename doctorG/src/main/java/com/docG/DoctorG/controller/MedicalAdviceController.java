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
    private final com.docG.DoctorG.repository.UploadedDocumentRepository uploadedDocumentRepository;
    private final com.docG.DoctorG.repository.UserRepository userRepository;

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
    public ResponseEntity<ApiResponse<String>> uploadDocument(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Please select a file to upload")
                            .build()
            );
        }
        try {
            org.springframework.security.core.Authentication authentication = 
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(
                        ApiResponse.<String>builder()
                                .success(false)
                                .message("Unauthorized - User session not found")
                                .build()
                );
            }
            String email = authentication.getName();
            com.docG.DoctorG.entity.User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Logged in user details not found"));

            // Process ingestion
            documentLoader.ingestDocument(file.getOriginalFilename(), file.getInputStream());

            // Save metadata
            com.docG.DoctorG.entity.UploadedDocument uploadedDoc = com.docG.DoctorG.entity.UploadedDocument.builder()
                    .title(title)
                    .description(description)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .uploadedAt(java.time.LocalDateTime.now())
                    .uploadedBy(user)
                    .build();
            uploadedDocumentRepository.save(uploadedDoc);

            return ResponseEntity.ok(
                    ApiResponse.<String>builder()
                            .success(true)
                            .message("Document \"" + title + "\" uploaded and ingested successfully")
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

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<java.util.List<com.docG.DoctorG.entity.UploadedDocument>>> getUploadedDocuments() {
        try {
            java.util.List<com.docG.DoctorG.entity.UploadedDocument> docs = uploadedDocumentRepository.findAll();
            return ResponseEntity.ok(
                    ApiResponse.<java.util.List<com.docG.DoctorG.entity.UploadedDocument>>builder()
                            .success(true)
                            .message("Uploaded documents fetched successfully")
                            .data(docs)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    ApiResponse.<java.util.List<com.docG.DoctorG.entity.UploadedDocument>>builder()
                            .success(false)
                            .message("Failed to fetch documents: " + e.getMessage())
                            .build()
            );
        }
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDocument(@PathVariable Long id) {
        try {
            if (!uploadedDocumentRepository.existsById(id)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(
                        ApiResponse.<String>builder()
                                .success(false)
                                .message("Document not found")
                                .build()
                );
            }
            uploadedDocumentRepository.deleteById(id);
            return ResponseEntity.ok(
                    ApiResponse.<String>builder()
                            .success(true)
                            .message("Document metadata deleted successfully")
                            .data("Deleted")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Failed to delete document: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearDatabase() {
        try {
            documentLoader.clearDatabase();
            // Optional: clear sql records as well
            uploadedDocumentRepository.deleteAll();
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
