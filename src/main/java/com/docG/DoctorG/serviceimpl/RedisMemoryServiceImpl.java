package com.docG.DoctorG.serviceimpl;

import com.docG.DoctorG.service.RedisMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RedisMemoryServiceImpl implements RedisMemoryService {

    private final StringRedisTemplate redisTemplate;

    @Override
    public void appendUserMessage(String sessionId, String message) {

        redisTemplate.opsForList()
                .rightPush("chat:" + sessionId,
                        "USER: " + message);
    }

    @Override
    public void appendAssistantMessage(String sessionId, String message) {

        redisTemplate.opsForList()
                .rightPush("chat:" + sessionId,
                        "AI: " + message);
    }

    @Override
    public List<String> getConversation(String sessionId) {

        return redisTemplate.opsForList()
                .range("chat:" + sessionId, 0, -1);
    }

    @Override
    public void clearConversation(String sessionId) {

        redisTemplate.delete("chat:" + sessionId);
    }
}