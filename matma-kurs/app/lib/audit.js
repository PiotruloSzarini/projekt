import pool from '@/app/lib/db';
import { getClientIp } from '@/app/lib/rateLimiter';

// Fire-and-forget zapis do audit logu. Nie blokujemy akcji na wypadek błędu DB.
// action: string typu 'task.delete', 'course.update', 'mathdle.assign'
export function logAdminAction(request, userId, action, { entityType = null, entityId = null, metadata = null } = {}) {
    const ip = getClientIp(request);
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    pool.execute(
        `INSERT INTO admin_audit_log (user_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, metadataJson, ip]
    ).catch((error) => {
        console.error('[Audit] Nie udało się zapisać logu:', error);
    });
}
