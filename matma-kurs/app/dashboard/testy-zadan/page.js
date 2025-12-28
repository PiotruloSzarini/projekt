"use client";
import React, { Fragment } from "react"; // Dodane dla większej stabilności JSX
import { useTaskManager } from "./hooks/useTaskManager";
import TaskRenderer from "./TaskRenderer";

export default function TasksPage() {
  const { currentTask, loading, fetchRandomTask } = useTaskManager();

  const taskTypes = [
    { id: "single_input", label: "Wpisz wynik" },
    { id: "multiple_choice", label: "Wielokrotny wybór" },
    { id: "matching", label: "Dopasowywanie" },
    { id: "step_by_step", label: "Krok po kroku" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Generator Zadań Maturalnych</h1>
      
      {/* Menu wyboru typów */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
        {taskTypes.map((type) => (
          <button 
            key={type.id} 
            onClick={() => fetchRandomTask(type.id)}
            style={{ 
              padding: "10px 15px", 
              cursor: "pointer",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          >
            Losuj: {type.label}
          </button>
        ))}
      </div>

      <hr />

      {/* Kontener na zadanie */}
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", minHeight: "200px", borderRadius: "8px" }}>
        {loading ? (
          <p>⏳ Ładowanie zadania...</p>
        ) : currentTask ? (
          <Fragment>
            <div style={{ marginBottom: "10px", borderBottom: "1px solid #eee", pb: "10px" }}>
              <small style={{ color: '#888' }}>
                Zadanie ID: {currentTask.taskId} | Typ: {currentTask.taskType}
              </small>
            </div>
            <TaskRenderer task={currentTask} />
          </Fragment>
        ) : (
          <div style={{ textAlign: "center", color: "#666", marginTop: "50px" }}>
            <p>Wybierz jeden z przycisków powyżej, aby wylosować zadanie.</p>
          </div>
        )}
      </div>
    </div>
  );
}