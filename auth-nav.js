// Shared authentication navigation handler
// Ensures Login/Logout buttons show correctly across all pages

// Initialize auth navigation immediately when script loads
(function initAuthNavigation() {
    // Function to update nav buttons based on login state
    function updateAuthNav() {
        const email = (localStorage.getItem('currentUserEmail') || '').trim().toLowerCase();
        const loginLink = document.getElementById('nav-login');
        const logoutBtn = document.getElementById('nav-logout');
        
        console.log('🔐 Auth Nav: Checking login state...', email ? 'LOGGED IN' : 'NOT LOGGED IN');
        
        if (email) {
            // User is logged in - show logout button
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
            console.log('✅ Auth Nav: Showing Logout button');
        } else {
            // User is not logged in - show login link
            if (loginLink) {
                loginLink.style.display = 'inline-block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            console.log('✅ Auth Nav: Showing Login link');
        }
        
        // Setup logout button click handler if not already set
        if (logoutBtn && !logoutBtn.hasAttribute('data-handler-attached')) {
            logoutBtn.addEventListener('click', function() {
                console.log('🚪 Logout button clicked');
                if (typeof showLogoutConfirm === 'function') {
                    showLogoutConfirm('login.html');
                } else {
                    // Fallback if logout-dialog.js not loaded
                    if (confirm('Do you want to Logout?')) {
                        // Sign out from Supabase Auth if available
                        if (window.supabase && typeof window.supabase.auth.signOut === 'function') {
                            window.supabase.auth.signOut().then(() => {
                                console.log('✅ Signed out from Supabase Auth');
                            }).catch(err => {
                                console.warn('Error signing out:', err);
                            });
                        }
                        
                        localStorage.removeItem('currentUserEmail');
                        localStorage.removeItem('currentUserId');
                        localStorage.removeItem('currentUserName');
                        localStorage.removeItem('lastProfileId');
                        localStorage.removeItem('lastProfileEmail');
                        window.location.href = 'login.html';
                    }
                }
            });
            logoutBtn.setAttribute('data-handler-attached', 'true');
        }
        
        return email; // Return email for use by other scripts
    }
    
    // Update immediately
    updateAuthNav();
    
    // Update when DOM is fully loaded (in case elements weren't ready)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthNav);
    }
    
    // Update when storage changes (for multi-tab sync)
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUserEmail') {
            console.log('🔄 Auth Nav: Storage changed, updating...');
            updateAuthNav();
        }
    });
    
    // Make updateAuthNav globally available for manual refresh
    window.updateAuthNav = updateAuthNav;
    
    console.log('✅ Auth navigation initialized');
})();
