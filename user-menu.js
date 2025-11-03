(function() {
    // Attach a dropdown menu to any .user-icon button in the header
    function createMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
      <button class="user-menu-item" data-action="profile">Profile</button>
      <button class="user-menu-item" data-action="logout">Logout</button>
    `;
        document.body.appendChild(menu);
        return menu;
    }

    const menu = createMenu();
    let openTarget = null;

    function closeMenu() {
        menu.style.display = 'none';
        openTarget = null;
    }

    function openMenuFor(button) {
        const rect = button.getBoundingClientRect();
        menu.style.display = 'block';
        // position: below and aligned to right of the icon
        menu.style.left = (rect.right - menu.offsetWidth) + 'px';
        menu.style.top = (rect.bottom + 8) + 'px';
        openTarget = button;
    }

    document.addEventListener('click', function(e) {
        // open when clicking a .user-icon
        const btn = e.target.closest('.user-icon');
        if (btn) {
            e.preventDefault();
            // toggle
            if (openTarget === btn) { closeMenu(); return; }
            openMenuFor(btn);
            return;
        }

        // menu item clicks
        const item = e.target.closest('.user-menu-item');
        if (item) {
            const action = item.getAttribute('data-action');
            if (action === 'logout') {
                // Clear common client-side auth keys
                try { localStorage.removeItem('authToken'); } catch (e) {}
                try { localStorage.removeItem('user'); } catch (e) {}
                try { sessionStorage.removeItem('session'); } catch (e) {}
                // allow overriding target via data-logout-url on the clicked icon
                const icon = openTarget || document.querySelector('.user-icon');
                const target = (icon && icon.getAttribute && icon.getAttribute('data-logout-url')) || '/index.html';
                window.location.href = target;
            } else if (action === 'profile') {
                // profile placeholder - could route to a profile page
                window.location.href = '/admin/index.html';
            }
            closeMenu();
            return;
        }

        // click outside -> close
        if (!e.target.closest('.user-menu')) closeMenu();
    }, true);

    // Close on ESC
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });

    // hide initially (CSS will style it)
    menu.style.display = 'none';
})();