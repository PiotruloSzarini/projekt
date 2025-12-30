"use client";

import { useState, useEffect } from "react";

export default function StepByStepTask({ task }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answersHistory, setAnswersHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);

  // Resetowanie stanu, gdy zmienia się zadanie (pobierane z JSON)
  useEffect(() => {
    setCurrentStep(0);
    setAnswer("");
    setFeedback("");
    setAnswersHistory(Array(task.steps.length).fill(null));
    setShowHint(false);
  }, [task]);

  const handleCheck = () => {
    const step = task.steps[currentStep];
    
    if (answer.trim() === step.correctAnswer) {
      const newHistory = [...answersHistory];
      newHistory[currentStep] = answer;
      setAnswersHistory(newHistory);
      setFeedback("✅ Poprawnie!");
      setAnswer("");
      setShowHint(false);

      if (currentStep < task.steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setFeedback("🎉 Zadanie ukończone!");
      }
    } else {
      setFeedback("❌ Błędna odpowiedź, spróbuj jeszcze raz.");
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswer("");
    setFeedback("");
    setAnswersHistory(Array(task.steps.length).fill(null));
    setShowHint(false);
  };

  if (!task || !task.steps) return null;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Step by Step</h1>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{task.instruction}</p>

      {/* Lista kroków – pokazujemy ukończone + aktualny */}
      <div style={{ marginBottom: "20px" }}>
        {task.steps.map((step, index) => {
          // Logika wyświetlania: tylko kroki do aktualnego włącznie
          if (index > currentStep && (index === 0 || answersHistory[index - 1] === null)) {
            return null;
          }

          const isCompleted = answersHistory[index] === step.correctAnswer;
          const isActive = index === currentStep;

          const statusColor = isCompleted 
            ? "green" 
            : isActive 
            ? "#666" 
            : "#ccc";

          return (
            <div
              key={index}
              style={{
                padding: "8px 12px",
                marginBottom: "8px",
                backgroundColor: statusColor,
                color: "white",
                borderRadius: "6px",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{`Krok ${index + 1}: ${step.question}`}</span>
                {isCompleted && (
                  <span style={{ fontWeight: "bold" }}>({answersHistory[index]})</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel aktywnego kroku (ukryty, gdy zadanie skończone) */}
      {currentStep < task.steps.length && answersHistory[currentStep] === null ? (
        <div>
          <input
            type="text"
            value={answer}
            placeholder={task.steps[currentStep].placeholder || "Wpisz wynik"}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            style={{ padding: "10px", width: "100%", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <div style={{ marginBottom: "10px" }}>
            <button onClick={handleCheck} style={{ padding: "8px 16px", marginRight: "10px", cursor: "pointer" }}>
              Sprawdź
            </button>
            <button onClick={() => setShowHint(true)} style={{ padding: "8px 16px", marginRight: "10px", cursor: "pointer" }}>
              Pokaż podpowiedź
            </button>
            <button onClick={handleReset} style={{ padding: "8px 16px", cursor: "pointer" }}>
              Reset
            </button>
          </div>
        </div>
      ) : (
        /* Przycisk resetu widoczny po zakończeniu wszystkich kroków */
        <button onClick={handleReset} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Zacznij od nowa
        </button>
      )}

      {/* Podpowiedź dla aktualnego kroku */}
      {showHint && task.steps[currentStep]?.hint && (
        <p style={{ fontStyle: "italic", marginTop: "10px", color: "#555", padding: "10px", backgroundColor: "#fff3cd", borderLeft: "4px solid #ffeeba" }}>
          💡 Podpowiedź: {task.steps[currentStep].hint}
        </p>
      )}

      {/* Komunikat o poprawności */}
      {feedback && (
        <p style={{ 
          marginTop: "15px", 
          fontWeight: "bold", 
          color: feedback.includes("✅") || feedback.includes("🎉") ? "green" : "red" 
        }}>
          {feedback}
        </p>
      )}
    </div>
  );
}