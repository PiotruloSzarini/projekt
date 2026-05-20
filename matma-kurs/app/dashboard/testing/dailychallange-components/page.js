'use client';

import { useState } from 'react';
import DailyChallangeEntry from '@/app/dashboard/components/DailyChallangeComponents/DailyChallangeEntry/DailyChallangeEntry';
import DailyChallangeCard from '../../components/DailyChallangeComponents/DailyChallangeCard/DailyChallangeCard';

export default function daily_components() {
    // Stan testowy: możesz klikać przyciski na dole, aby zmieniać postęp od 0 do 3
    const [mockCompleted, setMockCompleted] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px', minHeight: '100vh' }}>
            
            {/* PANEL STEROWANIA TESTEM (do usunięcia w produkcji) */}
            <div>
                <p style={{ color: '#fff', margin: 0, fontWeight: 'bold', backgroundColor: '#032327' }}>Symulator postępu:</p>
                <button onClick={() => setMockCompleted(0)} style={btnStyle(mockCompleted === 0)}>0/3 (Czysta karta)</button>
                <button onClick={() => setMockCompleted(1)} style={btnStyle(mockCompleted === 1)}>1/3 (Po łatwym)</button>
                <button onClick={() => setMockCompleted(2)} style={btnStyle(mockCompleted === 2)}>2/3 (Po średnim)</button>
                <button onClick={() => setMockCompleted(3)} style={btnStyle(mockCompleted === 3)}>3/3 (Wszystko zrobione)</button>
            </div>

            {/* KOMPONENT NAGŁÓWKA Z ZEGARKIEW */}
            <DailyChallangeEntry completed={mockCompleted} />

            {/* SEKCJA TRZECH KART ZADRUDNIENIA */}
            <div style={{ display: 'flex', flexDirection: 'row',gap: '16px' }}>
                
                <DailyChallangeCard 
                    title="Arytmetyka" 
                    type="Arytmetyka" 
                    points={1} 
                    img="/assets/img/dailyChallangeTypes/typ_arytmetyka.svg" 
                    link="/dashboard" 
                    count={1} 
                    completed={mockCompleted} // Przekazujemy stan testowy
                />
                
                <DailyChallangeCard 
                    title="Geometria" 
                    type="Geometria" 
                    points={3} 
                    img="/assets/img/dailyChallangeTypes/typ_geometria.svg" 
                    link="/dashboard" 
                    count={2} 
                    completed={mockCompleted} // Przekazujemy stan testowy
                />
                
                <DailyChallangeCard 
                    title="Funkcje" 
                    type="Algebra" 
                    points={5} 
                    img="/assets/img/dailyChallangeTypes/typ_funkcje.svg" 
                    link="/dashboard" 
                    count={3} 
                    completed={mockCompleted} // Przekazujemy stan testowy
                />

            </div>
        </div>
    );
}

// Pomocniczy styl dla przycisków testowych
function btnStyle(isActive) {
    return {
        padding: '8px 12px',
        backgroundColor: isActive ? '#FEFFFF' : '#2c2c2c',
        color: isActive ? '#032327' : '#FEFFFF',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
    };
}