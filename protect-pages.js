// protect-pages.js
// Redirects to login if not authenticated (for protected pages)
(function () {
  function isAuthenticated() {
    return (
      localStorage.getItem("isLoggedIn") === "true" &&
      !!localStorage.getItem("currentStudentNumber")
    );
  }
  function protectPage() {
    if (!isAuthenticated()) {
      // Always redirect to the root login.html
      window.location.href = "/login.html";
    }
  }
  // Run on load
  protectPage();
})();
