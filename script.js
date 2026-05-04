// -------------------- FIREBASE --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDu2ioUgqEKB63EkiMrQ6w4NDbkFtoYuWk",
  authDomain: "aizana.firebaseapp.com",
  projectId: "aizana",
  storageBucket: "aizana.firebasestorage.app",
  messagingSenderId: "943216648093",
  appId: "1:943216648093:web:024cb57c57d15aef735974",
  measurementId: "G-Q0G5PPWBD8"
};

// init firebase (ТОЛЬКО ОДИН РАЗ!)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;
let points = 0;
let attempts = 0;
let wrongStreak = 0;


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

    let user = users.find(u => u.username === username && u.password === password);

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


// -------------------- ЛОГИ (FIREBASE) --------------------
function saveLog(answer, correct) {
    let username = localStorage.getItem("currentUser") || "guest";

    db.ref("logs").push({
        user: username,
        level: level,
        answer: answer,
        correct: correct,
        time: new Date().toLocaleString()
    });
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
        points = Math.max(0, points - 100);
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
    let container = document.getElementById("logs");

    db.ref("logs").on("value", snapshot => {
        container.innerHTML = "";

        let data = snapshot.val();

        for (let key in data) {
            let l = data[key];

            container.innerHTML += `
                <div class="card">
                    👤 ${l.user}<br>
                    🎯 ${l.level}<br>
                    ✏️ ${l.answer}<br>
                    ${l.correct ? "✅" : "❌"}<br>
                    🕒 ${l.time}
                </div>
            `;
        }
    });
}


// -------------------- УРОВНИ АДМИН --------------------
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
            </div>
        `;
    });
}


// -------------------- ЗАПУСК --------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("task")) showTask();
    if (document.getElementById("logs")) loadAdmin();
    if (document.getElementById("levels")) loadLevelsAdmin();
});


// -------------------- МУЗЫКА --------------------
let music = document.getElementById("bg-music");
let isPlaying = false;

function toggleMusic() {
    let btn = document.getElementById("music-btn");

    if (!isPlaying) {
        music.volume = 0.5;

        music.play().then(() => {
            isPlaying = true;
            btn.innerText = "🔊 OFF";
        });

    } else {
        music.pause();
        isPlaying = false;
        btn.innerText = "🔊 ON";
    }
}


// автозапуск после первого клика
document.addEventListener("click", function startMusicOnce() {
    if (!isPlaying && music) {
        music.volume = 0.3;
        music.play();
        isPlaying = true;

        let btn = document.getElementById("music-btn");
        if (btn) btn.innerText = "🔊 OFF";
    }

    document.removeEventListener("click", startMusicOnce);
});
