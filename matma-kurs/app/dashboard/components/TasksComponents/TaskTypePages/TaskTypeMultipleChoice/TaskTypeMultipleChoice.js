import styles from './TaskTypeMultipleChoice.module.css';

export default function TaskTypeMultipleChoice({ task, answer, setAnswer, courseColor }) {
  // Wyciągamy odpowiedzi z details (tak jak przychodzą z Twojego nowego API)
  const options = task.details?.answers || [];

  return (
    <div className={styles.container}>
      {options.map((a) => (
        <label 
          key={a.answer_id} 
          className={`${styles.optionLabel} ${answer === a.answer_id ? styles.active : ''}`}
          style={{ '--active-color': courseColor }}
        >
          <input 
            type="radio" 
            // Ważne: używamy unikalnej nazwy dla grupy radio
            name={`task-group-${task.task_id}`} 
            checked={answer === a.answer_id}
            onChange={() => setAnswer(a.answer_id)}
            className={styles.radioInput}
          />
          <span className={styles.customRadio}></span>
          <span className={styles.answerText}>{a.answer_text}</span>
        </label>
      ))}
    </div>
  );
}