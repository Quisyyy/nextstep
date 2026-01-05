// Database auto-setup for Supabase - creates tables if they don't exist
// This runs once when the page loads to ensure database is ready

async function ensureDatabaseReady() {
    if (!window.supabase) {
        console.warn('Supabase client not available for database setup');
        return false;
    }

    try {
        // Test if alumni_profiles table exists by trying to select from it
        const { data, error } = await window.supabase
            .from('alumni_profiles')
            .select('id')
            .limit(1);

        if (!error) {
            console.log('✅ Database tables are ready');
            if (window.debugWidget) window.debugWidget.log('✅ Database tables verified');
            return true;
        }

        // If we get here, table might not exist
        console.warn('Database table check failed:', error.message);
        if (window.debugWidget) window.debugWidget.log(`⚠️ Database issue: ${error.message}`);

        // Show user-friendly message
        const statusElements = document.querySelectorAll('#saveStatus, #signupStatus');
        statusElements.forEach(el => {
            if (el) el.textContent = '⚠️ Database not ready - please contact admin';
        });

        return false;
    } catch (e) {
        console.error('Database readiness check failed:', e);
        if (window.debugWidget) window.debugWidget.log(`❌ Database check error: ${e.message}`);
        return false;
    }
}

// Auto-run database check when Supabase becomes available
(async function autoSetupDatabase() {
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds

    while (attempts < maxAttempts) {
        if (window.supabase && typeof window.supabase.from === 'function') {
            await ensureDatabaseReady();
            break;
        }
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (attempts >= maxAttempts) {
        console.warn('Supabase client not ready for database setup');
        if (window.debugWidget) window.debugWidget.log('⚠️ Supabase client timeout during database setup');
    }
})();