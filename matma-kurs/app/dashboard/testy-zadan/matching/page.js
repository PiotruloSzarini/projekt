"use client";

import { useState } from "react";

const task = {
  id: "match-dnd-6",
  content: "Dopasuj działanie do wyniku",
  pairs: [
    { left: "2 + 3", right: "5" },
    { left: "4 × 2", right: "8" },
    { left: "10 − 6", right: "4" },
  ],
};

export default function TaskPage() {
  const [answers, setAnswers] = useState(
    Array(task.pairs.length).fill(null)
  );
  const [dragged, setDragged] = useState(null);
  const [wrongCount, setWrongCount] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const resetTask = () => {
    setAnswers(Array(task.pairs.length).fill(null));
    setDragged(null);
    setWrongCount(null);
    setErrorMsg("");
  };

  // sprawdzanie odpowiedzi
  const checkAnswer = () => {
    if (answers.includes(null)) {
      setErrorMsg("⚠️ Użyj wszystkich odpowiedzi");
      setWrongCount(null);
      return;
    }

    setErrorMsg("");

    let wrong = 0;
    task.pairs.forEach((_, index) => {
      if (answers[index] !== index) wrong++;
    });

    setWrongCount(wrong);
  };

  const isUsed = (answerIndex) =>
    answers.includes(answerIndex);

  const handleDrop = (leftIndex) => {
    if (!dragged) return;

    setAnswers((prev) => {
      const updated = [...prev];

      if (dragged.type === "slot") {
        // przeciąganie między slotami
        const sourceIndex = dragged.index;
        const temp = updated[leftIndex];
        updated[leftIndex] = updated[sourceIndex];
        updated[sourceIndex] = temp;
      } else if (dragged.type === "pool") {
        // przeciąganie z puli
        // usuń kafelek z innych slotów, jeśli przypadkiem był gdzieś wcześniej
        for (let i = 0; i < updated.length; i++) {
          if (updated[i] === dragged.index) updated[i] = null;
        }
        updated[leftIndex] = dragged.index;
      }

      return updated;
    });

    setDragged(null);
  };

  const handleDropToPool = () => {
    if (!dragged) return;
    if (dragged.type === "slot") {
      setAnswers((prev) => {
        const updated = [...prev];
        updated[dragged.index] = null;
        return updated;
      });
    }
    setDragged(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h1>Drag & Drop – Matching</h1>
      <p>{task.content}</p>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* LEWA STRONA – sloty */}
        <div style={{ flex: 1 }}>
          <h3>Działania</h3>
          {task.pairs.map((pair, index) => (
            <div
              key={index}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              style={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "10px",
                minHeight: "60px",
              }}
            >
              <strong>{pair.left}</strong>
              <div
                style={{
                  marginTop: "5px",
                  minHeight: "30px",
                  background: "#eee",
                  padding: "6px",
                }}
              >
                {answers[index] !== null && (
                  <div
                    draggable
                    onDragStart={() =>
                      setDragged({ type: "slot", index })
                    }
                    style={{
                      background: "#fff",
                      border: "1px solid black",
                      padding: "4px",
                      cursor: "grab",
                    }}
                  >
                    {task.pairs[answers[index]].right}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PRAWA STRONA – pula */}
        <div
          style={{ flex: 1 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDropToPool()}
        >
          <h3>Wyniki</h3>
          {task.pairs.map((pair, index) => (
            <div
              key={index}
              draggable={!isUsed(index)}
              onDragStart={() =>
                setDragged({ type: "pool", index })
              }
              style={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "10px",
                background: isUsed(index) ? "#ddd" : "#fff",
                cursor: isUsed(index) ? "not-allowed" : "grab",
                opacity: isUsed(index) ? 0.5 : 1,
              }}
            >
              {pair.right}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={checkAnswer}>Sprawdź</button>
        <button
          onClick={resetTask}
          style={{ marginLeft: "10px" }}
        >
          Reset
        </button>
      </div>

      {errorMsg && (
        <p style={{ marginTop: "10px", color: "orange" }}>
          {errorMsg}
        </p>
      )}

      {wrongCount !== null && (
        <p style={{ marginTop: "10px" }}>
          {wrongCount === 0
            ? "✅ Wszystko poprawnie!"
            : `❌ Błędnych dopasowań: ${wrongCount}`}
        </p>
      )}
    </div>
  );
}
