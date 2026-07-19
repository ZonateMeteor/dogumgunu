// app.js - SPA router & page logic
(()=>{
  const app = document.getElementById('app');
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('overlay');
  const favPopup = document.getElementById('favorites-popup');
  const favoritesBtn = document.getElementById('favorites-btn');
  const hamburger = document.getElementById('hamburger');
  const closeMenuBtn = document.getElementById('close-menu');
  const openMessageBtn = document.getElementById('open-message');

  // single audio instance
  let audio = new Audio();
  let currentAudioId = null;

  function safeFetchJSON(path){
    return fetch(path).then(r=>r.ok? r.json(): Promise.resolve([])).catch(()=>[]);
  }

  function renderHome(){
    app.innerHTML = `
      <section class="center-screen">
        <h2>Merhaba...</h2>
        <button id="open-message" class="primary">Tıkla</button>
        <p class="hint">Daha fazlası için sol üstteki üç çizgiye basabilirsiniz.</p>
      </section>
    `;
    document.getElementById('open-message').addEventListener('click',()=>{
      app.innerHTML = `<section class="center-screen"><h2>Doğum Günün Kutlu Olsun!</h2><p class="hint">Bu mesajı dilediğin gibi düzenleyebilirsin.</p></section>`;
    });
  }

  async function renderSiirler(){
    const data = await safeFetchJSON('/pages/siirler/siirler.json');
    const id = 'siir_'+Math.random().toString(36).slice(2,9);
    app.innerHTML = `<section class="card"><h2>Şiirler</h2><div id="siir-area"></div><div style="margin-top:12px"><button id="rastgele" class="primary">Rastgele şiir getir</button> <button id="fav-list" class="icon-btn">Favoriler</button></div></section>`;
    const area = document.getElementById('siir-area');
    function showPoem(p){
      area.innerHTML = `<h3>${escapeHtml(p.title)}</h3><pre style="white-space:pre-wrap">${escapeHtml(p.content)}</pre><div><button class="heart" data-id="${p.id}">♡ Beğendim</button></div>`;
      const heart = area.querySelector('.heart');
      const favs = Storage.get('favorites',[]);
      if(favs.some(f=>f.id===p.id)) heart.classList.add('fav');
      heart.addEventListener('click',()=>{
        const id = p.id;
        if(heart.classList.contains('fav')){
          Storage.removeFromArray('favorites',id);
          heart.classList.remove('fav');
        } else {
          Storage.addToArray('favorites',{id:id,title:p.title,type:'siir'});
          heart.classList.add('fav');
        }
      });
    }
    document.getElementById('rastgele').addEventListener('click',()=>{
      if(!data.length){ area.innerHTML='<p>Henüz şiir yok.</p>'; return }
      const p = data[Math.floor(Math.random()*data.length)]; showPoem(p);
    });
  }

  async function renderItiraflar(){
    const data = await safeFetchJSON('/pages/itiraflar/itiraflar.json');
    app.innerHTML = `<section class="card"><h2>İtiraflar</h2><div id="itiraf-area"></div><div style="margin-top:12px"><button id="rastgele-it" class="primary">Rastgele getir</button></div></section>`;
    const area = document.getElementById('itiraf-area');
    document.getElementById('rastgele-it').addEventListener('click',()=>{
      if(!data.length){ area.innerHTML='<p>Henüz itiraf yok.</p>'; return }
      const p = data[Math.floor(Math.random()*data.length)];
      area.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(p.content)}</pre><div><button class="heart" data-id="${p.id}">♡ Beğendim</button></div>`;
      const heart = area.querySelector('.heart');
      if(Storage.get('favorites',[]).some(f=>f.id===p.id)) heart.classList.add('fav');
      heart.addEventListener('click',()=>{
        if(heart.classList.contains('fav')){Storage.removeFromArray('favorites',p.id);heart.classList.remove('fav')}else{Storage.addToArray('favorites',{id:p.id,title:'İtiraf',type:'itiraf'});heart.classList.add('fav')}
      });
    });
  }

  async function renderAnilar(){
    const data = await safeFetchJSON('/pages/anilar/anilar.json');
    data.sort((a,b)=> new Date(a.date)-new Date(b.date));
    let idx = 0;
    function show(){
      if(!data.length){ app.innerHTML='<section class="card"><h2>Anılar</h2><p>Henüz anı yok.</p></section>'; return }
      const item = data[idx];
      app.innerHTML = `<section class="card"><div style="display:flex;justify-content:space-between;align-items:center"><button id="prev">◀</button><div style="flex:1;padding:0 12px"><div style="color:var(--accent);font-weight:700">${escapeHtml(item.date)}</div><h3 style="text-transform:uppercase">${escapeHtml(item.event)}</h3><p>${escapeHtml(item.description)}</p></div><button id="next">▶</button></div></section>`;
      document.getElementById('prev').addEventListener('click',()=>{ if(idx>0){idx--; show();} });
      document.getElementById('next').addEventListener('click',()=>{ if(idx<data.length-1){idx++; show();} });
    }
    show();
  }

  async function renderMuzikler(){
    const data = await safeFetchJSON('/pages/muzikler/muzikler.json');
    app.innerHTML = `<section class="card"><h2>Müzikler</h2><ul id="music-list"></ul></section>`;
    const list = document.getElementById('music-list');
    data.forEach(m=>{
      const li = document.createElement('li');
      li.style.margin='8px 0';
      li.innerHTML = `<div style="display:flex;align-items:center;gap:12px"><div style="width:48px;height:48px;background:#222;border-radius:6px;display:flex;align-items:center;justify-content:center">${m.cover?'<img src="/assets/muzik-kapaklari/'+m.cover+'" alt="cover" style="max-width:100%;max-height:100%">':''}</div><div style="flex:1"><div style="font-weight:600">${escapeHtml(m.title)}</div><div style="color:var(--muted);font-size:13px">${escapeHtml(m.description||'')}</div></div><div><button class="play" data-id="${m.id}" data-file="/assets/muzikler/${m.file}">▶</button></div></div>`;
      list.appendChild(li);
    });
    list.addEventListener('click', (e)=>{
      const btn = e.target.closest('button.play'); if(!btn) return;
      const file = btn.dataset.file; const id = btn.dataset.id;
      if(currentAudioId && currentAudioId!==id){ audio.pause(); audio.currentTime=0; }
      if(currentAudioId===id && !audio.paused){ audio.pause(); btn.textContent='▶'; currentAudioId=null; return }
      if(currentAudioId===id && audio.paused){ audio.play(); btn.textContent='⏸'; currentAudioId=id; return }
      audio.src = file; audio.play();
      // update buttons
      document.querySelectorAll('button.play').forEach(b=>b.textContent='▶');
      btn.textContent='⏸'; currentAudioId=id;
      audio.onended = ()=>{ btn.textContent='▶'; currentAudioId=null };
    });
  }

  async function renderEtimoloji(){
    const data = await safeFetchJSON('/pages/etimoloji/etimoloji.json');
    app.innerHTML = `<section class="card"><h2>Etimoloji</h2><div id="et-area" style="min-height:120px"></div><div style="margin-top:12px"><button id="rastgele-et" class="primary">Rastgele etimoloji getir</button></div></section>`;
    document.getElementById('rastgele-et').addEventListener('click',()=>{
      if(!data.length){document.getElementById('et-area').innerHTML='<p>Henüz ekleme yok.</p>';return}
      const item = data[Math.floor(Math.random()*data.length)];
      document.getElementById('et-area').innerHTML = `<h1 style="font-size:36px;margin:0">${escapeHtml(item.word)}</h1><p style="margin-top:8px">${escapeHtml(item.etymology)}</p>`;
    });
  }

  function renderOyunlar(){
    app.innerHTML = `<section class="card"><h2>Oyunlar</h2><ul><li><a href="/oyunlar/snake" data-link>Yılan</a></li><li><a href="/oyunlar/2048" data-link>2048</a></li><li><a href="/oyunlar/tahta" data-link>Basit Tahta Oyunu</a></li></ul></section>`;
  }

  async function renderOyunSnake(){
    // minimal canvas snake
    app.innerHTML = `<section class="card"><h2>Yılan</h2><canvas id="snake-c" width="300" height="300" style="background:#081018;display:block;margin:12px auto;border-radius:8px"></canvas><div id="snake-score"></div></section>`;
    const canvas = document.getElementById('snake-c'); const ctx = canvas.getContext('2d');
    const grid=15; let px=5,py=5,dx=1,dy=0; let tail=[{x:5,y:5}]; let food={x:10,y:10}; let score=0; const loop = setInterval(()=>{
      px+=dx; py+=dy; if(px<0||py<0||px>=20||py>=20){end();return}
      tail.push({x:px,y:py}); if(tail.length>score+5) tail.shift();
      if(px===food.x && py===food.y){ score++; food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)} }
      // collision
      for(let i=0;i<tail.length-1;i++){if(tail[i].x===px && tail[i].y===py){end();return}}
      // draw
      ctx.fillStyle='#081018'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#4caf50'; tail.forEach(p=>ctx.fillRect(p.x*grid,p.y*grid,grid-2,grid-2));
      ctx.fillStyle='#f44336'; ctx.fillRect(food.x*grid,food.y*grid,grid-2,grid-2);
      document.getElementById('snake-score').textContent='Puan: '+score;
    },120);
    function end(){ clearInterval(loop); const name = prompt('Oyun bitti. İsmini gir:'); if(name){ const scores = Storage.get('scores',[]); scores.push({game:'snake',name,score,date:Date.now()}); Storage.set('scores',scores)} }
    window.addEventListener('keydown', (e)=>{ if(e.key==='ArrowUp' && dy!==1){dx=0;dy=-1} if(e.key==='ArrowDown' && dy!==-1){dx=0;dy=1} if(e.key==='ArrowLeft' && dx!==1){dx=-1;dy=0} if(e.key==='ArrowRight' && dx!==-1){dx=1;dy=0} });
  }

  function render2048(){
    // stub - simple notice and link to full version later
    app.innerHTML = `<section class="card"><h2>2048</h2><p>Basit 2048 oyunu buraya gelecek (tam versiyon). Şimdilik placeholder.</p></section>`;
  }

  async function renderGeribildirim(){
    app.innerHTML = `<section class="card"><h2>Geri Bildirim</h2><textarea id="fb-text" rows="6" style="width:100%"></textarea><div style="margin-top:8px"><button id="send-fb" class="primary">Gönder</button></div><h3>Gönderilenler</h3><ul id="fb-list"></ul></section>`;
    document.getElementById('send-fb').addEventListener('click',()=>{
      const v = document.getElementById('fb-text').value.trim(); if(!v) return alert('Bir şey yazın');
      const arr = Storage.get('feedback',[]); arr.push({text:v,date:Date.now()}); Storage.set('feedback',arr); document.getElementById('fb-text').value=''; renderFBList();
    });
    function renderFBList(){ const list = Storage.get('feedback',[]); const el = document.getElementById('fb-list'); el.innerHTML=''; list.forEach(f=>{const li=document.createElement('li'); li.textContent=new Date(f.date).toLocaleString()+': '+f.text; el.appendChild(li)}); }
    renderFBList();
  }

  async function renderTemalar(){
    const data = await safeFetchJSON('/pages/temalar/temalar.json');
    app.innerHTML = `<section class="card"><h2>Temalar</h2><ul id="theme-list"></ul></section>`;
    const list = document.getElementById('theme-list');
    data.forEach(t=>{
      const li=document.createElement('li'); li.style.margin='8px 0'; li.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${escapeHtml(t.name)}</strong><div style="color:var(--muted)">${escapeHtml(t.description)}</div></div><button class="apply-theme" data-id="${t.id}">Uygula</button></div>`; list.appendChild(li);
    });
    list.addEventListener('click', (e)=>{ const btn = e.target.closest('button.apply-theme'); if(!btn) return; const id=btn.dataset.id; const theme = data.find(x=>x.id===id); if(!theme) return; applyTheme(theme); Storage.set('activeTheme',theme); });
    const active = Storage.get('activeTheme',null); if(active) applyTheme(active);
  }

  function applyTheme(t){ if(!t||!t.vars) return; Object.keys(t.vars).forEach(k=>document.documentElement.style.setProperty(k,t.vars[k])); }

  function showFavorites(){ const list = document.getElementById('favorites-list'); const favs = Storage.get('favorites',[]); list.innerHTML=''; if(!favs.length) list.innerHTML='<li>Boş</li>'; favs.forEach(f=>{ const li=document.createElement('li'); li.innerHTML=`<button class="fav-open" data-id="${f.id}" data-type="${f.type}">${escapeHtml(f.title)}</button> <button class="fav-remove" data-id="${f.id}">Kaldır</button>`; list.appendChild(li); }); favPopup.classList.remove('hidden'); favPopup.setAttribute('aria-hidden','false'); overlay.classList.remove('hidden'); overlay.classList.add('active'); }

  function closeFavorites(){ favPopup.classList.add('hidden'); favPopup.setAttribute('aria-hidden','true'); overlay.classList.add('hidden'); }

  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]); }

  // routing
  async function navigateTo(url,replace=false){
    if(!replace) history.pushState({url},'',url);
    await route();
    closeMenu();
  }

  async function route(){
    const path = location.pathname;
    if(path==='/'||path==='/index.html'){ renderHome(); return }
    if(path.startsWith('/siirler')){ await renderSiirler(); return }
    if(path.startsWith('/itiraflar')){ await renderItiraflar(); return }
    if(path.startsWith('/anilar')){ await renderAnilar(); return }
    if(path.startsWith('/muzikler')){ await renderMuzikler(); return }
    if(path.startsWith('/etimoloji')){ await renderEtimoloji(); return }
    if(path.startsWith('/oyunlar/snake')){ await renderOyunSnake(); return }
    if(path.startsWith('/oyunlar/2048')){ render2048(); return }
    if(path.startsWith('/oyunlar')){ renderOyunlar(); return }
    if(path.startsWith('/geribildirim')){ await renderGeribildirim(); return }
    if(path.startsWith('/temalar')){ await renderTemalar(); return }
    // default
    renderHome();
  }

  // menu handlers
  function openMenu(){ menu.classList.remove('hidden'); menu.setAttribute('aria-hidden','false'); overlay.classList.remove('hidden'); }
  function closeMenu(){ menu.classList.add('hidden'); menu.setAttribute('aria-hidden','true'); overlay.classList.add('hidden'); }

  hamburger.addEventListener('click', ()=>{ openMenu(); });
  document.getElementById('close-menu').addEventListener('click',()=>closeMenu());
  overlay.addEventListener('click', ()=>{ closeMenu(); closeFavorites(); });
  favoritesBtn.addEventListener('click', ()=>{ showFavorites() });
  document.getElementById('close-favs').addEventListener('click', ()=>closeFavorites());
  favPopup.addEventListener('click',(e)=>{ const open = e.target.closest('.fav-open'); if(open){ const id=open.dataset.id; const type=open.dataset.type; closeFavorites(); if(type==='siir') navigateTo('/siirler'); if(type==='itiraf') navigateTo('/itiraflar'); } const rem = e.target.closest('.fav-remove'); if(rem){ Storage.removeFromArray('favorites',rem.dataset.id); showFavorites(); } });

  // handle delegated link clicks
  document.body.addEventListener('click',(e)=>{
    const a = e.target.closest('[data-link]'); if(a){ e.preventDefault(); const href=a.getAttribute('href'); navigateTo(href); }
  });

  // prevent accidental selection during UI interactions
  document.body.addEventListener('mousedown', (e)=>{ if(e.target.tagName==='BUTTON' || e.target.closest('button')) e.preventDefault(); });

  // prevent accidental pull-to-refresh/overscroll on mobile
  window.addEventListener('touchmove', (e)=>{ /* no-op, overscroll-behavior handles it */ },{passive:true});

  // history popstate
  window.addEventListener('popstate', ()=>{ route(); });

  // init
  route();
})();
