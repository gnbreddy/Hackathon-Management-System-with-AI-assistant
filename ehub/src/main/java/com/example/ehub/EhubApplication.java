package com.example.ehub;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
public class EhubApplication {

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(EhubApplication.class, args);
    }

    // Add this bean so AiService can use it to call the Gemini API
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}