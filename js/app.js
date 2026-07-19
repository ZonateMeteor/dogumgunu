// app.js - revize: hash-based routing, improved UI and animations
(()=>{
  const app = document.getElementById('app');
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('overlay');
  const favPopup = document.getElementById('favorites-popup');
  const favoritesBtn = document.getElementById('favorites-btn');
  const hamburger = document.getElementById('hamburger');
  const closeMenuBtn = document.getElementById('close-menu');

  function q(sel){return document.querySelector(sel)}
  function qa(sel){return Array.from(document.querySelectorAll(sel))}

  // attach handlers
  hamburger.addEventListener('click', ()=>{ const open = hamburger.classList.toggle('open'); menu.classList.toggle('open',open); menu.setAttribute('aria-hidden', String(!open)); overlay.classList.toggle('active',open); hamburger.setAttribute('aria-expanded', String(open)); });
  closeMenuBtn.addEventListener('click', ()=>{ hamburger.classList.remove('open'); menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); overlay.classList.remove('active'); });
  overlay.addEventListener('click', ()=>{ hamburger.classList.remove('open'); menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); overlay.classList.remove('active'); closeFavorites(); });
  favoritesBtn.addEventListener('click', ()=>{ showFavorites(); overlay.classList.add('active'); });

  document.getElementById('open-message').addEventListener('click', ()=>{ showBirthdayMessage(); });

  function showBirthdayMessage(){ app.innerHTML = `<section class="hero"><div class="hero-card"><h2 class="big">Doğum Günün Kutlu Olsun!</h2><p class="lead">Bugün senin için yazılmış özel mesaj burada görünecek. Bunu README'den ya da index dosyasından değiştirebilirsin.</p><div class="hero-actions"><button id="back-home" class="btn-ghost">Geri</button></div></div></section>`; document.getElementById('back-home').addEventListener('click', ()=>{ location.hash = '#/'; route(); }); }

  // helper to fetch json relative to index
  async function safeFetchJSON(path){ try{ const res = await fetch(path); if(!res.ok) return []; return await res.json(); }catch(e){return []} }

  function escapeHtml(s){ return (s||'').toString().replace(/[&<>\"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]); }

  // pages
  async function renderHome(){ app.innerHTML = document.getElementById('welcome').outerHTML; // re-init buttons
    const om = document.getElementById('open-message'); if(om) om.addEventListener('click', ()=>showBirthdayMessage()); }

  async function renderSiirler(){ const data = await safeFetchJSON('pages/siirler/siirler.json'); app.innerHTML = `<section class="card content"><h2>Şiirler</h2><div id="siir-area"></div><div style="margin-top:12px"><button id="rastgele" class="btn-primary">Rastgele şiir getir</button> <button id="fav-list" class="btn-ghost">Favoriler</button></div></section>`; document.getElementById('rastgele').addEventListener('click', ()=>{ const area=document.getElementById('siir-area'); if(!data.length){area.innerHTML='<p>Henüz şiir yok.</p>';return} const p=data[Math.floor(Math.random()*data.length)]; area.innerHTML = `<div class="card"><h3>${escapeHtml(p.title)}</h3><pre>${escapeHtml(p.content)}</pre><div style="margin-top:8px"><button class="heart" data-id="${p.id}" data-type="siir">♡ Beğendim</button></div></div>`; const heart = area.querySelector('.heart'); if(Storage.get('favorites',[]).some(f=>f.id===p.id)) heart.classList.add('fav'); heart.addEventListener('click', ()=>{ if(heart.classList.contains('fav')){ Storage.removeFromArray('favorites',p.id); heart.classList.remove('fav') } else { Storage.addToArray('favorites',{id:p.id,title:p.title,type:'siir'}); heart.classList.add('fav') } }); }); }

  async function renderItiraflar(){ const data = await safeFetchJSON('pages/itiraflar/itiraflar.json'); app.innerHTML=`<section class="card content"><h2>İtiraflar</h2><div id="itiraf-area"></div><div style="margin-top:12px"><button id="rastgele-it" class="btn-primary">Rastgele getir</button></div></section>`; document.getElementById('rastgele-it').addEventListener('click', ()=>{ const area=document.getElementById('itiraf-area'); if(!data.length){area.innerHTML='<p>Henüz itiraf yok.</p>';return} const p=data[Math.floor(Math.random()*data.length)]; area.innerHTML = `<div class="card"><pre>${escapeHtml(p.content)}</pre><div style="margin-top:8px"><button class="heart" data-id="${p.id}" data-type="itiraf">♡ Beğendim</button></div></div>`; const heart = area.querySelector('.heart'); if(Storage.get('favorites',[]).some(f=>f.id===p.id)) heart.classList.add('fav'); heart.addEventListener('click', ()=>{ if(heart.classList.contains('fav')){ Storage.removeFromArray('favorites',p.id); heart.classList.remove('fav') } else { Storage.addToArray('favorites',{id:p.id,title:'İtiraf',type:'itiraf'}); heart.classList.add('fav') } }); }); }

  async function renderAnilar(){ const data = await safeFetchJSON('pages/anilar/anilar.json'); data.sort((a,b)=> new Date(a.date)-new Date(b.date)); if(!data.length){ app.innerHTML='<section class="card"><h2>Anılar</h2><p>Henüz anı yok.</p></section>'; return } let idx=0; function show(){ const item=data[idx]; app.innerHTML = `<section class="card content"><div style="display:flex;align-items:center;gap:12px"><button id="prev" class="btn-ghost">◀</button><div style="flex:1"><div style="color:var(--accent);font-weight:700">${escapeHtml(item.date)}</div><h3 style="text-transform:uppercase">${escapeHtml(item.event)}</h3><p>${escapeHtml(item.description)}</p></div><button id="next" class="btn-ghost">▶</button></div></section>`; document.getElementById('prev').addEventListener('click', ()=>{ if(idx>0){idx--; show()} }); document.getElementById('next').addEventListener('click', ()=>{ if(idx<data.length-1){idx++; show()} }); } show(); }

  async function renderMuzikler(){ const data = await safeFetchJSON('pages/muzikler/muzikler.json'); app.innerHTML=`<section class="card content"><h2>Müzikler</h2><ul id="music-list" style="list-style:none;padding:0;margin:0"></ul></section>`; const list = document.getElementById('music-list'); let audio = window._dg_audio || new Audio(); window._dg_audio = audio; let current=null; data.forEach(m=>{ const li=document.createElement('li'); li.style.margin='10px 0'; li.innerHTML = `<div style="display:flex;align-items:center;gap:12px"><div style="width:56px;height:56px;border-radius:8px;background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:center;overflow:hidden">${m.cover?'<img src="assets/muzik-kapaklari/'+m.cover+'" alt="cover" style="width:100%">':''}</div><div style="flex:1"><div style="font-weight:700">${escapeHtml(m.title)}</div><div style="color:var(--muted);font-size:13px">${escapeHtml(m.description||'')}</div></div><div><button class="play" data-file="assets/muzikler/${m.file}" data-id="${m.id}">▶</button></div></div>`; list.appendChild(li); }); list.addEventListener('click', (e)=>{ const btn = e.target.closest('button.play'); if(!btn) return; const file = btn.dataset.file; const id = btn.dataset.id; if(current && current!==btn){ audio.pause(); current.textContent='▶'; } if(current===btn && !audio.paused){ audio.pause(); btn.textContent='▶'; current=null; return } if(current===btn && audio.paused){ audio.play(); btn.textContent='⏸'; current=btn; return } audio.src = file; audio.play(); document.querySelectorAll('button.play').forEach(b=>b.textContent='▶'); btn.textContent='⏸'; current=btn; audio.onended = ()=>{ if(current) current.textContent='▶'; current=null; } }); }

  async function renderEtimoloji(){ const data = await safeFetchJSON('pages/etimoloji/etimoloji.json'); app.innerHTML=`<section class="card content"><h2>Etimoloji</h2><div id="et-area" style="min-height:140px"></div><div style="margin-top:12px"><button id="rastgele-et" class="btn-primary">Rastgele etimoloji getir</button></div></section>`; document.getElementById('rastgele-et').addEventListener('click', ()=>{ if(!data.length){document.getElementById('et-area').innerHTML='<p>Henüz ekleme yok.</p>';return} const item = data[Math.floor(Math.random()*data.length)]; document.getElementById('et-area').innerHTML = `<h1 style="font-size:36px;margin:0">${escapeHtml(item.word)}</h1><p style="margin-top:8px">${escapeHtml(item.etymology)}</p>`; }); }

  function renderOyunlar(){ app.innerHTML=`<section class="card content"><h2>Oyunlar</h2><ul><li><a href="#/oyunlar/snake" data-link>Yılan</a></li><li><a href="#/oyunlar/2048" data-link>2048</a></li></ul></section>`; }

  async function renderOyunSnake(){ app.innerHTML=`<section class="card content"><h2>Yılan</h2><div id="snake-container"></div></section>`; const cont=document.getElementById('snake-container'); if(window.SnakeGame){ window.SnakeGame(cont); } }

  async function renderOyun2048(){ app.innerHTML=`<section class="card content"><h2>2048</h2><div id="g2048"></div><div style="margin-top:12px"><button id="reset-2048" class="btn-ghost">Yeniden Başlat</button></div></section>`; const cont=document.getElementById('g2048'); if(window.init2048){ const game = window.init2048(cont); document.getElementById('reset-2048').addEventListener('click', ()=>game.reset()); } }

  async function renderGeribildirim(){ app.innerHTML=`<section class="card content"><h2>Geri Bildirim</h2><textarea id="fb-text" rows="6" style="width:100%"></textarea><div style="margin-top:8px"><button id="send-fb" class="btn-primary">Gönder</button></div><h3 style="margin-top:18px">Gönderilenler</h3><ul id="fb-list"></ul></section>`; document.getElementById('send-fb').addEventListener('click', ()=>{ const v=document.getElementById('fb-text').value.trim(); if(!v) return alert('Lütfen bir şey yazın'); const arr = Storage.get('feedback',[]); arr.push({text:v,date:Date.now()}); Storage.set('feedback',arr); document.getElementById('fb-text').value=''; renderFBList(); }); function renderFBList(){ const list = Storage.get('feedback',[]); const el=document.getElementById('fb-list'); el.innerHTML=''; list.forEach(f=>{ const li=document.createElement('li'); li.textContent = new Date(f.date).toLocaleString()+': '+f.text; el.appendChild(li); }); } renderFBList(); }

  async function renderTemalar(){ const data = await safeFetchJSON('pages/temalar/temalar.json'); app.innerHTML=`<section class="card content"><h2>Temalar</h2><ul id="theme-list"></ul></section>`; const list=document.getElementById('theme-list'); data.forEach(t=>{ const li=document.createElement('li'); li.style.margin='8px 0'; li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${escapeHtml(t.name)}</strong><div style="color:var(--muted)">${escapeHtml(t.description)}</div></div><button class="apply-theme" data-id="${t.id}">Uygula</button></div>`; list.appendChild(li); }); list.addEventListener('click',(e)=>{ const btn=e.target.closest('button.apply-theme'); if(!btn) return; const id=btn.dataset.id; const theme = data.find(x=>x.id===id); if(!theme) return; applyTheme(theme); Storage.set('activeTheme',theme); }); const active=Storage.get('activeTheme',null); if(active) applyTheme(active); }

  function applyTheme(t){ if(!t||!t.vars) return; Object.keys(t.vars).forEach(k=>document.documentElement.style.setProperty(k,t.vars[k])); }

  // favorites popup
  function showFavorites(){ const listEl = document.getElementById('favorites-list'); const favs = Storage.get('favorites',[]); listEl.innerHTML=''; if(!favs.length) listEl.innerHTML='<li>Boş</li>'; favs.forEach(f=>{ const li=document.createElement('li'); li.innerHTML=`<button class="fav-open" data-id="${f.id}" data-type="${f.type}">${escapeHtml(f.title)}</button> <button class="fav-remove" data-id="${f.id}">Kaldır</button>`; listEl.appendChild(li); }); favPopup.setAttribute('aria-hidden','false'); favPopup.style.display='block'; overlay.classList.add('active'); }
  function closeFavorites(){ favPopup.setAttribute('aria-hidden','true'); favPopup.style.display='none'; overlay.classList.remove('active'); }
  favPopup.addEventListener('click',(e)=>{ const open=e.target.closest('.fav-open'); if(open){ const type=open.dataset.type; closeFavorites(); if(type==='siir') location.hash='#/siirler'; if(type==='itiraf') location.hash='#/itiraflar'; route(); } const rem=e.target.closest('.fav-remove'); if(rem){ Storage.removeFromArray('favorites',rem.dataset.id); showFavorites(); } });

  // routing
  function route(){ const hash = location.hash || '#/'; const path = hash.replace(/^#/, ''); if(path==='/') return renderHome(); if(path.startsWith('/siirler')) return renderSiirler(); if(path.startsWith('/itiraflar')) return renderItiraflar(); if(path.startsWith('/anilar')) return renderAnilar(); if(path.startsWith('/muzikler')) return renderMuzikler(); if(path.startsWith('/etimoloji')) return renderEtimoloji(); if(path.startsWith('/oyunlar/snake')) return renderOyunSnake(); if(path.startsWith('/oyunlar/2048')) return renderOyun2048(); if(path.startsWith('/oyunlar')) return renderOyunlar(); if(path.startsWith('/geribildirim')) return renderGeribildirim(); if(path.startsWith('/temalar')) return renderTemalar(); return renderHome(); }
  window.addEventListener('hashchange', route);

  // init
  document.addEventListener('DOMContentLoaded', ()=>{ route(); // prevent unintended selections and pull-to-refresh
    document.body.style.touchAction='pan-y'; document.querySelectorAll('button,a').forEach(el=>el.style.userSelect='none'); // reapply active theme if set
    const active = Storage.get('activeTheme',null); if(active) applyTheme(active);
  });

})();
