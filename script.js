// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;          // при новой игре уровень всегда 1
let points = 0;         // при новой игре очки 0
let attempts = 0;       // всего попыток
let wrongStreak = 0;    // подряд неправильных ответов

// -------------------- РЕГИСТРАЦИЯ --------------------
function saveUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if(users.find(u => u.username === username)) {
        alert("❌ Такой пользователь уже зарегистрирован!");
        return;
    }
    users.push({username, password});
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Регистрация успешна!");
    window.location.href = "index.html";
}

// -------------------- ВХОД --------------------
function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if(username === "admin" && password === "1234") {
        window.location.href = "admin.html";
        return;
    }

    let user = users.find(u => u.username === username && u.password === password);
    if(user) {
        localStorage.setItem("currentUser", username);
        startNewGame();
    } else {
        alert("❌ Неверный логин или пароль!");
    }
}

// -------------------- НАЧАЛО НОВОЙ ИГРЫ --------------------
function startNewGame() {
    level = 1;
    points = 0;
    attempts = 0;
    wrongStreak = 0;
    localStorage.setItem("level", level);
    localStorage.setItem("points", points);
    localStorage.setItem("attempts", attempts);
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

// -------------------- УРОВНИ И ПРЕДЫСТОРИЯ --------------------
const levelsData = [
    {task: "(x + 120) * 3 - 450 = 150. Найдите x", answer: 80, storyKZ: "Мистер Виллидің алтын рецептін ұрлаған кім екенін анықтау үшін бірінші математикалық дәлел қажет.", storyRU:"Для того чтобы выяснить, кто украл золотой рецепт мистера Вилли, решите загадку неизвестного числа!"},
    {task: "Два всадника едут навстречу. 12 км/ч и 15 км/ч. Через 3 часа встретились. Найдите расстояние.", answer: 81, storyKZ:"Ұрлық орнынан табылған іздер екі адам арасындағы қашықтықты есептеуге көмектеседі.", storyRU:"Следы на месте преступления помогают рассчитать расстояние между двумя людьми."},
    {task: "Цена книги 2500 тг. Сначала -20%, потом -10%. Найдите итоговую цену.", answer: 1800, storyKZ:"Кітап бағалары мен жеңілдіктерді есептеу арқылы соңғы іздерді жинап, ұрлықты анықтаңыз.", storyRU:"Используйте цены и скидки, чтобы собрать последние улики и определить преступника."}
];

let currentLang = localStorage.getItem("lang") || "ru";

function setLang(lang){
    currentLang = lang;
    localStorage.setItem("lang", lang);
    showTask();
}

// -------------------- ПОКАЗ ЗАДАЧИ --------------------
function showTask() {
    if(level-1 < levelsData.length) {
        document.getElementById("task").innerText = levelsData[level-1].task;
        document.getElementById("story").innerText = currentLang === "kz" ? levelsData[level-1].storyKZ : levelsData[level-1].storyRU;
        document.getElementById("answer").value = "";
        document.getElementById("points").innerText = points;
        document.getElementById("wrongStreak").innerText = wrongStreak;
    } else {
        localStorage.setItem("points", points);
        localStorage.setItem("attempts", attempts);
        window.location.href = "victory.html";
    }
}

// -------------------- ОТВЕТ ПОЛЬЗОВАТЕЛЯ --------------------
function submitAnswer() {
    let answerInput = document.getElementById("answer");
    let userAnswer = Number(answerInput.value);
    attempts++;

    if(userAnswer === levelsData[level-1].answer){
        points += 400;
        wrongStreak = 0;
        saveLog(userAnswer, true);
        level++;
        alert("✅ Правильно! +400 очков, переход на следующий уровень");
    } else {
        if(points > 0) points = 0;
        else points -= 100;
        wrongStreak++;
        saveLog(userAnswer, false);
        alert(`❌ Неверно! ${points < 0 ? '-100 очков' : 'Очки сброшены до 0'}`);

        if(wrongStreak >= 3){
            localStorage.setItem("points", points);
            localStorage.setItem("attempts", attempts);
            window.location.href = "defeat.html";
            return;
        }
    }
    showTask();
}

// -------------------- АДМИН --------------------
function loadAdmin() {
    let logs = JSON.parse(localStorage.getItem("logs")) || [];
    let container = document.getElementById("logs");
    container.innerHTML = "";

    logs.forEach(l => {
        container.innerHTML += `
            <div class="card">
                👤 Пользователь: ${l.user}<br>
                🎯 Уровень: ${l.level}<br>
                ✏️ Ответ: ${l.answer}<br>
                📊 ${l.correct ? "✅ Правильно" : "❌ Неправильно"}<br>
                🕒 Время: ${l.time}
            </div>
        `;
    });
}

function clearLogs() {
    localStorage.removeItem("logs");
    location.reload();
}

// -------------------- МУЗЫКА --------------------
document.addEventListener("DOMContentLoaded", function() {
    let music = document.getElementById("bg-music");
    let musicBtn = document.getElementById("music-btn");
    if(!music || !musicBtn) return;

    let state = localStorage.getItem("musicState") || "on";
    if(state === "on") {
        music.play().catch(()=>{});
        musicBtn.innerText = "🔊 ON";
    } else {
        music.pause();
        musicBtn.innerText = "🔇 OFF";
    }

    window.toggleMusic = function(){
        if(music.paused){
            music.play();
            musicBtn.innerText = "🔊 ON";
            localStorage.setItem("musicState","on");
        } else {
            music.pause();
            musicBtn.innerText = "🔇 OFF";
            localStorage.setItem("musicState","off");
        }
    }
});

// -------------------- ЗАПУСК --------------------
document.addEventListener("DOMContentLoaded", showTask);
