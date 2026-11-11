'use strict';
// ---------- 3D mini games, part A: karts, ball sports, arena games ----------
// Draw calls get g (see g3.js). Coordinates: (x,y) ground, h height. +y is toward the camera.
function sc3(g,sky,f1,f2,fh){g.sky(sky);g.floor(f1,f2,260,fh===undefined?-9:fh);}
function chars3(g,s,o){s.p.forEach((p,i)=>{if(p.alive===false)return;g.chr(i,p.x,p.y,p.h||0,p.ang,Object.assign({tc:s.tm?TCOL[p.team]:0,tilt:p.st>0||p.kn>0?.6:0,nosh:p.h<-.1},o));});}
const hsl=(h,s=85,l=55)=>`hsl(${Math.round(((h%360)+360)%360)},${s}%,${l}%)`;

// ===== race items (shared by every race): 🚀 missile · 🧨 TNT · ⚡ turbo · 🛡️ shield · 🌩️ storm =====
const ITEMS=['','🚀','🧨','⚡','🛡️','🌩️'],PL4=['1st','2nd','3rd','4th'];
function itInit(s,K,boxes){K.bx=boxes;s.bx=boxes.map(()=>0);s.it=[];s.storm=0;s.p.forEach(p=>{p.item=0;p.roll=0;p.sh=0;p.spin=0;p.zap=0;p.inv=0;p.bo=0;p.ic='';p.pos=0;});}
function itHit(s,p){if(p.sh>0||p.fin||p.fl||p.inv>0||p.spin>0)return false;p.spin=1.1;p.sp*=.2;p.bo=0;fx(s,'boom');return true;}
function itStep(s,I,dt,K,rank){
 s.bx=s.bx.map(v=>v>0?v-1:0);if(s.storm>0)s.storm-=dt;
 const ord=s.p.slice().sort((a,b)=>rank(b)-rank(a));ord.forEach((p,k)=>{p.pos=k;});
 s.p.forEach((p,i)=>{if(p.fin){p.ic='';return;}if(p.sh>0)p.sh-=dt;
  if(!p.item&&p.roll<=0&&!p.fl)for(let k=0;k<K.bx.length;k++){const b=K.bx[k];if(!s.bx[k]&&Math.abs(b.x-p.x)<1.8&&Math.abs(b.y-p.y)<1.8&&Math.abs(b.h-p.h)<2.5){s.bx[k]=240;p.roll=1;fx(s,'coin');break;}}
  if(p.roll>0){p.roll-=dt;p.ic=ITEMS[1+Math.floor(s.t*12+i)%5];
   if(p.roll<=0){const w=p.pos===0?[1,3,3,1,0]:p.pos===3?[3,1,2,2,3]:[3,2,3,2,1];let r=Math.random()*w.reduce((a,b)=>a+b,0),q=0;while(q<4&&r>=w[q])r-=w[q++];p.item=q+1;p.ic=ITEMS[p.item];fx(s,'tick');}}
  else if(p.item&&(I[i].ap||I[i].bp)&&p.spin<=0&&!p.fl){const c=Math.cos(p.ang),n=Math.sin(p.ang),t=p.item;p.item=0;p.ic='';
   if(t===1){const tg=p.pos>0?ord[p.pos-1]:null;s.it.push({t:1,x:p.x+c*1.6,y:p.y+n*1.6,h:p.h,a:p.ang,o:i,tg:tg&&!tg.fin?tg.i:-1,l:4.5});fx(s,'zap');}
   else if(t===2){s.it.push({t:2,x:p.x-c*2.4,y:p.y-n*2.4,h:p.h,o:i,l:30,arm:.8});fx(s,'tick');}
   else if(t===3){p.bo=2.2;fx(s,'zap');}
   else if(t===4){p.sh=6;fx(s,'win');}
   else{s.storm=3.5;fx(s,'boom');for(const q of s.p)if(q!==p&&!q.fin&&q.sh<=0)q.zap=3.5;}}});
 for(const m of s.it){m.l-=dt;
  if(m.t===1){const tg=m.tg>=0?s.p[m.tg]:null;if(tg&&!tg.fin&&!tg.fl){m.a+=clamp(angd(m.a,Math.atan2(tg.y-m.y,tg.x-m.x)),-4*dt,4*dt);m.h+=(tg.h-m.h)*Math.min(1,4*dt);}m.x+=Math.cos(m.a)*46*dt;m.y+=Math.sin(m.a)*46*dt;}else m.arm-=dt;
  for(const q of s.p)if(m.l>0&&(q.i!==m.o||(m.t===2&&m.arm<=0))&&!q.fin&&!q.fl&&Math.hypot(q.x-m.x,q.y-m.y)<1.7&&Math.abs(q.h-m.h)<2.5){if(!itHit(s,q))fx(s,'hit');m.l=0;}}
 s.it=s.it.filter(m=>m.l>0);
 for(const a of s.p)if(a.sh>0&&!a.fin)for(const b of s.p)if(b!==a&&Math.hypot(a.x-b.x,a.y-b.y)<2&&Math.abs(a.h-b.h)<2)itHit(s,b);}
function itBot(s,p){if(!p.item||p.roll>0||Math.random()>.04)return false;if(p.item===1&&p.pos===0)return Math.random()<.1;return true;}
function itDraw(s,g,K){
 K.bx.forEach((b,k)=>{if(s.bx[k])return;const h=b.h+.6+Math.sin(s.t*3+k)*.15;g.box('ib'+k,b.x,b.y,h,1.15,1.15,1.15,hsl(Math.round((s.t*90+k*40)/30)*30,90,60)+'~',s.t*2+k);g.box('ic'+k,b.x,b.y,h+.28,.6,.6,.6,'#ffffff*',-s.t*2);});
 s.it.forEach((m,k)=>{const c=Math.cos(m.a||0),n=Math.sin(m.a||0);
  if(m.t===1){g.box('ms'+k,m.x,m.y,m.h+.6,1.6,.45,.45,'#ff3b3b',m.a);g.sph('mn'+k,m.x+c*.9,m.y+n*.9,m.h+.82,.28,'#ffffff');g.sph('mf'+k,m.x-c*1.1,m.y-n*1.1,m.h+.82,.4,'#ff9a1f*');}
  else{g.box('tn'+k,m.x,m.y,m.h,1.2,1.2,1.2,'#d91e1e');g.box('tw'+k,m.x,m.y,m.h+.45,1.27,1.27,.3,'#ffffff');g.label('TNT',m.x,m.y,m.h+1.9,'#ffe13b');}});
 s.p.forEach((p,i)=>{if(p.fin)return;
  if(p.sh>0){g.sph('sh_'+i,p.x,p.y,p.h+.8,1.7,'#ffe13b~');for(let q=0;q<3;q++){const a=s.t*5+q*2.1;g.sph('so'+i+q,p.x+Math.cos(a)*1.8,p.y+Math.sin(a)*1.8,p.h+1,.22,'#fff3a0*');}}
  if(p.bo>0)g.sph('bf'+i,p.x-Math.cos(p.ang)*1.4,p.y-Math.sin(p.ang)*1.4,p.h+.45,.45+(Math.floor(s.t*30)%3)*.08,'#ff9a1f*');
  if(p.zap>0){g.sph('zc'+i,p.x,p.y,p.h+5.5,1.3,'#555577');if(Math.floor(s.t*16)%2)g.box('zb'+i,p.x,p.y,p.h+1.6,.18,.18,3.6,'#ffe13b*');}});}
const karAng=p=>p.ang+(p.spin>0?p.spin*14:0),blink=(s,p)=>p.inv>0&&Math.floor(s.t*12)%2;

// ===== kart engine: floating tracks with hills, edges you can fall off, checkpoints =====
function trk(K,i){i=((i%K.n)+K.n)%K.n;return[K.pts[i*2],K.pts[i*2+1]];}
function trkH(K,i){return K.hs[((i%K.n)+K.n)%K.n];}
function mkTrack(K,f,hf,n,w,laps){K.pts=[];K.hs=[];K.n=n;K.w=w;K.laps=laps;K.bp=[];for(let i=0;i<n;i++){const t=i/n*TAU,q=f(t);K.pts.push(q[0],q[1]);K.hs.push(hf(t));}
 for(const q of[.1,.35,.6,.85]){const i=Math.floor(q*n);K.bp.push(i,i+1,i+2);}
 const B=[];for(const q of[.05,.22,.47,.72,.93]){const i=Math.floor(q*n),[x,y]=trk(K,i),[x2,y2]=trk(K,i+1),a=Math.atan2(y2-y,x2-x);for(const m of[-1,0,1])B.push({x:x-Math.sin(a)*m*w*.28,y:y+Math.cos(a)*m*w*.28,h:K.hs[i]});}return B;}
function kart(p,n,dt,o){const spin=p.spin>0;if(spin)p.spin-=dt;if(p.zap>0)p.zap-=dt;if(p.inv>0)p.inv-=dt;
 const gas=spin?0:n.y<-.2?1:n.y>.2?-.6:0,mx=o.max*(p.bo>0?1.45:1)*(p.zap>0?.55:1)*(p.sh>0?1.12:1)*(p.bot?p.bs:1);
 p.sp+=gas*o.acc*dt;p.sp*=Math.exp(-(gas?.25:1.5)*dt);p.sp=clamp(p.sp,-mx*.4,mx);
 if(!spin)p.ang+=n.x*o.turn*dt*clamp(p.sp/7,-1,1);p.va+=angd(p.va,p.ang)*Math.min(1,o.grip*dt);
 p.x+=Math.cos(p.va)*p.sp*dt;p.y+=Math.sin(p.va)*p.sp*dt;if(p.bo>0)p.bo-=dt;}
function kartInit(s,K,B){const [x,y]=trk(K,0),[x2,y2]=trk(K,1),a=Math.atan2(y2-y,x2-x);
 s.p.forEach((p,i)=>{const row=Math.floor(i/2),col=i%2?1:-1;p.x=x-Math.cos(a)*(2.5+row*2.8)-Math.sin(a)*col*1.7;p.y=y-Math.sin(a)*(2.5+row*2.8)+Math.cos(a)*col*1.7;
  p.ang=p.va=a;p.sp=0;p.seg=0;p.lap=0;p.pr=0;p.h=trkH(K,0);p.bs=rnd(.86,.96);});itInit(s,K,B);}
function kartStep(s,I,dt,K,o){itStep(s,I,dt,K,p=>p.fin?1e7-p.fin:p.lap*K.n+p.seg);
 s.p.forEach((p,i)=>{if(p.fin)return;
  if(p.fl){p.vh-=30*dt;p.h+=p.vh*dt;p.sp*=.98;p.x+=Math.cos(p.va)*p.sp*dt;p.y+=Math.sin(p.va)*p.sp*dt;
   if(p.h<trkH(K,p.seg)-9){const cp=Math.floor(p.seg/6)*6,[x,y]=trk(K,cp),[x2,y2]=trk(K,cp+1);p.x=x;p.y=y;p.h=trkH(K,cp);p.ang=p.va=Math.atan2(y2-y,x2-x);p.sp=0;p.fl=0;p.vh=0;p.inv=1.5;p.seg=cp;p.nf=(p.nf||0)+1;}return;}
  let bd=1e9,bi=p.seg;for(let k=-4;k<=10;k++){const [x,y]=trk(K,p.seg+k),d=Math.hypot(x-p.x,y-p.y);if(d<bd){bd=d;bi=((p.seg+k)%K.n+K.n)%K.n;}}
  if(bd>K.w/2+.7){p.fl=1;p.vh=0;fx(s,'bad');return;}
  if(bi<p.seg-K.n/2)p.lap++;else if(bi>p.seg+K.n/2)p.lap--;p.seg=bi;
  if(K.bp.includes(bi)&&p.bo<.9&&p.spin<=0){p.bo=1.3;fx(s,'zap');}
  kart(p,I[i],dt,o);p.h+=(trkH(K,bi)-p.h)*Math.min(1,12*dt);
  p.pr=clamp((p.lap+p.seg/K.n)/K.laps,0,1);p.d=PL4[p.pos]+' · LAP '+clamp(p.lap+1,1,K.laps)+'/'+K.laps;
  if(p.lap>=K.laps){p.fin=s.t;p.d='FINISH';fx(s,'win');}});
 for(let i=0;i<s.p.length;i++)for(let j=i+1;j<s.p.length;j++){const a=s.p[i],b=s.p[j];if(a.fin||b.fin||a.fl||b.fl||Math.abs(a.h-b.h)>1.5)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d<1.6&&d>0){const o2=(1.6-d)/2;a.x-=dx/d*o2;a.y-=dy/d*o2;b.x+=dx/d*o2;b.y+=dy/d*o2;a.sp*=.97;b.sp*=.97;}}}
function kartBot(s,i,K){const p=s.p[i],[x,y]=trk(K,p.seg+7),[x2,y2]=trk(K,p.seg+8),a=Math.atan2(y2-y,x2-x),off=(i-1.5)*.8,d=angd(p.ang,Math.atan2(y+Math.cos(a)*off-p.y,x-Math.sin(a)*off-p.x));
 const [x3,y3]=trk(K,p.seg+18),[x4,y4]=trk(K,p.seg+19),bend=Math.abs(angd(p.ang,Math.atan2(y4-y3,x4-x3)));
 return{x:clamp(d*2.5,-1,1),y:Math.abs(d)>.6||(bend>.9&&p.sp>19)?0:-1,bp:itBot(s,p)};}
function kartDraw(s,g,me,K,o){g.sky(s.storm>0?'#14142a':o.sky);g.floor(o.f1,o.f2,460,-14);const hw=K.w/2+.2;
 for(let i=0;i<K.n;i++){const [x,y]=trk(K,i),[x2,y2]=trk(K,i+1),h1=trkH(K,i),h2=trkH(K,i+1),a=Math.atan2(y2-y,x2-x),L0=Math.hypot(x2-x,y2-y),L=L0+.3,pt=Math.atan2(h2-h1,L0),nx=-Math.sin(a),ny=Math.cos(a),mx=(x+x2)/2,my=(y+y2)/2,mh=(h1+h2)/2;
  g.box('t'+i,mx,my,mh-.5+(i%2)*.012,L,K.w,.5,K.bp.includes(i)?'#ffe13b*':i<2?'#ffffff':(i%2?o.r1:o.r2),a,pt);
  if(i%2===0){const c1=i%4?'#ff3b6b':'#ffffff',c2=i%4?'#2ec5ff':'#ffffff';g.box('cl'+i,mx+nx*hw,my+ny*hw,mh-.1,L,.45,.45,c1,a,pt);g.box('cr'+i,mx-nx*hw,my-ny*hw,mh-.1,L,.45,.45,c2,a,pt);}
  if(i%20===10){g.cyl('pp'+i,x,y,-14,.7,h1+13.4,o.pil);g.cyl('pq'+i,x,y,h1-1.1,1.6,.5,o.pil);}
  if(i%16===8){const c=hsl(i*9)+'*';g.cyl('py'+i,x+nx*(hw+.2),y+ny*(hw+.2),h1,.14,3.6,'#2b2140');g.sph('pb'+i,x+nx*(hw+.2),y+ny*(hw+.2),h1+3.8,.5,c);g.cyl('pz'+i,x-nx*(hw+.2),y-ny*(hw+.2),h1,.14,3.6,'#2b2140');g.sph('pc'+i,x-nx*(hw+.2),y-ny*(hw+.2),h1+3.8,.5,c);}
  if(i%60===0){const c=i?'#2ec5ff*':'#ff3b9a*';g.cyl('ga'+i,x+nx*hw,y+ny*hw,h1,.25,5.2,'#ffffff');g.cyl('gb'+i,x-nx*hw,y-ny*hw,h1,.25,5.2,'#ffffff');g.box('gc'+i,x,y,h1+4.6,.5,K.w+.6,i?.5:1.1,c,a);}}
 itDraw(s,g,K);
 s.p.forEach((p,i)=>{if(blink(s,p))return;const hh=trkH(K,p.seg+1)-trkH(K,p.seg),[x,y]=trk(K,p.seg),[x2,y2]=trk(K,p.seg+1);g.kart(i,p.x,p.y,p.h,karAng(p),{hover:o.hover,pt:p.fl?-.5:Math.atan2(hh,Math.hypot(x2-x,y2-y))});});
 const p=s.p[me],c=Math.cos(p.ang),n=Math.sin(p.ang);g.cam(p.x-c*8,p.y-n*8,p.h+4.6,p.x+c*5,p.y+n*5,p.h+1,.14);}
const KCTL='Gas: W/↑ · Steer: A/D · Brake: S · Use item: Space';
const KT={update(s,I,dt,K){kartStep(s,I,dt,K,this.o);},bot(s,i,K){return kartBot(s,i,K);},draw(s,g,me,K){kartDraw(s,g,me,K,this.o);}};

// 21
TP.add(Object.assign({id:'kart1',name:'Turbo Kart Cup',dim:3,time:150,kind:'race',desc:'3 laps of a floating circuit with hills. Grab item boxes, hit the yellow turbo strips, and do not drive off the edge!',ctl:KCTL,
 o:{max:27,acc:22,turn:2.3,grip:9,sky:'#1b1147',f1:'#0f5a6a',f2:'#127080',r1:'#3a3550',r2:'#454060',pil:'#6a5acd'},
 init(s,K){kartInit(s,K,mkTrack(K,t=>[-100*Math.sin(t),48*Math.cos(t)-8*Math.cos(3*t)],t=>3+3*Math.sin(2*t+1),410,8.5,3));}},KT));
// 22
TP.add(Object.assign({id:'kart2',name:'Neon Drift GP',dim:3,time:120,kind:'race',desc:'A twisty three-leaf sky circuit. Brake into the bends or you fall and restart from the checkpoint. 2 laps!',ctl:KCTL,
 o:{max:26,acc:22,turn:2.5,grip:8,sky:'#3a0a4d',f1:'#5a1a7a',f2:'#6a2390',r1:'#20203a',r2:'#2a2a4a',pil:'#ff3b9a'},
 init(s,K){kartInit(s,K,mkTrack(K,t=>{const r=58+12*Math.cos(3*t);return[r*Math.cos(t)*1.35,r*Math.sin(t)];},t=>3.5+3.5*Math.sin(3*t),440,8,2));}},KT));
// 23
TP.add(Object.assign({id:'hover',name:'Hover Canyon',dim:3,time:120,kind:'race',desc:'Slippery hovercrafts on a giant figure-8 with a bridge over the middle. Slide wide and you drop off! 2 laps.',ctl:KCTL,
 o:{max:28,acc:20,turn:2.4,grip:3.6,hover:1,sky:'#0a2a4d',f1:'#c2702b',f2:'#d1803a',r1:'#3b4a6a',r2:'#465778',pil:'#2ec5ff'},
 init(s,K){kartInit(s,K,mkTrack(K,t=>[78*Math.sin(t),40*Math.sin(2*t)],t=>3.6+3.6*Math.cos(t),400,10,2));}},KT));

// 24
TP.add({id:'road',name:'Rocket Road',dim:3,time:90,kind:'race',desc:'Full speed down the sky highway! Dodge traffic, grab item boxes and yellow boost pads. Drive off the side and you drop back.',ctl:'Steer: A/D · Use item: Space',
 init(s,K){K.ob=[];K.len=1500;const B=[];for(let d=110;d<K.len-60;d+=140)for(const x of[-4,0,4])B.push({x,y:-d,h:0});
  for(let d=40;d<K.len-30;d+=rnd(9,15)){const m=((d-110)%140+140)%140;if(m>9&&m<131)K.ob.push({d,x:rint(-2,2)*2.6,b:Math.random()<.2?1:0});}
  s.p.forEach((p,i)=>{p.x=(i-1.5)*2.6;p.ds=0;p.sp=14;p.pr=0;p.ang=-Math.PI/2;});itInit(s,K,B);},
 update(s,I,dt,K){itStep(s,I,dt,K,p=>p.fin?1e7-p.fin:p.ds);
  s.p.forEach((p,i)=>{if(p.fin)return;
   if(p.fl){p.vh-=30*dt;p.h+=p.vh*dt;if(p.h<-9){p.fl=0;p.h=0;p.vh=0;p.x=0;p.ds=Math.max(0,p.ds-10);p.sp=8;p.inv=1.5;}p.y=-p.ds;return;}
   const spin=p.spin>0;if(spin)p.spin-=dt;if(p.zap>0)p.zap-=dt;if(p.inv>0)p.inv-=dt;if(p.bo>0)p.bo-=dt;
   const mx=(p.bo>0?42:29)*(p.zap>0?.55:1)*(p.sh>0?1.12:1)*(p.bot?.93:1);if(!spin)p.sp+=12*dt;if(p.sp>mx)p.sp=mx;
   const st=spin?0:I[i].x;p.x+=st*11*dt;if(Math.abs(p.x)>7.4){p.fl=1;p.vh=0;fx(s,'bad');return;}
   const d0=p.ds;p.ds+=p.sp*dt;
   for(const o of K.ob)if(o.d>d0-1&&o.d<=p.ds+1&&Math.abs(o.x-p.x)<1.9){if(o.b){if(p.bo<=0)fx(s,'zap');p.bo=Math.max(p.bo,1.5);}else if(p.sh<=0&&p.inv<=0&&!spin){p.sp=6;p.spin=.8;fx(s,'hit');}}
   p.pr=p.ds/K.len;p.y=-p.ds;p.ang=-Math.PI/2+st*.3;p.d=PL4[p.pos]+' · '+Math.round(p.pr*100)+'%';if(p.ds>=K.len){p.fin=s.t;p.d='FINISH';fx(s,'win');}});},
 bot(s,i,K){const p=s.p[i];let tx=p.x;for(const o of K.ob){const dd=o.d-p.ds;if(dd<2||dd>26)continue;if(o.b){if(Math.abs(o.x-p.x)<4)tx=o.x;}else if(Math.abs(o.x-p.x)<2.3){tx=o.x+(p.x>=o.x?1:-1)*3;if(Math.abs(tx)>5.6)tx=o.x-Math.sign(tx)*3;break;}}
  if(Math.abs(p.x)>5.8)tx=0;return{x:clamp((tx-p.x)*1.5,-1,1),y:0,bp:itBot(s,p)};},
 draw(s,g,me,K){const p=s.p[me],q=Math.floor(p.ds/8)*8;g.sky(s.storm>0?'#14142a':'#2a0e63');g.floor('#12303a','#16404c',460,-14,0,-Math.round(p.ds/4)*4);
  g.box('rd',0,-p.ds-70,-.6,15.4,240,.6,'#2a2a3a');g.box('re',-7.6,-p.ds-70,-.1,.4,240,.3,'#ff3b9a*');g.box('rf',7.6,-p.ds-70,-.1,.4,240,.3,'#2ec5ff*');
  for(let k=-2;k<24;k++){const y=-(q+k*8);for(const x of[-3.9,-1.3,1.3,3.9])g.box('ln'+k+x,x,y,.01,.15,3,.03,'#ffffff*');if(k%3===0){g.cyl('pl'+k,-7.6,y,0,.14,3.6,'#2b2140');g.sph('pm'+k,-7.6,y,3.8,.5,hsl((q+k*8)*3)+'*');g.cyl('pr'+k,7.6,y,0,.14,3.6,'#2b2140');g.sph('ps'+k,7.6,y,3.8,.5,hsl((q+k*8)*3+180)+'*');}
   if(k%6===0)g.cyl('pp'+k,0,y,-14,.9,13.4,'#3a2a7a');}
  K.ob.forEach((o,k)=>{const dd=o.d-p.ds;if(dd<-12||dd>160)return;if(o.b)g.box('ob'+k,o.x,-o.d,.01,2.2,3,.06,'#ffe13b*');else{g.box('ob'+k,o.x,-o.d,.25,1.9,3.2,.8,hsl(k*67));g.box('oc'+k,o.x,-o.d+.2,1.05,1.6,1.6,.6,'#cfe8ff');}});
  g.box('fin',0,-K.len,.01,15,2,.07,'#ffffff*');g.box('fin2',0,-K.len,5,16,.6,1.2,'#ff3b9a*');itDraw(s,g,K);
  s.p.forEach((a,i)=>{if(!blink(s,a))g.kart(i,a.x,-a.ds,a.h,karAng(a),{pt:a.fl?-.5:0});});g.cam(p.x*.6,-p.ds+9,4.8,p.x*.6,-p.ds-9,1,.2);}});

// 25
TP.add({id:'derby',name:'Demolition Derby',dim:3,time:60,kind:'surv',desc:'Ram the other karts at full speed! The fast one deals the damage. Last engine running wins.',ctl:'Gas: W/↑ · Steer: A/D · Reverse: S',o:{max:17,acc:20,turn:2.7,grip:6},
 init(s){s.p.forEach((p,i)=>{const a=i/4*TAU+.4;p.x=Math.cos(a)*8;p.y=Math.sin(a)*8;p.ang=p.va=a+Math.PI;p.sp=0;p.hp=100;p.im=0;p.bo=0;p.off=0;p.bs=.95;});},
 update(s,I,dt){s.p.forEach((p,i)=>{if(!p.alive)return;p.im-=dt;kart(p,I[i],dt,this.o);const r=Math.hypot(p.x,p.y);if(r>12.2){const nx=p.x/r,ny=p.y/r,vx=Math.cos(p.va),vy=Math.sin(p.va),dn=vx*nx+vy*ny;p.x=nx*12.2;p.y=ny*12.2;if(dn*Math.sign(p.sp||1)>0){p.va=p.ang=Math.atan2(vy-2*dn*ny,vx-2*dn*nx);p.sp*=.6;}}});
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=s.p[i],b=s.p[j];if(!a.alive||!b.alive)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=1.8||d===0)continue;const nx=dx/d,ny=dy/d;
   const ca=(Math.cos(a.va)*nx+Math.sin(a.va)*ny)*a.sp,cb=-(Math.cos(b.va)*nx+Math.sin(b.va)*ny)*b.sp;
   if(a.im<=0&&b.im<=0&&ca+cb>5){b.hp-=Math.max(0,ca)*2.2;a.hp-=Math.max(0,cb)*2.2;a.im=b.im=.5;fx(s,'hit');}
   const o=(1.8-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;if(ca>0)a.sp*=-.35;if(cb>0)b.sp*=-.35;}
  s.p.forEach(p=>{p.d=Math.max(0,Math.ceil(p.hp))+' HP';if(p.alive&&p.hp<=0){kill(s,p);fx(s,'boom');}});},
 fin(s){s.p.forEach(p=>{if(p.alive)p.score=1e6+p.hp;});},
 bot(s,i){const p=s.p[i],t=nearest(p,s.p,o=>o!==p&&o.alive);if(!t)return Z;return{x:clamp(angd(p.ang,Math.atan2(t.y-p.y,t.x-p.x))*2,-1,1),y:-1};},
 draw(s,g){sc3(g,'#2b0a1a','#3a1020','#4a1428');g.cyl('ar',0,0,-1,13.2,1,'#5a4a3a');g.ring('wl',0,0,.3,13.3,'#ff3b6b*');g.ring('wl2',0,0,.9,13.3,'#ffe13b*');
  s.p.forEach((p,i)=>{if(p.alive){g.kart(i,p.x,p.y,0,p.ang);g.box('hb'+i,p.x,p.y,2.9,2*Math.max(.02,p.hp/100),.12,.18,p.hp>40?'#52e36b*':'#ff3b3b*');}});g.cam(0,17,18,0,1,0);}});

// ===== ball sports (soccer + hockey) =====
function ballReset(s){s.b={x:0,y:0,vx:0,vy:0};const c=[0,0];s.p.forEach(p=>{const k=c[p.team]++;p.x=(p.team?1:-1)*(k?9:5);p.y=k?(p.team?-3:3):0;p.vx=p.vy=0;p.ang=p.team?Math.PI:0;p.cd=0;});}
function ballStep(s,I,dt,o){if(s.w>0){s.w-=dt;if(s.w<=0)s.msg='';return;}const b=s.b;
 s.p.forEach((p,i)=>{move(p,I[i],dt,o.max,o.fr);bound(p,-13.4,-8.4,13.4,8.4);p.cd-=dt;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||.01,nx=dx/d,ny=dy/d;
  if(d<1.15){b.x=p.x+nx*1.15;b.y=p.y+ny*1.15;const pv=p.vx*nx+p.vy*ny,bv=b.vx*nx+b.vy*ny;if(bv<pv+2){b.vx+=nx*(pv+2-bv);b.vy+=ny*(pv+2-bv);}}
  if(I[i].ap&&p.cd<=0&&d<1.9){p.cd=.4;b.vx=nx*o.kick;b.vy=ny*o.kick;fx(s,'hit');}});
 bump(s.p,.6,.5);b.x+=b.vx*dt;b.y+=b.vy*dt;const f=Math.exp(-o.bfr*dt);b.vx*=f;b.vy*=f;
 if(Math.abs(b.y)>8){b.y=Math.sign(b.y)*8;b.vy*=-.8;}
 if(Math.abs(b.x)>13){if(Math.abs(b.y)<2.6){const t=b.x>0?0:1;s.ts[t]++;fx(s,'win');s.w=1.6;s.msg=TNAME[t]+' GOAL!';ballReset(s);}else{b.x=Math.sign(b.x)*13;b.vx*=-.8;}}}
function ballBot(s,i){const p=s.p[i],b=s.b,gx=p.team?-13:13,mate=s.p.find(q=>q.team===p.team&&q!==p);
 const dm=Math.hypot(b.x-p.x,b.y-p.y),dq=mate?Math.hypot(b.x-mate.x,b.y-mate.y):1e9;
 if(dm<dq||(dm===dq&&(!mate||i<mate.i))){const ax=gx-b.x,ay=-b.y,al=Math.hypot(ax,ay)||1,behind=((b.x-p.x)*ax+(b.y-p.y)*ay)/al>.3;
  const k=behind?seek(p,b.x,b.y):seek(p,b.x-ax/al*1.3,b.y-ay/al*1.3+(Math.abs(b.y-p.y)<.8?(p.y>=b.y?1.6:-1.6):0));k.ap=behind&&dm<1.8&&Math.random()<.2;return k;}
 return seek(p,(b.x-gx*.75)/2,b.y*.5,.5);}
function ballDraw(s,g,o){g.sky(o.sky);g.floor(o.f1,o.f2,260,-.3);g.box('fld',0,0,-.2,27.4,17.4,.15,o.fc);
 g.box('l0',0,0,-.04,.15,17,.03,'#ffffff*');g.box('l1',0,-8.5,-.04,27,.15,.03,'#ffffff*');g.box('l2',0,8.5,-.04,27,.15,.03,'#ffffff*');g.box('l3',-13.5,0,-.04,.15,17,.03,'#ffffff*');g.box('l4',13.5,0,-.04,.15,17,.03,'#ffffff*');g.ring('l5',0,0,0,2.5,'#ffffff*');
 for(const t of[0,1]){const x=(t?-1:1)*14.2,c=TCOL[1-t];g.box('gl'+t,x,0,0,1.3,5.2,2.2,c+'~');g.cyl('gp'+t,x-(t?-1:1)*.65,-2.6,0,.15,2.2,c);g.cyl('gq'+t,x-(t?-1:1)*.65,2.6,0,.15,2.2,c);}
 if(o.puck)g.cyl('ball',s.b.x,s.b.y,0,.5,.28,'#16161d');else{g.sph('ball',s.b.x,s.b.y,.5,.5,'#ffffff');g.cyl('bsh',s.b.x,s.b.y,.01,.4,.02,'#000000~');}
 chars3(g,s);g.cam(0,16.5,16,0,.8,0);}
// 26
TP.add({id:'soccer',name:'Tobz Soccer',dim:3,time:60,kind:'score',teams:true,desc:'2 vs 2! Random teams. Run into the ball to dribble, kick it into their goal.',ctl:'Move: WASD · Kick: Space',o:{max:8,fr:8,kick:17,bfr:.8,sky:'#0a2a4d',f1:'#14532d',f2:'#166534',fc:'#22a04a'},
 init(s){s.ts=[0,0];s.w=1;s.msg='';ballReset(s);},update(s,I,dt){ballStep(s,I,dt,this.o);},bot(s,i){return ballBot(s,i);},draw(s,g){ballDraw(s,g,this.o);}});
// 27
TP.add({id:'hockey',name:'Slip Hockey',dim:3,time:60,kind:'score',teams:true,desc:'2 vs 2 on ice! You slide everywhere and the puck never stops. Score goals.',ctl:'Move: WASD · Slap: Space',o:{max:10,fr:1.6,kick:20,bfr:.15,puck:1,sky:'#10204a',f1:'#1e3a5f',f2:'#274b78',fc:'#d7f0ff'},
 init(s){s.ts=[0,0];s.w=1;s.msg='';ballReset(s);},update(s,I,dt){ballStep(s,I,dt,this.o);},bot(s,i){return ballBot(s,i);},draw(s,g){ballDraw(s,g,this.o);}});

// 28
TP.add({id:'volley',name:'Volley Bounce',dim:3,time:60,kind:'score',teams:true,desc:'2 vs 2! Touch the ball to bump it over the net. Jump first to SPIKE it.',ctl:'Move: WASD · Jump / Spike: Space',
 serve(s,t){s.b={x:t?4.5:-4.5,y:0,h:8,vx:0,vy:0,vh:0};s.w=1;s.hc=0;const c=[0,0];s.p.forEach(p=>{const k=c[p.team]++;p.x=(p.team?1:-1)*(k?6.5:3);p.y=k?2:-2;p.vx=p.vy=0;p.h=0;p.vh=0;p.nx=rnd(-1.2,1.2);p.ny=rnd(-1.2,1.2);});},
 init(s){s.ts=[0,0];this.serve(s,rint(0,1));},
 update(s,I,dt){const b=s.b;s.p.forEach((p,i)=>{move(p,I[i],dt,7.5,7);if(p.team)bound(p,.7,-4.6,8.6,4.6);else bound(p,-8.6,-4.6,-.7,4.6);
   if(p.h<=0){if(I[i].a){p.vh=8;p.h=.01;}}else{p.vh-=24*dt;p.h+=p.vh*dt;if(p.h<0){p.h=0;p.vh=0;}}});
  if(s.w>0){s.w-=dt;return;}s.hc-=dt;const px=b.x;b.vh-=13*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.h+=b.vh*dt;
  if(Math.abs(b.y)>4.8){b.y=Math.sign(b.y)*4.8;b.vy*=-.8;}if(Math.abs(b.x)>8.8){b.x=Math.sign(b.x)*8.8;b.vx*=-.8;}
  if(b.h<2.3&&(px<0)!==(b.x<0)){b.x=px<0?-.3:.3;b.vx*=-.6;}
  if(s.hc<=0)for(const p of s.p){const dx=b.x-p.x,dy=b.y-p.y,dh=b.h-(p.h+.9);if(dx*dx+dy*dy+dh*dh<1.7){const sd=p.team?-1:1,sp=p.h>.4;b.vx=sd*(sp?9:rnd(3.8,6.2))+p.vx*.25;b.vy=dy*2.5+p.vy*.3+rnd(-1.5,1.5);b.vh=sp?2.5:9.5;s.hc=.3;fx(s,'hit');s.p.forEach(q=>{q.nx=rnd(-1.2,1.2);q.ny=rnd(-1.2,1.2);});break;}}
  if(b.h<=.4){const t=b.x<0?1:0;s.ts[t]++;fx(s,'coin');this.serve(s,1-t);}},
 bot(s,i){const p=s.p[i],b=s.b,sd=p.team?1:-1,mate=s.p.find(q=>q.team===p.team&&q!==p),dh=Math.max(0,b.h-1.2),t=(b.vh+Math.sqrt(b.vh*b.vh+26*dh))/13;
  const lx=clamp(b.x+b.vx*t,-8.5,8.5),ly=clamp(b.y+b.vy*t,-4.5,4.5),dm=Math.hypot(lx-p.x,ly-p.y),dq=mate?Math.hypot(lx-mate.x,ly-mate.y):1e9;
  if(lx*sd>0&&(dm<dq||(dm===dq&&(!mate||i<mate.i))))return seek(p,lx+p.nx,ly+p.ny,.15);return seek(p,sd*4.5,(!mate||i<mate.i)?-2:2,.5);},
 draw(s,g){sc3(g,'#ff9a5a','#ffd28a','#ffc56b',-.3);g.box('ct',0,0,-.2,18,10,.15,'#f2c078');g.box('c0',-4.5,0,-.04,8.8,9.6,.03,TCOL[0]+'~');g.box('c1',4.5,0,-.04,8.8,9.6,.03,TCOL[1]+'~');
  g.box('net',0,0,0,.12,10,2.3,'#ffffff~');g.cyl('n1',0,-5,0,.15,2.5,'#ffffff');g.cyl('n2',0,5,0,.15,2.5,'#ffffff');
  g.sph('ball',s.b.x,s.b.y,s.b.h,.45,'#ffe13b');g.cyl('bsh',s.b.x,s.b.y,.01,.4,.02,'#000000~');chars3(g,s);g.cam(0,13,9.5,0,-.5,1.5);}});

// 29
TP.add({id:'tiles',name:'Tile Drop',dim:3,time:60,kind:'surv',desc:'Every tile you touch crumbles away a moment later. Keep moving, jump the gaps, outlast everyone!',ctl:'Move: WASD · Jump: Space',
 init(s){s.g=Array(100).fill(0);spawn4(s,0,0,6);},
 update(s,I,dt){for(let k=0;k<100;k++)if(s.g[k]>0&&--s.g[k]===0)s.g[k]=-1;
  s.p.forEach((p,i)=>{if(!p.alive)return;move(p,I[i],dt,6.5,8);const cx=Math.floor(p.x/2+5),cy=Math.floor(p.y/2+5),k=cy*10+cx,on=cx>=0&&cx<10&&cy>=0&&cy<10&&s.g[k]!==-1;
   if(on&&p.h<=0&&!p.fl&&s.g[k]===0)s.g[k]=55;hop(s,p,I[i],dt,on);});bump(s.p,.5,.5);},
 bot(s,i){const p=s.p[i],T=(x,y)=>x<0||x>9||y<0||y>9?-1:s.g[y*10+x],cx=Math.floor(p.x/2+5),cy=Math.floor(p.y/2+5),here=T(cx,cy);
  if(p.bt!==undefined&&(T(p.bt%10,Math.floor(p.bt/10))<0||(cx===p.bt%10&&cy===Math.floor(p.bt/10))))p.bt=undefined;
  if(p.bt===undefined&&(here<0||(here>0&&here<42))){const o=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&T(cx+dx,cy+dy)===0)o.push((cy+dy)*10+cx+dx);
   if(!o.length)for(const [dx,dy] of[[2,0],[-2,0],[0,2],[0,-2]])if(T(cx+dx,cy+dy)===0)o.push((cy+dy)*10+cx+dx);if(!o.length)return{x:0,y:0,a:1};p.bt=pick(o);}
  if(p.bt===undefined)return seek(p,(cx-4.5)*2,(cy-4.5)*2,.3);const tx=(p.bt%10-4.5)*2,ty=(Math.floor(p.bt/10)-4.5)*2,k=seek(p,tx,ty);k.a=Math.hypot(tx-p.x,ty-p.y)>2.7;return k;},
 draw(s,g){sc3(g,'#1b0a3d','#ff3b6b','#ff7a3b');s.g.forEach((v,k)=>{if(v<0)return;const x=(k%10-4.5)*2,y=(Math.floor(k/10)-4.5)*2;g.box('t'+k,x,y,v>0?-.6-(55-v)*.008:-.6,1.9,1.9,.6,v>0?'#ff3b3b':((k+Math.floor(k/10))%2?'#2ec5ff':'#52e36b'));});
  chars3(g,s);g.cam(0,18,19,0,1,0);}});

// 30
TP.add({id:'hill',name:'King of the Glow',dim:3,time:40,kind:'score',desc:'Stand in the glowing zone to score. It keeps moving. Dash to shove others out!',ctl:'Move: WASD · Dash: Space',
 init(s){spawn4(s,0,0,7);s.z={x:0,y:0,tx:0,ty:0,w:5};},
 update(s,I,dt){const z=s.z;z.w-=dt;if(z.w<=0){z.w=6;z.tx=rnd(-7,7);z.ty=rnd(-5,5);fx(s,'zap');}z.x+=(z.tx-z.x)*dt*1.5;z.y+=(z.ty-z.y)*dt*1.5;
  s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;move(p,I[i],dt,7,6);if(I[i].ap&&p.cd<=0){p.cd=1.2;p.vx+=Math.cos(p.ang)*16;p.vy+=Math.sin(p.ang)*16;fx(s,'jump');}bound(p,-10,-7,10,7);if(Math.hypot(p.x-z.x,p.y-z.y)<2.6)p.score+=dt*10;});bump(s.p,.6,1.6);},
 bot(s,i){const p=s.p[i],k=seek(p,s.z.x+Math.sin(s.t*2+i*2)*1.2,s.z.y+Math.cos(s.t*2+i)*1.2,.3),t=nearest(p,s.p,o=>o!==p);k.ap=t&&Math.hypot(t.x-p.x,t.y-p.y)<1.6&&Math.random()<.06;return k;},
 draw(s,g){sc3(g,'#0a2a4d','#1b3a6d','#22477f',-.3);g.box('ar',0,0,-.2,21,15,.15,'#2b2140');g.cyl('z',s.z.x,s.z.y,0,2.6,.06,'#ffe13b~');g.ring('zr',s.z.x,s.z.y,.12+Math.sin(s.t*6)*.05,2.6,'#ffe13b*');chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 31
TP.add({id:'spin',name:'Spin Cycle',dim:3,time:60,kind:'surv',desc:'A giant bar sweeps the platform faster and faster. Jump it or get launched!',ctl:'Move: WASD · Jump: Space',
 init(s){spawn4(s,0,0,4.5);s.a=0;s.w=1.3;s.p.forEach(p=>{p.bj=rnd(.09,.16);});},
 update(s,I,dt){s.w=1.3+s.t*.08;s.a+=s.w*dt;const c=Math.cos(s.a),sn=Math.sin(s.a);
  s.p.forEach((p,i)=>{if(!p.alive)return;mvk(p,I[i],dt,6,8);let r=Math.hypot(p.x,p.y)||.01;if(r<1.2&&!p.fl){p.x*=1.2/r;p.y*=1.2/r;r=1.2;}hop(s,p,I[i],dt,r<7.2);p.im=(p.im||0)-dt;
   if(!p.fl&&p.h<.5&&Math.abs(c*p.y-sn*p.x)<.45&&r<7.4&&p.im<=0){p.vx=-p.y/r*9+p.x/r*8;p.vy=p.x/r*9+p.y/r*8;p.kn=.7;p.im=.5;fx(s,'hit');}});bump(s.p,.55,.8);},
 bot(s,i){const p=s.p[i],r=Math.hypot(p.x,p.y)||1,rem=(((Math.atan2(p.y,p.x)-s.a)%Math.PI)+Math.PI)%Math.PI,k=seek(p,p.x/r*4,p.y/r*4,.4);k.a=(rem*r-.45)/(s.w*r)<p.bj;return k;},
 draw(s,g){sc3(g,'#2a0e63','#ff3b9a','#ff7ad9');g.cyl('pl',0,0,-1,7.3,1,'#2ec5ff');g.ring('pr',0,0,0,7.3,'#ffffff*');g.cyl('hub',0,0,0,1,1.2,'#ffe13b');g.box('bar',0,0,.15,14.6,.5,.4,'#ff3b3b*',s.a);chars3(g,s);g.cam(0,14,14,0,0,0);}});

// 32
TP.add({id:'dodge',name:'Dodgeball Dash',dim:3,time:40,kind:'score',desc:'Throw balls the way you are facing. Every hit is a point!',ctl:'Move: WASD · Throw: Space',
 init(s){spawn4(s,0,0,7);s.o=[];},
 update(s,I,dt){s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;p.st=(p.st||0)-dt;if(p.st>0)move(p,Z,dt,0,3);else{move(p,I[i],dt,7,8);
    if(I[i].ap&&p.cd<=0){p.cd=.7;s.o.push({x:p.x+Math.cos(p.ang)*.8,y:p.y+Math.sin(p.ang)*.8,vx:Math.cos(p.ang)*17,vy:Math.sin(p.ang)*17,o:i,l:1.4});fx(s,'jump');}}bound(p,-10,-7,10,7);});bump(s.p,.55,.5);
  for(const b of s.o){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(Math.abs(b.x)>10.3||Math.abs(b.y)>7.3)b.l=0;
   s.p.forEach((p,i)=>{if(i!==b.o&&b.l>0&&p.st<=0&&Math.hypot(p.x-b.x,p.y-b.y)<.85){b.l=0;p.st=.9;p.vx=b.vx*.5;p.vy=b.vy*.5;s.p[b.o].score++;fx(s,'hit');}});}
  s.o=s.o.filter(b=>b.l>0);},
 bot(s,i){const p=s.p[i],t=nearest(p,s.p,o=>o!==p);if(!t)return Z;const d=Math.hypot(t.x-p.x,t.y-p.y),al=Math.abs(angd(p.ang,Math.atan2(t.y-p.y,t.x-p.x))),k=seek(p,t.x,t.y);
  if(d<4&&Math.floor(s.t*.7+i)%2){const x=k.x;k.x=-k.y;k.y=x;}k.ap=al<.3&&d<9&&Math.random()<.2;return k;},
 draw(s,g){sc3(g,'#3a0a4d','#5a1a7a','#6a2390',-.3);g.box('ar',0,0,-.2,21,15,.15,'#c2702b');g.box('w1',0,-7.6,0,21,.3,.6,'#ffe13b');g.box('w2',0,7.6,0,21,.3,.6,'#ffe13b');
  s.o.forEach((b,k)=>g.sph('b'+k,b.x,b.y,.8,.38,PCOL[b.o]+'*'));chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 33
TP.add({id:'steps',name:'Sky Steps',dim:3,time:60,kind:'race',desc:'Hop from platform to platform. Fall and you go back one. First to the flag wins!',ctl:'Move: WASD · Jump: Space',
 init(s,K){K.pl=[{x:0,y:0,w:9,d:6}];for(let k=1;k<24;k++){const q=K.pl[k-1],d=k===23?6:rnd(2.6,4.4);K.pl.push({x:clamp(q.x+rnd(-2.6,2.6),-5,5),y:q.y-q.d/2-rnd(1.5,2.8)-d/2,w:k===23?9:rnd(2.4,4.2),d});}
  s.p.forEach((p,i)=>{p.x=(i-1.5)*1.6;p.y=1.5;p.cp=0;p.pr=0;p.ang=-Math.PI/2;});},
 on(K,p){for(let k=0;k<K.pl.length;k++){const q=K.pl[k];if(Math.abs(p.x-q.x)<q.w/2+.2&&Math.abs(p.y-q.y)<q.d/2+.2)return k;}return -1;},
 update(s,I,dt,K){s.p.forEach((p,i)=>{if(p.fin)return;move(p,I[i],dt,7,9);const k=this.on(K,p);
   if(p.fl){p.vh-=30*dt;p.h+=p.vh*dt;if(p.h<-8){const q=K.pl[p.cp];p.x=q.x;p.y=q.y;p.h=0;p.vh=0;p.fl=0;p.vx=p.vy=0;fx(s,'bad');}return;}
   if(p.h<=0){if(k<0){p.fl=1;p.vh=0;return;}if(k>p.cp)p.cp=k;p.pr=p.cp/23;if(k===23){p.fin=s.t;fx(s,'win');return;}if(I[i].a){p.vh=7.5;p.h=.01;fx(s,'jump');}}
   else{p.vh-=24*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;}}});},
 bot(s,i,K){const p=s.p[i],q=K.pl[Math.min(23,p.cp+1)],k=seek(p,q.x,q.y);k.a=this.on(K,{x:p.x+k.x*.9,y:p.y+k.y*.9})<0&&this.on(K,p)>=0;return k;},
 draw(s,g,me,K){const p=s.p[me];g.sky('#1b63c9');g.floor('#3fa9ff','#63bbff',320,-12,0,Math.round(p.y/4)*4);
  K.pl.forEach((q,k)=>{g.box('p'+k,q.x,q.y,-.6,q.w,q.d,.6,k===23?'#ffe13b':hsl(k*31,80,58));g.box('q'+k,q.x,q.y,-.9,q.w+.3,q.d+.3,.3,'#ffffff');});
  const f=K.pl[23];g.cyl('fp',f.x,f.y,0,.12,4,'#ffffff');g.box('ff',f.x+.8,f.y,3,1.6,.08,1,'#ff3b6b*');
  chars3(g,s);g.cam(p.x*.6,p.y+8.5,6.5,p.x*.6,p.y-5,0,.15);}});

// 34
TP.add({id:'cannon',name:'Cannon Chaos',dim:3,time:50,kind:'surv',desc:'Cannonballs fly in from every side and blast you off the deck. Stay on!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,0,0,4);s.o=[];s.nx=1.5;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.3,1.3-s.t*.025);const sd=rint(0,3),v=9+s.t*.12,t=Math.random()<.4?pick(s.p.filter(p=>p.alive)):null,c=t?(sd%2?t.x:t.y):rnd(-7,7);
   s.o.push(sd===0?{x:-11,y:c,vx:v,vy:0}:sd===1?{x:c,y:-11,vx:0,vy:v}:sd===2?{x:11,y:c,vx:-v,vy:0}:{x:c,y:11,vx:0,vy:-v});fx(s,'boom');}
  for(const b of s.o){b.x+=b.vx*dt;b.y+=b.vy*dt;}s.o=s.o.filter(b=>Math.abs(b.x)<12&&Math.abs(b.y)<12);
  s.p.forEach((p,i)=>{if(!p.alive)return;mvk(p,I[i],dt,6.5,8);hop(s,p,I[i],dt,Math.abs(p.x)<8.3&&Math.abs(p.y)<8.3,0);
   for(const b of s.o)if(!p.fl&&!(p.kn>0)&&Math.hypot(p.x-b.x,p.y-b.y)<1.25){p.kn=.7;p.vx=b.vx*1.5;p.vy=b.vy*1.5;fx(s,'hit');}});bump(s.p,.55,.6);},
 bot(s,i){const p=s.p[i];let x=0,y=0;for(const b of s.o){const rx=p.x-b.x,ry=p.y-b.y,al=(rx*b.vx+ry*b.vy)/Math.hypot(b.vx,b.vy);if(al<0||al>9)continue;const q=b.vx?ry:rx;if(Math.abs(q)<1.8){if(b.vx)y+=Math.sign(q||1);else x+=Math.sign(q||1);}}
  if(Math.abs(p.x)>6.5)x=-Math.sign(p.x);if(Math.abs(p.y)>6.5)y=-Math.sign(p.y);return x||y?{x,y}:seek(p,0,0,3);},
 draw(s,g){sc3(g,'#0a2a4d','#1277c2','#1a8ad6');g.box('dk',0,0,-1,16.8,16.8,1,'#8a5a2b');g.box('dk2',0,0,-1.2,17.4,17.4,.9,'#ffe13b');
  for(let k=0;k<4;k++){const a=k*Math.PI/2;g.box('cn'+k,Math.cos(a)*10.5,Math.sin(a)*10.5,0,1.6,1.6,1.4,'#16161d',a);}
  s.o.forEach((b,k)=>{g.sph('b'+k,b.x,b.y,.7,.6,'#16161d');g.sph('c'+k,b.x-b.vx*.04,b.y-b.vy*.04,.7,.45,'#ff8c2b*');});chars3(g,s);g.cam(0,16,16,0,0,0);}});

// 35
const BASE=[[-8,-5.5],[8,-5.5],[-8,5.5],[8,5.5]];
TP.add({id:'heist',name:'Piggy Bank Heist',dim:3,time:40,kind:'score',desc:'Grab coins from the middle (max 3) and run them to your piggy bank. Dash into rivals to make them spill!',ctl:'Move: WASD · Dash: Space',
 init(s){s.p.forEach((p,i)=>{p.x=BASE[i][0]*.8;p.y=BASE[i][1]*.8;p.c=0;});s.c=[];s.nx=0;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0&&s.c.length<12){s.nx=.45;const a=rnd(TAU),r=rnd(2.2);s.c.push({x:Math.cos(a)*r,y:Math.sin(a)*r});}
  s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;p.st=(p.st||0)-dt;p.ds=(p.ds||0)-dt;if(p.st>0)move(p,Z,dt,0,4);else{move(p,I[i],dt,7.5-p.c*.9,8);if(I[i].ap&&p.cd<=0){p.cd=1;p.vx+=Math.cos(p.ang)*15;p.vy+=Math.sin(p.ang)*15;p.ds=.25;fx(s,'jump');}}
   bound(p,-10,-7,10,7);if(p.st<=0)s.c=s.c.filter(c=>{if(p.c<3&&Math.hypot(c.x-p.x,c.y-p.y)<.9){p.c++;fx(s,'coin');return false;}return true;});
   if(p.c&&Math.hypot(p.x-BASE[i][0],p.y-BASE[i][1])<2){p.score+=p.c;p.c=0;fx(s,'win');}});
  for(const a of s.p)if(a.ds>0)for(const b of s.p)if(b!==a&&b.st<=0&&Math.hypot(a.x-b.x,a.y-b.y)<1.3){b.st=1;for(;b.c>0;b.c--)s.c.push({x:clamp(b.x+rnd(-1.5,1.5),-9.5,9.5),y:clamp(b.y+rnd(-1.5,1.5),-6.5,6.5)});fx(s,'hit');}
  bump(s.p,.55,.8);},
 bot(s,i){const p=s.p[i],c=nearest(p,s.c);if(p.c>=2||(p.c&&!c))return seek(p,BASE[i][0],BASE[i][1]);if(!c)return seek(p,0,0,2);const k=seek(p,c.x,c.y),t=nearest(p,s.p,o=>o!==p&&o.c>0);k.ap=t&&Math.hypot(t.x-p.x,t.y-p.y)<1.8&&Math.random()<.1;return k;},
 draw(s,g){sc3(g,'#3a0a4d','#5a1a7a','#6a2390',-.3);g.box('ar',0,0,-.2,21,15,.15,'#1f7a4a');g.cyl('mid',0,0,-.04,2.6,.05,'#ffe13b~');
  BASE.forEach(([x,y],i)=>{g.cyl('bs'+i,x,y,-.04,2,.06,PCOL[i]+'~');g.sph('pg'+i,x+(x>0?1.2:-1.2),y,.6,.6,'#ff8fd0');g.sph('pn'+i,x+(x>0?.75:-.75),y,.6,.2,'#ff5fa2');});
  s.c.forEach((c,k)=>g.cyl('c'+k,c.x,c.y,.1,.3,.12,'#ffd23b'));s.p.forEach((p,i)=>{for(let k=0;k<p.c;k++)g.cyl('cc'+i+k,p.x,p.y,1.9+k*.22,.3,.12,'#ffd23b');});chars3(g,s);g.cam(0,15,15,0,0,0);}});
