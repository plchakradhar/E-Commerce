import React from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = ({
    loginData,
    handleLoginChange,
    handleLogin,
    loading,
    showLoginPassword,
    setShowLoginPassword,
    handleForgotPassword,
    setIsLogin
}) => {
    return (
        <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group with-icon">
                <FaUser className="input-icon" />
                <input
                    type="text"
                    name="identifier"
                    placeholder="Username, Email or Mobile"
                    value={loginData.identifier}
                    onChange={handleLoginChange}
                    required
                />
            </div>

            <div className="form-group with-icon password-group">
                <FaLock className="input-icon" />
                <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    "Sign In"
                )}
            </button>

            <div className="auth-options">
                <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
                    Forgot Password?
                </button>
            </div>

            <div className="auth-switch">
                Don't have an account?
                <button type="button" onClick={() => setIsLogin(false)}>
                    Sign Up
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
