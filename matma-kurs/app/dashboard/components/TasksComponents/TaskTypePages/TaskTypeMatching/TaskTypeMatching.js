
export default function TaskTypeMatching({ task, answer, setAnswer, courseColor }) {
  const handleInputChange = (pairId, value) => {
    const currentAnswers = answer || {};
    setAnswer({
      ...currentAnswers,
      [pairId]: value
    });
  };

  return (
    <div>
      {task.pairs?.map((p) => (
        <div key={p.pair_item_id} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '100px' }}>{p.left_text}</span>
          <span style={{ color: courseColor }}>➔</span>
          <input 
            type="text" 
            placeholder="..."
            value={answer?.[p.pair_item_id] || ""}
            onChange={(e) => handleInputChange(p.pair_item_id, e.target.value)}
            style={{
              border: `1px solid #ccc`,
              padding: '8px',
              borderRadius: '6px',
              flex: 1
            }}
          />
        </div>
      ))}
    </div>
  );
}