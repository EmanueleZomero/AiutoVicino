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
