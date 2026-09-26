let currentCity = null;
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
const detailCityFeelsLike = document.querySelector('.js-feels-like-temp');
const detailCityWind = document.querySelector('.js-wind-stat');
const detailCityPrecipitation = document.querySelector('.js-precipitation-stat');
const detailCityAirQuality = document.querySelector('.js-air-quality-state');
const saveBtn = document.querySelector('.js-save-btn');

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
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto&forecast_days=10&windspeed_unit=mph&hourly=apparent_temperature&precipitation_unit=inch`);
  const data = await response.json();
  return data;
}

/* Fetches the current air quality for the specific geographic coordinates
  @param {number} lat - the latitude
  @param {number} lon - the longitude
  @returns {PromiseObject} - An object containing the current air quality data
*/
async function getAirQuality(lat, lon) {
  const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`);
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
    const airQuality = await getAirQuality(cords.latitude, cords.longitude);
    renderDetailView(cords, weather, airQuality);
    renderForecast(weather);
    console.log(`Weather for ${cords.name}:`, weather);
    showDetailView();
  } catch (error) {
    console.error('Error fetching city data:', error);
    errorEl.textContent = 'City not found. Please check the spelling and try again!';
    errorEl.classList.remove('hidden');
  }
}

/* Render the 10-day forecast on the detail view
  @param {Object} weather - The weather data object returned by the API
*/
function renderForecast(weather) {
  const forecastRow = document.querySelector('.js-forecast-row');

  const foreCastHTML = weather.daily.time.map((date, index) => {
    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short'});
    const weatherCondition = getWeatherDescription(weather.daily.weathercode[index]);
    const dayHigh = Math.round(weather.daily.temperature_2m_max[index]);
    const dayLow = Math.round(weather.daily.temperature_2m_min[index]);
    const iconURL = `https://api.iconify.design/wi/${weatherCondition.icon}.svg`;
    return `
      <div class="forecast-day">
         <p class="forecast-day-name">${dayName}</p>
        <img class="forecast-weather-img" src="${iconURL}" alt="${weatherCondition.text}">
        <p class="forecast-temp">${dayHigh} | ${dayLow}</p>
      </div>
    `
  }).join('');
  forecastRow.innerHTML = foreCastHTML;
}

/* Render the save cities in a card. User click on card to access the detail
   view of their saved card
*/
function renderSaveCard() {
  const saveCityCard = document.querySelector('.js-city-cards');
  const cities = getSavedCities();
  const cardHTML = cities.map((city) => {
    const condition = getWeatherDescription(city.weathercode);
    return `
      <div class="city-card">
        <h2 class="city-name">${city.name}</h2>
        <p class="city-condition">${condition.text}</p>
        <p class="city-temp">${city.temp}°</p>
      </div>
    `
  }).join('');
  saveCityCard.innerHTML = cardHTML;

  const cardElements = document.querySelectorAll('.city-card');
  cardElements.forEach((card, index) => {
    card.addEventListener('click', () => {
      searchCity(cities[index].name);
    });
  });
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

saveBtn.addEventListener('click', () => {
  const cities = getSavedCities();
  const alreadySaved = cities.some(city => city.name === currentCity.name);
  
  if (alreadySaved) {
    const updatedCities = cities.filter(city => city.name !== currentCity.name);
    saveCities(updatedCities);
    saveBtn.textContent = '☆';
    saveBtn.classList.remove('saved');
  } else {
    cities.push(currentCity);
    saveCities(cities);
    saveBtn.textContent = '★';
    saveBtn.classList.add('saved');
  }
  renderSaveCard();
});

// Get city name and fetches the data and displays it
function renderDetailView(cords, weather, airQuality) {
  const currentTemp = Math.round(weather.current_weather.temperature);
  const maxTemp = Math.round(weather.daily.temperature_2m_max[0]);
  const minTemp = Math.round(weather.daily.temperature_2m_min[0]);
  const feelsLike = Math.round(weather.hourly.apparent_temperature[0]);
  const wind = Math.round(weather.current_weather.windspeed);
  const precipitation = weather.daily.precipitation_sum[0].toFixed(2);
  const aqi = Math.round(airQuality.current.us_aqi);
  detailCityName.textContent = cords.name;
  detailCityTemp.textContent = `${currentTemp}°`;
  detailCityConditions.textContent = 
    getWeatherDescription(weather.current_weather.weathercode).text;
  currentCity = {name: cords.name, latitude: cords.latitude, longitude: cords.longitude, 
    weathercode: weather.current_weather.weathercode, temp: currentTemp};
  detailCityHighlow.textContent = `H:${maxTemp}° L:${minTemp}°`;
  detailCityFeelsLike.textContent = `${feelsLike}°`;
  detailCityWind.textContent = `${wind} mph`;
  detailCityPrecipitation.textContent = `${precipitation}" Today`;
  detailCityAirQuality.textContent = `${aqi} ${getAqiDescription(aqi)}`;

  const cities = getSavedCities();
  const isSaved = cities.some(city => city.name === currentCity.name);
  if (isSaved) {
    saveBtn.textContent = '★';
    saveBtn.classList.add('saved');
  } else {
    saveBtn.textContent = '☆';
    saveBtn.classList.remove('saved');
  }
}

/* Retrieves the list of saved cities from local storage
  @returns {Array} - An array of saved city objects, or an empty array if none exist
*/
function getSavedCities() {
  const saved = localStorage.getItem('savedCities');
  return saved ? JSON.parse(saved) : [];
}

/* Saves the updated array of cities to local storage
  @param {Array} cities - The array of city objects to store
*/
function saveCities(cities) {
  localStorage.setItem('savedCities', JSON.stringify(cities));
}
 
/* Determines the text rating for the given Air Quality Index value
  @param {number} aqi - The US AQI number
  @returns {string} - The text ratin
*/
function getAqiDescription(aqi) {
  if (aqi <= 50) {
    return 'Very Good';
  } else if (aqi <= 100) {
    return 'Good';
  } else if (aqi <= 150) {
    return 'Fair';
  } else if (aqi <= 200) {
    return 'Poor';
  } else if (aqi <= 500) {
    return 'Very Poor';
  } else {
    return 'Unknown';
  }
}

/*  Gets the city condition
@returns {Object} - the conditions from the city and the image 
*/
function getWeatherDescription(code) {
  const conditions = {
    0: {text: 'Clear sky', icon:'day-sunny'},
    1: {text: 'Mainly clear', icon:'day-sunny-overcast'},
    2: {text: 'Partly cloudy', icon:'day-cloudy'},
    3: {text: 'Overcast', icon:'cloudy'},
    45: {text: 'Foggy', icon:'fog'},
    51: {text: 'Light drizzle', icon:'sprinkle'},
    61: {text: 'Light rain', icon:'rain'},
    63: {text: 'Moderate rain', icon:'rain'},
    65: {text: 'Heavy rain', icon:'rain-wind'},
    71: {text: 'Light snow', icon:'snow'},
    73: {text: 'Moderate snow', icon:'snow'},
    75: {text: 'Heavy snow', icon:'snow-wind'},
    95: {text: 'Thunderstorm', icon:'thunderstorm'}
  }
  return conditions[code] || {text: 'Unknown', icon: 'cloudy'};
}

renderSaveCard();