import styles from './TaskTypeStepByStep.module.css';

export default function TaskTypeStepByStep({
  task,
  answer = {},
  setAnswer,
  stepIdx,
  courseColor,
  onConfirmStep,
  feedback = null,
}) {
  const steps = task.details?.steps || [];
  const showFeedback = Boolean(feedback?.status);

  const handleStepChange = (stepId, value) => {
    setAnswer({
      ...(answer || {}),
      [stepId]: value,
    });
  };

  const renderStepSummary = (step, index, status = 'completed') => {
    const isCorrect = status === 'correct';
    const isIncorrect = status === 'incorrect';
    const summaryClass = isCorrect
      ? styles.correct
      : isIncorrect
        ? styles.incorrect
        : styles.completed;

    return (
      <div
        key={step.step_id}
        className={`${styles.stepSummary} ${summaryClass}`}
        style={!isCorrect && !isIncorrect ? { backgroundColor: courseColor } : undefined}
      >
        <span>Krok {index + 1}.</span>
        <span className={styles.statusIcon}>
          {isIncorrect ? '\u00d7' : '\u2713'}
        </span>
      </div>
    );
  };

  if (showFeedback) {
    return (
      <div className={styles.container}>
        {steps.map((step, index) => (
          renderStepSummary(step, index, feedback.steps?.[step.step_id])
        ))}
      </div>
    );
  }

  const activeStep = steps[stepIdx];
  const activeValue = activeStep ? answer?.[activeStep.step_id] || '' : '';
  const canConfirmActiveStep = Boolean(String(activeValue).trim());

  return (
    <div className={styles.container}>
      {steps.slice(0, stepIdx).map((step, index) => (
        renderStepSummary(step, index)
      ))}

      {activeStep && (
        <div className={styles.stepBox}>
          <h2 className={styles.stepTitle}>Krok {stepIdx + 1}.</h2>
          <p className={styles.instruction}>{activeStep.step_instruction}</p>

          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.inputField}
              value={activeValue}
              onChange={(e) => handleStepChange(activeStep.step_id, e.target.value)}
              placeholder="wpisz tutaj"
            />
          </div>

          {onConfirmStep && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.confirmBtn}
                style={{ backgroundColor: courseColor }}
                onClick={onConfirmStep}
                disabled={!canConfirmActiveStep}
              >
                Zatwierdź krok
              </button>
            </div>
          )}
        </div>
      )}

      {steps.slice(stepIdx + 1).map((step, index) => (
        <div key={step.step_id} className={styles.futureStep}>
          Krok {stepIdx + index + 2}.
        </div>
      ))}
    </div>
  );
}
