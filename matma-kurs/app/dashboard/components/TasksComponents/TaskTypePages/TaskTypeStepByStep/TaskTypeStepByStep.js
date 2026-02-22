// components/TasksComponents/TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep.js

export default function TaskTypeStepByStep({ task, answer, setAnswer, stepIdx, courseColor }) {
  const currentStep = task.steps?.[stepIdx];

  if (!currentStep) return null;

  const handleStepChange = (value) => {
    const currentAnswers = answer || {};
    setAnswer({
      ...currentAnswers,
      [currentStep.step_id]: value
    });
  };

  return (
    <div style={{ padding: '15px', borderLeft: `4px solid ${courseColor}`, backgroundColor: '#f9f9f9' }}>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
        Krok {stepIdx + 1} z {task.steps.length}
      </p>
      <h3 style={{ marginBottom: '15px' }}>{currentStep.step_instruction}</h3>
      
      <input 
        type="text" 
        placeholder="Twoja odpowiedź dla tego kroku..."
        value={answer?.[currentStep.step_id] || ""}
        onChange={(e) => handleStepChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: `1px solid ${courseColor}`
        }}
      />
    </div>
  );
}