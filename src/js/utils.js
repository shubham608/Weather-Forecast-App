export function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.classList.remove("hidden");
}

export function hideError() {
  document.getElementById("errorBox").classList.add("hidden");
}

export function convertTemp(temp, isCelsius) {
  return isCelsius ? temp : (temp * 9/5 + 32).toFixed(1);
}
