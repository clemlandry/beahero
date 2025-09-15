// --- Données fictives (à adapter à ton RP) ---

function formatNumberShort(n) {
  if (n >= 1_000_000) {
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
  setNowPlaying(t.title, t.artist, t.file);
  // maj du bouton ▶️/⏸
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
document.getElementById("player").addEventListener("ended", ()=>{
  if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length);
});

const DB = {
  artist: {
    id: "IXEN",
    name: "IXEN",
    monthlyListeners: 1245678,
    tags: ["K-pop", "Dance", "Synthpop"],
    popular: [
      { id:"trk-anpanman", title:"Anpan Man", duration:229, plays:18504567, file:"assets/anpanman.mp3", cover:"assets/blue-horizon.png" },
     
    ],
    albums: [
      {
        id: "alb-bh",
        title: "Blue Horizon",
        year: 2025,
        type: "Album",
        cover: "assets/blue-horizon.png",
        tracks: [
          { no:1, title:"Anpan Man", duration:206, file:"assets/anpanman.mp3" },
          
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

function setNowPlaying(title, artist, file, cover){
  const titleEl = document.getElementById("np-title");
  const artistEl = document.getElementById("np-artist");
  titleEl.textContent = title;
  artistEl.textContent = artist;

  const img = document.getElementById("np-cover");
  if (img && cover) img.src = cover;

  const player = document.getElementById("player");
  if (file) {
    player.src = file;
    player.play();
  }
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
            <tr data-play="${t.title}">
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

 


  // Interactions
 $("#btnPlay").addEventListener("click", ()=>{
  // remplit la file avec les populaires (avec cover si tu l’as mise côté popular)
  QUEUE = popular.map(t => ({ title:t.title, artist:DB.artist.name, file:t.file, cover:t.cover }));
  playFromQueue(0); // lance le premier
});

 
 app.querySelectorAll("tr[data-play]").forEach(row=>{
  row.addEventListener("click", ()=>{
    const title = row.getAttribute("data-play");
    // dans ArtistPage(), au clic d’une ligne populaire :
const track = popular.find(t => t.title === title);
if(track){
  QUEUE = popular.map(t => ({ title:t.title, artist:DB.artist.name, file:t.file })); // file = populaires
  playFromQueue(popular.indexOf(track));
}

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
            <tr data-play="${t.title}">
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
    setNowPlaying(album.tracks[0].title, DB.artist.name);
  });
  app.querySelectorAll("tr[data-play]").forEach(row=>{
  row.addEventListener("click", ()=>{
    const title = row.getAttribute("data-play");
    // essaie de retrouver un file via la liste 'popular'
    const fromPopular = DB.artist.popular.find(t => t.title === title);
    const file = fromPopular ? fromPopular.file : undefined;
    setNowPlaying(title, DB.artist.name, file);
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


const player = document.getElementById("player");
const btnPlayPause = document.getElementById("btnPlayPause");
const progress = document.getElementById("progress");
const npCurrent = document.getElementById("np-current");
const npDuration = document.getElementById("np-duration");

btnPlayPause.addEventListener("click", ()=>{
  if (player.paused) {
    player.play();
    btnPlayPause.textContent = "⏸";
  } else {
    player.pause();
    btnPlayPause.textContent = "▶️";
  }
});

player.addEventListener("loadedmetadata", ()=>{
  progress.max = player.duration;
  npDuration.textContent = secondsToMMSS(Math.floor(player.duration));
});

player.addEventListener("timeupdate", ()=>{
  progress.value = player.currentTime;
  npCurrent.textContent = secondsToMMSS(Math.floor(player.currentTime));
});

progress.addEventListener("input", ()=>{
  player.currentTime = progress.value;
});





