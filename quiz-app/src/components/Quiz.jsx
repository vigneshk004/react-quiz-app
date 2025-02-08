import React, { useState, useEffect } from "react";

const Quiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);  // Set timer to 30 seconds
  const [timerRunning, setTimerRunning] = useState(true);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(
          "https://api.allorigins.win/raw?url=https://api.jsonserve.com/Uw5CrX"
        );
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerInterval); // Cleanup on timer change
    } else if (timeLeft === 0) {
      handleOptionSelect(null, null, false);  // Automatically move to the next question when time runs out
    }
  }, [timeLeft, timerRunning]);

  const handleOptionSelect = (questionId, optionId, isCorrect) => {
    setSelectedOptions({ ...selectedOptions, [questionId]: optionId });

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      setStreak((prevStreak) => {
        const newStreak = prevStreak + 1;
        setMaxStreak((prevMaxStreak) => Math.max(prevMaxStreak, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setTimeLeft(30); // Reset timer for the next question to 30 seconds
        setTimerRunning(true); // Ensure the timer starts running again
      }, 500);
    } else {
      setQuizCompleted(true);  // End quiz when all questions are answered
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOptions({});
    setScore(0);
    setQuizCompleted(false);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(30);  // Reset timer to 30 seconds
    setTimerRunning(true);  // Start timer again
  };

  if (loading) return <p>Loading...</p>;
  if (!quizData || !quizData.questions || quizData.questions.length === 0)
    return <p>Error loading quiz or no questions available.</p>;

  const progressPercentage = ((currentQuestion + 1) / quizData.questions.length) * 100;

  // Summary of wrong answers
  const incorrectAnswers = quizData.questions
    .filter((question) => {
      const selectedOption = selectedOptions[question.id];
      const correctOption = question.options.find(option => option.is_correct);
      return selectedOption !== correctOption?.id;
    })
    .map((question) => {
      const selectedOption = question.options.find(option => option.id === selectedOptions[question.id]);
      const correctOption = question.options.find(option => option.is_correct);
      return {
        question: question.description,
        selectedAnswer: selectedOption?.description || "No answer selected",
        correctAnswer: correctOption?.description,
      };
    });

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "600px",
        margin: "auto",
        background: "linear-gradient(to right, #434343, #000)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h1>React Quiz App</h1>
      <h2>{quizData.title}</h2>

      {!quizCompleted ? (
        <>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            Time Left: {timeLeft}s
          </div>

          <div style={{ width: "100%", backgroundColor: "#ccc", height: "10px", margin: "10px 0" }}>
            <div
              style={{
                width: `${progressPercentage}%`,
                height: "10px",
                backgroundColor: "#4caf50",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <h3>
            Question {currentQuestion + 1}: {quizData.questions[currentQuestion].description}
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {quizData.questions[currentQuestion].options.map((option) => (
              <li
                key={option.id}
                onClick={() =>
                  handleOptionSelect(quizData.questions[currentQuestion].id, option.id, option.is_correct)
                }
                style={{
                  padding: "10px",
                  margin: "5px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedOptions[quizData.questions[currentQuestion].id] === option.id
                      ? option.is_correct
                        ? "#4caf50"
                        : "#f44336"
                      : "#f0f0f0",
                  color: selectedOptions[quizData.questions[currentQuestion].id] ? "white" : "black",
                  borderRadius: "5px",
                  transition: "background-color 0.3s ease",
                }}
              >
                {option.description}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold" }}>
            Streak: {streak} {streak > 0 && "🔥"}
          </div>
        </>
      ) : (
        <div>
          <h2>Quiz Completed!</h2>
          <p>Your Score: {score} / {quizData.questions.length}</p>
          <p>Max Streak: {maxStreak} {maxStreak > 0 && "🔥"}</p>

          {/* Incorrect Answer Summary */}
          {incorrectAnswers.length > 0 && (
            <div>
              <h3>Incorrect Answers</h3>
              <ul style={{ textAlign: "left", marginTop: "20px" }}>
                {incorrectAnswers.map((item, index) => (
                  <li key={index}>
                    <strong>Question: </strong>{item.question}<br />
                    <strong>Your Answer: </strong>{item.selectedAnswer}<br />
                    <strong>Correct Answer: </strong>{item.correctAnswer}<br />
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={restartQuiz} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
            Restart Quiz 🔄
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
