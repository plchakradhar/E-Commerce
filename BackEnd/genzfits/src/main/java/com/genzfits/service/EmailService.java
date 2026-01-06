package com.genzfits.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendOtpEmail(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Password Reset OTP - GenZFits");

            String htmlContent = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<style>" +
                    "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }" +
                    ".container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                    ".header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }" +
                    ".otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border: 2px dashed #2563eb; border-radius: 10px; }" +
                    ".footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }" +
                    ".warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +
                    "<div class='header'>" +
                    "<h1>🔐 GenZFits</h1>" +
                    "<h2>Password Reset OTP</h2>" +
                    "</div>" +
                    "<p>Hello,</p>" +
                    "<p>You requested to reset your password for your GenZFits account. Use the OTP below to proceed:</p>" +
                    "<div class='otp-code'>" + otp + "</div>" +
                    "<div class='warning'>" +
                    "<strong>⚠️ Important:</strong> This OTP is valid for <strong>5 minutes only</strong>. Do not share this code with anyone." +
                    "</div>" +
                    "<p>If you didn't request this password reset, please ignore this email or contact our support team.</p>" +
                    "<div class='footer'>" +
                    "<p>Best regards,<br><strong>GenZFits Team</strong></p>" +
                    "<p>Fashion for the new generation</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

            logger.info("OTP email sent successfully to: {}", email);
            return true;

        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to {}. MessagingException: {}", email, e.getMessage(), e);
            return sendSimpleOtpEmail(email, otp);
        } catch (Exception e) {
            logger.error("Unexpected error sending OTP email to {}. Exception: {}", email, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendSimpleOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset OTP - GenZFits");
            message.setText(
                    "Password Reset Request\n\n" +
                    "Your OTP for password reset is: " + otp + "\n\n" +
                    "This OTP is valid for 5 minutes.\n\n" +
                    "If you didn't request this, please ignore this email or contact our support team.\n\n" +
                    "Best regards,\nGenZFits Team"
            );

            mailSender.send(message);
            logger.info("Simple OTP email sent to: {}", email);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send simple OTP email to {}. Exception: {}", email, e.getMessage(), e);
            return false;
        }
    }
}