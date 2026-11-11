'use strict';
// ---------- 3D mini games, part B ----------

// 36
TP.add({id:'basket',name:'Basket Blitz',dim:3,time:35,kind:'score',desc:'Your hoop slides side to side. Hold to charge, release to shoot. Green meter = perfect power!',ctl:'Aim: A/D · Hold & release: Space',
 hx(s,p,t){return p.lx+Math.sin(t*1.3)*2.2;},
 init(s){s.p.forEach((p,i)=>{p.lx=(i-1.5)*6;p.x=p.lx;p.y=5;p.pw=0;p.bt=0;p.bx=0;p.bp=0;p.ang=-Math.PI/2;p.tg=rnd(.47,.78);});},
 update(s,I,dt){s.p.forEach((p,i)=>{const n=I[i];p.x=clamp(p.x+n.x*5*dt,p.lx-2.5,p.lx+2.5);p.ok=(p.ok||0)-dt;
   if(p.bt>0){p.bt+=dt;if(p.bt>=1){if(Math.abs(p.bx-this.hx(s,p,s.t))<.8&&Math.abs(p.bp*8-5)<.7){p.score+=2;p.ok=.7;fx(s,'win');}else fx(s,'tick');p.bt=0;p.tg=rnd(.47,.78);}}
   else if(n.a)p.pw=Math.min(1,p.pw+dt*.9);else if(p.pw>0){p.bt=.01;p.bx=p.x;p.bp=p.pw;p.pw=0;fx(s,'jump');}});},
 bot(s,i){const p=s.p[i],f=this.hx(s,p,s.t+1+Math.max(0,p.tg-p.pw)/.9);return{x:clamp((f-p.x)*2,-1,1),y:0,a:p.bt<=0&&p.pw<p.tg};},
 draw(s,g){sc3(g,'#3a1a0a','#c2702b','#d1803a',-.3);g.box('fl',0,0,-.2,25,14,.15,'#e8a04a');
  s.p.forEach((p,i)=>{const h=this.hx(s,p,s.t);g.box('ln'+i,p.lx,1,-.04,5.6,13,.03,PCOL[i]+'~');g.cyl('po'+i,h,-3.9,0,.12,3.4,'#ffffff');g.box('bb'+i,h,-3.8,2.6,1.8,.1,1.3,'#ffffff');g.ring('hp'+i,h,-3,2.6,.75,p.ok>0?'#52e36b*':'#ff5a1f*');
   g.chr(i,p.x,p.y,0,p.ang);const t=p.bt;if(t>0)g.sph('bl'+i,p.bx,5-(3+p.bp*8)*t,1.5+1.1*t+5*t*(1-t),.38,'#ff8c2b');else g.sph('bl'+i,p.x+.5,p.y-.3,1.1,.38,'#ff8c2b');
   if(p.pw>0)g.box('pw'+i,p.x-1,p.y,0,.3,.3,.2+p.pw*2.4,Math.abs(p.pw-.625)<.085?'#52e36b*':'#ffe13b*');if(p.ok>0)g.label('SWISH! +2',h,-3,4,'#52e36b',1);});
  g.cam(0,17,10,0,0,1);}});

// 37
TP.add({id:'puck',name:'Puck Luck',dim:3,time:60,kind:'score',desc:'Slide your puck onto the bullseye. Stop the power bar at the right moment. 3 shots!',ctl:'Aim: A/D · Launch: Space',
 rs(s){s.rt=0;s.p.forEach((p,i)=>{p.lx=(i-1.5)*5;p.x=p.lx;p.y=6;p.ph=0;p.sp=0;p.pw=0;p.bt=rnd(.03,.14);});},
 init(s){s.r=0;s.w=0;this.rs(s);},
 update(s,I,dt){s.rt+=dt;let done=true;s.p.forEach((p,i)=>{const n=I[i];
   if(p.ph===0){done=false;p.x=clamp(p.x+n.x*2.5*dt,p.lx-1.6,p.lx+1.6);p.pw=Math.abs(((s.rt*.9+i*.37)%2)-1);if((n.ap&&s.rt>.5)||s.rt>8){p.ph=1;p.sp=6+p.pw*8;fx(s,'jump');}}
   else if(p.ph===1){done=false;p.y-=p.sp*dt;p.sp-=6*dt;if(p.sp<=0){p.ph=2;p.g=Math.max(0,Math.round((10-Math.hypot(p.x-p.lx,p.y+8)*3)*10)/10);p.score=Math.round((p.score+p.g)*10)/10;fx(s,p.g>5?'win':'tick');}}
   p.d=p.score.toFixed(1);});
  if(done){s.w+=dt;if(s.w>1.8){s.w=0;s.r++;if(s.r>=3)s.over=true;else this.rs(s);}}},
 bot(s,i){const p=s.p[i];return{x:clamp((p.lx-p.x)*3,-1,1),y:0,ap:p.ph===0&&s.rt>1&&Math.abs(p.pw-.87)<p.bt};},
 draw(s,g){sc3(g,'#10204a','#1e3a5f','#274b78',-.3);g.box('ice',0,-1,-.2,21,20,.15,'#d7f0ff');
  s.p.forEach((p,i)=>{g.box('ln'+i,p.lx,-1,-.04,4.6,19.6,.03,PCOL[i]+'~');g.cyl('t3'+i,p.lx,-8,-.03,2.4,.04,'#2ec5ff');g.cyl('t2'+i,p.lx,-8,-.02,1.5,.04,'#ffffff');g.cyl('t1'+i,p.lx,-8,-.01,.7,.04,'#ff3b3b');
   g.chr(i,p.lx-1.7,7.6,0,-Math.PI/2);g.cyl('pk'+i,p.x,p.y,0,.5,.3,PCOL[i]);
   if(p.ph===0){g.box('pb'+i,p.lx+2,6,0,.25,.25,2.6,'#16161d');g.box('pw'+i,p.lx+2,6.1,0,.3,.3,.1+p.pw*2.5,Math.abs(p.pw-.87)<.06?'#52e36b*':'#ffe13b*');}if(p.ph===2)g.label('+'+p.g,p.x,p.y,1.6,'#ffe13b',1);});
  g.cam(0,17,13,0,-2,0);}});

// 38
const CORN=[[-10,-7],[10,-7],[-10,7],[10,7]];
TP.add({id:'hoard',name:'Ball Hoarders',dim:3,time:40,kind:'score',desc:'Shove the balls into YOUR corner. Every ball that rolls in is a point.',ctl:'Move: WASD / Arrows',
 nb(){const a=rnd(TAU),r=rnd(3);return{x:Math.cos(a)*r,y:Math.sin(a)*r,vx:0,vy:0};},
 init(s){s.p.forEach((p,i)=>{p.x=CORN[i][0]*.55;p.y=CORN[i][1]*.55;});s.o=[];for(let k=0;k<9;k++)s.o.push(this.nb());},
 update(s,I,dt){s.p.forEach((p,i)=>{move(p,I[i],dt,7,8);bound(p,-10,-7,10,7);});bump(s.p,.55,.6);
  for(const b of s.o){for(const p of s.p){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||.01;if(d<1.05){const nx=dx/d,ny=dy/d;b.x=p.x+nx*1.05;b.y=p.y+ny*1.05;const rv=(p.vx-b.vx)*nx+(p.vy-b.vy)*ny;if(rv>0){b.vx+=nx*rv*1.3;b.vy+=ny*rv*1.3;}}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;const f=Math.exp(-1.5*dt);b.vx*=f;b.vy*=f;if(Math.abs(b.x)>9.6){b.x=Math.sign(b.x)*9.6;b.vx*=-.7;}if(Math.abs(b.y)>6.6){b.y=Math.sign(b.y)*6.6;b.vy*=-.7;}
   for(let i=0;i<4;i++)if(Math.hypot(b.x-CORN[i][0],b.y-CORN[i][1])<3){s.p[i].score++;fx(s,'coin');Object.assign(b,this.nb());break;}}},
 bot(s,i){const p=s.p[i],c=CORN[i],b=nearest(p,s.o);if(!b)return Z;const ax=c[0]-b.x,ay=c[1]-b.y,al=Math.hypot(ax,ay)||1;
  const behind=((b.x-p.x)*ax+(b.y-p.y)*ay)/al>.2&&Math.abs((b.x-p.x)*ay-(b.y-p.y)*ax)/al<.7;return behind?seek(p,b.x,b.y):seek(p,b.x-ax/al*1.4,b.y-ay/al*1.4);},
 draw(s,g){sc3(g,'#0a3a3a','#0f5a5a','#127070',-.3);g.box('ar',0,0,-.2,21,15,.15,'#2b2140');CORN.forEach(([x,y],i)=>g.cyl('cz'+i,x,y,-.04,3,.06,PCOL[i]+'~'));
  s.o.forEach((b,k)=>g.sph('b'+k,b.x,b.y,.5,.5,hsl(k*40,85,62)));chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 39
TP.add({id:'bugs',name:'Bug Stomp',dim:3,time:35,kind:'score',desc:'Jump and LAND on the bugs to squash them. The golden bug is fast and worth 3!',ctl:'Move: WASD · Jump: Space',
 nb(g){return{x:rnd(-9,9),y:rnd(-6,6),a:rnd(TAU),g:g?1:0};},
 init(s){spawn4(s,0,0,6);s.o=[];for(let k=0;k<7;k++)s.o.push(this.nb(k===0));},
 update(s,I,dt){for(const b of s.o){b.a+=rnd(-4,4)*dt;const v=b.g?6:3.2;b.x+=Math.cos(b.a)*v*dt;b.y+=Math.sin(b.a)*v*dt;if(Math.abs(b.x)>9.5||Math.abs(b.y)>6.5)b.a=Math.atan2(-b.y,-b.x);}
  s.p.forEach((p,i)=>{move(p,I[i],dt,7,8);bound(p,-10,-7,10,7);
   if(p.h<=0){if(I[i].a){p.vh=8;p.h=.01;fx(s,'jump');}}else{p.vh-=26*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;s.o.forEach((b,k)=>{if(Math.hypot(b.x-p.x,b.y-p.y)<1.2){p.score+=b.g?3:1;fx(s,'coin');s.o[k]=this.nb(b.g);}});}}});bump(s.p,.55,.5);},
 bot(s,i){const p=s.p[i],b=nearest(p,s.o);if(!b)return Z;const v=b.g?6:3.2,tx=b.x+Math.cos(b.a)*v*.4,ty=b.y+Math.sin(b.a)*v*.4,k=seek(p,tx,ty);k.a=Math.hypot(tx-p.x,ty-p.y)<1.5;return k;},
 draw(s,g){sc3(g,'#0a3a1a','#14532d','#166534',-.3);g.box('ar',0,0,-.2,21,15,.15,'#3fbf5f');
  s.o.forEach((b,k)=>{const c=b.g?'#ffd23b':'#a23bff';g.sph('b'+k,b.x,b.y,.3,.4,c);g.sph('e'+k,b.x+Math.cos(b.a)*.35,b.y+Math.sin(b.a)*.35,.42,.16,'#ffffff');});chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 40
TP.add({id:'belt',name:'Conveyor Chaos',dim:3,time:60,kind:'surv',desc:'Four conveyor belts drag you toward the edge and keep changing speed. Do not fall off!',ctl:'Move: WASD / Arrows',
 init(s){s.p.forEach((p,i)=>{p.x=(i-1.5)*2;p.y=(i-1.5)*3;});s.cv=[3,-3,3,-3];s.nx=4;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=3.5;const m=3+s.t*.14;s.cv=s.cv.map(()=>pick([-1,1])*rnd(m*.6,m));fx(s,'zap');}
  s.p.forEach((p,i)=>{if(!p.alive)return;move(p,I[i],dt,6.5,8);const on=Math.abs(p.x)<9&&Math.abs(p.y)<6.2;if(on&&!p.fl)p.x+=s.cv[clamp(Math.floor((p.y+6)/3),0,3)]*dt;hop(s,p,I[i],dt,on,0);if(!p.fl)p.y=clamp(p.y,-5.7,5.7);});bump(s.p,.55,.6);},
 bot(s,i){const p=s.p[i];let br=0,bv=1e9;for(let r=0;r<4;r++){const v=Math.abs(s.cv[r])+Math.abs(r*3-4.5-p.y)*.15+(s.cv[r]*p.x>0?2:0);if(v<bv){bv=v;br=r;}}return seek(p,0,br*3-4.5,.3);},
 draw(s,g){sc3(g,'#2a0e63','#ff3b6b','#ff7a3b');g.box('pl',0,0,-1,18,12,.9,'#2b2140');
  s.cv.forEach((v,r)=>{const y=r*3-4.5;g.box('bl'+r,0,y,-.1,18,2.8,.1,r%2?'#3a3550':'#454060');for(let k=0;k<6;k++){const x=((((k*3+s.t*v)%18)+18)%18)-9;g.box('ar'+r+k,x,y,0,.5,2,.04,v>0?'#52e36b*':'#ff3b9a*');}});
  chars3(g,s);g.cam(0,14,14,0,0,0);}});

// 41
TP.add({id:'rain',name:'Bomb Rain',dim:3,time:50,kind:'surv',desc:'Red circles show where bombs will land. Get out of them before the BOOM!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,0,0,4);s.o=[];s.nx=1;},
 update(s,I,dt){s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.2,.9-s.t*.017);const t=Math.random()<.45?pick(s.p.filter(p=>p.alive)):null;s.o.push({x:t?t.x:rnd(-7.5,7.5),y:t?t.y:rnd(-7.5,7.5),t:1.5,r:rnd(1.6,2.6),e:0});}
  s.p.forEach((p,i)=>{if(p.alive){move(p,I[i],dt,6.5,8);bound(p,-8,-8,8,8);}});bump(s.p,.55,.5);
  for(const b of s.o){b.t-=dt;if(b.t<=0&&!b.e){b.e=1;fx(s,'boom');for(const p of s.p)if(p.alive&&Math.hypot(p.x-b.x,p.y-b.y)<b.r)kill(s,p);}}s.o=s.o.filter(b=>b.t>-.3);},
 bot(s,i){const p=s.p[i];let x=0,y=0;for(const b of s.o){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||.01;if(d<b.r+.9&&b.t<1.1&&!b.e){if(d<.3){x+=Math.cos(i*1.7+b.r*9);y+=Math.sin(i*1.7+b.r*9);}else{x+=dx/d;y+=dy/d;}}}
  if(Math.abs(p.x)>7)x-=Math.sign(p.x)*.7;if(Math.abs(p.y)>7)y-=Math.sign(p.y)*.7;return x||y?{x,y}:seek(p,0,0,4);},
 draw(s,g){sc3(g,'#1b0a3d','#3a1020','#4a1428');g.box('pl',0,0,-1,17,17,1,'#454060');g.box('pl2',0,0,-1.2,17.6,17.6,.9,'#ff3b9a*');
  s.o.forEach((b,k)=>{if(b.e)g.sph('x'+k,b.x,b.y,.5,b.r,'#ff8c2b*');else{g.cyl('s'+k,b.x,b.y,.02,b.r*(1-b.t/1.6),.04,'#ff3b3b~');g.ring('r'+k,b.x,b.y,.06,b.r,'#ff3b3b*');g.sph('b'+k,b.x,b.y,.6+b.t*12,.6,'#16161d');}});
  chars3(g,s);g.cam(0,16,16,0,0,0);}});

// 42
TP.add({id:'crate',name:'Crate Smash',dim:3,time:35,kind:'score',desc:'Smash mystery crates! Gems are points, but some crates hide a bomb that stuns you.',ctl:'Move: WASD · Smash: Space',
 init(s,K){K.c=[];for(let r=0;r<4;r++)for(let q=0;q<6;q++)K.c.push([(q-2.5)*3,(r-1.5)*3]);s.c=K.c.map(()=>0);s.l=[];[[-3,0],[3,0],[0,-3],[0,3]].forEach((q,i)=>{s.p[i].x=q[0];s.p[i].y=q[1];});},
 update(s,I,dt,K){s.c=s.c.map(v=>v>0?v-1:0);s.l=s.l.filter(e=>(e.t-=dt)>0);
  s.p.forEach((p,i)=>{p.cd=(p.cd||0)-dt;p.st=(p.st||0)-dt;if(p.st>0){move(p,Z,dt,0,5);return;}move(p,I[i],dt,7,8);bound(p,-10,-7,10,7);
   K.c.forEach(([cx,cy],k)=>{if(s.c[k])return;const dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy)||.01;if(d<1.35){p.x=cx+dx/d*1.35;p.y=cy+dy/d*1.35;}
    if(I[i].ap&&p.cd<=0&&d<1.9){p.cd=.3;s.c[k]=rint(200,320);const r=Math.random(),v=r<.2?-1:r<.3?0:r<.85?1:3;if(v<0){p.st=1.3;fx(s,'boom');}else{p.score+=v;fx(s,v?'coin':'tick');}s.l.push({k,v,t:.9});}});});},
 bot(s,i,K){const p=s.p[i];let b=-1,bd=1e9;K.c.forEach(([x,y],k)=>{if(s.c[k])return;const d=Math.hypot(x-p.x,y-p.y);if(d<bd){bd=d;b=k;}});if(b<0)return Z;const k=seek(p,K.c[b][0],K.c[b][1]);k.ap=bd<1.8&&Math.random()<.15;return k;},
 draw(s,g,me,K){sc3(g,'#3a1a0a','#5a2a10','#6a3414',-.3);g.box('ar',0,0,-.2,21,15,.15,'#c9a06a');
  K.c.forEach(([x,y],k)=>{if(!s.c[k]){g.box('c'+k,x,y,0,1.7,1.7,1.7,'#a0652b');g.box('d'+k,x,y,.7,1.8,1.8,.25,'#ffe13b');}});
  s.l.forEach(e=>{const [x,y]=K.c[e.k];if(e.v>0)g.sph('g'+e.k,x,y,1+(.9-e.t)*2,.35*(e.v>1?1.5:1),e.v>1?'#ff3b9a*':'#2ec5ff*');if(e.v<0)g.sph('g'+e.k,x,y,.8,1.6*(1-e.t),'#ff8c2b*');g.label(e.v<0?'BOOM!':e.v?'+'+e.v:'empty',x,y,2.6,e.v<0?'#ff3b3b':'#ffe13b',1);});
  chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 43
TP.add({id:'hurdle',name:'Hurdle Hustle',dim:3,time:40,kind:'race',desc:'Mash to sprint, jump the hurdles. Clip one and you stumble!',ctl:'Sprint: MASH Space · Jump: W / ↑ / Shift',
 init(s,K){K.hd=[];for(let d=12;d<95;d+=rnd(8,13))K.hd.push(d);s.p.forEach((p,i)=>{p.ds=0;p.sp=0;p.x=0;p.y=(i-1.5)*2;p.pr=0;p.br=rnd(5.5,8);p.ang=0;});},
 update(s,I,dt,K){s.p.forEach((p,i)=>{if(p.fin)return;const n=I[i];if(n.ap)p.sp=Math.min(13,p.sp+1.5);p.sp*=Math.exp(-.9*dt);
   if(p.h<=0){if(n.y<-.5||n.b){p.vh=7;p.h=.01;fx(s,'jump');}}else{p.vh-=24*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;}}
   const d0=p.ds;p.ds+=p.sp*dt;for(const h of K.hd)if(d0<h&&p.ds>=h&&p.h<.7){p.sp=1;p.st=.5;fx(s,'hit');}p.st=(p.st||0)-dt;
   p.x=p.ds;p.pr=p.ds/100;if(p.ds>=100){p.fin=s.t;fx(s,'win');}});},
 bot(s,i,K){const p=s.p[i];let b=false;for(const h of K.hd){const d=h-p.ds;if(d>0&&d<Math.max(.8,p.sp*.2)){b=true;break;}}return{x:0,y:0,ap:Math.random()<p.br/60,b};},
 draw(s,g,me,K){const m=s.p[me];sc3(g,'#1b63c9','#1f7a4a','#23915a',-.3);g.box('tk',50,0,-.2,112,9,.15,'#c2410c');
  for(let k=0;k<4;k++){g.box('ln'+k,50,(k-1.5)*2,-.04,110,1.8,.03,k%2?'#e0582b':'#d14a1f');}
  K.hd.forEach((h,k)=>{for(let q=0;q<4;q++){g.box('h'+k+q,h,(q-1.5)*2,.55,.12,1.7,.15,'#ffffff');g.box('i'+k+q,h,(q-1.5)*2-.8,0,.1,.1,.6,'#16161d');g.box('j'+k+q,h,(q-1.5)*2+.8,0,.1,.1,.6,'#16161d');}});
  g.box('fin',100,0,-.02,.6,8,.05,'#ffffff*');g.box('fa',100,-4.3,0,.3,.3,4,'#ffe13b');g.box('fb',100,4.3,0,.3,.3,4,'#ffe13b');g.box('fc',100,0,4,.4,9,.7,'#ff3b9a*');
  chars3(g,s);g.cam(m.x+2,13,6,m.x+2,0,1,.2);}});

// 44
TP.add({id:'rings',name:'Sky Rings',dim:3,time:40,kind:'score',desc:'Fly through as many rings as you can in your own sky lane. Gold rings are worth 3!',ctl:'Fly: WASD / Arrows',
 init(s,K){K.r=[];let x=0,h=4;for(let d=30;d<620;d+=22){x=clamp(x+rnd(-3,3),-3,3);h=clamp(h+rnd(-3,3),1.5,8);K.r.push({d,x,h,g:Math.random()<.15?1:0});}s.d=0;s.p.forEach(p=>{p.x=0;p.h=4;});},
 update(s,I,dt,K){const d0=s.d;s.d+=(16+s.t*.25)*dt;s.p.forEach((p,i)=>{const n=I[i];p.x=clamp(p.x+n.x*9*dt,-4,4);p.h=clamp(p.h-n.y*8*dt,.8,9);p.ok=(p.ok||0)-dt;
   for(const r of K.r)if(r.d>d0&&r.d<=s.d&&Math.hypot(p.x-r.x,p.h-r.h)<1.45){p.score+=r.g?3:1;p.ok=.3;fx(s,'coin');}});if(s.d>640)s.over=true;},
 bot(s,i,K){const p=s.p[i],r=K.r.find(r=>r.d>s.d);if(!r)return Z;return{x:clamp((r.x+Math.sin(s.t*2+i)*1.1-p.x)*1.2,-1,1),y:clamp(-(r.h+Math.cos(s.t*2.3+i*2)*1.1-p.h)*1.2,-1,1)};},
 draw(s,g,me,K){const ox=i=>(i-1.5)*10,p=s.p[me];g.sky('#3fa9ff');g.floor('#ffffff','#d7f0ff',320,-8,0,-Math.round(s.d/4)*4);
  K.r.forEach((r,k)=>{const dd=r.d-s.d;if(dd<-1||dd>130)return;for(let i=0;i<4;i++)g.ring('r'+k+'_'+i,ox(i)+r.x,-r.d,r.h,1.5,r.g?'#ffd23b*':PCOL[i]+'*',1);});
  for(let k=0;k<8;k++){const d=Math.floor(s.d/30)*30+k*30;g.sph('cl'+k,((d*7)%41)-20,-d-10,-4+((d*3)%5),3,'#ffffff');}
  s.p.forEach((a,i)=>g.chr(i,ox(i)+a.x,-s.d,a.h-.7,-Math.PI/2,{nosh:1,tilt:.5}));g.cam(ox(me)+p.x*.6,-s.d+10,p.h*.7+3,ox(me)+p.x*.6,-s.d-10,p.h*.8+.5,.2);}});

// 45
TP.add({id:'cart',name:'Mine Cart Madness',dim:3,time:45,kind:'score',rawBot:true,desc:'Switch rails to grab gems and dodge red blocks. Jump the yellow bars! Crashing costs 3 gems.',ctl:'Switch rail: A/D taps · Jump: Space',
 init(s,K){K.it=[];for(let d=25;d<700;d+=rnd(6,10)){const r=Math.random();K.it.push(r<.5?{d,l:rint(0,2),t:0}:r<.85?{d,l:rint(0,2),t:1}:{d,l:1,t:2});}s.d=0;s.p.forEach(p=>{p.l=1;p.lx=0;p.st=0;p.ld=0;});},
 update(s,I,dt,K){const d0=s.d;s.d+=(15+s.t*.3)*dt;s.p.forEach((p,i)=>{const n=I[i],dir=n.x>.5?1:n.x<-.5?-1:0;if(dir&&dir!==p.ld)p.l=clamp(p.l+dir,0,2);p.ld=dir;p.lx+=((p.l-1)*1.5-p.lx)*Math.min(1,dt*14);p.st-=dt;
   if(p.h<=0){if(n.a){p.vh=7;p.h=.01;fx(s,'jump');}}else{p.vh-=22*dt;p.h+=p.vh*dt;if(p.h<=0){p.h=0;p.vh=0;}}
   for(const o of K.it)if(o.d>d0&&o.d<=s.d){if(o.t===0){if(o.l===p.l&&p.h<1.2){p.score++;fx(s,'coin');}}else if((o.t===2?p.h<.8:(o.l===p.l&&p.h<1.4))&&p.st<=0){p.score=Math.max(0,p.score-3);p.st=1;fx(s,'hit');}}});
  if(s.d>710)s.over=true;},
 bot(s,i,K){const p=s.p[i];let want=p.l,jump=false;for(const o of K.it){const dd=o.d-s.d;if(dd<0)continue;if(dd>11)break;if(o.t===2){if(dd<3.2)jump=true;}else if(o.t===1){if(o.l===want)want=want===1?(i%2?0:2):1;}else if(dd<8&&Math.abs(o.l-p.l)<=1)want=o.l;}
  return{x:Math.floor(s.t*20)%2?0:Math.sign(want-p.l),y:0,a:jump};},
 draw(s,g,me,K){const ox=i=>(i-1.5)*6;g.sky('#1a0f0a');g.floor('#3b2410','#4a2e14',320,-.4,0,-Math.round(s.d/4)*4);
  s.p.forEach((p,i)=>{for(let l=0;l<3;l++)g.box('rl'+i+l,ox(i)+(l-1)*1.5,-s.d-60,-.3,.5,160,.15,PCOL[i]);g.box('ct'+i,ox(i)+p.lx,-s.d,p.h+.1,1.1,1.6,.7,'#6b7280');g.chr(i,ox(i)+p.lx,-s.d,p.h+.5,-Math.PI/2,{nosh:1,sc:.8,tilt:p.st>0?.5:0});});
  K.it.forEach((o,k)=>{const dd=o.d-s.d;if(dd<-.5||dd>110)return;for(let i=0;i<4;i++){const x=ox(i)+(o.l-1)*1.5,key='i'+k+'_'+i;
    if(o.t===0)g.sph(key,x,-o.d,.8,.35,'#2ee6ff*');else if(o.t===1)g.box(key,x,-o.d,0,1.2,1.2,1.5,'#ff3b3b');else g.box(key,ox(i),-o.d,.1,4.6,.3,.5,'#ffe13b*');}});
  g.cam(ox(me),-s.d+9.5,6.5,ox(me),-s.d-9,0,.25);}});

// 46
TP.add({id:'wreck',name:'Wrecking Ball',dim:3,time:45,kind:'surv',desc:'Three giant wrecking balls swing across the bridge. Find the gaps or get smacked off!',ctl:'Move: WASD / Arrows',
 balls(t0){const o=[],t=t0+t0*t0*.008;for(let k=0;k<3;k++){const ph=t0*(1.6+t0*.012)+k*1.9+1.57,y=Math.sin(ph)*6.5;o.push({x:Math.sin(t*(.3+k*.1)+k*2.1)*8,y,vy:Math.cos(ph),h:.9+7*(1-Math.cos(Math.asin(y/7)))});}return o;},
 init(s){s.p.forEach((p,i)=>{p.x=(i-1.5)*3;p.y=0;});},
 update(s,I,dt){const B=this.balls(s.t);s.p.forEach((p,i)=>{if(!p.alive)return;mvk(p,I[i],dt,6.5,8);hop(s,p,I[i],dt,Math.abs(p.x)<9.3&&Math.abs(p.y)<2.8,0);
   for(const b of B)if(s.t>2&&!p.fl&&!(p.kn>0)&&Math.abs(b.x-p.x)<1.4&&Math.abs(b.y-p.y)<1.4&&b.h<2.3){p.kn=.7;p.vy=Math.sign(b.vy||1)*14;p.vx=(p.x-b.x)*3;fx(s,'hit');}});bump(s.p,.55,.7);},
 bot(s,i){const p=s.p[i];let x=0;const F=[.15,.3,.45].map(q=>this.balls(s.t+q));this.balls(s.t).forEach((b,k)=>{const d=p.x-b.x;if((Math.abs(b.y)<2.4||F.some(f=>Math.abs(f[k].y)<2.4))&&Math.abs(d)<2.6)x+=Math.sign(d||1)*(2.6-Math.abs(d));});if(Math.abs(p.x)>7.5)x=-Math.sign(p.x)*2;return{x:clamp(x*2,-1,1),y:clamp(-p.y,-1,1)};},
 draw(s,g){sc3(g,'#0a2a4d','#1277c2','#1a8ad6');g.box('br',0,0,-.8,18.8,5.6,.8,'#8a5a2b');g.box('br2',0,0,-1,19.2,6,.8,'#ffe13b');
  this.balls(s.t).forEach((b,k)=>{g.sph('wb'+k,b.x,b.y,b.h+.4,1.2,'#2b2140');for(let q=1;q<5;q++)g.sph('ch'+k+q,b.x,b.y*(1-q/5),b.h+.4+(8-b.h)*q/5,.18,'#9aa3b5');g.box('an'+k,b.x,0,8.2,.6,.6,.5,'#ff3b6b');});
  chars3(g,s);g.cam(0,15,11,0,0,1.5);}});

// 47
TP.add({id:'flag',name:'Flag Frenzy',dim:3,time:40,kind:'score',desc:'Hold the flag to score points every second. Tag the carrier to steal it!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,0,0,7);s.f=-1;s.fx=0;s.fy=0;s.im=0;},
 update(s,I,dt){s.im-=dt;s.p.forEach((p,i)=>{move(p,I[i],dt,i===s.f?6.6:7.2,8);bound(p,-10,-7,10,7);});bump(s.p,.55,.4);
  if(s.f<0){for(const p of s.p)if(Math.hypot(p.x-s.fx,p.y-s.fy)<1){s.f=p.i;s.im=.8;fx(s,'coin');break;}}
  else{const h=s.p[s.f];h.score+=dt*10;s.fx=h.x;s.fy=h.y;if(s.im<=0)for(const p of s.p)if(p!==h&&Math.hypot(p.x-h.x,p.y-h.y)<1.25){s.f=p.i;s.im=.9;fx(s,'hit');break;}}},
 bot(s,i){const p=s.p[i];if(s.f<0)return seek(p,s.fx,s.fy);if(s.f!==i){const h=s.p[s.f];return seek(p,h.x+h.vx*.25,h.y+h.vy*.25);}
  let x=0,y=0;for(const q of s.p)if(q!==p){const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;x+=dx/d/d;y+=dy/d/d;}x+=.8/(p.x+10.6)-.8/(10.6-p.x);y+=.8/(p.y+7.6)-.8/(7.6-p.y);return{x:x*5,y:y*5};},
 draw(s,g){sc3(g,'#3a0a4d','#5a1a7a','#6a2390',-.3);g.box('ar',0,0,-.2,21,15,.15,'#27c8a0');const hd=s.f>=0,h=hd?2:0;
  g.cyl('fp',s.fx,s.fy,h,.08,2.2,'#ffffff');g.box('ff',s.fx+.55,s.fy,h+1.4,1,.06,.7,hd?PCOL[s.f]+'*':'#ffe13b*');chars3(g,s);g.cam(0,15,15,0,0,0);}});

// 48
TP.add({id:'tramp',name:'Trampoline Titans',dim:3,time:30,kind:'score',desc:'Press right as you land to bounce higher. Miss the timing and you lose height. Highest bounce wins!',ctl:'Bounce boost: Space (once, just before landing)',
 init(s){s.p.forEach((p,i)=>{p.x=(i-1.5)*4.5;p.y=0;p.h=2;p.pw=0;p.lp=-9;p.pc=0;p.bt=rnd(.03,.2);p.ang=Math.PI/2;});},
 update(s,I,dt){s.p.forEach((p,i)=>{if(I[i].ap){p.lp=s.t;p.pc++;}p.vh-=20*dt;p.h+=p.vh*dt;p.score=Math.max(p.score,Math.round(p.h*10)/10);p.gt=(p.gt||0)-dt;
   if(p.h<=0){p.h=0;const good=s.t-p.lp<.14&&p.pc===1;p.pw=good?Math.min(20,p.pw+1):Math.max(0,p.pw-1);p.vh=7+p.pw*1.1;p.pc=0;p.g=good?1:0;p.gt=.5;fx(s,good?'jump':'tick');p.bt=rnd(.02,.22);}
   p.d=p.score.toFixed(1)+'m';});},
 bot(s,i){const p=s.p[i];return{x:0,y:0,ap:p.pc===0&&p.vh<0&&p.h/(-p.vh)<p.bt};},
 draw(s,g,me){const m=s.p[me];sc3(g,'#3fa9ff','#52e36b','#6fe04b',-.3);
  s.p.forEach((p,i)=>{g.cyl('tr'+i,p.x,0,-.25,1.7,.25,'#2b2140');g.ring('tq'+i,p.x,0,0,1.7,PCOL[i]+'*');g.chr(i,p.x,0,p.h,p.ang,{nosh:1});g.cyl('sh'+i,p.x,0,.02,.5,.02,'#000000~');
   g.box('mk'+i,p.x-2,0,0,.15,.15,p.score,PCOL[i]+'*');if(p.gt>0)g.label(p.g?'PERFECT!':'miss',p.x,0,1.2,p.g?'#52e36b':'#ff4d5e',1);});
  for(let k=1;k<=4;k++)g.box('hm'+k,0,-3,k*4,22,.1,.1,'#ffffff~');g.cam(0,17+m.h*.5,4+m.h*.55,0,0,1.5+m.h*.6,.1);}});

// 49
TP.add({id:'tower',name:'Tower Stack',dim:3,time:35,kind:'score',desc:'Drop the sliding block onto your tower. Whatever hangs over gets chopped off. Tallest tower wins!',ctl:'Drop block: Space',
 init(s){s.p.forEach((p,i)=>{p.lx=(i-1.5)*5.5;p.bl=[0,2.4];p.w=2.4;p.cx=0;p.ph=rnd(TAU);p.st=0;p.ox=0;p.bt=rnd(.1,.5);});},
 update(s,I,dt){s.p.forEach((p,i)=>{p.st-=dt;if(p.st>0)return;p.ph+=dt*(1.6+p.score*.09);const x=Math.sin(p.ph)*3;p.ox=x;
   if(I[i].ap){let d=x-p.cx;if(Math.abs(d)<.12)d=0;const nw=p.w-Math.abs(d);if(nw<.2){p.st=.8;p.bt=rnd(.05,.3);fx(s,'bad');}
    else{p.cx+=d/2;p.w=nw;p.bl.push(Math.round(p.cx*100)/100,Math.round(nw*100)/100);p.score++;fx(s,d?'coin':'win');p.st=.15;p.bt=rnd(.08,.5);}}});},
 bot(s,i){const p=s.p[i];return{x:0,y:0,ap:p.st<=0&&Math.abs(p.ox-p.cx)<p.bt};},
 draw(s,g,me){const m=s.p[me];sc3(g,'#1b1147','#2a0e63','#3a1680',-.3);
  s.p.forEach((p,i)=>{g.box('bs'+i,p.lx,0,-.3,4.5,4,.3,PCOL[i]);for(let k=0;k<p.bl.length;k+=2)g.box('b'+i+'_'+k,p.lx+p.bl[k],0,k/2*.5,p.bl[k+1],2.4,.5,hsl(k*14+i*90,80,60));
   const n=p.bl.length/2;if(p.st<=0)g.box('mv'+i,p.lx+p.ox,0,n*.5+.25,p.w,2.4,.5,'#ffffff');g.chr(i,p.lx,2.6,0,-Math.PI/2);});
  g.cam(0,17,6+m.score*.3,0,0,2+m.score*.4,.1);}});

// 50
TP.add({id:'snow',name:'Snowball Showdown',dim:3,time:30,kind:'score',desc:'Roll over fresh snow to grow your snowball. Bigger balls flatten smaller ones. Biggest wins!',ctl:'Move: WASD / Arrows',
 init(s){spawn4(s,0,0,5);s.g=Array(192).fill(1);s.p.forEach(p=>{p.r=.5;});},
 update(s,I,dt){s.p.forEach((p,i)=>{p.st=(p.st||0)-dt;move(p,p.st>0?Z:I[i],dt,7.5-p.r*1.2,7);bound(p,-7.6,-5.6,7.6,5.6);const k=Math.floor(p.y+6)*16+Math.floor(p.x+8);if(s.g[k]===1){s.g[k]=0;p.r=Math.min(2.2,p.r+.022);}p.score=Math.round(p.r*100);});
  if(Math.random()<dt*6){const k=rint(0,191);s.g[k]=1;}
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=s.p[i],b=s.p[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01,m=a.r+b.r;if(d>=m)continue;const nx=dx/d,ny=dy/d,o=(m-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
   if(Math.abs(a.r-b.r)>.08&&a.st<=0&&b.st<=0){const sm=a.r<b.r?a:b,sg=sm===a?-1:1;sm.r=Math.max(.5,sm.r*.8);sm.st=.6;sm.vx=nx*sg*10;sm.vy=ny*sg*10;fx(s,'hit');}}},
 bot(s,i){const p=s.p[i];if(p.bk===undefined||!s.g[p.bk]){let bd=1e9;p.bk=undefined;for(let n=0;n<8;n++){const k=rint(0,191);if(s.g[k]){const d=Math.hypot(k%16-7.5-p.x,Math.floor(k/16)-5.5-p.y);if(d<bd){bd=d;p.bk=k;}}}}
  return p.bk===undefined?Z:seek(p,p.bk%16-7.5,Math.floor(p.bk/16)-5.5);},
 draw(s,g){sc3(g,'#10204a','#1e3a5f','#274b78',-.3);g.box('ice',0,0,-.2,16.4,12.4,.15,'#9fd8ff');s.g.forEach((v,k)=>{if(v)g.box('s'+k,k%16-7.5,Math.floor(k/16)-5.5,-.05,.96,.96,.18,'#ffffff');});
  s.p.forEach((p,i)=>{g.sph('sb'+i,p.x,p.y,p.r,p.r,'#f4fbff');g.chr(i,p.x,p.y,p.r*2-.1,p.ang,{nosh:1,sc:.8,tilt:p.st>0?.6:0});g.ring('rg'+i,p.x,p.y,.08,p.r+.1,PCOL[i]+'*');});g.cam(0,13,13,0,0,0);}});
