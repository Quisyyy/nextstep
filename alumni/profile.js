// Profile page JavaScript functionality
// Handles loading and displaying alumni profile information from Supabase

// Wait for Supabase to be ready
async function ensureSupabaseReady(timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (window.supabaseClient && window.supabaseReady) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

// Degree label mapping
const degreeLabels = {
  BSA: "Bachelor of Science in Accountancy (BSA)",
  BSCpE: "Bachelor of Science in Computer Engineering (BSCpE)",
  BSENTREP: "Bachelor of Science in Entrepreneurship (BSENTREP)",
  BSHM: "Bachelor of Science in Hospitality Management (BSHM)",
  BSIT: "Bachelor of Science in Information Technology (BSIT)",
  BSEDEN: "Bachelor of Secondary Education major in English (BSEDEN)",
  BSEDMT: "Bachelor of Secondary Education major in Mathematics (BSEDMT)",
  DOMTLOM:
    "Diploma in Office Management Technology- Legal Office Management (DOMTLOM)",
};

// Format birthday from separate fields
function formatBirthday(month, day, year) {
  if (!month || !day || !year) return "-";
  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[parseInt(month)] || month} ${day}, ${year}`;
}

// Calculate age from birthday
function calculateAge(month, day, year) {
  if (!month || !day || !year) return "-";
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  if (birth > today) return "-";
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age + " years old";
}

// Read profile id from URL
function getProfileIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fetch a single profile by id
async function fetchProfileById(id) {
  const { data, error } = await window.supabaseClient
    .from("alumni_profiles")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  return { data, error };
}

// Fetch latest profile by email
async function fetchLatestProfileByEmail(email) {
  const { data, error } = await window.supabaseClient
    .from("alumni_profiles")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  return { data: data && data[0] ? data[0] : null, error };
}

// --- Patch: Fallback to student number if no profile found by email ---
async function loadProfile() {
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error");
  const contentDiv = document.getElementById("profileContent");

  loadingDiv.style.display = "block";
  errorDiv.style.display = "none";
  contentDiv.style.display = "none";

  // Get current logged-in user student number
  const currentStudentNumber = localStorage.getItem("currentStudentNumber");
  const urlProfileId = getProfileIdFromUrl();

  console.log(
    "🔐 Loading profile - Student Number:",
    currentStudentNumber || "NONE",
    "- URL ID:",
    urlProfileId || "NONE",
  );

  try {
    const ready = await ensureSupabaseReady();
    if (!ready) throw new Error("Database connection not available");

    let profile = null;
    let queryError = null;

    // PRIORITY 1: If URL has a profile ID, fetch it directly
    if (urlProfileId) {
      console.log("🔍 Fetching profile by URL ID:", urlProfileId);
      ({ data: profile, error: queryError } =
        await fetchProfileById(urlProfileId));
    }
    // PRIORITY 2: If logged in, fetch by student number
    else if (currentStudentNumber) {
      console.log(
        "🔍 Fetching profile by student number:",
        currentStudentNumber,
      );
      const { data: snProfile, error: snError } = await window.supabaseClient
        .from("alumni_profiles")
        .select("*")
        .eq("student_number", currentStudentNumber)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (snProfile) {
        profile = snProfile;
        queryError = null;
      } else {
        queryError = snError;
      }
    }
    // No profile yet – show empty template with guidance
    if (!profile && !queryError) {
      console.log("ℹ️ No profile found for user");
      initializeEmptyProfile();
      return;
    }
    if (queryError) throw queryError;
    console.log("✅ Profile loaded:", profile.full_name);
    // Store profile ID for current session ONLY
    if (profile.id) {
      localStorage.setItem("lastProfileId", profile.id);
      localStorage.setItem("lastProfileEmail", profile.email);
    }
    displayProfile(profile);
  } catch (err) {
    console.error("❌ Error loading profile:", err);
    loadingDiv.style.display = "none";
    errorDiv.style.display = "block";
    errorDiv.querySelector("div").textContent =
      err.message || "Unable to load profile.";
  }
}

// Initialize empty profile view when user has no record yet
function initializeEmptyProfile(email) {
  const loadingDiv = document.getElementById("loading");
  const contentDiv = document.getElementById("profileContent");
  const errorDiv = document.getElementById("error");
  loadingDiv.style.display = "none";
  errorDiv.style.display = "none";
  contentDiv.style.display = "block";

  // Clear / set placeholder header
  document.getElementById("avatar").textContent = (
    email ? email.charAt(0) : "?"
  ).toUpperCase();
  document.getElementById("profileName").textContent = "No profile yet";
  document.getElementById("profileDegree").textContent =
    "Fill out your Information Sheet";
  document.getElementById("joinDate").textContent = "-";

  // Ensure all detail fields are dashes
  const fieldIds = [
    "fullName",
    "email",
    "contact",
    "address",
    "birthday",
    "age",
    "degree",
    "studentNumber",
    "major",
    "honors",
    "graduated",
  ];
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = id === "email" ? email || "-" : "-";
  });

  // Edit button just opens blank Information form (no edit param)
  const editButton = document.querySelector("a.btn-edit");
  if (editButton) editButton.href = "Information.html";
}

// Display profile data in the UI
function displayProfile(data) {
  const loadingDiv = document.getElementById("loading");
  const contentDiv = document.getElementById("profileContent");

  // Hide loading, show content
  loadingDiv.style.display = "none";
  contentDiv.style.display = "block";

  // Avatar (first letter of name)
  const avatar = document.getElementById("avatar");
  const nameParts = (data.full_name || "").split(",");
  const firstName = nameParts[1]
    ? nameParts[1].trim()
    : (data.full_name || "").charAt(0) || "?";
  avatar.textContent = firstName.charAt(0).toUpperCase();

  // Header info
  document.getElementById("profileName").textContent =
    data.full_name || "Unknown";
  document.getElementById("profileDegree").textContent =
    data.degree_label ||
    degreeLabels[data.degree] ||
    data.degree ||
    "Not specified";

  // Join date
  const joinDate = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById("joinDate").textContent = joinDate || "-";

  // Personal information
  document.getElementById("fullName").textContent = data.full_name || "-";
  document.getElementById("email").textContent = data.email || "-";
  document.getElementById("contact").textContent = data.contact || "-";
  // --- Address: Convert codes to names and combine ---
  async function getLocationName(type, code) {
    if (!code) return "";
    try {
      if (type === "province") {
        const res = await fetch(
          `https://psgc.gitlab.io/api/provinces/${code}/`,
        );
        if (!res.ok) return "";
        const json = await res.json();
        return json.name || "";
      } else if (type === "city") {
        const res = await fetch(
          `https://psgc.gitlab.io/api/cities-municipalities/${code}/`,
        );
        if (!res.ok) return "";
        const json = await res.json();
        return json.name || "";
      } else if (type === "barangay") {
        const res = await fetch(
          `https://psgc.gitlab.io/api/barangays/${code}/`,
        );
        if (!res.ok) return "";
        const json = await res.json();
        return json.name || "";
      }
    } catch (e) {
      return "";
    }
    return "";
  }

  (async function () {
    const provinceName = await getLocationName("province", data.province);
    const cityName = await getLocationName("city", data.municipality);
    const barangayName = await getLocationName("barangay", data.barangay);
    const street = data.street_details || "";
    let address = "";
    if (provinceName || cityName || barangayName || street) {
      address = [street, barangayName, cityName, provinceName]
        .filter(Boolean)
        .join(", ");
    } else {
      address = "-";
    }
    document.getElementById("address").textContent = address;
  })();
  document.getElementById("birthday").textContent = formatBirthday(
    data.birth_month,
    data.birth_day,
    data.birth_year,
  );
  document.getElementById("age").textContent = calculateAge(
    data.birth_month,
    data.birth_day,
    data.birth_year,
  );

  // Academic information
  document.getElementById("degree").textContent =
    data.degree_label || degreeLabels[data.degree] || data.degree || "-";
  document.getElementById("studentNumber").textContent =
    data.student_number || "-";
  document.getElementById("major").textContent = data.major || "-";
  document.getElementById("honors").textContent = data.honors || "-";
  document.getElementById("graduated").textContent = data.graduated_year || "-";

  // Job Status & Career Information
  document.getElementById("jobStatus").textContent = data.job_status || "-";
  document.getElementById("currentJob").textContent = data.current_job || "-";
  document.getElementById("careerPath").textContent = data.career_path || "-";

  // Update edit button to include profile ID for editing
  const editButton = document.querySelector("a.btn-edit");
  if (editButton && data.id) {
    const editUrl = `../Information.html?edit=${data.id}`;
    editButton.href = editUrl;
    console.log("✅ Edit button URL set to:", editUrl);
    console.log("Profile ID:", data.id);
  } else {
    console.warn("⚠️ Edit button setup failed");
    console.log("Edit button element:", editButton);
    console.log("Profile ID:", data.id);
  }
}

function initAuthNav() {
  // Auth nav is handled by auth-nav.js
  // Just refresh it in case it wasn't ready earlier
  if (window.updateAuthNav) {
    window.updateAuthNav();
  }
}

// Clear cached profile data when email changes (account switch detection)
function detectAccountSwitch() {
  const currentEmail = (localStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  const lastEmail = localStorage.getItem("lastProfileEmail");

  if (lastEmail && currentEmail && lastEmail !== currentEmail) {
    console.log("🔄 Account switch detected:", lastEmail, "→", currentEmail);
    localStorage.removeItem("lastProfileId");
    localStorage.removeItem("lastProfileEmail");
    console.log("🧹 Cleared old profile cache");
  }
}

// Listen for profile updates from the Information page
window.addEventListener("alumni:saved", function (e) {
  console.log("Profile updated, reloading...");
  // Small delay to ensure database is updated
  setTimeout(() => loadProfile(), 500);
});

// Check if we're returning from an edit (shows success message)
function checkForUpdateSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const updated = urlParams.get("updated") === "true";
  const created = urlParams.get("created") === "true";

  if (updated || created) {
    // Show success message briefly
    const successMsg = document.createElement("div");
    successMsg.style.cssText =
      "position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 15px 30px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); font-size: 16px;";
    successMsg.textContent = created
      ? "✅ Profile created successfully!"
      : "✅ Profile updated successfully!";
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);

    // Clean up URL without reload
    const cleanUrl =
      window.location.pathname +
      (urlParams.get("id") ? "?id=" + urlParams.get("id") : "");
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  detectAccountSwitch(); // Check for account changes before loading
  initAuthNav();
  checkForUpdateSuccess();
  loadProfile();
});
