const express = require('express');
const path = require('path');
const fetch = globalThis.fetch;

const app = express();
const PORT = process.env.PORT || 4173;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/forecast', async (req, res) => {
  const { latitude, longitude, timezone } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  const tz = timezone || 'auto';
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('timezone', tz);

  try {
    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
