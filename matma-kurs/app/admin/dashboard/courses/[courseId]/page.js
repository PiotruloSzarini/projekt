'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TreeItem from '@/app/admin/components/TreeItem/TreeItem';

export default function AdminCourseEdit() {
    const { courseId } = useParams();
    const [tree, setTree] = useState([]);
    const [selected, setSelected] = useState(null); 
    const [isCreating, setIsCreating] = useState(false);
    const [editData, setEditData] = useState({});
    const [loading, setLoading] = useState(true);

    const [lessonDetails, setLessonDetails] = useState({ video: null, taskGroup: null, tasks: [] });

    const fetchStructure = async () => {
        try {
            const res = await fetch(`/api/admin/structure/${courseId}`);
            const data = await res.json();
            let structure = Array.isArray(data) ? data : [];
            structure = sortNodesRecursive(structure);
            structure = enrichDataWithParentIds(structure, null);
            setTree(structure);
            setLoading(false);
            return structure;
        } catch (err) { console.error(err); setLoading(false); }
    };

    const fetchLessonDetails = async (lessonId) => {
        setLessonDetails({ video: null, taskGroup: null, tasks: [] });
        try {
            const res = await fetch(`/api/admin/lesson-details?lessonId=${lessonId}`);
            const data = await res.json();
            setLessonDetails({
                video: data.video || null,
                taskGroup: data.taskGroup || null,
                tasks: data.tasks || []
            });
        } catch (err) { console.error("Błąd ładowania detali:", err); }
    };

    useEffect(() => { if (courseId) fetchStructure(); }, [courseId]);

    // --- FUNKCJE POMOCNICZE (PRZYWRÓCONE TWOJE) ---
    const sortNodesRecursive = (nodes) => {
        return [...nodes]
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
            .map(node => ({
                ...node,
                children: node.children ? sortNodesRecursive(node.children) : []
            }));
    };

    const enrichDataWithParentIds = (nodes, parentId = null) => {
        return nodes.map(node => ({
            ...node,
            parentId: parentId,
            children: node.children ? enrichDataWithParentIds(node.children, node.id) : []
        }));
    };

        const getSiblings = (nodes, parentId, type) => {
        console.log(`--- DEBUG SORTOWANIA ---`);
        console.log(`Szukany typ: ${type}, parentId rodzica: ${parentId}`);

        // 1. Obsługa Rozdziałów (brak parentId)
        if (!parentId || parentId === 'null') {
            const chapters = nodes.filter(n => n.type === 'chapter');
            console.log("Poziom główny (rozdziały):", chapters);
            return chapters;
        }

        // 2. Szukanie rodzica w głąb drzewa
        for (const node of nodes) {
            // Czy ten węzeł jest rodzicem, którego szukamy?
            if (String(node.id) === String(parentId)) {
                // Zwracamy wszystkie dzieci tego rodzica, które mają pasujący typ
                const siblings = node.children ? node.children.filter(c => c.type === type) : [];
                console.log(`Znaleziono rodzeństwo dla typu ${type} u rodzica ${node.name}:`, siblings);
                return siblings;
            }

            // Jeśli nie, szukaj głębiej w jego dzieciach
            if (node.children && node.children.length > 0) {
                const found = getSiblings(node.children, parentId, type);
                if (found.length > 0) return found;
            }
        }

        console.warn(`Nie znaleziono żadnych elementów typu ${type} dla parentId ${parentId}`);
        return [];
    };

    // --- AKCJE ---
    const handleSelectItem = (item) => {
        setIsCreating(false);
        setSelected(item);
        setEditData({ 
            id: item.id, 
            name: item.name, 
            type: item.type, 
            parentId: item.parentId, 
            sort: item.sort || 0 
        });
        
        if (item.type === 'lesson') {
            fetchLessonDetails(item.id);
        } else {
            setLessonDetails({ video: null, taskGroup: null, tasks: [] });
        }
    };

    const saveToDB = async (data, shouldClear = true) => {
        if (!data.name) return alert("Wpisz nazwę!");
        const endpoint = isCreating ? '/api/admin/create-content' : '/api/admin/update-content';
        const pId = (data.type === 'chapter') ? null : (data.parentId || null);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    type: data.type,
                    id: isCreating ? undefined : data.id,
                    newData: { name: data.name, parentId: pId, sort: Number(data.sort) }
                })
            });
            if (res.ok) {
                await fetchStructure();
                if (shouldClear) { setIsCreating(false); setSelected(null); }
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateSubItem = async (type, id, newData) => {
        if (!id) return alert("Brak ID elementu do aktualizacji");
        try {
            const res = await fetch('/api/admin/update-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, newData })
            });
            if (res.ok) alert("Zapisano zmiany!");
        } catch (err) { console.error(err); }
    };

    // --- POPRAWIONA FUNKCJA HANDLESWAP ---
    const handleSwap = async (direction) => {
        // Rozdziały mają parentId null w bazie/stanie
        const currentParentId = editData.parentId || null;
        const siblings = getSiblings(tree, currentParentId, editData.type);
        
        const myIndex = siblings.findIndex(s => s.id === editData.id);
        
        // Check dla konsoli przed swapem
        console.log("Index elementu:", myIndex, "Kierunek:", direction);

        if (myIndex === -1) {
            console.error("Nie znaleziono elementu w rodzeństwie!");
            return;
        }

        const neighborIndex = direction === 'up' ? myIndex - 1 : myIndex + 1;
        if (neighborIndex < 0 || neighborIndex >= siblings.length) {
            console.warn("Brak sąsiada w tym kierunku.");
            return;
        }

        const neighbor = siblings[neighborIndex];
        const mySort = Number(editData.sort);
        const neighborSort = Number(neighbor.sort);

        console.log(`Zamiana: [${editData.name} (sort: ${mySort})] <-> [${neighbor.name} (sort: ${neighborSort})]`);

        // 1. Aktualizacja sąsiada
        await fetch('/api/admin/update-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                courseId, 
                type: editData.type, 
                id: neighbor.id, 
                newData: { 
                    name: neighbor.name, 
                    parentId: currentParentId, 
                    sort: mySort 
                } 
            })
        });

        // 2. Aktualizacja wybranego elementu (siebie)
        const updatedSelf = { ...editData, sort: neighborSort };
        await saveToDB(updatedSelf, false);
        setEditData(updatedSelf);
    };

    const handleDelete = async () => {
        if (!confirm("Czy na pewno usunąć?")) return;
        const res = await fetch('/api/admin/delete-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: editData.type, id: editData.id })
        });
        if (res.ok) { fetchStructure(); setSelected(null); }
    };

    const prepareAddChild = () => {
        const typeMap = { 'chapter': 'topic', 'topic': 'lesson' };
        const nextType = typeMap[selected.type];
        const children = selected.children || [];
        const nextSort = children.length > 0 ? Math.max(...children.map(c => c.sort || 0)) + 1 : 1;
        setIsCreating(true);
        setEditData({ name: '', type: nextType, parentId: selected.id, sort: nextSort });
        setSelected(null);
    };

    const getAllowedParents = (nodes, childType, list = []) => {
        const rules = { 'topic': 'chapter', 'lesson': 'topic' };
        const requiredParentType = rules[childType];
        nodes.forEach(node => {
            if (node.type === requiredParentType) list.push({ id: node.id, name: node.name });
            if (node.children) getAllowedParents(node.children, childType, list);
        });
        return list;
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Ładowanie struktury...</div>;
    const filteredParents = getAllowedParents(tree, editData.type);

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
            {/* PANEL LEWY */}
            <div style={{ width: '350px', borderRight: '1px solid #eee', overflowY: 'auto', backgroundColor: '#fcfcfc' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fcfcfc', zIndex: 10 }}>
                    <h2 style={{ fontSize: '11px', color: '#aaa', margin: 0, letterSpacing: '1px' }}>STRUKTURA KURSU</h2>
                    <button onClick={() => { setIsCreating(true); setSelected(null); setEditData({ name: '', type: 'chapter', sort: tree.length + 1 }); }} style={smallBtn}>+ Rozdział</button>
                </div>
                {tree.map(item => (
                    <TreeItem key={item.id} item={item} level={0} onSelect={handleSelectItem} />
                ))}
            </div>

            {/* PANEL PRAWY */}
            <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>
                {(selected || isCreating) ? (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <span style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                {isCreating ? 'Tworzenie' : 'Edycja'} • {editData.type}
                            </span>
                            <input 
                                style={titleInput}
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                placeholder="Wpisz nazwę..."
                            />
                        </div>

                        {!isCreating && editData.type === 'lesson' && (
                            <div style={resourcePanel}>
                                <h3 style={{ fontSize: '12px', margin: '0 0 20px 0', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    MATERIAŁY DO LEKCJI
                                </h3>
                                
                                {/* WIDEO - OSOBNE ZAPISY */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={labelStyle}>TYTUŁ WIDEO</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                        <input 
                                            style={subInput} 
                                            placeholder={lessonDetails.video?.title || "Brak tytułu"}
                                            value={lessonDetails.video?.title || ''} 
                                            onChange={(e) => setLessonDetails({...lessonDetails, video: {...lessonDetails.video, title: e.target.value}})} 
                                        />
                                        <button style={saveSubBtn} onClick={() => handleUpdateSubItem('video', lessonDetails.video.video_id, { title: lessonDetails.video.title })}>OK</button>
                                    </div>

                                    <label style={labelStyle}>URL WIDEO</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            style={subInput} 
                                            placeholder={lessonDetails.video?.url || "Brak URL"}
                                            value={lessonDetails.video?.url || ''} 
                                            onChange={(e) => setLessonDetails({...lessonDetails, video: {...lessonDetails.video, url: e.target.value}})} 
                                        />
                                        <button style={saveSubBtn} onClick={() => handleUpdateSubItem('video', lessonDetails.video.video_id, { url: lessonDetails.video.url })}>OK</button>
                                    </div>
                                </div>

                                {/* GRUPA ZADAŃ - OSOBNY ZAPIS */}
                                <div style={{ paddingTop: '15px', borderTop: '1px solid #eee', marginBottom: '20px' }}>
                                    <label style={labelStyle}>NAZWA GRUPY ZADAŃ</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            style={subInput} 
                                            placeholder={lessonDetails.taskGroup?.title || "Brak nazwy grupy"}
                                            value={lessonDetails.taskGroup?.title || ''} 
                                            onChange={(e) => setLessonDetails({...lessonDetails, taskGroup: {...lessonDetails.taskGroup, title: e.target.value}})} 
                                        />
                                        <button style={saveSubBtn} onClick={() => handleUpdateSubItem('task_group', lessonDetails.taskGroup.task_group_id, { title: lessonDetails.taskGroup.title })}>OK</button>
                                    </div>
                                </div>

                                {/* LISTA ZADAŃ - TYLKO WYŚWIETLANIE (ZGODNIE Z PROŚBĄ) */}
                                <label style={labelStyle}>ZADANIA W TEJ GRUPIE (PODGLĄD)</label>
                                {lessonDetails.tasks?.map((task) => (
                                    <div key={task.task_id} style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '6px', fontSize: '13px', marginBottom: '5px' }}>
                                        {task.question || "Brak treści pytania"}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* KOLEJNOŚĆ I RODZIC (TWOJA LOGIKA) */}
                        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
                            <div>
                                <label style={labelStyle}>KOLEJNOŚĆ</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{editData.sort}</span>
                                    {!isCreating && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <button onClick={() => handleSwap('up')} style={sortBtn}>▲</button>
                                            <button onClick={() => handleSwap('down')} style={sortBtn}>▼</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editData.type !== 'chapter' && (
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>RODZIC</label>
                                    <select 
                                        style={selectStyle}
                                        value={editData.parentId || ''}
                                        onChange={(e) => setEditData({...editData, parentId: e.target.value})}
                                    >
                                        <option value="">Wybierz...</option>
                                        {filteredParents.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={() => saveToDB(editData, true)} style={mainBtn}>
                                {isCreating ? 'UTWÓRZ ELEMENT' : 'ZAPISZ ZMIANY GŁÓWNE'}
                            </button>
                            {!isCreating && editData.type !== 'lesson' && (
                                <button onClick={prepareAddChild} style={secondaryBtn}>
                                    + DODAJ {editData.type === 'chapter' ? 'TEMAT' : 'LEKCJĘ'}
                                </button>
                            )}
                            <button onClick={handleDelete} style={deleteBtn}>USUŃ</button>
                            <button onClick={() => { setIsCreating(false); setSelected(null); }} style={cancelBtn}>Anuluj</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', marginTop: '100px' }}>Wybierz element, aby edytować</div>
                )}
            </div>
        </div>
    );
}

const titleInput = { width: '100%', fontSize: '28px', fontWeight: 'bold', border: 'none', borderBottom: '2px solid #eee', outline: 'none', padding: '10px 0' };
const labelStyle = { display: 'block', fontSize: '10px', color: '#aaa', marginBottom: '5px', letterSpacing: '1px', fontWeight: 'bold' };
const selectStyle = { width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff' };
const sortBtn = { width: '30px', height: '22px', fontSize: '10px', cursor: 'pointer', border: '1px solid #eee', background: '#fff', borderRadius: '4px' };
const mainBtn = { padding: '16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const secondaryBtn = { padding: '16px', backgroundColor: '#fff', color: '#0070f3', border: '1px solid #0070f3', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtn = { padding: '16px', backgroundColor: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtn = { padding: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' };
const smallBtn = { padding: '6px 12px', fontSize: '11px', cursor: 'pointer', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', fontWeight: 'bold' };
const resourcePanel = { backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #eee' };
const subInput = { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '0', width: '100%' };
const saveSubBtn = { height: '38px', padding: '0 15px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };