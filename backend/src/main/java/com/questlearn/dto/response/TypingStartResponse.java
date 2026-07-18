package com.questlearn.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class TypingStartResponse {
    private Long sessionId;
    private List<String> words;
    private int totalWords;
    private String level;
    private String duniaNama;
    private Long duniaId;
}
