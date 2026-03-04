import styles from './TaskTypeMatching.module.css';

export default function TaskTypeMatching({ task, answer, setAnswer, courseColor }) {
  const items = task.details?.items || [];

  const handleInputChange = (itemId, value) => {
    const currentAnswers = answer || {};
    setAnswer({
      ...currentAnswers,
      [itemId]: value
    });
  };

  return (
    <div className={styles.container}>
      {items.map((item) => (
        <div key={item.task_pair_id} className={styles.pairRow}>
          <span className={styles.leftText}>{item.left_text}</span>
          <span className={styles.arrow} style={{ color: courseColor }}>➔</span>
          <input 
            type="text" 
            className={styles.inputField}
            placeholder="..."
            value={answer?.[item.task_pair_id] || ""}
            onChange={(e) => handleInputChange(item.task_pair_id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}