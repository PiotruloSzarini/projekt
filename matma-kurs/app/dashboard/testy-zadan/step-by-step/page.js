"use client";

import { useState } from "react";

// Przykładowe zadanie step by step
const stepTask = {
  id: "step-2",
  content: "Oblicz 2 × 3 + 4",
  steps: [
    {
      question: "Krok 1: Oblicz 2 × 3",
      correctAnswer: "6",
      placeholder: "Wpisz wynik",
      hint: "Pomnóż 2 przez 3",
    },
    {
      question: "Krok 2: Dodaj 4 do wyniku",
      correctAnswer: "10",
      placeholder: "Wpisz wynik",
      hint: "Dodaj 4 do wyniku kroku 1",
    },
    {
      question: "Krok 3: Podziel przez 2",
      correctAnswer: "5",
      placeholder: "Wpisz wynik",
      hint: "Podziel wynik kroku 2 przez 2",
    },
  ],
};

export default function StepByStepTask() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answersHistory, setAnswersHistory] = useState(
    Array(stepTask.steps.length).fill(null)
  );
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    const step = stepTask.steps[currentStep];
    if (answer.trim() === step.correctAnswer) {
      const newHistory = [...answersHistory];
      newHistory[currentStep] = answer;
      setAnswersHistory(newHistory);
      setFeedback("✅ Poprawnie!");
      setAnswer("");
      setShowHint(false);

      if (currentStep < stepTask.steps.length - 1) {
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
    setAnswersHistory(Array(stepTask.steps.length).fill(null));
    setShowHint(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Step by Step – Zadanie</h1>
      <p>{stepTask.content}</p>

      {/* Lista kroków – pokazujemy tylko ukończone + aktualny */}
      <div style={{ marginBottom: "20px" }}>
        {stepTask.steps.map((step, index) => {
          // pokaż tylko krok jeśli jest poprzedni poprawny lub aktualny
          if (index > currentStep && answersHistory[index - 1] !== stepTask.steps[index - 1].correctAnswer) {
            return null;
          }

          const status =
            answersHistory[index] === step.correctAnswer
              ? "green"
              : index === currentStep
              ? "gray"
              : answersHistory[index] !== null
              ? "red"
              : "lightgray";

          return (
            <div
              key={index}
              style={{
                padding: "6px 10px",
                marginBottom: "5px",
                backgroundColor: status,
                color: status === "lightgray" ? "black" : "white",
                borderRadius: "4px",
              }}
            >
              {`Krok ${index + 1}: ${step.question}`}
              {answersHistory[index] !== null && (
                <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                  ({answersHistory[index]})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Aktualny krok */}
      <div>
        <input
          type="text"
          value={answer}
          placeholder={stepTask.steps[currentStep].placeholder}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ padding: "6px", width: "100%", marginBottom: "10px" }}
        />
        <div style={{ marginBottom: "10px" }}>
          <button onClick={handleCheck} style={{ padding: "8px 16px", marginRight: "10px" }}>
            Sprawdź
          </button>
          <button onClick={() => setShowHint(true)} style={{ padding: "8px 16px", marginRight: "10px" }}>
            Pokaż podpowiedź
          </button>
          <button onClick={handleReset} style={{ padding: "8px 16px" }}>
            Reset
          </button>
        </div>
      </div>

      {/* Hint – pokazuje się tylko po kliknięciu */}
      {showHint && stepTask.steps[currentStep].hint && (
        <p style={{ fontStyle: "italic", marginTop: "6px", color: "#555" }}>
          Podpowiedź: {stepTask.steps[currentStep].hint}
        </p>
      )}

      {/* Feedback */}
      {feedback && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>{feedback}</p>
      )}
    </div>
  );
}
