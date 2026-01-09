// Reusable logout confirmation dialog
function showLogoutConfirm(redirectUrl) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        text-align: center;
        min-width: 300px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Do you want to Logout?';
    title.style.cssText = 'margin: 0 0 20px 0; font-size: 18px; color: #333;';
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.cssText = `
        padding: 10px 30px;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    `;
    logoutBtn.onmouseover = () => logoutBtn.style.background = '#b71c1c';
    logoutBtn.onmouseout = () => logoutBtn.style.background = '#d32f2f';
    logoutBtn.addEventListener('click', () => {
        // Clear ALL user data to prevent cross-contamination
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('lastProfileId');
        localStorage.removeItem('lastProfileEmail');
        console.log('🧹 Cleared all user session data on logout');
        window.location.href = redirectUrl;
    });
    
    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';
    noBtn.style.cssText = `
        padding: 10px 30px;
        background: white;
        color: #0b66b3;
        border: 1px solid #0b66b3;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    `;
    noBtn.onmouseover = () => noBtn.style.background = '#f5f5f5';
    noBtn.onmouseout = () => noBtn.style.background = 'white';
    noBtn.addEventListener('click', () => overlay.remove());
    
    btnContainer.appendChild(logoutBtn);
    btnContainer.appendChild(noBtn);
    dialog.appendChild(title);
    dialog.appendChild(btnContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}
