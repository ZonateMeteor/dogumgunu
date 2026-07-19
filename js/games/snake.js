// games/snake.js - improved snake game (exposed as SnakeGame global initializer)
window.SnakeGame = function(container){
  // container: element to render into
  const w = 300; const h = 300; const cols = 20; const rows = 20; const cell = w/cols;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; canvas.style.display='block'; canvas.style.margin='12px auto';
  const ctx = canvas.getContext('2d'); container.innerHTML=''; container.appendChild(canvas);
  let dir = {x:1,y:0}; let snake = [{x:10,y:10}]; let food = randomFood(); let score=0; let running=true; let tick=0;
  function randomFood(){
    while(true){ const p={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)}; if(!snake.some(s=>s.x===p.x && s.y===p.y)) return p; }
  }
  function step(){ if(!running) return; tick++; if(tick%2!==0) return; const head={x:snake[snake.length-1].x+dir.x,y:snake[snake.length-1].y+dir.y};
    // wall collision
    if(head.x<0||head.y<0||head.x>=cols||head.y>=rows){end();return}
    // self collision
    if(snake.some(s=>s.x===head.x && s.y===head.y)){end();return}
    snake.push(head);
    if(head.x===food.x && head.y===food.y){ score++; food=randomFood(); } else { snake.shift(); }
    draw();
  }
  function draw(){ ctx.fillStyle='#081018'; ctx.fillRect(0,0,w,h); ctx.fillStyle='#0f8a5a'; snake.forEach(s=>ctx.fillRect(s.x*cell+2,s.y*cell+2,cell-4,cell-4)); ctx.fillStyle='#ff5d5d'; ctx.fillRect(food.x*cell+2,food.y*cell+2,cell-4,cell-4); }
  function end(){ running=false; clearInterval(loop); setTimeout(()=>{ const name=prompt('Oyun bitti. İsminizi girin:'); if(name){ const scores = Storage.get('scores',[]); scores.push({game:'snake',name,score,date:Date.now()}); Storage.set('scores',scores); } },50);} 
  document.addEventListener('keydown', (e)=>{ if(['ArrowUp','KeyW'].includes(e.code)&& dir.y!==1){dir={x:0,y:-1}} if(['ArrowDown','KeyS'].includes(e.code)&& dir.y!==-1){dir={x:0,y:1}} if(['ArrowLeft','KeyA'].includes(e.code)&& dir.x!==1){dir={x:-1,y:0}} if(['ArrowRight','KeyD'].includes(e.code)&& dir.x!==-1){dir={x:1,y:0}} });
  const loop = setInterval(step,80);
  draw();
  return {stop:()=>{running=false;clearInterval(loop)}}
}
