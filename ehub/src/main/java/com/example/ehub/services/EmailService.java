package com.example.ehub.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:noreply@ehub.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String toEmail, String otp) {
        System.out.println("TESTING OTP FOR " + toEmail + ": " + otp);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("EHub — Your OTP Verification Code");
            message.setText(
                    "Welcome to EHub!\n\n" +
                            "Your one-time password (OTP) is: " + otp + "\n\n" +
                            "This code is valid for 60 minutes.\n" +
                            "Do NOT share this code with anyone.\n\n" +
                            "— The EHub Team");
            mailSender.send(message);
            System.out.println("[EmailService] OTP email sent to: " + toEmail);
        } catch (Exception e) {
            // If email is not configured, fall back to console logging so dev can test
            System.out.println("[EmailService] FALLBACK - OTP for " + toEmail + " is: " + otp + " (email send failed: "
                    + e.getMessage() + ")");
        }
    }
}
