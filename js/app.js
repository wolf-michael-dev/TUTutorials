const API_KEY = CONFIG.API_KEY;
const generateBtn = document.getElementById('generate-btn');
const promptInput = document.getElementById('prompt-input');
const tutorialOutput = document.getElementById('tutorial-output');

let tutorialsArchive = JSON.parse(localStorage.getItem('tutorium_archive')) || [
    { id: 1, title: 'Flexbox Guide', desc: 'Flexbox guide to on discover comension in state or from flexbox guide...', tag: 'Web Dev', content: '<h3>Flexbox Guide</h3><p>Flexbox ist ein mächtiges Layout-Modul...</p>' },
    { id: 2, title: 'Python for Beginners', desc: 'Learn how common python appears with rass...', tag: 'Python', content: '<h3>Python for Beginners</h3><p>Python ist eine einfache Programmiersprache...</p>' },
    { id: 3, title: 'Introduction to Git', desc: 'Learn more about am introduction to Git...', tag: 'Tools', content: '<h3>Introduction to Git</h3><p>Git ist ein Versionsverwaltungssystem...</p>' }
];

function renderArchive() {
    const archiveGrid = document.getElementById('archive-grid');
    if (!archiveGrid) return;

    archiveGrid.innerHTML = '';

    tutorialsArchive.forEach(tut => {
        const card = document.createElement('div');
        card.className = 'archive-card';
        card.innerHTML = [
            `<h3>${tut.title}</h3>`,
            `<p>${tut.desc}</p>`,
            `<div class="card-footer">`,
            `    <span class="tag">${tut.tag}</span>`,
            `    <button class="read-btn" onclick="openTutorial(${tut.id})">Read / Edit</button>`,
            `</div>`
        ].join('');
        archiveGrid.appendChild(card);
    });
}

window.openTutorial = function(id) {
    const tut = tutorialsArchive.find(t => t.id === id);
    if (!tut) return;

    tutorialOutput.innerHTML = tut.content;

    const action = confirm(`Möchtest du das Tutorial "${tut.title}" bearbeiten?`);
    if (action) {
        const newText = prompt("Bearbeite den Inhalt (HTML erlaubt):", tut.content);
        if (newText !== null) {
            tut.content = newText;
            localStorage.setItem('tutorium_archive', JSON.stringify(tutorialsArchive));
            tutorialOutput.innerHTML = tut.content;
            renderArchive();
            alert("Tutorial erfolgreich aktualisiert!");
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

generateBtn.addEventListener('click', async () => {
    const userTopic = promptInput.value.trim();
    
    if (!userTopic) {
        alert('Bitte gib zuerst ein Thema ein!');
        return;
    }

    tutorialOutput.innerHTML = '<h3>Generiere Tutorial... ⏳</h3><p>Die KI schreibt gerade...</p>';

    try {
        const modelName = 'models/gemini-3.8-flash';

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Schreibe ein kurzes, anfängerfreundliches Programmier-Tutorial zum Thema: ${userTopic}. Formatiere die Antwort direkt als sauberes HTML ohne Markdown-Blöcke (kein \`\`\`html). Nutze <h3> für Titel, <p> für Text, <strong> für Hervorhebungen und den <div class="code-block"><pre><code> Tag-Aufbau für Code. Gib nur das HTML zurück.`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.code === 429 || data.error.message.includes('quota') || data.error.message.includes('high demand')) {
                tutorialOutput.innerHTML = `<h3>Server ausgelastet ⏳</h3><p>Das API-Limit ist kurzzeitig erreicht. Bitte warte einen Moment und versuche es noch einmal!</p>`;
                return;
            }
            tutorialOutput.innerHTML = `<h3>Fehler ❌</h3><p>${data.error.message}</p>`;
            return;
        }

        if (!data.candidates || data.candidates.length === 0) {
            tutorialOutput.innerHTML = `<h3>Blockiert ❌</h3><p>Die KI wollte zu diesem Thema nichts generieren.</p>`;
            return;
        }
        
        let aiText = data.candidates[0].content.parts[0].text;
        aiText = aiText.replace(/```html/g, '').replace(/```/g, '').trim();
        
        tutorialOutput.innerHTML = aiText;

        const newTutorial = {
            id: Date.now(), 
            title: userTopic,
            desc: `KI-generiertes Tutorial zum Thema ${userTopic}...`,
            tag: 'AI Generated',
            content: aiText
        };

        tutorialsArchive.unshift(newTutorial); 
        localStorage.setItem('tutorium_archive', JSON.stringify(tutorialsArchive));
        
        renderArchive();

    } catch (error) {
        console.error("Kritischer Fehler:", error);
        tutorialOutput.innerHTML = '<h3>Netzwerkfehler ⚠️</h3><p>Es gab ein Problem bei der Verbindung zur API.</p>';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
});  

// Funktion: Die letzten 3 Tutorials in der Sidebar anzeigen
function renderRecommended() {
    const recommendedList = document.getElementById('recommended-list');
    if (!recommendedList) return;

    recommendedList.innerHTML = '';

    // Die ersten 3 Einträge aus dem Archiv (das sind die neuesten) nehmen
    const latestTutorials = tutorialsArchive.slice(0, 3);

    latestTutorials.forEach(tut => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#start';
        a.textContent = tut.title;
        
        // Wenn man draufklickt, öffnet sich das Tutorial direkt oben in der Karte
        a.addEventListener('click', (e) => {
            e.preventDefault();
            openTutorial(tut.id);
        });

        li.appendChild(a);
        recommendedList.appendChild(li);
    });
}

// WICHTIG: Rufe renderRecommended() hier in der renderArchive-Funktion oder beim Laden auf:
document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    renderRecommended(); // <-- Hier initialisieren
});// Funktion: Die letzten 3 Tutorials in der Sidebar anzeigen
function renderRecommended() {
    const recommendedList = document.getElementById('recommended-list');
    if (!recommendedList) return;

    recommendedList.innerHTML = '';

    // Die ersten 3 Einträge aus dem Archiv (das sind die neuesten) nehmen
    const latestTutorials = tutorialsArchive.slice(0, 3);

    latestTutorials.forEach(tut => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#start';
        a.textContent = tut.title;
        
        // Wenn man draufklickt, öffnet sich das Tutorial direkt oben in der Karte
        a.addEventListener('click', (e) => {
            e.preventDefault();
            openTutorial(tut.id);
        });

        li.appendChild(a);
        recommendedList.appendChild(li);
    });
}

// WICHTIG: Rufe renderRecommended() hier in der renderArchive-Funktion oder beim Laden auf:
document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    renderRecommended(); // <-- Hier initialisieren
});

// Alle Navigations-Links auswählen
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 1. Bei ALLEN Links die Klasse 'active' entfernen
        navLinks.forEach(item => item.classList.remove('active'));
        
        // 2. NUR dem angeklickten Link die Klasse 'active' hinzufügen
        this.classList.add('active');
    });
});