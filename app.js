// ============ Utils =============
const $ = sel => document.querySelector(sel);
const app = $("#app");

function secondsToMMSS(s){
  const m = Math.floor(s/60);
  const ss = String(Math.floor(s%60)).padStart(2,"0");
  return `${m}:${ss}`;
}
function formatNumberShort(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.', ',') + " Mrd";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace('.', ',') + " M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1).replace('.', ',') + " k";
  return n.toString();
}
function linkTo(route){ location.hash = route; }

// ============ DB =============
const DB = {
  musics: [


    // IXEN
    { id:"trk-anpanman",  title:"Anpan Man",  duration:229, plays:1500000000, file:"assets/anpanman.mp4",  rank:1, albumId:"alb-bh",  artistId:"ar-ixen", cover:"assets/blue-horizon.png" },
    { id:"trk-sunshine",  title:"Sunshine",   duration:239, plays:820000000,   file:"assets/sunshine.mp4",  rank:2, albumId:"alb-bh",  artistId:"ar-ixen", cover:"assets/blue-horizon.png" },
    



    { id:"trk-babygirl", title:"Baby Girl",  duration:317, plays:234000000,    file:"assets/baby-girl-sun.mp3", rank:1, albumId:null, artistId:"ar-sun" },


   


    
  ],
  albums: [
    { id:"alb-bh",  title:"Blue Horizon", year:2025, cover:"assets/blue-horizon.png", artistId:"ar-ixen", tracks:["trk-anpanman","trk-sunshine"] },
   
  ],
  artists: [
    { id:"ar-ixen", name:"IXEN",  monthlyListeners:34545321, tags:["K-pop","Dance","Synthpop"], image:"assets/logo.png" },
    { id:"ar-sun", name:"Sun",  monthlyListeners:12345678, tags:["English","Rap"],       image:"assets/sun.jpg" },
    
  ]
};

const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
const M  = byId(DB.musics);
const A  = byId(DB.albums);
const AR = byId(DB.artists);

const getArtist = id => AR[id];
const getAlbum  = id => A[id];
const getTrack  = id => M[id];

function tracksByArtist(artistId){ return DB.musics.filter(t => t.artistId === artistId); }
function popularByArtist(artistId){ return tracksByArtist(artistId).filter(t => Number.isInteger(t.rank)).sort((a,b)=> a.rank - b.rank); }
function latestAlbumByArtist(artistId){
  const albums = DB.albums.filter(a => a.artistId === artistId);
  return albums.length ? [...albums].sort((a,b)=> b.year - a.year)[0] : null;
}
function singlesByArtist(artistId){ return tracksByArtist(artistId).filter(t => !t.albumId); }

// ============ Highlight ============
function clearPlayingHighlights(){
  document.querySelectorAll("tr.playing").forEach(tr => tr.classList.remove("playing"));
}
function highlightPlayingById(id){
  clearPlayingHighlights();
  document.querySelectorAll(`tr[data-id="${CSS.escape(id)}"]`).forEach(tr => tr.classList.add("playing"));
}

// ============ Player / Queue ============
let QUEUE = [];
let Q_INDEX = -1;

function setNowPlayingByTrackId(trackId){
  const t = getTrack(trackId);
  if (!t) return;
  const artist = getArtist(t.artistId);

  $("#np-title").textContent  = t.title;
  $("#np-artist").textContent = artist?.name || "—";

  const player = $("#global-player");
  if (t.file) {
    player.src = t.file;
    player.play().catch(()=>{});
    if (typeof ensureClipPlacementOnPlay === "function") ensureClipPlacementOnPlay();
  }
  highlightPlayingById(trackId);
}
function playFromQueue(index){
  if(index < 0 || index >= QUEUE.length) return;
  Q_INDEX = index;
  setNowPlayingByTrackId(QUEUE[Q_INDEX]);
  const btn = $("#btnPlayPause");
  if (btn) btn.textContent = "⏸";
}

// ============ Views ============
function HomePage(){
  const artistsSorted = [...DB.artists].sort((a,b)=> b.monthlyListeners - a.monthlyListeners);
  const top3 = artistsSorted.slice(0,3);

  app.innerHTML = `
    <div class="section">
      <h2>Top 3 artistes</h2>
      <div class="rank-list">
        ${top3.map((ar, i) => `
          <div class="rank-item" onclick="linkTo('#/artist/${ar.id}')">
            <div class="rank-no">${i+1}</div>
            <img src="${ar.image}" alt="${ar.name}" />
            <div class="rank-meta">
              <div class="title">${ar.name}</div>
              <div class="sub">${formatNumberShort(ar.monthlyListeners)} auditeurs mensuels</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="section">
      <h2>Tous les artistes</h2>
      <div class="grid">
        ${artistsSorted.map(ar => `
          <div class="card" onclick="linkTo('#/artist/${ar.id}')">
            <div class="cover">
              <img src="${ar.image}" alt="${ar.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">
            </div>
            <div class="title">${ar.name}</div>
            <div class="meta">${formatNumberShort(ar.monthlyListeners)} mensuels</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function ArtistPage(artistId){
  const artist  = getArtist(artistId) || DB.artists[0];
  const popular = popularByArtist(artist.id);
  const latest  = latestAlbumByArtist(artist.id);
  const singles = singlesByArtist(artist.id);

  app.innerHTML = `
    <div class="artist-header">
      <div class="artist-cover"><img src="${artist.image}" alt="Visuel ${artist.name}" /></div>
      <div class="artist-meta">
        <h1>${artist.name}</h1>
        <div class="subtitle">${formatNumberShort(artist.monthlyListeners)} auditeurs mensuels</div>
        <div class="chips">${(artist.tags||[]).map(t=>`<span class="chip">${t}</span>`).join("")}</div>
        <div style="margin-top:14px; display:flex; gap:10px">
          <button class="btn primary" id="btnPlay">Lecture</button>
          <button class="btn" id="btnFollow">Suivre</button>
        </div>
      </div>
    </div>

    ${latest ? `
    <div class="section">
      <div class="banner">
        <div class="info">
          <div class="thumb"><img src="${latest.cover}" alt="Pochette ${latest.title}"></div>
          <div>
            <span style="color:var(--muted); font-size:12px;">Dernière sortie • Album</span>
            <strong>${latest.title}</strong>
            <span style="color:var(--muted); font-size:12px;">${latest.year}</span>
          </div>
        </div>
        <div><button class="btn" onclick="linkTo('#/album/${latest.id}')">Voir</button></div>
      </div>
    </div>` : ""}

    <div class="section">
      <h2>Populaires</h2>
      <table class="table">
        <thead><tr><th>#</th><th>Titre</th><th>Lectures</th><th>Durée</th></tr></thead>
        <tbody>
          ${popular.map((t,i)=>`
            <tr data-id="${t.id}" data-play="${t.title}">
              <td>${i+1}</td><td>${t.title}</td><td>${formatNumberShort(t.plays)}</td><td>${secondsToMMSS(t.duration)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Singles</h2>
      ${
        singles.length
          ? `<table class="table">
               <thead><tr><th>#</th><th>Titre</th><th>Lectures</th><th>Durée</th></tr></thead>
               <tbody>
                 ${singles.map((t,i)=>`
                   <tr data-id="${t.id}" data-play="${t.title}">
                     <td>${i+1}</td><td>${t.title}</td><td>${formatNumberShort(t.plays)}</td><td>${secondsToMMSS(t.duration)}</td>
                   </tr>
                 `).join("")}
               </tbody>
             </table>`
          : `<p style="color:var(--muted);">Aucun single pour le moment.</p>`
      }
    </div>

    <div class="section">
      <h2>Albums</h2>
      <div class="grid">
        ${DB.albums.filter(a=>a.artistId===artist.id).map(album => `
          <div class="album-card" onclick="linkTo('#/album/${album.id}')">
            <div class="cover"><img src="${album.cover}" alt="Pochette de ${album.title}"></div>
            <h3>${album.title}</h3>
            <p>${album.year}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  $("#btnPlay")?.addEventListener("click", ()=>{
    const list = popular.length ? popular : tracksByArtist(artist.id);
    QUEUE = list.map(t => t.id);
    playFromQueue(0);
  });
  app.querySelectorAll('tr[data-id]')?.forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.getAttribute('data-id');
      const base = popular.length ? popular : tracksByArtist(artist.id);
      QUEUE = base.map(t => t.id);
      const idx = Math.max(0, QUEUE.findIndex(x => x === id));
      playFromQueue(idx);
    });
  });
}

function AlbumPage(id){
  const album = getAlbum(id);
  if(!album){ app.innerHTML = `<p>Album introuvable.</p>`; return; }
  const tracks = album.tracks.map(getTrack).filter(Boolean);

  app.innerHTML = `
    <div class="section"><button class="btn" onclick="history.back()">← Retour</button></div>
    <div class="section">
      <div class="artist-header">
        <div class="artist-cover"><img src="${album.cover || 'assets/placeholder.jpg'}" alt="Cover ${album.title}"></div>
        <div class="artist-meta">
          <h1>${album.title}</h1>
          <div class="subtitle">Album • ${album.year} • ${tracks.length} titres</div>
          <div style="margin-top:14px"><button class="btn primary" id="btnPlayAlbum">Lecture</button></div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Liste des titres</h2>
      <table class="table">
        <thead><tr><th>#</th><th>Titre</th><th>Durée</th></tr></thead>
        <tbody>
          ${tracks.map((t,i)=>`
            <tr data-id="${t.id}" data-play="${t.title}">
              <td>${i+1}</td><td>${t.title}</td><td>${secondsToMMSS(t.duration)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  $("#btnPlayAlbum")?.addEventListener("click", ()=>{
    QUEUE = tracks.map(t => t.id);
    playFromQueue(0);
  });
  app.querySelectorAll('tr[data-id]')?.forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.getAttribute('data-id');
      QUEUE = tracks.map(t => t.id);
      const idx = Math.max(0, QUEUE.findIndex(x => x === id));
      playFromQueue(idx);
    });
  });
}
function renderSearchShell(initialQuery=""){
  app.innerHTML = `
    <div class="section">
      <h2>Recherche</h2>
      <div style="display:flex; gap:10px; align-items:center;">
        <input id="search-input" type="search" placeholder="Artistes, morceaux, albums..."
               value="${(initialQuery||"").replace(/"/g,'&quot;')}"
               style="flex:1; background:var(--card); color:var(--text); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:10px 12px; outline:none;">
        <button class="btn" id="search-clear" ${initialQuery?"":"disabled"}>Effacer</button>
      </div>
    </div>
    <div id="search-results"></div>
  `;

  const $input = $("#search-input");
  const $clear = $("#search-clear");

  const updateHash = (val)=>{
    const q = encodeURIComponent(val);
    const newHash = `#/search${q ? `?q=${q}` : ""}`;
    if (location.hash !== newHash) history.replaceState(null, "", newHash);
  };

  const doSearch = (val)=>{
    updateHash(val);
    renderSearchResults(val);
    $clear.disabled = !val;
  };

  $input?.addEventListener("input", debounce(e => { doSearch(e.target.value || ""); }, 150, "search-input"));
  $input?.addEventListener("keydown", (e)=>{ if (e.key === "Enter") { e.preventDefault(); doSearch(e.target.value || ""); }});
  $clear?.addEventListener("click", ()=>{ $input.value = ""; doSearch(""); $input.focus(); });
}

function renderSearchResults(query=""){
  const wrap = $("#search-results");
  if (!wrap) return;
  const { artists, tracks, albums } = searchAll(query);

  const artistsHTML = artists.length ? `
    <div class="section">
      <h2>Artistes</h2>
      <div class="grid">
        ${artists.map(ar => `
          <div class="card" onclick="linkTo('#/artist/${ar.id}')">
            <div class="cover">
              <img src="${ar.image}" alt="${ar.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">
            </div>
            <div class="title">${ar.name}</div>
            <div class="meta">${formatNumberShort(ar.monthlyListeners)} mensuels</div>
          </div>
        `).join("")}
      </div>
    </div>` : `<div class="section"><h2>Artistes</h2><p style="color:var(--muted)">Aucun artiste</p></div>`;

  const tracksHTML = `
    <div class="section">
      <h2>Morceaux</h2>
      ${
        (tracks.length ? `
        <table class="table">
          <thead><tr><th>#</th><th>Titre</th><th>Artiste</th><th>Album</th><th>Lectures</th><th>Durée</th></tr></thead>
          <tbody>
            ${tracks.map((t,i)=>{
              const ar = AR[t.artistId];
              const al = A[t.albumId];
              const artistCell = ar
                ? `<a href="#/artist/${ar.id}" onclick="event.stopPropagation()">${ar.name}</a>`
                : "—";
              const albumCell = al
                ? `<a href="#/album/${al.id}" onclick="event.stopPropagation()">${al.title}</a>`
                : "—";
              return `
                <tr data-id="${t.id}" data-play="${t.title}">
                  <td>${i+1}</td>
                  <td>${t.title}</td>
                  <td>${artistCell}</td>
                  <td>${albumCell}</td>
                  <td>${formatNumberShort(t.plays)}</td>
                  <td>${secondsToMMSS(t.duration)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>` : `<p style="color:var(--muted)">Aucun morceau</p>` )
      }
    </div>`;

  const albumsHTML = albums.length ? `
    <div class="section">
      <h2>Albums</h2>
      <div class="grid">
        ${albums.map(al => {
          const ar = AR[al.artistId];
          return `
            <div class="album-card" onclick="linkTo('#/album/${al.id}')">
              <div class="cover"><img src="${al.cover}" alt="Pochette ${al.title}"></div>
              <h3>${al.title}</h3>
              <p>${al.year} • ${ar?.name||""}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>` : `<div class="section"><h2>Albums</h2><p style="color:var(--muted)">Aucun album</p></div>`;

  wrap.innerHTML = artistsHTML + tracksHTML + albumsHTML;

  // play on row click (ne réattacher que sur la table actuelle)
  wrap.querySelectorAll('tr[data-id]')?.forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.getAttribute('data-id');
      const list = tracks;
      QUEUE = list.map(t => t.id);
      const idx = Math.max(0, QUEUE.findIndex(x => x === id));
      playFromQueue(idx);
    });
  });
}

function SearchPage(query = ""){
  if (!$("#search-input")) {
    renderSearchShell(query);
  } else {
    // si on vient d’un lien (ex: nav), sync la valeur et garde le focus
    const $input = $("#search-input");
    $input.value = query || "";
  }
  renderSearchResults(query);
  // garder le focus dans l’input
  const $input = $("#search-input");
  if ($input) {
    const pos = $input.value.length;
    $input.focus();
    try { $input.setSelectionRange(pos, pos); } catch {}
  }
}



// ============ Router ============
function router(){
  const raw = location.hash || "#/home";
  // raw ex: "#/search?q=ixen"
  const noHash = raw.startsWith("#") ? raw.slice(1) : raw; // "/search?q=ixen"
  const [path, qs=""] = noHash.split("?");
  const parts = path.split("/").filter(Boolean); // ["search"]
  const route = parts[0] || "home";
  const id    = parts[1];
  const params = new URLSearchParams(qs);

  if (route === "home") { HomePage(); }
  else if (route === "artist" && id) { ArtistPage(id); }
  else if (route === "artist") { ArtistPage(DB.artists[0].id); }
  else if (route === "album" && id) { AlbumPage(id); }
  else if (route === "search") { SearchPage(params.get("q") || ""); }
  else {
    app.innerHTML = `
      <div class="section">
        <h2>Section en cours de construction</h2>
        <p>PAS FINI</p>
        <button class="btn" onclick="linkTo('#/home')">Aller à l’accueil</button>
      </div>`;
  }

  // nav active
  document.querySelectorAll(".nav a").forEach(a=>{
    const href = a.getAttribute("href") || "";
    const cur  = `#/${route}`;
    a.classList.toggle("active", href.startsWith(cur));
  });
}


// ============ Boot ============
function safeStart(){ try { router(); } catch(e){ console.error(e); app.innerHTML = `<pre>${e.stack||e}</pre>`; } }
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", safeStart);
else safeStart();
window.addEventListener("hashchange", router);

// ============ Player controls & clip sheet ============
const player = $("#global-player");
const btnPlayPause = $("#btnPlayPause");
const btnNext = $("#btnNext");
const btnPrev = $("#btnPrev");
const progress = $("#progress");
const npCurrent = $("#np-current");
const npDuration = $("#np-duration");

btnPlayPause?.addEventListener("click", ()=>{
  if (player.paused) { player.play(); btnPlayPause.textContent = "⏸"; }
  else { player.pause(); btnPlayPause.textContent = "▶️"; }
});
btnNext?.addEventListener("click", ()=>{ if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length); });
btnPrev?.addEventListener("click", ()=>{ if(QUEUE.length) playFromQueue((Q_INDEX-1+QUEUE.length) % QUEUE.length); });

player.addEventListener("loadedmetadata", ()=>{
  progress.max = player.duration || 0;
  npDuration.textContent = secondsToMMSS(player.duration || 0);
});
player.addEventListener("timeupdate", ()=>{
  progress.value = player.currentTime || 0;
  npCurrent.textContent = secondsToMMSS(player.currentTime || 0);
});
progress.addEventListener("input", ()=>{ player.currentTime = Number(progress.value); });
player.addEventListener("ended", ()=>{ if(QUEUE.length) playFromQueue((Q_INDEX+1) % QUEUE.length); });

const clipSheet   = $("#clip-sheet");
const sheetBody   = clipSheet?.querySelector(".sheet-body");
const btnToggleClip = $("#btnToggleClip");
const btnCloseClip  = $("#btnCloseClip");
const dock        = $("#player-dock");
const gPlayer     = $("#global-player");

function openClipSheet(){
  if (!clipSheet || !sheetBody || !gPlayer) return;
  sheetBody.appendChild(gPlayer);
  clipSheet.classList.add("open");
  clipSheet.setAttribute("aria-hidden", "false");
}
function closeClipSheet(){
  if (!clipSheet || !dock || !gPlayer) return;
  dock.appendChild(gPlayer);
  clipSheet.classList.remove("open");
  clipSheet.setAttribute("aria-hidden", "true");
}
btnToggleClip?.addEventListener("click", ()=>{
  const isOpen = clipSheet.classList.contains("open");
  if (isOpen) { closeClipSheet(); btnToggleClip.textContent = "⬆️"; }
  else { openClipSheet(); btnToggleClip.textContent = "⬇️"; }
});
btnCloseClip?.addEventListener("click", ()=>{ closeClipSheet(); if (btnToggleClip) btnToggleClip.textContent = "⬆️"; });
function ensureClipPlacementOnPlay(){
  if (clipSheet.classList.contains("open")) {
    if (sheetBody && gPlayer.parentElement !== sheetBody) sheetBody.appendChild(gPlayer);
  }
}

// ============ Expose pour HTML inline ============
window.linkTo = linkTo;
window.playFromQueue = playFromQueue;
window.setNowPlayingByTrackId = setNowPlayingByTrackId;
window.ensureClipPlacementOnPlay = ensureClipPlacementOnPlay;

// ---------- Helpers recherche ----------
const debounces = {};
function debounce(fn, delay = 200, key = "default"){
  return (...args) => {
    clearTimeout(debounces[key]);
    debounces[key] = setTimeout(() => fn(...args), delay);
  };
}
function norm(s){
  return (s||"")
    .toString()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"") // retire accents
    .toLowerCase().trim();
}
// score simple: présence + priorité début de mot + exact id
function scoreText(text, q){
  text = norm(text); q = norm(q);
  if (!q || !text) return 0;
  if (text === q) return 1000;
  const i = text.indexOf(q);
  if (i === 0) return 500;     // commence par
  if (i > 0)  return 200;      // contient
  return 0;
}
function searchAll(q){
  const qq = norm(q);
  if (!qq) return {
    artists: [...DB.artists].sort((a,b)=> b.monthlyListeners - a.monthlyListeners).slice(0,8),
    tracks:  [...DB.musics].filter(t=> Number.isInteger(t.rank)).sort((a,b)=> a.rank - b.rank).slice(0,8),
    albums:  [...DB.albums].sort((a,b)=> b.year - a.year).slice(0,8)
  };

  const artists = DB.artists
    .map(a => ({ a, s: Math.max(
      scoreText(a.name, qq),
      scoreText((a.tags||[]).join(" "), qq)
    )}))
    .filter(x => x.s>0)
    .sort((x,y)=> y.s - x.s || (y.a.monthlyListeners - x.a.monthlyListeners))
    .map(x=>x.a)
    .slice(0,12);

  const tracks = DB.musics
    .map(t => {
      const ar = AR[t.artistId];
      const al = A[t.albumId];
      const s = Math.max(
        scoreText(t.title, qq),
        scoreText(ar?.name||"", qq),
        scoreText(al?.title||"", qq)
      );
      return { t, s };
    })
    .filter(x => x.s>0)
    .sort((x,y)=> y.s - x.s || (y.t.plays - x.t.plays))
    .map(x=>x.t)
    .slice(0,20);

  const albums = DB.albums
    .map(al => {
      const ar = AR[al.artistId];
      const s = Math.max(
        scoreText(al.title, qq),
        scoreText(ar?.name||"", qq)
      );
      return { al, s };
    })
    .filter(x => x.s>0)
    .sort((x,y)=> y.s - x.s || (y.al.year - x.al.year))
    .map(x=>x.al)
    .slice(0,12);

  return { artists, tracks, albums };
}

