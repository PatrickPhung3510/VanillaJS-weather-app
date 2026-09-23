const searchInput = document.querySelector('.js-search-bar');
const searchBtn = document.querySelector('.js-search-btn')
const dashboard = document.querySelector('#dashboard-view');
const detailView = document.querySelector('#detail-view');
const errorEl = document.querySelector('.js-search-error');
const backBtn = document.querySelector('.js-back-btn');
const detailCityName = document.querySelector('.js-detail-city-name');
const detailCityTemp = document.querySelector('.js-detail-city-temp');
const detailCityConditions = document.querySelector('.js-detail-city-conditons');
const detailCityHighlow = document.querySelector('.js-detail-city-highlow');

/* Fetches the coordinates for the city name, latitude, and longitude
  @param {string} cityName - The name of the city to look up
  @retunrs {PromiseObject} - the object containing the city name, 
    latitude, and longitude
*/
async function getCoordinates(cityName) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
  const data = await response.json();
  const name = data.results[0].name;
  const latitude = data.results[0].latitude;
  const longitude = data.results[0].longitude;
  return {name, latitude, longitude};
}

/* Fetches the current weather data for specific geographic coordinates 
  @param {number} lat - the latitude
  @param {number} lon - the longitude
  @returns {PromiseObject} - An object containing the current forecast data
*/
async function getWeather(lat, lon) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
  const data = await response.json();
  return data;
}

// Hides the dashboard view and replaces the dashboard with the detail page
function showDetailView() {
  dashboard.classList.add('hidden');
  detailView.classList.remove('hidden');
}

// Hides the detail view and replaces it with the dashboard
function showDashboard() {
  dashboard.classList.remove('hidden');
  detailView.classList.add('hidden');
}

/* Searches the city by finding the cordinates of a city
      then fetches and logging its current weather
  @param {string} cityName - The name of the city to look up
*/
async function searchCity(cityName) {
  try {
    errorEl.classList.add('hidden');
    const cords = await getCoordinates(cityName);
    const weather = await getWeather(cords.latitude, cords.longitude);
    renderDetailView(cords, weather);
    console.log(`Weather for ${cords.name}:`, weather);
    showDetailView();
  } catch (error) {
    console.error('Error fetching city data:', error);
    errorEl.textContent = 'City not found. Please check the spelling and try again!';
    errorEl.classList.remove('hidden');
  }
}

// Grabs the input value and triggers the city search
function handleSearch() {
  const cityName = searchInput.value.trim();
  if (cityName) {
    searchCity(cityName);
  }
}

//Event Listeners 
searchBtn.addEventListener('click',  handleSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

backBtn.addEventListener('click', showDashboard);

function renderDetailView(cords, weather) {
  const currentTemp = Math.round(weather.current_weather.temperature);
  const maxTemp = Math.round(weather.daily.temperature_2m_max[0]);
  const minTemp = Math.round(weather.daily.temperature_2m_min[0]);
  detailCityName.textContent = cords.name;
  detailCityTemp.textContent = `${currentTemp}°`;
  detailCityConditions.textContent = 
    getWeatherDescription(weather.current_weather.weathercode);
  detailCityHighlow.textContent = `H:${maxTemp}° L:${minTemp}°`;
}


/*  Gets the city condition
@returns {Object} - the conditions from the city 
*/
function getWeatherDescription(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    51: 'Light drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm'
  }
  return conditions[code] || 'Unknown';
}

