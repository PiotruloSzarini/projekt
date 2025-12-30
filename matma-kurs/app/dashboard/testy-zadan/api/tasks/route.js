import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Próba znalezienia pliku w kilku możliwych lokalizacjach
    const pathsToTry = [
      path.join(process.cwd(), 'app', 'dashboard', 'testy-zadan', 'dane', 'mock_tasks.json'),
      path.join(process.cwd(), 'dane', 'mock_tasks.json'), // Jeśli folder dane byłby w głównym katalogu
    ];

    let filePath = "";
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      console.error("❌ NIE ZNALEZIONO PLIKU JSON. Sprawdzone ścieżki:", pathsToTry);
      return NextResponse.json({ error: "Plik JSON nie istnieje" }, { status: 404 });
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const allTasks = JSON.parse(jsonData);

    // Filtrowanie
    let filteredTasks = allTasks;
    if (type) {
      filteredTasks = allTasks.filter(t => t.taskType === type);
    }

    console.log(`✅ API: Typ [${type}], Znaleziono: ${filteredTasks.length} zadań.`);

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error("❌ BŁĄD API:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}