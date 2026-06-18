import { useState, useEffect } from 'react';
import styles from './TaskTypeMatching.module.css';
import MathRender from '@/app/components/MathRender/MathRender';

const matchingMathStyle = {
  width: 'auto',
  fontSize: '1.35rem',
  lineHeight: 1.2,
};

export default function TaskTypeMatching({
  task,
  answer = {},
  setAnswer,
  courseColor,
  feedback = null,
}) {
  const items = task.details?.items || [];
  const [shuffledRights, setShuffledRights] = useState([]);
  const showFeedback = feedback?.status === 'correct' || feedback?.status === 'incorrect';

  useEffect(() => {
    const rights = items
      .map((item) => ({
        id: item.pair_item_id,
        text: item.right_text,
        photo: item.right_photo_url,
      }))
      .sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
  }, [task.task_id]);

  const onDragStart = (e, draggedItemId, sourceFieldId) => {
    e.dataTransfer.setData('draggedItemId', draggedItemId);
    e.dataTransfer.setData('sourceFieldId', sourceFieldId);
  };

  const handleDrop = (e, targetFieldId = null) => {
    e.preventDefault();

    const draggedItemId = Number(e.dataTransfer.getData('draggedItemId'));
    const sourceFieldIdRaw = e.dataTransfer.getData('sourceFieldId');
    const sourceFieldId = sourceFieldIdRaw === 'pool' ? 'pool' : Number(sourceFieldIdRaw);

    let nextState = { ...answer };

    if (targetFieldId === null) {
      if (sourceFieldId !== 'pool') {
        delete nextState[sourceFieldId];
      }
      setAnswer(nextState);
      return;
    }

    const existingItemIdInTarget = nextState[targetFieldId];
    if (sourceFieldId === targetFieldId) return;

    if (sourceFieldId === 'pool') {
      nextState[targetFieldId] = draggedItemId;
    } else {
      if (existingItemIdInTarget !== undefined) {
        nextState[sourceFieldId] = existingItemIdInTarget;
      } else {
        delete nextState[sourceFieldId];
      }
      nextState[targetFieldId] = draggedItemId;
    }

    Object.keys(nextState).forEach((key) => {
      if (nextState[key] === draggedItemId && Number(key) !== targetFieldId) {
        delete nextState[key];
      }
    });

    setAnswer(nextState);
  };

  const getFullItemObj = (id) => {
    return items.find((i) => i.pair_item_id === id) || shuffledRights.find((i) => i.id === id);
  };

  const getItemState = (item) => {
    if (!showFeedback) return '';
    const selectedId = answer[item.pair_item_id];
    if (selectedId === undefined || selectedId === null) return '';
    return selectedId === item.pair_item_id ? styles.correct : styles.incorrect;
  };

  const getItemIcon = (item) => {
    if (!showFeedback) return null;
    const selectedId = answer[item.pair_item_id];
    if (selectedId === undefined || selectedId === null) return null;
    return selectedId === item.pair_item_id ? '\u2713' : '\u00d7';
  };

  const getDropZoneStyle = (item) => {
    if (showFeedback) {
      if (answer[item.pair_item_id] === undefined || answer[item.pair_item_id] === null) {
        return { borderColor: '#ccc' };
      }
      return {
        borderColor: answer[item.pair_item_id] === item.pair_item_id ? '#22c55e' : '#ef4444',
      };
    }

    return {
      borderColor: answer[item.pair_item_id] ? courseColor : '#ccc',
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.matchingGrid}>
        {items.map((item) => (
          <div key={item.pair_item_id} className={styles.matchBox}>
            <div className={styles.leftSide}>
              {item.left_photo_url ? (
                <img src={item.left_photo_url} alt="Zadanie" />
              ) : (
                <MathRender
                  formula={item.left_text}
                  displayMode={false}
                  className={styles.matchingMath}
                  style={matchingMathStyle}
                />
              )}
            </div>

            <div
              className={`${styles.dropZone} ${getItemState(item)}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, item.pair_item_id)}
              style={getDropZoneStyle(item)}
            >
              {answer[item.pair_item_id] ? (
                <div
                  className={styles.droppedItem}
                  draggable
                  onDragStart={(e) => onDragStart(e, answer[item.pair_item_id], item.pair_item_id)}
                >
                  {getItemIcon(item) && (
                    <span className={styles.statusIcon}>{getItemIcon(item)}</span>
                  )}
                  {itemObjDisplay(getFullItemObj(answer[item.pair_item_id]))}
                </div>
              ) : (
                <span className={styles.placeholder}>przeciągnij tutaj</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className={styles.pool}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, null)}
      >
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
                    onDragStart={(e) => onDragStart(e, right.id, 'pool')}
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
    <MathRender
      formula={obj.text || obj.right_text}
      displayMode={false}
      className={styles.matchingMath}
      style={matchingMathStyle}
    />
  );
}
