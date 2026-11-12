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
      if (nav.querySelector('.social-links') && nav.querySelector('.socials-menu-toggle')) return;

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

      const mobileToggle = document.createElement('button');
      mobileToggle.type = 'button';
      mobileToggle.className = 'socials-menu-toggle';
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Toggle social media links');
      mobileToggle.innerHTML = '<span class="socials-menu-label">Socials</span><span class="socials-menu-caret" aria-hidden="true">^</span>';

      const mobilePanel = document.createElement('div');
      mobilePanel.className = 'socials-menu-panel';
      mobilePanel.setAttribute('aria-hidden', 'true');

      socialsList.forEach((social) => {
        const link = document.createElement('a');
        link.href = social.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'social-menu-link';
        link.setAttribute('aria-label', social.name);

        const img = document.createElement('img');
        img.src = social.image;
        img.alt = social.name;
        img.loading = 'lazy';

        link.appendChild(img);
        mobilePanel.appendChild(link);
      });

      nav.appendChild(mobileToggle);
      nav.appendChild(mobilePanel);
    });
  };

  ensureFavicon();
  renderSocialLinks();

  const navs = document.querySelectorAll('.site-nav');

  navs.forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    const links = nav.querySelector('.nav-links');
    const socialToggle = nav.querySelector('.socials-menu-toggle');
    const socialPanel = nav.querySelector('.socials-menu-panel');

    const closeNavMenu = () => {
      if (!toggle || !links) return;
      nav.classList.remove('is-open');
      links.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
    };

    const closeSocialMenu = () => {
      if (!socialToggle || !socialPanel) return;
      nav.classList.remove('socials-open');
      socialPanel.classList.remove('is-open');
      socialPanel.setAttribute('aria-hidden', 'true');
      socialToggle.setAttribute('aria-expanded', 'false');
      socialToggle.classList.remove('is-open');
    };

    if (!toggle || !links) return;

    const updateToggleIcon = (isOpen) => {
      if (isOpen) {
        toggle.innerHTML = '<img src="assets/images/close.png" alt="Close menu" style="width:100%;height:100%;display:block;object-fit:contain;" />';
      } else {
        toggle.innerHTML = '<span></span><span></span><span></span>';
      }
    };

    const setMenuState = () => {
      const isMobileNav = window.innerWidth < 900;
      const isMobileSocial = window.innerWidth < 750;

      if (!isMobileNav) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        links.style.display = '';
        updateToggleIcon(false);
      } else {
        const isOpen = nav.classList.contains('is-open');
        links.style.display = isOpen ? 'flex' : 'none';
        toggle.setAttribute('aria-expanded', String(isOpen));
        updateToggleIcon(isOpen);
      }

      if (!isMobileSocial) {
        closeSocialMenu();
      } else if (socialPanel && !nav.classList.contains('socials-open')) {
        socialPanel.classList.remove('is-open');
        socialPanel.setAttribute('aria-hidden', 'true');
      }
    };

    toggle.addEventListener('click', () => {
      if (window.innerWidth >= 900) return;
      const isOpen = nav.classList.toggle('is-open');
      links.style.display = isOpen ? 'flex' : 'none';
      toggle.setAttribute('aria-expanded', String(isOpen));
      updateToggleIcon(isOpen);

      if (isOpen) {
        closeSocialMenu();
      }
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 900) {
          closeNavMenu();
        }
      });
    });

    if (socialToggle && socialPanel) {
      socialToggle.addEventListener('click', () => {
        if (window.innerWidth >= 750) return;

        const isOpen = nav.classList.toggle('socials-open');
        socialPanel.classList.toggle('is-open', isOpen);
        socialPanel.setAttribute('aria-hidden', String(!isOpen));
        socialToggle.setAttribute('aria-expanded', String(isOpen));
        socialToggle.classList.toggle('is-open', isOpen);

        if (isOpen) {
          closeNavMenu();
        }
      });
    }

    window.addEventListener('resize', setMenuState);
    setMenuState();
  });

});
