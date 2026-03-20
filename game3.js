const DATA = [
    { id: 'svojsik', name: 'Antonín Benjamin Svojsík', photo: 'images/Antonín_Benjamin_Svojsík.jpg', text: 'Zakladatel českého junáctví' },
    { id: 'foglar',  name: 'Jaroslav Foglar',           photo: 'images/Jaroslav-Foglar.jpeg',          text: 'Spisovatel a významná osobnost českého skautingu' },
    { id: 'olave',   name: 'Olave Baden-Powell',        photo: 'images/Olave-Baden-Powell.jpg',        text: 'Spoluzakladatelka Světového sdružení skautek' },
    { id: 'petr',    name: 'Petr Pavel',                photo: 'images/Petr_Pavel.jpg',                text: 'Současný prezident ČR' },
    { id: 'robert',  name: 'Robert Baden-Powell',       photo: 'images/Robert_Baden-Powell.png',       text: 'Zakladatel skautingu ve světě' },
    { id: 'jiri',    name: 'Svatý Jiří',                photo: 'images/Sv-Jiří.jpg',                   text: 'Patron skautů a skautek' },
    { id: 'masaryk', name: 'Tomáš Garrigue Masaryk',    photo: 'images/Tomáš_Garrigue_Masaryk.png',    text: 'První československý prezident' },
    { id: 'havel',   name: 'Václav Havel',              photo: 'images/Václav_Havel.jpg',              text: 'První český prezident' },
];

const SCOUT_PHRASES = [
    '🌲 Buď připraven!',
    '⚜️ Vždy připraven!',
    '🍀 Jeden za všechny!',
    '🌿 Miluj přírodu!',
    '⭐ Dobrý skutek každý den!',
    '🏕️ Skaut pomáhá druhým!',
    '🦔 Skaut je přítelem zvířat!',
    '🌟 Čest skautovi!',
    '🔥 U táboráku je nejlépe!',
    '🐦 Příroda je náš domov!',
    '🌙 Pod hvězdami spíme nejlíp!',
    '🎒 Skauti neztrácejí cestu!',
];

// stav hry
let questionOrder = [];
let currentQ      = 0;
let photoScore    = 0;  // počet správně zodpovězených fotek
let textScore     = 0;  // počet správně zodpovězených textů
let currentPhotoCorrect = false;
let answered      = false;

const STORAGE_KEY = 'skaut-cast1';

function saveGameState(nextQ) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        questionOrder,
        currentQ: nextQ,
        photoScore,
        textScore,
        results: [..._questionResults],
    }));
}

function clearGameState() {
    localStorage.removeItem(STORAGE_KEY);
}

// ── SHUFFLE ──────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── SCREENS ──────────────────────────────────────────────────────

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// ── INIT ─────────────────────────────────────────────────────────

function init() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const s = JSON.parse(raw);
            if (s.questionOrder && s.currentQ > 0) {
                questionOrder = s.questionOrder;
                currentQ      = s.currentQ;
                photoScore    = s.photoScore;
                textScore     = s.textScore;
                s.results.forEach((v, i) => { _questionResults[i] = v; });
                answered = false;
                showScreen('screen-quiz');
                renderStars();
                showPhotoPhase(currentQ);
                return;
            }
        }
    } catch (e) {}
    questionOrder = shuffle(DATA.map(p => p.id));
    currentQ      = 0;
    photoScore    = 0;
    textScore     = 0;
    answered      = false;
    showScreen('screen-intro');
}

// ── START ─────────────────────────────────────────────────────────

function startGame() {
    showScreen('screen-quiz');
    renderStars();
    showPhotoPhase(0);
}

// ── STARS ─────────────────────────────────────────────────────────

function renderStars() {
    const row = document.getElementById('stars-row');
    row.innerHTML = '';
    for (let i = 0; i < DATA.length; i++) {
        const span = document.createElement('span');
        span.className = 'star-slot';
        span.textContent = '⭐';
        row.appendChild(span);
    }
    updateStarDisplay();
}

function updateStarDisplay() {
    // Hvězdička svítí, pokud je otázka i=currentQ dokončena a obě části správně
    // Jednodušeji: zobrazujeme počet hvězdiček = počet otázek kde OBOJE správně
    const fullyCorrect = DATA.filter((_, i) => {
        if (i >= currentQ) return false;
        return questionOrder[i] && _questionResults[i];
    }).length;
    document.querySelectorAll('.star-slot').forEach((el, i) => {
        el.classList.toggle('earned', i < fullyCorrect);
    });
    document.getElementById('question-counter').textContent =
        `Otázka ${currentQ + 1} z ${DATA.length}`;
}

// Pole výsledků pro každou otázku: null | true | false
const _questionResults = new Array(DATA.length).fill(null);

// ── FÁZE 1: FOTKA ────────────────────────────────────────────────

function showPhotoPhase(index) {
    answered = false;
    currentQ = index;
    currentPhotoCorrect = false;

    const id = questionOrder[index];
    const p  = DATA.find(x => x.id === id);

    document.getElementById('quiz-phase-label').textContent = `Krok 1 ze 2 – fotografie`;
    document.getElementById('quiz-name').textContent = p.name;
    document.getElementById('phase-photo').classList.remove('hidden');
    document.getElementById('phase-text').classList.add('hidden');

    document.getElementById('question-counter').textContent =
        `Otázka ${index + 1} z ${DATA.length}`;

    // 4 možnosti: správná + 3 náhodné špatné
    const wrong   = shuffle(DATA.filter(x => x.id !== id)).slice(0, 3);
    const options = shuffle([p, ...wrong]);

    const grid = document.getElementById('photo-options-grid');
    grid.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'photo-option-btn';
        btn.dataset.id = opt.id;
        const img = document.createElement('img');
        img.src = opt.photo;
        img.alt = opt.name;
        btn.appendChild(img);
        btn.addEventListener('click', () => handlePhotoAnswer(opt.id, id));
        grid.appendChild(btn);
    });

    animateCardIn();
}

function handlePhotoAnswer(selectedId, correctId) {
    if (answered) return;
    answered = true;

    const buttons = document.querySelectorAll('.photo-option-btn');
    buttons.forEach(btn => btn.disabled = true);

    const correct = selectedId === correctId;
    currentPhotoCorrect = correct;
    if (correct) photoScore++;

    // zvýraznění přes data-id
    buttons.forEach(btn => {
        if (btn.dataset.id === correctId) btn.classList.add('correct');
        else if (!correct && btn.dataset.id === selectedId) btn.classList.add('wrong');
    });

    if (!correct) {
        shakeCard();
    }

    setTimeout(() => {
        showTextPhase(currentQ);
        document.getElementById('options-grid').scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, correct ? 800 : 1300);
}

// ── FÁZE 2: TEXT ─────────────────────────────────────────────────

function showTextPhase(index) {
    answered = false;

    const id = questionOrder[index];
    const p  = DATA.find(x => x.id === id);

    document.getElementById('quiz-phase-label').textContent = `Krok 2 ze 2 – popis`;

    // Nejdřív vyčistit obsah, pak zobrazit – žádný záblesk starých tlačítek
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    document.getElementById('phase-photo').classList.add('hidden');
    document.getElementById('phase-text').classList.remove('hidden');

    const wrong   = shuffle(DATA.filter(x => x.id !== id)).slice(0, 3);
    const options = shuffle([p, ...wrong]);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => handleTextAnswer(opt.id, id));
        grid.appendChild(btn);
    });

    animateCardIn();
}

function handleTextAnswer(selectedId, correctId) {
    if (answered) return;
    answered = true;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    const correct = selectedId === correctId;
    if (correct) textScore++;

    // Obě části správně = hvězdička
    _questionResults[currentQ] = currentPhotoCorrect && correct;

    buttons.forEach(btn => {
        const p = DATA.find(x => x.text === btn.textContent);
        if (p && p.id === correctId) btn.classList.add('correct');
        else if (p && p.id === selectedId && !correct) btn.classList.add('wrong');
    });

    if (!correct) shakeCard();

    // Aktualizuj hvězdičku pro tuto otázku
    if (currentPhotoCorrect && correct) {
        const stars = document.querySelectorAll('.star-slot');
        const earnedCount = _questionResults.filter(Boolean).length;
        stars.forEach((el, i) => el.classList.toggle('earned', i < earnedCount));
    }

    setTimeout(() => {
        // Vyčistit text tlačítka před přechodem na další fotky
        document.getElementById('options-grid').innerHTML = '';
        document.getElementById('phase-text').classList.add('hidden');

        if (currentQ + 1 >= DATA.length) {
            clearGameState();
            showResult();
        } else {
            saveGameState(currentQ + 1);
            showPhotoPhase(currentQ + 1);
            document.getElementById('quiz-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 1000);
}

// ── ANIMACE KARTY ─────────────────────────────────────────────────

function animateCardIn() {
    const card = document.getElementById('quiz-card');
    card.classList.remove('animate-in', 'animate-shake');
    void card.offsetWidth;
    card.classList.add('animate-in');
}

function shakeCard() {
    const card = document.getElementById('quiz-card');
    card.classList.remove('animate-shake');
    void card.offsetWidth;
    card.classList.add('animate-shake');
}

// ── VÝSLEDEK ──────────────────────────────────────────────────────

function showResult() {
    showScreen('screen-result');

    const fullyCorrect = _questionResults.filter(Boolean).length;
    const total        = photoScore + textScore;
    const maxTotal     = DATA.length * 2;

    const fires = fullyCorrect >= 7 ? '🔥🔥🔥' : fullyCorrect >= 5 ? '🔥🔥' : fullyCorrect >= 3 ? '🔥' : '🕯️';
    document.getElementById('result-campfire').textContent = fires;

    document.getElementById('result-stars').textContent =
        '⭐'.repeat(fullyCorrect) + '☆'.repeat(DATA.length - fullyCorrect);

    let title, msg;
    if (fullyCorrect === DATA.length) {
        title = '🏆 Skautský mistr!';
        msg   = `Perfektní! ${total} z ${maxTotal} bodů. Znáš všechny skautské osobnosti dokonale!`;
        launchConfetti();
    } else if (fullyCorrect >= 6) {
        title = '🌟 Skvělý skaut!';
        msg   = `${total} z ${maxTotal} bodů — skoro dokonalé! Ještě trochu trénovat!`;
    } else if (fullyCorrect >= 4) {
        title = '🍀 Dobrý skaut!';
        msg   = `${total} z ${maxTotal} bodů — dobrý začátek. Zkus to ještě jednou!`;
    } else {
        title = '🌱 Skaut začátečník';
        msg   = `${total} z ${maxTotal} bodů. Nevadí, každý někde začíná! Zkus to znovu!`;
    }

    document.getElementById('result-title').textContent = title;
    document.getElementById('result-msg').textContent   = msg;
}

// ── KONFETY ───────────────────────────────────────────────────────

function launchConfetti() {
    const colors = ['#f0c040','#60d060','#e04040','#4080ff','#ff80c0','#80ffff'];
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.left              = (Math.random() * 100) + 'vw';
            el.style.background        = colors[Math.floor(Math.random() * colors.length)];
            el.style.width             = (8 + Math.random() * 8) + 'px';
            el.style.height            = (8 + Math.random() * 8) + 'px';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            el.style.animationDelay    = (Math.random() * 0.5) + 's';
            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove());
        }, i * 40);
    }
}

// ── TISK ──────────────────────────────────────────────────────────

document.getElementById('btn-print-result').addEventListener('click', () => {
    const grid = document.getElementById('print-grid');
    grid.innerHTML = '';
    DATA.forEach(p => {
        const card = document.createElement('div');
        card.className = 'print-card';
        const img  = document.createElement('img');
        img.src    = p.photo;
        img.alt    = p.name;
        const name = document.createElement('div');
        name.className   = 'print-name';
        name.textContent = p.name;
        const text = document.createElement('div');
        text.className   = 'print-text';
        text.textContent = p.text;
        card.append(img, name, text);
        grid.appendChild(card);
    });
    const images = grid.querySelectorAll('img');
    Promise.all(Array.from(images).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
    )).then(() => window.print());
});

// ── VEVERKA ───────────────────────────────────────────────────────

function scheduleSquirrel() {
    const delay = 10000 + Math.random() * 15000;
    setTimeout(runSquirrel, delay);
}

function runSquirrel() {
    const sq     = document.getElementById('squirrel');
    const bubble = document.getElementById('squirrel-bubble');
    const ltr    = Math.random() > 0.5;
    const phrase = SCOUT_PHRASES[Math.floor(Math.random() * SCOUT_PHRASES.length)];
    const stopX  = window.innerWidth * (0.35 + Math.random() * 0.3); // zastaví se někde uprostřed

    // Výchozí pozice
    sq.style.transition = 'none';
    sq.style.opacity    = '1';
    sq.style.transform  = ltr ? 'scaleX(1)' : 'scaleX(-1)';
    sq.style.left       = ltr ? '-80px' : (window.innerWidth + 80) + 'px';

    // Fáze 1: běh k zastávce (~3 s)
    requestAnimationFrame(() => {
        sq.style.transition = 'left 3s linear';
        sq.style.left       = stopX + 'px';
    });

    // Fáze 2: zastávka + bublina
    setTimeout(() => {
        sq.style.transition = 'none';

        bubble.textContent    = phrase;
        bubble.style.left     = Math.min(stopX, window.innerWidth - 220) + 'px';
        bubble.style.display  = 'block';
        // reset animace
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.style.animation = '';

        // Fáze 3: bublina zmizí, veverka doběhne
        setTimeout(() => {
            bubble.style.display = 'none';

            sq.style.transition = 'left 3s linear';
            sq.style.left       = ltr ? (window.innerWidth + 80) + 'px' : '-80px';

            setTimeout(() => {
                sq.style.opacity    = '0';
                sq.style.transition = 'none';
                scheduleSquirrel();
            }, 3000);
        }, 2500);
    }, 3100); // čeká na doběhnutí k zastávce
}

// ── SVĚTLUŠKY ─────────────────────────────────────────────────────

function createFireflies() {
    const container = document.getElementById('fireflies');
    for (let i = 0; i < 10; i++) {
        const ff = document.createElement('div');
        ff.className = 'firefly';
        ff.style.left              = (Math.random() * 90 + 5)  + 'vw';
        ff.style.top               = (Math.random() * 50 + 5)  + 'vh';
        ff.style.animationDuration = (3 + Math.random() * 5)   + 's';
        ff.style.animationDelay    = (Math.random() * 6)        + 's';
        container.appendChild(ff);
    }
}

// ── SOVA ──────────────────────────────────────────────────────────

function scheduleBird() {
    setTimeout(() => {
        const bird = document.getElementById('bird');
        bird.className = 'bird flying';
        bird.addEventListener('animationend', () => {
            bird.className = 'bird';
            scheduleBird();
        }, { once: true });
    }, 15000 + Math.random() * 20000);
}

// ── BOOT ──────────────────────────────────────────────────────────

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-play-again').addEventListener('click', () => {
    _questionResults.fill(null);
    clearGameState();
    init();
});

document.getElementById('btn-restart').addEventListener('click', () => {
    _questionResults.fill(null);
    clearGameState();
    init();
});

createFireflies();
scheduleSquirrel();
scheduleBird();
init();
