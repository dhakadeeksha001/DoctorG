package com.docG.DoctorG.ai.rag.ingestion;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import java.io.InputStream;

@Service
public class PdfParserService {

    public String parsePdf(InputStream inputStream) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            try (PDDocument document = Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse PDF", e);
        }
    }
}
