(function() {
    // Candidate logo URLs to try (absolute and relative). Order matters.
    const candidates = [
        '/logo/Blue%20%26%20Orange%20Circle%20Illustrative%20Education%20Logo.jpg',
        '/logo/557536151_1257403522824074_2017646524872962832_n.png',
        '/logo/Blue & Orange Circle Illustrative Education Logo.jpg',
        'logo/Blue%20%26%20Orange%20Circle%20Illustrative%20Education%20Logo.jpg',
        'logo/557536151_1257403522824074_2017646524872962832_n.png',
        '../logo/Blue%20%26%20Orange%20Circle%20Illustrative%20Education%20Logo.jpg',
        '../logo/557536151_1257403522824074_2017646524872962832_n.png',
        '../../logo/Blue%20%26%20Orange%20Circle%20Illustrative%20Education%20Logo.jpg',
        '../../logo/557536151_1257403522824074_2017646524872962832_n.png'
    ];

    function testSrc(url) {
        return new Promise((resolve) => {
            const i = new Image();
            i.onload = () => resolve(true);
            i.onerror = () => resolve(false);
            // small timeout in case
            setTimeout(() => resolve(false), 3000);
            i.src = url;
        });
    }

    async function resolveLogo(img) {
        // if already loaded, skip
        if (img.complete && img.naturalWidth > 0) return;
        for (const c of candidates) {
            try {
                const ok = await testSrc(c);
                if (ok) {
                    img.src = c;
                    return;
                }
            } catch (e) { /*ignore*/ }
        }
        // nothing found, leave as-is
    }

    // Find target images: those with class nav-logo or inside .logo-circle
    const imgs = Array.from(document.querySelectorAll('img.nav-logo, .logo-circle img'));
    if (!imgs.length) return;
    // Run resolution for each image
    imgs.forEach(img => {
        // If already visible, nothing to do
        if (img.complete && img.naturalWidth > 0) return;
        resolveLogo(img);
    });
})();