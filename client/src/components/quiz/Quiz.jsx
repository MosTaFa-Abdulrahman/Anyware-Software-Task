import "./quiz.scss";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Import QuizModal component
import QuizModal from "../QuizModal/QuizModal"; // Adjust path as needed

// RTKQ
import { useGetCurrentUserQuery } from "../../store/auth/authSlice";
import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
} from "../../store/quiz/quizSlice";

function Quiz() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const limit = 3;

  // RTKQ
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useGetCurrentUserQuery();
  const {
    data: quizzesData,
    isLoading: quizzesLoading,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useGetAllQuizzesQuery({
    page: currentPage,
    limit: limit,
  });
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  // Extract data from API response (now properly structured)
  const quizzes = quizzesData?.quizzes || [];
  const pagination = quizzesData?.pagination || {};
  const currentUserId = currentUser?.id || currentUser?._id;

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

  const handleStartQuiz = (quiz) => {
    console.log(`Starting quiz: ${quiz.title}`);
    setSelectedQuizId(quiz._id || quiz.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuizId(null);
    refetchQuizzes();
  };

  // Updated function to check if user has completed this quiz
  const hasUserCompletedQuiz = (quiz) => {
    if (!currentUser?.completedQuizzes || !quiz) return false;

    const quizId = quiz._id || quiz.id;

    return currentUser.completedQuizzes.some((completed) => {
      const completedQuizId =
        completed.quizId?._id || completed.quizId?.id || completed.quizId;
      return completedQuizId === quizId;
    });
  };

  // Get user's score for a specific quiz
  const getUserQuizScore = (quiz) => {
    if (!currentUser?.quizResults || !quiz) return null;

    const quizId = quiz._id || quiz.id;

    const result = currentUser.quizResults.find((result) => {
      const resultQuizId =
        result.quizId?._id || result.quizId?.id || result.quizId;
      return resultQuizId === quizId;
    });

    return result;
  };

  // Check if current user is the owner of the quiz
  const isQuizOwner = (quiz) => {
    if (!currentUserId || !quiz.user) return false;
    const quizUserId =
      typeof quiz.user === "object" ? quiz.user._id || quiz.user.id : quiz.user;
    return currentUserId === quizUserId;
  };

  // Handle delete quiz with better error handling
  const handleDeleteQuiz = async (quiz) => {
    if (!isQuizOwner(quiz)) {
      toast.error("You don't have permission to delete this quiz");
      return;
    }

    // Show confirmation toast
    toast(
      (t) => (
        <div className="delete-confirmation">
          <div className="confirmation-header">
            <AlertCircle className="warning-icon" />
            <p>Are you sure you want to delete "{quiz.title}"?</p>
          </div>
          <div className="toast-buttons">
            <button
              className="confirm-delete-btn"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteQuiz(quiz._id).unwrap();
                  toast.success("Quiz deleted successfully!");
                } catch (error) {
                  const errorMessage =
                    error?.data?.message ||
                    error?.message ||
                    "Failed to delete quiz";
                  toast.error(errorMessage);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              className="cancel-delete-btn"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  // Loading state
  if (userLoading || quizzesLoading) {
    return (
      <div className="quiz-section">
        <div className="container">
          <div className="section-header">
            <h2>What's due</h2>
            <button className="view-all-btn">All</button>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError || quizzesError) {
    return (
      <div className="quiz-section">
        <div className="container">
          <div className="section-header">
            <h2>What's due</h2>
            <button className="view-all-btn">All</button>
          </div>
          <div className="error-state">
            <AlertCircle className="error-icon" />
            <p>Error loading quizzes. Please try again later.</p>
            <button className="retry-btn" onClick={() => refetchQuizzes()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-sectionn">
      <div className="container">
        <div className="section-header">
          <h2>What's due</h2>
          <div className="header-actions">
            <button className="view-all-btn">All</button>
          </div>
        </div>

        <div className="quiz-list">
          {quizzes?.map((quiz) => {
            const isCompleted = hasUserCompletedQuiz(quiz);
            const canDelete = isQuizOwner(quiz);
            const userScore = getUserQuizScore(quiz);

            return (
              <div key={quiz.id || quiz._id} className="quiz-card">
                <div className="quiz-header">
                  <div className="quiz-icon">
                    <BookOpen className="icon" />
                  </div>
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>

                    <div className="quiz-meta">
                      <div className="meta-item">
                        <Clock className="meta-icon" />
                        <span>
                          {formatDate(quiz.createdAt) || "No due date"}
                        </span>
                      </div>
                      <div className="meta-item">
                        <User className="meta-icon" />
                        <span>{quiz?.user?.username || "Instructor"}</span>
                      </div>
                    </div>

                    {/* Show score if quiz is completed */}
                    {isCompleted && userScore && (
                      <div className="quiz-score">
                        <span>
                          Score: {userScore.score}/{userScore.totalQuestions}
                        </span>
                        <span className="score-percentage">
                          (
                          {Math.round(
                            (userScore.score / userScore.totalQuestions) * 100
                          )}
                          %)
                        </span>
                      </div>
                    )}
                  </div>

                  {canDelete && (
                    <div className="quiz-delete">
                      <button
                        onClick={() => handleDeleteQuiz(quiz)}
                        disabled={isDeleting}
                        title="Delete Quiz"
                        style={{
                          color: "red",
                          background: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="quiz-actions">
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: isCompleted ? "#64748b" : "#10b981",
                    }}
                  >
                    {isCompleted ? "Done" : "Active"}
                  </div>

                  {isCompleted ? (
                    <button className="action-btn done-btn" disabled>
                      <CheckCircle className="btn-icon" />
                      Done
                    </button>
                  ) : (
                    <button
                      className="action-btn start-btn"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      <Play className="btn-icon" />
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show message if no quizzes */}
        {quizzes.length === 0 && (
          <div className="no-quizzes">
            <BookOpen className="no-quiz-icon" />
            <h3>No quizzes available</h3>
            <p>Check back later for new quizzes or assignments.</p>
          </div>
        )}

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
                ({pagination.totalQuizzes} total)
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

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        quizId={selectedQuizId}
      />
    </div>
  );
}

export default Quiz;
