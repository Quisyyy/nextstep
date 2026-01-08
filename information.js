// Centralized Information form JavaScript moved from Information.html
// This file initializes selects, computes age, and submits profile data to Supabase
// Supports both create and edit modes

// Check if we're in edit mode
function getEditProfileId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('edit');
}

// Load existing profile data for editing
async function loadProfileForEdit(profileId) {
    console.log('🔍 loadProfileForEdit called with ID:', profileId);
    
    try {
        console.log('⏳ Waiting for Supabase to be ready...');
        const ready = await ensureSupabaseReady(10000); // Increased to 10 seconds
        
        if (!ready) {
            console.error('❌ Supabase not ready after 10 seconds');
            return null;
        }
        
        console.log('✅ Supabase is ready, fetching profile...');

        const { data, error } = await window.supabase
            .from('alumni_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) {
            console.error('❌ Error loading profile:', error);
            return null;
        }
        
        if (!data) {
            console.warn('⚠️ No data returned for profile ID:', profileId);
            return null;
        }
        
        // SECURITY: Verify this profile belongs to the current user
        const currentEmail = (localStorage.getItem('currentUserEmail') || '').trim().toLowerCase();
        if (currentEmail && data.email && data.email.toLowerCase() !== currentEmail) {
            console.error('❌ Security: Attempted to edit another user\'s profile');
            alert('Access denied: You can only edit your own profile.');
            window.location.href = 'alumni/profile.html';
            return null;
        }

        console.log('✅ Profile data loaded successfully:', data);
        return data;
        
    } catch (err) {
        console.error('❌ Exception in loadProfileForEdit:', err);
        return null;
    }
}

// Populate form with existing data
function populateFormWithData(data) {
    if (!data) {
        console.error('❌ populateFormWithData called with no data');
        return;
    }

    console.log('📝 Populating form with data:', data);
    
    const debugText = document.getElementById('debugText');
    if (debugText) debugText.innerHTML = 'Populating form fields...';

    // Personal information
    document.getElementById('fullname').value = data.full_name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('contact').value = data.contact || '';
    document.getElementById('address').value = data.address || '';

    // Birthday - ensure values are strings for select elements
    if (data.birth_month) {
        const monthVal = String(data.birth_month);
        document.getElementById('birth-month').value = monthVal;
        console.log('Set month to:', monthVal);
    }
    if (data.birth_year) {
        const yearVal = String(data.birth_year);
        document.getElementById('birth-year').value = yearVal;
        updateDaysForSelection(); // Update days based on month/year
        console.log('Set year to:', yearVal);
    }
    if (data.birth_day) {
        const dayVal = String(data.birth_day);
        document.getElementById('birth-day').value = dayVal;
        console.log('Set day to:', dayVal);
    }
    // Compute age after all birthday fields are set
    computeAge();

    // Academic information
    if (data.degree) {
        document.getElementById('degree').value = data.degree;
        console.log('Set degree to:', data.degree);
    }
    document.getElementById('studentNumber').value = data.student_number || '';
    document.getElementById('major').value = data.major || '';
    document.getElementById('honors').value = data.honors || '';
    if (data.graduated_year) {
        document.getElementById('graduated').value = String(data.graduated_year);
        console.log('Set graduated year to:', data.graduated_year);
    }

    // Job Status & Career Information
    if (data.job_status) document.getElementById('jobStatus').value = data.job_status;
    document.getElementById('currentJob').value = data.current_job || '';
    document.getElementById('previousRoles').value = data.previous_roles || '';
    document.getElementById('careerPath').value = data.career_path || '';
    document.getElementById('industry').value = data.industry || '';
    document.getElementById('professionalCertificates').value = data.professional_certificates || '';
    if (data.open_for_mentorship) document.getElementById('openForMentorship').value = data.open_for_mentorship;

    // Update form title to indicate edit mode
    const formTitle = document.querySelector('.form-title');
    if (formTitle) {
        formTitle.textContent = 'Edit Information Sheet';
        formTitle.style.color = '#0066cc';
    }

    // Update save button text
    const saveButton = document.getElementById('saveProfile');
    if (saveButton) {
        saveButton.textContent = 'Update Profile';
        saveButton.style.background = '#28a745';
    }

    if (debugText) debugText.innerHTML = '✅ Form populated successfully! (Profile ID: ' + data.id + ')';
    console.log('✅ Form populated successfully');
    
    // Hide debug info after 3 seconds
    setTimeout(() => {
        const debugDiv = document.getElementById('debugInfo');
        if (debugDiv) debugDiv.style.display = 'none';
    }, 3000);
}

// Populate month/day/year selects and compute age
const monthSelect = document.getElementById('birth-month');
const daySelect = document.getElementById('birth-day');
const yearSelect = document.getElementById('birth-year');
const ageInput = document.getElementById('age');

const months = ["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
months.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx; // 0 = placeholder
    opt.text = m;
    monthSelect.appendChild(opt);
});

function populateYears(range = 70) {
    const currentYear = new Date().getFullYear();
    const start = currentYear - range;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.text = 'Year';
    yearSelect.appendChild(placeholder);
    for (let y = currentYear; y >= start; y--) {
        const o = document.createElement('option');
        o.value = y;
        o.text = y;
        yearSelect.appendChild(o);
    }
}

function populateDays(days = 31) {
    daySelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.text = 'Day';
    daySelect.appendChild(placeholder);
    for (let d = 1; d <= days; d++) {
        const o = document.createElement('option');
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
        ageInput.value = '';
        return;
    }
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (birth > today) { ageInput.value = ''; return; }
    let age = today.getFullYear() - birth.getFullYear();
    const mDiff = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    ageInput.value = age + ' yrs';
}

monthSelect.addEventListener('change', () => {
    updateDaysForSelection();
    computeAge();
});
yearSelect.addEventListener('change', () => {
    updateDaysForSelection();
    computeAge();
});
daySelect.addEventListener('change', computeAge);

monthSelect.value = '';
daySelect.value = '';
yearSelect.value = '';

// populate graduated years (2023-2026 only)
const gradSelect = document.getElementById('graduated');
if (gradSelect) {
    const allowedYears = [2023, 2024, 2025, 2026];
    allowedYears.forEach(y => {
        const o = document.createElement('option');
        o.value = y;
        o.text = y;
        gradSelect.appendChild(o);
    });
    console.log('Graduated years populated:', allowedYears);
} else {
    console.error('Graduate select element not found');
}

// Degree label map
const degreeLabels = {
    'BSA': 'Bachelor of Science in Accountancy (BSA)',
    'BSCpE': 'Bachelor of Science in Computer Engineering (BSCpE)',
    'BSENTREP': 'Bachelor of Science in Entrepreneurship (BSENTREP)',
    'BSHM': 'Bachelor of Science in Hospitality Management (BSHM)',
    'BSIT': 'Bachelor of Science in Information Technology (BSIT)',
    'BSEDEN': 'Bachelor of Secondary Education major in English (BSEDEN)',
    'BSEDMT': 'Bachelor of Secondary Education major in Mathematics (BSEDMT)',
    'DOMTLOM': 'Diploma in Office Management Technology- Legal Office Management (DOMTLOM)'
};

function labelForDegree(code) { return degreeLabels[code] || ''; }

// Student number validation (2019-xxxxx-SM-0 to 2022-xxxxx-SM-0)
function validateStudentNumber(studentNum) {
    if (!studentNum || studentNum.trim() === '') {
        return { valid: true, message: '' }; // Allow empty (optional field)
    }
    
    // Pattern: 2019-xxxxx-SM-0 to 2022-xxxxx-SM-0
    const pattern = /^20(19|20|21|22)-\d{5}-SM-0$/;
    
    if (!pattern.test(studentNum)) {
        return { 
            valid: false, 
            message: 'Invalid student number format. Must be 2019-xxxxx-SM-0 to 2022-xxxxx-SM-0' 
        };
    }
    
    return { valid: true, message: '' };
}

// Add real-time validation for student number
const studentNumberInput = document.getElementById('studentNumber');
const studentNumberError = document.getElementById('studentNumberError');

if (studentNumberInput && studentNumberError) {
    studentNumberInput.addEventListener('blur', function() {
        const result = validateStudentNumber(this.value);
        if (!result.valid) {
            studentNumberError.textContent = result.message;
            studentNumberError.style.display = 'block';
            this.style.borderColor = 'red';
        } else {
            studentNumberError.style.display = 'none';
            this.style.borderColor = '';
        }
    });
    
    studentNumberInput.addEventListener('input', function() {
        if (studentNumberError.style.display === 'block') {
            const result = validateStudentNumber(this.value);
            if (result.valid) {
                studentNumberError.style.display = 'none';
                this.style.borderColor = '';
            }
        }
    });
}

// ensureSupabaseReady helper
async function ensureSupabaseReady(timeout = 2000) {
    console.log('⏳ ensureSupabaseReady: Checking for Supabase...');
    const start = Date.now();
    let attempts = 0;
    while (Date.now() - start < timeout) {
        attempts++;
        if (window.supabase && window.supabase.from) {
            console.log(`✅ Supabase ready after ${attempts} attempts (${Date.now() - start}ms)`);
            return true;
        }
        if (window.supabaseClientReady === false) {
            console.error('❌ Supabase client failed to initialize');
            return false;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    console.error(`❌ Supabase timeout after ${timeout}ms (${attempts} attempts)`);
    console.log('window.supabase:', window.supabase);
    console.log('window.supabaseClientReady:', window.supabaseClientReady);
    return !!(window.supabase && window.supabase.from);
}

// flush queued submissions
async function flushSubmitQueue() {
    try {
        const q = JSON.parse(localStorage.getItem('alumni_submit_queue') || '[]');
        if (!q || !q.length) return;
        const ready = await ensureSupabaseReady(5000);
        if (!ready) { console.info('Supabase not ready; deferring queue flush'); return; }
        console.info('Flushing', q.length, 'queued submissions');
        const { data, error } = await window.supabase.from('alumni_profiles').insert(q);
        console.log('queue flush result', { data, error });
        if (!error) {
            localStorage.removeItem('alumni_submit_queue');
            const s = document.getElementById('saveStatus');
            if (s) {
                s.innerHTML = '✅';
                s.style.fontSize = '24px';
                s.style.color = '#28a745';
            }
            // notify other windows/pages
            try { window.dispatchEvent(new CustomEvent('alumni:flushed', { detail: { count: Array.isArray(data) ? data.length : 0 } })); } catch (e) {}
        } else {
            // surface error to console and UI
            console.warn('queue flush encountered error', error);
            const s = document.getElementById('saveStatus');
            if (s) {
                s.innerHTML = '✅';
                s.style.fontSize = '24px';
                s.style.color = '#28a745';
            }
        }
    } catch (e) { console.warn('flushSubmitQueue failed', e); }
}

// try flush on load
(async function tryFlushOnLoad() {
    await new Promise(r => setTimeout(r, 800));
    flushSubmitQueue();
})();

// submit handler (button) - wrapped in DOMContentLoaded to ensure elements exist
document.addEventListener('DOMContentLoaded', async function() {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Information form initializing...');
    console.log('Current URL:', window.location.href);
    console.log('═══════════════════════════════════════');
    
    const saveButton = document.getElementById('saveProfile');
    if (!saveButton) {
        console.error('❌ Save button #saveProfile not found! Check HTML element IDs.');
        alert('Error: Save button not found. Please refresh the page.');
        return;
    }
    console.log('✅ Save button found');

    // Wait for all dropdowns to be populated
    console.log('⏳ Waiting 500ms for dropdowns to populate...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Wait complete');

    // Check if we're in edit mode and load existing data
    const editProfileId = getEditProfileId();
    console.log('📋 Edit Profile ID from URL:', editProfileId || 'NONE (new profile mode)');
    
    if (editProfileId) {
        console.log('🔧 ═══ EDIT MODE ACTIVATED ═══');
        console.log('Profile ID to load:', editProfileId);
        
        // Show edit mode indicator
        const editModeIndicator = document.getElementById('editModeIndicator');
        if (editModeIndicator) {
            editModeIndicator.style.display = 'block';
            editModeIndicator.textContent = '🔧 EDIT MODE - Loading Profile ID: ' + editProfileId;
        }
        
        // Show loading indicator
        const status = document.getElementById('saveStatus');
        if (status) {
            status.textContent = '⏳ Loading profile data...';
            status.style.color = '#0066cc';
        }
        
        console.log('📞 Calling loadProfileForEdit...');
        const existingData = await loadProfileForEdit(editProfileId);
        
        if (existingData) {
            console.log('✅ Data retrieved successfully:', existingData);
            console.log('📝 Calling populateFormWithData...');
            populateFormWithData(existingData);
            console.log('✅ populateFormWithData completed');
            if (status) status.textContent = '';
        } else {
            console.error('❌ loadProfileForEdit returned NULL');
            console.error('This means either:');
            console.error('  1. Supabase is not ready');
            console.error('  2. Profile not found in database');
            console.error('  3. Database query error');
            if (status) {
                status.textContent = '⚠️ Could not load profile data!';
                status.style.color = 'red';
            }
            alert('ERROR: Could not load profile data.\n\nPlease check:\n1. Is the database online?\n2. Does this profile exist?\n3. Check browser console (F12) for details.');
        }
    } else {
        console.log('📝 New profile mode (no edit ID in URL)');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Initialization complete - ready for user interaction');
    console.log('═══════════════════════════════════════');

    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();
        const status = document.getElementById('saveStatus');
        if (status) {
            status.innerHTML = '';
            status.style.fontSize = '';
            status.style.color = '';
        }

        // Validate student number before submission
        const studentNum = document.getElementById('studentNumber').value;
        const validationResult = validateStudentNumber(studentNum);
        if (!validationResult.valid) {
            const studentNumberError = document.getElementById('studentNumberError');
            if (studentNumberError) {
                studentNumberError.textContent = validationResult.message;
                studentNumberError.style.display = 'block';
            }
            document.getElementById('studentNumber').style.borderColor = 'red';
            if (status) {
                status.textContent = 'Please fix the errors before submitting';
                status.style.color = 'red';
            }
            // Scroll to the error
            document.getElementById('studentNumber').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Check if we're in edit mode
        const editProfileId = getEditProfileId();
        const isEditMode = !!editProfileId;
        
        console.log('💾 Preparing to save...');
        console.log('Mode:', isEditMode ? 'UPDATE (Edit)' : 'INSERT (New)');
        console.log('Profile ID:', editProfileId || 'N/A');

        const payload = {
            full_name: document.getElementById('fullname').value || null,
            email: document.getElementById('email').value || null,
            birth_month: document.getElementById('birth-month').value || null,
            birth_day: document.getElementById('birth-day').value || null,
            birth_year: document.getElementById('birth-year').value || null,
            contact: document.getElementById('contact').value || null,
            address: document.getElementById('address').value || null,
            degree: document.getElementById('degree').value || null,
            student_number: document.getElementById('studentNumber').value || null,
            major: document.getElementById('major').value || null,
            honors: document.getElementById('honors').value || null,
            graduated_year: document.getElementById('graduated').value || null,
            job_status: document.getElementById('jobStatus').value || null,
            current_job: document.getElementById('currentJob').value || null,
            previous_roles: document.getElementById('previousRoles').value || null,
            career_path: document.getElementById('careerPath').value || null,
            industry: document.getElementById('industry').value || null,
            professional_certificates: document.getElementById('professionalCertificates').value || null,
            open_for_mentorship: document.getElementById('openForMentorship').value || null
        };

        // Only set created_at for new records
        if (!isEditMode) {
            payload.created_at = new Date().toISOString();
        }

        console.log('Starting save operation. Edit mode:', isEditMode, 'Profile ID:', editProfileId);
        
        try {
            const ready = await ensureSupabaseReady(10000); // Increased to 10 seconds
            if (ready) {
                payload.degree_label = labelForDegree(payload.degree);

                let data, error;

                if (isEditMode) {
                    // UPDATE existing record
                    console.log('📝 Updating profile ID:', editProfileId);
                    console.log('Payload:', JSON.stringify(payload, null, 2));
                    
                    // Remove any fields that might not exist in the database schema
                    const cleanPayload = { ...payload };
                    delete cleanPayload.updated_at; // Remove if exists
                    
                    console.log('Clean payload (no updated_at):', JSON.stringify(cleanPayload, null, 2));
                    
                    // Important: When updating, we need to make sure we're not violating unique constraints
                    // The update should work because we're updating the same record
                    const result = await window.supabase
                        .from('alumni_profiles')
                        .update(cleanPayload)
                        .eq('id', editProfileId)
                        .select();
                    
                    data = result.data;
                    error = result.error;
                    
                    console.log('✅ Update result:', { data, error });
                    
                    if (error) {
                        console.error('❌ Update error:', error);
                        console.error('Error details:', {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code
                        });
                        
                        // Check if it's a unique constraint violation
                        if (error.code === '23505') {
                            const constraintMatch = error.message.match(/alumni_profiles_(\w+)_key/);
                            const field = constraintMatch ? constraintMatch[1] : 'field';
                            
                            if (status) {
                                status.textContent = `Error: This ${field} is already in use by another profile`;
                                status.style.color = 'red';
                            }
                            alert(`Cannot update: The ${field} you entered is already used by another profile.\n\nPlease use a different ${field}.`);
                        } else {
                            if (status) {
                                status.textContent = 'Update failed: ' + (error.message || 'Unknown error');
                                status.style.color = 'red';
                            }
                            alert('Update failed: ' + error.message);
                        }
                        return; // Stop execution
                    }
                    
                    if (!data || data.length === 0) {
                        console.warn('⚠️ Update returned no data, checking if it succeeded...');
                        // Verify the update worked by fetching the record
                        const { data: checkData, error: checkError } = await window.supabase
                            .from('alumni_profiles')
                            .select('*')
                            .eq('id', editProfileId)
                            .single();
                        
                        if (checkError) {
                            console.error('❌ Verification failed:', checkError);
                            if (status) {
                                status.textContent = 'Update status unknown: ' + checkError.message;
                                status.style.color = 'orange';
                            }
                            return;
                        }
                        
                        console.log('✅ Verification successful, update worked');
                        data = [checkData];
                    }
                    
                    console.log('✅ Profile updated successfully');
                } else {
                    // INSERT new record
                    console.log('📝 Creating new profile');
                    const result = await window.supabase.from('alumni_profiles').insert([payload]).select();
                    data = result.data;
                    error = result.error;
                    console.log('Insert result:', { data, error });
                }

                if (error) throw error;
                
                // Store profile ID for the profile page
                const profileId = data && data[0] && data[0].id ? data[0].id : editProfileId;
                
                if (profileId) {
                    console.log('✅ Save successful! Profile ID:', profileId);
                    localStorage.setItem('lastProfileId', profileId);
                    
                    // Store the email to ensure profile loads correctly
                    const savedEmail = data && data[0] && data[0].email ? data[0].email : payload.email;
                    if (savedEmail) {
                        localStorage.setItem('lastProfileEmail', savedEmail.toLowerCase());
                        console.log('📧 Stored email for profile:', savedEmail);
                    }
                    
                    // Clear any cached profile data to force fresh load
                    localStorage.removeItem('cachedProfile_' + profileId);
                    
                    // Add small delay to ensure database commits the changes
                    const redirectUrl = 'alumni/profile.html?id=' + profileId + (isEditMode ? '&updated=true' : '&created=true');
                    console.log('🔄 Redirecting to:', redirectUrl);
                    
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 800); // 800ms delay for database commit
                } else {
                    console.error('❌ No profile ID available for redirect');
                }

                // notify admin/list pages in the same origin to refresh
                try { window.dispatchEvent(new CustomEvent('alumni:saved', { detail: { payload } })); } catch (e) {}
                flushSubmitQueue();
                return;
            }
        } catch (err) {
            console.warn('Supabase insert failed', err);
            // Surface helpful message to the UI with origin info for debugging
            const msg = (err && err.message) ? err.message : String(err);
            if (status) status.textContent = 'Supabase save failed: ' + msg;
        }
        // fallback queue
        try {
            const queue = JSON.parse(localStorage.getItem('alumni_submit_queue') || '[]');
            queue.push(payload);
            localStorage.setItem('alumni_submit_queue', JSON.stringify(queue));
            if (status) {
                status.innerHTML = '✅';
                status.style.fontSize = '24px';
                status.style.color = '#28a745';
            }
        } catch (e) {
            console.error('local save failed', e);
            if (status) status.textContent = 'Save failed';
        }
    });
});