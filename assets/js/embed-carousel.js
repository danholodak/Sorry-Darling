/* embed-carousel.js
   Clean single-file initializer for multiple carousels.
*/

console.log('embed-carousel.js loaded');

const EMBED_PLACEHOLDER_FEATURE = {
  enabled: true,
  delayMs: 1000,
};

function getPlaceholderKindFromPage() {
  const page = window.location.pathname.toLowerCase();
  if (page.includes('music')) return 'bandcamp';
  return 'youtube';
}

function getPlaceholderImages(kind = getPlaceholderKindFromPage()) {
  if (kind === 'bandcamp') {
    return {
      base: 'assets/images/embedPlaceholders/bandcampEmbed1.png',
      reveal: 'assets/images/embedPlaceholders/bandcampEmbed2.png',
    };
  }

  return {
    base: 'assets/images/embedPlaceholders/youtubeEmbed1.png',
    reveal: 'assets/images/embedPlaceholders/youtubeEmbed2.png',
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initCarousel(carouselEl) {
  const view = carouselEl.querySelector('.carousel-view');
  const prevBtn = carouselEl.querySelector('.carousel-btn.prev');
  const nextBtn = carouselEl.querySelector('.carousel-btn.next');
  const indicators = carouselEl.querySelector('.carousel-indicators');
  const src = carouselEl.dataset.src || 'assets/embedLinks.md';

  let embeds = [];
  let index = 0;
  let lastIndex = 0;
  let touchStartX = null;
  let touchStartY = null;

  // Build an embed node from raw HTML (used for rendering and measurement)
  function buildEmbedElement(raw) {
    const probe = document.createElement('div');
    probe.innerHTML = raw;
    const iframe = probe.querySelector('iframe');
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-item';
    if (iframe) {
        const wAttr = parseInt(iframe.getAttribute('width')) || null;
        const hAttr = parseInt(iframe.getAttribute('height')) || null;
      const ratio = (wAttr && hAttr) ? (hAttr / wAttr) : null;
      if ((ratio && ratio > 1.0) || (hAttr && hAttr > 700)) {
        wrapper.classList.add('embed-tall');
        wrapper.innerHTML = raw;
      } else {
        wrapper.classList.add('embed-wrapper');
        wrapper.innerHTML = raw;
        // add video class if the iframe src contains a video platform keyword 'youtube'
        if (iframe.src.includes('youtube')) {
          wrapper.classList.add('video');
        }
      }
        // expose original width/height (if present) for measurement logic
        if (wAttr) wrapper.dataset.origWidth = String(wAttr);
        if (hAttr) wrapper.dataset.origHeight = String(hAttr);
    } else {
      wrapper.classList.add('embed-wrapper');
      wrapper.innerHTML = raw;
    }
    return wrapper;
  }

  function renderPlaceholder() {
    const images = getPlaceholderImages(getPlaceholderKindFromPage());
    const placeholder = document.createElement('div');
    placeholder.className = `embed-item embed-placeholder ${getPlaceholderKindFromPage()}`;
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.innerHTML = `
      <img class="placeholder-base ${getPlaceholderKindFromPage()}" src="${images.base}" alt="Loading embed placeholder">
      <img class="placeholder-reveal ${getPlaceholderKindFromPage()}" src="${images.reveal}" alt="Loading embed placeholder revealed">
    `;

    const existingItem = view.querySelector('.embed-item');
    if (existingItem) existingItem.remove();

    view.appendChild(placeholder);
    return placeholder;
  }

  function render() {
    if (!embeds.length) {
      view.innerHTML = '<p style="color:#fff">No embeds found. Add iframe snippets to the specified file.</p>';
      return;
    }
    console.log('carousel render', { src, embedsLength: embeds.length, index });

    carouselEl.classList.add('ready');
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;

    const current = view.querySelector('.embed-item');
    const incoming = buildEmbedElement(embeds[index]);
    incoming.dataset.index = index;

    // If the raw iframe provided explicit width/height attributes, use them to compute
    // a responsive height based on the current carousel width. Fall back to DOM
    // measurement when attributes aren't present.
    try {
      const ow = incoming.dataset.origWidth ? parseInt(incoming.dataset.origWidth, 10) : null;
      const oh = incoming.dataset.origHeight ? parseInt(incoming.dataset.origHeight, 10) : null;
      if (ow && oh) {
        const viewWidth = view.clientWidth || view.getBoundingClientRect().width || 0;
        if (viewWidth > 0) {
          const scaled = Math.round(oh * (viewWidth / ow));
          view.style.height = scaled + 'px';
        }
      } else {
        const probe = buildEmbedElement(embeds[index]);
        probe.style.position = 'relative';
        probe.style.visibility = 'hidden';
        probe.style.pointerEvents = 'none';
        view.appendChild(probe);
        const measured = probe.offsetHeight || probe.getBoundingClientRect().height || 0;
        view.removeChild(probe);
        if (measured > 0) view.style.height = measured + 'px';
      }
    } catch (err) {
      console.warn('embed carousel measurement failed', err);
    }

    if (!current) {
      view.appendChild(incoming);
      incoming.classList.add('active');
      if (src === 'assets/VideoEmbedLinks.md') incoming.classList.add('video');
      if (indicators) {
        const buttons = indicators.querySelectorAll('button');
        buttons.forEach((b, i) => {
          b.classList.toggle('active', i === index);
          b.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
      }
      lastIndex = index;
      return;
    }

    const oldIdx = Number(current.dataset.index || lastIndex);
    const isNext = (index > oldIdx) || (oldIdx === embeds.length - 1 && index === 0);
    if (isNext) {
      incoming.classList.add('enter-from-right');
      current.classList.remove('active');
      current.classList.add('exit-to-left');
    } else {
      incoming.classList.add('enter-from-left');
      current.classList.remove('active');
      current.classList.add('exit-to-right');
    }

    view.appendChild(incoming);
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    incoming.offsetHeight;

    incoming.classList.add('active');

    // If the incoming has an iframe, wait for it to load before final measurement
    const innerIframe = incoming.querySelector('iframe');
    if (innerIframe) {
      const applyMeasurement = () => {
        try {
          // small delay to allow third-party scripts to finish rendering
          setTimeout(() => {
            const h = incoming.offsetHeight || incoming.getBoundingClientRect().height || 0;
            if (h > 0) view.style.height = h + 'px';
          }, 120);
        } catch (e) {}
      };

      if (innerIframe.complete) {
        applyMeasurement();
      } else {
        innerIframe.addEventListener('load', applyMeasurement, { once: true });
        // fallback: measure after 700ms even if load doesn't fire
        setTimeout(applyMeasurement, 700);
      }
    }

    const cleanup = () => {
      if (current && current.parentNode === view) view.removeChild(current);
      incoming.classList.remove('enter-from-right', 'enter-from-left');
      incoming.classList.add('active');
      if (indicators) {
        const buttons = indicators.querySelectorAll('button');
        buttons.forEach((b, i) => {
          b.classList.toggle('active', i === index);
          b.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
      }
      lastIndex = index;
      // After transition, ensure view height matches the incoming element exactly
      try {
        const cur = view.querySelector('.embed-item');
        if (cur) {
          const h = cur.offsetHeight || cur.getBoundingClientRect().height || 0;
          if (h > 0) view.style.height = h + 'px';
        }
      } catch (e) {}
    };

    const to = setTimeout(cleanup, 520);
    incoming.addEventListener('transitionend', function te(e) {
      if (e.target === incoming) {
        clearTimeout(to);
        incoming.removeEventListener('transitionend', te);
        cleanup();
      }
    });
  }

  // Recompute height on resize (debounced)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      try {
        const cur = view.querySelector('.embed-item');
        if (!cur) return;
        const ow = cur.dataset.origWidth ? parseInt(cur.dataset.origWidth, 10) : null;
        const oh = cur.dataset.origHeight ? parseInt(cur.dataset.origHeight, 10) : null;
        if (ow && oh) {
          const viewWidth = view.clientWidth || view.getBoundingClientRect().width || 0;
          if (viewWidth > 0) {
            const scaled = Math.round(oh * (viewWidth / ow));
            view.style.height = scaled + 'px';
            return;
          }
        }
        // fallback: measure with a hidden probe
        const probe = buildEmbedElement(embeds[index]);
        probe.style.position = 'relative';
        probe.style.visibility = 'hidden';
        probe.style.pointerEvents = 'none';
        view.appendChild(probe);
        const h = probe.offsetHeight || probe.getBoundingClientRect().height || 0;
        view.removeChild(probe);
        if (h > 0) view.style.height = h + 'px';
      } catch (err) {
        // ignore
      }
    }, 120);
  });

  function prev() {
    if (!embeds.length) return;
    index = (index - 1 + embeds.length) % embeds.length;
    render();
  }

  function next() {
    if (!embeds.length) return;
    index = (index + 1) % embeds.length;
    render();
  }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  const handleMobileSwipe = (event) => {
    if (window.innerWidth > 750) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    if (event.type === 'touchstart') {
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      return;
    }

    if (touchStartX === null) return;

    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) next();
      else prev();
    }

    touchStartX = null;
    touchStartY = null;
  };

  view.addEventListener('touchstart', handleMobileSwipe, { passive: true });
  view.addEventListener('touchend', handleMobileSwipe, { passive: true });

  // keyboard navigation scoped to this carousel
  carouselEl.tabIndex = 0;
  carouselEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  function loadEmbeds() {
    const rawHtml = embeds[index] || '';
    if (EMBED_PLACEHOLDER_FEATURE.enabled) {
      renderPlaceholder(rawHtml);
    }

    return wait(EMBED_PLACEHOLDER_FEATURE.enabled ? EMBED_PLACEHOLDER_FEATURE.delayMs : 0)
      .then(() => fetch(src))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then((text) => {
        // Try to parse HTML first
        const tmp = document.createElement('div');
        tmp.innerHTML = text;
        const iframes = tmp.querySelectorAll('iframe');
        embeds = Array.from(iframes).map((el) => el.outerHTML);

        // Fallback: regex to extract iframe tags from plain text
        if (embeds.length === 0) {
          const re = /<iframe[\s\S]*?<\/iframe>/gi;
          const matches = text.match(re) || [];
          embeds = matches.map(s => s.trim());
        }

        // build indicators
        if (indicators) {
          indicators.innerHTML = '';
          embeds.reverse().forEach((_, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', `Embed ${i + 1}`);
            btn.addEventListener('click', () => {
              index = i;
              render();
            });
            indicators.appendChild(btn);
          });
        }

        index = 0;
        render();
        return embeds;
      })
      .catch((err) => {
        console.error('Error loading embeds from', src, err);
        view.innerHTML = `<p style="color:#fff">Error loading embeds: ${err.message}</p>`;
        embeds = [];
        return embeds;
      });
  }

  carouselEl.reloadEmbeds = loadEmbeds;
  return loadEmbeds();
}

document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.embed-carousel');
  if (!carousels.length) {
    console.log('embed-carousel: no .embed-carousel elements found');
    return;
  }
  carousels.forEach((c) => initCarousel(c));
  window.reloadAllEmbeds = () => {
    document.querySelectorAll('.embed-carousel').forEach((c) => c.reloadEmbeds && c.reloadEmbeds());
  };
});
