"use client";

import { useState } from "react";

const singleInputTask = {
  id: "text-1",
  type: "text",
  content: "Ile to jest 2 + 3?",
  correctAnswer: "5",
  hint: "Dodaj 2 do 3",
};

export default function SingleInputTask() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    if (answer.trim() === singleInputTask.correctAnswer) {
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
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h1>{singleInputTask.content}</h1>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Wpisz odpowiedź"
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

      {showHint && (
        <p style={{ fontStyle: "italic", color: "#555" }}>Podpowiedź: {singleInputTask.hint}</p>
      )}

      {feedback && <p style={{ fontWeight: "bold" }}>{feedback}</p>}
    </div>
  );
}
