
import style from './TaskTypeMultipleChoice.module.css';

export default function TaskTypeMultipleChoice({ task, answer, setAnswer, courseColor }) {
    return (
        <div className={style.options_container}>
            {task.answers?.map((a) => (
            <label 
                key={a.answer_id} 
                className={style.option_label}
                style={{ '--active-color': courseColor }}
            >
                <input 
                    type="radio" 
                    name={`task-${task.task_id}`} 
                    checked={answer === a.answer_id}
                    onChange={() => setAnswer(a.answer_id)}
                    className={style.radio_input}
                />
                <span className={style.custom_radio}></span>
                {a.answer_text}
                </label>
            ))}
        </div>
    );
}