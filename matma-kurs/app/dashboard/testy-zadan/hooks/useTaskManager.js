// app/dashboard/testy-zadan/hooks/useTaskManager.js
"use client";
import { useState } from "react";

export function useTaskManager() {
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomTask = async (type = null) => {
    setLoading(true);
    setCurrentTask(null); // Czyścimy stare zadanie przed nowym pobraniem
    
    try {
      const url = type 
  ? `/dashboard/testy-zadan/api/tasks?type=${type}` 
  : '/dashboard/testy-zadan/api/tasks';
      const res = await fetch(url);
      
      if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
      
      const data = await res.json();
      console.log("Otrzymane dane z API:", data); // DEBUG

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrentTask(data[randomIndex]);
      } else {
        console.warn("API zwróciło pustą listę zadań!");
      }
    } catch (err) {
      console.error("Błąd podczas pobierania zadania:", err);
    } finally {
      setLoading(false);
    }
  };

  return { currentTask, loading, fetchRandomTask };
}