// Traceur I-V / P-V interactif
let chartIV, chartPV;

function updateCharts() {
  // Vérifier que les éléments canvas existent
  const ivChartElement = document.getElementById('ivChart');
  const pvChartElement = document.getElementById('pvChart');
  if (!ivChartElement || !pvChartElement) {
    return; // Quitter si les canvas n'existent pas
  }
  
  const uInputs = document.querySelectorAll('.u-val');
  const iInputs = document.querySelectorAll('.i-val');
  let voltages = [], currents = [], powers = [];
  
  for(let i = 0; i < uInputs.length; i++) {
    let u = parseFloat(uInputs[i].value) || 0;
    let iVal = parseFloat(iInputs[i].value) || 0;
    let p = u * iVal;
    if(u > 0 || iVal > 0) {  // Ignore lignes vides
      voltages.push(u);
      currents.push(iVal);
      powers.push(p);
    }
  }
  
  // Courbe I vs U
  if(chartIV) chartIV.destroy();
  const ctxIV = ivChartElement.getContext('2d');
  chartIV = new Chart(ctxIV, {
    type: 'line',
    data: {
      labels: voltages,
      datasets: [{
        label: 'I(V)',
        data: currents,
        borderColor: '#0071E3',
        backgroundColor: 'rgba(0,113,227,0.1)',
        fill: false,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Tension U (V)' } },
        y: { title: { display: true, text: 'Courant I (A)' } }
      }
    }
  });
  
  // Courbe P vs U
  if(chartPV) chartPV.destroy();
  const ctxPV = pvChartElement.getContext('2d');
  chartPV = new Chart(ctxPV, {
    type: 'line',
    data: {
      labels: voltages,
      datasets: [{
        label: 'P(V)',
        data: powers,
        borderColor: '#34C759',
        backgroundColor: 'rgba(52,199,89,0.1)',
        fill: false,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Tension U (V)' } },
        y: { title: { display: true, text: 'Puissance P (W)' } }
      }
    }
  });
}

async function repairBrokenMediaUrls() {
  const repoOwner = 'abdellahchelouah-maker';
  const repoName = 'sequence-energie';
  const folders = ['images', 'videos'];
  const repoFiles = {};

  for (const folder of folders) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folder}?ref=main`,
        { headers: { Accept: 'application/vnd.github+json' } }
      );

      if (!response.ok) continue;
      const data = await response.json();
      repoFiles[folder] = Array.isArray(data) ? data.map(item => item.name) : [];
    } catch (error) {
      console.warn(`Impossible de lister le dossier ${folder} :`, error);
    }
  }

  const mediaNodes = document.querySelectorAll('img, video');

  mediaNodes.forEach((node) => {
    const currentSrc = node.getAttribute('src') || node.getAttribute('poster');
    if (!currentSrc) return;

    const match = currentSrc.match(/(?:^|\/)(images|videos)\/([^/?#]+)/i);
    if (!match) return;

    const folder = match[1].toLowerCase();
    const requestedName = decodeURIComponent(match[2]);
    const fileList = repoFiles[folder];

    if (!fileList || !fileList.length) return;

    const exactMatch = fileList.find((fileName) => fileName.toLowerCase() === requestedName.toLowerCase());
    if (!exactMatch) return;

    const correctedUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folder}/${exactMatch}`;

    if (node.tagName === 'IMG') {
      if (!node.complete || node.naturalWidth === 0) {
        node.src = correctedUrl;
      }
    } else if (node.tagName === 'VIDEO') {
      node.src = correctedUrl;
      const currentPoster = node.getAttribute('poster');
      if (currentPoster && currentPoster.includes(`/${folder}/`)) {
        const posterBase = currentPoster.split('/').pop();
        const posterMatch = fileList.find((fileName) => fileName.toLowerCase() === posterBase.toLowerCase());
        if (posterMatch) {
          node.poster = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folder}/${posterMatch}`;
        }
      }
    }
  });
}

// Mise à jour automatique à chaque saisie - dans DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Attacher l'événement 'input' au DOM prêt
  document.addEventListener('input', updateCharts);
  repairBrokenMediaUrls();

  // Fonction toggleCorrection universelle
  window.toggleCorrection = function(id) {
    const bloc = document.getElementById(id);
    if (!bloc) {
      console.error('Bloc correction non trouvé :', id);
      return;
    }
    bloc.style.display = (bloc.style.display === 'none' || bloc.style.display === '') ? 'block' : 'none';
  };
  
  console.log('Script.js chargé - toggleCorrection disponible');
});
