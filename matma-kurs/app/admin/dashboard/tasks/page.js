'use client';
import { useState, useEffect } from 'react';

// Mapowanie kodów na ID (zgodnie z Twoją bazą)
const TYPE_MAP = {
    'MULTIPLE_CHOICE': 1,
    'SINGLE_INPUT': 2,
    'MATCHING_PAIRS': 3,
    'STEP_BY_STEP': 4
};

// Pusty szablon dla nowego zadania
const BLANK_TASK = {
    task_id: null,
    task_type_code: 'MULTIPLE_CHOICE', // Domyślny typ
    question: '',
    points: 1,
    difficulty: 1,
    hints: [],
    explanation: { steps: [] },
    data: {
        multiple_choice: { answers: [] },
        single_input: { correct_value: '', answer_type: 'string' },
        matching_pairs: { items: [] },
        step_by_step: { steps: [] }
    }
};

export default function TaskDatabase() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1. POBIERANIE DANYCH
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await fetch('/api/admin/task-structure');
            const data = await res.json();
            setTasks(data);
            // Jeśli nie ma wybranego, wybierz pierwszy, chyba że lista pusta
            if (!selectedTask && data.length > 0) setSelectedTask(data[0]);
        } catch (err) {
            console.error("Błąd ładowania:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. PRZYGOTOWANIE DANYCH DO ZAPISU
    const preparePayload = () => {
        const typeCode = selectedTask.task_type_code;
        const typeId = TYPE_MAP[typeCode];
        
        // Wyciągamy specyficzne dane zależnie od typu
        let details = {};
        if (typeCode === 'MULTIPLE_CHOICE') details = { ...selectedTask.data.multiple_choice };
        else if (typeCode === 'SINGLE_INPUT') details = { ...selectedTask.data.single_input };
        else if (typeCode === 'MATCHING') details = { pairs: selectedTask.data.matching_pairs.items };
        else if (typeCode === 'STEP_BY_STEP') details = { steps: selectedTask.data.step_by_step.steps };

        return {
            task_id: selectedTask.task_id, // Będzie null dla nowych
            task_group_id: 1, // TODO: Tu powinieneś podać ID grupy z nadrzędnego selecta (hardcode na razie)
            task_type_id: typeId,
            question: selectedTask.question,
            points: parseInt(selectedTask.points),
            difficulty: parseInt(selectedTask.difficulty),
            hints: selectedTask.hints,
            explanation: selectedTask.explanation,
            details: details
        };
    };

    // 3. OBSŁUGA ZAPISU (CREATE / UPDATE)
    const handleSave = async () => {
        setSaving(true);
        const payload = preparePayload();
        const method = payload.task_id ? 'PUT' : 'POST';
        const url = payload.task_id ? '/api/admin/tasks/update' : '/api/admin/tasks/create';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            alert("Zapisano pomyślnie!");
            await loadTasks(); // Odśwież listę
            
            // Jeśli to było nowe zadanie, ustaw je jako wybrane (API zwraca taskId przy create)
            if (method === 'POST') {
                // Mały hack: po przeładowaniu znajdź to nowe zadanie (można to zrobić lepiej optymistycznie)
                // Na razie zostawmy odświeżenie listy.
            }
        } catch (err) {
            alert("Błąd zapisu: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // 4. OBSŁUGA USUWANIA
    const handleDelete = async () => {
        if (!selectedTask.task_id) return; // Nie usuwamy niezapisanych
        if (!confirm("Czy na pewno usunąć to zadanie?")) return;

        try {
            const res = await fetch(`/api/admin/tasks/delete?task_id=${selectedTask.task_id}`, { method: 'DELETE' });
            if (res.ok) {
                const newTasks = tasks.filter(t => t.task_id !== selectedTask.task_id);
                setTasks(newTasks);
                setSelectedTask(newTasks.length > 0 ? newTasks[0] : null);
            } else {
                alert("Błąd usuwania");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 5. OBSŁUGA NOWEGO ZADANIA
    const handleNewTask = () => {
        setSelectedTask(JSON.parse(JSON.stringify(BLANK_TASK))); // Deep copy
    };

    // --- GENERYCZNE UPDATE'Y STANU DLA LIST (Hinty, Odpowiedzi) ---
    const updateNestedList = (path, index, field, value) => {
        const copy = JSON.parse(JSON.stringify(selectedTask));
        
        if (path === 'hints') copy.hints[index].content = value;
        if (path === 'explanation') copy.explanation.steps[index].content = value;
        // Multiple Choice
        if (path === 'answers') copy.data.multiple_choice.answers[index][field] = value;
        // Matching Pairs
        if (!copy.data.matching_pairs) {
            copy.data.matching_pairs = { items: copy.data.pairs || [] };
        }

        if (path === 'pairs_left') copy.data.matching_pairs.items[index].left_text = value;
        if (path === 'pairs_right') copy.data.matching_pairs.items[index].right_text = value;
        // NOWE: Step by Step
        if (path === 'steps') copy.data.step_by_step.steps[index][field] = value;
        setSelectedTask(copy);
    };  

    const addListItem = (type) => {
        const copy = JSON.parse(JSON.stringify(selectedTask)); // Deep copy dla bezpieczeństwa

        if (type === 'hint') copy.hints.push({ content: '', sort_order: copy.hints.length });
        
        if (type === 'expl') {
                if(!copy.explanation) copy.explanation = { steps: [] };
                if(!copy.explanation.steps) copy.explanation.steps = [];
                copy.explanation.steps.push({ content: '', sort_order: copy.explanation.steps.length });
        }

        if (type === 'answer') {
            if(!copy.data.multiple_choice) copy.data.multiple_choice = { answers: [] };
            copy.data.multiple_choice.answers.push({ answer_text: '', is_correct: false, sort_order: copy.data.multiple_choice.answers.length });
        }

        if (type === 'pair') {
            if(!copy.data.matching_pairs) copy.data.matching_pairs = { items: [] };
            copy.data.matching_pairs.items.push({ left_text: '', right_text: '', sort_order: copy.data.matching_pairs.items.length });
        }

        // NOWE: Step by Step
        if (type === 'step') {
            if(!copy.data.step_by_step) copy.data.step_by_step = { steps: [] };
            copy.data.step_by_step.steps.push({ 
                step_instruction: '', 
                step_answer: '', 
                answer_type: 'string', 
                sort_order: copy.data.step_by_step.steps.length 
            });
        }

        setSelectedTask(copy);
    };

    const removeListItem = (type, index) => {
        const copy = JSON.parse(JSON.stringify(selectedTask));
        if (type === 'hint') copy.hints.splice(index, 1);
        if (type === 'expl') copy.explanation.steps.splice(index, 1);
        if (type === 'answer') copy.data.multiple_choice.answers.splice(index, 1);
        if (type === 'pair') copy.data.matching_pairs.items.splice(index, 1);
        // NOWE: Step by Step
        if (type === 'step') copy.data.step_by_step.steps.splice(index, 1);
        setSelectedTask(copy);
    };


    if (loading) return <div style={msgStyle}>Wczytywanie bazy zadań...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
            
            {/* LEWY PANEL */}
            <div style={sidebarStyle}>
                <div style={sidebarHeader}>
                    <h3>Baza Zadań ({tasks.length})</h3>
                    <button style={addBtnStyle} onClick={handleNewTask}>+ NOWE</button>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {tasks.map(task => (
                        <div 
                            key={task.task_id} 
                            onClick={() => setSelectedTask(task)}
                            style={{
                                ...taskItemStyle,
                                borderLeft: selectedTask?.task_id === task.task_id ? '4px solid #0070f3' : '4px solid transparent',
                                backgroundColor: selectedTask?.task_id === task.task_id ? '#fff' : 'transparent'
                            }}
                        >
                            <span style={typeBadge(task.task_type_code)}>{task.task_type_code}</span>
                            <div style={taskQuestionSnippet}>{task.question || "(Brak pytania)"}</div>
                            <div style={taskMeta}>ID: {task.task_id}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRAWY PANEL */}
            <div style={editorAreaStyle}>
                {selectedTask ? (
                    <div style={editorContainer}>
                        
                        {/* HEADER */}
                        <div style={editorHeader}>
                            <div>
                                <label style={labelStyle}>TREŚĆ PYTANIA</label>
                                <textarea 
                                    style={questionInputStyle} 
                                    value={selectedTask.question}
                                    onChange={(e) => setSelectedTask({...selectedTask, question: e.target.value})}
                                />
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                                <div style={metaGrid}>
                                    <div>
                                        <label style={labelStyle}>PUNKTY</label>
                                        <input type="number" style={smallInput} value={selectedTask.points} onChange={(e) => setSelectedTask({...selectedTask, points: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>TRUDNOŚĆ</label>
                                        <input type="number" style={smallInput} value={selectedTask.difficulty} onChange={(e) => setSelectedTask({...selectedTask, difficulty: e.target.value})} />
                                    </div>
                                </div>
                                {/* Zmiana typu tylko dla nowych zadań */}
                                {!selectedTask.task_id && (
                                    <div>
                                        <label style={labelStyle}>TYP ZADANIA</label>
                                        <select 
                                            style={fullInput} 
                                            value={selectedTask.task_type_code}
                                            onChange={(e) => setSelectedTask({...selectedTask, task_type_code: e.target.value})}
                                        >
                                            {Object.keys(TYPE_MAP).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr style={divider} />

                        {/* SPECIFIC DATA EDITOR */}
                        <div style={sectionStyle}>
                            <h4 style={sectionTitle}>Odpowiedzi ({selectedTask.task_type_code})</h4>
                            <TypeSpecificEditor 
                                task={selectedTask} 
                                onUpdate={updateNestedList} 
                                onAdd={addListItem}
                                onRemove={removeListItem}
                                setTask={setSelectedTask} // Dla prostych pól
                            />
                        </div>

                        {/* HINTS */}
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'10px' }}>
                                <h4 style={{margin:0, color:'#444'}}>Podpowiedzi</h4>
                                <button style={miniBtn} onClick={() => addListItem('hint')}>+ Hint</button>
                            </div>
                            {selectedTask.hints?.map((hint, idx) => (
                                <div key={idx} style={itemRow}>
                                    <span style={indexTag}>{idx + 1}</span>
                                    <input 
                                        style={fullInput} 
                                        value={hint.content} 
                                        onChange={(e) => updateNestedList('hints', idx, 'content', e.target.value)}
                                    />
                                    <button style={delBtn} onClick={() => removeListItem('hint', idx)}>×</button>
                                </div>
                            ))}
                        </div>

                        {/* EXPLANATION */}
                        <div style={sectionStyle}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'10px' }}>
                                <h4 style={{margin:0, color:'#444'}}>Wyjaśnienie (Kroki)</h4>
                                <button style={miniBtn} onClick={() => addListItem('expl')}>+ Krok</button>
                            </div>
                            {selectedTask.explanation?.steps?.map((step, idx) => (
                                <div key={idx} style={{ marginBottom: '10px' }}>
                                    <label style={labelStyle}>KROK {idx + 1}</label>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <textarea 
                                            style={{...fullInput, height:'60px'}} 
                                            value={step.content} 
                                            onChange={(e) => updateNestedList('explanation', idx, 'content', e.target.value)}
                                        />
                                        <button style={delBtn} onClick={() => removeListItem('expl', idx)}>×</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div style={footerStyle}>
                            <button style={saveBtnStyle} onClick={handleSave} disabled={saving}>
                                {saving ? "ZAPISYWANIE..." : (selectedTask.task_id ? "ZAPISZ ZMIANY" : "UTWÓRZ ZADANIE")}
                            </button>
                            
                            {selectedTask.task_id && (
                                <button 
                                    style={{...delBtn, fontSize:'14px', marginTop:'15px', display:'block', width:'100%', textAlign:'center'}} 
                                    onClick={handleDelete}
                                >
                                    USUŃ ZADANIE TRWALE
                                </button>
                            )}
                        </div>

                    </div>
                ) : (
                    <div style={msgStyle}>Wybierz zadanie lub kliknij + NOWE</div>
                )}
            </div>
        </div>
    );
}

// --- SUB-KOMPONENT DO EDYCJI DANYCH ---
function TypeSpecificEditor({ task, onUpdate, onAdd, onRemove, setTask }) {
    //console.log("DEBUG TASK:", task);
    const type = String(task.task_type_code || "").trim().toUpperCase();

    if (type === 'MULTIPLE_CHOICE') {
        const answers = task.data.multiple_choice?.answers || [];
        return (
            <div>
                {answers.map((ans, idx) => (
                    <div key={idx} style={itemRow}>
                        <input 
                            type="checkbox" 
                            checked={ans.is_correct} 
                            onChange={(e) => onUpdate('answers', idx, 'is_correct', e.target.checked)}
                        />
                        <input 
                            style={fullInput} 
                            value={ans.answer_text} 
                            onChange={(e) => onUpdate('answers', idx, 'answer_text', e.target.value)}
                        />
                        <button style={delBtn} onClick={() => onRemove('answer', idx)}>×</button>
                    </div>
                ))}
                <button style={miniBtn} onClick={() => onAdd('answer')}>+ Opcja</button>
            </div>
        );
    }

    if (type === 'SINGLE_INPUT') {
        const si = task.data.single_input || {};
        const updateSI = (field, val) => {
            const copy = JSON.parse(JSON.stringify(task));
            if(!copy.data.single_input) copy.data.single_input = {};
            copy.data.single_input[field] = val;
            setTask(copy);
        };

        return (
            <div style={metaGrid}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>POPRAWNA WARTOŚĆ</label>
                    <input 
                        style={fullInput} 
                        value={si.correct_value || ''} 
                        onChange={(e) => updateSI('correct_value', e.target.value)}
                    />
                </div>
                <div>
                    <label style={labelStyle}>TYP</label>
                    <select 
                        style={smallInput} 
                        value={si.answer_type || 'string'}
                        onChange={(e) => updateSI('answer_type', e.target.value)}
                    >
                        <option value="string">Tekst</option>
                        <option value="integer">Liczba</option>
                        <option value="regex">Regex</option>
                    </select>
                </div>
            </div>
        );
    }

    if (type === 'MATCHING') {
        // Logika naprawcza: Sprawdzamy wszystkie możliwe miejsca, gdzie mogą być pary
        // 1. task.data.matching_pairs.items (Twoja struktura frontowa)
        // 2. task.data.pairs (Struktura, którą prawdopodobnie wysyła API)
        const items = task.data?.matching_pairs?.items || task.data?.pairs || [];

        return (
            <div>
                <div style={{marginBottom: '10px', fontSize: '12px', color: '#666'}}>
                    Edycja par dla zadania ID: {task.task_id || 'Nowe'}
                </div>
                {items.length === 0 && (
                    <div style={{padding: '20px', textAlign: 'center', border: '1px dashed #ccc', marginBottom: '10px'}}>
                        Brak zdefiniowanych par. Kliknij przycisk poniżej.
                    </div>
                )}
                {items.map((pair, idx) => (
                    <div key={idx} style={itemRow}>
                        <span style={indexTag}>{idx + 1}</span>
                        <input 
                            style={fullInput} 
                            value={pair.left_text || ''} 
                            placeholder="Lewy element" 
                            onChange={(e) => onUpdate('pairs_left', idx, null, e.target.value)}
                        />
                        <span style={{ fontWeight: 'bold', color: '#0070f3' }}>↔</span>
                        <input 
                            style={fullInput} 
                            value={pair.right_text || ''} 
                            placeholder="Prawy element" 
                            onChange={(e) => onUpdate('pairs_right', idx, null, e.target.value)}
                        />
                        <button style={delBtn} onClick={() => onRemove('pair', idx)}>×</button>
                    </div>
                ))}
                <button 
                    style={{...miniBtn, width: '100%', marginTop: '10px', padding: '10px'}} 
                    onClick={() => onAdd('pair')}
                >
                    + Dodaj nową parę
                </button>
            </div>
        );
    }
    if (type === 'STEP_BY_STEP') {
        const steps = task.data.step_by_step?.steps || [];
        return (
            <div>
                <div style={{marginBottom: '15px', color: '#666', fontSize: '12px', fontStyle: 'italic', backgroundColor: '#f0f7ff', padding: '10px', borderRadius: '4px'}}>
                    ℹ️ Każdy krok to osobne "mini-zadanie". Uczeń zobaczy Krok 2 dopiero, gdy poprawnie rozwiąże Krok 1.
                </div>
                {steps.map((step, idx) => (
                    <div key={idx} style={{
                        border: '1px solid #e0e0e0', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        marginBottom: '15px', 
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                            <span style={{fontWeight: 'bold', fontSize: '12px', color: '#0070f3', textTransform: 'uppercase'}}>
                                Krok {idx + 1}
                            </span>
                            <button style={delBtn} onClick={() => onRemove('step', idx)}>×</button>
                        </div>
                        
                        <div style={{marginBottom: '10px'}}>
                            <label style={labelStyle}>Instrukcja (Pytanie dla tego kroku)</label>
                            <textarea 
                                style={{...fullInput, height: '50px'}} 
                                value={step.step_instruction}
                                placeholder="Np. Oblicz deltę..."
                                onChange={(e) => onUpdate('steps', idx, 'step_instruction', e.target.value)}
                            />
                        </div>

                        <div style={metaGrid}>
                            <div style={{flex: 2}}>
                                <label style={labelStyle}>Poprawna Odpowiedź</label>
                                <input 
                                    style={fullInput} 
                                    value={step.step_answer} 
                                    placeholder="Wpisz wynik..."
                                    onChange={(e) => onUpdate('steps', idx, 'step_answer', e.target.value)}
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={labelStyle}>Walidacja</label>
                                <select 
                                    style={smallInput} 
                                    value={step.answer_type || 'string'}
                                    onChange={(e) => onUpdate('steps', idx, 'answer_type', e.target.value)}
                                >
                                    <option value="string">Tekst (Dokładny)</option>
                                    <option value="integer">Liczba</option>
                                    <option value="regex">Regex</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
                <button style={miniBtn} onClick={() => onAdd('step')}>+ Dodaj Krok Sekwencji</button>
            </div>
        );
    }

    return <div style={{ color: '#888' }}>Edytor w budowie...</div>;
}

// --- STYLE (Bez zmian) ---
const sidebarStyle = { width: '350px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' };
const sidebarHeader = { padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const taskItemStyle = { padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: '0.2s' };
const taskQuestionSnippet = { fontSize: '14px', fontWeight: '500', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '5px' };
const taskMeta = { fontSize: '11px', color: '#888' };
const editorAreaStyle = { overflowY: 'auto', padding: '40px', width: '100%' }; // Added width
const editorContainer = { maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const editorHeader = { display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', marginBottom: '20px' };
const metaGrid = { display: 'flex', gap: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' };
const questionInputStyle = { width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' };
const smallInput = { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' };
const fullInput = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const sectionStyle = { marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', borderRadius: '8px', border: '1px solid #f0f0f0' };
const sectionTitle = { margin: '0 0 15px 0', fontSize: '16px', color: '#444' };
const itemRow = { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' };
const indexTag = { backgroundColor: '#eee', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', color: '#666' };
const delBtn = { background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '20px' };
const miniBtn = { padding: '5px 12px', fontSize: '12px', cursor: 'pointer', border: '1px solid #0070f3', color: '#0070f3', borderRadius: '4px', background: '#fff' };
const saveBtnStyle = { width: '100%', padding: '15px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const addBtnStyle = { padding: '8px 15px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' };
const divider = { margin: '30px 0', border: '0', borderTop: '1px solid #eee' };
const msgStyle = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' };
const footerStyle = { marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' };

const typeBadge = (type) => ({
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: type === 'MULTIPLE_CHOICE' ? '#e6f7ff' : '#f6ffed',
    color: type === 'MULTIPLE_CHOICE' ? '#1890ff' : '#52c41a',
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'inline-block'
});