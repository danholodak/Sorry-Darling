document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.querySelector('#press-list');
  if (!listEl) return;

  const imageNames = [
    '22.png',
    '23.png',
    '29.png',
    '30.png',
    '31.png',
    '33.png',
    '34.png',
    '35.png',
    '36.png',
    '40.png',
    '41.png',
  ];

  const parseCsv = (csvText) => {
    const rows = [];
    let current = '';
    let row = [];
    let inQuotes = false;

    const pushCurrent = () => {
      row.push(current);
      current = '';
    };

    for (let i = 0; i < csvText.length; i += 1) {
      const char = csvText[i];

      if (char === '"') {
        if (inQuotes && csvText[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        pushCurrent();
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && csvText[i + 1] === '\n') {
          i += 1;
        }
        pushCurrent();

        if (row.some((cell) => String(cell).trim())) {
          rows.push(row);
        }

        row = [];
        continue;
      }

      current += char;
    }

    if (current.length || row.length) {
      pushCurrent();
      if (row.some((cell) => String(cell).trim())) {
        rows.push(row);
      }
    }

    return rows;
  };

  const normalizeCell = (value) => String(value || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');

  const parsePressDate = (value) => {
    if (!value) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthYearMatch = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthIndex = monthMap[monthYearMatch[1]];
      if (monthIndex !== undefined) {
        return new Date(Number(monthYearMatch[2]), monthIndex, 1);
      }
    }

    const monthDayYearMatch = raw.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})$/);
    if (monthDayYearMatch) {
      const monthIndex = monthMap[monthDayYearMatch[1]];
      if (monthIndex !== undefined) {
        return new Date(Number(monthDayYearMatch[3]), monthIndex, Number(monthDayYearMatch[2]));
      }
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  fetch('assets/pressInfo.csv')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`CSV request failed: ${response.status}`);
      }
      return response.text();
    })
    .then((csvText) => {
      const rows = parseCsv(csvText)
        .map((row) => ({
          row,
          date: parsePressDate(row[2]),
        }))
        .sort((a, b) => {
          const aTime = a.date ? a.date.getTime() : 0;
          const bTime = b.date ? b.date.getTime() : 0;
          return bTime - aTime;
        })
        .map(({ row }) => row);

      rows.forEach((row) => {
        const [quote, source, date, link] = row.map(normalizeCell);

        if (!quote || !source || !link) return;

        const item = document.createElement('li');
        item.className = 'press-item';

        const imageName = imageNames[Math.floor(Math.random() * imageNames.length)];
        const imagePath = `assets/images/tornPaper/pressQuotes/${imageName}`;
        item.style.backgroundImage = ` url('${imagePath}')`;
        item.style.backgroundSize = '100% 100%';
        item.style.backgroundPosition = 'center';
        item.style.backgroundRepeat = 'no-repeat';

        const linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.className = 'press-link';

        const quoteEl = document.createElement('span');
        quoteEl.className = 'press-quote';
        quoteEl.textContent = `"${quote}"`;

        const sourceEl = document.createElement('span');
        sourceEl.className = 'press-source';
        sourceEl.textContent = `- ${source}`;

        const dateEl = document.createElement('span');
        dateEl.className = 'press-date';
        dateEl.textContent = date || '';

        linkEl.appendChild(quoteEl);
        linkEl.appendChild(sourceEl);
        if (date) {
          linkEl.appendChild(dateEl);
        }

        item.appendChild(linkEl);
        listEl.appendChild(item);
      });
    })
    .catch((error) => {
      console.error('Failed to load press list:', error);
      const fallback = document.createElement('li');
      fallback.className = 'press-item press-item--error';
      fallback.textContent = 'Press quotes could not be loaded right now.';
      listEl.appendChild(fallback);
    });
});
