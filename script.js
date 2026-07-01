// --- EFFETTO TORCIA CON IMMAGINE CASUALE ---
const dossier = document.getElementById('dossier');
const torcia = document.getElementById('torcia');

// Lista delle tue immagini segrete (inseriscile nella cartella /images/)
const immaginiSegrete = [
  'images/secret1.jpg',
  'images/secret2.png',
  'images/dossier3.webp',
  'images/topsecret4.jpg',
  'images/mission5.png'
  // Aggiungi qui tutti i nomi dei tuoi file
];

// Seleziona un'immagine a caso
function setRandomImage() {
  const randomIndex = Math.floor(Math.random() * immaginiSegrete.length);
  const imgPath = immaginiSegrete[randomIndex];
  torcia.style.backgroundImage = `url('${imgPath}')`;
  console.log(`🔍 Immagine segreta caricata: ${imgPath}`);
}

// Chiama la funzione all'avvio
setRandomImage();

// Aggiorna posizione della torcia
function updateTorcia(e) {
  const rect = dossier.getBoundingClientRect();
  let x = ((e.clientX - rect.left) / rect.width) * 100;
  let y = ((e.clientY - rect.top) / rect.height) * 100;
  x = Math.min(100, Math.max(0, x));
  y = Math.min(100, Math.max(0, y));
  torcia.style.setProperty('--x', x + '%');
  torcia.style.setProperty('--y', y + '%');
}

dossier.addEventListener('mousemove', updateTorcia);
dossier.addEventListener('mouseleave', () => {
  torcia.style.setProperty('--x', '50%');
  torcia.style.setProperty('--y', '50%');
});

// Inizializza al centro
torcia.style.setProperty('--x', '50%');
torcia.style.setProperty('--y', '50%');

// --- GESTIONE WAITLIST CON GITHUB ISSUES ---
const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const statusBox = document.getElementById('statusBox');
const userEmailDisplay = document.getElementById('userEmailDisplay');

// Recupera token GitHub dall'ambiente (impostato su Netlify/Vercel)
// Nota: in sviluppo, puoi usare un token di test, ma MAI esporlo nel codice frontend.
// Per la demo, se non c'è token, salviamo in locale.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;
const REPO_OWNER = 'TUO_USERNAME_GITHUB';  // <-- SOSTITUISCI
const REPO_NAME = 'TUO_REPOSITORY';        // <-- SOSTITUISCI

async function saveEmailToGitHub(email) {
  if (!GITHUB_TOKEN) {
    console.warn('🔐 GitHub Token non configurato. Salvo in localStorage.');
    return false;
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
  const body = {
    title: `Nuova iscrizione waitlist: ${email}`,
    body: `📧 **Email**: ${email}\n📅 **Data**: ${new Date().toLocaleString('it-IT')}\n\n✅ Iscritto a MASTERINWEB.`,
    labels: ['waitlist', 'masterinweb']
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message || response.status}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Errore salvataggio su GitHub:', error);
    return false;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email || !email.includes('@')) {
    alert('Inserisci un indirizzo email valido.');
    return;
  }

  // --- 1. Salva in locale (sempre) ---
  let waitlist = JSON.parse(localStorage.getItem('masterinweb_waitlist') || '[]');
  if (waitlist.includes(email)) {
    statusBox.innerHTML = `<span class="check">⚠️</span> Email già registrata · <small>sei già nella waitlist</small>`;
    statusBox.style.background = 'rgba(255, 200, 0, 0.05)';
    setTimeout(() => { statusBox.style.background = 'rgba(0, 255, 65, 0.02)'; }, 800);
    return;
  }
  waitlist.push(email);
  localStorage.setItem('masterinweb_waitlist', JSON.stringify(waitlist));

  // --- 2. Invia a GitHub (se token configurato) ---
  const savedOnGitHub = await saveEmailToGitHub(email);

  // --- 3. Aggiorna UI ---
  if (savedOnGitHub) {
    statusBox.innerHTML = `<span class="check">✅</span> Accesso registrato · Sei nella waitlist <small>— sincronizzato con GitHub</small>`;
    statusBox.style.background = 'rgba(0, 255, 65, 0.06)';
    userEmailDisplay.textContent = email;
    document.querySelector('.footer-note').innerHTML =
      `🔐 iscritto alla waitlist di MASTERINWEB · <span style="color: #00ff41;">${email}</span> <span style="color: #4d6a7e; font-size:0.6rem;">[salvato su GitHub]</span>`;
  } else {
    statusBox.innerHTML = `<span class="check">✅</span> Accesso registrato · Sei nella waitlist <small>— salvato in locale</small>`;
    statusBox.style.background = 'rgba(0, 255, 65, 0.06)';
    userEmailDisplay.textContent = email;
    document.querySelector('.footer-note').innerHTML =
      `🔐 iscritto alla waitlist di MASTERINWEB · <span style="color: #00ff41;">${email}</span> <span style="color: #4d6a7e; font-size:0.6rem;">[dati locali]</span>`;
  }

  setTimeout(() => {
    statusBox.style.background = 'rgba(0, 255, 65, 0.02)';
  }, 800);

  emailInput.value = '';
});

// --- Ripristina stato da localStorage ---
(function checkStored() {
  const stored = JSON.parse(localStorage.getItem('masterinweb_waitlist') || '[]');
  if (stored.length > 0) {
    const last = stored[stored.length - 1];
    statusBox.innerHTML = `<span class="check">✅</span> Accesso registrato · Sei nella waitlist <small>— ${stored.length} iscritti</small>`;
    userEmailDisplay.textContent = last;
    document.querySelector('.footer-note').innerHTML =
      `🔐 iscritto alla waitlist di MASTERINWEB · <span style="color: #00ff41;">${last}</span> <span style="color: #4d6a7e; font-size:0.6rem;">[dati locali]</span>`;
  }
})();
