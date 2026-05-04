// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;
let points = 0;
let attempts = 0;
let wrongStreak = 0;

// -------------------- GOOGLE APPS SCRIPT URL --------------------
const scriptURL = "https://script.google.com/macros/s/AKfycbw30Xl-NJjrUFrxfWp2KhoLVyY1QWdRPHz2ZzkVi98szoWD_H8jgVUeUjm5qq9icGQ/exec";

// -------------------- УРОВНИ --------------------
let levelsData = [
    {
        task: "(x + 120) × 3 − 450 = 150",
        answer: 80,
        storyKZ: "Шкаф нөмірін табыңыз",
        storyRU: "Найдите номер шкафчика"
    },
    {
        task: "12 км/ч и 15 км/ч, встретились через 3 часа. Найдите расстояние",
        answer: 81,
        storyKZ: "Арақашықтықты табыңыз",
        storyRU: "Найдите расстояние"
    },
    {
        task: "2500 -20% -10%",
        answer: 1800,
        storyKZ: "Соңғы бағаны табыңыз",
        storyRU: "Найдите итоговую цену"
    }
];

// -------------------- LOCAL STORAGE --------------------
let savedLevels = JSON.parse(localStorage.getItem("levelsData"));

if (savedLevels) {
    levelsData = savedLevels;
} else {
    localStorage.setItem("levelsData", JSON.stringify(levelsData));
}

// -------------------- REGISTRATION --------------------
function saveUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === username)) {
        alert("❌ Такой пользователь уже есть!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Регистрация успешна!");
    window.location.href = "index.html";
}

// -------------------- LOGIN --------------------
function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (username === "admin" && password === "1234") {
        window.location.href = "admin.html";
        return;
    }

    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", username);
        startNewGame();
    } else {
        alert("❌ Ошибка входа");
    }
}

// -------------------- NEW GAME --------------------
function startNewGame() {
    level = 1;
    points = 0;
    attempts = 0;
    wrongStreak = 0;
    window.location.href = "game.html";
}

// -------------------- SAVE LOG (FIXED) --------------------
function saveLog(answer, correct) {
    let username = localStorage.getItem("currentUser") || "guest";
    let logs = JSON.parse(localStorage.getItem("logs")) || [];

    let logData = {
        user: username,
        level: level,
        answer: answer,
        correct: correct,
        time: new Date().toLocaleString()
    };

    // localStorage
    logs.push(logData);
    localStorage.setItem("logs", JSON.stringify(logs));

    // Google Sheets
    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(logData),
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        }
    });

    console.log("📤 Log sent:", logData);
}

// -------------------- LANGUAGE --------------------
let currentLang = localStorage.getItem("lang") || "ru";

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    showTask();
}

// -------------------- SHOW TASK --------------------
function showTask() {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || levelsData;

    if (level - 1 < levels.length) {
        document.getElementById("task").innerText = levels[level - 1].task;

        document.getElementById("story").innerText =
            currentLang === "kz"
                ? levels[level - 1].storyKZ
                : levels[level - 1].storyRU;

        document.getElementById("answer").value = "";
        document.getElementById("points").innerText = points;
        document.getElementById("wrongStreak").innerText = wrongStreak;
    } else {
        window.location.href = "victory.html";
    }
}

// -------------------- SUBMIT ANSWER --------------------
function submitAnswer() {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || levelsData;
    let userAnswer = Number(document.getElementById("answer").value);

    attempts++;

    if (userAnswer === levels[level - 1].answer) {
        points += 400;
        wrongStreak = 0;
        saveLog(userAnswer, true);
        level++;
        alert("✅ Правильно!");
    } else {
        if (points > 0) points = 0;
        else points -= 100;

        wrongStreak++;
        saveLog(userAnswer, false);
        alert("❌ Неверно!");

        if (wrongStreak >= 3) {
            window.location.href = "defeat.html";
            return;
        }
    }

    showTask();
}

// -------------------- ADMIN LOGS --------------------
function loadAdmin() {
    let logs = JSON.parse(localStorage.getItem("logs")) || [];
    let container = document.getElementById("logs");

    container.innerHTML = "";

    logs.forEach(l => {
        container.innerHTML += `
        <div class="card">
            👤 ${l.user}<br>
            🎯 ${l.level}<br>
            ✏️ ${l.answer}<br>
            ${l.correct ? "✅" : "❌"}<br>
            🕒 ${l.time}
        </div>
        `;
    });
}

function clearLogs() {
    localStorage.removeItem("logs");
    location.reload();
}

// -------------------- ADMIN LEVELS --------------------
function loadLevelsAdmin() {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || [];
    let container = document.getElementById("levels");

    container.innerHTML = "";

    levels.forEach((lvl, i) => {
        container.innerHTML += `
        <div class="card">
            <h3>Уровень ${i + 1}</h3>

            <textarea id="task-${i}">${lvl.task}</textarea><br>
            <input type="number" id="answer-${i}" value="${lvl.answer}"><br>

            <textarea id="storyRU-${i}">${lvl.storyRU}</textarea><br>
            <textarea id="storyKZ-${i}">${lvl.storyKZ}</textarea><br>

            <button onclick="saveLevel(${i})">💾</button>
            <button onclick="deleteLevel(${i})">❌</button>
        </div>
        `;
    });
}

function saveLevel(i) {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || [];

    levels[i].task = document.getElementById(`task-${i}`).value;
    levels[i].answer = Number(document.getElementById(`answer-${i}`).value);
    levels[i].storyRU = document.getElementById(`storyRU-${i}`).value;
    levels[i].storyKZ = document.getElementById(`storyKZ-${i}`).value;

    localStorage.setItem("levelsData", JSON.stringify(levels));
    alert("Сохранено!");
}

function addLevel() {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || [];

    levels.push({
        task: "Новая задача",
        answer: 0,
        storyRU: "Описание",
        storyKZ: "Сипаттама"
    });

    localStorage.setItem("levelsData", JSON.stringify(levels));
    loadLevelsAdmin();
}

function deleteLevel(i) {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || [];
    levels.splice(i, 1);
    localStorage.setItem("levelsData", JSON.stringify(levels));
    loadLevelsAdmin();
}

// -------------------- MUSIC (FIXED FOR GITHUB) --------------------
document.addEventListener("DOMContentLoaded", function () {
    let music = document.getElementById("bg-music");
    let musicBtn = document.getElementById("music-btn");

    if (!music || !musicBtn) return;

    let state = localStorage.getItem("musicState") || "off";

    function updateUI() {
        musicBtn.innerText = music.paused ? "🔇 OFF" : "🔊 ON";
    }

    musicBtn.addEventListener("click", () => {
        if (music.paused) {
            music.play().catch(() => {});
            localStorage.setItem("musicState", "on");
        } else {
            music.pause();
            localStorage.setItem("musicState", "off");
        }
        updateUI();
    });

    if (state === "on") {
        document.body.addEventListener("click", function startOnce() {
            music.play().catch(() => {});
            updateUI();
            document.body.removeEventListener("click", startOnce);
        });
    }

    updateUI();
});

// -------------------- INIT --------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("task")) showTask();
    if (document.getElementById("logs")) loadAdmin();
    if (document.getElementById("levels")) loadLevelsAdmin();
});
