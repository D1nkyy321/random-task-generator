const timeDisplay = document.getElementById("timeDisplay");
const statusText = document.getElementById("statusText");
const progressRing = document.getElementById("progressRing");

const tabs = document.querySelectorAll(".tab");
const timerSettings = document.getElementById("timerSettings");
const presetRow = document.getElementById("presetRow");
const lapActions = document.getElementById("lapActions");
const lapsList = document.getElementById("lapsList");

const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const lapBtn = document.getElementById("lapBtn");
const clearLapsBtn = document.getElementById("clearLapsBtn");
const themeBtn = document.getElementById("themeBtn");

let mode = "stopwatch";
let intervalId = null;
let isRunning = false;

let stopwatchSeconds = 0;
let timerSeconds = 5 * 60;
let timerTotalSeconds = 5 * 60;

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function updateDisplay() {
  if (mode === "stopwatch") {
    timeDisplay.textContent = formatTime(stopwatchSeconds);
    progressRing.style.setProperty("--progress", `${(stopwatchSeconds * 6) % 360}deg`);
    statusText.textContent = isRunning ? "Секундомер запущен" : "Готов к старту";
    return;
  }

  timeDisplay.textContent = formatTime(timerSeconds);
  const progress = timerTotalSeconds > 0
    ? ((timerTotalSeconds - timerSeconds) / timerTotalSeconds) * 360
    : 0;
  progressRing.style.setProperty("--progress", `${progress}deg`);
  statusText.textContent = isRunning ? "Таймер работает" : "Выбери время и нажми старт";
}

function getTimerInputSeconds() {
  const hours = Number(hoursInput.value) || 0;
  const minutes = Number(minutesInput.value) || 0;
  const seconds = Number(secondsInput.value) || 0;
  return Math.max(0, hours * 3600 + minutes * 60 + seconds);
}

function stopInterval() {
  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
}

function start() {
  if (isRunning) return;

  if (mode === "timer") {
    const inputSeconds = getTimerInputSeconds();

    if (timerSeconds <= 0 || timerSeconds === timerTotalSeconds) {
      timerSeconds = inputSeconds;
      timerTotalSeconds = inputSeconds;
    }

    if (timerSeconds <= 0) {
      statusText.textContent = "Сначала выбери время";
      return;
    }
  }

  isRunning = true;
  updateDisplay();

  intervalId = setInterval(() => {
    if (mode === "stopwatch") {
      stopwatchSeconds += 1;
    } else {
      timerSeconds -= 1;

      if (timerSeconds <= 0) {
        timerSeconds = 0;
        stopInterval();
        playFinishSound();
        statusText.textContent = "Время вышло";
      }
    }

    updateDisplay();
  }, 1000);
}

function pause() {
  stopInterval();
  updateDisplay();
}

function reset() {
  stopInterval();

  if (mode === "stopwatch") {
    stopwatchSeconds = 0;
    lapsList.innerHTML = "";
  } else {
    timerSeconds = getTimerInputSeconds();
    timerTotalSeconds = timerSeconds;
  }

  updateDisplay();
}

function switchMode(nextMode) {
  stopInterval();
  mode = nextMode;

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  const isTimer = mode === "timer";
  timerSettings.classList.toggle("hidden", !isTimer);
  presetRow.classList.toggle("hidden", !isTimer);
  lapActions.classList.toggle("hidden", isTimer);
  lapsList.classList.toggle("hidden", isTimer);

  if (isTimer) {
    timerSeconds = getTimerInputSeconds();
    timerTotalSeconds = timerSeconds;
  }

  updateDisplay();
}

function addLap() {
  if (mode !== "stopwatch" || stopwatchSeconds === 0) return;

  const li = document.createElement("li");
  li.textContent = `Круг ${lapsList.children.length + 1}: ${formatTime(stopwatchSeconds)}`;
  lapsList.prepend(li);
}

function setPreset(minutes) {
  stopInterval();

  hoursInput.value = 0;
  minutesInput.value = minutes;
  secondsInput.value = 0;

  timerSeconds = minutes * 60;
  timerTotalSeconds = timerSeconds;

  updateDisplay();
}

function playFinishSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchMode(tab.dataset.mode));
});

[startBtn, pauseBtn, resetBtn, lapBtn, clearLapsBtn, themeBtn].forEach((button) => {
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter") button.click();
  });
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);

lapBtn.addEventListener("click", addLap);
clearLapsBtn.addEventListener("click", () => {
  lapsList.innerHTML = "";
});

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => setPreset(Number(button.dataset.minutes)));
});

[hoursInput, minutesInput, secondsInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (mode === "timer" && !isRunning) {
      timerSeconds = getTimerInputSeconds();
      timerTotalSeconds = timerSeconds;
      updateDisplay();
    }
  });
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
});

updateDisplay();
