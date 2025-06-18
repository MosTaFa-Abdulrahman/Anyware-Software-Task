import "./announcement.scss";
import { useState } from "react";
import {
  MessageSquare,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

// RTKQ
import { useGetCurrentUserQuery } from "../../store/auth/authSlice";
import {
  useDeleteAnnouncementMutation,
  useGetAllAnnouncementsQuery,
} from "../../store/announcement/announcementSlice";

function Announcement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    announcementId: null,
    announcementTitle: "",
  });
  const limit = 3;

  // RTKQ
  const { data: currentUser } = useGetCurrentUserQuery();
  const {
    data: announcementData,
    isLoading,
    error,
    refetch,
  } = useGetAllAnnouncementsQuery({
    page: currentPage,
    limit: limit,
  });
  const [deleteAnnouncement, { isLoading: isDeleting }] =
    useDeleteAnnouncementMutation();

  const announcements = announcementData?.announcements || [];
  const pagination = announcementData?.pagination || {};

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "#667eea",
      exam: "#f093fb",
      event: "#4facfe",
      news: "#43e97b",
    };
    return colors[category] || colors.general;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: "📢",
      exam: "📝",
      event: "🎉",
      news: "📰",
    };
    return icons[category] || icons.general;
  };

  const openDeleteModal = (announcementId, announcementTitle) => {
    setDeleteModal({
      isOpen: true,
      announcementId,
      announcementTitle,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      announcementId: null,
      announcementTitle: "",
    });
  };

  const handleDeleteAnnouncement = async () => {
    try {
      await deleteAnnouncement(deleteModal.announcementId).unwrap();
      closeDeleteModal();
      // refetch();
    } catch (error) {}
  };

  const canDeleteAnnouncement = (announcement) => {
    return currentUser && announcement.author?._id === currentUser._id;
  };

  if (isLoading) {
    return (
      <div className="announcement-section">
        <div className="container">
          <div className="section-header">
            <h2>Announcements</h2>
            <button className="view-all-btn">All</button>
          </div>
          <div className="loading-state">
            <Loader2 className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcement-section">
        <div className="container">
          <div className="section-header">
            <h2>Announcements</h2>
            <button className="view-all-btn">All</button>
          </div>
          <div className="error-state">
            <p>Failed to load announcements</p>
            <button onClick={refetch} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="announcement-sectionn">
      <div className="container">
        <div className="section-header">
          <h2>Announcements</h2>
          <button className="view-all-btn">All</button>
        </div>

        <div className="announcements-list">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <MessageSquare className="empty-icon" />
              <p>No announcements found</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      {announcement.author?.profilePic ? (
                        <img
                          src={announcement.author.profilePic}
                          alt={announcement.author.username}
                        />
                      ) : (
                        <User className="avatar-icon" />
                      )}
                    </div>
                    <div className="author-details">
                      <h4>{announcement.author?.username || "Unknown"}</h4>
                      <p>{announcement.semester}</p>
                    </div>
                  </div>
                  <div className="announcement-meta">
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: getCategoryColor(
                          announcement.category
                        ),
                      }}
                    >
                      {getCategoryIcon(announcement.category)}{" "}
                      {announcement.category}
                    </span>
                    <div className="date-info">
                      <Clock className="clock-icon" />
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                    {canDeleteAnnouncement(announcement) && (
                      <button
                        className="delete-btn"
                        onClick={() =>
                          openDeleteModal(announcement._id, announcement.title)
                        }
                        title="Delete announcement"
                      >
                        <Trash2 className="delete-icon" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="announcement-content">
                  <h3>{announcement.title}</h3>
                  <p>{truncateContent(announcement.content)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="pagination-icon" />
              Previous
            </button>

            <div className="pagination-info">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span className="total-count">
                ({pagination.totalAnnouncements} total)
              </span>
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="pagination-icon" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <div className="warning-icon">
                <AlertTriangle />
              </div>
              <button
                className="close-modal-btn"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                <X />
              </button>
            </div>

            <div className="modal-content">
              <h3>Delete Announcement?</h3>
              <p>
                Are you sure you want to delete "{deleteModal.announcementTitle}
                "? This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDeleteAnnouncement}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="spinner" />
                  </>
                ) : (
                  <>
                    <Trash2 />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcement;
