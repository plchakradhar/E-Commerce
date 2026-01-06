import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { authAPI } from '../../utils/api';
import { generateVerificationCode } from '../../utils/helpers';
import '../../styles/components/AuthModal.css';
import LoginForm from './Auth/LoginForm';
import SignupForm from './Auth/SignupForm';
import ForgotPasswordForm from './Auth/ForgotPasswordForm';

const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultAction = null,
  showCloseButton = true
}) => {
  const [isLogin, setIsLogin] = useState(defaultAction === 'signup' ? false : true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [formData, setFormData] = useState({
    fullName: "", username: "", email: "", mobile: "", password: "", verificationCode: "", referralCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "", otp: "", newPassword: "", confirmPassword: ""
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultAction === 'signup' ? false : true);
      setShowForgotPassword(false);
      setForgotPasswordStep(1);
      setErrorMessage("");
      setLoginData({ identifier: "", password: "" });
      setFormData({ fullName: "", username: "", email: "", mobile: "", password: "", verificationCode: "", referralCode: "" });
      setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setCodeSent(false);
      setCodeVerified(false);
      setCountdown(0);
    }
  }, [isOpen, defaultAction]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleVerificationCode = () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      setErrorMessage("Enter a valid 10-digit mobile number");
      return;
    }

    const code = generateVerificationCode();
    setGeneratedCode(code);
    setCodeSent(true);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    alert(`Your verification code is: ${code}`);
  };

  const handleVerifyCode = () => {
    if (formData.verificationCode === generatedCode) {
      setCodeVerified(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid code, try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!codeVerified) {
      setErrorMessage("Verify code first!");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await authAPI.signup({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        referredBy: formData.referralCode || null
      });

      if (res.data.status === "success") {
        alert(res.data.message);

        // Call onLoginSuccess and close modal immediately
        if (onLoginSuccess) {
          onLoginSuccess(res.data.data);
        }
        onClose(); // Close modal immediately
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Server error, try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      setErrorMessage("Enter username/email/mobile and password");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await authAPI.login({
        identifier: loginData.identifier,
        password: loginData.password
      });

      if (res.data.status === "success") {
        // Check if user is admin and redirect accordingly
        const userData = res.data.data;

        // Call onLoginSuccess and close modal immediately
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }

        // Close modal first
        onClose();

        // Then redirect based on user role
        if (userData && userData.isAdmin) {
          // Redirect to admin page
          window.location.href = "/adminpage";
        } else {
          // Redirect to regular user page
          window.location.href = "/";
        }
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(1);
    setErrorMessage("");
  };

  const handleSendOTP = async () => {
    if (!forgotPasswordData.email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.sendResetOTP({ email: forgotPasswordData.email });

      if (response.data.status === "success") {
        setForgotPasswordStep(2);
        setCountdown(300);

        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrorMessage(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!forgotPasswordData.otp) {
      setErrorMessage("Please enter OTP");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.verifyResetOTP({
        email: forgotPasswordData.email,
        otp: forgotPasswordData.otp
      });

      if (response.data.status === "success") {
        setForgotPasswordStep(3);
      } else {
        setErrorMessage(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.resetPassword({
        email: forgotPasswordData.email,
        newPassword: forgotPasswordData.newPassword,
        confirmPassword: forgotPasswordData.confirmPassword
      });

      if (response.data.status === "success") {
        alert("Password reset successfully!");
        setShowForgotPassword(false);
        setIsLogin(true);
        setForgotPasswordStep(1);
        setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setIsLogin(true);
    setForgotPasswordStep(1);
    setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    setErrorMessage("");
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button className="auth-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        )}

        {!showForgotPassword ? (
          <>
            <div className="auth-modal-header">
              <h2>{isLogin ? "Welcome Back!" : "Join Mascle"}</h2>
              <p>{isLogin ? "Sign in to your account" : "Create your fashion account"}</p>
            </div>

            <div className="auth-modal-tabs">
              <button
                className={`auth-tab ${isLogin ? "active" : ""}`}
                onClick={() => {
                  setIsLogin(true);
                  setErrorMessage("");
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${!isLogin ? "active" : ""}`}
                onClick={() => {
                  setIsLogin(false);
                  setErrorMessage("");
                }}
              >
                Create Account
              </button>
            </div>

            {errorMessage && <div className="auth-error-message">{errorMessage}</div>}

            {isLogin ? (
              <LoginForm
                loginData={loginData}
                handleLoginChange={handleLoginChange}
                handleLogin={handleLogin}
                loading={loading}
                showLoginPassword={showLoginPassword}
                setShowLoginPassword={setShowLoginPassword}
                handleForgotPassword={handleForgotPassword}
                setIsLogin={setIsLogin}
              />
            ) : (
              <SignupForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSignup={handleSignup}
                loading={loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleVerificationCode={handleVerificationCode}
                handleVerifyCode={handleVerifyCode}
                codeSent={codeSent}
                codeVerified={codeVerified}
                countdown={countdown}
                setIsLogin={setIsLogin}
              />
            )}
          </>
        ) : (
          <ForgotPasswordForm
            forgotPasswordData={forgotPasswordData}
            handleForgotPasswordChange={handleForgotPasswordChange}
            handleSendOTP={handleSendOTP}
            handleVerifyOTP={handleVerifyOTP}
            handleResetPassword={handleResetPassword}
            loading={loading}
            forgotPasswordStep={forgotPasswordStep}
            countdown={countdown}
            handleBackToLogin={handleBackToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;