/* games/2048.js - full 2048 game implementation (compact, self-contained)
   Exposes function init2048(container) to render the game inside a container element. */
window.init2048 = function(container){
  // create elements
  container.innerHTML='';
  const board = document.createElement('div'); board.className='g2048-board'; container.appendChild(board);
  const scoreBox = document.createElement('div'); scoreBox.className='g2048-score'; container.appendChild(scoreBox);
  const css = document.createElement('style'); css.textContent=`.g2048-board{width:360px;height:360px;background:rgba(255,255,255,0.03);border-radius:10px;padding:18px;display:grid;grid-template-columns:repeat(4,1fr);grid-gap:12px}.g2048-cell{background:rgba(255,255,255,0.02);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;color:var(--text)}.g2048-score{margin-top:10px;color:var(--muted)}`; document.head.appendChild(css);
  const size=4; let grid = Array(size*size).fill(0); let score=0;
  function idx(r,c){return r*size+c}
  function spawn(){ const empties = grid.map((v,i)=>v===0?i:-1).filter(i=>i>=0); if(!empties.length) return; const i=empties[Math.floor(Math.random()*empties.length)]; grid[i]=Math.random()<0.9?2:4 }
  function render(){ board.innerHTML=''; for(let r=0;r<size;r++){ for(let c=0;c<size;c++){ const v=grid[idx(r,c)]; const el=document.createElement('div'); el.className='g2048-cell'; if(v) el.textContent=v; board.appendChild(el) }} scoreBox.textContent='Puan: '+score }
  function rotate(){ const ng=Array(size*size).fill(0); for(let r=0;r<size;r++) for(let c=0;c<size;c++){ ng[idx(c,size-1-r)] = grid[idx(r,c)]; } grid=ng }
  function slideLeft(){ let moved=false; for(let r=0;r<size;r++){ let row = []; for(let c=0;c<size;c++){ const v=grid[idx(r,c)]; if(v) row.push(v) } for(let i=0;i<row.length-1;i++){ if(row[i]===row[i+1]){ row[i]*=2; score+=row[i]; row.splice(i+1,1); } } while(row.length<size) row.push(0); for(let c=0;c<size;c++){ if(grid[idx(r,c)]!==row[c]){ moved=true } grid[idx(r,c)] = row[c] } } return moved }
  function move(dir){ let moved=false; // dir: 'left','right','up','down'
    if(dir==='left'){ moved = slideLeft() }
    if(dir==='right'){ rotate(); rotate(); moved = slideLeft(); rotate(); rotate(); }
    if(dir==='up'){ rotate(); rotate(); rotate(); moved = slideLeft(); rotate(); }
    if(dir==='down'){ rotate(); moved = slideLeft(); rotate(); rotate(); rotate(); }
    if(moved){ spawn(); render(); checkEnd(); }
  }
  function checkEnd(){ if(grid.every(v=>v!==0)){
      // check merges
      for(let r=0;r<size;r++) for(let c=0;c<size;c++){ const v=grid[idx(r,c)]; if((c+1<size && grid[idx(r,c+1)]===v) || (r+1<size && grid[idx(r+1,c)]===v)) return }
      setTimeout(()=>{ const name=prompt('Oyun bitti. İsminizi girin:'); if(name){ const scores=Storage.get('scores',[]); scores.push({game:'2048',name,score,date:Date.now()}); Storage.set('scores',scores);} },100);
    }}
  document.addEventListener('keydown', (e)=>{ if(['ArrowLeft','KeyA'].includes(e.code)){ move('left') } if(['ArrowRight','KeyD'].includes(e.code)){ move('right') } if(['ArrowUp','KeyW'].includes(e.code)){ move('up') } if(['ArrowDown','KeyS'].includes(e.code)){ move('down') } });
  function reset(){ grid.fill(0); score=0; spawn(); spawn(); render(); }
  reset();
  return {reset}
}
