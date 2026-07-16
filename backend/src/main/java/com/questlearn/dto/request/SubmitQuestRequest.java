package com.questlearn.dto.request;
import lombok.Data;
import java.util.List;
@Data
public class SubmitQuestRequest {
    private Long levelId;
    private List<JawabanItem> jawaban;
    @Data
    public static class JawabanItem {
        private Long soalId;
        private String jawabanUser;
    }
}
