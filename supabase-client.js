(function() {
    // --- Configuration ---
    // Replace these with your Supabase project values.
    // Example SUPABASE_URL: https://xyzabc.supabase.co
    // Example SUPABASE_ANON_KEY: public-anon-key-xxx
    // Project URL (you provided this)
    const SUPABASE_URL = 'https://ziquhxrfxywsmvunuyzi.supabase.co';
    // Paste your public anon key here (keep service_role secret - do NOT put it in client code)
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXVoeHJmeHl3c212dW51eXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjM1NzQsImV4cCI6MjA3NzczOTU3NH0.IXCfC4IwcyJ5jv2jfDP2ZYfPCXUPS88kCupj0DMoVqc';

    // If anon key is not present we still load the script but won't initialize the client.
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('REPLACE_WITH')) {
        console.info('supabase-client: anon key missing; client will not initialize. Configure SUPABASE_ANON_KEY to enable.');
    }

    // load supabase-js UMD from CDN and initialize a global client as `window.supabase`
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = () => {
        try {
            if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('REPLACE_WITH')) {
                console.info('supabase-client: anon key not configured; skipping client initialization');
                window.supabaseClientReady = false;
                window.supabaseInitError = 'anon key missing';
                return;
            }

            // The UMD build may attach different globals depending on loader.
            // Try common names then fallback to attempting to read a default export.
            const lib = window.supabase || window.supabaseJs || window.supabasejs || window.supabasejs || window.supabaseJsDefault || (typeof supabaseJs !== 'undefined' && supabaseJs);
            if (!lib) {
                // If the CDN lib exposed a global we didn't expect, attempt to find createClient on any global
                const maybe = Object.keys(window).find(k => window[k] && window[k].createClient && typeof window[k].createClient === 'function');
                if (maybe) {
                    window.supabase = window[maybe].createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                } else {
                    console.warn('supabase-client: supabase UMD not found on window globals');
                    window.supabaseClientReady = false;
                    window.supabaseInitError = 'umd global not found';
                    return;
                }
            } else {
                // lib may be the namespace or the module object
                if (typeof lib.createClient === 'function') {
                    window.supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                } else if (lib && lib.default && typeof lib.default.createClient === 'function') {
                    window.supabase = lib.default.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                } else if (typeof supabaseJs !== 'undefined' && typeof supabaseJs.createClient === 'function') {
                    window.supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                } else {
                    console.warn('supabase-client: found supabase namespace but createClient is not a function');
                    window.supabaseClientReady = false;
                    window.supabaseInitError = 'createClient not found';
                    return;
                }
            }

            window.supabaseClientReady = true;
            window.supabaseInitError = null;
            console.info('supabase-client: initialized');
        } catch (e) {
            console.warn('supabase-client: initialization failed', e);
            window.supabaseClientReady = false;
            window.supabaseInitError = e && e.message ? e.message : String(e);
        }
    };
    s.onerror = () => {
        console.warn('supabase-client: failed to load supabase-js');
        window.supabaseClientReady = false;
        window.supabaseInitError = 'script load error';
    };
    document.head.appendChild(s);
})();