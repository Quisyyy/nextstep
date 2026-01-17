(function() {
    // Load supabase-js UMD from CDN
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = async () => {
        try {
            // Fetch credentials securely from the backend
            const response = await fetch('/api/supabase-config');
            if (!response.ok) {
                throw new Error('Failed to fetch Supabase configuration');
            }
            
            const { SUPABASE_URL, SUPABASE_ANON_KEY } = await response.json();

            // The UMD build may attach different globals depending on loader.
            // Try common names then fallback to attempting to read a default export.
            const lib = window.supabase || window.supabaseJs || window.supabasejs || window.supabaseJsDefault || (typeof supabaseJs !== 'undefined' && supabaseJs);
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