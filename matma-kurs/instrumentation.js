// Uruchamia się raz przy starcie serwera Next.js.
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { runMigrations, cleanupExpiredAuth } = await import('@/app/lib/ensureSchema');
        try {
            await runMigrations();
            console.log('[DB] Migracje zakończone.');
        } catch (error) {
            console.error('[DB] Migracje nie powiodły się:', error);
        }
        // fire-and-forget — nie blokujemy startu serwera
        cleanupExpiredAuth();
    }
}
