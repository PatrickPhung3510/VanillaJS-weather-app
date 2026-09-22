const searchInput = document.querySelector('.js-search-bar');
const searchBtn = document.querySelector('.js-search-btn')
const dashboard = document.querySelector('#dashboard-view');
const detailView = document.querySelector('#detail-view');
const errorEl = document.querySelector('.js-search-error');
const backBtn = document.querySelector('.js-back-btn');

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
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
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



