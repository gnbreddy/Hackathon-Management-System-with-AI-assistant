package com.example.ehub.services;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;
import com.example.ehub.repositories.SubmissionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final SubmissionRepository submissionRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AiService(SubmissionRepository submissionRepository, WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    @Async
    public void evaluateSubmission(Submission submission) {
        String prompt = "Evaluate this hackathon project: " + submission.getGithubUrl() + 
                        ". Reply exactly in this format: Score: [number] | Summary: [text]";

        // FIX 1: Use a Map for the request body to ensure proper JSON escaping
        Map<String, Object> body = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", prompt)
                })
            }
        );

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            
            // FIX 2: Safe navigation with path() and has()
            JsonNode candidates = root.path("candidates");
            if (!candidates.has(0)) {
                throw new RuntimeException("No AI candidates returned (likely blocked or API error)");
            }

            String aiText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();

            // FIX 3: Robust string splitting and parsing
            if (!aiText.contains("|")) {
                throw new RuntimeException("AI response format invalid: " + aiText);
            }

            String[] parts = aiText.split("\\|");
            int score = 0;
            try {
                score = Integer.parseInt(parts[0].replaceAll("[^0-9]", "").trim());
            } catch (NumberFormatException nfe) {
                score = 50; // Fallback score
            }

            String summary = (parts.length > 1) ? parts[1].replace("Summary:", "").trim() : "No summary provided.";

            submission.setAiScore(score);
            submission.setAiSummary(summary);
            submission.setStatus(SubmissionStatus.EVALUATED);
            submissionRepository.save(submission);

        } catch (Exception e) {
            // FIX 4: Update status to allow the user to see that evaluation failed
            System.err.println("AI Evaluation failed: " + e.getMessage());
            submission.setAiSummary("Evaluation failed: " + e.getMessage());
            submission.setStatus(SubmissionStatus.PENDING); // Or create a FAILED status
            submissionRepository.save(submission);
        }
    }
}