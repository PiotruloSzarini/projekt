import { useState, useEffect } from 'react';
import styles from './TaskTypeMatching.module.css';

export default function TaskTypeMatching({ task, answer, setAnswer, courseColor }) {
  const items = task.details?.items || [];
  
  // Stan dla wymieszanych elementów prawej strony
  const [shuffledRights, setShuffledRights] = useState([]);

  useEffect(() => {
    // Przy montowaniu zadania mieszamy prawą stronę
    const rights = items.map(item => ({
      id: item.pair_item_id,
      text: item.right_text,
      photo: item.right_photo_url
    })).sort(() => Math.random() - 0.5);
    
    setShuffledRights(rights);
  }, [task.task_id]);

  const onDragStart = (e, item) => {
    e.dataTransfer.setData("pair_item_id", item.id);
  };

  const onDrop = (e, targetPairItemId) => {
    const draggedId = e.dataTransfer.getData("pair_item_id");
    
    // Zapisujemy w stanie 'answer' (w TaskView): { targetId: draggedId }
    // Oznacza to, że do lewego elementu 'targetId' przypisaliśmy prawy element 'draggedId'
    const newAnswers = { ...(answer || {}) };
    newAnswers[targetPairItemId] = Number(draggedId);
    setAnswer(newAnswers);
  };

  const allowDrop = (e) => e.preventDefault();

  return (
    <div className={styles.container}>
      <div className={styles.matchingGrid}>
        
        {/* LEWA KOLUMNA (STAŁA) */}
        <div className={styles.column}>
          {items.map((item) => (
            <div 
              key={item.pair_item_id} 
              className={styles.dropZone}
              onDragOver={allowDrop}
              onDrop={(e) => onDrop(e, item.pair_item_id)}
              style={{ borderColor: answer?.[item.pair_item_id] ? courseColor : '#ccc' }}
            >
              <div className={styles.leftSide}>
                {item.left_photo_url ? (
                  <img src={item.left_photo_url} alt="Zadanie" />
                ) : (
                  <span>{item.left_text}</span>
                )}
              </div>
              
              <div className={styles.droppedContent}>
                {answer?.[item.pair_item_id] ? (
                  // Szukamy co zostało tu wrzucone
                  <div className={styles.droppedItem}>
                    {items.find(i => i.pair_item_id === answer[item.pair_item_id])?.right_text}
                    <button 
                      onClick={() => {
                        const next = {...answer};
                        delete next[item.pair_item_id];
                        setAnswer(next);
                      }}
                      className={styles.removeBtn}
                    >✕</button>
                  </div>
                ) : (
                  <span className={styles.placeholder}>Upuść tutaj</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PRAWA KOLUMNA (ELEMENTY DO PRZECIĄGANIA) */}
        <div className={styles.pool}>
          <h3>Elementy do dopasowania:</h3>
          <div className={styles.poolItems}>
            {shuffledRights
              .filter(right => !Object.values(answer || {}).includes(right.id))
              .map((right) => (
                <div
                  key={right.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, right)}
                  className={styles.draggableItem}
                  style={{ backgroundColor: courseColor }}
                >
                  {right.photo ? (
                    <img src={right.photo} alt="Opcja" />
                  ) : (
                    <span>{right.text}</span>
                  )}
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}