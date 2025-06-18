import "./quizModal.scss";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

// RTKQ
import {
  useGetQuizByIdQuery,
  useSubmitQuizMutation,
} from "../../store/quiz/quizSlice";

const QuizModal = ({ isOpen, onClose, quizId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // RTKQ
  const {
    data: quiz,
    isLoading: quizLoading,
    error: quizError,
    refetch: refetchQuiz,
  } = useGetQuizByIdQuery(quizId, {
    skip: !quizId,
  });
  const [submitQuiz] = useSubmitQuizMutation();

  // Initialize timer when quiz starts
  useEffect(() => {
    if (quiz && quizStarted && !quizCompleted) {
      setTimeRemaining(quiz.timer * 60); // Convert minutes to seconds
    }
  }, [quiz, quizStarted, quizCompleted]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(async () => {
    if (!quizCompleted) {
      await handleSubmitQuiz(true);
    }
  }, [quizCompleted]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Start quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  // Navigate questions
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Jump to specific question
  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Submit quiz
  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Prepare answers array in the correct order
      const answersArray = quiz.questions.map(
        (_, index) => selectedAnswers[index] || ""
      );

      const response = await submitQuiz({
        quizId: quiz._id,
        answers: answersArray,
      }).unwrap();

      setQuizResults(response);
      setQuizCompleted(true);
      setQuizStarted(false);

      if (isAutoSubmit) {
        toast.success("Time's up! Quiz submitted automatically.");
      } else {
        toast.success("Quiz submitted successfully!");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to submit quiz";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizResults(null);
  };

  // Close modal
  const handleCloseModal = () => {
    if (quizStarted && !quizCompleted) {
      toast(
        (t) => (
          <div className="exit-confirmation">
            <div className="confirmation-header">
              <AlertTriangle className="warning-icon" />
              <p>Are you sure you want to exit? Your progress will be lost.</p>
            </div>
            <div className="toast-buttons">
              <button
                className="confirm-exit-btn"
                onClick={() => {
                  toast.dismiss(t.id);
                  handleResetQuiz();
                  onClose();
                }}
              >
                Exit Quiz
              </button>
              <button
                className="cancel-exit-btn"
                onClick={() => toast.dismiss(t.id)}
              >
                Continue Quiz
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: "top-center",
        }
      );
    } else {
      handleResetQuiz();
      onClose();
    }
  };

  // Get completion status for question navigation
  const getQuestionStatus = (index) => {
    if (selectedAnswers[index]) return "answered";
    if (index === currentQuestionIndex) return "current";
    return "unanswered";
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    return (answeredCount / quiz.questions.length) * 100;
  };

  if (!isOpen) return null;

  // Loading state
  if (quizLoading) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <p>Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (quizError || !quiz) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <div className="quiz-error">
            <AlertTriangle className="error-icon" />
            <h3>Failed to load quiz</h3>
            <p>Please try again later.</p>
            <div className="error-actions">
              <button className="retry-btn" onClick={() => refetchQuiz()}>
                <RotateCcw className="retry-icon" />
                Retry
              </button>
              <button className="close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        {/* Modal Header */}
        <div className="quiz-modal-header">
          <div className="quiz-title">
            <h2>{quiz.title}</h2>
            {quizStarted && !quizCompleted && (
              <div className="quiz-timer">
                <Clock className="timer-icon" />
                <span
                  className={`timer-text ${
                    timeRemaining <= 60 ? "timer-warning" : ""
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          <button className="close-modal-btn" onClick={handleCloseModal}>
            <X className="close-icon" />
          </button>
        </div>

        {/* Quiz Content */}
        <div className="quiz-modal-content">
          {/* Quiz Start Screen */}
          {!quizStarted && !quizCompleted && (
            <div className="quiz-start-screen">
              <div className="quiz-info">
                <h3>Quiz Instructions</h3>
                <div className="quiz-details">
                  <div className="detail-item">
                    <span className="detail-label">Questions:</span>
                    <span className="detail-value">
                      {quiz.questions.length}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Limit:</span>
                    <span className="detail-value">{quiz.timer} minutes</span>
                  </div>
                </div>
                <div className="quiz-rules">
                  <ul>
                    <li>
                      Read each question carefully before selecting an answer
                    </li>
                    <li>
                      You can navigate between questions using the navigation
                      buttons
                    </li>
                    <li>Make sure to submit your quiz before time runs out</li>
                    <li>You cannot retake this quiz once submitted</li>
                  </ul>
                </div>
              </div>
              <button className="start-quiz-btn" onClick={handleStartQuiz}>
                Start Quiz
              </button>
            </div>
          )}

          {/* Quiz Taking Screen */}
          {quizStarted && !quizCompleted && (
            <div className="quiz-taking-screen">
              {/* Progress Bar */}
              <div className="quiz-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Object.keys(selectedAnswers).length} of{" "}
                  {quiz.questions.length} answered
                </div>
              </div>

              {/* Question Navigation */}
              <div className="question-navigation">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    className={`question-nav-btn ${getQuestionStatus(index)}`}
                    onClick={() => handleQuestionJump(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Current Question */}
              <div className="current-question">
                <div className="question-header">
                  <span className="question-number">
                    Question {currentQuestionIndex + 1} of{" "}
                    {quiz.questions.length}
                  </span>
                </div>
                <div className="question-content">
                  <h3 className="question-text">
                    {quiz.questions[currentQuestionIndex].question}
                  </h3>
                  <div className="question-options">
                    {quiz.questions[currentQuestionIndex].options.map(
                      (option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`option-label ${
                            selectedAnswers[currentQuestionIndex] === option
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={
                              selectedAnswers[currentQuestionIndex] === option
                            }
                            onChange={() =>
                              handleAnswerSelect(currentQuestionIndex, option)
                            }
                          />
                          <span className="option-text">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Question Navigation Controls */}
              <div className="question-controls">
                <button
                  className="nav-btn prev-btn"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="nav-icon" />
                  Previous
                </button>

                <div className="question-indicator">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </div>

                <button
                  className="nav-btn next-btn"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                >
                  Next
                  <ChevronRight className="nav-icon" />
                </button>
              </div>

              {/* Submit Button */}
              <div className="quiz-submit-section">
                <button
                  className="submit-quiz-btn"
                  onClick={() => handleSubmitQuiz(false)}
                  disabled={
                    isSubmitting || Object.keys(selectedAnswers).length === 0
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </button>
              </div>
            </div>
          )}

          {/* Quiz Results Screen */}
          {quizCompleted && quizResults && (
            <div className="quiz-results-screen">
              <div className="results-header">
                <Trophy className="trophy-icon" />
                <h3>Quiz Completed!</h3>
              </div>
              <div className="results-summary">
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-percentage">
                      {quizResults.percentage}%
                    </span>
                  </div>
                  <div className="score-details">
                    <p>
                      You scored {quizResults.score} out of{" "}
                      {quizResults.totalQuestions}
                    </p>
                    <p className="score-message">
                      {quizResults.percentage >= 80
                        ? "Excellent work!"
                        : quizResults.percentage >= 60
                        ? "Good job!"
                        : "Keep practicing!"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="results-actions">
                <button
                  className="close-results-btn"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
