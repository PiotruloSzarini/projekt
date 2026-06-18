import styles from './TaskTypeMultipleChoice.module.css';

export default function TaskTypeMultipleChoice({
  task,
  answer,
  setAnswer,
  courseColor,
  feedback = null,
}) {
  const options = task.details?.answers || [];

  return (
    <div className={styles.multiple_choice_container}>
      {options.map((a) => {
        const isSelected = answer === a.answer_id;
        const isCorrectAnswer = Number(a.is_correct) === 1;
        const isWrongSelected = feedback?.status === 'incorrect' && isSelected;
        const isRightSelected = feedback?.status === 'correct' && isSelected;
        const optionStateClass = !feedback
          ? (isSelected ? styles.active : '')
          : isWrongSelected
            ? styles.incorrect
            : isRightSelected
              ? styles.correctSelected
              : isCorrectAnswer
              ? styles.correct
              : '';
        const showMark = feedback && (isSelected || isCorrectAnswer);

        return (
          <label
            key={a.answer_id}
            className={`${styles.optionLabel} ${optionStateClass}`}
            style={{ '--active-color': courseColor }}
          >
            <input
              type="radio"
              name={`task-group-${task.task_id}`}
              checked={answer === a.answer_id}
              onChange={() => setAnswer(a.answer_id)}
              className={styles.radioInput}
            />
            {showMark && (
              <span
                className={`${styles.statusMark} ${
                  isWrongSelected ? styles.statusWrong : styles.statusCorrect
                }`}
              >
                {isWrongSelected ? '\u00d7' : '\u2713'}
              </span>
            )}
            <span className={styles.answerText}>{a.answer_text}</span>
          </label>
        );
      })}
    </div>
  );
}
