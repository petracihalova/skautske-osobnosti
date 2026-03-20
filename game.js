const DATA = [
    { id: 'svojsik', name: 'Antonín Benjamin Svojsík', photo: 'images/Antonín_Benjamin_Svojsík.jpg', text: 'Zakladatel českého junáctví' },
    { id: 'foglar',  name: 'Jaroslav Foglar',          photo: 'images/Jaroslav-Foglar.jpeg',          text: 'Spisovatel a významná osobnost českého skautingu' },
    { id: 'olave',   name: 'Olave Baden-Powell',       photo: 'images/Olave-Baden-Powell.jpg',        text: 'Spoluzakladatelka Světového sdružení skautek' },
    { id: 'petr',    name: 'Petr Pavel',                photo: 'images/Petr_Pavel.jpg',                text: 'Současný prezident ČR' },
    { id: 'robert',  name: 'Robert Baden-Powell',      photo: 'images/Robert_Baden-Powell.png',       text: 'Zakladatel skautingu ve světě' },
    { id: 'jiri',    name: 'Svatý Jiří',               photo: 'images/Sv-Jiří.jpg',                   text: 'Patron skautů a skautek' },
    { id: 'masaryk', name: 'Tomáš Garrigue Masaryk',   photo: 'images/Tomáš_Garrigue_Masaryk.png',    text: 'První československý prezident' },
    { id: 'havel',   name: 'Václav Havel',             photo: 'images/Václav_Havel.jpg',              text: 'První český prezident' },
];

// slots[cardId] = { photo: personId | null, text: personId | null }
let slots = {};
let selectedPhoto = null; // personId
let selectedText  = null; // personId
let cardOrder = [];
let photoOrder = [];
let textOrder  = [];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function init() {
    slots = {};
    DATA.forEach(p => { slots[p.id] = { photo: null, text: null }; });
    selectedPhoto = null;
    selectedText  = null;
    cardOrder = shuffle(DATA.map(p => p.id));
    photoOrder = shuffle(DATA.map(p => p.id));
    textOrder  = shuffle(DATA.map(p => p.id));
    render();
    document.getElementById('result').className = 'result';
    document.getElementById('btn-print').disabled = true;
}

function render() {
    renderPhotoPool();
    renderTextPool();
    renderCards();
    updateCheckBtn();
}

function renderPhotoPool() {
    const pool = document.getElementById('photo-pool');
    pool.innerHTML = '';
    const placed = new Set(Object.values(slots).map(s => s.photo).filter(Boolean));
    photoOrder.forEach(id => {
        const p = DATA.find(x => x.id === id);
        if (placed.has(p.id)) return;
        const img = document.createElement('img');
        img.src = p.photo;
        img.alt = p.name;
        img.className = 'pool-photo' + (selectedPhoto === p.id ? ' selected' : '');
        img.dataset.id   = p.id;
        img.dataset.type = 'photo';
        addDragAndTap(img, p.id, 'photo');
        pool.appendChild(img);
    });
}

function renderTextPool() {
    const pool = document.getElementById('text-pool');
    pool.innerHTML = '';
    const placed = new Set(Object.values(slots).map(s => s.text).filter(Boolean));
    textOrder.forEach(id => {
        const p = DATA.find(x => x.id === id);
        if (placed.has(p.id)) return;
        const div = document.createElement('div');
        div.className = 'pool-text' + (selectedText === p.id ? ' selected' : '');
        div.textContent = p.text;
        div.dataset.id   = p.id;
        div.dataset.type = 'text';
        addDragAndTap(div, p.id, 'text');
        pool.appendChild(div);
    });
}

function renderCards() {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';
    cardOrder.forEach(id => {
        const p = DATA.find(x => x.id === id);
        const card = document.createElement('div');
        card.className = 'name-card';

        const nameEl = document.createElement('div');
        nameEl.className = 'person-name';
        nameEl.textContent = p.name;

        // Slot pro fotku
        const photoSlot = document.createElement('div');
        photoSlot.className = 'photo-slot' + (slots[id].photo ? ' filled' : '');
        photoSlot.dataset.cardId = id;
        photoSlot.dataset.type   = 'photo';
        if (slots[id].photo) {
            const placed = DATA.find(x => x.id === slots[id].photo);
            const img = document.createElement('img');
            img.src = placed.photo;
            img.alt = placed.name;
            photoSlot.appendChild(img);
            addDragAndTap(photoSlot, placed.id, 'photo', id); // tap i drag ze slotu
        } else {
            photoSlot.innerHTML = '<span class="ph-icon">📷</span>';
            photoSlot.addEventListener('click', () => onPhotoSlotClick(id));
        }

        // Slot pro text
        const textSlot = document.createElement('div');
        textSlot.dataset.cardId = id;
        textSlot.dataset.type   = 'text';
        if (slots[id].text) {
            const placed = DATA.find(x => x.id === slots[id].text);
            textSlot.className = 'text-slot filled';
            textSlot.textContent = placed.text;
            addDragAndTap(textSlot, placed.id, 'text', id); // tap i drag ze slotu
        } else {
            textSlot.className = 'text-slot';
            textSlot.textContent = 'sem vlož popis';
            textSlot.addEventListener('click', () => onTextSlotClick(id));
        }

        card.append(nameEl, photoSlot, textSlot);
        grid.appendChild(card);
    });
}

// ── TAP (původní logika) ───────────────────────────────────────────

function onPhotoPoolClick(id) {
    selectedPhoto = (selectedPhoto === id) ? null : id;
    renderPhotoPool();
}

function onTextPoolClick(id) {
    selectedText = (selectedText === id) ? null : id;
    renderTextPool();
}

function onPhotoSlotClick(cardId) {
    if (slots[cardId].photo) {
        slots[cardId].photo = null;
        render();
        return;
    }
    if (selectedPhoto) {
        slots[cardId].photo = selectedPhoto;
        selectedPhoto = null;
        render();
    }
}

function onTextSlotClick(cardId) {
    if (slots[cardId].text) {
        slots[cardId].text = null;
        render();
        return;
    }
    if (selectedText) {
        slots[cardId].text = selectedText;
        selectedText = null;
        render();
    }
}

// ── DRAG & DROP ────────────────────────────────────────────────────

let drag = null; // { id, type, ghost, sourceSlotCardId? }
let lastDropTarget = null;

// sourceSlotCardId — vyplněno jen když táhneme z obsazeného slotu
function addDragAndTap(el, id, type, sourceSlotCardId = null) {
    let startX, startY, didDrag = false;

    el.addEventListener('pointerdown', e => {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        didDrag = false;

        // Ghost vytvoříme při prvním pohybu
        el.setPointerCapture(e.pointerId);

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup',   onUp);
        el.addEventListener('pointercancel', onUp);
    }, { passive: false });

    function onMove(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!didDrag && Math.hypot(dx, dy) < 6) return;

        if (!didDrag) {
            didDrag = true;
            createGhost(el, id, type, e);
            el.classList.add('dragging');
            // Pokud táhneme ze slotu, uvolníme slot okamžitě
            if (sourceSlotCardId !== null) {
                if (type === 'photo') slots[sourceSlotCardId].photo = null;
                else                  slots[sourceSlotCardId].text  = null;
                render();
            }
        }

        moveGhost(e);
        highlightDropTarget(e, type);
    }

    function onUp(e) {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup',   onUp);
        el.removeEventListener('pointercancel', onUp);

        if (!didDrag) {
            // Tap — zpracujeme ručně (click je blokovaný preventDefault)
            if (sourceSlotCardId !== null) {
                // Klepnutí na obsazený slot → vrátit do zásobníku
                if (type === 'photo') onPhotoSlotClick(sourceSlotCardId);
                else                  onTextSlotClick(sourceSlotCardId);
            } else {
                // Klepnutí na položku v zásobníku → vybrat / zrušit výběr
                if (type === 'photo') onPhotoPoolClick(id);
                else                  onTextPoolClick(id);
            }
            return;
        }

        // Drag: nejdřív zjistíme cíl, pak teprve odstraníme ghost
        const target = getDropTarget(e, type);

        el.classList.remove('dragging');
        removeGhost();
        clearDropHighlight();

        if (target) {
            const cardId = target.dataset.cardId;
            if (type === 'photo') { slots[cardId].photo = id; selectedPhoto = null; }
            else                  { slots[cardId].text  = id; selectedText  = null; }
        }
        render();
    }
}

function createGhost(source, id, type, e) {
    const ghost = document.createElement(type === 'photo' ? 'img' : 'div');
    ghost.className = 'drag-ghost ' + (type === 'photo' ? 'ghost-photo' : 'ghost-text');

    if (type === 'photo') {
        const p = DATA.find(x => x.id === id);
        ghost.src = p.photo;
        ghost.alt = p.name;
    } else {
        const p = DATA.find(x => x.id === id);
        ghost.textContent = p.text;
    }

    const rect = source.getBoundingClientRect();
    ghost._offX = e.clientX - rect.left;
    ghost._offY = e.clientY - rect.top;
    ghost.style.left = (e.clientX - ghost._offX) + 'px';
    ghost.style.top  = (e.clientY - ghost._offY) + 'px';

    document.body.appendChild(ghost);
    drag = { id, type, ghost };
}

function moveGhost(e) {
    if (!drag) return;
    drag.ghost.style.left = (e.clientX - drag.ghost._offX) + 'px';
    drag.ghost.style.top  = (e.clientY - drag.ghost._offY) + 'px';
}

function removeGhost() {
    if (drag && drag.ghost) drag.ghost.remove();
    drag = null;
}

function highlightDropTarget(e, type) {
    clearDropHighlight();
    const target = getDropTarget(e, type);
    if (target) {
        target.classList.add('drop-hover');
        lastDropTarget = target;
    }
}

function clearDropHighlight() {
    if (lastDropTarget) {
        lastDropTarget.classList.remove('drop-hover');
        lastDropTarget = null;
    }
    document.querySelectorAll('.drop-hover').forEach(el => el.classList.remove('drop-hover'));
}

function getDropTarget(e, type) {
    if (!drag) return null;
    // Dočasně skryjeme ghost aby elementFromPoint fungoval správně
    drag.ghost.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    drag.ghost.style.pointerEvents = '';
    if (!el) return null;

    const slot = el.closest(type === 'photo' ? '.photo-slot' : '.text-slot');
    return slot || null;
}

function updateCheckBtn() {
    const allFilled = Object.values(slots).every(s => s.photo && s.text);
    document.getElementById('btn-check').disabled = !allFilled;
}

document.getElementById('btn-check').addEventListener('click', () => {
    const correct = DATA.every(p => slots[p.id].photo === p.id && slots[p.id].text === p.id);
    const el = document.getElementById('result');
    if (correct) {
        el.textContent = '🎉 Výborně! Vše je správně!';
        el.className = 'result correct';
        document.getElementById('btn-print').disabled = false;
    } else {
        el.textContent = '🤔 Něco nesedí. Zkus to znovu!';
        el.className = 'result wrong';
        document.getElementById('btn-print').disabled = true;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('btn-reset').addEventListener('click', init);

document.getElementById('btn-print').addEventListener('click', () => {
    const grid = document.getElementById('print-grid');
    grid.innerHTML = '';
    DATA.forEach(p => {
        const card = document.createElement('div');
        card.className = 'print-card';

        const img = document.createElement('img');
        img.src = p.photo;
        img.alt = p.name;

        const name = document.createElement('div');
        name.className = 'print-name';
        name.textContent = p.name;

        const text = document.createElement('div');
        text.className = 'print-text';
        text.textContent = p.text;

        card.append(img, name, text);
        grid.appendChild(card);
    });
    const images = grid.querySelectorAll('img');
    Promise.all(Array.from(images).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
    )).then(() => window.print());
});

init();

// ── ATMOSFÉRA ─────────────────────────────────────────────────────

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

function createFireflies() {
    const container = document.getElementById('fireflies');
    for (let i = 0; i < 10; i++) {
        const ff = document.createElement('div');
        ff.className = 'firefly';
        ff.style.left              = (Math.random() * 90 + 5) + 'vw';
        ff.style.top               = (Math.random() * 50 + 5) + 'vh';
        ff.style.animationDuration = (3 + Math.random() * 5)  + 's';
        ff.style.animationDelay    = (Math.random() * 6)       + 's';
        container.appendChild(ff);
    }
}

function scheduleSquirrel() {
    setTimeout(runSquirrel, 10000 + Math.random() * 15000);
}

function runSquirrel() {
    const sq     = document.getElementById('squirrel');
    const bubble = document.getElementById('squirrel-bubble');
    const ltr    = Math.random() > 0.5;
    const phrase = SCOUT_PHRASES[Math.floor(Math.random() * SCOUT_PHRASES.length)];
    const stopX  = window.innerWidth * (0.35 + Math.random() * 0.3);

    sq.style.transition = 'none';
    sq.style.opacity    = '1';
    sq.style.transform  = ltr ? 'scaleX(1)' : 'scaleX(-1)';
    sq.style.left       = ltr ? '-80px' : (window.innerWidth + 80) + 'px';

    requestAnimationFrame(() => {
        sq.style.transition = 'left 3s linear';
        sq.style.left       = stopX + 'px';
    });

    setTimeout(() => {
        sq.style.transition = 'none';
        bubble.textContent   = phrase;
        bubble.style.left    = Math.min(stopX, window.innerWidth - 220) + 'px';
        bubble.style.display = 'block';
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.style.animation = '';

        setTimeout(() => {
            bubble.style.display = 'none';
            sq.style.transition  = 'left 3s linear';
            sq.style.left        = ltr ? (window.innerWidth + 80) + 'px' : '-80px';
            setTimeout(() => {
                sq.style.opacity    = '0';
                sq.style.transition = 'none';
                scheduleSquirrel();
            }, 3000);
        }, 2500);
    }, 3100);
}

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

createFireflies();
scheduleSquirrel();
scheduleBird();
