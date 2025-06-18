import "./announcement.scss";
import { useState } from "react";
import {
  Send,
  FileText,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

// RTKQ
import { useGetCurrentUserQuery } from "../../../store/auth/authSlice";
import { useCreateAnnouncementMutation } from "../../../store/announcement/announcementSlice";

function Announcement() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    semester: "",
    category: "general",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // RTKQ
  const { data: currentUser, isLoading: userLoading } =
    useGetCurrentUserQuery();
  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAnnouncementMutation();

  const categoryOptions = [
    { value: "general", label: "General", icon: "📢" },
    { value: "exam", label: "Exam", icon: "📝" },
    { value: "event", label: "Event", icon: "🎉" },
    { value: "news", label: "News", icon: "📰" },
  ];

  // Handle Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.semester.trim()) {
      newErrors.semester = "Semester is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!validateForm()) return;

    try {
      const result = await createAnnouncement(formData).unwrap();
      setSuccess(result.message || "Announcement created successfully!");

      // Reset form
      setFormData({
        title: "",
        content: "",
        semester: "",
        category: "general",
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setErrors({
        submit: error?.data?.error || "Failed to create announcement",
      });
    }
  };

  // Loading User
  if (userLoading) {
    return (
      <div className="announcement-loading">
        <Loader2 className="spinner" />
      </div>
    );
  }

  return (
    <div className="announcement-page">
      <div className="announcement-container">
        {/* Header */}
        <div className="announcement-header">
          <div className="header-content">
            <FileText className="header-icon" />
            <div>
              <h1>Create Announcement</h1>
              <p>Share important information with everyone</p>
            </div>
          </div>

          {currentUser && (
            <div className="user-info">
              <User className="user-icon" />
              <span>@{currentUser.username}</span>
            </div>
          )}
        </div>

        {success && (
          <div className="alert alert-success">
            <CheckCircle className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            <AlertCircle className="alert-icon" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form className="announcement-form" onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <FileText className="label-icon" />
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title..."
              className={`form-input ${errors.title ? "error" : ""}`}
              maxLength={200}
            />
            <div className="input-footer">
              {errors.title && (
                <span className="error-text">{errors.title}</span>
              )}
              <span className="char-count">{formData.title.length}/200</span>
            </div>
          </div>

          {/* Category and Semester */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                <Tag className="label-icon" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester" className="form-label">
                <Calendar className="label-icon" />
                Semester <span className="required">*</span>
              </label>
              <input
                type="text"
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                placeholder="e.g., Fall 2024, Spring 2025"
                className={`form-input ${errors.semester ? "error" : ""}`}
              />
              {errors.semester && (
                <span className="error-text">{errors.semester}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              <FileText className="label-icon" />
              Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your announcement content here..."
              className={`form-textarea ${errors.content ? "error" : ""}`}
              rows={8}
            />
            {errors.content && (
              <span className="error-text">{errors.content}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="btn-icon spinner" />
              </>
            ) : (
              <>
                <Send className="btn-icon" />
                Create Announcement
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Announcement;
