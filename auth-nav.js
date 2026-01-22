// Shared authentication navigation handler
// Ensures Login/Logout buttons show correctly across all pages

// Initialize auth navigation immediately when script loads
(function initAuthNavigation() {
  // Function to update nav buttons based on login state
  function updateAuthNav() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const studentNumber = (
      localStorage.getItem("currentStudentNumber") || ""
    ).trim();
    const loginLink = document.getElementById("nav-login");
    const logoutBtn = document.getElementById("nav-logout");

    console.log(
      "🔐 Auth Nav: Checking login state...",
      isLoggedIn ? "LOGGED IN" : "NOT LOGGED IN",
      studentNumber,
    );

    if (isLoggedIn && studentNumber) {
      // User is logged in - show logout button
      if (loginLink) {
        loginLink.style.display = "none";
      }
      if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
      }
      console.log("✅ Auth Nav: Showing Logout button");
    } else {
      // User is not logged in - show login link
      if (loginLink) {
        loginLink.style.display = "inline-block";
      }
      if (logoutBtn) {
        logoutBtn.style.display = "none";
      }
      console.log("✅ Auth Nav: Showing Login link");
    }

    // Setup logout button click handler if not already set
    if (logoutBtn && !logoutBtn.hasAttribute("data-handler-attached")) {
      logoutBtn.addEventListener("click", function () {
        console.log("🚪 Logout button clicked");
        if (typeof showLogoutConfirm === "function") {
          showLogoutConfirm("/login.html");
        } else {
          // Fallback if logout-dialog.js not loaded
          if (confirm("Do you want to Logout?")) {
            // Remove custom session keys
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("currentStudentNumber");
            localStorage.removeItem("currentUserId");
            window.location.href = "/login.html";
          }
        }
      });
      logoutBtn.setAttribute("data-handler-attached", "true");
    }

    return isLoggedIn;
  }

  // Update immediately
  updateAuthNav();

  // Update when DOM is fully loaded (in case elements weren't ready)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateAuthNav);
  }

  // Update when storage changes (for multi-tab sync)
  window.addEventListener("storage", function (e) {
    if (e.key === "isLoggedIn" || e.key === "currentStudentNumber") {
      console.log("🔄 Auth Nav: Storage changed, updating...");
      updateAuthNav();
    }
  });

  // Make updateAuthNav globally available for manual refresh
  window.updateAuthNav = updateAuthNav;

  console.log("✅ Auth navigation initialized");
})();
