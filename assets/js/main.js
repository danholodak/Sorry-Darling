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

  const renderSocialLinks = () => {
    const navs = document.querySelectorAll('.site-nav');
    const socialsList = Array.isArray(window.socials) ? window.socials : [];

    if (!socialsList.length) return;

    navs.forEach((nav) => {
      if (nav.querySelector('.social-links')) return;

      const socialLinks = document.createElement('div');
      socialLinks.className = 'social-links';
      socialLinks.setAttribute('aria-label', 'Social media links');

      socialsList.forEach((social) => {
        const link = document.createElement('a');
        link.href = social.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'social-link';
        link.setAttribute('aria-label', social.name);

        const img = document.createElement('img');
        img.src = social.image;
        img.alt = social.name;
        img.loading = 'lazy';

        link.appendChild(img);
        socialLinks.appendChild(link);
      });

      nav.appendChild(socialLinks);
    });
  };

  ensureFavicon();
  renderSocialLinks();

  const navs = document.querySelectorAll('.site-nav');

  navs.forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');

    if (!toggle || !links) return;

    const updateToggleIcon = (isOpen) => {
      if (isOpen) {
        toggle.innerHTML = '<img src="assets/images/close.png" alt="Close menu" style="width:100%;height:100%;display:block;object-fit:contain;" />';
      } else {
        toggle.innerHTML = '<span></span><span></span><span></span>';
      }
    };

    const setMenuState = () => {
      const isMobile = window.innerWidth < 900;
      if (!isMobile) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        links.style.display = '';
        updateToggleIcon(false);
        return;
      }

      const isOpen = nav.classList.contains('is-open');
      links.style.display = isOpen ? 'flex' : 'none';
      toggle.setAttribute('aria-expanded', String(isOpen));
      updateToggleIcon(isOpen);
    };

    toggle.addEventListener('click', () => {
      if (window.innerWidth >= 900) return;
      const isOpen = nav.classList.toggle('is-open');
      links.style.display = isOpen ? 'flex' : 'none';
      toggle.setAttribute('aria-expanded', String(isOpen));
      updateToggleIcon(isOpen);
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 900) {
          nav.classList.remove('is-open');
          links.style.display = 'none';
          toggle.setAttribute('aria-expanded', 'false');
          updateToggleIcon(false);
        }
      });
    });

    window.addEventListener('resize', setMenuState);
    setMenuState();
  });

});
