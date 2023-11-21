const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".searchBtn");
const locationButton = document.querySelector(".locationBtn");
const prev1Button = document.getElementById("prev1");
const prev2Button = document.getElementById("prev2");
const prev3Button = document.getElementById("prev3");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "aa00a4c51621ba3a9ad574e937fb652e"; // OpenWeatherMap API Key

const createWeatherCard = (cityName, weatherItem, index) => {
  // HTML for the main weather card
  if (index === 0) {
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt
      .split(" ")[0]
      .replace(/-/g, "/")})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else {
    // HTML for the other five day forecast card
    return `<li class="card">
                    <h3>${cityName} (${weatherItem.dt_txt
      .split(" ")[0]
      .replace(/-/g, "/")})</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Creating weather cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Get entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Get coordinates of user location
      const { latitude, longitude } = position.coords;
      // Get city name from coordinates using reverse geocoding API
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      // Show alert if user denied the location permission
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access again."
        );
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

// Get weather details from previous searches button
const getPrevCoordinates = (index) => {
  const cityName = localStorage.getItem(`prevCity${index}`);
  // Check if the city name is available in localStorage
  if (!cityName) return; 
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Get entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) {
        alert(`No coordinates found for ${cityName}`);
        return;
      }
      const { lat, lon, name } = data[0];
      // Update the UI with the weather details
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
}; 


// Function to save city input into local storage and display up to 3 previous searches
function saveAndDisplaySearch() {
  const cityValue = cityInput.value;

  // Save the current search to local storage and update the display
  updatePreviousSearch(3, localStorage.getItem("prevCity2"));
  updatePreviousSearch(2, localStorage.getItem("prevCity1"));
  updatePreviousSearch(1, cityValue);

  // Clear the search input after saving
  cityInput.value = "";
}

// Create save chain of all previous searches (up to 3) and display them in the HTML button location
function updatePreviousSearch(index, value) {
  if ((value === null)) {
    document.getElementById(`prev${index}`).innerHTML = "";
  } else {
    const key = `prevCity${index}`;
    localStorage.setItem(key, value);
    document.getElementById(`prev${index}`).innerHTML = localStorage.getItem(key);
  }
}

// Event listener for search button/ enter to execute location functions and display weather details
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);

// Event listener for search button/ enter to execute local storage functions
searchButton.addEventListener("click", saveAndDisplaySearch);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && saveAndDisplaySearch()
);

  // Check if elements are found then adding event listeners to previous searches
  if (prev1Button) {
    prev1Button.addEventListener("click", () => {
      console.log("Clicked on prev1Button");
      getPrevCoordinates(1);
    });
  }
  if (prev2Button) {
    prev2Button.addEventListener("click", () => {
      console.log("Clicked on prev2Button");
      getPrevCoordinates(2);
    });
  }
  if (prev3Button) {
    prev3Button.addEventListener("click", () => {
      console.log("Clicked on prev3Button");
      getPrevCoordinates(3);
    });
  }