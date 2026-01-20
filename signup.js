/**
 * signup.js - Client-side signup form handling for the root signup page
 *
 * This script handles form submission to Supabase's `signups` table with offline queueing.
 * Form fields: #signupName, #signupEmail, #signupPhone, #signupPassword, #signupConfirm
 * Status updates shown in #signupStatus
 *
 * Storage: Uses localStorage key `signup_queue` for offline submissions
 * Events: Dispatches `signup:saved` and `signup:flushed` for cross-window coordination
 */

// Password strength checker
function checkPasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  Object.values(checks).forEach((check) => {
    if (check) score++;
  });

  return { score, checks };
}

// Update password strength indicator
function updatePasswordStrength(password) {
  const strengthBar = document.getElementById("passwordStrengthBar");
  const { score } = checkPasswordStrength(password);

  // Remove all strength classes
  strengthBar.className = "password-strength-bar";

  if (password.length === 0) {
    return;
  }

  if (score <= 2) {
    strengthBar.classList.add("strength-weak");
  } else if (score === 3) {
    strengthBar.classList.add("strength-fair");
  } else if (score === 4) {
    strengthBar.classList.add("strength-good");
  } else {
    strengthBar.classList.add("strength-strong");
  }
}

// Enhanced field validation with better UX
async function validateField(fieldId, value, validationType) {
  const errorElement = document.getElementById(fieldId + "Error");
  const inputElement = document.getElementById(fieldId);
  let isValid = true;
  let errorMessage = "";

  switch (validationType) {
    case "student_number": {
      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        errorMessage = "Student number is required";
        isValid = false;
      } else {
        const exists = await checkStudentNumberExists(normalized);
        if (exists) {
          errorMessage = "Student number already exists";
          isValid = false;
        }
      }
      // Update status message for real-time feedback (show only once)
      const statusEl = document.getElementById("signupStudentNumberStatus");
      if (!isValid && errorMessage) {
        statusEl.textContent = errorMessage;
        statusEl.style.color = "#e53e3e";
        errorElement.textContent = ""; // Hide duplicate error below input
        errorElement.style.display = "none";
        document.getElementById("signupBtn").disabled = true;
      } else if (normalized) {
        statusEl.textContent = "Student number is available.";
        statusEl.style.color = "#48bb78";
        errorElement.textContent = "";
        errorElement.style.display = "none";
        document.getElementById("signupBtn").disabled = false;
      } else {
        statusEl.textContent = "";
        errorElement.textContent = "";
        errorElement.style.display = "none";
        document.getElementById("signupBtn").disabled = true;
      }
      break;
    }
    case "birthday":
      if (!value) {
        errorMessage = "Birthday is required";
        isValid = false;
      }
      break;
    case "password":
      const { checks } = checkPasswordStrength(value);
      if (!value) {
        errorMessage = "Password is required";
        isValid = false;
      } else if (!checks.length) {
        errorMessage = "Password must be at least 8 characters";
        isValid = false;
      } else if (!checks.uppercase) {
        errorMessage = "Password must contain at least one uppercase letter";
        isValid = false;
      } else if (!checks.lowercase) {
        errorMessage = "Password must contain at least one lowercase letter";
        isValid = false;
      } else if (!checks.number) {
        errorMessage = "Password must contain at least one number";
        isValid = false;
      } else if (!checks.symbol) {
        errorMessage = "Password must contain at least one symbol";
        isValid = false;
      }
      break;
    case "confirm":
      const originalPassword = document.getElementById("signupPassword").value;
      if (!value) {
        errorMessage = "Please confirm your password";
        isValid = false;
      } else if (value !== originalPassword) {
        errorMessage = "Passwords do not match";
        isValid = false;
      }
      break;
  }

  // For other fields, show error below input
  if (validationType !== "student_number") {
    if (isValid) {
      errorElement.style.display = "none";
      inputElement.style.borderColor = value ? "#48bb78" : "#e2e8f0";
    } else {
      errorElement.textContent = errorMessage;
      errorElement.style.display = "block";
      inputElement.style.borderColor = "#e53e3e";
    }
  } else {
    // For student_number, just update border color
    inputElement.style.borderColor = isValid ? "#48bb78" : "#e53e3e";
  }
  return isValid;
}

// Wait for Supabase client to be ready with timeout
function ensureSupabaseReady(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (window.supabase && window.supabaseClientReady) {
      resolve(window.supabase);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.supabase && window.supabaseClientReady) {
        clearInterval(checkInterval);
        resolve(window.supabase);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        reject(new Error("Supabase client not ready within timeout"));
      }
    }, 100);
  });
}

// Check if student number has already been used for signup
async function checkStudentNumberExists(studentNumber) {
  try {
    const normalized = studentNumber.trim().toLowerCase();
    console.log("[CHECK] Normalized student number:", normalized);
    const supabase = await ensureSupabaseReady();
    const { data, error } = await supabase
      .from("signups")
      .select("id,student_number")
      .eq("student_number", normalized)
      .limit(1);
    if (error) {
      console.error("Error checking student number:", error);
      return false; // Allow signup if we can't check (network issue)
    }
    if (data && data.length > 0) {
      console.log("[CHECK] Found in DB:", data[0].student_number);
    }
    return data && data.length > 0;
  } catch (error) {
    return false; // Allow signup if we can't check
  }
}

// Queue signup data for later submission
function queueSignup(signupData) {
  try {
    const queue = JSON.parse(localStorage.getItem("signup_queue") || "[]");
    queue.push({
      ...signupData,
      queued_at: new Date().toISOString(),
    });
    localStorage.setItem("signup_queue", JSON.stringify(queue));
    console.log("Signup queued for later submission:", signupData);
    return true;
  } catch (error) {
    console.error("Failed to queue signup:", error);
    return false;
  }
}

// Flush queued signups to Supabase
async function flushSignupQueue() {
  const queue = JSON.parse(localStorage.getItem("signup_queue") || "[]");
  if (queue.length === 0) {
    console.log("No queued signups to flush");
    return;
  }

  try {
    const supabase = await ensureSupabaseReady();

    console.log(`Flushing ${queue.length} queued signups...`);
    const { data, error } = await supabase.from("signups").insert(queue);

    if (error) {
      console.error("Error flushing signup queue:", error);
      return;
    }

    console.log("Successfully flushed signup queue:", data);
    localStorage.removeItem("signup_queue");

    // Dispatch event for any listening admin pages
    window.dispatchEvent(
      new CustomEvent("signup:flushed", {
        detail: { count: queue.length, data },
      }),
    );
  } catch (error) {
    console.error("Failed to flush signup queue:", error);
  }
}

// Main form submission handler
async function handleSignupSubmission(event) {
  event.preventDefault();
  const statusSpan = document.getElementById("signupStatus");
  const submitBtn = document.getElementById("signupBtn");

  // Get form data
  const formData = {
    student_number: document
      .getElementById("signupStudentNumber")
      .value.trim()
      .toLowerCase(),
    birthday: document.getElementById("signupBirthday").value,
    password: document.getElementById("signupPassword").value,
    confirm_password: document.getElementById("signupConfirm").value,
  };

  // Validate all fields
  const validations = await Promise.all([
    validateField(
      "signupStudentNumber",
      formData.student_number,
      "student_number",
    ),
    validateField("signupBirthday", formData.birthday, "birthday"),
    validateField("signupPassword", formData.password, "password"),
    validateField("signupConfirm", formData.confirm_password, "confirm"),
  ]);

  const isFormValid = validations.every((validation) => validation);
  if (!isFormValid) {
    statusSpan.textContent = "Please fix the errors above";
    statusSpan.style.color = "#e53e3e";
    return;
  }

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";
  statusSpan.textContent = "Checking student number...";
  statusSpan.style.color = "#0b66b3";

  // Check if student number already exists (redundant, but safe)
  const studentExists = await checkStudentNumberExists(formData.student_number);
  if (studentExists) {
    statusSpan.textContent = "Student number already registered.";
    statusSpan.style.color = "#e53e3e";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
    return;
  }

  statusSpan.textContent = "Creating your account...";
  statusSpan.style.color = "#0b66b3";

  try {
    const supabase = await ensureSupabaseReady();
    // Insert into signups table
    const { data, error } = await supabase.from("signups").insert([
      {
        student_number: formData.student_number,
        birthday: formData.birthday,
        password_hash: formData.password, // In production, hash on backend!
      },
    ]);
    if (error) {
      statusSpan.textContent = `Error: ${error.message}`;
      statusSpan.style.color = "#e53e3e";
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
      return;
    }
    statusSpan.textContent = "Account created successfully! Redirecting...";
    statusSpan.style.color = "#48bb78";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    statusSpan.textContent = "Network error. Please try again.";
    statusSpan.style.color = "#e53e3e";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
}

// Initialize form event listeners
document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const passwordInput = document.getElementById("signupPassword");
  const confirmInput = document.getElementById("signupConfirm");
  const studentNumberInput = document.getElementById("signupStudentNumber");
  const birthdayInput = document.getElementById("signupBirthday");

  // Form submission
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignupSubmission);
  }

  // Real-time password strength checking
  if (passwordInput) {
    passwordInput.addEventListener("input", function (e) {
      updatePasswordStrength(e.target.value);
      // Also validate confirm password if it has a value
      const confirmValue = confirmInput?.value;
      if (confirmValue) {
        validateField("signupConfirm", confirmValue, "confirm");
      }
    });
  }

  // Real-time validation for student number uniqueness
  if (studentNumberInput) {
    let lastValue = "";
    let debounceTimeout;
    studentNumberInput.addEventListener("input", function (e) {
      clearTimeout(debounceTimeout);
      const value = e.target.value;
      debounceTimeout = setTimeout(async () => {
        const normalized = value.trim().toLowerCase();
        if (normalized === lastValue) return;
        lastValue = normalized;
        await validateField("signupStudentNumber", value, "student_number");
      }, 400);
    });
  }

  // Real-time birthday validation
  if (birthdayInput) {
    birthdayInput.addEventListener("blur", function (e) {
      validateField("signupBirthday", e.target.value, "birthday");
    });
  }

  if (confirmInput) {
    confirmInput.addEventListener("input", function (e) {
      validateField("signupConfirm", e.target.value, "confirm");
    });
  }

  // Auto-flush queued signups when page loads
  flushSignupQueue();
});
