const KEY = "recentCities";

export function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem(KEY)) || [];
  cities = [city, ...cities.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(cities));
}

export function getCities() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}
