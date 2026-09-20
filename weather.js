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

/* Searches the city by finding the cordinates of a city
      then fetches and logging its current weather
  @param {string} cityName - The name of the city to look up
*/
async function searchCity(cityName) {
  const cords = await getCoordinates(cityName);
  const weather = await getWeather(cords.latitude, cords.longitude);
  console.log(`Weather for ${cords.name}:`, weather);
}
searchCity('Tokyo');


