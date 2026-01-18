// Initialize Supabase Client - Simple & Reliable
(function () {
  const SUPABASE_URL = "https://ziquhxrfxywsmvunuyzi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_eDBOnbii8QQHNGAhuu9TWg_tPiGnpoY";

  // Load Supabase from CDN
  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.48.0/dist/umd/supabase.min.js";
  script.async = true;

  script.onload = function () {
    try {
      // Initialize with 100ms delay to ensure library is ready
      setTimeout(() => {
        if (window.supabase && window.supabase.createClient) {
          window.supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
          );
          // Also expose as window.supabase for backward compatibility
          window.supabase = window.supabaseClient;
          window.supabaseClientReady = true;
          console.log("✓ Supabase initialized successfully");
          // Resolve the supabaseReady promise if it exists (for compatibility with reset-password.js)
          if (window.supabaseReadyResolve) {
            window.supabaseReadyResolve(window.supabaseClient);
          }
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent("supabaseReady"));
        } else {
          throw new Error("supabase library not available");
        }
      }, 100);
    } catch (err) {
      console.error("Error initializing Supabase:", err);
      window.supabaseError = err.message;
      if (window.supabaseReadyReject) {
        window.supabaseReadyReject(err);
      }
    }
  };

  script.onerror = function () {
    console.error("Failed to load Supabase library from CDN");
    window.supabaseReady = false;
    window.supabaseError = "Failed to load library";
  };

  document.head.appendChild(script);
})();
