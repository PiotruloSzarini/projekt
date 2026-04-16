'use client';
import { useState, useEffect } from 'react';

const CLOUDINARY_UPLOAD_PRESET = "omm_photos"; 
const CLOUDINARY_CLOUD_NAME = "ds6xrritb";

const TYPE_MAP = {
    'MULTIPLE_CHOICE': 1,
    'SINGLE_INPUT': 2,
    'MATCHING': 3,
    'STEP_BY_STEP': 4
};

const BLANK_TASK = {
    task_id: null,
    task_group_id: null,
    task_type_code: 'MULTIPLE_CHOICE',
    question: '',
    math_img: null,
    math_content: '',
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
    const [availableGroups, setAvailableGroups] = useState([]);

    useEffect(() => {
        loadTasks();
        loadGroups();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await fetch('/api/admin/task-structure');
            const data = await res.json();
            setTasks(data);
            if (!selectedTask && data.length > 0) setSelectedTask(data[0]);
        } catch (err) {
            console.error("Błąd ładowania:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadGroups = async () => {
        try {
            const res = await fetch('/api/admin/tasks/task-groups');
            const data = await res.json();
            setAvailableGroups(data);
        } catch (err) { console.error("Błąd grup:", err); }
    };

    // --- FUNKCJA UPLOADU DO CLOUDINARY ---
    const uploadImage = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.secure_url) return data.secure_url;
            throw new Error(data.error?.message || "Upload failed");
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Błąd podczas przesyłania zdjęcia: " + err.message);
            return null;
        }
    };

    const preparePayload = () => {
        const typeCode = selectedTask.task_type_code;
        const typeId = TYPE_MAP[typeCode];
        
        let details = {};
        if (typeCode === 'MULTIPLE_CHOICE') details = { ...selectedTask.data.multiple_choice };
        else if (typeCode === 'SINGLE_INPUT') details = { ...selectedTask.data.single_input };
        else if (typeCode === 'MATCHING') details = { pairs: selectedTask.data.matching_pairs.items };
        else if (typeCode === 'STEP_BY_STEP') details = { steps: selectedTask.data.step_by_step.steps };

        return {
            task_id: selectedTask.task_id,
            task_group_id: selectedTask.task_group_id || 1, 
            task_type_id: typeId,
            question: selectedTask.question,
            math_img: selectedTask.math_img,
            math_content: selectedTask.math_content,
            points: parseInt(selectedTask.points),
            difficulty: parseInt(selectedTask.difficulty),
            hints: selectedTask.hints,
            explanation: selectedTask.explanation,
            details: details
        };
    };

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
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error);
            }
            alert("Zapisano pomyślnie!");
            await loadTasks();
        } catch (err) {
            alert("Błąd zapisu: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTask.task_id) return;
        if (!confirm("Czy na pewno usunąć to zadanie? (Obrazki zostaną również usunięte z chmury)")) return;
        try {
            const res = await fetch(`/api/admin/tasks/delete?task_id=${selectedTask.task_id}`, { method: 'DELETE' });
            if (res.ok) {
                const newTasks = tasks.filter(t => t.task_id !== selectedTask.task_id);
                setTasks(newTasks);
                setSelectedTask(newTasks.length > 0 ? newTasks[0] : null);
            }
        } catch (err) { console.error(err); }
    };

    const handleAssign = async (taskId, groupId) => {
        if (!taskId) {
            alert("Najpierw musisz zapisać zadanie, aby przypisać je do grupy.");
            return;
        }
        const numericGroupId = groupId ? parseInt(groupId) : null;
        try {
            const res = await fetch('/api/admin/tasks/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, task_group_id: numericGroupId })
            });
            if (res.ok) {
                setSelectedTask(prev => ({ ...prev, task_group_id: numericGroupId }));
                setTasks(prevTasks => prevTasks.map(t => t.task_id === taskId ? { ...t, task_group_id: numericGroupId } : t));
                alert("Zadanie przypisane pomyślnie!");
            }
        } catch (err) { alert("Błąd przypisywania: " + err.message); }
    };

    const updateNestedList = (path, index, field, value) => {
        const copy = JSON.parse(JSON.stringify(selectedTask));
        
        if (path === 'hints') copy.hints[index].content = value;
        if (path === 'explanation') copy.explanation.steps[index].content = value;
        if (path === 'answers') copy.data.multiple_choice.answers[index][field] = value;
        
        if (path === 'pairs_left') copy.data.matching_pairs.items[index].left_text = value;
        if (path === 'pairs_right') copy.data.matching_pairs.items[index].right_text = value;
        
        // NOWE: Obsługa zdjęć w parach
        if (path === 'pairs_left_img') copy.data.matching_pairs.items[index].left_photo_url = value;
        if (path === 'pairs_right_img') copy.data.matching_pairs.items[index].right_photo_url = value;
        
        if (path === 'steps') copy.data.step_by_step.steps[index][field] = value;
        
        setSelectedTask(copy);
    };

    const addListItem = (type) => {
        const copy = JSON.parse(JSON.stringify(selectedTask));
        if (type === 'hint') copy.hints.push({ content: '', sort_order: copy.hints.length });
        if (type === 'expl') {
            if(!copy.explanation) copy.explanation = { steps: [] };
            copy.explanation.steps.push({ content: '', sort_order: copy.explanation.steps.length });
        }
        if (type === 'answer') {
            if(!copy.data.multiple_choice) copy.data.multiple_choice = { answers: [] };
            copy.data.multiple_choice.answers.push({ answer_text: '', is_correct: false, sort_order: copy.data.multiple_choice.answers.length });
        }
        if (type === 'pair') {
            if(!copy.data.matching_pairs) copy.data.matching_pairs = { items: [] };
            copy.data.matching_pairs.items.push({ 
                left_text: '', left_photo_url: null, 
                right_text: '', right_photo_url: null, 
                sort_order: copy.data.matching_pairs.items.length 
            });
        }
        if (type === 'step') {
            if(!copy.data.step_by_step) copy.data.step_by_step = { steps: [] };
            copy.data.step_by_step.steps.push({ 
                step_instruction: '', step_answer: '', answer_type: 'string', 
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
                    <button style={addBtnStyle} onClick={() => setSelectedTask(JSON.parse(JSON.stringify(BLANK_TASK)))}>+ NOWE</button>
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
                            <div style={taskMeta}>ID: {task.task_id} | Grupa: {task.task_group_id || 'Brak'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRAWY PANEL */}
            <div style={editorAreaStyle}>
                {selectedTask ? (
                    <div style={editorContainer}>
                        <div style={editorHeader}>
                            <div>
                                <label style={labelStyle}>TREŚĆ PYTANIA</label>
                                <textarea 
                                    style={questionInputStyle} 
                                    value={selectedTask.question}
                                    onChange={(e) => setSelectedTask({...selectedTask, question: e.target.value})}
                                />
                                
                                {/* GŁÓWNE ZDJĘCIE ZADANIA - POPRAWIONE */}
                                <div style={imageUploadBox}>
                                    <label style={labelStyle}>ZDJĘCIE POMOCNICZE / WYKRES</label>
                                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                        <input 
                                            key={`main-img-${selectedTask.task_id || 'new'}`} 
                                            type="file" 
                                            onChange={async (e) => {
                                                const url = await uploadImage(e.target.files[0]);
                                                if(url) setSelectedTask({...selectedTask, math_img: url});
                                            }} 
                                        />
                                        {/* INFORMACJA TEKSTOWA I PODGLĄD */}
                                        {selectedTask.math_img ? (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e6f7ff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #91d5ff'}}>
                                                <span style={{fontSize: '11px', color: '#1890ff', fontWeight: 'bold'}}>✓ ZDJĘCIE WGRANE</span>
                                                <div style={{position:'relative'}}>
                                                    <img src={selectedTask.math_img} style={previewImgSm} alt="Podgląd" />
                                                    <button style={removeImgBtn} onClick={() => setSelectedTask({...selectedTask, math_img: null})}>×</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{fontSize: '11px', color: '#aaa'}}>Brak zdjęcia (puste)</span>
                                        )}
                                    </div>
                                </div>

                                {/* NOWE: MATH CONTENT (LATEX) */}
                                <div style={{marginTop: '15px'}}>
                                    <label style={labelStyle}>TREŚĆ MATEMATYCZNA (np. KaTeX / LaTeX)</label>
                                    <input 
                                        style={fullInput} 
                                        value={selectedTask.math_content || ''} 
                                        onChange={(e) => setSelectedTask({...selectedTask, math_content: e.target.value})} 
                                        placeholder="np. x^2 + y^2 = r^2"
                                    />
                                </div>
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

                        <div style={sectionStyle}>
                            <h4 style={sectionTitle}>Konfiguracja Odpowiedzi</h4>
                            <TypeSpecificEditor 
                                task={selectedTask} 
                                onUpdate={updateNestedList} 
                                onAdd={addListItem}
                                onRemove={removeListItem}
                                setTask={setSelectedTask}
                                uploadImage={uploadImage}
                            />
                        </div>

                        {/* PODPOWIEDZI */}
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'10px' }}>
                                <h4 style={{margin:0, color:'#444'}}>Podpowiedzi (Hints)</h4>
                                <button style={miniBtn} onClick={() => addListItem('hint')}>+ Dodaj Hint</button>
                            </div>
                            {selectedTask.hints?.map((hint, idx) => (
                                <div key={idx} style={itemRow}>
                                    <span style={indexTag}>{idx + 1}</span>
                                    <input 
                                        style={fullInput} 
                                        value={hint.content} 
                                        onChange={(e) => updateNestedList('hints', idx, 'content', e.target.value)}
                                        placeholder="Treść podpowiedzi..."
                                    />
                                    <button style={delBtn} onClick={() => removeListItem('hint', idx)}>×</button>
                                </div>
                            ))}
                        </div>

                        {/* WYJAŚNIENIE */}
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'10px' }}>
                                <h4 style={{margin:0, color:'#444'}}>Wyjaśnienie Rozwiązania</h4>
                                <button style={miniBtn} onClick={() => addListItem('expl')}>+ Dodaj Krok</button>
                            </div>
                            {selectedTask.explanation?.steps?.map((step, idx) => (
                                <div key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
                                        <div style={{flex: 1}}>
                                            <label style={labelStyle}>KROK {idx + 1}</label>
                                            <textarea 
                                                style={{...fullInput, height:'60px'}} 
                                                value={step.content} 
                                                onChange={(e) => updateNestedList('explanation', idx, 'content', e.target.value)}
                                                placeholder="Opisz ten krok..."
                                            />
                                        </div>
                                        <button style={{...delBtn, marginTop: '25px'}} onClick={() => removeListItem('expl', idx)}>×</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* GRUPA */}
                        <div style={sectionStyle}>
                            <label style={labelStyle}>PRZYPISZ DO GRUPY</label>
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <select
                                    style={fullInput}
                                    value={selectedTask.task_group_id || ''}
                                    onChange={(e) => handleAssign(selectedTask.task_id, e.target.value)}
                                    disabled={!selectedTask.task_id}
                                >
                                    <option value="">-- Wybierz grupę --</option>
                                    {availableGroups.map(group => (
                                        <option key={group.task_group_id} value={group.task_group_id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={footerStyle}>
                            <button style={saveBtnStyle} onClick={handleSave} disabled={saving}>
                                {saving ? "ZAPISYWANIE..." : (selectedTask.task_id ? "ZAPISZ ZMIANY" : "UTWÓRZ ZADANIE")}
                            </button>
                            {selectedTask.task_id && (
                                <button style={deleteTaskBtn} onClick={handleDelete}>USUŃ ZADANIE TRWALE</button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={msgStyle}>Wybierz zadanie lub utwórz nowe.</div>
                )}
            </div>
        </div>
    );
}

function TypeSpecificEditor({ task, onUpdate, onAdd, onRemove, setTask, uploadImage }) {
    const type = String(task.task_type_code || "").trim().toUpperCase();

    if (type === 'MULTIPLE_CHOICE') {
        const answers = task.data.multiple_choice?.answers || [];
        return (
            <div>
                {answers.map((ans, idx) => (
                    <div key={idx} style={itemRow}>
                        <input type="checkbox" checked={ans.is_correct} onChange={(e) => onUpdate('answers', idx, 'is_correct', e.target.checked)} />
                        <input style={fullInput} value={ans.answer_text} onChange={(e) => onUpdate('answers', idx, 'answer_text', e.target.value)} placeholder="Treść odpowiedzi" />
                        <button style={delBtn} onClick={() => onRemove('answer', idx)}>×</button>
                    </div>
                ))}
                <button style={miniBtn} onClick={() => onAdd('answer')}>+ Dodaj opcję</button>
            </div>
        );
    }

    if (type === 'SINGLE_INPUT') {
        const si = task.data.single_input || {};
        const updateSI = (f, v) => {
            const copy = JSON.parse(JSON.stringify(task));
            if(!copy.data.single_input) copy.data.single_input = {};
            copy.data.single_input[f] = v;
            setTask(copy);
        };
        return (
            <div style={metaGrid}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>POPRAWNA WARTOŚĆ</label>
                    <input style={fullInput} value={si.correct_value || ''} onChange={(e) => updateSI('correct_value', e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>TYP</label>
                    <select style={smallInput} value={si.answer_type || 'string'} onChange={(e) => updateSI('answer_type', e.target.value)}>
                        <option value="string">Tekst</option>
                        <option value="integer">Liczba</option>
                        <option value="regex">Regex</option>
                    </select>
                </div>
            </div>
        );
    }

    if (type === 'MATCHING') {
        const items = task.data?.matching_pairs?.items || [];
        return (
            <div>
                {items.map((pair, idx) => (
                    <div key={idx} style={pairContainer}>
                        <div style={{display:'flex', gap: '15px', alignItems: 'center'}}>
                            {/* LEWA STRONA */}
                            <div style={{flex: 1}}>
                                <input style={fullInput} value={pair.left_text || ''} placeholder="Tekst lewy" onChange={(e) => onUpdate('pairs_left', idx, null, e.target.value)} />
                                <div style={uploadRow}>
                                    <input type="file" style={{fontSize:'9px'}} onChange={async (e) => {
                                        const url = await uploadImage(e.target.files[0]);
                                        if(url) onUpdate('pairs_left_img', idx, null, url);
                                    }} />
                                    {pair.left_photo_url && <img src={pair.left_photo_url} style={previewImgSm} />}
                                </div>
                            </div>

                            <span style={{ fontWeight: 'bold', color: '#0070f3' }}>↔</span>

                            {/* PRAWA STRONA */}
                            <div style={{flex: 1}}>
                                <input style={fullInput} value={pair.right_text || ''} placeholder="Tekst prawy" onChange={(e) => onUpdate('pairs_right', idx, null, e.target.value)} />
                                <div style={uploadRow}>
                                    <input type="file" style={{fontSize:'9px'}} onChange={async (e) => {
                                        const url = await uploadImage(e.target.files[0]);
                                        if(url) onUpdate('pairs_right_img', idx, null, url);
                                    }} />
                                    {pair.right_photo_url && <img src={pair.right_photo_url} style={previewImgSm} />}
                                </div>
                            </div>
                            
                            <button style={delBtn} onClick={() => onRemove('pair', idx)}>×</button>
                        </div>
                    </div>
                ))}
                <button style={{...miniBtn, width: '100%'}} onClick={() => onAdd('pair')}>+ Dodaj parę</button>
            </div>
        );
    }

    if (type === 'STEP_BY_STEP') {
        const steps = task.data.step_by_step?.steps || [];
        return (
            <div>
                {steps.map((step, idx) => (
                    <div key={idx} style={sbsStepBox}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <strong>Krok {idx + 1}</strong>
                            <button style={delBtn} onClick={() => onRemove('step', idx)}>×</button>
                        </div>
                        <label style={labelStyle}>Polecenie</label>
                        <textarea style={fullInput} value={step.step_instruction} onChange={(e) => onUpdate('steps', idx, 'step_instruction', e.target.value)} />
                        <div style={metaGrid}>
                            <input style={{flex:2, ...smallInput}} placeholder="Odpowiedź" value={step.step_answer} onChange={(e) => onUpdate('steps', idx, 'step_answer', e.target.value)} />
                            <select style={{flex:1, ...smallInput}} value={step.answer_type} onChange={(e) => onUpdate('steps', idx, 'answer_type', e.target.value)}>
                                <option value="string">Tekst</option>
                                <option value="integer">Liczba</option>
                            </select>
                        </div>
                    </div>
                ))}
                <button style={miniBtn} onClick={() => onAdd('step')}>+ Dodaj Krok</button>
            </div>
        );
    }
    return null;
}

// --- STYLE ---
const sidebarStyle = { width: '350px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' };
const sidebarHeader = { padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const taskItemStyle = { padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: '0.2s' };
const taskQuestionSnippet = { fontSize: '14px', fontWeight: '500', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '5px' };
const taskMeta = { fontSize: '11px', color: '#888' };
const editorAreaStyle = { overflowY: 'auto', padding: '40px', flex: 1 };
const editorContainer = { maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const editorHeader = { display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', marginBottom: '20px' };
const metaGrid = { display: 'flex', gap: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#aaa', marginBottom: '5px', textTransform: 'uppercase' };
const questionInputStyle = { width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' };
const smallInput = { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' };
const fullInput = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '5px' };
const sectionStyle = { marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', borderRadius: '8px', border: '1px solid #f0f0f0' };
const sectionTitle = { margin: '0 0 15px 0', fontSize: '16px', color: '#444', borderBottom: '1px solid #eee', paddingBottom: '5px' };
const itemRow = { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' };
const indexTag = { backgroundColor: '#eee', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', color: '#666' };
const delBtn = { background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '20px' };
const miniBtn = { padding: '5px 12px', fontSize: '12px', cursor: 'pointer', border: '1px solid #0070f3', color: '#0070f3', borderRadius: '4px', background: '#fff' };
const saveBtnStyle = { width: '100%', padding: '15px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const addBtnStyle = { padding: '8px 15px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' };
const divider = { margin: '30px 0', border: '0', borderTop: '1px solid #eee' };
const msgStyle = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' };
const footerStyle = { marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' };

const imageUploadBox = { marginTop: '15px', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fafafa' };
const previewImgSm = { height: '40px', borderRadius: '4px', border: '1px solid #eee', objectFit: 'contain' };
const removeImgBtn = { position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '10px', cursor: 'pointer' };
const pairContainer = { padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#fff' };
const uploadRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' };
const sbsStepBox = { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#fff' };
const deleteTaskBtn = { background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', width: '100%', marginTop: '15px', textDecoration: 'underline' };

const typeBadge = (type) => ({
    fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
    backgroundColor: type === 'MULTIPLE_CHOICE' ? '#e6f7ff' : '#f6ffed',
    color: type === 'MULTIPLE_CHOICE' ? '#1890ff' : '#52c41a',
    fontWeight: 'bold', marginBottom: '5px', display: 'inline-block'
});