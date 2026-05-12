import DailyChallangeEntry from '@/app/dashboard/components/DailyChallangeComponents/DailyChallangeEntry/DailyChallangeEntry';

export default function daily_components() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <DailyChallangeEntry completed = {0}/>
        </div>
    );
}