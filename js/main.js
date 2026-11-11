'use strict';
// ---------- Tobz Party: menus, party flow, online play ----------
(()=>{
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
let has3=false;try{g3.init($('gl'));has3=true;}catch(e){console.warn('3D is off:',e);}
const BOTN=['Bleep','Zonk','Pixel','Wobble','Noodle','Turbo','Glitch','Mochi'];
const CATS=[['skin','Color',SKINS.map(s=>s[0])],['hat','Hat',HATS],['glasses','Glasses',GLASSES],['cape','Cape',CAPES.map(s=>s[0])],['dress','Outfit',DRESSES]];
const KIND={score:'HIGH SCORE',surv:'LAST ONE STANDING',race:'RACE'},PLACE=['1st','2nd','3rd','4th'],PTS=[10,8,6,4];
let prof={name:'Player',look:{skin:0,hat:1,glasses:0,cape:1,dress:0}};
try{const p=JSON.parse(localStorage.getItem('tobz'));if(p&&p.look)prof=p;}catch(e){}
const save=()=>{try{localStorage.setItem('tobz',JSON.stringify(prof));}catch(e){}};
const fixLook=l=>{const o={};for(const [k] of CATS)o[k]=clamp(Math.floor(+((l||{})[k])||0),0,7);return o;};
const clean=n=>String(n||'Player').replace(/[<>]/g,'').slice(0,12)||'Player';
let botOff=rint(0,7);
const mkBot=i=>({name:BOTN[(i+botOff)%BOTN.length],look:randLook(),bot:true});

// A = party state (host owns it, everyone gets a copy). S = live mini game state.
let A={phase:'menu',players:[],mode:'ffa',rounds:10,filter:'all',round:0,order:[],gid:null,K:null,tm:[0,1,0,1],tot:[0,0,0,0],res:null,tl:0,practice:false,seq:0};
let me=0,isHost=true,S=null,cur=null,snapA=null,snapB=null,snapT=0,gt=0,lastSeq=-1,tick=0,evI=0;
const Net={peer:null,conns:[],conn:null,code:''};
const rin=[null,null,null,null],lastAc=[0,0,0,0],lastBc=[0,0,0,0],botLag=[0,1,2,3].map(()=>({x:0,y:0,a:false,b:false}));

// ---------- input ----------
const Inp=(()=>{const k={};let ac=0,bc=0,ga=false,gb=false;const KA=['Space','KeyJ','KeyZ'],KB=['ShiftLeft','ShiftRight','KeyK','KeyX'];
 addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(!k[e.code]){if(KA.includes(e.code))ac++;if(KB.includes(e.code))bc++;onKey(e.code);}k[e.code]=1;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
 addEventListener('keyup',e=>{k[e.code]=0;});addEventListener('blur',()=>{for(const c in k)k[c]=0;});
 return{get(){let x=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0),y=(k.KeyS||k.ArrowDown?1:0)-(k.KeyW||k.ArrowUp?1:0),a=KA.some(c=>k[c]),b=KB.some(c=>k[c]);
  const gp=navigator.getGamepads&&[...navigator.getGamepads()].find(g=>g);
  if(gp){if(Math.abs(gp.axes[0])>.25)x=Math.round(gp.axes[0]*5)/5;if(Math.abs(gp.axes[1])>.25)y=Math.round(gp.axes[1]*5)/5;
   const pa=!!(gp.buttons[0]&&gp.buttons[0].pressed),pb=!!((gp.buttons[1]&&gp.buttons[1].pressed)||(gp.buttons[2]&&gp.buttons[2].pressed));if(pa&&!ga)ac++;if(pb&&!gb)bc++;ga=pa;gb=pb;a=a||pa;b=b||pb;}
  return{x,y,a:a?1:0,b:b?1:0,ac,bc};}};})();
function onKey(code){if(code==='KeyM')$('bMusic').click();if(code==='Escape'){if(A.phase==='menu'||A.phase==='lobby')return;if(isHost)toLobby();else leave('');}
 if(code==='Enter'&&isHost){if(A.phase==='intro')A.tl=0;else if(A.phase==='final')toLobby();else if(A.phase==='result'||A.phase==='board')A.tl=0;}}

// ---------- screens ----------
function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('on',s.id===id));}
function status(t){$('status').textContent=t||'';$('lstatus').textContent=t||'';}
function fit(){$('wrap').style.fontSize=($('wrap').clientWidth/64)+'px';}
addEventListener('resize',fit);fit();
CATS.forEach(([k,label,names])=>{const r=document.createElement('div');r.className='crow';r.innerHTML=`<span class="cl">${label}</span><button data-d="-1">◀</button><span class="cv" id="cu_${k}"></span><button data-d="1">▶</button>`;
 r.querySelectorAll('button').forEach(b=>b.onclick=()=>{prof.look[k]=(prof.look[k]+ +b.dataset.d+names.length)%names.length;save();updCust();Sfx('tick');});$('cust').appendChild(r);});
function updCust(){CATS.forEach(([k,,names])=>{$('cu_'+k).textContent=names[prof.look[k]];});}
prof.look=fixLook(prof.look);prof.name=clean(prof.name);updCust();$('name').value=prof.name;
$('name').oninput=()=>{prof.name=clean($('name').value);save();};
$('bRand').onclick=()=>{prof.look=randLook();save();updCust();Sfx('coin');};
$('bPlay').onclick=()=>{Sfx('go');isHost=true;me=0;botOff=rint(0,7);A.players=[{name:prof.name,look:prof.look,bot:false},mkBot(1),mkBot(2),mkBot(3)];A.phase='lobby';status('');sendA();};
$('bJoin').onclick=()=>{const c=$('code').value.trim().toUpperCase();if(c.length!==4){status('Type the 4-letter room code');return;}joinOnline(c);};
$('bBack').onclick=()=>leave('');
$('bOnline').onclick=hostOnline;
$('bStart').onclick=()=>{if(!isHost)return;const ids=shuffle(pool().map(g=>g.id)).slice(0,A.rounds);startParty(ids,false);};
$('bPick').onclick=()=>{if(isHost)show('s-pick');};
$('bPickBack').onclick=()=>show('s-lobby');
document.querySelectorAll('.seg').forEach(seg=>seg.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(!isHost)return;const k=seg.dataset.k;A[k]=k==='rounds'?+b.dataset.v:b.dataset.v;Sfx('tick');sendA();}));
// picker: one card per mini game, with a picture taken from the game itself
const thumbs={},tq=TP.games.slice(),tcv=document.createElement('canvas');tcv.width=320;tcv.height=180;const tcx=tcv.getContext('2d');
TP.games.forEach(g=>{const b=document.createElement('button');b.className='card'+(g.dim===3?' d3':'');b.title=g.desc;b.innerHTML=`<img alt=""><span class="tg">${g.dim===3?'3D':'2D'}</span><span class="nm">${g.name}</span>`;thumbs[g.id]=b.querySelector('img');
 b.onclick=()=>{if(g.dim===3&&!has3){status('3D needs internet for the first load');return;}startParty([g.id],true);};$('grid').appendChild(b);});
// plays a few seconds of the game with bots (using the lobby's characters) and snapshots one frame
function makeThumb(g){if(g.dim===3&&!has3)return;const keep=A.players,kA={gid:A.gid,K:A.K,tm:A.tm,res:A.res,mode:A.mode},m0=me,c0=cur,S0=S;
 try{A.players=keep.map(p=>Object.assign({},p,{bot:true}));TP.players=A.players;me=-1;A.mode='ffa';A.gid=g.id;initRound();
  const n=Math.round(Math.min(7,g.time*.25)*60);for(let k=0;k<n&&!S.over;k++)simStep(1/60);
  if(g.dim===3){g3.clear();g3.begin({me:0});g.draw(S,g3.api,0,A.K);g3.end();tcx.drawImage($('gl'),0,0,320,180);g3.clear();}
  else{g.draw(S,ctx,0,A.K);tcx.drawImage(cv,0,0,320,180);ctx.clearRect(0,0,W,H);}
  thumbs[g.id].src=tcv.toDataURL('image/jpeg',.82);}catch(e){console.warn('picture failed for',g.id,e);}
 A.players=keep;TP.players=keep;me=m0;cur=c0;S=S0;Object.assign(A,kA);}
$('bMusic').onclick=()=>{$('bMusic').textContent=Music.toggle()?'🔊 Music':'🔇 Music';};$('bMusic').textContent=Music.isOn()?'🔊 Music':'🔇 Music';
const pool=()=>TP.games.filter(g=>(has3||g.dim===2)&&(A.filter==='all'||(A.filter==='2d')===(g.dim===2)));
function renderLobby(){$('room').textContent=Net.code?'ROOM CODE: '+Net.code:(isHost?'Playing offline — bots fill the empty seats':'');
 $('bOnline').style.display=isHost&&!Net.code?'':'none';$('bStart').style.display=$('bPick').style.display=isHost?'':'none';$('opts').className=isHost?'':'dis';
 document.querySelectorAll('.seg').forEach(seg=>seg.querySelectorAll('button').forEach(b=>b.classList.toggle('sel',String(A[seg.dataset.k])===b.dataset.v)));
 if(!isHost)$('lstatus').textContent='Waiting for the host to start…';}

// ---------- online (PeerJS: host runs the game, guests send inputs) ----------
const pack=o=>JSON.stringify(o,(k,v)=>k[0]==='_'?undefined:typeof v==='number'?Math.round(v*100)/100:v);
function hostOnline(){if(Net.peer||!isHost)return;if(typeof Peer==='undefined'){status('Online needs an internet connection');return;}
 const code=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[rint(0,23)]).join('');status('Opening room…');const peer=new Peer('tobzparty-'+code);Net.peer=peer;
 peer.on('open',()=>{Net.code=code;status('Share the code with friends!');renderLobby();});
 peer.on('connection',c=>{c.last=performance.now();c.on('data',d=>hostData(c,d));c.on('close',()=>drop(c));c.on('error',()=>drop(c));});
 peer.on('error',e=>{if(!Net.code){try{peer.destroy();}catch(x){}Net.peer=null;if(e.type==='unavailable-id')hostOnline();else status('Could not open a room ('+e.type+')');}});}
function hostData(c,d){c.last=performance.now();try{if(typeof d==='string')d=JSON.parse(d);}catch(e){return;}
 if(d.t==='hello'){if(c.slot!==undefined)return;const i=A.players.findIndex((p,k)=>k>0&&p.bot);if(i<0){c.send(pack({t:'full'}));return;}
  A.players[i]={name:clean(d.name),look:fixLook(d.look),bot:false};c.slot=i;Net.conns.push(c);if(S&&S.p[i])S.p[i].bot=0;Sfx('coin');sendA();}
 else if(d.t==='i'&&c.slot!==undefined)rin[c.slot]=d;}
function drop(c){const k=Net.conns.indexOf(c);if(k<0)return;Net.conns.splice(k,1);const i=c.slot;A.players[i]=mkBot(i);rin[i]=null;if(S&&S.p[i])S.p[i].bot=1;sendA();}
function sendA(){for(const c of Net.conns)if(c.open)c.send(pack({t:'A',A,you:c.slot}));onA();}
function joinOnline(code){if(typeof Peer==='undefined'){status('Online needs an internet connection');return;}if(Net.peer)closeNet();status('Connecting…');const peer=new Peer();Net.peer=peer;
 peer.on('open',()=>{const c=peer.connect('tobzparty-'+code,{reliable:true,serialization:'json'});Net.conn=c;
  c.on('open',()=>{isHost=false;Net.code=code;lastRx=performance.now();c.send(pack({t:'hello',name:prof.name,look:prof.look}));});c.on('data',clientData);c.on('close',()=>leave('The host left the party'));});
 peer.on('error',e=>{closeNet();status(e.type==='peer-unavailable'?'Room '+code+' not found':'Connection problem ('+e.type+')');});}
function clientData(d){lastRx=performance.now();try{if(typeof d==='string')d=JSON.parse(d);}catch(e){return;}
 if(d.t==='A'){A=d.A;me=d.you;onA();}else if(d.t==='s'){snapA=snapB;snapB=d.s;snapT=performance.now();for(const e of d.s.ev||[])Sfx(e);}else if(d.t==='full')leave('That room is full');}
function closeNet(){try{Net.peer&&Net.peer.destroy();}catch(e){}Net.peer=null;Net.conn=null;Net.conns=[];Net.code='';}
// heartbeat: both sides ping every 2s, so a closed tab or dropped connection is noticed quickly
let lastRx=0;
setInterval(()=>{const now=performance.now();
 if(isHost){for(const c of Net.conns.slice()){if(now-c.last>8000){try{c.close();}catch(e){}drop(c);}else if(c.open)c.send(pack({t:'p'}));}}
 else if(Net.conn&&Net.conn.open){Net.conn.send(pack({t:'p'}));if(now-lastRx>10000)leave('Lost connection to the host');}},2000);
addEventListener('pagehide',()=>{try{Net.peer&&Net.peer.destroy();}catch(e){}});
function leave(msg){closeNet();isHost=true;me=0;S=null;A.phase='menu';A.gid=null;onA();status(msg);}
function onA(){TP.players=A.players;cur=TP.games.find(g=>g.id===A.gid)||null;if(A.seq!==lastSeq){lastSeq=A.seq;if(has3)g3.clear();snapA=snapB=null;}
 if(A.phase==='lobby'){if(!$('s-pick').classList.contains('on')||!isHost)show('s-lobby');renderLobby();}else show(A.phase==='menu'?'s-title':null);}

// ---------- party flow (host) ----------
function startParty(ids,practice){if(!ids.length)return;A.order=ids;A.round=0;A.tot=[0,0,0,0];A.practice=practice;const t=shuffle([0,0,1,1]);A.players.forEach((p,i)=>{p.team=t[i];});nextRound();}
function initRound(){cur=TP.games.find(g=>g.id===A.gid);A.tm=A.mode==='teams'?A.players.map(p=>p.team):shuffle([0,0,1,1]);const K={};
 S={g:A.gid,t:0,T:cur.time,cd:3.6,over:false,ot:0,msg:'',ev:[],tm:cur.teams||A.mode==='teams'?1:0,p:A.players.map((pl,i)=>({i,team:A.tm[i],x:0,y:0,vx:0,vy:0,h:0,vh:0,ang:0,score:0,alive:true,bot:pl.bot?1:0}))};
 cur.init(S,K);A.K=K;A.res=null;evI=0;botLag.forEach(l=>{l.x=l.y=0;l.a=l.b=false;l.k=rnd(.84,.97);});}
function nextRound(){if(A.round>=A.order.length){if(A.practice){toLobby();return;}A.phase='final';A.tl=0;Sfx('win');sendA();return;}
 A.gid=A.order[A.round];A.seq++;initRound();A.phase='intro';A.tl=A.practice?3.5:6.5;sendA();}
function toLobby(){S=null;A.phase='lobby';A.gid=null;A.K=null;sendA();show('s-lobby');}
function inputs(){return S.p.map((p,i)=>{const pl=A.players[i];
  if(pl.bot){if(p.alive===false)return{x:0,y:0,a:false,b:false,ap:false,bp:false};const r=(cur.bot&&cur.bot(S,i,A.K))||Z,L=botLag[i];
   if(cur.rawBot){L.x=r.x||0;L.y=r.y||0;}else{L.x+=((r.x||0)-L.x)*.14;L.y+=((r.y||0)-L.y)*.14;}
   const a=!!r.a,b=!!r.b,o={x:clamp(L.x,-1,1)*L.k,y:clamp(L.y,-1,1)*L.k,a,b,ap:r.ap!==undefined?!!r.ap:(a&&!L.a),bp:r.bp!==undefined?!!r.bp:(b&&!L.b)};L.a=a;L.b=b;return o;}
  const n=i===me?Inp.get():(rin[i]||{x:0,y:0,a:0,b:0,ac:lastAc[i],bc:lastBc[i]});
  const o={x:clamp(+n.x||0,-1,1),y:clamp(+n.y||0,-1,1),a:!!n.a,b:!!n.b,ap:n.ac!==lastAc[i],bp:n.bc!==lastBc[i]};lastAc[i]=n.ac;lastBc[i]=n.bc;return o;});}
function simStep(dt){S.t+=dt;cur.update(S,inputs(),dt,A.K);
 if(cur.kind==='surv'&&S.p.filter(p=>p.alive).length<=1)S.over=true;
 if(cur.kind==='race'){const nf=S.p.filter(p=>p.fin).length;if(nf>=S.p.length-1)S.over=true;else if(nf&&!S.cap){S.cap=1;S.T=Math.min(S.T,S.t+15);}}
 if(S.t>=S.T)S.over=true;
 if(S.over){if(cur.kind==='surv')S.p.forEach(p=>{if(p.alive)p.score=1e6;});if(cur.kind==='race')S.p.forEach(p=>{p.score=p.fin?1e5-p.fin:(p.pr||0);});
  if(cur.fin)cur.fin(S);if(cur.teams)S.p.forEach(p=>{p.score=S.ts[p.team];});S.ot=1.8;S.msg='';fx(S,'win');}}
function stepSim(dt){if(S.cd>0){const c0=Math.ceil(S.cd);S.cd-=dt;if(Math.ceil(S.cd)!==c0&&c0<=4)fx(S,S.cd>0?'tick':'go');}
 else if(S.over){S.ot-=dt;if(S.ot<=0){endRound();return;}}
 else{try{simStep(dt);}catch(e){console.error('mini game error',cur.id,e);S.over=true;S.ot=.5;}}
 for(;evI<S.ev.length;evI++)Sfx(S.ev[evI]);
 if(++tick%2===0){if(Net.conns.length){const m=pack({t:'s',s:S});for(const c of Net.conns)if(c.open)c.send(m);}S.ev.length=0;evI=0;}}
function endRound(){let place,pts;
 if(cur.teams){const a=S.ts[0],b=S.ts[1];place=S.p.map(p=>a===b?0:(S.ts[p.team]>S.ts[1-p.team]?0:1));pts=place.map(q=>a===b?7:(q?4:10));}
 else{place=S.p.map(p=>S.p.filter(q=>q.score>p.score).length);pts=place.map(q=>PTS[q]);}
 pts.forEach((v,i)=>{A.tot[i]+=v;});A.res={pts,place,ts:cur.teams?S.ts:null};A.phase='result';A.tl=5;sendA();}
function hostTick(dt){if(A.phase==='intro'){A.tl-=dt;if(A.tl<=0){A.phase='play';sendA();}}
 else if(A.phase==='play'){if(S)stepSim(dt);}
 else if(A.phase==='result'){A.tl-=dt;if(A.tl<=0){if(A.practice)toLobby();else{A.phase='board';A.tl=4.5;sendA();}}}
 else if(A.phase==='board'){A.tl-=dt;if(A.tl<=0){A.round++;nextRound();}}}
// the host clock runs in a worker so the party keeps going if the host tab is in the background
let acc=0,lt=performance.now();
const pump=()=>{const n=performance.now();acc+=Math.min(.25,(n-lt)/1000);lt=n;let k=0;while(acc>=1/60&&k++<8){acc-=1/60;if(isHost)hostTick(1/60);}if(k>=8)acc=0;};
try{const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),1000/60)'],{type:'text/javascript'})));wk.onmessage=pump;}catch(e){setInterval(pump,1000/60);}

// ---------- drawing ----------
function mix(a,b,t){if(!a||a.g!==b.g||a.p.length!==b.p.length||t>=1)return b;const lim=cur.dim===3?6:140,o=Object.assign({},b);
 o.p=b.p.map((q,i)=>{const p=a.p[i],r=Object.assign({},q);for(const k of['x','y','h'])if(typeof q[k]==='number'&&typeof p[k]==='number'&&Math.abs(q[k]-p[k])<lim)r[k]=lerp(p[k],q[k],t);
  if(typeof q.ang==='number'&&typeof p.ang==='number')r.ang=p.ang+angd(p.ang,q.ang)*t;return r;});
 for(const k of['d','b'])if(b[k]&&a[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])){o[k]=Object.assign({},b[k]);for(const f of['x','y','h'])if(typeof b[k][f]==='number'&&typeof a[k][f]==='number'&&Math.abs(b[k][f]-a[k][f])<lim)o[k][f]=lerp(a[k][f],b[k][f],t);}
 if(typeof b.d==='number'&&typeof a.d==='number')o.d=lerp(a.d,b.d,t);return o;}
const tcol=i=>(cur&&cur.teams)||A.mode==='teams'?TCOL[A.tm[i]]:0;
function panel(x,y,w,h,c){ctx.fillStyle=c||'rgba(11,6,32,.7)';ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fill();}
function hud(s){ctx.fillStyle='rgba(11,6,32,.6)';ctx.fillRect(0,0,W,54);
 s.p.forEach((p,i)=>{const x=6+i*150+(i>1?348:0),pl=A.players[i];if(!pl)return;panel(x,5,146,44,i===me?'rgba(255,255,255,.22)':'rgba(255,255,255,.08)');ctx.fillStyle=tcol(i)||PCOL[i];ctx.fillRect(x,5,6,44);
  drawChar(ctx,pl.look,x+26,30,11,1);txt(ctx,pl.name,x+44,18,13,PCOL[i],'left');
  const v=p.alive===false?'OUT':p.d!==undefined?p.d:cur.teams?'':cur.kind==='surv'?'♥':cur.kind==='race'?(p.fin?'FINISH':Math.round((p.pr||0)*100)+'%'):Math.floor(p.score);txt(ctx,String(v),x+44,37,17,p.alive===false?'#ff4d5e':'#fff','left');});
 txt(ctx,String(Math.max(0,Math.ceil(s.T-s.t))),480,cur.teams?17:27,cur.teams?20:32,s.T-s.t<6?'#ff4d5e':'#fff');
 if(cur.teams&&s.ts){txt(ctx,String(s.ts[0]),432,37,24,TCOL[0]);txt(ctx,'–',480,37,20,'#fff');txt(ctx,String(s.ts[1]),528,37,24,TCOL[1]);}
 if(s.cd>0){const n=Math.ceil(s.cd);txt(ctx,n>3?'READY?':String(n),480,250,n>3?80:140,'#ffe13b');panel(180,470,600,44);txt(ctx,cur.ctl,480,492,18,'#9fe8ff');}
 else if(s.over)txt(ctx,'FINISH!',480,250,100,'#ffe13b');else if(s.t<.8)txt(ctx,'GO!',480,250,130,'#52e36b');else if(s.msg)txt(ctx,s.msg,480,210,64,'#ffe13b');
 const mp=s.p[me];if(mp&&mp.ic!==undefined&&!mp.fin&&s.cd<=0&&!s.over){panel(442,60,76,76,'rgba(11,6,32,.8)');ctx.strokeStyle=mp.item?'#ffe13b':'#7b2cff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(442,60,76,76,12);ctx.stroke();if(mp.ic)txt(ctx,mp.ic,480,100,42,'#fff','center',0);if(mp.item)txt(ctx,'SPACE',480,148,13,'#ffe13b');
  if(mp.pos!==undefined)txt(ctx,PLACE[mp.pos],74,492,56,'#ffe13b');if(mp.fl)txt(ctx,'BACK TO CHECKPOINT!',480,210,34,'#ff4d5e');}}
function drawPlay(now){let s=S;if(!isHost){if(!snapB||snapB.g!==A.gid){bg2(ctx,260,gt);txt(ctx,'Get ready…',480,270,40);return;}s=mix(snapA,snapB,clamp((now-snapT)/34,0,1));}
 if(!s||!cur)return;
 if(cur.dim===3){ctx.clearRect(0,0,W,H);g3.begin({me});cur.draw(s,g3.api,me,A.K);for(const l of g3.end()){txt(ctx,l.t,l.x,l.y,l.big?24:13,l.c);if(l.me)txt(ctx,'▼',l.x,l.y-15,14,'#fff');}}
 else{cur.draw(s,ctx,me,A.K);const p=s.p[me];if(p&&p.alive!==false&&s.cd>0&&typeof p.x==='number')txt(ctx,'▼ YOU',p.x,Math.max(70,p.y-(p.h||0)-75),16,'#fff');}
 hud(s);}
function lineup(y,sz){if((cur&&cur.teams)||A.mode==='teams'){const n=[0,0];A.players.forEach((p,i)=>{const t=A.tm[i],k=n[t]++;chr(ctx,i,(t?610:220)+k*130,y,sz,null,{tc:TCOL[t]});});txt(ctx,'VS',480,y,44,'#fff');txt(ctx,'RED TEAM',285,y-sz*3.4,18,TCOL[0]);txt(ctx,'BLUE TEAM',675,y-sz*3.4,18,TCOL[1]);}
 else A.players.forEach((p,i)=>chr(ctx,i,240+i*160,y,sz,null));}
function drawIntro(){const g=cur;if(!g)return;bg2(ctx,g.dim===3?200:290,gt);txt(ctx,A.practice?'PRACTICE':`ROUND ${A.round+1} / ${A.order.length}`,480,42,20,'#9fe8ff');
 txt(ctx,g.name.toUpperCase(),480,104,62,'#ffe13b','center','#ff3b9a');panel(330,146,300,34,g.dim===3?'#c2410c':'#1277c2');txt(ctx,(g.dim===3?'3D':'2D')+' · '+(g.teams?'TEAM BATTLE':KIND[g.kind]),480,164,17,'#fff','center',0);
 panel(90,196,780,92);ctx.font='900 20px "Trebuchet MS"';const words=g.desc.split(' ');let line='',ly=224;const lines=[];for(const w of words){if(ctx.measureText(line+w).width>720){lines.push(line);line='';}line+=w+' ';}lines.push(line);
 if(lines.length===1)ly=232;lines.slice(0,2).forEach((l,k)=>txt(ctx,l.trim(),480,ly+k*26,20,'#fff'));txt(ctx,'🎮 '+g.ctl,480,ly+(lines.length>1?52:34),16,'#9fe8ff');
 lineup(400,32);txt(ctx,'Starting in '+Math.max(1,Math.ceil(A.tl)),480,492,22,'#fff');if(isHost)txt(ctx,'ENTER = skip · ESC = lobby',480,520,13,'#c9b8ff');}
function drawResult(){if(!cur||!A.res)return;bg2(ctx,330,gt);const r=A.res;txt(ctx,cur.name.toUpperCase(),480,40,22,'#9fe8ff');
 txt(ctx,r.ts?(r.ts[0]===r.ts[1]?'IT\'S A DRAW!':TNAME[r.ts[0]>r.ts[1]?0:1]+' TEAM WINS!'):'RESULTS',480,84,44,r.ts&&r.ts[0]!==r.ts[1]?TCOL[r.ts[0]>r.ts[1]?0:1]:'#ffe13b');
 [0,1,2,3].sort((a,b)=>r.place[a]-r.place[b]).forEach((i,k)=>{const y=168+k*90,pl=A.players[i];if(!pl)return;panel(170,y-36,620,76,i===me?'rgba(255,255,255,.2)':'rgba(11,6,32,.65)');
  txt(ctx,r.ts?(r.ts[0]===r.ts[1]?'TIE':r.place[i]?'LOSE':'WIN'):PLACE[r.place[i]],235,y,30,r.place[i]?'#fff':'#ffe13b');chr(ctx,i,330,y-2,24,null,{nolab:1,tc:tcol(i)});txt(ctx,pl.name,380,y,26,PCOL[i],'left');txt(ctx,'+'+r.pts[i],730,y,38,'#52e36b');});}
function drawBoard(){bg2(ctx,260,gt);txt(ctx,'SCOREBOARD',480,54,44,'#ffe13b');txt(ctx,`after round ${A.round+1} of ${A.order.length}`,480,92,18,'#9fe8ff');const mx=Math.max(1,...A.tot);
 [0,1,2,3].sort((a,b)=>A.tot[b]-A.tot[a]).forEach((i,k)=>{const y=160+k*84,pl=A.players[i];if(!pl)return;panel(150,y-34,660,70,i===me?'rgba(255,255,255,.2)':'rgba(11,6,32,.65)');chr(ctx,i,200,y-2,22,null,{nolab:1,tc:tcol(i)});txt(ctx,pl.name,245,y,22,PCOL[i],'left');
  ctx.fillStyle=PCOL[i];ctx.fillRect(420,y-12,280*A.tot[i]/mx,24);txt(ctx,String(A.tot[i]),760,y,30,'#fff');});
 if(A.mode==='teams'){const t=[0,0];A.players.forEach((p,i)=>{t[p.team]+=A.tot[i];});txt(ctx,`RED ${t[0]}`,330,506,28,TCOL[0]);txt(ctx,`BLUE ${t[1]}`,630,506,28,TCOL[1]);}}
function drawFinal(){bg2(ctx,45,gt);for(let k=0;k<60;k++){ctx.fillStyle=PCOL[k%4];ctx.fillRect((k*163+gt*40*(1+k%3))%W,(k*97+gt*120*(1+k%4*.3))%H,8,8);}
 const ord=[0,1,2,3].sort((a,b)=>A.tot[b]-A.tot[a]);let title;
 if(A.mode==='teams'){const t=[0,0];A.players.forEach((p,i)=>{t[p.team]+=A.tot[i];});title=t[0]===t[1]?'A PERFECT TIE!':TNAME[t[0]>t[1]?0:1]+' TEAM WINS  '+Math.max(...t)+' – '+Math.min(...t);}else title=A.players[ord[0]].name+' WINS THE PARTY!';
 txt(ctx,'👑',480,50,44,'#fff','center',0);txt(ctx,title,480,104,44,'#ffe13b','center','#ff3b9a');
 const px=[480,290,670,820],ph=[150,105,70,40];ord.forEach((i,k)=>{const x=px[k],y=440-ph[k];ctx.fillStyle=['#ffd23b','#c9d1e0','#d98a4a','#5b4a8a'][k];ctx.fillRect(x-70,y,140,ph[k]+60);txt(ctx,PLACE[k],x,y+26,24,'#120a2a','center',0);
  chr(ctx,i,x,y-42+Math.abs(Math.sin(gt*4+k))*(k?0:-14),k?30:40,null,{tc:tcol(i),nosh:1});txt(ctx,A.tot[i]+' pts',x,y+54,18,'#120a2a','center',0);});
 txt(ctx,isHost?'Press ENTER to go back to the lobby':'Waiting for the host…',480,520,18,'#fff');}
let lastSig='',lastSend=0;
function frame(now){requestAnimationFrame(frame);gt=now/1000;
 Music.set(A.phase==='menu'||A.phase==='lobby'?'tobz-menu':A.phase==='final'?'tobz-final':A.phase==='result'||A.phase==='board'?'tobz-score':A.gid||'tobz-menu');
 if(!isHost){if(A.tl>0)A.tl-=1/60;const n=Inp.get(),sig=n.x+','+n.y+','+n.a+','+n.b+','+n.ac+','+n.bc;if(Net.conn&&Net.conn.open&&(sig!==lastSig||now-lastSend>250)){lastSig=sig;lastSend=now;Net.conn.send(pack(Object.assign({t:'i'},n)));}}
 try{switch(A.phase){
  case 'menu':{const c=$('prev').getContext('2d');c.clearRect(0,0,300,300);c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(150,262,80,18,0,0,TAU);c.fill();drawChar(c,prof.look,150,175+Math.sin(gt*3)*5,78,1);ctx.clearRect(0,0,W,H);break;}
  case 'lobby':{if(isHost&&tq.length&&$('s-pick').classList.contains('on'))makeThumb(tq.shift());const c=$('lobcv').getContext('2d');c.clearRect(0,0,800,230);A.players.forEach((p,i)=>{const x=100+i*200;c.fillStyle='rgba(11,6,32,.6)';c.beginPath();c.roundRect(x-88,4,176,222,14);c.fill();c.strokeStyle=PCOL[i];c.lineWidth=4;c.stroke();
    drawChar(c,p.look,x,112+Math.sin(gt*3+i)*4,42,1);txt(c,p.name,x,192,20,PCOL[i]);txt(c,p.bot?'BOT':i===me?'YOU':i===0?'HOST':'PLAYER',x,214,13,p.bot?'#9a8fc0':'#52e36b','center',0);});ctx.clearRect(0,0,W,H);break;}
  case 'intro':drawIntro();break;case 'play':drawPlay(now);break;case 'result':drawResult();break;case 'board':drawBoard();break;case 'final':drawFinal();break;}}catch(e){console.error('draw error',e);}}
requestAnimationFrame(frame);

// ---------- test hooks (used to smoke-test every mini game) ----------
TP.dbg={A:()=>A,S:()=>S,start:id=>startParty([id],true),go:()=>{A.tl=0;if(S)S.cd=0;},
 ff(sec){for(let k=0;k<sec*60&&S&&A.phase==='play'&&!S.over;k++)simStep(1/60);return S&&{t:S.t,over:S.over,p:S.p.map(p=>[p.score,p.alive])};},
 test(){const out=[],keep=A.players;A.players=[0,1,2,3].map(mkBot);TP.players=A.players;const m0=me;me=-1;
  for(const g of TP.games){const r={id:g.id};try{A.gid=g.id;initRound();let n=0,mid=Math.floor(g.time*20);while(!S.over&&n<(g.time+5)*60){simStep(1/60);if(++n===mid||S.over){if(g.dim===3){g3.clear();g3.begin({me:0});g.draw(S,g3.api,0,A.K);g3.end();}else g.draw(S,ctx,0,A.K);}}
    JSON.parse(pack({s:S}));r.t=Math.round(S.t*10)/10;r.over=S.over;r.sc=S.p.map(p=>Math.round(p.score*10)/10).join('/');}catch(e){r.err=String(e&&e.stack||e).slice(0,300);}out.push(r);}
  A.players=keep;TP.players=keep;me=m0;S=null;A.gid=null;cur=null;if(has3)g3.clear();return out;}};
})();
