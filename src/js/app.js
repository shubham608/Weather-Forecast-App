console.log("App.js is running");

import { getWeatherByCity, getWeatherByCoords, getForecast } from "./api.js";
import { saveCity, getCities } from "./storage.js";
import { showError, hideError, convertTemp } from "./utils.js";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const recentCities = document.getElementById("recentCities");

const unitToggle = document.getElementById("unitToggle");

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;

  document.getElementById("temperature").textContent =
    `${convertTemp(currentTemp, isCelsius)}°`;

  unitToggle.textContent = isCelsius ? "°C" : "°F";
});


let isCelsius = true;
let currentTemp = 0;

searchBtn.addEventListener("click", () => loadCityWeather(cityInput.value));
locationBtn.addEventListener("click", loadLocationWeather);

function loadCityWeather(city) {
  if (!city) return showError("Please enter a city name");
  hideError();

  getWeatherByCity(city)
    .then(data => {
      displayWeather(data);
      saveCity(city);
      populateDropdown();
      return getForecast(city);
    })
    .then(displayForecast)
    .catch(err => showError(err.message));
}

function loadLocationWeather() {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;

      getWeatherByCoords(latitude, longitude)
        .then(data => {
          displayWeather(data);
          return getForecast(data.name);
        })
        .then(displayForecast)
        .catch(() => {
          showError("Unable to fetch location weather");
        });
    },
    () => showError("Location permission denied")
  );
}

function displayWeather(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weatherIcon").src = iconUrl;

    document.getElementById("currentWeather").classList.remove("hidden");
    document.getElementById("cityName").textContent = data.name;

    currentTemp = data.main.temp;
    document.getElementById("temperature").textContent =
        `${convertTemp(currentTemp, isCelsius)}°`;

    document.getElementById("condition").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} km/h`;

    const alertBox = document.getElementById("alertBox");
    alertBox.classList.add("hidden");
    alertBox.textContent = "";

    if (currentTemp > 40) {
        alertBox.textContent = "⚠ Extreme Heat Alert! Stay hydrated.";
        alertBox.classList.remove("hidden");
    }


    // Dynamic background
    const condition = data.weather[0].description.toLowerCase();
    const body = document.body;

    // reset previous backgrounds
    body.classList.remove("bg-clear", "bg-rain", "bg-haze", "bg-smoke");

    if (condition.includes("rain")) {
    body.classList.add("bg-rain");
    } else if (condition.includes("haze")) {
    body.classList.add("bg-haze");
    } else if (condition.includes("smoke")) {
    body.classList.add("bg-smoke");
    } else {
    body.classList.add("bg-clear");
    }

}

function displayForecast(data) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";

  data.list.filter((_, i) => i % 8 === 0).slice(0, 5).forEach(day => {
    const div = document.createElement("div");
    div.className = "bg-white text-black p-3 rounded shadow";
    const icon = day.weather[0].icon;

    div.innerHTML = `
    <p class="font-bold">${new Date(day.dt_txt).toDateString()}</p>
    <img 
        src="https://openweathermap.org/img/wn/${icon}.png"
        alt="Weather icon"
        class="w-12 h-12 mx-auto"/>
    <p>🌡 ${day.main.temp}°C</p>
    <p>💧 ${day.main.humidity}%</p>
    <p>💨 ${day.wind.speed} km/h</p>
    `;

    container.appendChild(div);
  });
}

function populateDropdown() {

  const cities = getCities();
  if (!cities.length) return;

  recentCities.classList.remove("hidden");
  recentCities.innerHTML = `<option>Select recent city</option>`;
  cities.forEach(c => {
    const opt = document.createElement("option");
    opt.textContent = c;
    recentCities.appendChild(opt);
  });

  recentCities.onchange = e => loadCityWeather(e.target.value);
}
const defaultCities = ["Delhi", "Mumbai", "London", "New York", "Dubai"];
const defaultContainer = document.getElementById("defaultCityContainer");

async function loadDefaultCities() {
  defaultContainer.innerHTML = "";

  const cityDataList = [];

  // Fetch weather ONCE for each city
  for (const city of defaultCities) {
    try {
      const data = await getWeatherByCity(city);
      cityDataList.push(data);
    } catch (err) {
      console.error("Failed to load default city:", city);
    }
  }

  // Render cards TWICE (DOM duplication only)
  [...cityDataList, ...cityDataList].forEach(data => {
    const card = document.createElement("div");
    card.className = "default-city-card";

    const icon = data.weather[0].icon;

    card.innerHTML = `
    <div class="flex items-center gap-3">
        <img src="https://openweathermap.org/img/wn/${icon}.png" class="w-10 h-10">
        <div>
        <h3 class="text-lg font-semibold">${data.name}</h3>
        <p class="text-2xl font-bold">${Math.round(data.main.temp)}°C</p>
        <p class="text-sm capitalize">${data.weather[0].description}</p>
        </div>
    </div>
    `;

    card.addEventListener("click", () => {
      loadCityWeather(data.name);
    });

    defaultContainer.appendChild(card);
  });
}

// Call on page load
loadDefaultCities();
