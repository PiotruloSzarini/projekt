
export default function TaskTypeSingleInput({ answer, setAnswer, courseColor }) {
    return (
    <div>
            <input 
            type="text" 
            placeholder="Wpisz odpowiedź..."
            value={answer || ""}
            onChange={(e) => setAnswer(e.target.value)} 
            style={{
            border: `2px solid ${courseColor}`,
            padding: '10px',
            borderRadius: '8px',
            width: '100%',
            outline: 'none'
            }}
        />
    </div>
    );
}