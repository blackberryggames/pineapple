// Two small starter games the admin can add with one click, so a fresh site isn't empty.
export type Sample = { title: string; description: string; controls: string; category: string; tags: string[]; html: string };

const snake = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>
html,body{margin:0;height:100%;background:#1b2a1f;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#e8f5d0;touch-action:none}
canvas{background:#16231a;border:4px solid #2f8f55;border-radius:10px;max-width:96vw;max-height:80vh}
#s{margin:8px;font-weight:800;letter-spacing:.05em}</style><div id=s>SCORE 0</div><canvas id=c width=400 height=400></canvas>
<script>
const c=document.getElementById('c'),x=c.getContext('2d'),N=20,S=20;let sn,d,nd,f,sc,dead,t;
function reset(){sn=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];d=nd={x:1,y:0};sc=0;dead=false;food();}
function food(){do{f={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(sn.some(p=>p.x==f.x&&p.y==f.y))}
function step(){if(dead)return;d=nd;const h={x:sn[0].x+d.x,y:sn[0].y+d.y};
if(h.x<0||h.y<0||h.x>=N||h.y>=N||sn.some(p=>p.x==h.x&&p.y==h.y)){dead=true;return}
sn.unshift(h);if(h.x==f.x&&h.y==f.y){sc++;food()}else sn.pop();}
function draw(){x.fillStyle='#16231a';x.fillRect(0,0,400,400);x.fillStyle='#ffc21a';x.beginPath();x.arc(f.x*S+10,f.y*S+10,8,0,7);x.fill();
sn.forEach((p,i)=>{x.fillStyle=i?'#3fbf73':'#9be7b4';x.fillRect(p.x*S+1,p.y*S+1,S-2,S-2)});
document.getElementById('s').textContent='SCORE '+sc+(dead?'  -  TAP OR PRESS SPACE':'');}
function dir(a,b){if(a.x!=-d.x||a.y!=-d.y)nd=a}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
if(k==' '&&dead)reset();
if((k=='arrowup'||k=='w')&&d.y!=1)nd={x:0,y:-1};if((k=='arrowdown'||k=='s')&&d.y!=-1)nd={x:0,y:1};
if((k=='arrowleft'||k=='a')&&d.x!=1)nd={x:-1,y:0};if((k=='arrowright'||k=='d')&&d.x!=-1)nd={x:1,y:0};});
let sx,sy;addEventListener('touchstart',e=>{if(dead)reset();sx=e.touches[0].clientX;sy=e.touches[0].clientY});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
if(Math.abs(dx)>Math.abs(dy)){if(dx>0&&d.x!=-1)nd={x:1,y:0};else if(dx<0&&d.x!=1)nd={x:-1,y:0}}
else{if(dy>0&&d.y!=-1)nd={x:0,y:1};else if(dy<0&&d.y!=1)nd={x:0,y:-1}}});
addEventListener('click',()=>{if(dead)reset()});
reset();setInterval(()=>{step();draw()},110);
</script>`;

const memory = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>
html,body{margin:0;height:100%;background:#fff1c9;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#231f16}
#g{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(92vw,70vh,420px)}
.k{aspect-ratio:1;border:0;border-radius:14px;background:#231f16;color:#231f16;font-size:clamp(24px,8vw,44px);cursor:pointer;transition:transform .15s}
.k.o{background:#fff;transform:rotateY(0)}.k.m{background:#9be7b4}
#t{margin:10px;font-weight:800}button.r{margin-top:12px;padding:8px 18px;border-radius:99px;border:2px solid #231f16;background:#ffc21a;font-weight:800;cursor:pointer}</style>
<div id=t>Moves: 0</div><div id=g></div><button class=r onclick=init()>New game</button>
<script>
const E=['★','●','▲','■','♦','♥','☾','✿'];let a,b,lock,mv,left;
function init(){const d=[...E,...E].sort(()=>Math.random()-.5);g.innerHTML='';a=b=null;lock=false;mv=0;left=8;t.textContent='Moves: 0';
d.forEach(v=>{const k=document.createElement('button');k.className='k';k.dataset.v=v;k.onclick=()=>flip(k);g.appendChild(k)})}
function flip(k){if(lock||k.classList.contains('o')||k.classList.contains('m'))return;k.classList.add('o');k.textContent=k.dataset.v;
if(!a){a=k;return}b=k;mv++;t.textContent='Moves: '+mv;
if(a.dataset.v==b.dataset.v){a.classList.add('m');b.classList.add('m');a=b=null;if(--left==0)t.textContent='Done in '+mv+' moves!'}
else{lock=true;setTimeout(()=>{[a,b].forEach(z=>{z.classList.remove('o');z.textContent=''});a=b=null;lock=false},700)}}
init();
</script>`;

export const SAMPLES: Sample[] = [
  { title: "Green Snake", description: "The classic. Eat the gold dots, don't hit the walls or yourself.", controls: "Arrow keys or WASD. Swipe on phones.", category: "Arcade", tags: ["classic", "snake"], html: snake },
  { title: "Memory Match", description: "Flip two cards at a time and find all eight pairs in as few moves as you can.", controls: "Click or tap a card.", category: "Puzzle", tags: ["memory", "cards"], html: memory },
];
