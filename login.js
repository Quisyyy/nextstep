// Alumni Login Gate: single clean implementation
(function () {
  async function ensureSupabaseReady(timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (window.supabaseReady && window.supabaseClient) {
        return true;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (window.supabaseError) {
      throw new Error(`Supabase error: ${window.supabaseError}`);
    }
    throw new Error("Service initialization timeout. Please refresh the page.");
  }

  function setStatus(el, msg, type = "info") {
    if (!el) return;
    el.textContent = msg || "";
    el.className = `status ${type}`;
    el.style.display = msg ? "block" : "none";
    el.style.color =
      type === "error" ? "#d32f2f" : type === "success" ? "#2e7d32" : "#0b66b3";
  }

  // Login using student number, birthday, and password
  async function loginWithStudentNumber(student_number, birthday, password) {
    try {
      const supabase = window.supabaseClient;
      const normalizedStudentNumber = student_number.trim().toLowerCase();
      // Hash the password for comparison
      async function hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      const passwordHash = await hashPassword(password);
      // Query signups for authentication
      const { data, error } = await supabase
        .from("signups")
        .select("id,student_number,birthday,password_hash")
        .eq("student_number", normalizedStudentNumber)
        .eq("birthday", birthday)
        .eq("password_hash", passwordHash)
        .limit(1);
      if (error) {
        console.error("Custom login error:", error);
        return { success: false };
      }
      if (!data || data.length === 0) {
        return { success: false };
      }
      const user = data[0];
      // After successful login, fetch profile from alumni_profiles
      const { data: profileData, error: profileError } = await supabase
        .from("alumni_profiles")
        .select("*")
        .eq("student_number", normalizedStudentNumber)
        .limit(1);
      // You can use profileData for further logic (e.g., display, edit)
      return {
        success: true,
        user,
        profile: profileData && profileData.length > 0 ? profileData[0] : null,
      };
    } catch (err) {
      console.error("Login exception:", err);
      return { success: false };
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const statusEl = form.querySelector(".status");
    const btn = form.querySelector('button[type="submit"]');
    const studentNumberInput = form.querySelector(
      'input[name="student_number"]',
    );
    const birthdayInput = form.querySelector('input[name="birthday"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const student_number = (
      (studentNumberInput && studentNumberInput.value) ||
      ""
    ).trim();
    const birthday = ((birthdayInput && birthdayInput.value) || "").trim();
    const password = (passwordInput && passwordInput.value) || "";

    if (!student_number || !birthday || !password) {
      setStatus(
        statusEl,
        "Enter your student number, birthday, and password.",
        "error",
      );
      return;
    }
    setStatus(statusEl, "Checking account…");
    btn && (btn.disabled = true);
    try {
      const ready = await ensureSupabaseReady();
      if (!ready) throw new Error("Service not ready. Try again shortly.");
      if (!window.supabaseClient) throw new Error("Supabase client missing");

      const result = await loginWithStudentNumber(
        student_number,
        birthday,
        password,
      );
      if (!result.success) {
        setStatus(statusEl, "Invalid credentials", "error");
        btn && (btn.disabled = false);
        passwordInput && passwordInput.focus();
        return;
      }
      setStatus(statusEl, "✅ Login successful. Redirecting…", "success");
      localStorage.setItem("currentStudentNumber", student_number);
      localStorage.setItem("currentUserId", result.user.id);
      localStorage.setItem("isLoggedIn", "true");
      setTimeout(() => {
        window.location.href = "homepage.html";
      }, 600);
    } catch (err) {
      console.error("Login failed", err);
      setStatus(statusEl, "Invalid credentials", "error");
    } finally {
      btn && (btn.disabled = false);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#alumni-login-form");
    if (form) {
      form.addEventListener("submit", handleLoginSubmit);
    }
  });
})();
