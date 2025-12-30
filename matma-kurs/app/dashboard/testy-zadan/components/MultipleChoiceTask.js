"use client";
import { useState, useEffect } from "react";

export default function MultipleChoiceTask({ task }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setFeedback("");
    setShowHint(false);
  }, [task]);

  const handleCheck = () => {
    if (selectedIndex === task.data.correctIndex) {
      setFeedback("✅ Poprawnie!");
    } else {
      setFeedback("❌ Błędna odpowiedź, spróbuj jeszcze raz.");
    }
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setFeedback("");
    setShowHint(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>{task.instruction}</h2>
      <div style={{ marginBottom: "10px" }}>
        {task.data.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginBottom: "8px",
              padding: "10px",
              backgroundColor: selectedIndex === index ? "#007bff" : "#fff",
              color: selectedIndex === index ? "#fff" : "#000",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {option}
          </button>
        ))}
      </div>

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