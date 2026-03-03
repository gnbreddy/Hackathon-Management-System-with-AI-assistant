package com.example.ehub.services;

import com.example.ehub.models.Submission;
import com.example.ehub.models.SubmissionStatus;
import com.example.ehub.repositories.SubmissionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final SubmissionRepository submissionRepository;
    private final WebClient webClient;

    public AiService(SubmissionRepository submissionRepository, WebClient.Builder webClientBuilder) {
        this.submissionRepository = submissionRepository;
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    @Async // Runs in background so it doesn't block the API
    public void evaluateSubmission(Submission submission) {
        String prompt = "Evaluate this hackathon project repository: " + submission.getGithubUrl() + 
                        ". Reply strictly in this format: Score: [1-100] | Summary: [1 sentence overview]";

        // Construct the Gemini API request body
        String requestBody = """
            { "contents": [{ "parts": [{"text": "%s"}] }] }
            """.formatted(prompt);

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Minimal parsing for MVP (In production, use a JSON library like Jackson)
            int score = parseScore(response);
            String summary = parseSummary(response);

            submission.setAiScore(score);
            submission.setAiSummary(summary);
            submission.setStatus(SubmissionStatus.EVALUATED);
            submissionRepository.save(submission);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private int parseScore(String response) {
        // Mocked parsing logic for brevity
        return 85; 
    }

    private String parseSummary(String response) {
         // Mocked parsing logic for brevity
        return "Solid implementation of the requested features with good architecture.";
    }
}