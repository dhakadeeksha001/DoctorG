package com.docG.DoctorG.agent;

import com.docG.DoctorG.ai.rag.prompt.SymptomCollectionPrompt;
import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface SymptomCollectionAgent {

   @SystemMessage(SymptomCollectionPrompt.SYSTEM_PROMPT)

   String chat(
         @MemoryId String sessionId,
         @UserMessage String userMessage);
}