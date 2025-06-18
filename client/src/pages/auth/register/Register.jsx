import "./register.scss";
import { useState } from "react";
import { Loader, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// RTKQ
import { useRegisterUserMutation } from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

function Register() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // RTKQ
  const [registerUser, { isLoading, isError, error }] =
    useRegisterUserMutation();

  // Validate Password
  const isPasswordValid = () => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  // Password requirements
  const passwordRequirements = [
    { text: "At least 6 characters", valid: password.length >= 6 },
    { text: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { text: "One lowercase letter", valid: /[a-z]/.test(password) },
    { text: "One number", valid: /\d/.test(password) },
    { text: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isPasswordValid()) {
      toast.error(
        t("Please complete the password requirements before signing up.")
      );
      return;
    }

    try {
      const result = await registerUser({ username, email, password }).unwrap();
      navigate("/login");
      toast.success(
        `${t("Registered successfully!")} ${result?.username || username}`
      );
    } catch (error) {
      toast.error(error?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <h1>{t("Create Account")}</h1>
            <p>{t("Join us today and get started")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="register-form">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username">{t("Username")}</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("Enter your username")}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                />
              </div>
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
                  placeholder={t("Create a password")}
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

            {/* Password Requirements */}
            {password && (
              <div className="password-requirements">
                <h4>{t("Password Requirements")}:</h4>
                <ul>
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className={req.valid ? "valid" : "invalid"}>
                      {req.valid ? (
                        <CheckCircle size={16} className="check-icon" />
                      ) : (
                        <XCircle size={16} className="x-icon" />
                      )}
                      <span>{t(req.text)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !username || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader className="loading-spinner" size={20} />
                  {t("Creating Account")}...
                </>
              ) : (
                t("Create Account")
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="register-footer">
            <p>
              {t("Already have an account?")}
              <NavLink to="/login" className="link-btn">
                {t("Sign In")}
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
