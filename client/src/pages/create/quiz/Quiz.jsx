import "./quiz.scss";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

// RTKQ
import { useCreateQuizMutation } from "../../../store/quiz/quizSlice";

function Quiz() {
  const [quizData, setQuizData] = useState({
    title: "",
    timer: 10,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        answer: "",
      },
    ],
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // RTKQ
  const [createQuiz, { isLoading, error, isSuccess }] = useCreateQuizMutation();

  // Add new question
  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          answer: "",
        },
      ],
    });
  };

  // Remove question
  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: newQuestions });

    // Clear specific error when user starts typing
    if (errors[`question-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`question-${index}`];
      setErrors(newErrors);
    }
  };

  // Update option
  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  // Add option to question
  const addOption = (questionIndex) => {
    const newQuestions = [...quizData.questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push("");
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  // Remove option from question
  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...quizData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!quizData.title.trim()) {
      newErrors.title = "Quiz title is required";
    }

    if (quizData.timer < 1) {
      newErrors.timer = "Timer must be at least 1 minute";
    }

    quizData.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question-${index}`] = "Question text is required";
      }

      const filledOptions = q.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        newErrors[`question-${index}`] = "At least 2 options are required";
      }

      if (!q.answer.trim()) {
        newErrors[`question-${index}`] = "Correct answer is required";
      } else if (!q.options.includes(q.answer)) {
        newErrors[`question-${index}`] = "Answer must match one of the options";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Filter out empty options
      const cleanedQuestions = quizData.questions.map((q) => ({
        ...q,
        options: q.options.filter((opt) => opt.trim()),
      }));

      await createQuiz({
        ...quizData,
        questions: cleanedQuestions,
      }).unwrap();

      setShowSuccess(true);
      // Reset form
      setQuizData({
        title: "",
        timer: 10,
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            answer: "",
          },
        ],
      });

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to create quiz:", err);
    }
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">
          <BookOpen className="title-icon" />
          <h1>Create New Quiz</h1>
        </div>
      </div>

      {showSuccess && (
        <div className="success-message">
          <CheckCircle className="success-icon" />
          <span>Quiz created successfully!</span>
          <button onClick={() => setShowSuccess(false)}>
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="quiz-form">
        {/* Quiz Basic Info */}
        <div className="form-section">
          <h2>Quiz Information</h2>

          <div className="form-group">
            <label htmlFor="title">Quiz Title *</label>
            <input
              type="text"
              id="title"
              value={quizData.title}
              onChange={(e) => {
                setQuizData({ ...quizData, title: e.target.value });
                if (errors.title) {
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter quiz title..."
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="timer">
              <Clock size={16} />
              Timer (minutes) *
            </label>
            <input
              type="number"
              id="timer"
              min="1"
              max="180"
              value={quizData.timer}
              onChange={(e) => {
                setQuizData({ ...quizData, timer: parseInt(e.target.value) });
                if (errors.timer) {
                  const newErrors = { ...errors };
                  delete newErrors.timer;
                  setErrors(newErrors);
                }
              }}
              className={errors.timer ? "error" : ""}
            />
            {errors.timer && <span className="error-text">{errors.timer}</span>}
          </div>
        </div>

        {/* Questions Section */}
        <div className="form-section">
          <div className="questions-header">
            <h2>Questions ({quizData.questions.length})</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="add-question-btn"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          {quizData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-card">
              <div className="question-header">
                <span className="question-number">
                  Question {questionIndex + 1}
                </span>
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="remove-question-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "question", e.target.value)
                  }
                  placeholder="Enter your question..."
                  rows="3"
                  className={errors[`question-${questionIndex}`] ? "error" : ""}
                />
              </div>

              <div className="options-section">
                <label>Answer Options *</label>
                <div className="options-list">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-input">
                      <span className="option-label">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${String.fromCharCode(
                          65 + optionIndex
                        )}`}
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeOption(questionIndex, optionIndex)
                          }
                          className="remove-option-btn"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {question.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="add-option-btn"
                  >
                    <Plus size={14} />
                    Add Option
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select
                  value={question.answer}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "answer", e.target.value)
                  }
                  className={errors[`question-${questionIndex}`] ? "error" : ""}
                >
                  <option value="">Select correct answer</option>
                  {question.options
                    .filter((opt) => opt.trim())
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {String.fromCharCode(
                          65 + question.options.indexOf(option)
                        )}
                        . {option}
                      </option>
                    ))}
                </select>
              </div>

              {errors[`question-${questionIndex}`] && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{errors[`question-${questionIndex}`]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Quiz...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Quiz
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>Error creating quiz. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default Quiz;
