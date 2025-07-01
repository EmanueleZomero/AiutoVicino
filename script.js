// Array di lavoretti (in futuro potresti usare un database)
const jobs = [
  { title: "Tagliare il prato", description: "Giardino di 50 mq", pay: "€20" },
  { title: "Pulizie domestiche", description: "Appartamento 3 stanze", pay: "€15/h" },
  { title: "Fare la spesa", description: "Per anziani nel quartiere", pay: "€10" },
];

const jobsContainer = document.getElementById("jobs-container");

// Mostra i lavoretti nella griglia
function renderJobs() {
  jobsContainer.innerHTML = jobs.map(job => `
    <div class="job-card">
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <p><strong>Compenso: ${job.pay}</strong></p>
      <button class="apply-btn" onclick="applyForJob('${job.title}')">Offri aiuto</button>
    </div>
  `).join("");
}

// Funzione per candidarsi a un lavoretto
function applyForJob(jobTitle) {
  alert(`Hai chiesto di aiutare con: "${jobTitle}"! Ti contatteremo presto.`);
  // Qui potresti aggiungere una chiamata API o salvare in localStorage
}

// Gestione del form di contatto
const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Messaggio inviato! Grazie per il tuo feedback.");
  contactForm.reset();
});

// Carica i lavoretti all'avvio
document.addEventListener("DOMContentLoaded", renderJobs);
// ==================== CONFIGURAZIONE FIREBASE ==================== //
const firebaseConfig = {
  apiKey: "AIzaSyAJ3MmTNaJg-jjlu8uHWnQ19WcaCg4nHWA",
  authDomain: "aiutovicino-c1f34.firebaseapp.com",
  projectId: "aiutovicino-c1f34",
  storageBucket: "aiutovicino-c1f34.appspot.com",
  messagingSenderId: "787881794544",
  appId: "1:787881794544:web:ca982233fabb3e394ddb35"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Per usare il database (opzionale)

// ==================== AUTENTICAZIONE (LOGIN/REGISTRAZIONE) ==================== //
document.addEventListener("DOMContentLoaded", () => {
  // Registrazione
  document.getElementById("signup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        alert("Registrazione completata! Ora puoi accedere.");
        document.getElementById("signup-form").reset();
      })
      .catch(error => alert("Errore: " + error.message));
  });

  // Login
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert("Accesso effettuato!");
        window.location.href = "dashboard.html"; // Reindirizza alla dashboard
      })
      .catch(error => alert("Errore: " + error.message));
  });

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    auth.signOut()
      .then(() => alert("Sei stato disconnesso."))
      .catch(error => alert("Errore: " + error.message));
  });
});

// ==================== GESTIONE LAVORETTI ==================== //
// Array di esempio (in futuro sostituisci con dati da Firestore)
const jobs = [
  { id: 1, title: "Tagliare il prato", description: "Giardino di 50 mq", pay: "€20", type: "request" },
  { id: 2, title: "Pulizie domestiche", description: "Appartamento 3 stanze", pay: "€15/h", type: "offer" }
];

// Mostra i lavoretti nella pagina
function renderJobs() {
  const jobsContainer = document.getElementById("jobs-container");
  if (!jobsContainer) return;

  jobsContainer.innerHTML = jobs.map(job => `
    <div class="job-card" data-id="${job.id}">
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <p><strong>Compenso: ${job.pay}</strong></p>
      <p>Tipo: ${job.type === "request" ? "📢 Richiesta" : "🛠️ Offerta"}</p>
      ${auth.currentUser ? `<button class="apply-btn" onclick="applyForJob(${job.id})">Partecipa</button>` : ""}
    </div>
  `).join("");
}

// Funzione per candidarsi a un lavoretto
function applyForJob(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!auth.currentUser) {
    alert("Devi accedere per partecipare!");
    return;
  }
  alert(`Hai chiesto di aiutare con: "${job.title}". Ti contatteremo via email.`);
}

// ==================== CONTROLLO UTENTE LOGGATO ==================== //
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Utente loggato:", user.email);
    document.getElementById("auth-section")?.style.display = "none";
    document.getElementById("dashboard-section")?.style.display = "block";
  } else {
    console.log("Nessun utente loggato");
    document.getElementById("auth-section")?.style.display = "block";
    document.getElementById("dashboard-section")?.style.display = "none";
  }
  renderJobs(); // Aggiorna la lista lavoretti
});
