document.addEventListener('DOMContentLoaded', () => {
  const galleryEl = document.querySelector('.gallery');
  if (!galleryEl) return;

  const state = {
    items: [],
    activeIndex: 0,
    lightboxOpen: false
  };

  const createLightbox = () => {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-lightbox';
    overlay.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('div');
    panel.className = 'gallery-lightbox-panel';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'gallery-lightbox-nav prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '<img src="assets/images/left.png" alt="Previous image" />';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'gallery-lightbox-nav next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '<img src="assets/images/right.png" alt="Next image" />';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gallery-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image view');
    closeBtn.innerHTML = '<img src="assets/images/close.png" alt="Close image view" />';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'gallery-lightbox-image-wrap';

    const image = document.createElement('img');
    image.alt = '';
    imageWrap.appendChild(image);

    const footer = document.createElement('div');
    footer.className = 'gallery-lightbox-footer';

    const caption = document.createElement('span');
    caption.className = 'gallery-lightbox-caption';

    const actions = document.createElement('div');
    actions.className = 'gallery-lightbox-actions';

    const downloadBtn = document.createElement('a');
    downloadBtn.href = '#';
    downloadBtn.className = 'gallery-lightbox-download';
    downloadBtn.textContent = 'Download';
    downloadBtn.setAttribute('download', '');

    actions.appendChild(downloadBtn);
    actions.appendChild(closeBtn);
    footer.appendChild(caption);
    footer.appendChild(actions);

    panel.appendChild(prevBtn);
    panel.appendChild(nextBtn);
    panel.appendChild(imageWrap);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const updateLightbox = () => {
      const item = state.items[state.activeIndex];
      if (!item) return;

      image.src = item.src;
      image.alt = item.caption;
      caption.textContent = item.caption;
      downloadBtn.href = item.src;
      downloadBtn.setAttribute('download', item.caption || 'image');
    };

    prevBtn.addEventListener('click', () => {
      if (state.items.length === 0) return;
      state.activeIndex = (state.activeIndex - 1 + state.items.length) % state.items.length;
      updateLightbox();
    });

    nextBtn.addEventListener('click', () => {
      if (state.items.length === 0) return;
      state.activeIndex = (state.activeIndex + 1) % state.items.length;
      updateLightbox();
    });

    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      state.lightboxOpen = false;
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeBtn.click();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!state.lightboxOpen) return;
      if (event.key === 'Escape') {
        closeBtn.click();
      } else if (event.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (event.key === 'ArrowRight') {
        nextBtn.click();
      }
    });

    return {
      overlay,
      updateLightbox
    };
  };

  const lightbox = createLightbox();

  const renderGallery = () => {
    galleryEl.innerHTML = '';

    state.items.forEach((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-item';
      card.setAttribute('aria-label', item.caption);

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption;
      img.loading = 'lazy';

      const caption = document.createElement('span');
      caption.className = 'gallery-item-caption';
      caption.textContent = item.caption;

      card.appendChild(img);
      card.appendChild(caption);
      card.addEventListener('click', () => {
        state.activeIndex = index;
        lightbox.updateLightbox();
        lightbox.overlay.classList.add('is-open');
        lightbox.overlay.setAttribute('aria-hidden', 'false');
        state.lightboxOpen = true;
      });

      galleryEl.appendChild(card);
    });
  };

  const loadGallery = async () => {
    try {
      const response = await fetch('assets/images/photoGallery/manifest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Manifest not found');
      const items = await response.json();

      state.items = Array.isArray(items) ? items.filter((entry) => entry && entry.src) : [];
    } catch (error) {
      console.warn('Gallery manifest unavailable; using fallback image set.', error);
      state.items = [];
    }

    if (!state.items.length) {
      const fallbackImages = Array.from(document.querySelectorAll('.gallery img')).map((img) => ({
        src: img.src,
        caption: img.getAttribute('alt') || img.dataset.caption || img.src.split('/').pop().split('.').slice(0, -1).join('.')
      }));
      state.items = fallbackImages;
    }

    renderGallery();
  };

  loadGallery();
});
