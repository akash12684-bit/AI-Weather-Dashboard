/* ==================================================
   1) DATA — weather code lookup + "sky" color themes
   ================================================== */

// Open-Meteo uses WMO weather codes. This maps each code to a description + emoji.
const WEATHER_CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Dense drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌨️'], 67: ['Freezing rain', '🌨️'],
  71: ['Light snow', '❄️'], 73: ['Snow', '❄️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'], 86: ['Snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm + hail', '⛈️'], 99: ['Thunderstorm + hail', '⛈️'],
};
function getWeatherInfo(code) {
  const entry = WEATHER_CODES[code] || ['Unknown', '❓'];
  return { desc: entry[0], icon: entry[1] };
}

// Two-color gradients for the hero card, grouped by condition. Night overrides all of these.
const SKY_THEMES = {
  clear: ['#E4A73D', '#2D5A82'],
  cloud: ['#7C8CA0', '#3E6E97'],
  fog:   ['#8A96A3', '#4A5560'],
  rain:  ['#3E6E97', '#4A3F73'],
  snow:  ['#9FB3C7', '#4A6482'],
  storm: ['#5B4C93', '#161F2B'],
};
function applySkyTheme(code, isDay) {
  let key = 'cloud';
  if (code === 0 || code === 1) key = 'clear';
  else if (code === 2 || code === 3) key = 'cloud';
  else if (code === 45 || code === 48) key = 'fog';
  else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) key = 'rain';
  else if ([71, 73, 75, 77, 85, 86].includes(code)) key = 'snow';
  else if ([95, 96, 99].includes(code)) key = 'storm';

  const [a, b] = isDay === 0 ? ['#1B2740', '#0B121C'] : SKY_THEMES[key];
  document.documentElement.style.setProperty('--sky-a', a);
  document.documentElement.style.setProperty('--sky-b', b);
}

/* ==================================================
   1b) WEATHER BACKGROUND FX — new feature
   Reads the same weather_code the AI insights use, and turns the fixed
   #weatherFx layer behind the app into rain / thunder flashes / snow /
   drifting clouds / fog. Kept as plain DOM + CSS animations (no canvas,
   no libraries) so it's easy to read and explain.
   ================================================== */
const weatherFx = document.getElementById('weatherFx');
let lightningTimer = null; // holds the setInterval so we can stop old flashes when weather changes

function clearWeatherEffect() {
  weatherFx.innerHTML = '';
  if (lightningTimer) { clearInterval(lightningTimer); lightningTimer = null; }
}

function addDrops(count) {
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'fx-drop';
    d.style.left = `${Math.random() * 100}%`;
    d.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
    d.style.animationDelay = `${Math.random() * 2}s`;
    weatherFx.appendChild(d);
  }
}

function addSnow(count) {
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'fx-flake';
    f.textContent = '❄';
    f.style.left = `${Math.random() * 100}%`;
    f.style.fontSize = `${10 + Math.random() * 10}px`;
    f.style.animationDuration = `${5 + Math.random() * 5}s`;
    f.style.animationDelay = `${Math.random() * 5}s`;
    weatherFx.appendChild(f);
  }
}

function addClouds(count) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'fx-cloud';
    c.textContent = '☁️';
    c.style.top = `${5 + Math.random() * 30}%`;
    c.style.animationDuration = `${30 + Math.random() * 20}s`;
    c.style.animationDelay = `${-Math.random() * 30}s`;
    weatherFx.appendChild(c);
  }
}

function addFog(count) {
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'fx-fog';
    f.style.top = `${10 + i * 25}%`;
    f.style.animationDuration = `${10 + Math.random() * 6}s`;
    weatherFx.appendChild(f);
  }
}

function addLightning() {
  const flash = document.createElement('div');
  flash.className = 'fx-lightning';
  weatherFx.appendChild(flash);
  lightningTimer = setInterval(() => {
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 120);
  }, 2500 + Math.random() * 3000);
}

// Decide which effect(s) to show for a given Open-Meteo weather_code
function setWeatherEffect(code, isDay) {
  clearWeatherEffect();

  if ([95, 96, 99].includes(code)) {           // thunderstorm
    addDrops(70);
    addLightning();
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) { // rain
    addDrops(50);
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) { // snow
    addSnow(40);
  } else if (code === 45 || code === 48) {     // fog
    addFog(4);
  } else if (code === 0 || code === 1) {       // clear
    if (isDay) addClouds(2); // a couple of light clouds even on a clear day
  } else {                                     // 2, 3 — partly cloudy / overcast
    addClouds(5);
  }
}

/* ==================================================
   2) DOM REFERENCES
   ================================================== */
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');
const content = document.getElementById('content');
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const locateBtn = document.getElementById('locateBtn');
const themeToggle = document.getElementById('themeToggle');

/* ==================================================
   3) SMALL HELPERS
   ================================================== */
function showLoader() { loader.classList.remove('hidden'); errorMsg.classList.add('hidden'); content.classList.add('hidden'); }
function showError(msg) { loader.classList.add('hidden'); errorMsg.textContent = msg; errorMsg.classList.remove('hidden'); }
function hideLoaderAndError() { loader.classList.add('hidden'); errorMsg.classList.add('hidden'); }

// "2026-07-09" parsed with `new Date()` directly would shift a day in some timezones
// (date-only strings are read as UTC). Building the date from its parts avoids that.
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ==================================================
   4) API CALLS — both are free, keyless Open-Meteo endpoints
   ================================================== */
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed.');
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error(`No location found for "${city}".`);
  const place = data.results[0];
  return { lat: place.latitude, lon: place.longitude, name: place.name, country: place.country || '' };
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: 7,
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather request failed.');
  return res.json();
}

/* ==================================================
   5) THE "AI" — rule-based insight generator
   This is the heart of the "AI section": no external AI call, just JS logic
   reading the live numbers and writing advice in plain sentences.
   ================================================== */
function generateAIInsights(current, daily) {
  const temp = current.temperature_2m;
  const feels = current.apparent_temperature;
  const rainChance = daily.precipitation_probability_max[0];
  const wind = current.wind_speed_10m;
  const code = current.weather_code;
  const desc = getWeatherInfo(code).desc.toLowerCase();

  let mood;
  if (temp >= 35) mood = "It's scorching hot";
  else if (temp >= 28) mood = "It's warm";
  else if (temp >= 20) mood = "It's pleasantly mild";
  else if (temp >= 10) mood = "It's cool";
  else mood = "It's cold";

  const summary = `${mood} today with ${desc} skies, feeling like ${Math.round(feels)}°. There's a ${rainChance}% chance of rain.`;

  let clothing;
  if (temp >= 32) clothing = 'Light cotton or linen, plus sunglasses and sunscreen.';
  else if (temp >= 22) clothing = 'A T-shirt or light shirt is fine — pack a thin layer for the evening.';
  else if (temp >= 14) clothing = 'A light sweater or jacket will keep you comfortable.';
  else if (temp >= 5) clothing = 'Layer up with a warm jacket.';
  else clothing = 'Bundle up — heavy coat, gloves, and a scarf recommended.';

  let umbrella;
  if (rainChance >= 60) umbrella = 'Yes — carry one, rain is very likely today.';
  else if (rainChance >= 30) umbrella = 'Worth packing, just in case.';
  else umbrella = 'Not likely needed today.';

  let travel;
  if ([95, 96, 99].includes(code)) travel = 'Thunderstorms expected — postpone travel if you can.';
  else if ([45, 48].includes(code)) travel = 'Foggy — allow extra time and drive carefully.';
  else if (wind >= 35) travel = 'Quite windy — secure loose items before heading out.';
  else if (rainChance >= 60) travel = 'Wet roads likely — leave a little earlier than usual.';
  else travel = 'Good conditions for getting around today.';

  return { summary, clothing, umbrella, travel };
}

/* ==================================================
   6) RENDER FUNCTIONS — data → DOM
   ================================================== */
function renderCurrent(locationLabel, current) {
  const info = getWeatherInfo(current.weather_code);
  document.getElementById('locationName').textContent = locationLabel;
  document.getElementById('currentDate').textContent =
    new Date(current.time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  document.getElementById('currentIcon').textContent = info.icon;
  document.getElementById('currentTemp').textContent = `${Math.round(current.temperature_2m)}°`;
  document.getElementById('currentDesc').textContent = info.desc;
  document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°`;
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
}

function renderForecast(daily) {
  const grid = document.getElementById('forecastGrid');
  grid.innerHTML = '';
  daily.time.forEach((dateStr, i) => {
    const info = getWeatherInfo(daily.weather_code[i]);
    const dayLabel = i === 0 ? 'Today' : parseLocalDate(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="forecast-day">${dayLabel}</div>
      <div class="forecast-icon">${info.icon}</div>
      <div class="forecast-temps">
        <span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
        <span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
      </div>
      <div class="forecast-rain">💧 ${daily.precipitation_probability_max[i]}%</div>`;
    grid.appendChild(card);
  });
}

function renderAIInsights(current, daily) {
  const { summary, clothing, umbrella, travel } = generateAIInsights(current, daily);
  document.getElementById('aiSummary').textContent = summary;
  document.getElementById('tipClothing').textContent = clothing;
  document.getElementById('tipUmbrella').textContent = umbrella;
  document.getElementById('tipTravel').textContent = travel;
}

// NEW FEATURE: sunrise, sunset, and day length for today
function renderSunInfo(daily) {
  const sunrise = new Date(daily.sunrise[0]);
  const sunset = new Date(daily.sunset[0]);
  const timeFmt = { hour: 'numeric', minute: '2-digit' };

  document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', timeFmt);
  document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-US', timeFmt);

  const minutes = Math.round((sunset - sunrise) / 60000);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  document.getElementById('dayLength').textContent = `${hrs}h ${mins}m`;
}

function renderAll(locationLabel, data) {
  hideLoaderAndError();
  applySkyTheme(data.current.weather_code, data.current.is_day);
  setWeatherEffect(data.current.weather_code, data.current.is_day); // NEW: animated rain/thunder/snow background
  renderCurrent(locationLabel, data.current);
  renderForecast(data.daily);
  renderAIInsights(data.current, data.daily);
  renderSunInfo(data.daily); // NEW: sunrise/sunset/day length
  content.classList.remove('hidden');
}

/* ==================================================
   7) ORCHESTRATORS — tie the API calls to rendering
   ================================================== */
async function loadCity(cityName) {
  showLoader();
  try {
    const place = await geocodeCity(cityName);
    const weather = await fetchWeather(place.lat, place.lon);
    renderAll(`${place.name}${place.country ? ', ' + place.country : ''}`, weather);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  }
}

async function loadCoords(lat, lon, label) {
  showLoader();
  try {
    const weather = await fetchWeather(lat, lon);
    renderAll(label, weather);
  } catch (err) {
    showError('Could not load weather for your location.');
  }
}

/* ==================================================
   8) EVENT LISTENERS
   ================================================== */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) loadCity(city);
});

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showError('Geolocation is not supported by your browser.'); return; }
  showLoader();
  navigator.geolocation.getCurrentPosition(
    (pos) => loadCoords(pos.coords.latitude, pos.coords.longitude, 'Your Location'),
    (err) => {
      // err.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
      if (err.code === 1) {
        showError('Location access was denied. Click the lock/info icon in your browser\'s address bar, allow Location, then try again — or just use the search box above.');
      } else if (err.code === 2) {
        showError('Could not determine your position. Make sure Location Services are turned on for your device.');
      } else {
        showError('Location request timed out. Please try again or use the search box.');
      }
    }
  );
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

/* ==================================================
   9) INITIAL LOAD
   ================================================== */
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}
loadCity('New Delhi'); // starter city — search box changes it instantly

