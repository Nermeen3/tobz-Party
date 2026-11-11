'use strict';
// ---------- 20 mini games in 2D ----------
// Each game: init(s,K) · update(s,I,dt,K) · bot(s,i,K) · draw(s,c,me,K)
// s = live state (synced online), K = fixed data made in init, I[i] = {x,y,a,b,ap,bp} input of player i

// 1
TP.add({id:'coins',name:'Coin Comet',dim:2,time:30,kind:'score',desc:'Grab the most coins! Golden stars are worth 5.',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,480,300,150);s.c=[];s.nx=0;},
 update(s,I,dt){s.p.forEach((p,i)=>{move(p,I[i],dt,330);bound(p,20,75,940,515);});bump(s.p,20,.5);
  s.nx-=dt;if(s.nx<=0&&s.c.length<14){s.nx=.3;s.c.push({x:rnd(40,920),y:rnd(95,500),g:Math.random()<.12?1:0});}
  for(const p of s.p)s.c=s.c.filter(c=>{if(Math.hypot(c.x-p.x,c.y-p.y)<32){p.score+=c.g?5:1;fx(s,'coin');return false;}return true;});},
 bot(s,i){const p=s.p[i],c=nearest(p,s.c);return c?seek(p,c.x,c.y):Z;},
 draw(s,c){bg2(c,250,s.t);for(const o of s.c){if(o.g)star(c,o.x,o.y,17,'#ffd23b');else disc(c,o.x,o.y,9,'#ffe98a','#c98a00');}s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p));}});

// 2
TP.add({id:'laser',name:'Laser Disco',dim:2,time:50,kind:'surv',desc:'Lasers flash a warning, then FIRE. Do not get zapped!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,480,300,120);s.l=[];s.nx=1.2;},
 update(s,I,dt){s.p.forEach((p,i)=>{if(p.alive){move(p,I[i],dt,300);bound(p,20,75,940,515);}});
  s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.3,1.2-s.t*.03);const v=rint(0,1),t=Math.random()<.5?pick(s.p.filter(p=>p.alive)):null;s.l.push({v,pos:t?(v?t.x:t.y):(v?rnd(40,920):rnd(90,500)),w:.9,f:.35});}
  for(const l of s.l){if(l.w>0){l.w-=dt;if(l.w<=0)fx(s,'zap');}else{l.f-=dt;for(const p of s.p)if(p.alive&&Math.abs((l.v?p.x:p.y)-l.pos)<24)kill(s,p);}}
  s.l=s.l.filter(l=>l.f>0);},
 bot(s,i){const p=s.p[i];let x=0,y=0;for(const l of s.l){const d=(l.v?p.x:p.y)-l.pos;if(Math.abs(d)<75){if(l.v)x+=Math.sign(d||1);else y+=Math.sign(d||1);}}
  if(!x&&!y){const k=seek(p,480,300,150);return{x:k.x*.5,y:k.y*.5};}return{x,y};},
 draw(s,c){bg2(c,300,s.t);for(const l of s.l){const on=l.w<=0;c.strokeStyle=on?'#fff':`rgba(255,60,140,${.35+.3*Math.sin(s.t*30)})`;c.lineWidth=on?26:4;c.shadowColor='#ff3b9a';c.shadowBlur=on?30:0;
   c.beginPath();if(l.v){c.moveTo(l.pos,56);c.lineTo(l.pos,540);}else{c.moveTo(0,l.pos);c.lineTo(960,l.pos);}c.stroke();c.shadowBlur=0;}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p));}});

// 3
TP.add({id:'paint',name:'Paint Party',dim:2,time:30,kind:'score',desc:'Run over tiles to paint them your color. Most tiles wins!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,480,300,160);s.g=Array(288).fill(-1);},
 update(s,I,dt){s.p.forEach((p,i)=>{move(p,I[i],dt,340);bound(p,16,76,944,524);const k=Math.floor((p.y-60)/40)*24+Math.floor(p.x/40),o=s.g[k];if(o!==i){if(o>=0)s.p[o].score--;s.g[k]=i;p.score++;}});bump(s.p,20,.6);},
 bot(s,i){const p=s.p[i];if(p.tx===undefined||Math.hypot(p.tx-p.x,p.ty-p.y)<22||Math.random()<.01)for(let n=0;n<8;n++){const k=rint(0,287);if(s.g[k]!==i){p.tx=k%24*40+20;p.ty=80+Math.floor(k/24)*40;break;}}
  return seek(p,p.tx===undefined?480:p.tx,p.ty===undefined?300:p.ty);},
 draw(s,c){bg2(c,210,s.t);c.globalAlpha=.8;s.g.forEach((v,k)=>{if(v>=0){c.fillStyle=PCOL[v];c.fillRect(k%24*40+1,61+Math.floor(k/24)*40,38,38);}});c.globalAlpha=1;s.p.forEach((p,i)=>chr(c,i,p.x,p.y,18,p));}});

// 4
TP.add({id:'pump',name:'Balloon Pump',dim:2,time:25,kind:'score',desc:'Mash to pump your balloon. First to POP wins!',ctl:'MASH: Space',
 init(s){s.p.forEach((p,i)=>{p.x=180+i*200;p.y=430;p.br=rnd(5.5,8);});},
 update(s,I,dt){s.p.forEach((p,i)=>{if(I[i].ap){p.score=Math.min(100,p.score+1.2);p.sq=.1;}p.sq=(p.sq||0)-dt;p.d=Math.floor(p.score)+'%';if(p.score>=100&&!s.over){s.over=true;fx(s,'boom');}});},
 bot(s,i){return{x:0,y:0,ap:Math.random()<s.p[i].br/60};},
 draw(s,c){bg2(c,330,s.t);s.p.forEach((p,i)=>{const r=28+p.score*1.15,q=p.sq>0?.93:1;c.fillStyle=PCOL[i];c.beginPath();c.ellipse(p.x,335-r,r*q,r*1.1/q,0,0,TAU);c.fill();
   c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(p.x-r*.35,335-r*1.4,r*.2,r*.3,0,0,TAU);c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(p.x,335);c.lineTo(p.x,400);c.stroke();
   chr(c,i,p.x,p.y,26,p,{h:p.sq>0?5:0,nolab:1});txt(c,TP.players[i].name,p.x,485,18,PCOL[i]);txt(c,Math.floor(p.score)+'%',p.x,512,22,'#fff');});}});

// 5
TP.add({id:'sumo',name:'Bubble Sumo',dim:2,time:45,kind:'surv',desc:'Shove everyone off the shrinking island!',ctl:'Move: WASD · Dash: Space',
 init(s){spawn4(s,480,300,120);s.R=235;},
 update(s,I,dt){s.R=Math.max(34,235-s.t*4.8);s.p.forEach((p,i)=>{if(!p.alive)return;p.cd=(p.cd||0)-dt;move(p,I[i],dt,260,3);
   if(I[i].ap&&p.cd<=0){p.cd=.9;p.vx+=Math.cos(p.ang)*330;p.vy+=Math.sin(p.ang)*330;fx(s,'jump');}if(Math.hypot(p.x-480,p.y-300)>s.R+8)kill(s,p);});bump(s.p,26,1.3);},
 bot(s,i){const p=s.p[i],t=nearest(p,s.p,o=>o!==p&&o.alive),r=Math.hypot(p.x-480,p.y-300);if(r>s.R-85||!t)return seek(p,480,300);
  const k=seek(p,t.x,t.y);k.ap=Math.hypot(t.x-p.x,t.y-p.y)<90&&Math.hypot(t.x-480,t.y-300)>r&&Math.random()<.08;return k;},
 draw(s,c){bg2(c,200,s.t);disc(c,480,300,s.R+7,'#ff3b9a');disc(c,480,300,s.R,'#27c8e0');disc(c,480,300,s.R*.6,'#4fe3f5');s.p.forEach((p,i)=>chr(c,i,p.x,p.y,24,p,{hideDead:1}));}});

// 6
TP.add({id:'wave',name:'Wave Jumper',dim:2,time:50,kind:'surv',desc:'Shockwaves sweep the floor from both sides. Jump them all!',ctl:'Move: A/D · Jump: Space',
 init(s){s.p.forEach((p,i)=>{p.x=300+i*120;p.y=440;p.bj=rnd(.17,.26);});s.o=[];s.nx=1.5;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.5,1.7-s.t*.03)*rnd(.7,1.2);const d=rint(0,1)?1:-1;s.o.push({x:d>0?-30:990,v:d*(260+s.t*6)});}
  for(const o of s.o)o.x+=o.v*dt;s.o=s.o.filter(o=>o.x>-60&&o.x<1020);
  s.p.forEach((p,i)=>{if(!p.alive)return;const n=I[i];p.vx+=(n.x*240-p.vx)*Math.min(1,10*dt);p.x=clamp(p.x+p.vx*dt,30,930);if(Math.abs(n.x)>.2)p.ang=n.x>0?0:Math.PI;
   if(p.h<=0){if(n.a||n.y<-.5){p.vh=520;p.h=.1;fx(s,'jump');}}else{p.vh-=1500*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;}}
   for(const o of s.o)if(Math.abs(o.x-p.x)<20&&p.h<28)kill(s,p);});},
 bot(s,i){const p=s.p[i];let a=false;for(const o of s.o){const d=(p.x-o.x)*Math.sign(o.v);if(d>0&&d<Math.abs(o.v)*p.bj)a=true;}return{x:Math.sin(s.t+i*2)*.5,y:0,a};},
 draw(s,c){bg2(c,170,s.t);c.fillStyle='#1b0f3d';c.fillRect(0,462,W,80);c.fillStyle='#2ec5ff';c.fillRect(0,462,W,4);
  for(const o of s.o){c.shadowColor='#ffe13b';c.shadowBlur=20;c.fillStyle='#ffe13b';c.fillRect(o.x-9,420,18,42);c.shadowBlur=0;}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p,{h:p.h,hideDead:1}));}});

// 7
TP.add({id:'flap',name:'Cape Gliders',dim:2,time:45,kind:'surv',desc:'Flap through the neon gates. Touch nothing!',ctl:'Flap: Space',
 init(s){s.p.forEach((p,i)=>{p.x=170+i*45;p.y=280;});s.o=[];s.nx=1.2;},
 update(s,I,dt){const v=210+s.t*5,gap=Math.max(118,175-s.t*1.3);s.nx-=dt;if(s.nx<=0){s.nx=320/v;s.o.push({x:1000,y:rnd(150,440),g:gap});}
  for(const o of s.o)o.x-=v*dt;s.o=s.o.filter(o=>o.x>-60);
  s.p.forEach((p,i)=>{if(!p.alive)return;if(I[i].ap){p.vy=-330;fx(s,'jump');}p.vy+=950*dt;p.y+=p.vy*dt;if(p.y>520||p.y<70)kill(s,p);
   for(const o of s.o)if(Math.abs(o.x-p.x)<38&&Math.abs(p.y-o.y)>o.g/2-16)kill(s,p);});},
 bot(s,i){const p=s.p[i];let t=300;for(const o of s.o)if(o.x>p.x-45){t=o.y;break;}return{x:0,y:0,ap:p.y>t+14+Math.sin(s.t*3+i*2)*16&&p.vy>-60};},
 draw(s,c){bg2(c,220,s.t);for(const o of s.o){c.fillStyle='#52e36b';c.fillRect(o.x-30,56,60,o.y-o.g/2-56);c.fillRect(o.x-30,o.y+o.g/2,60,540);c.fillStyle='#b6ffc4';c.fillRect(o.x-34,o.y-o.g/2-12,68,12);c.fillRect(o.x-34,o.y+o.g/2,68,12);}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,16,p,{nosh:1,hideDead:1,dir:1}));}});

// 8
TP.add({id:'tug',name:'Tug of Titans',dim:2,time:25,kind:'score',teams:true,desc:'TEAMS! Mash to drag the other team into the slime.',ctl:'MASH: Space',
 init(s){s.ts=[0,0];s.pos=0;s.p.forEach(p=>{p.br=rnd(5.5,7.5);});},
 update(s,I,dt){s.p.forEach((p,i)=>{if(I[i].ap){s.pos+=p.team?1.4:-1.4;p.sq=.1;}p.sq=(p.sq||0)-dt;});if(Math.abs(s.pos)>=100){s.ts[s.pos<0?0:1]=1;s.over=true;}},
 fin(s){if(!s.ts[0]&&!s.ts[1]&&s.pos)s.ts[s.pos<0?0:1]=1;},
 bot(s,i){return{x:0,y:0,ap:Math.random()<s.p[i].br/60};},
 draw(s,c){bg2(c,20,s.t);const cx=480+s.pos*3;c.fillStyle='#3be35a';c.beginPath();c.ellipse(480,432,70,18,0,0,TAU);c.fill();
  c.strokeStyle='#d9b382';c.lineWidth=8;c.beginPath();c.moveTo(cx-340,385);c.lineTo(cx+340,385);c.stroke();c.fillStyle='#ff3b3b';c.fillRect(cx-5,366,10,38);
  const n=[0,0];s.p.forEach((p,i)=>{const k=n[p.team]++;chr(c,i,cx+(p.team?1:-1)*(150+k*110),395,30,p,{dir:p.team?-1:1,tc:TCOL[p.team],h:p.sq>0?6:0});});
  txt(c,'◀ RED',200,130,36,TCOL[0]);txt(c,'BLUE ▶',760,130,36,TCOL[1]);}});

// 9
TP.add({id:'bomb',name:'Hot Bomb',dim:2,time:60,kind:'surv',desc:'Holding the bomb? Tag someone to pass it before it blows!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,480,300,160);s.h=rint(0,3);s.f=rnd(7,10);s.im=0;},
 update(s,I,dt){s.im-=dt;s.f-=dt;s.p.forEach((p,i)=>{if(p.alive){move(p,I[i],dt,i===s.h?350:310);bound(p,25,80,935,510);}});
  const h=s.p[s.h];if(s.im<=0)for(const p of s.p)if(p!==h&&p.alive&&Math.hypot(p.x-h.x,p.y-h.y)<44){s.h=p.i;s.im=.6;fx(s,'hit');break;}
  if(s.f<=0){kill(s,s.p[s.h]);fx(s,'boom');const a=s.p.filter(p=>p.alive);if(a.length){s.h=pick(a).i;s.f=rnd(6,9);s.im=1;}}},
 bot(s,i){const p=s.p[i];if(i===s.h){const t=nearest(p,s.p,o=>o!==p&&o.alive);return t?seek(p,t.x,t.y):Z;}
  const h=s.p[s.h];let x=p.x-h.x,y=p.y-h.y;const d=Math.hypot(x,y)||1;return{x:x/d+(480-p.x)/300,y:y/d+(300-p.y)/200};},
 draw(s,c){bg2(c,0,s.t);if(s.f<2&&Math.floor(s.t*8)%2){c.fillStyle='rgba(255,0,0,.15)';c.fillRect(0,0,W,H);}
  s.p.forEach((p,i)=>{chr(c,i,p.x,p.y,22,p,{hideDead:1});if(i===s.h&&p.alive){disc(c,p.x,p.y-62,15,'#16161d','#ff3b3b');txt(c,Math.ceil(Math.max(0,s.f)),p.x,p.y-61,16,'#ffe13b','center',0);}});}});

// 10
TP.add({id:'trail',name:'Light Trails',dim:2,time:60,kind:'surv',rawBot:true,desc:'You leave a wall of light behind you. Crash into nothing!',ctl:'Turn: WASD / Arrows',
 init(s){s._g=new Uint8Array(96*48);const st=[[10,10,0],[85,37,2],[85,10,1],[10,37,3]];s.p.forEach((p,i)=>{p.cx=st[i][0];p.cy=st[i][1];p.dr=st[i][2];p.nd=p.dr;p.tr=[p.cx,p.cy];});s.st=0;},
 update(s,I,dt){s.p.forEach((p,i)=>{if(!p.alive)return;const n=I[i];let d=-1;if(Math.abs(n.x)>Math.abs(n.y)){if(n.x>.5)d=0;else if(n.x<-.5)d=2;}else{if(n.y>.5)d=1;else if(n.y<-.5)d=3;}if(d>=0&&(d+2)%4!==p.dr)p.nd=d;});
  s.st+=dt;while(s.st>=.045){s.st-=.045;for(const p of s.p){if(!p.alive)continue;if(p.nd!==p.dr){p.dr=p.nd;p.tr.push(p.cx,p.cy);}s._g[p.cy*96+p.cx]=1;p.cx+=DX[p.dr];p.cy+=DY[p.dr];
    if(p.cx<0||p.cx>95||p.cy<0||p.cy>47||s._g[p.cy*96+p.cx])kill(s,p);}}
  s.p.forEach(p=>{p.x=p.cx*10+5;p.y=65+p.cy*10;});},
 bot(s,i){const p=s.p[i],g=s._g,bad=(x,y)=>x<0||x>95||y<0||y>47||g[y*96+x];let d=p.dr,bl=false;for(let k=1;k<=3;k++)if(bad(p.cx+DX[d]*k,p.cy+DY[d]*k)){bl=true;break;}
  if(bl||Math.random()<.01){const o=[(d+1)%4,(d+3)%4].filter(q=>!bad(p.cx+DX[q],p.cy+DY[q])&&!bad(p.cx+DX[q]*2,p.cy+DY[q]*2));if(o.length)d=pick(o);}return{x:DX[d],y:DY[d]};},
 draw(s,c){bg2(c,270,0);c.lineCap='square';s.p.forEach((p,i)=>{c.strokeStyle=PCOL[i];c.lineWidth=7;c.globalAlpha=p.alive?1:.3;c.shadowColor=PCOL[i];c.shadowBlur=12;c.beginPath();
   for(let k=0;k<p.tr.length;k+=2)c.lineTo(p.tr[k]*10+5,65+p.tr[k+1]*10);c.lineTo(p.x,p.y);c.stroke();c.shadowBlur=0;c.globalAlpha=1;});
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,11,p,{nosh:1,hideDead:1,dir:p.dr===2?-1:1}));}});

// 11
TP.add({id:'stars',name:'Star Shower',dim:2,time:30,kind:'score',desc:'Catch falling stars. Bombs cost you 2 and a headache.',ctl:'Move: A/D or ←/→',
 init(s){s.p.forEach((p,i)=>{p.x=240+i*160;p.y=470;});s.o=[];s.nx=.5;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=rnd(.18,.4);s.o.push({x:rnd(40,920),y:50,v:rnd(160,280)+s.t*3,b:Math.random()<.22?1:0});}
  for(const o of s.o)o.y+=o.v*dt;
  s.p.forEach((p,i)=>{p.st=(p.st||0)-dt;const n=p.st>0?Z:I[i];p.vx+=(n.x*380-p.vx)*Math.min(1,10*dt);p.x=clamp(p.x+p.vx*dt,25,935);if(Math.abs(n.x)>.2)p.ang=n.x>0?0:Math.PI;
   s.o=s.o.filter(o=>{if(p.st<=0&&Math.abs(o.x-p.x)<30&&Math.abs(o.y-p.y+10)<30){if(o.b){p.st=1;p.score=Math.max(0,p.score-2);fx(s,'boom');}else{p.score++;fx(s,'coin');}return false;}return true;});});
  s.o=s.o.filter(o=>o.y<500);},
 bot(s,i){const p=s.p[i];let b=null,bs=1e9;for(const o of s.o){if(o.b)continue;const tt=(460-o.y)/o.v;const sc=Math.abs(o.x-p.x)+tt*60+((Math.floor(o.x)+i)%3)*140;if(Math.abs(o.x-p.x)/380<tt+.1&&sc<bs){bs=sc;b=o;}}
  let x=b?clamp((b.x-p.x)/40,-1,1):0;for(const o of s.o)if(o.b&&o.y>330&&Math.abs(o.x-p.x)<45)x=Math.sign(p.x-o.x||1);return{x,y:0};},
 draw(s,c){bg2(c,240,s.t);c.fillStyle='#1b0f3d';c.fillRect(0,492,W,50);for(const o of s.o){if(o.b){disc(c,o.x,o.y,13,'#16161d','#ff3b3b');disc(c,o.x+8,o.y-13,4,'#ffe13b');}else star(c,o.x,o.y,15,'#ffe13b');}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p));}});

// 12
TP.add({id:'draw',name:'Quick Draw',dim:2,time:60,kind:'score',desc:'Wait for DRAW! then hit the button first. Too early and you are locked out.',ctl:'Draw: Space',
 init(s){s.r=0;s.ph=0;s.w=rnd(1.5,4);s.n=0;s.gt=0;s.p.forEach((p,i)=>{p.x=180+i*200;p.y=390;p.rt=-1;p.br=rnd(.2,.5);});},
 update(s,I,dt){if(s.ph===0){s.w-=dt;s.p.forEach((p,i)=>{if(I[i].ap&&p.rt===-1){p.rt=-2;fx(s,'bad');}});if(s.w<=0){s.ph=1;s.gt=0;s.n=0;fx(s,'go');}}
  else if(s.ph===1){s.gt+=dt;s.p.forEach((p,i)=>{if(I[i].ap&&p.rt===-1){p.rt=Math.round(s.gt*1000);p.score+=[3,2,1,0][s.n++];fx(s,'coin');}});if(s.gt>1.6||s.p.every(p=>p.rt!==-1)){s.ph=2;s.w=1.8;}}
  else{s.w-=dt;if(s.w<=0){s.r++;if(s.r>=5){s.over=true;return;}s.ph=0;s.w=rnd(1.5,4);s.p.forEach(p=>{p.rt=-1;p.br=rnd(.2,.5);});}}},
 bot(s,i){const p=s.p[i];return{x:0,y:0,ap:s.ph===1&&p.rt===-1&&s.gt>=p.br};},
 draw(s,c){bg2(c,s.ph===0?0:130,s.t);txt(c,`ROUND ${Math.min(5,s.r+1)} / 5`,480,90,22,'#9fe8ff');txt(c,s.ph===0?'WAIT...':'DRAW!',480,190,90,s.ph===0?'#ff4d5e':'#52e36b');
  s.p.forEach((p,i)=>{chr(c,i,p.x,p.y,30,p);if(p.rt===-2)txt(c,'TOO EARLY',p.x,470,18,'#ff4d5e');else if(p.rt>=0)txt(c,p.rt+' ms',p.x,470,22,'#ffe13b');});}});

// 13
const SD=[['y',1,298,'x',480],['y',-1,298,'x',480],['x',-1,480,'y',298],['x',1,480,'y',298]];
TP.add({id:'pong',name:'Four Walls',dim:2,time:60,kind:'surv',desc:'Guard your wall! 3 lives each. Last wall standing wins.',ctl:'Slide: A/D (top & bottom walls) · W/S (side walls)',
 nb(){const a=rnd(.3,1.2)+rint(0,3)*Math.PI/2;return{x:480,y:298,vx:Math.cos(a)*230,vy:Math.sin(a)*230,w:1};},
 init(s){s.p.forEach(p=>{p.q=0;p.lv=3;});s.b=[this.nb()];},
 update(s,I,dt){if(s.b.length<2&&s.t>15)s.b.push(this.nb());
  s.p.forEach((p,i)=>{if(p.alive)p.q=clamp(p.q+(i<2?I[i].x:I[i].y)*340*dt,-150,150);p.d='♥'.repeat(Math.max(0,p.lv));});
  for(const b of s.b){if(b.w>0){b.w-=dt;continue;}b.x+=b.vx*dt;b.y+=b.vy*dt;
   SD.forEach(([ax,dir,c,o,oc],i)=>{const d=(b[ax]-c)*dir,p=s.p[i];if(d>193&&b['v'+ax]*dir>0){
     if(!p.alive||Math.abs(b[o]-oc-p.q)<58){b['v'+ax]*=-1.05;if(p.alive)b['v'+o]+=(b[o]-oc-p.q)*2.5;fx(s,'tick');}
     else if(d>212){p.lv--;fx(s,'bad');if(p.lv<=0){p.alive=false;p.score=s.t;}Object.assign(b,this.nb());}}});
   const v=Math.hypot(b.vx,b.vy);if(v>520){b.vx*=520/v;b.vy*=520/v;}}},
 bot(s,i){const p=s.p[i],[ax,dir,c,o,oc]=SD[i];let t=0,bd=-1e9;for(const b of s.b){const d=(b[ax]-c)*dir;if(b['v'+ax]*dir>0&&d>bd){bd=d;t=b[o]-oc;}}const v=clamp((t-p.q)/30,-1,1);return i<2?{x:v,y:0}:{x:0,y:v};},
 draw(s,c){bg2(c,230,s.t);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;c.strokeRect(275,93,410,410);
  s.p.forEach((p,i)=>{const [ax,dir,cc,,oc]=SD[i],al=oc+p.q,pos=cc+dir*205;c.fillStyle=p.alive?PCOL[i]:'#555';
   if(ax==='y'){c.fillRect(p.alive?al-56:275,pos-6,p.alive?112:410,12);chr(c,i,p.alive?al:480,pos+dir*22-4,11,p,{nosh:1,nolab:1});}
   else{c.fillRect(pos-6,p.alive?al-56:93,12,p.alive?112:410);chr(c,i,pos+dir*26,p.alive?al:298,11,p,{nosh:1,nolab:1});}});
  for(const b of s.b)disc(c,b.x,b.y,9,b.w>0?'#888':'#fff');}});

// 14
const HOLES=[];for(let r=0;r<2;r++)for(let q=0;q<4;q++)HOLES.push([180+q*200,220+r*190]);
TP.add({id:'whack',name:'Whack-a-Bot',dim:2,time:30,kind:'score',desc:'Robots pop out of the holes. Run over and bonk them first! Gold = 3.',ctl:'Move: WASD · Bonk: Space',
 init(s){spawn4(s,480,315,60);s.m=[];s.nx=.6;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=rnd(.35,.7);const k=rint(0,7);if(!s.m.some(m=>m.k===k))s.m.push({k,t:rnd(1.2,2),g:Math.random()<.15?1:0});}
  s.m=s.m.filter(m=>(m.t-=dt)>0);
  s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;p.sw=(p.sw||0)-dt;move(p,I[i],dt,340);bound(p,25,85,935,515);
   if(I[i].ap&&p.cd<=0){p.cd=.3;p.sw=.15;const m=s.m.find(m=>m.t>0&&Math.hypot(HOLES[m.k][0]-p.x,HOLES[m.k][1]-p.y)<54);if(m){p.score+=m.g?3:1;m.t=0;fx(s,'hit');}}});bump(s.p,20,.5);},
 bot(s,i){const p=s.p[i],m=nearest(p,s.m.map(m=>({x:HOLES[m.k][0],y:HOLES[m.k][1]})));if(!m)return seek(p,480,315,80);const k=seek(p,m.x,m.y,20);k.ap=Math.hypot(m.x-p.x,m.y-p.y)<46&&Math.random()<.2;return k;},
 draw(s,c){bg2(c,140,s.t);for(const [x,y] of HOLES){c.fillStyle='#0b0620';c.beginPath();c.ellipse(x,y+14,44,18,0,0,TAU);c.fill();}
  for(const m of s.m){const [x,y]=HOLES[m.k],u=Math.min(1,m.t*4);c.fillStyle=m.g?'#ffd23b':'#9aa3b5';c.fillRect(x-22,y+12-u*46,44,u*46);c.fillStyle='#ff3b6b';c.fillRect(x-13,y+22-u*46,9,7);c.fillRect(x+4,y+22-u*46,9,7);c.fillRect(x-2,y+2-u*46,4,10);}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p,{h:p.sw>0?8:0}));}});

// 15
TP.add({id:'astro',name:'Astro Blaster',dim:2,time:40,kind:'score',desc:'Blast the space rocks for points. Crash into one and lose a point.',ctl:'Turn: A/D · Thrust: W · Fire: Space',
 na(r,x,y){const a=rnd(TAU),v=rnd(40,110),e=rint(0,3);return{x:x!==undefined?x:(e%2?rnd(960):(e?990:-30)),y:y!==undefined?y:(e%2?(e>1?555:45):rnd(60,540)),vx:Math.cos(a)*v,vy:Math.sin(a)*v,r};},
 init(s){spawn4(s,480,300,110);s.o=[];s.b=[];for(let k=0;k<6;k++)s.o.push(this.na(34));},
 update(s,I,dt){const wrap=o=>{if(o.x<-40)o.x=1000;if(o.x>1000)o.x=-40;if(o.y<40)o.y=560;if(o.y>560)o.y=40;};
  s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;p.st=(p.st||0)-dt;const n=I[i];
   if(p.st<=0){p.ang+=n.x*4*dt;if(n.y<-.2){p.vx+=Math.cos(p.ang)*400*dt;p.vy+=Math.sin(p.ang)*400*dt;}
    if(n.a&&p.cd<=0){p.cd=.22;s.b.push({x:p.x,y:p.y,vx:Math.cos(p.ang)*520,vy:Math.sin(p.ang)*520,o:i,l:.9});fx(s,'tick');}}
   const f=Math.exp(-.8*dt);p.vx*=f;p.vy*=f;p.x+=p.vx*dt;p.y+=p.vy*dt;wrap(p);
   for(const o of s.o)if(p.st<=0&&Math.hypot(o.x-p.x,o.y-p.y)<o.r+14){p.st=1.2;p.score=Math.max(0,p.score-1);p.vx=o.vx*2;p.vy=o.vy*2;fx(s,'hit');}});
  for(const o of s.o){o.x+=o.vx*dt;o.y+=o.vy*dt;wrap(o);}
  const add=[];for(const b of s.b){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;for(const o of s.o)if(b.l>0&&!o.dead&&Math.hypot(o.x-b.x,o.y-b.y)<o.r+4){b.l=0;o.dead=1;s.p[b.o].score++;fx(s,'boom');if(o.r>20)add.push(this.na(17,o.x,o.y),this.na(17,o.x,o.y));}}
  s.b=s.b.filter(b=>b.l>0);s.o=s.o.filter(o=>!o.dead).concat(add);if(s.o.length<5)s.o.push(this.na(34));},
 bot(s,i){const p=s.p[i],o=nearest(p,s.o);if(!o)return Z;const d=angd(p.ang,Math.atan2(o.y-p.y,o.x-p.x)),ds=Math.hypot(o.x-p.x,o.y-p.y);return{x:clamp(d*3,-1,1),y:ds>260&&Math.abs(d)<.5?-1:0,a:Math.abs(d)<.15&&ds<420};},
 draw(s,c){bg2(c,235,0);for(const o of s.o)disc(c,o.x,o.y,o.r,'#5b4a8a','#c9b8ff');for(const b of s.b)disc(c,b.x,b.y,4,PCOL[b.o]);
  s.p.forEach((p,i)=>{c.save();c.translate(p.x,p.y);c.rotate(p.ang);c.fillStyle=PCOL[i];c.beginPath();c.moveTo(26,0);c.lineTo(-16,-16);c.lineTo(-8,0);c.lineTo(-16,16);c.closePath();c.fill();c.restore();chr(c,i,p.x,p.y,10,p,{nosh:1,lab:3.4});});}});

// 16
TP.add({id:'frog',name:'Neon Crossing',dim:2,time:40,kind:'score',desc:'Cross the neon highway. Every crossing is a point. Splat = back to start.',ctl:'Move: WASD / Arrows',
 init(s,K){K.l=[];for(let k=0;k<8;k++){const gap=rnd(230,330);K.l.push({y:150+k*42,v:(k%2?1:-1)*rnd(90,200),gap,n:Math.ceil(1200/gap),w:rnd(60,100)});}s.p.forEach((p,i)=>{p.x=300+i*120;p.y=505;});},
 cars(L,t){const o=[],tot=L.n*L.gap;for(let k=0;k<L.n;k++)o.push((((k*L.gap+L.v*t)%tot)+tot)%tot-120);return o;},
 update(s,I,dt,K){s.p.forEach((p,i)=>{p.st=(p.st||0)-dt;if(p.st>0)return;move(p,I[i],dt,230,12);bound(p,20,75,940,515);
   if(p.y<110){p.score++;p.y=505;fx(s,'win');}
   for(const L of K.l)if(Math.abs(p.y-L.y)<24)for(const x of this.cars(L,s.t))if(Math.abs(p.x-x)<L.w/2+13){p.y=505;p.st=.6;p.vx=p.vy=0;fx(s,'hit');}});},
 bot(s,i,K){const p=s.p[i],safe=(y,t)=>{for(const L of K.l)if(Math.abs(y-L.y)<26)for(const x of this.cars(L,t))if(Math.abs(p.x-x)<L.w/2+22)return false;return true;};
  return{x:0,y:safe(p.y-38,s.t+.16)?-1:(safe(p.y,s.t+.1)?0:1)};},
 draw(s,c,me,K){bg2(c,150,0);c.fillStyle='#16161d';c.fillRect(0,129,W,336);c.fillStyle='#52e36b55';c.fillRect(0,56,W,73);
  K.l.forEach((L,k)=>{c.fillStyle='rgba(255,255,255,.15)';c.fillRect(0,L.y+20,W,2);for(const x of this.cars(L,s.t)){c.fillStyle=`hsl(${k*47},85%,58%)`;c.fillRect(x-L.w/2,L.y-15,L.w,30);c.fillStyle='#ffe13b';c.fillRect(L.v>0?x+L.w/2-6:x-L.w/2,L.y-12,6,24);}});
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,15,p));}});

// 17
TP.add({id:'bull',name:'Bullseye Stop',dim:2,time:60,kind:'score',desc:'Stop your marker dead center. 5 rounds, it gets faster!',ctl:'Stop: Space',
 rs(s){s.rt=0;s.p.forEach(p=>{p.m=0;p.stp=0;p.o=rnd(TAU);p.bt=rnd(.06,.3);});},
 init(s){s.r=0;s.ph=0;s.w=0;s.p.forEach((p,i)=>{p.x=180+i*200;p.y=430;});this.rs(s);},
 update(s,I,dt){if(s.ph===0){s.rt+=dt;let all=true;s.p.forEach((p,i)=>{if(p.stp)return;p.m=Math.sin(p.o+s.rt*(2.4+s.r*.7));
    if((I[i].ap&&s.rt>.4)||s.rt>6){p.stp=1;p.g=Math.round(10*(1-Math.abs(p.m)));p.score+=p.g;fx(s,p.g>=9?'win':'tick');}else all=false;});if(all){s.ph=1;s.w=1.8;}}
  else{s.w-=dt;if(s.w<=0){s.r++;if(s.r>=5){s.over=true;return;}s.ph=0;this.rs(s);}}},
 bot(s,i){const p=s.p[i];return{x:0,y:0,ap:!p.stp&&s.rt>.8&&Math.abs(p.m)<p.bt};},
 draw(s,c){bg2(c,190,s.t);txt(c,`ROUND ${Math.min(5,s.r+1)} / 5`,480,90,22,'#9fe8ff');
  s.p.forEach((p,i)=>{c.fillStyle='#0b0620';c.fillRect(p.x-12,130,24,220);c.fillStyle='#ff3b6b';c.fillRect(p.x-12,228,24,24);c.fillStyle='#ffe13b';c.fillRect(p.x-12,236,24,8);
   c.fillStyle=PCOL[i];c.fillRect(p.x-30,240+p.m*105-4,60,8);chr(c,i,p.x,p.y,26,p);if(p.stp)txt(c,'+'+p.g,p.x,500,26,p.g>=9?'#52e36b':'#fff');});}});

// 18
const CC=['#ff3b6b','#2ec5ff','#ffd23b','#52e36b'],CN=['RED','BLUE','YELLOW','GREEN'];
TP.add({id:'color',name:'Color Call',dim:2,time:60,kind:'surv',desc:'Read the WORD, ignore the ink. Stand on that color before the floor drops!',ctl:'Move: WASD / Arrows',
 nr(s){s.z=shuffle([0,1,2,3]);s.c=rint(0,3);s.w0=s.w=Math.max(1.3,3.4-s.r*.25);s.ph=0;s.p.forEach(p=>{p.bd=rnd(.15,.9);});},
 zone(p){return(p.y>300?2:0)+(p.x>480?1:0);},
 init(s){spawn4(s,480,300,60);s.r=0;this.nr(s);},
 update(s,I,dt){s.p.forEach((p,i)=>{if(p.alive){move(p,I[i],dt,330);bound(p,22,82,938,518);}});bump(s.p,20,.6);s.w-=dt;
  if(s.ph===0&&s.w<=0){s.ph=1;s.w=1.2;fx(s,'zap');for(const p of s.p)if(p.alive&&s.z[this.zone(p)]!==s.c)kill(s,p);}else if(s.ph===1&&s.w<=0){s.r++;this.nr(s);}},
 bot(s,i){const p=s.p[i];if(s.ph||s.w0-s.w<p.bd)return Z;const q=s.z.indexOf(s.c);return seek(p,q%2?720:240,q>1?410:190,60);},
 draw(s,c){bg2(c,260,0);for(let q=0;q<4;q++){const ok=s.ph===0||s.z[q]===s.c;c.fillStyle=ok?CC[s.z[q]]:'#0b0620';c.globalAlpha=ok?.55:1;c.fillRect(q%2?482:4,q>1?302:60,474,q>1?234:238);}c.globalAlpha=1;
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,20,p,{hideDead:1}));txt(c,CN[s.c],480,300,70,CC[(s.c+1+s.r)%4],'center','#fff');
  if(s.ph===0){c.fillStyle='#fff';c.fillRect(330,345,300*Math.max(0,s.w/s.w0),10);}}});

// 19
const AR=['→','↓','←','↑'];
TP.add({id:'seq',name:'Sequence Stomp',dim:2,time:90,kind:'surv',rawBot:true,desc:'Watch the arrows, then tap them back in order. It gets longer every round!',ctl:'Tap: WASD / Arrows',
 nr(s){s.q.push(rint(0,3));s.ph=0;s.w0=s.w=s.q.length*.55+.8;s.p.forEach(p=>{p.k=0;p.ld=-1;});},
 init(s){s.q=[rint(0,3),rint(0,3)];s.p.forEach((p,i)=>{p.x=180+i*200;p.y=420;});this.nr(s);},
 update(s,I,dt){s.w-=dt;if(s.ph===0){if(s.w<=0){s.ph=1;s.w=s.q.length*.8+2;fx(s,'go');}return;}
  if(s.ph===1){let all=true;s.p.forEach((p,i)=>{if(!p.alive)return;const n=I[i],d=Math.abs(n.x)>Math.abs(n.y)?(n.x>.5?0:n.x<-.5?2:-1):(n.y>.5?1:n.y<-.5?3:-1);
    if(d!==-1&&d!==p.ld&&p.k<s.q.length){if(d===s.q[p.k]){p.k++;fx(s,'tick');}else kill(s,p);}p.ld=d;if(p.alive&&p.k<s.q.length)all=false;});
   if(all||s.w<=0){for(const p of s.p)if(p.alive&&p.k<s.q.length)kill(s,p);s.ph=2;s.w=1.2;}}
  else if(s.w<=0)this.nr(s);},
 bot(s,i){const p=s.p[i];if(s.ph!==1||p.k>=s.q.length||Math.floor(s.t*5+i)%2)return Z;let d=s.q[p.k];if(Math.random()<.004*s.q.length)d=(d+1)%4;return{x:DX[d],y:DY[d]};},
 draw(s,c){bg2(c,285,s.t);const n=s.q.length;txt(c,n+' ARROWS',480,90,22,'#9fe8ff');
  if(s.ph===0){const e=s.w0-s.w,k=Math.floor(e/.55);txt(c,'WATCH!',480,150,34,'#ff7ad9');if(k<n&&e/.55-k<.8)txt(c,AR[s.q[k]],480,250,130,CC[s.q[k]]);}
  else txt(c,s.ph===1?'YOUR TURN!':'NICE!',480,170,44,'#52e36b');
  s.p.forEach((p,i)=>{chr(c,i,p.x,p.y,28,p);if(s.ph>0&&p.alive)for(let k=0;k<n;k++){const x=p.x-(n-1)*9+k*18;if(k<p.k)txt(c,AR[s.q[k]],x,490,18,CC[s.q[k]]);else disc(c,x,490,4,'#ffffff55');}});}});

// 20
TP.add({id:'grav',name:'Gravity Runner',dim:2,time:50,kind:'surv',desc:'Flip gravity to run on the ceiling. Dodge the spikes on both sides!',ctl:'Flip gravity: Space',
 init(s){s.p.forEach((p,i)=>{p.x=170+i*40;p.y=455;p.g=1;p.bj=rnd(.2,.36);});s.o=[];s.nx=1.5;},
 update(s,I,dt){const v=300+s.t*7;s.nx-=dt;if(s.nx<=0){s.nx=rnd(.6,1.1)*320/v+.25;s.o.push({x:1000,c:rint(0,1),w:rnd(30,70)});}
  for(const o of s.o)o.x-=v*dt;s.o=s.o.filter(o=>o.x>-80);
  s.p.forEach((p,i)=>{if(!p.alive)return;const gr=p.g>0?p.y>=455:p.y<=125;if(I[i].ap&&gr){p.g=-p.g;fx(s,'jump');}p.vy+=p.g*2600*dt;p.y+=p.vy*dt;if(p.y>455){p.y=455;p.vy=0;}if(p.y<125){p.y=125;p.vy=0;}
   for(const o of s.o)if(Math.abs(o.x-p.x)<o.w/2+12&&(o.c?p.y<175:p.y>405))kill(s,p);});},
 bot(s,i){const p=s.p[i],v=300+s.t*7;let ap=false;for(const o of s.o){const d=o.x-o.w/2-p.x;if(d>-20&&d<v*p.bj&&(o.c?p.g<0:p.g>0)){ap=true;break;}}return{x:0,y:0,ap};},
 draw(s,c){bg2(c,10,s.t);c.fillStyle='#1b0f3d';c.fillRect(0,56,W,48);c.fillRect(0,476,W,70);c.fillStyle='#ff7ad9';c.fillRect(0,102,W,4);c.fillRect(0,476,W,4);
  for(const o of s.o){c.fillStyle='#ffe13b';c.beginPath();if(o.c){c.moveTo(o.x-o.w/2,106);c.lineTo(o.x+o.w/2,106);c.lineTo(o.x,160);}else{c.moveTo(o.x-o.w/2,476);c.lineTo(o.x+o.w/2,476);c.lineTo(o.x,422);}c.fill();}
  s.p.forEach((p,i)=>chr(c,i,p.x,p.y,19,p,{nosh:1,hideDead:1,dir:1,flip:p.g<0}));}});
