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

    // --- POBIERANIE I PRZETWARZANIE DANYCH ---

    const fetchStructure = async () => {
        try {
            const res = await fetch(`/api/admin/structure/${courseId}`);
            const data = await res.json();
            let structure = Array.isArray(data) ? data : [];

            // 1. Najpierw sortujemy
            structure = sortNodesRecursive(structure);
            // 2. Potem dopisujemy każdemu elementowi ID jego rodzica
            structure = enrichDataWithParentIds(structure, null);

            setTree(structure);
            setLoading(false);
            return structure;
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { if (courseId) fetchStructure(); }, [courseId]);

    // Rekurencyjne sortowanie po sort_order
    const sortNodesRecursive = (nodes) => {
        return nodes
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
            .map(node => ({
                ...node,
                children: node.children ? sortNodesRecursive(node.children) : []
            }));
    };

    // KLUCZOWA POPRAWKA: Dopisujemy parentId do każdego dziecka, żeby Swap wiedział gdzie szukać
    const enrichDataWithParentIds = (nodes, parentId) => {
        return nodes.map(node => ({
            ...node,
            parentId: parentId, // Tutaj przypisujemy rodzica na sztywno
            children: node.children ? enrichDataWithParentIds(node.children, node.id) : []
        }));
    };

    // --- LOGIKA SORTOWANIA (SWAP) ---

    const getSiblings = (nodes, parentId, type) => {
    if (type === 'chapter') return nodes;

    for (const node of nodes) {
        // Porównujemy jako stringi, żeby uniknąć problemów typowania
        if (node.id?.toString() === parentId?.toString()) {
            return node.children ? node.children.filter(c => c.type === type) : [];
        }
        if (node.children && node.children.length > 0) {
            const found = getSiblings(node.children, parentId, type);
            if (found && found.length > 0) return found;
        }
    }
    return [];
};

    const handleSwap = async (direction) => {
    // SPRAWDZENIE: Czy użytkownik nie zmienił rodzica w UI przed kliknięciem strzałki?
    if (selected.parentId?.toString() !== editData.parentId?.toString()) {
        alert("Zapisz zmiany (nowego rodzica), zanim zaczniesz sortować!");
        return;
    }

    const siblings = getSiblings(tree, editData.parentId, editData.type);
    
    if (!siblings || siblings.length === 0) {
        console.error("Nie znaleziono rodzeństwa dla:", editData.parentId);
        return;
    }

    const myIndex = siblings.findIndex(s => s.id === editData.id);
    if (myIndex === -1) return;

    const neighborIndex = direction === 'up' ? myIndex - 1 : myIndex + 1;
    if (neighborIndex < 0 || neighborIndex >= siblings.length) return;

    const neighbor = siblings[neighborIndex];

    // Logika Swapu
    const mySort = Number(editData.sort);
    const neighborSort = Number(neighbor.sort);

    await updateItemRequest({ ...neighbor, sort: mySort });
    const updatedSelf = { ...editData, sort: neighborSort };
    await updateItemRequest(updatedSelf);

    setEditData(updatedSelf); 
    // Ważne: po fetchStructure, selected też musi się odświeżyć
    const newStructure = await fetchStructure();
    
    // Opcjonalnie: aktualizujemy selected, żeby synchronizacja parentId była zachowana
    if (newStructure) {
        // Tu można by dodać funkcję findInTree, żeby odświeżyć 'selected'
    }
};

    const updateItemRequest = async (itemData) => {
        // Upewniamy się, że parentId jest poprawny
        const pId = (itemData.type === 'chapter') ? null : (itemData.parentId || null);
        
        await fetch('/api/admin/update-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId,
                type: itemData.type,
                id: itemData.id,
                newData: { 
                    name: itemData.name, 
                    parentId: pId, 
                    sort: Number(itemData.sort) 
                }
            })
        });
    };

    // --- UI I EDYCJA ---

    const handleSelectItem = (item) => {
        setIsCreating(false);
        setSelected(item);
        setEditData({ 
            id: item.id, 
            name: item.name, 
            type: item.type, 
            parentId: item.parentId, // Teraz to pole na pewno istnieje dzięki enrichDataWithParentIds
            sort: item.sort || 0 
        });
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
                if (shouldClear) {
                    setIsCreating(false);
                    setSelected(null);
                }
            } else {
                alert("Błąd zapisu");
            }
        } catch (err) { console.error(err); }
    };

    // --- TWORZENIE (DODAWANIE) ---

    const getNextSortOrder = (parentId, type) => {
        // Tu używamy parentId, więc ważne, żeby funkcja getSiblings działała poprawnie
        const siblings = getSiblings(tree, parentId, type);
        const maxSort = siblings.reduce((max, item) => Math.max(max, item.sort || 0), 0);
        return maxSort + 1;
    };

    const handleAddChapter = () => {
        const nextSort = getNextSortOrder(null, 'chapter');
        setIsCreating(true);
        setSelected(null);
        setEditData({ name: '', type: 'chapter', parentId: null, sort: nextSort });
    };

    const prepareAddChild = () => {
        if (!selected) return;
        const typeMap = { 'chapter': 'topic', 'topic': 'lesson', 'lesson': 'task_group' };
        const nextType = typeMap[selected.type];
        
        // Szukamy dzieci w selected (bo to jest rodzic)
        // Jeśli selected nie ma jeszcze dzieci, sort zaczynamy od 1
        const children = selected.children || [];
        const nextSort = children.reduce((max, item) => Math.max(max, item.sort || 0), 0) + 1;

        setIsCreating(true);
        // Ważne: parentId dla nowego elementu to ID aktualnie zaznaczonego (selected.id)
        setEditData({ name: '', type: nextType, parentId: selected.id, sort: nextSort });
        setSelected(null);
    };

    const getBtnLabel = () => {
        if (isCreating) return "ZAPISZ NOWY ELEMENT";
        const currentType = selected?.type;
        const labelMap = { 'chapter': 'TEMAT', 'topic': 'LEKCJĘ', 'lesson': 'GRUPĘ ZADAŃ' };
        return `DODAJ ${labelMap[currentType] || 'PODELEMENT'}`;
    };

    const getAllowedParents = (nodes, childType, list = []) => {
        const rules = { 'topic': 'chapter', 'lesson': 'topic', 'task_group': 'lesson' };
        const requiredParentType = rules[childType];
        if (!requiredParentType) return [];
        nodes.forEach(node => {
            if (node.type === requiredParentType) list.push({ id: node.id, name: node.name });
            if (node.children) getAllowedParents(node.children, childType, list);
        });
        return list;
    };

    if (loading) return <div>Ładowanie...</div>;

    const filteredParents = getAllowedParents(tree, editData.type);

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
            {/* LEWA STRONA */}
            <div style={{ width: '350px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>STRUKTURA</h2>
                    <button onClick={handleAddChapter} style={smallBtn}>+ Rozdział</button>
                </div>
                {tree.map(item => (
                    <TreeItem key={item.id} item={item} level={0} onSelect={handleSelectItem} />
                ))}
            </div>

            {/* PRAWA STRONA */}
            <div style={{ flex: 1, padding: '60px' }}>
                {(selected || isCreating) ? (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '30px' }}>
                                <span style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase' }}>
                                {isCreating ? 'TWORZENIE: ' : 'EDYCJA: '} {editData.type}
                            </span>
                            <input 
                                style={titleInput}
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                placeholder="Wpisz nazwę..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                            {/* SORTOWANIE */}
                            <div>
                                <label style={labelStyle}>KOLEJNOŚĆ</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{editData.sort}</span>
                                    {!isCreating && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <button onClick={() => handleSwap('up')} style={sortBtn}>▲</button>
                                            <button onClick={() => handleSwap('down')} style={sortBtn}>▼</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RODZIC SELECT */}
                            {editData.type !== 'chapter' && (
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>PRZENIEŚ DO</label>
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => saveToDB(editData, true)} style={mainBtn}>
                                {isCreating ? 'UTWÓRZ ELEMENT' : 'ZAPISZ ZMIANY'}
                            </button>

                            {!isCreating && editData.type !== 'task_group' && (
                                <button onClick={prepareAddChild} style={secondaryBtn}>
                                    + {getBtnLabel()}
                                </button>
                            )}
                            
                            <button onClick={() => { setIsCreating(false); setSelected(null); }} style={cancelBtn}>
                                Anuluj
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', marginTop: '100px' }}>
                        Wybierz element z listy po lewej
                    </div>
                )}
            </div>
        </div>
    );
}

// STYLE BEZ ZMIAN
const titleInput = { width: '100%', fontSize: '28px', fontWeight: 'bold', border: 'none', borderBottom: '2px solid #eee', outline: 'none', padding: '10px 0' };
const labelStyle = { display: 'block', fontSize: '10px', color: '#bbb', marginBottom: '5px', letterSpacing: '1px' };
const selectStyle = { width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '6px', fontSize: '14px' };
const sortBtn = { width: '30px', height: '20px', fontSize: '10px', cursor: 'pointer', border: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const mainBtn = { padding: '15px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' };
const secondaryBtn = { padding: '15px', backgroundColor: '#fff', color: '#0070f3', border: '1px solid #0070f3', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' };
const cancelBtn = { padding: '10px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline' };
const smallBtn = { padding: '5px 10px', fontSize: '11px', cursor: 'pointer', border: '1px solid #eee', background: '#fff', borderRadius: '4px' };