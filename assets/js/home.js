let latestNews = [
  {
    type: 'embed',
    caption: 'Our latest playlist, inspired by our travels through the UK.',
    source: '<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/6OiQNA9aqYm8xgxl2DtynY?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
  },
   {
    type: 'text',
    caption: "Our next show - An ugly sweater party to celebrate Steve\'s birthday",
    source: 'https://www.bandsintown.com/e/109138162'
  }
];

// latestNews can contain either:
// { type: 'text', caption: 'A short label', source: 'https://example.com' }
// { type: 'embed', caption: 'A short label for the embed', source: '<iframe ...></iframe>' }
// On the home page, append this list to the existing paragraph text.
// If there is at least one item, start with: "Here's what we've been up to lately"
// If there are multiple items, place a large vertical "AND" between them.
// Keep the original blurb text intact and add the latest-news block after it.
document.addEventListener('DOMContentLoaded', () => {
  if (!Array.isArray(latestNews) || latestNews.length === 0) return;

  const blurb = document.querySelector('p.blurb');
  if (!blurb) return;

  if (blurb.dataset.newsAttached === 'true') return;
  blurb.dataset.newsAttached = 'true';

  const newsWrap = document.createElement('span');
  newsWrap.className = 'blurb-news-wrap';

  const intro = document.createElement('span');
  intro.className = 'blurb-news-intro';
  intro.textContent = "Here's what we've been up to lately";

  const itemsRow = document.createElement('span');
  itemsRow.className = 'blurb-news-items';

  latestNews.forEach((item, index) => {
    const itemNode = document.createElement('span');
    itemNode.className = 'blurb-news-item';

    if (item.type === 'text' && item.source) {
      const link = document.createElement('a');
      link.href = item.source;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.caption || item.source;
      itemNode.appendChild(link);
    } else if (item.source) {
      const caption = document.createElement('span');
      caption.className = 'blurb-news-caption';
      caption.textContent = item.caption || '';

      const embedWrap = document.createElement('span');
      embedWrap.className = 'blurb-news-embed';
      embedWrap.innerHTML = item.source;

      itemNode.appendChild(caption);
      itemNode.appendChild(embedWrap);
    }

    itemsRow.appendChild(itemNode);

    if (index < latestNews.length - 1) {
      const and = document.createElement('span');
      and.className = 'blurb-news-and';
      and.textContent = 'AND';
      itemsRow.appendChild(and);
    }
  });

  newsWrap.appendChild(intro);
  newsWrap.appendChild(itemsRow);
  blurb.appendChild(document.createTextNode(' '));
  blurb.appendChild(newsWrap);
});
