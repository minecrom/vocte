const btn = document.getElementById('convertBtn');
const input = document.getElementById('pngfile');
// ––––– Drag & Drop Setup –––––
const dropArea = document.getElementById('drop-area');

// Empêche l’ouverture du fichier par défaut
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// Feedback visuel au survol
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'));
});
['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'));
});

// Au lâcher, on récupère les PNG et on les injecte dans l’input
dropArea.addEventListener('drop', e => {
  const files = Array.from(e.dataTransfer.files)
    .filter(file => file.type === 'image/png');
  if (files.length) {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    input.files = dt.files;
  }
});
const progress = document.getElementById('progress');
const downloadLinkDiv = document.getElementById('downloadLink');

btn.addEventListener('click', async () => {
  const files = Array.from(input.files);
  if (!files.length) return alert('Choisissez au moins un PNG.');

  progress.style.display = 'block';
  downloadLinkDiv.innerHTML = '';

  for (const file of files) {
    const formData = new FormData();
    formData.append('pngfile', file);

    const response = await fetch('/convert', { method: 'POST', body: formData });
    if (!response.ok) {
      alert('Erreur lors de la conversion de ' + file.name);
      continue;
    }

    // Si blob (1 seul fichier) ou JSON (multiples)
    const contentType = response.headers.get('Content-Type');
    if (contentType.includes('application/json')) {
      const result = await response.json();
      // traiter les noms, mais ici on skip, car front doit récupérer chaque blob séparément
    } else {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.png$/i, '.webp');
      a.textContent = `Télécharger ${a.download}`;
      downloadLinkDiv.appendChild(a);
    }
  }

  progress.style.display = 'none';
});