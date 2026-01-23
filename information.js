// --- Stub for missing function to prevent ReferenceError ---
function populateJobsForCareerPath(careerPath) {
  const jobSelect = document.getElementById("currentJob");
  if (!jobSelect) return;
  // Define jobs for each career path
  const jobsByCareerPath = {
    IT: [
      "Software Developer",
      "Web Developer",
      "Network Administrator",
      "IT Support Specialist",
      "Database Administrator",
      "Cybersecurity Analyst",
      "UI/UX Designer",
      "QA Tester",
    ],
    Technology: [
      "Software Engineer",
      "Systems Analyst",
      "IT Project Manager",
      "Cloud Engineer",
      "DevOps Engineer",
      "Mobile App Developer",
      "Technical Support Specialist",
    ],
    Engineering: [
      "Civil Engineer",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Electronics Engineer",
      "Project Engineer",
      "Structural Engineer",
      "Field Engineer",
    ],
    Education: [
      "Teacher",
      "Instructor",
      "Professor",
      "Guidance Counselor",
      "School Administrator",
      "Curriculum Developer",
    ],
    Business: [
      "Accountant",
      "Business Analyst",
      "Marketing Specialist",
      "Sales Executive",
      "HR Officer",
      "Operations Manager",
      "Entrepreneur",
    ],
    Hospitality: [
      "Hotel Manager",
      "Front Desk Officer",
      "Event Coordinator",
      "Tourism Officer",
      "Food and Beverage Manager",
    ],
    Law: ["Legal Assistant", "Paralegal", "Office Clerk", "Records Officer"],
    Legal: [
      "Legal Researcher",
      "Legal Secretary",
      "Legal Officer",
      "Paralegal",
      "Records Officer",
      "Compliance Officer",
    ],
    // Add more mappings as needed
  };
  // Normalize key: remove spaces, lowercase
  const key = careerPath
    ? careerPath.trim().replace(/\s+/g, "").toLowerCase()
    : "";
  // Build a lookup map with lowercased keys
  const jobsMap = {};
  Object.keys(jobsByCareerPath).forEach((k) => {
    jobsMap[k.replace(/\s+/g, "").toLowerCase()] = jobsByCareerPath[k];
  });
  const jobs = jobsMap[key] || [];
  jobSelect.innerHTML = "";
  // Add default option
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.text = "Select Job Position";
  jobSelect.appendChild(defaultOpt);
  // Add jobs
  jobs.forEach((j) => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.text = j;
    jobSelect.appendChild(opt);
  });
  // Always add 'Other' option
  const otherOpt = document.createElement("option");
  otherOpt.value = "Other";
  otherOpt.text = "Other";
  jobSelect.appendChild(otherOpt);
}
// --- Stub for missing function to prevent ReferenceError ---
function populateMajorsForDegree(degree) {
  const majorSelect = document.getElementById("major");
  if (!majorSelect) return;

  // Map display values to internal codes
  const degreeMap = {
    "BSE(ENGLISH)": "BSEDEN",
    "BSE(MATHEMATICS)": "BSEDMT",
    "BSE(MATH)": "BSEDMT",
    BSE: "BSEDGEN",
    DOMT: "DOMTLOM",
    BSEDEN: "BSEDEN",
    BSEDMT: "BSEDMT",
    BSEDGEN: "BSEDGEN",
    BSA: "BSA",
    BSCE: "BSCE",
    BSCpE: "BSCpE",
    BSEntrep: "BSENTREP",
    BSENTREP: "BSENTREP",
    BSHM: "BSHM",
    BSIT: "BSIT",
    DOMTLOM: "DOMTLOM",
  };
  const lookupKey = degreeMap[degree] || degree;
  // Define majors for each degree
  const majorsByDegree = {
    BSA: ["Accountancy"],
    BSCE: [
      "Computer Engineering",
      "Embedded Systems",
      "Robotics",
      "Communications",
      "Microelectronics",
      "Software Systems",
    ],
    BSCpE: [
      "Computer Engineering",
      "Embedded Systems",
      "Robotics",
      "Communications",
      "Microelectronics",
      "Software Systems",
    ],
    BSENTREP: [
      "Business Management",
      "Marketing",
      "Finance",
      "Operations",
      "Entrepreneurship",
    ],
    BSHM: [
      "Hospitality Management",
      "Culinary Arts",
      "Hotel Management",
      "Tourism Management",
      "Events Management",
    ],
    BSIT: [
      "Information Technology",
      "Network Administration",
      "Web Development",
      "Software Engineering",
      "Database Systems",
      "Cybersecurity",
      "Multimedia",
    ],
    BSEDEN: ["English", "Literature", "Linguistics", "Communication Arts"],
    BSEDMT: [
      "Mathematics",
      "Statistics",
      "Applied Mathematics",
      "Mathematics Education",
    ],
    BSEDGEN: [
      "General Education",
      "Early Childhood Education",
      "Special Education",
      "Educational Management",
    ],
    DOMTLOM: [
      "Legal Office Management",
      "Office Administration",
      "Records Management",
    ],
  };
  const majors = majorsByDegree[lookupKey] || [];

  majorSelect.innerHTML = "";
  // Add default option
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.text = "Select Major/Specialization";
  majorSelect.appendChild(defaultOpt);
  // Add majors
  majors.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.text = m;
    majorSelect.appendChild(opt);
  });
  // Always add 'Other' option
  const otherOpt = document.createElement("option");
  otherOpt.value = "Other";
  otherOpt.text = "Other";
  majorSelect.appendChild(otherOpt);
}
// --- Upsert logic for alumni_profiles ---
let existingProfileId = null;
let originalProfileData = null;
async function checkAndLoadAlumniProfile() {
  const studentNumber = localStorage.getItem("currentStudentNumber");
  const currentEmail = (localStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  if ((!studentNumber && !currentEmail) || !window.supabaseClient) return;
  let data = null,
    error = null;
  // Try by student number first
  if (studentNumber) {
    ({ data, error } = await window.supabaseClient
      .from("alumni_profiles")
      .select("*")
      .eq("student_number", studentNumber)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle());
  }
  // If not found, try by email
  if ((!data || error) && currentEmail) {
    ({ data, error } = await window.supabaseClient
      .from("alumni_profiles")
      .select("*")
      .eq("email", currentEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle());
  }
  if (data) {
    existingProfileId = data.id;
    originalProfileData = { ...data };
    // If not already in edit mode, redirect to URL with ?id=profileId
    const url = new URL(window.location.href);
    if (url.searchParams.get("id") !== String(data.id)) {
      url.searchParams.set("id", data.id);
      window.location.replace(url.toString());
      return; // Stop further execution, page will reload
    }
    populateFormWithData(data);
  } else {
    existingProfileId = null;
    originalProfileData = null;
    // Autofill from signups for new users
    try {
      let signupData = null;
      if (studentNumber) {
        const res = await window.supabaseClient
          .from("signups")
          .select("full_name,email,birthday")
          .eq("student_number", studentNumber)
          .maybeSingle();
        signupData = res.data;
      }
      if (!signupData && currentEmail) {
        const res = await window.supabaseClient
          .from("signups")
          .select("full_name,email,birthday")
          .eq("email", currentEmail)
          .maybeSingle();
        signupData = res.data;
      }
      if (signupData) {
        if (signupData.full_name && document.getElementById("fullname")) {
          document.getElementById("fullname").value = signupData.full_name;
          document.getElementById("fullname").readOnly = true;
        }
        if (signupData.email && document.getElementById("email")) {
          document.getElementById("email").value = signupData.email;
          document.getElementById("email").readOnly = true;
        }
        if (signupData.birthday) {
          const birthDate = new Date(signupData.birthday);
          const dayEl = document.getElementById("birth-day");
          const yearEl = document.getElementById("birth-year");
          const monthEl = document.getElementById("birth-month");
          if (dayEl && yearEl && monthEl) {
            dayEl.value = birthDate.getDate();
            yearEl.value = birthDate.getFullYear();
            monthEl.value = birthDate.getMonth() + 1;
            dayEl.disabled = true;
            yearEl.disabled = true;
            monthEl.disabled = true;
          }
          // Compute age
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (document.getElementById("age")) {
            document.getElementById("age").value = age + " yrs";
          }
        }
      }
    } catch (err) {
      console.error("Autofill from signups failed", err);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(checkAndLoadAlumniProfile, 700); // Wait for dropdowns and autofill
});
// --- Auto-fill student number field ---
document.addEventListener("DOMContentLoaded", function () {
  const studentNumber = localStorage.getItem("currentStudentNumber");
  if (studentNumber && document.getElementById("student_number")) {
    document.getElementById("student_number").value = studentNumber;
  }
  populateBirthdayDropdownsAndAutofill();
});
// --- Auto-fill birthday and compute age from signups table ---
async function autofillBirthdayAndAge() {
  const studentNumberRaw = localStorage.getItem("currentStudentNumber");
  const studentNumber = studentNumberRaw
    ? studentNumberRaw.trim().toUpperCase()
    : null;
  if (studentNumber && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from("signups")
        .select("birthday")
        .eq("student_number", studentNumber)
        .limit(1);
      console.log("[autofillBirthdayAndAge] Query result:", { data, error });
      if (data && data.length > 0 && data[0].birthday) {
        const birthday = data[0].birthday;
        const birthDate = new Date(birthday);
        console.log("[autofillBirthdayAndAge] Parsed birthday:", birthDate);
        const dayEl = document.getElementById("birth-day");
        const yearEl = document.getElementById("birth-year");
        const monthEl = document.getElementById("birth-month");
        if (dayEl && yearEl && monthEl) {
          dayEl.value = birthDate.getDate();
          yearEl.value = birthDate.getFullYear();
          monthEl.value = birthDate.getMonth() + 1;
          // Make fields readonly/disabled after autofill
          dayEl.disabled = true;
          yearEl.disabled = true;
          monthEl.disabled = true;
          console.log(
            "[autofillBirthdayAndAge] Set fields and made readonly:",
            {
              day: birthDate.getDate(),
              year: birthDate.getFullYear(),
              month: birthDate.getMonth() + 1,
            },
          );
        }
        // Compute age
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (document.getElementById("age")) {
          document.getElementById("age").value = age + " yrs";
        }
      } else {
        console.warn(
          "[autofillBirthdayAndAge] No birthday data found for student number:",
          studentNumber,
        );
      }
    } catch (err) {
      console.error("Birthday autofill failed", err);
    }
  } else {
    console.warn(
      "[autofillBirthdayAndAge] No student number or supabase client not ready",
    );
  }
}

// Make birthday fields readonly if already filled
function setBirthdayReadonlyIfFilled() {
  const day = document.getElementById("birth-day");
  const month = document.getElementById("birth-month");
  const year = document.getElementById("birth-year");
  if (day && month && year) {
    if (day.value && month.value && year.value) {
      day.disabled = true;
      month.disabled = true;
      year.disabled = true;
    } else {
      day.disabled = false;
      month.disabled = false;
      year.disabled = false;
    }
  }
}

// Helper to get edit profile ID from URL
function getEditProfileId() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  return id ? id : null;
}

// Ensure birthday dropdowns are populated before autofill
function populateBirthdayDropdownsAndAutofill() {
  // Populate months
  const monthSelect = document.getElementById("birth-month");
  const months = [
    "Month",
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
  monthSelect.innerHTML = "";
  months.forEach((m, idx) => {
    const opt = document.createElement("option");
    opt.value = idx === 0 ? "" : idx;
    opt.text = m;
    monthSelect.appendChild(opt);
  });
  // Populate years
  const yearSelect = document.getElementById("birth-year");
  yearSelect.innerHTML = "";
  const currentYear = new Date().getFullYear();
  const start = currentYear - 100;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.text = "Year";
  yearSelect.appendChild(placeholder);
  for (let y = currentYear; y >= start; y--) {
    const o = document.createElement("option");
    o.value = y;
    o.text = y;
    yearSelect.appendChild(o);
  }
  // Populate days
  const daySelect = document.getElementById("birth-day");
  daySelect.innerHTML = "";
  const dayPlaceholder = document.createElement("option");
  dayPlaceholder.value = "";
  dayPlaceholder.text = "Day";
  daySelect.appendChild(dayPlaceholder);
  for (let d = 1; d <= 31; d++) {
    const o = document.createElement("option");
    o.value = d;
    o.text = d;
    daySelect.appendChild(o);
  }
  // Wait for Supabase client to be ready before autofill
  (async function waitAndAutofill(retries = 20) {
    for (let i = 0; i < retries; i++) {
      if (window.supabaseClient) {
        await autofillBirthdayAndAge();
        return;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    console.warn(
      "[autofillBirthdayAndAge] Supabase client not ready after waiting",
    );
  })();
}

// --- Populate form with existing data ---
function populateFormWithData(data) {
  // Set is_related dropdown (Related to Degree)
  if (
    typeof data.is_related !== "undefined" &&
    document.getElementById("isRelated")
  ) {
    document.getElementById("isRelated").value = data.is_related
      ? "true"
      : "false";
  }
  // Personal Info
  if (data.full_name) {
    document.getElementById("fullname").value = data.full_name;
    document.getElementById("fullname").readOnly = true;
  }
  if (data.email) {
    document.getElementById("email").value = data.email;
    document.getElementById("email").readOnly = true;
  }
  if (data.contact) document.getElementById("contact").value = data.contact;
  // Birthday
  if (data.birth_month)
    document.getElementById("birth-month").value = String(data.birth_month);
  if (data.birth_day)
    document.getElementById("birth-day").value = String(data.birth_day);
  if (data.birth_year)
    document.getElementById("birth-year").value = String(data.birth_year);
  if (data.birth_month && data.birth_day && data.birth_year) {
    computeAge();
    // Make birthday fields readonly if all are filled
    document.getElementById("birth-day").disabled = true;
    document.getElementById("birth-month").disabled = true;
    document.getElementById("birth-year").disabled = true;
  }
  // Address (with dropdown population)
  if (data.province) {
    document.getElementById("province").value = data.province;
    if (typeof populateCities === "function")
      populateCities().then(() => {
        if (data.municipality) {
          document.getElementById("city").value = data.municipality;
          if (typeof populateBarangays === "function")
            populateBarangays().then(() => {
              if (data.barangay)
                document.getElementById("barangay").value = data.barangay;
            });
        }
      });
  }
  if (data.street) document.getElementById("streetDetails").value = data.street;
  // Academic
  function setDropdownValue(dropdownId, value) {
    const select = document.getElementById(dropdownId);
    if (!select) return;
    if (value == null || value === "") return;
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === value) {
        found = true;
        break;
      }
    }
    if (!found) {
      // Add missing value as an option
      const opt = document.createElement("option");
      opt.value = value;
      opt.text = value;
      select.appendChild(opt);
    }
    select.value = value;
  }
  setDropdownValue("degree", data.degree);
  if (data.student_number && document.getElementById("student_number"))
    document.getElementById("student_number").value = data.student_number;
  setDropdownValue("major", data.major);
  if (data.honors) document.getElementById("honors").value = data.honors;
  setDropdownValue("graduated", String(data.graduated_year));
  // Job & Career
  setDropdownValue("careerPath", data.career_path);
  setDropdownValue("jobStatus", data.job_status);
  setDropdownValue("currentJob", data.current_job);
  if (data.previous_roles)
    document.getElementById("previousRoles").value = data.previous_roles;
  if (data.career_path)
    document.getElementById("careerPath").value = data.career_path;
  if (data.industry) document.getElementById("industry").value = data.industry;
  if (data.professional_certificates)
    document.getElementById("professionalCertificates").value =
      data.professional_certificates;
  if (
    data.open_for_mentorship !== undefined &&
    document.getElementById("openForMentorship")
  )
    document.getElementById("openForMentorship").value =
      data.open_for_mentorship;

  // Update form title to indicate edit mode
  const formTitle = document.querySelector(".form-title");
  if (formTitle) {
    formTitle.textContent = "Edit Information Sheet";
    formTitle.style.color = "#0066cc";
  }

  // Update save button text
  const saveButton = document.getElementById("saveProfile");
  if (saveButton) {
    saveButton.textContent = "Update Profile";
    saveButton.style.background = "#28a745";
  }

  // Remove debugText reference to fix ReferenceError
  console.log("✅ Form populated successfully");

  // Hide debug info after 3 seconds
  setTimeout(() => {
    const debugDiv = document.getElementById("debugInfo");
    if (debugDiv) debugDiv.style.display = "none";
  }, 3000);
}

// Populate month/day/year selects and compute age
const monthSelect = document.getElementById("birth-month");
const daySelect = document.getElementById("birth-day");
const yearSelect = document.getElementById("birth-year");
const ageInput = document.getElementById("age");

const months = [
  "Month",
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
months.forEach((m, idx) => {
  const opt = document.createElement("option");
  opt.value = idx; // 0 = placeholder
  opt.text = m;
  monthSelect.appendChild(opt);
});

function populateYears(range = 70) {
  const currentYear = new Date().getFullYear();
  const start = currentYear - range;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.text = "Year";
  yearSelect.appendChild(placeholder);
  for (let y = currentYear; y >= start; y--) {
    const o = document.createElement("option");
    o.value = y;
    o.text = y;
    yearSelect.appendChild(o);
  }
}

function populateDays(days = 31) {
  daySelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.text = "Day";
  daySelect.appendChild(placeholder);
  for (let d = 1; d <= days; d++) {
    const o = document.createElement("option");
    o.value = d;
    o.text = d;
    daySelect.appendChild(o);
  }
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex, 0).getDate();
}

populateDays(31);
populateYears(100);

function updateDaysForSelection() {
  const m = parseInt(monthSelect.value, 10);
  const y = parseInt(yearSelect.value, 10) || new Date().getFullYear();
  const prevDay = parseInt(daySelect.value, 10) || null;
  if (!m || m === 0) {
    populateDays(31);
    return;
  }
  const dim = daysInMonth(y, m);
  populateDays(dim);
  if (prevDay && prevDay <= dim) {
    daySelect.value = prevDay;
  }
}

function computeAge() {
  const m = parseInt(monthSelect.value, 10);
  const d = parseInt(daySelect.value, 10);
  const y = parseInt(yearSelect.value, 10);
  if (!m || !d || !y) {
    ageInput.value = "";
    return;
  }
  const today = new Date();
  const birth = new Date(y, m - 1, d);
  if (birth > today) {
    ageInput.value = "";
    return;
  }
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
  ageInput.value = age + " yrs";
}

monthSelect.addEventListener("change", () => {
  updateDaysForSelection();
  computeAge();
});
yearSelect.addEventListener("change", () => {
  updateDaysForSelection();
  computeAge();
});
daySelect.addEventListener("change", computeAge);

monthSelect.value = "";
daySelect.value = "";
yearSelect.value = "";

// populate graduated years (from earliest alumni year to current year)
const gradSelect = document.getElementById("graduated");
if (gradSelect) {
  gradSelect.innerHTML = "";
  const currentYear = new Date().getFullYear();
  const earliestYear = 1950; // Set to earliest possible alumni year
  for (let y = currentYear; y >= earliestYear; y--) {
    const o = document.createElement("option");
    o.value = y;
    o.text = y;
    gradSelect.appendChild(o);
  }
  console.log(`Graduated years populated: ${earliestYear} to ${currentYear}`);
} else {
  console.error("Graduate select element not found");
}

// Degree label map
// Map display values to internal codes (reuse from populateMajorsForDegree)
function mapDegreeToCode(degree) {
  const degreeMap = {
    "BSE(ENGLISH)": "BSEDEN",
    "BSE(MATHEMATICS)": "BSEDMT",
    "BSE(MATH)": "BSEDMT",
    BSE: "BSEDGEN",
    DOMT: "DOMTLOM",
    BSEDEN: "BSEDEN",
    BSEDMT: "BSEDMT",
    BSEDGEN: "BSEDGEN",
    BSA: "BSA",
    BSCE: "BSCE",
    BSCpE: "BSCE", // Map BSCpE to BSCE for consistency
    BSEntrep: "BSENTREP",
    BSENTREP: "BSENTREP",
    BSHM: "BSHM",
    BSIT: "BSIT",
    DOMTLOM: "DOMTLOM",
  };
  return degreeMap[degree] || degree;
}
const degreeLabels = {
  BSA: "Bachelor of Science in Accountancy (BSA)",
  BSCE: "Bachelor of Science in Computer Engineering (BSCE)",
  BSCpE: "Bachelor of Science in Computer Engineering (BSCE)", // Keep for backward compatibility
  BSENTREP: "Bachelor of Science in Entrepreneurship (BSENTREP)",
  BSHM: "Bachelor of Science in Hospitality Management (BSHM)",
  BSIT: "Bachelor of Science in Information Technology (BSIT)",
  BSEDEN: "Bachelor of Secondary Education major in English (BSEDEN)",
  BSEDMT: "Bachelor of Secondary Education major in Mathematics (BSEDMT)",
  DOMTLOM:
    "Diploma in Office Management Technology- Legal Office Management (DOMTLOM)",
};

function labelForDegree(code) {
  return degreeLabels[code] || "";
}

// Student number validation (2019-xxxxx-SM-0 to 2022-xxxxx-SM-0)
function validateStudentNumber(studentNum) {
  if (!studentNum || studentNum.trim() === "") {
    return { valid: true, message: "" }; // Allow empty (optional field)
  }

  // Pattern: 2019-xxxxx-SM-0 to 2026-xxxxx-SM-0
  const pattern = /^20(19|20|21|22|23|24|25|26)-\d{5}-SM-0$/;

  if (!pattern.test(studentNum)) {
    return {
      valid: false,
      message:
        "Invalid student number format. Must be 2019-xxxxx-SM-0 to 2026-xxxxx-SM-0",
    };
  }

  return { valid: true, message: "" };
}

// Remove real-time validation for student number (readonly, autofilled)

// --- PSGC API Address Dropdown Logic ---
async function populateProvinces() {
  const provinceSelect = document.getElementById("province");
  if (!provinceSelect || !window.phLocations) return;
  provinceSelect.innerHTML = '<option value="">Select Province</option>';
  const provinces = await window.phLocations.getProvinces();
  provinces.forEach((prov) => {
    const opt = document.createElement("option");
    opt.value = prov.code;
    opt.text = prov.name;
    provinceSelect.appendChild(opt);
  });
}

async function populateCities() {
  const provinceSelect = document.getElementById("province");
  const citySelect = document.getElementById("city");
  if (!provinceSelect || !citySelect || !window.phLocations) return;
  citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
  if (!provinceSelect.value) return;
  const cities = await window.phLocations.getCitiesMunicipalities(
    provinceSelect.value,
  );
  cities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city.code;
    opt.text = city.name;
    citySelect.appendChild(opt);
  });
}

async function populateBarangays() {
  const citySelect = document.getElementById("city");
  const barangaySelect = document.getElementById("barangay");
  if (!citySelect || !barangaySelect || !window.phLocations) return;
  barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
  if (!citySelect.value) return;
  const barangays = await window.phLocations.getBarangays(citySelect.value);
  barangays.forEach((brgy) => {
    const opt = document.createElement("option");
    opt.value = brgy.name;
    opt.text = brgy.name;
    barangaySelect.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // Career Path logic
  // Populate jobs on page load if career path is pre-selected (edit mode)
  const careerPathSelect = document.getElementById("careerPath");
  if (careerPathSelect.value) {
    populateJobsForCareerPath(careerPathSelect.value);
  }
  careerPathSelect.addEventListener("change", function () {
    if (this.value === "other") {
      document.getElementById("careerPathOther").style.display = "";
    } else {
      document.getElementById("careerPathOther").style.display = "none";
    }
    populateJobsForCareerPath(this.value);
    document.getElementById("currentJob").value = "";
    document.getElementById("currentJobOther").style.display = "none";
  });
  document.getElementById("currentJob").addEventListener("change", function () {
    if (this.value === "Other") {
      document.getElementById("currentJobOther").style.display = "";
    } else {
      document.getElementById("currentJobOther").style.display = "none";
    }
  });
  // Major/Specialization logic
  document.getElementById("degree").addEventListener("change", function () {
    populateMajorsForDegree(this.value);
    document.getElementById("major").value = "";
    document.getElementById("majorOther").style.display = "none";
  });
  document.getElementById("major").addEventListener("change", function () {
    if (this.value === "Other") {
      document.getElementById("majorOther").style.display = "";
    } else {
      document.getElementById("majorOther").style.display = "none";
    }
  });
  // Wait for phLocations PSGC API helpers to be available
  let tries = 0;
  while (!window.phLocations || !window.phLocations.getProvinces) {
    await new Promise((r) => setTimeout(r, 100));
    tries++;
    if (tries > 20) break;
  }
  if (!window.phLocations || !window.phLocations.getProvinces) {
    console.error("❌ PH Locations PSGC API helpers not loaded!");
  } else {
    await populateProvinces();
    document
      .getElementById("province")
      .addEventListener("change", async function () {
        await populateCities();
        document.getElementById("city").value = "";
        await populateBarangays();
        document.getElementById("barangay").value = "";
      });
    document
      .getElementById("city")
      .addEventListener("change", async function () {
        await populateBarangays();
        document.getElementById("barangay").value = "";
      });
  }

  console.log("═══════════════════════════════════════");
  console.log("🚀 Information form initializing...");
  console.log("Current URL:", window.location.href);
  console.log("═══════════════════════════════════════");

  const saveButton = document.getElementById("saveProfile");
  if (!saveButton) {
    console.error(
      "❌ Save button #saveProfile not found! Check HTML element IDs.",
    );
    alert("Error: Save button not found. Please refresh the page.");
    return;
  }
  console.log("✅ Save button found");

  // Wait for all dropdowns to be populated
  console.log("⏳ Waiting 500ms for dropdowns to populate...");
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("✅ Wait complete");

  // Check if we're in edit mode and load existing data
  const editProfileId = getEditProfileId();
  console.log(
    "📋 Edit Profile ID from URL:",
    editProfileId || "NONE (new profile mode)",
  );

  if (editProfileId) {
    console.log("🔧 ═══ EDIT MODE ACTIVATED ═══");
    console.log("Profile ID to load:", editProfileId);

    // Show edit mode indicator
    const editModeIndicator = document.getElementById("editModeIndicator");
    if (editModeIndicator) {
      editModeIndicator.style.display = "block";
      editModeIndicator.textContent =
        "🔧 EDIT MODE - Loading Profile ID: " + editProfileId;
    }

    // Show loading indicator
    const status = document.getElementById("saveStatus");
    if (status) {
      status.textContent = "⏳ Loading profile data...";
      status.style.color = "#0066cc";
    }

    console.log("📞 Calling loadProfileForEdit...");
    const existingData = await loadProfileForEdit(editProfileId);

    if (existingData) {
      console.log("✅ Data retrieved successfully:", existingData);
      console.log("📝 Calling populateFormWithData...");
      populateFormWithData(existingData);
      console.log("✅ populateFormWithData completed");
      if (status) status.textContent = "";
    } else {
      console.error("❌ loadProfileForEdit returned NULL");
      console.error("This means either:");
      console.error("  1. Supabase is not ready");
      console.error("  2. Profile not found in database");
      console.error("  3. Database query error");
      if (status) {
        status.textContent = "⚠️ Could not load profile data!";
        status.style.color = "red";
      }
      alert(
        "ERROR: Could not load profile data.\n\nPlease check:\n1. Is the database online?\n2. Does this profile exist?\n3. Check browser console (F12) for details.",
      );
    }
  } else {
    console.log("📝 New profile mode (no edit ID in URL)");
  }

  console.log("═══════════════════════════════════════");
  console.log("✅ Initialization complete - ready for user interaction");
  console.log("═══════════════════════════════════════");

  saveButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const status = document.getElementById("saveStatus");
    if (status) {
      status.innerHTML = "";
      status.style.fontSize = "";
      status.style.color = "";
    }

    // Check if user is logged in (required for saving profile)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const studentNumber = localStorage.getItem("currentStudentNumber");
    if ((!isLoggedIn || !studentNumber) && !getEditProfileId()) {
      if (status) {
        status.textContent = "Please login first to save your profile";
        status.style.color = "red";
      }
      alert(
        "You must be logged in to save your profile.\n\nPlease login or signup first.",
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    // Check if we're in edit mode
    const editProfileId = getEditProfileId();
    const isEditMode = !!editProfileId;

    console.log("💾 Preparing to save...");
    console.log("Mode:", isEditMode ? "UPDATE (Edit)" : "INSERT (New)");
    console.log("Profile ID:", editProfileId || "N/A");

    const payload = {
      full_name: document.getElementById("fullname").value || null,
      email: document.getElementById("email").value || null,
      birth_month: document.getElementById("birth-month").value || null,
      birth_day: document.getElementById("birth-day").value || null,
      birth_year: document.getElementById("birth-year").value || null,
      contact:
        window.iti && iti.getNumber
          ? iti.getNumber()
          : document.getElementById("contact").value || null,
      // Address fields
      province: document.getElementById("province").value || null,
      municipality: document.getElementById("city").value || null,
      barangay: document.getElementById("barangay").value || null,
      street: document.getElementById("streetDetails").value || null,
      degree: document.getElementById("degree").value || "n/a",
      // Use student number from signup/session
      student_number: localStorage.getItem("currentStudentNumber") || null,
      major:
        (document.getElementById("major").value === "Other"
          ? document.getElementById("majorOther").value
          : document.getElementById("major").value) || null,
      honors: document.getElementById("honors").value || null,
      graduated_year: document.getElementById("graduated").value || null,
      // Career Path and Job fields
      career_path:
        (document.getElementById("careerPath").value === "other"
          ? document.getElementById("careerPathOther").value
          : document.getElementById("careerPath").value) || null,
      job_status:
        (document.getElementById("jobStatus").value === "other"
          ? document.getElementById("jobStatusOther").value
          : document.getElementById("jobStatus").value || ""
        ).toLowerCase() || null,
      current_job:
        (document.getElementById("currentJob").value === "Other"
          ? document.getElementById("currentJobOther").value
          : document.getElementById("currentJob").value) || null,
      // Related to Degree
      is_related:
        document.getElementById("isRelated")?.value === "true" ? true : false,
    };

    // DEBUG: Log the degree and major values being sent
    console.log("[DEBUG] Degree value:", payload.degree);
    console.log("[DEBUG] Major value:", payload.major);
    console.log("[DEBUG] Full payload:", payload);

    // Only set created_at for new records
    if (!isEditMode) {
      payload.created_at = new Date().toISOString();
    }

    console.log(
      "Starting save operation. Edit mode:",
      isEditMode,
      "Profile ID:",
      editProfileId,
    );

    // Show saving status
    if (status) {
      status.textContent = "⏳ Saving...";
      status.style.color = "#0066cc";
    }

    try {
      console.log("🔌 Checking Supabase connection...");
      const ready = await ensureSupabaseReady(10000); // Increased to 10 seconds

      if (!ready) {
        console.error("❌ Supabase not ready!");
        if (status) {
          status.textContent =
            "❌ Database connection failed. Check your internet connection.";
          status.style.color = "red";
        }
        alert(
          "Cannot connect to database.\n\nPlease check:\n1. Your internet connection\n2. Browser console (F12) for errors",
        );
        return;
      }

      console.log("✅ Supabase is ready");

      if (ready) {
        // Always set degree_label, default to 'n/a' if degree is empty
        const mappedDegree = mapDegreeToCode(payload.degree);
        payload.degree_label = labelForDegree(mappedDegree);
        if (!payload.degree_label || payload.degree === "n/a") {
          payload.degree_label = "n/a";
        }

        // DEBUG: Log degree mapping process
        console.log("[DEBUG] Degree mapping process:");
        console.log("  - Original degree:", payload.degree);
        console.log("  - Mapped degree:", mappedDegree);
        console.log("  - Final degree_label:", payload.degree_label);

        let data, error;

        // DEBUG: Log before DB call
        console.log("[DEBUG] About to save to alumni_profiles table:", payload);

        if (isEditMode) {
          // UPDATE only changed fields
          let updatePayload = { ...payload };
          if (originalProfileData) {
            updatePayload = {};
            for (const key in payload) {
              if (payload[key] !== originalProfileData[key]) {
                updatePayload[key] = payload[key];
              }
            }
            // Always include degree_label if degree changed
            if (updatePayload.degree && payload.degree_label)
              updatePayload.degree_label = payload.degree_label;
            // Always include is_related (even if unchanged) to ensure DB receives the value
            updatePayload.is_related = payload.is_related;
          }
          console.log("📝 Updating profile ID:", editProfileId);
          console.log(
            "Changed fields only:",
            JSON.stringify(updatePayload, null, 2),
          );
          // Remove any fields that might not exist in the database schema
          const cleanPayload = { ...updatePayload };
          delete cleanPayload.updated_at; // Remove if exists
          const result = await window.supabase
            .from("alumni_profiles")
            .update(cleanPayload)
            .eq("id", editProfileId)
            .select();
          data = result.data;
          error = result.error;
          console.log("✅ Update result:", { data, error });

          if (error) {
            console.error("❌ Update error:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });

            // Check if it's an updated_at column error (database trigger issue)
            if (error.message && error.message.includes("updated_at")) {
              if (status) {
                status.textContent =
                  "Database configuration error. Please contact admin to run FIX_UPDATED_AT_ERROR.sql";
                status.style.color = "red";
              }
              alert(
                'Database Error: The database has an "updated_at" trigger that needs to be removed.\n\nPlease run the SQL script: sql/FIX_UPDATED_AT_ERROR.sql in Supabase SQL Editor.',
              );
              return;
            }

            // Check if it's a unique constraint violation
            if (error.code === "23505") {
              const constraintMatch = error.message.match(
                /alumni_profiles_(\w+)_key/,
              );
              const field = constraintMatch ? constraintMatch[1] : "field";

              if (status) {
                status.textContent = `Error: This ${field} is already in use by another profile`;
                status.style.color = "red";
              }
              alert(
                `Cannot update: The ${field} you entered is already used by another profile.\n\nPlease use a different ${field}.`,
              );
            } else {
              if (status) {
                status.textContent =
                  "Update failed: " + (error.message || "Unknown error");
                status.style.color = "red";
              }
              alert("Update failed: " + error.message);
            }
            return; // Stop execution
          }

          if (!data || data.length === 0) {
            console.warn(
              "⚠️ Update returned no data, checking if it succeeded...",
            );
            // Verify the update worked by fetching the record
            const { data: checkData, error: checkError } = await window.supabase
              .from("alumni_profiles")
              .select("*")
              .eq("id", editProfileId)
              .single();

            if (checkError) {
              console.error("❌ Verification failed:", checkError);
              if (status) {
                status.textContent =
                  "Update status unknown: " + checkError.message;
                status.style.color = "orange";
              }
              return;
            }

            console.log("✅ Verification successful, update worked");
            data = [checkData];
          }

          console.log("✅ Profile updated successfully");
        } else {
          // INSERT new record
          // --- CUSTOM AUTH CHECK ---
          const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
          const studentNumber = localStorage.getItem("currentStudentNumber");
          if (!isLoggedIn || !studentNumber) {
            alert(
              "You must be logged in to save your profile. Please log in first.",
            );
            window.location.href = "login.html";
            return;
          }
          console.log("📝 Creating new profile");
          console.log("Payload:", JSON.stringify(payload, null, 2));

          const result = await window.supabase
            .from("alumni_profiles")
            .insert([payload])
            .select();
          data = result.data;
          error = result.error;

          console.log("✅ Insert result:", { data, error });

          if (error) {
            console.error("❌ Insert error:", error);
            console.error("Error details:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });

            // Check if it's a unique constraint violation
            if (error.code === "23505") {
              const constraintMatch = error.message.match(
                /alumni_profiles_(\w+)_key/,
              );
              const field = constraintMatch ? constraintMatch[1] : "field";

              if (status) {
                status.textContent = `❌ Error: This ${field} is already in use`;
                status.style.color = "red";
              }
              alert(
                `Cannot save: The ${field} you entered is already used by another profile.\n\nPlease use a different ${field}.`,
              );
            } else {
              if (status) {
                status.textContent =
                  "❌ Save failed: " + (error.message || "Unknown error");
                status.style.color = "red";
              }
              alert(
                "Save failed: " +
                  error.message +
                  "\n\nPlease check the browser console (F12) for details.",
              );
            }
            return; // Stop execution
          }
        }

        if (error) throw error;

        // Store profile ID for the profile page
        const profileId =
          data && data[0] && data[0].id ? data[0].id : editProfileId;

        if (profileId) {
          console.log("✅ Save successful! Profile ID:", profileId);
          localStorage.setItem("lastProfileId", profileId);

          if (status) {
            status.textContent =
              "✅ Profile saved successfully! Redirecting...";
            status.style.color = "#28a745";
          }

          // Store the email to ensure profile loads correctly
          const savedEmail =
            data && data[0] && data[0].email ? data[0].email : payload.email;
          if (savedEmail) {
            localStorage.setItem("lastProfileEmail", savedEmail.toLowerCase());
            console.log("📧 Stored email for profile:", savedEmail);
          }

          // Clear any cached profile data to force fresh load
          localStorage.removeItem("cachedProfile_" + profileId);

          // Add small delay to ensure database commits the changes
          const redirectUrl =
            "alumni/profile.html?id=" +
            profileId +
            (isEditMode ? "&updated=true" : "&created=true");
          console.log("🔄 Redirecting to:", redirectUrl);

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 800); // 800ms delay for database commit
        } else {
          console.error("❌ No profile ID available for redirect");
        }
        return;
      }
    } catch (err) {
      console.warn("Supabase insert failed", err);
      // Surface helpful message to the UI with origin info for debugging
      const msg = err && err.message ? err.message : String(err);
      if (status) status.textContent = "Supabase save failed: " + msg;
    }
    // fallback queue
    try {
      const queue = JSON.parse(
        localStorage.getItem("alumni_submit_queue") || "[]",
      );
      queue.push(payload);
      localStorage.setItem("alumni_submit_queue", JSON.stringify(queue));
      if (status) {
        status.innerHTML = "✅";
        status.style.fontSize = "24px";
        status.style.color = "#28a745";
      }
    } catch (e) {
      console.error("local save failed", e);
      if (status) status.textContent = "Save failed";
    }
  });
});

// --- Helper: Wait for Supabase to be ready ---
async function ensureSupabaseReady(timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (window.supabaseClient) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

// --- Load existing profile data for editing ---
async function loadProfileForEdit(profileId) {
  try {
    const ready = await ensureSupabaseReady(5000);
    if (!ready) {
      console.warn("Supabase not ready for loading profile data");
      return null;
    }
    const { data, error } = await window.supabaseClient
      .from("alumni_profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();
    if (error) {
      console.error("Error loading profile for edit:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to load profile for edit:", err);
    return null;
  }
}
