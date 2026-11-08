// Minimal JS placeholder for interactions
document.addEventListener('DOMContentLoaded',()=>{
  const ensureFavicon = () => {
    const existing = document.querySelector('link[rel="icon"]');
    if (existing) {
      existing.remove();
    }

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = 'assets/images/favicon.png';
    document.head.appendChild(favicon);
  };

  ensureFavicon();

  const navs = document.querySelectorAll('.site-nav');

  navs.forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');

    if (!toggle || !links) return;

    const setMenuState = () => {
      const isMobile = window.innerWidth < 900;
      nav.classList.toggle('is-open', false);
      toggle.setAttribute('aria-expanded', 'false');
      if (!isMobile) {
        links.style.display = '';
      }
    };

    toggle.addEventListener('click', () => {
      if (window.innerWidth >= 900) return;
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 900) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('resize', setMenuState);
    setMenuState();
  });

});
