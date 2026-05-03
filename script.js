// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;
let points = 0;
let attempts = 0;
let wrongStreak = 0;

// -------------------- УРОВНИ (БАЗА) --------------------
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

// -------------------- ПОДГРУЗКА ИЗ localStorage --------------------
let savedLevels = JSON.parse(localStorage.getItem("levelsData"));

if (savedLevels) {
    levelsData = savedLevels;
} else {
    localStorage.setItem("levelsData", JSON.stringify(levelsData));
}

// -------------------- РЕГИСТРАЦИЯ --------------------
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

// -------------------- ВХОД --------------------
function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (username === "admin" && password === "1234") {
        window.location.href = "admin.html";
        return;
    }

    let user = users.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        localStorage.setItem("currentUser", username);
        startNewGame();
    } else {
        alert("❌ Ошибка входа");
    }
}

// -------------------- НОВАЯ ИГРА --------------------
function startNewGame() {
    level = 1;
    points = 0;
    attempts = 0;
    wrongStreak = 0;

    window.location.href = "game.html";
}

// -------------------- ЛОГИ --------------------
function saveLog(answer, correct) {
    let username = localStorage.getItem("currentUser") || "guest";
    let logs = JSON.parse(localStorage.getItem("logs")) || [];

    logs.push({
        user: username,
        level: level,
        answer: answer,
        correct: correct,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("logs", JSON.stringify(logs));
}

// -------------------- ЯЗЫК --------------------
let currentLang = localStorage.getItem("lang") || "ru";

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    showTask();
}

// -------------------- ПОКАЗ ЗАДАЧ --------------------
function showTask() {
    let levels = JSON.parse(localStorage.getItem("levelsData")) || levelsData;

    if (level - 1 < levels.length) {
        document.getElementById("task").innerText =
            levels[level - 1].task;

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

// -------------------- ОТВЕТ --------------------
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
        if (points > 0) {
            points = 0;
        } else {
            points -= 100;
        }

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

// -------------------- АДМИН: ЛОГИ --------------------
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

// -------------------- АДМИН: УРОВНИ --------------------
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

// -------------------- МУЗЫКА --------------------
document.addEventListener("DOMContentLoaded", function () {
    let music = document.getElementById("bg-music");
    let musicBtn = document.getElementById("music-btn");

    if (!music || !musicBtn) return;

    let state = localStorage.getItem("musicState") || "on";

    if (state === "on") {
        music.play().catch(() => {});
        musicBtn.innerText = "🔊 ON";
    } else {
        music.pause();
        musicBtn.innerText = "🔇 OFF";
    }

    window.toggleMusic = function () {
        if (music.paused) {
            music.play();
            musicBtn.innerText = "🔊 ON";
            localStorage.setItem("musicState", "on");
        } else {
            music.pause();
            musicBtn.innerText = "🔇 OFF";
            localStorage.setItem("musicState", "off");
        }
    };
});

// -------------------- ЗАПУСК --------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("task")) showTask();
    if (document.getElementById("logs")) loadAdmin();
    if (document.getElementById("levels")) loadLevelsAdmin();
});
