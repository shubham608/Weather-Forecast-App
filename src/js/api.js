const API_KEY = "359bfca8c01caee795dd0db8cc88a2ff";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getWeatherByCity(city) {
  const res = await fetch(
    `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

export async function getWeatherByCoords(lat, lon) {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("Location error");
  return res.json();
}

export async function getForecast(city) {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("Forecast error");
  return res.json();
}
