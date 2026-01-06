import React from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const ForgotPasswordForm = ({
    forgotPasswordData,
    handleForgotPasswordChange,
    handleSendOTP,
    handleVerifyOTP,
    handleResetPassword,
    loading,
    forgotPasswordStep,
    countdown,
    handleBackToLogin
}) => {
    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="forgot-password-form">
            <div className="forgot-password-header">
                <h2>Reset Password</h2>
                <p>Follow the steps to reset your password</p>
            </div>

            {forgotPasswordStep === 1 && (
                <div className="forgot-password-step">
                    <div className="form-group with-icon">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={forgotPasswordData.email}
                            onChange={handleForgotPasswordChange}
                            required
                        />
                    </div>
                    <button
                        className="auth-submit-btn"
                        onClick={handleSendOTP}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                    <button
                        className="back-to-login-btn"
                        onClick={handleBackToLogin}
                    >
                        Back to Login
                    </button>
                </div>
            )}

            {forgotPasswordStep === 2 && (
                <div className="forgot-password-step">
                    <div className="form-group with-icon">
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={forgotPasswordData.otp}
                            onChange={handleForgotPasswordChange}
                            required
                            maxLength="6"
                        />
                    </div>
                    {countdown > 0 && (
                        <div className="otp-timer">
                            OTP expires in: {formatCountdown(countdown)}
                        </div>
                    )}
                    <button
                        className="auth-submit-btn"
                        onClick={handleVerifyOTP}
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                        className="resend-otp-btn"
                        onClick={handleSendOTP}
                        disabled={countdown > 0}
                    >
                        Resend OTP {countdown > 0 && `(${countdown}s)`}
                    </button>
                </div>
            )}

            {forgotPasswordStep === 3 && (
                <div className="forgot-password-step">
                    <div className="form-group with-icon password-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="New Password"
                            value={forgotPasswordData.newPassword}
                            onChange={handleForgotPasswordChange}
                            required
                        />
                    </div>
                    <div className="form-group with-icon password-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={forgotPasswordData.confirmPassword}
                            onChange={handleForgotPasswordChange}
                            required
                        />
                    </div>
                    <button
                        className="auth-submit-btn"
                        onClick={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordForm;
