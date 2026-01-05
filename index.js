(function() {
  function smoothScroll(target, evt) {
    const e = evt || window.event;
    if (e && e.preventDefault) e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  window.smoothScroll = smoothScroll;

  function highlightItem(item) {
    if (!item) return;
    item.style.background = 'linear-gradient(45deg, #004AAD, #FF6B35)';
    item.style.color = 'white';
    item.style.padding = '10px';
    item.style.borderRadius = '5px';
    item.style.margin = '5px 0';

    setTimeout(() => {
      item.style.background = '';
      item.style.color = '';
      item.style.padding = '';
      item.style.borderRadius = '';
      item.style.margin = '';
    }, 2000);
  }
  window.highlightItem = highlightItem;

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = [
      'position: fixed',
      'top: 20px',
      'right: 20px',
      'background: linear-gradient(45deg, #004AAD, #FF6B35)',
      'color: white',
      'padding: 15px 20px',
      'border-radius: 10px',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
      'z-index: 10000',
      'animation: slideIn 0.3s ease-out'
    ].join(';');
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard: ' + text);
    }).catch(() => {
      showNotification('Unable to copy right now');
    });
  }
  window.copyToClipboard = copyToClipboard;

  window.showAlert = function(platform) {
    showNotification('Opening ' + platform + '...');
  };

  window.openMap = function() {
    showNotification('Opening map location...');
  };

  window.addEventListener('scroll', () => {
    const indicator = document.getElementById('scrollIndicator');
    const navbar = document.getElementById('navbar');
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;

    if (indicator) indicator.style.width = scrollPercent + '%';
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  window.addEventListener('load', () => {
    const loadingBar = document.getElementById('loadingBar');
    if (!loadingBar) return;
    loadingBar.style.width = '100%';
    setTimeout(() => {
      loadingBar.style.opacity = '0';
      setTimeout(() => loadingBar.remove(), 500);
    }, 1000);
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = '0s';
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => observer.observe(el));
  });
})();
