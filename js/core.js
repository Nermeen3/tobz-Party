'use strict';
// ---------- Tobz Party: shared helpers ----------
const TP={games:[],players:[]};
const W=960,H=540,TAU=Math.PI*2;
const PCOL=['#ff3b6b','#2ec5ff','#ffd23b','#52e36b'],TCOL=['#ff4d5e','#4d8dff'],TNAME=['RED','BLUE'];
const DX=[1,0,-1,0],DY=[0,1,0,-1],Z=Object.freeze({x:0,y:0});
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const angd=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
TP.add=g=>TP.games.push(g);

// ---------- sound ----------
const Sfx=(()=>{let ac,n=0,last=0;
 const D={coin:[880,.08,'square',1320],jump:[300,.12,'square',620],hit:[220,.09,'sawtooth',110],bad:[240,.3,'sawtooth',60],zap:[900,.15,'sawtooth',200],win:[523,.35,'triangle',1046],tick:[660,.05,'square',660],go:[990,.3,'square',990],boom:[130,.4,'sawtooth',30]};
 return name=>{try{const now=performance.now();if(now-last>60){n=0;last=now;}if(++n>3)return;
  ac=ac||new (window.AudioContext||window.webkitAudioContext)();const d=D[name]||D.tick,o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
  o.type=d[2];o.frequency.setValueAtTime(d[0],t);o.frequency.exponentialRampToValueAtTime(d[3],t+d[1]);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d[1]);
  o.connect(g);g.connect(ac.destination);o.start();o.stop(t+d[1]);}catch(e){}};})();

// ---------- simulation helpers (ground plane is x,y · height is h) ----------
function fx(s,n){s.ev.push(n);}
function kill(s,p){if(p.alive){p.alive=false;p.score=s.t;fx(s,'bad');}}
function move(p,n,dt,max,fr=8){let x=n.x||0,y=n.y||0;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}const k=Math.min(1,fr*dt);
 p.vx+=(x*max-p.vx)*k;p.vy+=(y*max-p.vy)*k;p.x+=p.vx*dt;p.y+=p.vy*dt;if(m>.2)p.ang=Math.atan2(y,x);}
function mvk(p,n,dt,max,fr){if(p.kn>0){p.kn-=dt;move(p,Z,dt,max,1);}else move(p,n,dt,max,fr);}
function bound(p,x0,y0,x1,y1){if(p.x<x0){p.x=x0;if(p.vx<0)p.vx=0;}if(p.x>x1){p.x=x1;if(p.vx>0)p.vx=0;}if(p.y<y0){p.y=y0;if(p.vy<0)p.vy=0;}if(p.y>y1){p.y=y1;if(p.vy>0)p.vy=0;}}
function bump(ps,r,k=1){for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(!a.alive||!b.alive)continue;
 let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy);if(d>=2*r||d===0)continue;dx/=d;dy/=d;const o=(2*r-d)/2;a.x-=dx*o;a.y-=dy*o;b.x+=dx*o;b.y+=dy*o;
 const rv=(b.vx-a.vx)*dx+(b.vy-a.vy)*dy;if(rv<0){const q=-rv*(1+k)/2;a.vx-=dx*q;a.vy-=dy*q;b.vx+=dx*q;b.vy+=dy*q;}}}
function spawn4(s,cx,cy,r){s.p.forEach((p,i)=>{const a=i/s.p.length*TAU+Math.PI/4;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r;p.ang=a+Math.PI;});}
function seek(p,tx,ty,dz=0){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);return d<=dz||d===0?{x:0,y:0}:{x:dx/d,y:dy/d};}
function nearest(p,arr,f){let b=null,bd=1e9;for(const o of arr){if(f&&!f(o))continue;const d=Math.hypot(o.x-p.x,o.y-p.y);if(d<bd){bd=d;b=o;}}return b;}
// jump + falling off the edge. on = is there floor under the player. jv=0 disables jumping
function hop(s,p,n,dt,on,jv=7.5,g=24){
 if(p.fl){p.vh-=30*dt;p.h+=p.vh*dt;if(p.h<-9)kill(s,p);return;}
 if(p.h<=0){if(!on){p.fl=1;p.vh=0;return;}if(n.a&&jv){p.vh=jv;p.h=.01;fx(s,'jump');}}
 else{p.vh-=g*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;}}}

// ---------- 2D drawing helpers ----------
function txt(c,s,x,y,sz,col='#fff',al='center',st){c.font=`900 ${sz}px "Trebuchet MS",Verdana,sans-serif`;c.textAlign=al;c.textBaseline='middle';
 if(st!==0){c.lineWidth=Math.max(3,sz/6);c.strokeStyle=st||'#120a2a';c.lineJoin='round';c.strokeText(s,x,y);}c.fillStyle=col;c.fillText(s,x,y);}
function bg2(c,hue,t){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${hue},60%,11%)`);g.addColorStop(1,`hsl(${hue+40},70%,22%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
 c.strokeStyle=`hsla(${hue+60},100%,70%,.12)`;c.lineWidth=1;c.beginPath();const o=(t*20)%40;for(let x=-40+o;x<W;x+=40){c.moveTo(x,0);c.lineTo(x,H);}for(let y=-40+o;y<H;y+=40){c.moveTo(0,y);c.lineTo(W,y);}c.stroke();}
function disc(c,x,y,r,col,st){c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);c.fillStyle=col;c.fill();if(st){c.strokeStyle=st;c.lineWidth=3;c.stroke();}}
function starPath(c,x,y,r){c.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,q=k%2?r*.45:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function star(c,x,y,r,col){starPath(c,x,y,r);c.fillStyle=col;c.fill();}
function heartPath(c,x,y,r){c.beginPath();c.moveTo(x,y+r*.9);c.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.6,y-r*1.3,x,y-r*.4);c.bezierCurveTo(x+r*.6,y-r*1.3,x+r*1.6,y-r*.2,x,y+r*.9);c.closePath();}
// draw player i's character in a 2D game. p = sim player (optional), o = options
function chr(c,i,x,y,sz,p,o){const pl=TP.players[i];if(!pl)return;o=o||{};
 if(p&&p.alive===false){if(o.hideDead)return;c.globalAlpha=.25;}
 const h=o.h||0;
 if(!o.nosh){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,y+sz*1.05,sz*.85,sz*.28,0,0,TAU);c.fill();c.strokeStyle=o.tc||PCOL[i];c.lineWidth=3;c.stroke();}
 const dir=o.dir||(p&&Math.cos(p.ang||0)<-.1?-1:1);
 if(o.flip){c.save();c.translate(x,y-h);c.scale(1,-1);drawChar(c,pl.look,0,0,sz,dir);c.restore();}else drawChar(c,pl.look,x,y-h,sz,dir);
 if(p&&p.st>0)txt(c,'💫',x,y-h-sz*1.3,sz,'#fff','center',0);
 if(!o.nolab)txt(c,pl.name,x,y-h+(o.flip?1:-1)*sz*(o.lab||2.5),Math.max(11,sz*.6),PCOL[i]);
 c.globalAlpha=1;}
