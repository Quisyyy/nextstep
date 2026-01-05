// Dynamic content populated from JSON/Supabase
(async function() {
    const url = 'data/homepage.json';
    const fallback = {
        hero: {
            title: 'Welcome to Next Step',
            text: 'Next Step is a dedicated platform designed to help alumni connect, grow, and take the next step in their professional journey.',
            ctaText: 'Fill up',
            ctaHref: 'Information.html'
        },
        about: {
            heading: 'ABOUT US',
            lead: 'Welcome to Next Step. We believe that every student\'s journey doesn\'t end at graduation—it evolves.',
            objectives: [
                'To develop a profile of the graduates.',
                'To analyze employment outcomes and career trajectories.',
                'To evaluate the alignment between acquired academic skills and job requirements.',
                'To gather feedback on the effectiveness of institutional services and support.',
                'To formulate evidence-based recommendations for academic and institutional improvement.'
            ],
            mission: 'Next Step is committed to fostering lifelong connections between graduates and their alma mater by providing a dynamic platform for alumni engagement, career tracking, and professional growth.',
            vision: 'To be the leading digital hub that empowers alumni to thrive, inspire future generations, and shape institutional excellence through collaboration, innovation, and shared success.'
        }
    };

    function apply(data) {
        try {
            const hTitle = document.getElementById('hero-title');
            const hText = document.getElementById('hero-text');
            const hCta = document.getElementById('hero-cta');
            const aHeading = document.getElementById('about-heading');
            const aLead = document.getElementById('about-lead');
            const objList = document.getElementById('objectives-list');
            const mission = document.getElementById('mission-text');
            const vision = document.getElementById('vision-text');

            if (hTitle && data.hero && data.hero.title) hTitle.textContent = data.hero.title;
            if (hText && data.hero && data.hero.text) hText.textContent = data.hero.text;
            if (hCta && data.hero) {
                hCta.textContent = data.hero.ctaText || hCta.textContent;
                if (data.hero.ctaHref) hCta.setAttribute('href', data.hero.ctaHref);
            }

            if (aHeading && data.about && data.about.heading) aHeading.textContent = data.about.heading;
            if (aLead && data.about && data.about.lead) aLead.textContent = data.about.lead;
            if (objList && Array.isArray(data.about && data.about.objectives)) {
                objList.innerHTML = '';
                data.about.objectives.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    objList.appendChild(li);
                });
            }
            if (mission && data.about && data.about.mission) mission.textContent = data.about.mission;
            if (vision && data.about && data.about.vision) vision.textContent = data.about.vision;
        } catch (e) {
            console.warn('apply homepage data failed', e);
        }
    }

    async function loadFromSupabase() {
        if (!window.supabase || typeof window.supabase.from !== 'function') return null;
        try {
            const {
                data,
                error
            } = await window.supabase.from('homepage').select('key, content');
            if (error) {
                console.warn('supabase fetch error', error);
                return null;
            }
            const combined = {};
            (data || []).forEach(r => {
                try {
                    combined[r.key] = r.content;
                } catch (e) {}
            });
            return combined;
        } catch (e) {
            console.warn('supabase read failed', e);
            return null;
        }
    }

    // Try Supabase first (if configured), fall back to local JSON, then embedded fallback
    try {
        const supa = await loadFromSupabase();
        if (supa) {
            apply(supa);
            return;
        }
    } catch (e) { /* ignore and fallback */ }

    fetch(url).then(r => {
        if (!r.ok) throw new Error('network');
        return r.json();
    }).then(data => apply(data)).catch(() => {
        console.info('Using fallback homepage data');
        apply(fallback);
    });
})();

// Session-aware navbar and hero CTA + robust video autoplay
async function waitForSupabase(ms = 4000) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        if (window.supabase && window.supabaseClientReady) return true;
        await new Promise(r => setTimeout(r, 120));
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async() => {
    const email = (localStorage.getItem('currentUserEmail') || '').trim().toLowerCase();
    const loginLink = document.getElementById('nav-login');
    const logoutBtn = document.getElementById('nav-logout');
    const heroCta = document.getElementById('hero-cta');
    const vid = document.getElementById('myVideo');
    const aboutLink = document.getElementById('nav-about');
    const contactLink = document.getElementById('nav-contact');

    if (email) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    }

    // Decide CTA ('Go to Profile' vs 'Fill up') based on profile existence
    if (email && heroCta) {
        try {
            const ready = await waitForSupabase();
            if (ready) {
                const {
                    data,
                    error
                } = await window.supabase
                    .from('alumni_profiles')
                    .select('id')
                    .eq('email', email)
                    .limit(1);
                if (!error && data && data.length) {
                    heroCta.textContent = 'Go to Profile';
                    heroCta.setAttribute('href', 'alumni/profile.html');
                } else {
                    heroCta.textContent = 'Fill up';
                    heroCta.setAttribute('href', 'Information.html');
                }
            }
        } catch (e) {}
    }

    // Ensure background video plays after redirects/login
    if (vid) {
        vid.muted = true;
        const tryPlay = () => vid.play().catch(() => {
            const resume = () => {
                vid.play().catch(() => {});
                document.removeEventListener('click', resume);
            };
            document.addEventListener('click', resume, {
                once: true
            });
        });
        tryPlay();
        vid.addEventListener('canplay', tryPlay, {
            once: true
        });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) tryPlay();
        });
    }

    // Attach smooth scroll behavior (in case browser doesn't auto smooth)
    function smoothScroll(targetId) {
        const el = document.querySelector(targetId);
        if (!el) return;
        window.scrollTo({
            top: el.offsetTop - 80,
            behavior: 'smooth'
        });
    }
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScroll('#about');
        });
    }
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScroll('#site-contact');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showLogoutConfirm('login.html');
        });
    }
});
