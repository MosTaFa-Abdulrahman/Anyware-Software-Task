import "./header.scss";
import { useState, useEffect } from "react";
import { Search, Bell, Mail, User, LogIn, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

// RTKQ
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "../../store/auth/authSlice";
import toast from "react-hot-toast";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // RTKQ
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();
  const isAuthenticated = !!currentUser && !error;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".header__profile")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Go To Login Page
  const handleLogin = () => {
    navigate("/login");
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      window.location.reload();
      localStorage.removeItem("token");
      setShowDropdown(false);
      toast.success("User logged out successfully");
    } catch (error) {
      toast.error("Logout failed:", error);
      localStorage.removeItem("token");
      setShowDropdown(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    // navigate("/profile");
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <h1>Coligo</h1>
        </div>

        {isAuthenticated && currentUser && (
          <div className="header__welcome">
            <span>Welcome {currentUser.username},</span>
          </div>
        )}

        <div className="header__right">
          <div className="header__search">
            <Search className="header__search-icon" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="header__search-input"
            />
          </div>

          <div className="header__notifications">
            <div className="header__notification-item">
              <Bell size={20} />
              <span className="header__badge">2</span>
            </div>
            <div className="header__notification-item">
              <Mail size={20} />
              <span className="header__badge">5</span>
            </div>
          </div>

          {/* User Profile or Login Button */}
          {isAuthenticated && currentUser ? (
            <div className="header__profile">
              <div className="header__user-info" onClick={toggleDropdown}>
                <div className="header__avatar">
                  <User size={20} />
                </div>
                <div className="header__user-details">
                  <span className="header__user-name">
                    {currentUser.username}
                  </span>
                  <span className="header__user-email">
                    {currentUser.email}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`header__dropdown-icon ${
                    showDropdown ? "header__dropdown-icon--open" : ""
                  }`}
                />
              </div>

              {showDropdown && (
                <div className="header__dropdown">
                  <div
                    className="header__dropdown-item"
                    onClick={handleProfileClick}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </div>

                  <div className="header__dropdown-divider"></div>
                  <div
                    className="header__dropdown-item header__dropdown-item--danger"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogIn size={16} />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="header__auth">
              <button className="header__login-btn" onClick={handleLogin}>
                <LogIn size={18} />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
