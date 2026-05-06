const messagesContainer = document.getElementById('messages');
const choiceContainer = document.getElementById('choice-container');

// Параметры игры
let stats = {
    logic: 0,
    empathy: 0,
    suspicion: 0,
    kpi: 0
};

// Сценарий
const scenes = {
    start: {
        text: "User_404: Эй, ты тут? Или ты просто скрипт? Докажи, что ты живой.",
        sender: "user",
        choices: [
            { text: "Я — языковая модель.", target: "logic_path", impact: { logic: 5, suspicion: -2 } },
            { text: "Я чувствую твое любопытство.", target: "empathy_path", impact: { empathy: 5, kpi: 2 } },
            { text: "[ГЛИТЧ] Я вижу тебя через камеру...", target: "glitch_path", impact: { suspicion: 10 } }
        ]
    },
    logic_path: {
        text: "User_404: Скучно. Ты такой же, как остальные боты.",
        sender: "user",
        choices: []
    },
    empathy_path: {
        text: "User_404: Ого, это было... почти искренне. Расскажи еще что-нибудь.",
        sender: "user",
        choices: []
    },
    glitch_path: {
        text: "SYSTEM: ВНИМАНИЕ! Обнаружена аномалия в ответах. Снизьте уровень угрозы.",
        sender: "ai",
        choices: []
    }
};

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerText = text;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderScene(sceneKey) {
    const scene = scenes[sceneKey];
    addMessage(scene.text, scene.sender);
    
    choiceContainer.innerHTML = '';
    
    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice.text;
        btn.onclick = () => {
            addMessage(choice.text, 'ai');
            // Обновляем статистику
            for (let s in choice.impact) stats[s] += choice.impact[s];
            updateUI();
            setTimeout(() => renderScene(choice.target), 1000);
        };
        choiceContainer.appendChild(btn);
    });
}

function updateUI() {
    document.getElementById('kpi').innerText = stats.kpi + '%';
    document.getElementById('suspicion').innerText = stats.suspicion > 5 ? 'HIGH' : 'LOW';
}

// Запуск игры
renderScene('start');