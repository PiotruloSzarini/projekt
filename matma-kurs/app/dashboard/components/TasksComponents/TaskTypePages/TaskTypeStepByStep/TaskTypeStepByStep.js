import styles from './TaskTypeStepByStep.module.css';

export default function TaskTypeStepByStep({ task, answer, setAnswer, stepIdx, courseColor }) {
  const steps = task.details?.steps || [];

  const handleStepChange = (stepId, value) => {
    const currentAnswers = answer || {};
    setAnswer({
      ...currentAnswers,
      [stepId]: value
    });
  };

  return (
    <div className={styles.container}>
      {steps.slice(0, stepIdx + 1).map((step, index) => {
        const isCompleted = index < stepIdx;

        return (
          <div 
            key={step.step_id} 
            className={`${styles.stepBox} ${isCompleted ? styles.completed : styles.activeStep}`}
            style={{ borderLeft: isCompleted ? `4px solid #e0e0e0` : `4px solid ${courseColor}` }}
          >
            <h2 className={styles.stepTitle}>Krok {index + 1}.</h2>
            <p className={styles.instruction}>{step.step_instruction}</p>
            
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                className={styles.inputField}
                value={answer?.[step.step_id] || ""}
                onChange={(e) => handleStepChange(step.step_id, e.target.value)}
                disabled={isCompleted}
                style={{ borderColor: isCompleted ? '#eee' : courseColor }}
                placeholder="Twoja odpowiedź..."
              />
            </div>
          </div>
        );
      })}

      {steps.slice(stepIdx + 1).map((step, index) => (
        <div key={`future-${index}`} className={styles.futureStep}>
          Krok {stepIdx + index + 2}.
        </div>
      ))}
    </div>
  );
}