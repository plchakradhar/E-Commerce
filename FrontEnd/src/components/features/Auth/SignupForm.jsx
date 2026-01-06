import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheck, FaGift } from 'react-icons/fa';

const SignupForm = ({
    formData,
    handleInputChange,
    handleSignup,
    loading,
    showPassword,
    setShowPassword,
    handleVerificationCode,
    handleVerifyCode,
    codeSent,
    codeVerified,
    countdown,
    setIsLogin
}) => {
    return (
        <div className="scrollable-form-container">
            <form
                className="auth-form scrollable-form"
                onSubmit={handleSignup}
            >
                <div className="form-section">
                    <h4>Personal Information</h4>
                    <div className="form-group with-icon">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group with-icon">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h4>Contact Details</h4>
                    <div className="form-group with-icon">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group with-icon mobile-group">
                        <FaPhone className="input-icon" />
                        <input
                            type="text"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            required
                            maxLength="10"
                        />
                        <button
                            type="button"
                            className="otp-send-btn"
                            onClick={handleVerificationCode}
                            disabled={!formData.mobile || formData.mobile.length !== 10 || countdown > 0}
                        >
                            {countdown > 0 ? `${countdown}s` : "Get Code"}
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Security</h4>
                    <div className="form-group with-icon password-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password (min 6 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Verification</h4>
                    <div className="form-group with-icon">
                        <FaCheck className="input-icon" />
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="Enter Verification Code"
                            value={formData.verificationCode}
                            onChange={handleInputChange}
                            required
                            disabled={!codeSent}
                            maxLength="4"
                        />
                        <button
                            type="button"
                            className="verify-code-btn"
                            onClick={handleVerifyCode}
                            disabled={!formData.verificationCode}
                        >
                            Verify
                        </button>
                    </div>

                    {codeVerified && (
                        <div className="verification-success">
                            <FaCheck />
                            <span>Phone number verified successfully</span>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h4>Bonus (Optional)</h4>
                    <div className="form-group with-icon">
                        <FaGift className="input-icon" />
                        <input
                            type="text"
                            name="referralCode"
                            placeholder="Referral Code"
                            value={formData.referralCode}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={!codeVerified || loading}
                >
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <div className="auth-switch">
                Already have an account?
                <button type="button" onClick={() => setIsLogin(true)}>
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default SignupForm;
