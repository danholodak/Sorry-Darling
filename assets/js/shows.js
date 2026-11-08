document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('shows-list');
  if (!listEl) return;

  const paperAssets = [
    '22.png', '23.png', '29.png', '30.png', '39.png', '33.png', '34.png', '40.png'
  ];

  const getPaperBackground = () => {
    const asset = paperAssets[Math.floor(Math.random() * paperAssets.length)];
    return `assets/images/tornPaper/pressQuotes/${asset}`;
  };

  const formatShowDate = (dateString) => {
    const date = new Date(dateString);
    return {
      raw: date,
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      month: date.toLocaleDateString(undefined, { month: 'short' }),
      dayNum: date.toLocaleDateString(undefined, { day: 'numeric' })
    };
  };

  const renderShows = (shows) => {
    if (!shows.length) {
      listEl.innerHTML = `
        <li class="show-item show-item--empty">
          <div class="show-main">
            <p>No upcoming shows right now.</p>
            <p>Check back soon for new dates.</p>
          </div>
        </li>
      `;
      return;
    }

    listEl.innerHTML = shows.map((show) => {
      const dateInfo = formatShowDate(show.datetime);
      const ticketUrl = show.ticketUrl || show.offerUrl || null;
      const rsvpUrl = show.rsvpUrl || show.url || null;
      const venue = show.venue?.name || 'TBA';
      const city = show.venue?.location || 'Location TBA';
      const country = show.venue?.country || '';
      const locationText = [city, country].filter(Boolean).join(', ');
      const lineupLabel = show.lineup && show.lineup.length ? show.lineup.join(', ') : 'Sorry Darling';

      return `
        <li class="show-item" style="background-image: url('${getPaperBackground()}');">
          <div class="show-main">
            <div class="show-date-block">
              <span class="show-date-weekday">${dateInfo.day}</span>
              <span class="show-date-month">${dateInfo.month}</span>
              <span class="show-date-day">${dateInfo.dayNum}</span>
            </div>

            <div class="show-details">
              <span class="show-band">Sorry Darling</span>
              <span class="show-lineup">${lineupLabel}</span>
              <span class="show-venue">${venue}</span>
              <span class="show-location">${locationText}</span>
            </div>
          </div>

          <div class="show-actions">
            ${ticketUrl ? `<a class="show-button" href="${ticketUrl}" target="_blank" rel="noopener noreferrer">Tickets</a>` : ''}
            ${rsvpUrl ? `<a class="show-button show-button--secondary" href="${rsvpUrl}" target="_blank" rel="noopener noreferrer">RSVP</a>` : ''}
          </div>
        </li>
      `;
    }).join('');
  };

  fetch('https://rest.bandsintown.com/artists/id_10372011/events?app_id=squarespace-vuvuzela-keyboard-rdsz')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Bandsintown request failed: ${response.status}`);
      }
      return response.json();
    })
    .then((events) => {
      const formattedShows = events.map((event) => {
        const ticketOffer = (event.offers || []).find((offer) => offer.type === 'Tickets' || offer.type === 'Tickets & RSVP');

        return {
          datetime: event.datetime,
          venue: event.venue,
          lineup: event.lineup || [],
          ticketUrl: ticketOffer ? ticketOffer.url?.split('?')[0] : null,
          rsvpUrl: event.url ? event.url.split('?')[0] : null,
          url: event.url ? event.url.split('?')[0] : null
        };
      });

      renderShows(formattedShows);
    })
    .catch((error) => {
      console.error('Failed to load shows:', error);
      listEl.innerHTML = `
        <li class="show-item show-item--empty">
          <div class="show-main">
            <p>Show listings are temporarily unavailable.</p>
            <p>Please check back soon.</p>
          </div>
        </li>
      `;
    });
});
