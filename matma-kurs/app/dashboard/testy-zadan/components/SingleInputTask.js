"use client";
import { useState, useEffect } from "react";

export default function SingleInputTask({ task }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Reset stanu przy zmianie zadania
  useEffect(() => {
    setAnswer("");
    setFeedback("");
    setShowHint(false);
  }, [task]);

  const handleCheck = () => {
    if (answer.trim().toLowerCase() === task.data.correctAnswer.toLowerCase()) {
      setFeedback("✅ Poprawnie!");
    } else {
      setFeedback("❌ Błędna odpowiedź, spróbuj jeszcze raz.");
    }
  };

  const handleReset = () => {
    setAnswer("");
    setFeedback("");
    setShowHint(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>{task.instruction}</h2>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Wpisz odpowiedź"
        style={{ padding: "8px", width: "100%", marginBottom: "10px", border: "1px solid #ccc" }}
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

      {showHint && (
        <p style={{ fontStyle: "italic", color: "#555" }}>
          Podpowiedź: {task.hints?.[0] || "Brak podpowiedzi"}
        </p>
      )}

      {feedback && <p style={{ fontWeight: "bold" }}>{feedback}</p>}
    </div>
  );
}