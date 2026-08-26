package com.example.ehub.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async("taskExecutor")
    public void sendOtpEmail(String toEmail, String otpCode) {
        logger.info("=================================================");
        logger.info("🔐 [EHub OTP VERIFICATION]");
        logger.info("📨 Recipient: {}", toEmail);
        logger.info("🔑 Verification Code: {}", otpCode);
        logger.info("⏳ Valid for: 10 minutes");
        logger.info("=================================================");

        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("EHub Hackathon — Your Verification OTP");
                message.setText(
                    "Hello,\n\n" +
                    "Your EHub one-time verification code is: " + otpCode + "\n\n" +
                    "This code will expire in 10 minutes. If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "EHub Hackathon Platform Team"
                );
                mailSender.send(message);
                logger.info("Successfully dispatched OTP email to {}", toEmail);
            } catch (Exception e) {
                logger.warn("Could not dispatch SMTP email to {} (logged code to console instead): {}", toEmail, e.getMessage());
            }
        }
    }
}
