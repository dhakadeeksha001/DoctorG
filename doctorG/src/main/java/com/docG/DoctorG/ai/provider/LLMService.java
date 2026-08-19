package com.docG.DoctorG.ai.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

public class LLMService {

    private static final Logger log = LoggerFactory.getLogger(LLMService.class);

    private final LLMProvider localProvider;
    private final LLMProvider groqProvider;
    private final long cacheTtlMs;

    private final AtomicBoolean cachedLocalAvailable = new AtomicBoolean(false);
    private final AtomicLong lastCheckTimestamp = new AtomicLong(0);
    private String lastLoggedProvider = "";

    public LLMService(LLMProvider localProvider, LLMProvider groqProvider, long cacheTtlSeconds) {
        this.localProvider = localProvider;
        this.groqProvider = groqProvider;
        this.cacheTtlMs = cacheTtlSeconds * 1000L;
    }

    public LLMService(LLMProvider localProvider, LLMProvider groqProvider) {
        this(localProvider, groqProvider, 30);
    }

    public LLMProvider getActiveProvider() {
        boolean isLocalAvailable = isLocalLLMAvailable();
        if (isLocalAvailable) {
            logProviderSelection("LOCAL");
            return localProvider;
        } else {
            logProviderSelection("GROQ");
            return groqProvider;
        }
    }

    public boolean isLocalLLMAvailable() {
        long now = System.currentTimeMillis();
        if (now - lastCheckTimestamp.get() > cacheTtlMs) {
            synchronized (this) {
                if (now - lastCheckTimestamp.get() > cacheTtlMs) {
                    boolean available = localProvider != null && localProvider.isAvailable();
                    cachedLocalAvailable.set(available);
                    lastCheckTimestamp.set(now);
                }
            }
        }
        return cachedLocalAvailable.get();
    }

    public void markLocalUnavailable() {
        cachedLocalAvailable.set(false);
        lastCheckTimestamp.set(System.currentTimeMillis());
        log.warn("Local LLM provider marked as temporarily unavailable due to request execution failure.");
    }

    private void logProviderSelection(String providerType) {
        if (!providerType.equals(lastLoggedProvider)) {
            if ("LOCAL".equals(providerType)) {
                log.info("LLM provider selected: LOCAL");
            } else {
                log.warn("Local LLM unavailable. Falling back to GROQ.");
            }
            lastLoggedProvider = providerType;
        }
    }

    public LLMProvider getLocalProvider() {
        return localProvider;
    }

    public LLMProvider getGroqProvider() {
        return groqProvider;
    }
}
