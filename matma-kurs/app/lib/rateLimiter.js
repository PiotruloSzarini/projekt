// In-memory rate limiter stored on global to survive Next.js hot reloads.
// Not suitable for multi-instance deployments — use Redis for that.

if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
}

const store = global.rateLimitStore;

export function checkRateLimit(key, { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = {}) {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false };
    }

    if (record.count >= maxAttempts) {
        const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
        return { limited: true, retryAfterSec };
    }

    record.count += 1;
    return { limited: false };
}

export function getClientIp(request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
