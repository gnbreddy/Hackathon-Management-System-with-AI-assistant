package com.example.ehub.services;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
        logger.info("🔐 [EHub OTP DISPATCH]");
        logger.info("📨 Recipient: {}", toEmail);
        logger.info("🔑 Verification Code: {}", otpCode);
        logger.info("⏳ Valid for: 10 minutes");
        logger.info("=================================================");

        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

                helper.setFrom(fromEmail, "EHub Hackathon Platform");
                helper.setTo(toEmail);
                helper.setSubject("🔐 EHub Verification Code: " + otpCode);

                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
                        .card { max-width: 500px; margin: 20px auto; background: #131b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center; }
                        .badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
                        h1 { font-size: 24px; color: #ffffff; margin-bottom: 8px; }
                        p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
                        .otp-box { font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #38bdf8; background: #070a12; padding: 18px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.3); margin: 24px 0; }
                        .footer { font-size: 11px; color: #64748b; margin-top: 24px; }
                      </style>
                    </head>
                    <body>
                      <div class="card">
                        <div class="badge">EHub Verification</div>
                        <h1>Verify Your Email</h1>
                        <p>Use the 6-digit one-time code below to complete your EHub Hackathon registration:</p>
                        <div class="otp-box">%s</div>
                        <p>This code will expire in <strong>10 minutes</strong>. If you did not request this registration, you can safely disregard this message.</p>
                        <div class="footer">EHub Autonomous Hackathon Platform • Automated Notification</div>
                      </div>
                    </body>
                    </html>
                    """.formatted(otpCode);

                helper.setText(htmlContent, true);
                mailSender.send(mimeMessage);
                logger.info("✅ Successfully delivered OTP email to {}", toEmail);
            } catch (Exception e) {
                logger.error("❌ Failed to send SMTP email to {}: {}", toEmail, e.getMessage());
            }
        } else {
            logger.warn("⚠️ SMTP credentials not configured (SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD are empty). OTP printed to console.");
        }
    }
}
