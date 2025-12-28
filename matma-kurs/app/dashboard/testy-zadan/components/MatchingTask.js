"use client";
import { useState, useEffect } from "react";

export default function MatchingTask({ task }) {
  const [answers, setAnswers] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [wrongCount, setWrongCount] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [shuffledPool, setShuffledPool] = useState([]);

  // Inicjalizacja i mieszanie puli po stronie klienta
  useEffect(() => {
    setMounted(true);
    if (task && task.pairs) {
      setAnswers(Array(task.pairs.length).fill(null));
      
      // Tworzymy pulę z zachowaniem oryginalnych indeksów, aby sprawdzanie działało
      const pool = task.pairs.map((p, index) => ({ 
        text: p.right, 
        originalIndex: index 
      }));
      // Mieszamy
      setShuffledPool([...pool].sort(() => Math.random() - 0.5));
    }
    setWrongCount(null);
    setErrorMsg("");
  }, [task]);

  if (!mounted || !task || !task.pairs) return <div>Ładowanie...</div>;

  const resetTask = () => {
    setAnswers(Array(task.pairs.length).fill(null));
    setWrongCount(null);
    setErrorMsg("");
  };

  const checkAnswer = () => {
    if (answers.includes(null)) {
      setErrorMsg("⚠️ Użyj wszystkich odpowiedzi");
      return;
    }
    setErrorMsg("");
    let wrong = 0;
    task.pairs.forEach((_, index) => {
      if (answers[index] !== index) wrong++;
    });
    setWrongCount(wrong);
  };

  const isUsed = (originalIndex) => answers.includes(originalIndex);

  const handleDrop = (targetSlotIndex) => {
    if (dragged === null) return;

    setAnswers((prev) => {
      const updated = [...prev];
      if (dragged.type === "slot") {
        const sourceSlotIndex = dragged.index;
        const temp = updated[targetSlotIndex];
        updated[targetSlotIndex] = updated[sourceSlotIndex];
        updated[sourceSlotIndex] = temp;
      } else if (dragged.type === "pool") {
        // Usuń ten element z innych slotów, jeśli już tam był
        for (let i = 0; i < updated.length; i++) {
          if (updated[i] === dragged.originalIndex) updated[i] = null;
        }
        updated[targetSlotIndex] = dragged.originalIndex;
      }
      return updated;
    });
    setDragged(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>{task.instruction}</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* LEWA STRONA – Sloty */}
        <div style={{ flex: 1 }}>
          {task.pairs.map((pair, index) => (
            <div
              key={`slot-${index}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              style={{
                border: "1px dashed #666",
                padding: "10px",
                marginBottom: "10px",
                minHeight: "90px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{pair.left}</div>
              <div style={{ minHeight: "40px", background: "#fff", border: "1px solid #eee" }}>
                {/* Bezpieczne sprawdzanie: answers[index] musi istnieć w task.pairs */}
                {answers[index] !== null && task.pairs[answers[index]] && (
                  <div
                    draggable
                    onDragStart={() => setDragged({ type: "slot", index })}
                    style={{
                      padding: "8px",
                      background: "#007bff",
                      color: "#fff",
                      cursor: "grab",
                      borderRadius: "4px"
                    }}
                  >
                    {task.pairs[answers[index]].right}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PRAWA STRONA – Pula (pomieszana) */}
        <div
          style={{ flex: 1, borderLeft: "2px solid #eee", paddingLeft: "20px" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragged?.type === "slot") {
              setAnswers(prev => {
                const u = [...prev];
                u[dragged.index] = null;
                return u;
              });
            }
            setDragged(null);
          }}
        >
          <h4>Wyniki:</h4>
          {shuffledPool.map((item, idx) => (
            <div
              key={`pool-${idx}`}
              draggable={!isUsed(item.originalIndex)}
              onDragStart={() => setDragged({ type: "pool", originalIndex: item.originalIndex })}
              style={{
                padding: "10px",
                marginBottom: "8px",
                border: "1px solid #000",
                borderRadius: "4px",
                background: isUsed(item.originalIndex) ? "#ccc" : "#fff",
                cursor: isUsed(item.originalIndex) ? "not-allowed" : "grab",
                opacity: isUsed(item.originalIndex) ? 0.3 : 1
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={checkAnswer} style={{ padding: "10px 20px" }}>Sprawdź</button>
        <button onClick={resetTask} style={{ marginLeft: "10px", padding: "10px 20px" }}>Reset</button>
      </div>

      {errorMsg && <p style={{ color: "orange", marginTop: "10px" }}>{errorMsg}</p>}
      {wrongCount !== null && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          {wrongCount === 0 ? "✅ Poprawnie!" : `❌ Błędy: ${wrongCount}`}
        </p>
      )}
    </div>
  );
}