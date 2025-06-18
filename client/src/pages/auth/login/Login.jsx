import "./login.scss";
import { useState } from "react";
import { Loader, Eye, EyeOff, LogIn } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// RTKQ
import { useLoginUserMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

function Login() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // RTKQ
  const [loginUser, { isLoading, isError, error }] = useLoginUserMutation();

  // Validate Email
  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isEmailValid()) {
      toast.error(t("Please enter a valid email address"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("Password must be at least 6 characters"));
      return;
    }

    try {
      const result = await loginUser({ email, password }).unwrap();
      navigate("/");
      toast.success(`${t("Welcome back")} ${result?.username || "User"}! 🎉`);
    } catch (error) {
      toast.error(error?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="welcome-icon">
              <LogIn size={48} />
            </div>
            <h1>{t("Welcome Back")}</h1>
            <p>{t("Sign in to your account to continue")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">{t("Email Address")}</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email")}
                  required
                  disabled={isLoading}
                  className={email && !isEmailValid() ? "invalid" : ""}
                />
              </div>
              {email && !isEmailValid() && (
                <span className="error-message">
                  {t("Please enter a valid email address")}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">{t("Password")}</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Enter your password")}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader className="loading-spinner" size={20} />
                  {t("Signing In")}...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {t("Sign In")}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              {t("Don't have an account?")}
              <NavLink to="/register" className="link-btn">
                {t("Sign Up")}
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
