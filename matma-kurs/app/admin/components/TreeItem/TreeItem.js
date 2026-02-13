'use client';

const TreeItem = ({ item, level, onSelect }) => {
    const paddingLeft = level * 20;

    return (
        <div style={{ width: '100%' }}>
            <div 
                onClick={() => onSelect(item)}
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: `${paddingLeft}px`,
                    color: '#333',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #f9f9f9'
                }}
            >
                <span style={{ fontWeight: item.type === 'chapter' ? '700' : '400' }}>
                    {item.name || "Bez nazwy"}
                </span>
            </div>
            
            {item.children && (
                <div>
                    {[...item.children]
                        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                        .map(child => (
                            <TreeItem 
                                key={child.id} 
                                item={child} 
                                level={level + 1} 
                                onSelect={onSelect} 
                            />
                        ))
                    }
                </div>
            )}
        </div>
    );
};

export default TreeItem;