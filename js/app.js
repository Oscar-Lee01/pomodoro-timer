
const Timer = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const pomoCircle = document.querySelector(".pomo-ring-circle");

// Sessions
const sessionLabel = document.getElementById("sessionLabel");
const sessionCounter = document.getElementById("sessionCount");
const sessionDots = document.querySelectorAll(".dot");

// Settings inputs
const workInput = document.getElementById("workInput");
const shortInput = document.getElementById("shortInput");
const longInput = document.getElementById("longInput");


// STATE VARIABLES
let workDuration = parseInt(workInput.value) * 60; // 60 seconds
let shortBreak = parseInt(shortInput.value) * 60;
let longBreak = parseInt(longInput.value) * 60;

let timer = null; // interval reference
let timeLeft = workDuration; // current countdown
let isRunning = false; // timer state
let currentSession = "Work"; // Work / Short Break / Long Break
let completedWorkSessions = 0; // session counter


// POMO RING SETUP
const radius = 100;
const circumference = 2 * Math.PI * radius;

pomoCircle.style.strokeDasharray = circumference;
pomoCircle.style.strokeDashoffset = circumference;


// AUDIO NOTIFICATION
const endSound = new Audio("./sounds/sword-swoosh.mp3");
const startSound = new Audio("./sounds/service-bell.wav");


// MAIN FUNCTIONS

// Format seconds to mm:ss
function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2,"0")}`;
}

// Update the timer display
function updateTimerDisplay() {
    Timer.textContent = formatTime(timeLeft);

    const totalDuration = 
    currentSession === "Work"
    ? workDuration
    : currentSession === "Short Break"
    ? shortBreak
    : longBreak;

    const pomoProgress = timeLeft / totalDuration;

    const offset = circumference * (1 - pomoProgress);

    pomoCircle.style.strokeDashoffset = offset;

    updatePageTitle();
}

// Update session label
function updateSessionLabel() {
    sessionLabel.textContent = `${currentSession} Session`;
}

// Update session count
function updateSessionCount() {
    sessionCounter.textContent = completedWorkSessions;

    updateSessionDots();
}

// Save settings with local storage
function saveSettings() {

    const settings = {
        work: workInput.value,
        short: shortInput.value,
        long: longInput.value
    };

    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));

}

// Load saved settings when app starts
function loadSettings() {

    const saved = localStorage.getItem("pomodoroSettings");

    if (!saved) return;

    const settings = JSON.parse(saved);

    workInput.value = settings.work;
    shortInput.value = settings.short;
    longInput.value = settings.long;

    workDuration = settings.work * 60;
    shortBreak = settings.short * 60;
    longBreak = settings.long * 60;

    timeLeft = workDuration;
}

// Reset function
function resetRing(totalDuration) {
    pomoCircle.style.transition = "none";
    pomoCircle.style.strokeDashoffset = circumference;

    // Force Browser to apply change
    pomoCircle.getBoundingClientRect();

    // Re-enable animation
    pomoCircle.style.transition = "stroke-dashoffset 0.5s linear";
}

// Session dots update function
function updateSessionDots() {

    sessionDots.forEach((dot, index) => {

        if (index < (completedWorkSessions % 4)) {
            dot.classList.add("active");
        } 
        else {
            dot.classList.remove("active");
        }

    });

}

// Update browser tab title with timer
function updatePageTitle() {

    const formatted = formatTime(timeLeft);
    document.title = `${formatted} - ${currentSession}`;
}


// TIMER CONTROL FUNCTIONS

// Start or resume timer
function startTimer() {
    if (isRunning) return; // prevent multiple intervals
    isRunning = true;

    document.body.classList.add("timer-running");


    // play start sound
    startSound.currentTime = 0;
    startSound.play().catch(() => {});
    startSound.volume = 0.5;

    timer = setInterval(() => {
        timeLeft--;

        // Update UI each second
        updateTimerDisplay();

        // Timer finished
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;

            endSound.currentTime = 0;
            endSound.play().catch(() => {}); // play notification sound
            endSound.volume = 0.5;

            handleSessionEnd();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timer);
    isRunning = false;

    document.body.classList.remove("timer-running");

}

// Reset timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;

    document.body.classList.remove("timer-running");

    // Reset current session
    switch (currentSession) {
        case "Work":
            timeLeft = workDuration;
            break;
        case "Short Break":
            timeLeft = shortBreak;
            break;
        case "Long Break":
            timeLeft = longBreak;
            break;
    }

    resetRing();
    updateTimerDisplay();
}


// SESSION MANAGEMENT FUNCTIONS

function handleSessionEnd() {
    if (currentSession === "Work") {
        completedWorkSessions++;
        updateSessionCount();

        // After 4 work sessions → Long Break
        if (completedWorkSessions % 4 === 0) {
            currentSession = "Long Break";
            timeLeft = longBreak;
        } else {
            currentSession = "Short Break";
            timeLeft = shortBreak;
        }
    } else {
        // After break → always go back to Work
        currentSession = "Work";
        timeLeft = workDuration;
    }

    updateSessionLabel();
    updateTimerDisplay();
    resetRing();
    startTimer(); // automatically start next session
}


// HANDLING SETTINGS INPUT

// When user changes any input, update durations
workInput.addEventListener("change", () => {
    workDuration = parseInt(workInput.value) * 60;
    if (currentSession === "Work") {
        timeLeft = workDuration;
        updateTimerDisplay();
    }
});

shortInput.addEventListener("change", () => {
    shortBreak = parseInt(shortInput.value) * 60;
    if (currentSession === "Short Break") {
        timeLeft = shortBreak;
        updateTimerDisplay();
    }
});

longInput.addEventListener("change", () => {
    longBreak = parseInt(longInput.value) * 60;
    if (currentSession === "Long Break") {
        timeLeft = longBreak;
        updateTimerDisplay();
    }
});


// BUTTON EVENT LISTENERS

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Connect the save button 
document.getElementById("saveBtn").addEventListener("click", () => {

    saveSettings();

    workDuration = parseInt(workInput.value) * 60;
    shortBreak = parseInt(shortInput.value) * 60;
    longBreak = parseInt(longInput.value) * 60;
    
    if (currentSession === "Work") {
        timeLeft = workDuration;
    }
    else if (currentSession === "Short Break") {
        timeLeft = shortBreak;
    }
    else {
        timeLeft = longBreak;
    }

    updateTimerDisplay();

    // alert("Settings saved!");

});


// KEYBOARD SHORTCUTS

document.addEventListener("keydown", (e) => {

    //Prevent spacebar from scrolling, start/pause timer
    if (e.code === "Space") {
        e.preventDefault();

        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
});


// INITIAL UI SETUP

loadSettings();
updateTimerDisplay();
updateSessionLabel();
updateSessionCount();
updatePageTitle();
