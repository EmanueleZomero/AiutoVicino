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
const db = firebase.firestore();

// ==================== VARIABILI GLOBALI ==================== //
let map;
let markers = [];
let currentUser = null;

// ==================== FUNZIONI MAPPA ==================== //
function initMap() {
  const defaultLocation = { lat: 45.4642, lng: 9.1900 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: defaultLocation,
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);
        addUserMarker(userLocation);
        loadJobsFromFirestore();
      },
      () => {
        alert("Geolocalizzazione non disponibile. Mostro mappa generica.");
        loadJobsFromFirestore();
      }
    );
  }
}

function addUserMarker(position) {
  new google.maps.Marker({
    position,
    map,
    title: "La tua posizione",
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });
}

function addJobMarkers(jobs) {
  clearMarkers();
  
  jobs.forEach((job) => {
    if (!job.location) return;
    
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(job.location.latitude, job.location.longitude),
      map,
      title: job.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-popup">
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>${job.pay}</strong></p>
          ${currentUser ? `<button onclick="applyForJob('${job.id}')">Partecipa</button>` : ''}
        </div>
      `,
    });

    marker.addListener("click", () => infoWindow.open(map, marker));
    markers.push(marker);
  });
}

function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

// ==================== FUNZIONI LAVORI ==================== //
async function loadJobsFromFirestore() {
  try {
    const jobsContainer = document.getElementById("jobs-container");
    jobsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Caricamento lavori...</div>';
    
    const snapshot = await db.collection("jobs").get();
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    renderJobs(jobs);
    addJobMarkers(jobs);
  } catch (error) {
    console.error("Errore nel caricamento lavori:", error);
    document.getElementById("jobs-container").innerHTML = '<p class="error">Errore nel caricamento dei lavori</p>';
  }
}

function renderJobs(jobs) {
  const jobsContainer = document.getElementById("jobs-container");
  if (!jobsContainer) return;

  if (jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="no-jobs">
        <p>Nessun lavoro disponibile al momento</p>
        ${currentUser ? '<a href="#add-job" class="add-job-link">Aggiungi un lavoro</a>' : ''}
      </div>
    `;
    return;
  }

  jobsContainer.innerHTML = jobs.map(job => `
    <div class="job-card" data-id="${job.id}">
      <h3>${job.title}</h3>
      <p class="description">${job.description}</p>
      <div class="job-meta">
        <span class="pay"><strong>${job.pay}</strong></span>
        <span class="location">📍 ${job.location.address || job.location.coordinates}</span>
      </div>
      ${currentUser ? `<button class="apply-btn" onclick="applyForJob('${job.id}')">Partecipa</button>` : ""}
    </div>
  `).join("");
}

async function applyForJob(jobId) {
  if (!currentUser) {
    showAuthModal();
    return;
  }

  try {
    await db.collection("applications").add({
      jobId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      appliedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("La tua candidatura è stata inviata con successo!");
  } catch (error) {
    alert("Errore nell'invio della candidatura: " + error.message);
  }
}

// ==================== AGGIUNTA LAVORO ==================== //
async function setupJobForm() {
  const jobForm = document.getElementById("job-form");
  if (!jobForm) return;

  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showAuthModal();
      return;
    }

    const formMessage = document.getElementById("job-form-message");
    formMessage.textContent = "";
    formMessage.className = "form-message";

    const title = document.getElementById("job-title").value;
    const description = document.getElementById("job-description").value;
    const location = document.getElementById("job-location").value;
    const category = document.getElementById("job-category").value;

    try {
      // Qui potresti aggiungere la geocodifica dell'indirizzo
      const jobData = {
        title,
        description,
        location: {
          address: location,
          coordinates: "45.4642,9.1900" // Sostituire con geocodifica reale
        },
        category,
        pay: "Da concordare", // Potresti aggiungere un campo nel form
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "available"
      };

      await db.collection("jobs").add(jobData);
      
      formMessage.textContent = "Lavoro pubblicato con successo!";
      formMessage.className = "form-message success";
      jobForm.reset();
      
      // Ricarica i lavori
      loadJobsFromFirestore();
      // Torna alla home
      window.location.hash = "#home";
    } catch (error) {
      formMessage.textContent = "Errore: " + error.message;
      formMessage.className = "form-message error";
    }
  });
}

// ==================== AUTENTICAZIONE ==================== //
function setupAuth() {
  // Mostra/nascondi modale
  document.getElementById("login-btn")?.addEventListener("click", showAuthModal);
  document.getElementById("logout-btn")?.addEventListener("click", () => auth.signOut());
  document.querySelector(".close-modal")?.addEventListener("click", hideAuthModal);
  document.getElementById("show-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
  });
  document.getElementById("show-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
  });

  // Login
  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const authMessage = document.getElementById("auth-message");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      hideAuthModal();
    } catch (error) {
      authMessage.textContent = "Errore: " + error.message;
      authMessage.className = "form-message error";
    }
  });

  // Registrazione
  document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const name = document.getElementById("register-name").value;
    const authMessage = document.getElementById("auth-message");

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      hideAuthModal();
    } catch (error) {
      authMessage.textContent = "Errore: " + error.message;
      authMessage.className = "form-message error";
    }
  });
}

function showAuthModal() {
  document.getElementById("auth-modal").style.display = "block";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("register-form").style.display = "none";
  document.getElementById("auth-message").textContent = "";
}

function hideAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
}

// ==================== GESTIONE STATO UTENTE ==================== //
function handleAuthState(user) {
  currentUser = user;
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const addJobLink = document.getElementById("add-job-link");

  if (user) {
    console.log("Utente loggato:", user.email);
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (addJobLink) addJobLink.style.display = "block";
  } else {
    console.log("Nessun utente loggato");
    if (loginBtn) loginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (addJobLink) addJobLink.style.display = "none";
  }

  loadJobsFromFirestore();
}

// ==================== ROUTING SEMPLICE ==================== //
function handleHashChange() {
  const hash = window.location.hash;
  document.getElementById("home").style.display = hash === "#home" || hash === "" ? "block" : "none";
  document.getElementById("add-job").style.display = hash === "#add-job" ? "block" : "none";
}

// ==================== INIZIALIZZAZIONE ==================== //
document.addEventListener("DOMContentLoaded", () => {
  setupAuth();
  setupJobForm();
  auth.onAuthStateChanged(handleAuthState);
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange(); // Esegui all'inizio per gestire l'hash corrente

  if (window.google) {
    initMap();
  } else {
    console.warn("Google Maps API non caricata");
  }
});
