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
const jobs = [
  {
    id: 1,
    title: "Tagliare il prato",
    description: "Giardino di 50 mq",
    pay: "€20",
    type: "request",
    location: { lat: 45.4642, lng: 9.1900 }
  },
  {
    id: 2,
    title: "Pulizie domestiche",
    description: "Appartamento 3 stanze",
    pay: "€15/h",
    type: "offer",
    location: { lat: 45.4630, lng: 9.1850 }
  }
];

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
        addJobMarkers();
      },
      () => {
        alert("Geolocalizzazione non disponibile. Mostro mappa generica.");
        addJobMarkers();
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

function addJobMarkers() {
  clearMarkers();
  
  jobs.forEach((job) => {
    if (!job.location) return;
    
    const marker = new google.maps.Marker({
      position: job.location,
      map,
      title: job.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-popup">
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>${job.pay}</strong></p>
          ${auth.currentUser ? `<button onclick="applyForJob(${job.id})">Partecipa</button>` : ''}
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

// ==================== FUNZIONI LAVORETTI ==================== //
function renderJobs() {
  const jobsContainer = document.getElementById("jobs-container");
  if (!jobsContainer) return;

  jobsContainer.innerHTML = jobs.map(job => `
    <div class="job-card" data-id="${job.id}">
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <p><strong>Compenso: ${job.pay}</strong></p>
      <p>Tipo: ${job.type === "request" ? "📢 Richie
