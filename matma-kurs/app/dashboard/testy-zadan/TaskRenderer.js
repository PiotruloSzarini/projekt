// app/dashboard/testy-zadan/TaskRenderer.js
import SingleInputTask from "./components/SingleInputTask";
import MultipleChoiceTask from "./components/MultipleChoiceTask";
import MatchingTask from "./components/MatchingTask";
import StepByStepTask from "./components/StepByStepTask";

export default function TaskRenderer({ task }) {
  if (!task) return null;

  switch (task.taskType) {
    case "single_input":
      return <SingleInputTask task={task} />;
    case "multiple_choice":
      return <MultipleChoiceTask task={task} />;
    case "matching":
      return <MatchingTask task={task} />;
    case "step_by_step":
      return <StepByStepTask task={task} />;
    default:
      return <p>Nieznany typ zadania: {task.taskType}</p>;
  }
}