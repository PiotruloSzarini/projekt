"use client";

import { useState } from "react";

const mcTask = {
  id: "mc-1",
  type: "multipleChoice",
  content: "Wybierz wynik 2 + 3",
  options: ["4", "5", "6"],
  correctIndex: 1,
  hint: "Dodaj 2 do 3",
};

export default function MultipleChoiceTask() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    if (selectedIndex === mcTask.correctIndex) {
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
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h1>{mcTask.content}</h1>
      <div style={{ marginBottom: "10px" }}>
        {mcTask.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            style={{
              display: "block",
              marginBottom: "5px",
              padding: "8px 12px",
              backgroundColor: selectedIndex === index ? "#ccc" : "#fff",
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
        <p style={{ fontStyle: "italic", color: "#555" }}>Podpowiedź: {mcTask.hint}</p>
      )}

      {feedback && <p style={{ fontWeight: "bold" }}>{feedback}</p>}
    </div>
  );
}
