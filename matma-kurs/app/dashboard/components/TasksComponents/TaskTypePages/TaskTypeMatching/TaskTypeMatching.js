import { useState, useEffect } from 'react';
import styles from './TaskTypeMatching.module.css';

export default function TaskTypeMatching({ task, answer = {}, setAnswer, courseColor }) {
  const items = task.details?.items || [];
  const [shuffledRights, setShuffledRights] = useState([]);

  useEffect(() => {
    const rights = items.map(item => ({
      id: item.pair_item_id,
      text: item.right_text,
      photo: item.right_photo_url
    })).sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
  }, [task.task_id]);

  // UPROSZCZONY onDragStart - przekazujemy same ID
  const onDragStart = (e, draggedItemId, sourceFieldId) => {
    e.dataTransfer.setData("draggedItemId", draggedItemId);
    e.dataTransfer.setData("sourceFieldId", sourceFieldId); // To z automatu staje się stringiem w dataTransfer
  };

  const handleDrop = (e, targetFieldId = null) => {
    e.preventDefault();
    
    // Pobieramy dane jako czyste wartości
    const draggedItemId = Number(e.dataTransfer.getData("draggedItemId"));
    const sourceFieldIdRaw = e.dataTransfer.getData("sourceFieldId");
    
    // Odzyskujemy typ sourceFieldId (jeśli to nie "pool", to musi być liczba, by zgadzała się z kluczami)
    const sourceFieldId = sourceFieldIdRaw === "pool" ? "pool" : Number(sourceFieldIdRaw);

    let nextState = { ...answer };

    // --- PRZYPADEK 1: Upuszczenie do puli (targetFieldId to null) ---
    if (targetFieldId === null) {
      if (sourceFieldId !== "pool") {
        delete nextState[sourceFieldId];
      }
      setAnswer(nextState);
      return;
    }

    // --- PRZYPADEK 2: Upuszczenie do POLA ---
    const existingItemIdInTarget = nextState[targetFieldId];

    // Zabezpieczenie: Jeśli upuszczamy w tym samym miejscu, nie robimy nic
    if (sourceFieldId === targetFieldId) return;

    // A. Jeśli przeciągamy z PULI
    if (sourceFieldId === "pool") {
      // Jeśli w polu docelowym coś było, zostanie po prostu nadpisane, 
      // a tym samym usunięte ze stanu answer i wróci do puli.
      nextState[targetFieldId] = draggedItemId;
    } 
    // B. Jeśli przeciągamy z INNEGO POLA
    else {
      if (existingItemIdInTarget !== undefined) {
        // ZAMIANA (SWAP): W polu docelowym coś jest
        // Pole źródłowe otrzymuje to, co było w polu docelowym
        nextState[sourceFieldId] = existingItemIdInTarget;
      } else {
        // PRZENIESIENIE (MOVE): Pole docelowe jest puste
        // Czyścimy pole źródłowe
        delete nextState[sourceFieldId];
      }
      // W obu przypadkach pole docelowe otrzymuje przeciągany element
      nextState[targetFieldId] = draggedItemId;
    }

    // Dodatkowe zabezpieczenie czyszczące ewentualne duplikaty na innych polach
    Object.keys(nextState).forEach(key => {
      if (nextState[key] === draggedItemId && Number(key) !== targetFieldId) {
        delete nextState[key];
      }
    });

    setAnswer(nextState);
  };

  // Funkcja pomocnicza do szukania pełnego obiektu na podstawie ID
  const getFullItemObj = (id) => {
    return items.find(i => i.pair_item_id === id) || shuffledRights.find(i => i.id === id);
  };

  return (
    <div className={styles.container}>

      <div className={styles.matchingGrid}>
        {items.map((item) => (
          <div key={item.pair_item_id} className={styles.matchBox}>
            <div className={styles.leftSide}>
              {item.left_photo_url ? <img src={item.left_photo_url} alt="Zadanie" /> : <span>{item.left_text}</span>}
            </div>
            
            <div 
              className={styles.dropZone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, item.pair_item_id)}
              style={{ borderColor: answer[item.pair_item_id] ? courseColor : '#ccc' }}
            >
              {answer[item.pair_item_id] ? (
                <div 
                  className={styles.droppedItem}
                  draggable
                  // Tutaj przekazujemy ID elementu oraz ID POLA, w którym aktualnie się znajduje
                  onDragStart={(e) => onDragStart(e, answer[item.pair_item_id], item.pair_item_id)}
                >
                  {itemObjDisplay(getFullItemObj(answer[item.pair_item_id]))}
                </div>
              ) : (
                <span className={styles.placeholder}>przeciągnij tutaj</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pool} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, null)}>
        <div className={styles.poolItems}>
          {shuffledRights.map((right) => {
            const isDropped = Object.values(answer).includes(right.id);
            return (
              <div key={right.id} className={styles.itemWrapper}>
                {isDropped ? (
                  <div className={styles.draggableItem_outline} />
                ) : (
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, right.id, "pool")}
                    className={styles.draggableItem}
                    style={{ border: `1px solid ${courseColor || '#ccc'}` }}
                  >
                    {itemObjDisplay(right)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function itemObjDisplay(obj) {
  if (!obj) return null;
  return obj.photo || obj.right_photo_url ? (
    <img src={obj.photo || obj.right_photo_url} alt="Element" className={styles.smallImg} />
  ) : (
    <span>{obj.text || obj.right_text}</span>
  );
}