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
function validateField(fieldId, value, validationType) {
  const errorElement = document.getElementById(fieldId + "Error");
  const inputElement = document.getElementById(fieldId);

  let isValid = true;
  let errorMessage = "";

  switch (validationType) {
    case "name":
      if (!value.trim()) {
        errorMessage = "Full name is required";
        isValid = false;
      }
      break;

    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        errorMessage = "Email is required";
        isValid = false;
      } else if (!emailRegex.test(value)) {
        errorMessage = "Please enter a valid email address";
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

  // Update UI
  if (isValid) {
    errorElement.style.display = "none";
    inputElement.style.borderColor = value ? "#48bb78" : "#e2e8f0";
  } else {
    errorElement.textContent = errorMessage;
    errorElement.style.display = "block";
    inputElement.style.borderColor = "#e53e3e";
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

// Check if email has already been used for signup
async function checkEmailExists(email) {
  try {
    const supabase = await ensureSupabaseReady();
    const { data, error } = await supabase
      .from("signups")
      .select("id")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (error) {
      console.error("Error checking email:", error);
      return false; // Allow signup if we can't check (network issue)
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

  const form = event.target;
  const statusSpan = document.getElementById("signupStatus");
  const submitBtn = document.getElementById("signupBtn");

  // Get form data
  const formData = {
    full_name: document.getElementById("signupName").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    phone: document.getElementById("signupPhone").value.trim() || null,
    password: document.getElementById("signupPassword").value,
    confirm_password: document.getElementById("signupConfirm").value,
    role: document.getElementById("signupRole").value || "student",
  };

  // Check terms and conditions checkbox
  const termsCheckbox = document.getElementById("signupTerms");
  if (!termsCheckbox || !termsCheckbox.checked) {
    statusSpan.textContent =
      "You must agree to the Terms and Conditions to sign up";
    statusSpan.style.color = "#e53e3e";
    return;
  }

  // Validate all fields
  const validations = [
    validateField("signupName", formData.full_name, "name"),
    validateField("signupEmail", formData.email, "email"),
    validateField("signupPassword", formData.password, "password"),
    validateField("signupConfirm", formData.confirm_password, "confirm"),
  ];

  const isFormValid = validations.every((validation) => validation);

  if (!isFormValid) {
    statusSpan.textContent = "Please fix the errors above";
    statusSpan.style.color = "#e53e3e";
    return;
  }

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";
  statusSpan.textContent = "Checking email availability...";
  statusSpan.style.color = "#0b66b3";

  // Check if email already exists
  const emailExists = await checkEmailExists(formData.email);
  if (emailExists) {
    statusSpan.textContent =
      "Email already registered. Please use a different email or sign in.";
    statusSpan.style.color = "#e53e3e";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
    return;
  }

  statusSpan.textContent = "Creating your account...";
  statusSpan.style.color = "#0b66b3";

  try {
    const supabase = await ensureSupabaseReady();

    // Use Supabase Auth to create the user
    console.log("Creating user with Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role || "user",
        },
      },
    });

    if (authError) {
      console.error("Supabase Auth signup error:", authError);
      statusSpan.textContent = `Error: ${authError.message}`;
      statusSpan.style.color = "#e53e3e";
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
      return;
    }

    console.log("Auth signup successful:", authData);
    statusSpan.textContent = "Account created successfully! Redirecting...";
    statusSpan.style.color = "#48bb78";

    // Redirect after success
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    console.error("Signup error:", error);
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
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");

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

  // Real-time validation for other fields
  if (nameInput) {
    nameInput.addEventListener("blur", function (e) {
      validateField("signupName", e.target.value, "name");
    });
  }

  if (emailInput) {
    emailInput.addEventListener("blur", function (e) {
      validateField("signupEmail", e.target.value, "email");
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
