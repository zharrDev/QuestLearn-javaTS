package com.questlearn.service;

import com.questlearn.dto.request.SubmitTypingRequest;
import com.questlearn.dto.response.TypingSessionResponse;
import com.questlearn.dto.response.TypingStartResponse;
import com.questlearn.dto.response.LeaderboardEntry;

import java.util.List;

public interface TypingService {
    TypingStartResponse startSession(Long userId, Long duniaId, String level);
    TypingSessionResponse submitSession(Long userId, SubmitTypingRequest request);
    List<TypingSessionResponse> getUserSessions(Long userId);
    List<LeaderboardEntry> getLeaderboard(Long duniaId);
}
