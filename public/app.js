const locationForm = document.getElementById('location-form');
const locationInput = document.getElementById('location-input');
const hintEl = document.getElementById('location-hint');
const forecastContainer = document.getElementById('forecast');

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Drizzle (light)',
  53: 'Drizzle (moderate)',
  55: 'Drizzle (dense)',
  56: 'Freezing drizzle (light)',
  57: 'Freezing drizzle (dense)',
  61: 'Rain (light)',
  63: 'Rain (moderate)',
  65: 'Rain (heavy)',
  66: 'Freezing rain (light)',
  67: 'Freezing rain (heavy)',
  71: 'Snow fall (light)',
  73: 'Snow fall (moderate)',
  75: 'Snow fall (heavy)',
  77: 'Snow grains',
  80: 'Rain showers (light)',
  81: 'Rain showers (moderate)',
  82: 'Rain showers (violent)',
  85: 'Snow showers (light)',
  86: 'Snow showers (heavy)',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail'
};

const toTitleCase = (str) => str.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

locationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const rawValue = locationInput.value.trim();
  if (!rawValue) return;

  hintEl.textContent = '尋找位置中…';
  forecastContainer.innerHTML = '';

  let coords;
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(rawValue)) {
    const [lat, lon] = rawValue.split(',').map((value) => parseFloat(value.trim()));
    coords = { latitude: lat, longitude: lon };
    hintEl.textContent = `座標：${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } else {
    const encoded = encodeURIComponent(rawValue);
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=5&language=zh`);
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      hintEl.textContent = '找不到這個城市，請再試一次。';
      return;
    }
    const { latitude, longitude, name, country, timezone } = geoData.results[0];
    coords = { latitude, longitude, timezone };
    hintEl.textContent = `位置：${name}, ${country}（時區 ${timezone}）`;
  }

  try {
    const params = new URLSearchParams({
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: coords.timezone || 'auto'
    });
    const forecastResp = await fetch(`/api/forecast?${params.toString()}`);
    const forecastData = await forecastResp.json();

    if (!forecastData.daily) {
      hintEl.textContent = '無法取得氣象資料，請稍後再試。';
      return;
    }

    renderForecast(forecastData.daily);
  } catch (error) {
    hintEl.textContent = '無法讀取天氣資料，請檢查網路後再試。';
  }
});

function renderForecast(daily) {
  const { time, temperature_2m_max, temperature_2m_min, weathercode, precipitation_sum } = daily;
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  forecastContainer.innerHTML = time
    .map((date, index) => {
      const maxTemp = temperature_2m_max[index];
      const minTemp = temperature_2m_min[index];
      const code = weathercode[index];
      const precip = precipitation_sum[index];
      const description = weatherCodes[code] || 'Unknown';

      return `
        <article class="card">
          <div>
            <h3>${formatter.format(new Date(date))}</h3>
            <p class="weathercode">${description}</p>
          </div>
          <p>🌡️ ${Math.round(minTemp)}° / ${Math.round(maxTemp)}°C</p>
          <p>💧 ${precip.toFixed(1)} mm</p>
        </article>
      `;
    })
    .join('');
}
