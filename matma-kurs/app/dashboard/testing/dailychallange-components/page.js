import DailyChallangeEntry from '@/app/dashboard/components/DailyChallangeComponents/DailyChallangeEntry/DailyChallangeEntry';
import DailyChallangeCard from '../../components/DailyChallangeComponents/DailyChallangeCard/DailyChallangeCard';


export default function daily_components() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <DailyChallangeEntry completed = {0}/>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                <DailyChallangeCard title="Arytmetyka" type="Arytmetyka" points={1} img="/assets/img/dailyChallangeTypes/typ_arytmetyka.svg" link="/dashboard" count={1} />
                <DailyChallangeCard title="Geometria" type="Geometria" points={3} img="/assets/img/dailyChallangeTypes/typ_geometria.svg" link="/dashboard" count={2} />
                <DailyChallangeCard title="Funkcje" type="Algebra" points={5} img="/assets/img/dailyChallangeTypes/typ_funkcje.svg" link="/dashboard" count={2} />

            </div>
            
        </div>
    );
}