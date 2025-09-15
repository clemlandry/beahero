// --- Données fictives (à adapter à ton RP) ---
function toggleClip(trackDiv) {
  const container = trackDiv.querySelector(".clip-container");
  const player = document.getElementById("global-player");
  const dock = document.getElementById("player-dock");

  const opening = (container.style.display === "none" || container.style.display === "");
  if (opening) {
    container.style.display = "block";
    container.appendChild(player);
    player.style.display = "block"; // visible en grand
  } else {
    container.style.display = "none";
    if (dock) dock.appendChild(player); // on range le lecteur
    player.style.display = "none"; // on le masque si tu ne veux pas qu'il prenne de place
  }
}
function clearPlayingHighlights(){
  document.querySelectorAll("tr.playing").forEach(tr => tr.classList.remove("playing"));
}
function highlightPlayingById(id){
  clearPlayingHighlights();
  document.querySelectorAll(`tr[data-id="${CSS.escape(id)}"]`)
    .forEach(tr => tr.classList.add("playing"));
}


function formatNumberShort(n) {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1).replace('.', ',') + " Mrd";
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace('.', ',') + " M";
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace('.', ',') + " k";
  }
  return n.toString();
}


// en haut de app.js
let QUEUE = [];      // [{title, artist, file}]
let Q_INDEX = -1;

function playFromQueue(index){
  if(index < 0 || index >= QUEUE.length) return;
  Q_INDEX = index;
  const t = QUEUE[Q_INDEX];
  setNowPlaying(t.title, t.artist, t.file, t.cover, t.id);
  const btn = document.getElementById("btnPlayPause");
  if(btn) btn.textContent = "⏸";
}


// brancher les boutons (en bas de app.js)
document.getElementById("btnNext").addEventListener("click", ()=>{
  if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length);
});
document.getElementById("btnPrev").addEventListener("click", ()=>{
  if(QUEUE.length) playFromQueue((Q_INDEX-1+QUEUE.length) % QUEUE.length);
});

// auto enchaînement
document.getElementById("global-player").addEventListener("ended", ()=>{
  if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length);
});


const DB = {
  artist: {
    id: "IXEN",
    name: "IXEN",
    monthlyListeners: 34545321,
    tags: ["K-pop", "Dance", "Synthpop"],
    popular: [
  { id:"trk-anpanman", title:"Anpan Man", duration:229, plays:1500000000, file:"assets/anpanman.mp4", cover:"assets/blue-horizon.png" },
  { id:"trk-sunshine", title:"Sunshine", duration:239, plays:18504567, file:"assets/sunshine.mp4", cover:"assets/blue-horizon.png" },
],

    albums: [
      {
        id: "alb-bh",
        title: "Blue Horizon",
        year: 2025,
        type: "Album",
        cover: "assets/blue-horizon.png",
        tracks: [
          { id:"trk-anpanman",no:1, title:"Anpan Man", duration:229, file: "assets/anpanman.mp4" },
          { id:"trk-sunshine",no:2, title:"Sunshine", duration:239, plays:18504567, file:"assets/sunshine.mp4",  },
          
        ]
      },
      
    ]
  }
};


// --- Utilitaires ---
const $ = sel => document.querySelector(sel);
const app = $("#app");

function secondsToMMSS(s){
  const m = Math.floor(s/60);
  const ss = String(s%60).padStart(2,"0");
  return `${m}:${ss}`;
}

function linkTo(route){ location.hash = route; }

function setNowPlaying(title, artist, file, cover, id){
  document.getElementById("np-title").textContent = title;
  document.getElementById("np-artist").textContent = artist;

  const img = document.getElementById("np-cover");
  if (img && cover) img.src = cover;

  const player = document.getElementById("global-player");

  // si 'file' manquant (cas piste album), on le récupère depuis populaires par id
  if (!file && id){
    const fromPopular = DB.artist.popular.find(t => t.id === id);
    if (fromPopular) { file = fromPopular.file; cover = cover || fromPopular.cover; }
  }

  if (file) {
    player.src = file;
    player.play().catch(()=>{});
    ensureClipPlacementOnPlay?.();
  }
  if (id) highlightPlayingById(id);
}




// --- Vues ---
function ArtistPage(){
  const { name, monthlyListeners, tags, popular, albums } = DB.artist;
  const latest = [...albums].sort((a,b)=>b.year-a.year)[0];

  app.innerHTML = `

  
  
    
      <div class="artist-header">
        <div class="artist-cover">
  <img src="assets/logo.png" alt="Logo du groupe" />
</div>


        <div class="artist-meta">
          <h1>${name}</h1>
          <div class="subtitle">${formatNumberShort(monthlyListeners)} auditeurs mensuels</div>

          <div class="chips">${tags.map(t=>`<span class="chip">${t}</span>`).join("")}</div>
          <div style="margin-top:14px; display:flex; gap:10px">
            <button class="btn primary" id="btnPlay">Lecture</button>
            <button class="btn" id="btnFollow">Suivre</button>
          </div>
        </div>
      </div>
    </div>

    <div style="height:30px"></div>


    <div class="section">
  <div class="banner">
    <div class="info">
      <div class="thumb">
        <img src="${latest.cover || 'assets/placeholder.jpg'}" alt="Pochette ${latest.title}">
      </div>
      <div>
        <span style="color:var(--muted); font-size:12px;">Dernière sortie • ${latest.type}</span>
        <strong>${latest.title}</strong>
        <span style="color:var(--muted); font-size:12px;">${latest.year}</span>
      </div>
    </div>
    <div>
      <button class="btn" onclick="linkTo('#/album/${latest.id}')">Voir</button>
    </div>
  </div>
</div>


    <div class="section">
      <h2>Populaires</h2>
      <table class="table">
        <thead><tr><th>#</th><th>Titre</th><th>Lectures</th><th>Durée</th></tr></thead>
        
<tbody>
  ${popular.map((t,i)=>`
    <tr data-id="${t.id}" data-play="${t.title}">
      <td>${i+1}</td>
      <td>${t.title}</td>
      <td>${formatNumberShort(t.plays)}</td>
      <td>${secondsToMMSS(t.duration)}</td>
    </tr>
  `).join("")}
</tbody>



      </table>
    </div>

    <div class="section">
      <h2>Albums</h2>
      <div class="grid">
        ${albums.map(album => `
  <div class="album-card">
    <div class="cover">
      <img src="${album.cover}" alt="Pochette de ${album.title}">
    </div>
    <h3>${album.title}</h3>
    <p>${album.year}</p>
  </div>
`).join("")
}
      </div>
    </div>
  `;

 app.querySelectorAll(".toggle-clip").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const row = btn.closest("tr");
    const clipRow = row.nextElementSibling; // la ligne clip juste après
    const container = clipRow.querySelector(".clip-container");
    const player = document.getElementById("global-player");
    const dock = document.getElementById("player-dock");

    const opening = (clipRow.style.display === "none" || clipRow.style.display === "");
    if (opening) {
      clipRow.style.display = "";
      container.style.display = "block";
      container.appendChild(player);
      player.style.display = "block";
      btn.textContent = "⬇️";
    } else {
      clipRow.style.display = "none";
      container.style.display = "none";
      dock.appendChild(player);
      player.style.display = "none";
      btn.textContent = "⬆️";
    }
  });
});


  // Interactions
 $("#btnPlay").addEventListener("click", ()=>{
  // remplit la file avec les populaires (avec cover si tu l’as mise côté popular)
  QUEUE = popular.map(t => ({ title:t.title, artist:DB.artist.name, file:t.file, cover:t.cover }));
  playFromQueue(0); // lance le premier
});

 
app.querySelectorAll('tr[data-id]').forEach(row=>{
  row.addEventListener('click', ()=>{
    const id = row.getAttribute('data-id');
    const track = DB.artist.popular.find(t => t.id === id);
    if(!track) return;

    QUEUE = DB.artist.popular.map(t => ({
      id:t.id, title:t.title, artist:DB.artist.name, file:t.file, cover:t.cover
    }));
    playFromQueue(Math.max(0, QUEUE.findIndex(t => t.id === id)));
  });
});




}

function AlbumPage(id){
  const album = DB.artist.albums.find(a=>a.id===id);
  if(!album){ app.innerHTML = `<p>Album introuvable.</p>`; return; }

  app.innerHTML = `
    <div class="section">
      <button class="btn" onclick="history.back()">← Retour</button>
    </div>

    <div class="section">
      <div class="artist-header">
  <div class="artist-cover">
    <img src="${album.cover || 'assets/placeholder.jpg'}" alt="Cover ${album.title}">
  </div>
  <div class="artist-meta">
    <h1>${album.title}</h1>
    <div class="subtitle">${album.type} • ${album.year} • ${album.tracks.length} titres</div>
    <div style="margin-top:14px">
      <button class="btn primary" id="btnPlayAlbum">Lecture</button>
    </div>
  </div>
</div>

    </div>

    <div class="section">
      <h2>Liste des titres</h2>
      <table class="table">
        <thead><tr><th>#</th><th>Titre</th><th>Durée</th></tr></thead>
        <tbody>
  ${album.tracks.map(t=>`
    <tr data-id="${t.id}" data-play="${t.title}">
      <td>${t.no}</td>
      <td>${t.title}</td>
      <td>${secondsToMMSS(t.duration)}</td>
    </tr>
  `).join("")}
</tbody>

      </table>
    </div>
  `;

$("#btnPlayAlbum").addEventListener("click", ()=>{
  QUEUE = album.tracks.map(t => {
    const fromPopular = DB.artist.popular.find(p => p.id === t.id) || {};
    return { id:t.id, title:t.title, artist:DB.artist.name,
             file: t.file || fromPopular.file, cover: fromPopular.cover };
  });
  playFromQueue(0);
});

app.querySelectorAll('tr[data-id]').forEach(row=>{
  row.addEventListener('click', ()=>{
    const id = row.getAttribute('data-id');
    QUEUE = album.tracks.map(t => {
      const fromPopular = DB.artist.popular.find(p => p.id === t.id) || {};
      return { id:t.id, title:t.title, artist:DB.artist.name,
               file: t.file || fromPopular.file, cover: fromPopular.cover };
    });
    const idx = QUEUE.findIndex(t => t.id === id);
    playFromQueue(Math.max(0, idx));
  });
});


}

// --- Router minimal ---



function router(){
  const hash = location.hash || "#/artist";
  const [_, route, id] = hash.split("/");
  if(route==="artist"){ ArtistPage(); }
  else if(route==="album" && id){ AlbumPage(id); }
  else{
    app.innerHTML = `
      <div class="section">
        <h2>Section en cours de construction</h2>
        <p>PAS FINI</p>
        <button class="btn" onclick="linkTo('#/artist')">Aller à l’artiste</button>
      </div>`;
  }
}
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);

// Expose pour onclick inline
window.linkTo = linkTo;


const player = document.getElementById("global-player");
const btnPlayPause = document.getElementById("btnPlayPause");
const progress = document.getElementById("progress");
const npCurrent = document.getElementById("np-current");
const npDuration = document.getElementById("np-duration");

btnPlayPause.addEventListener("click", ()=>{
  if (player.paused) { player.play(); btnPlayPause.textContent = "⏸"; }
  else { player.pause(); btnPlayPause.textContent = "▶️"; }
});



player.addEventListener("loadedmetadata", ()=>{
  progress.max = player.duration || 0;
  npDuration.textContent = secondsToMMSS(Math.floor(player.duration || 0));
});

player.addEventListener("timeupdate", ()=>{
  progress.value = player.currentTime || 0;
  npCurrent.textContent = secondsToMMSS(Math.floor(player.currentTime || 0));
});

progress.addEventListener("input", ()=>{ player.currentTime = Number(progress.value); });

player.addEventListener("ended", ()=>{
  if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length);
});






// ===== Bottom sheet controls (ouvrir/fermer le clip depuis la barre)
const clipSheet = document.getElementById("clip-sheet");
const sheetBody = clipSheet?.querySelector(".sheet-body");
const btnToggleClip = document.getElementById("btnToggleClip");
const btnCloseClip = document.getElementById("btnCloseClip");
const dock = document.getElementById("player-dock");
const gPlayer = document.getElementById("global-player");

function openClipSheet(){
  if (!clipSheet || !sheetBody || !gPlayer) return;
  sheetBody.appendChild(gPlayer);
  gPlayer.style.display = "block";          // on montre la vidéo
  clipSheet.classList.add("open");
  clipSheet.setAttribute("aria-hidden", "false");
  // ❗️On NE met PAS play ici : on suppose que la lecture est déjà en cours
}
function closeClipSheet(){
  if (!clipSheet || !dock || !gPlayer) return;
  dock.appendChild(gPlayer);
  gPlayer.style.display = "none";           // cache la vidéo mais laisse l'audio jouer
  clipSheet.classList.remove("open");
  clipSheet.setAttribute("aria-hidden", "true");
}

btnToggleClip?.addEventListener("click", ()=>{
  const isOpen = clipSheet.classList.contains("open");
  if (isOpen) {
    closeClipSheet();
    btnToggleClip.textContent = "⬆️";
  } else {
    openClipSheet();
    btnToggleClip.textContent = "⬇️";
  }
});

btnCloseClip?.addEventListener("click", ()=>{
  closeClipSheet();
  if (btnToggleClip) btnToggleClip.textContent = "⬆️";
});

// Bonus: si on change de piste pendant que la sheet est ouverte, s'assurer que la vidéo est dedans
function ensureClipPlacementOnPlay(){
  if (clipSheet.classList.contains("open")) {
    // si la sheet est ouverte, garantir que le player est bien dans la sheet
    if (sheetBody && gPlayer.parentElement !== sheetBody) sheetBody.appendChild(gPlayer);
    gPlayer.style.display = "block";
  }
}
