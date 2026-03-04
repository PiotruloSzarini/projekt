import styles from './TaskTypeStepByStep.module.css';

export default function TaskTypeStepByStep({ task, answer, setAnswer, stepIdx, courseColor }) {
  const steps = task.details?.steps || [];
  const currentStep = steps[stepIdx];

  if (!currentStep) return <p>Błąd wczytywania kroku...</p>;

  const handleStepChange = (value) => {
    const currentAnswers = answer || {};
    setAnswer({
      ...currentAnswers,
      [currentStep.step_id]: value
    });
  };

  return (
    <div className={styles.container} style={{ borderLeftColor: courseColor }}>
      <p className={styles.stepCounter}>Krok {stepIdx + 1} z {steps.length}</p>
      <h3 className={styles.instruction}>{currentStep.step_instruction}</h3>
      <input 
        type="text" 
        className={styles.inputField}
        value={answer?.[currentStep.step_id] || ""}
        onChange={(e) => handleStepChange(e.target.value)}
        style={{ borderColor: courseColor }}
      />
    </div>
  );
}