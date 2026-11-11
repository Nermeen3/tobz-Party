'use strict';
// ---------- characters: 5 categories x 8 options ----------
const SKINS=[['Cherry','#ff4d6d'],['Sky','#3fa9ff'],['Sunny','#ffd43b'],['Lime','#6fe04b'],['Grape','#a45cff'],['Tangerine','#ff8c2b'],['Bubblegum','#ff7ad9'],['Mint','#3fe0c5']];
const CAPES=[['None',null],['Hero Red','#e02020'],['Royal Blue','#2040e0'],['Gold','#ffc400'],['Shadow','#222233'],['Toxic','#39ff14'],['Rose','#ff5fa2'],['Rainbow','rainbow']];
const HATS=['None','Cap','Top Hat','Crown','Party Cone','Wizard','Cowboy','Propeller'];
const GLASSES=['None','Round','Shades','Star','Monocle','Visor','3D','Hearts'];
const DRESSES=['None','Tutu','Overalls','Tuxedo','Robe','Stripes','Skirt','Armor'];
const RAIN=['#ff3b3b','#ff9a1f','#ffe01f','#3bdc4a','#2e9bff','#a04dff'];
const randLook=()=>({skin:rint(0,7),hat:rint(0,7),glasses:rint(0,7),cape:rint(0,7),dress:rint(0,7)});

function drawChar(c,L,x,y,s,dir){
 const E=(ex,ey,rx,ry)=>{c.beginPath();c.ellipse(ex,ey,rx,ry,0,0,TAU);c.fill();};
 const P=(...q)=>{c.beginPath();for(let k=0;k<q.length;k+=2)c.lineTo(q[k],q[k+1]);c.closePath();c.fill();};
 c.save();c.translate(x,y);c.scale(dir<0?-s:s,s);c.lineJoin='round';
 // cape (behind)
 const cp=CAPES[L.cape][1];
 if(cp){if(cp==='rainbow'){const g=c.createLinearGradient(-.4,-.6,-1.3,1);RAIN.forEach((col,k)=>g.addColorStop(k/5,col));c.fillStyle=g;}else c.fillStyle=cp;
  c.beginPath();c.moveTo(-.35,-.6);c.quadraticCurveTo(-1.6,-.1,-1.35,1);c.lineTo(-.2,.7);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=.06;c.stroke();}
 // feet + body
 c.fillStyle='#2b2140';E(-.32,.98,.3,.14);E(.36,.98,.3,.14);
 c.fillStyle=SKINS[L.skin][1];c.beginPath();c.ellipse(0,0,.82,1,0,0,TAU);c.fill();
 // outfit, clipped to the body
 c.save();c.clip();
 switch(L.dress){
  case 2:c.fillStyle='#2a5bd7';c.fillRect(-1,.1,2,1);c.fillRect(-.45,-.6,.15,.8);c.fillRect(.3,-.6,.15,.8);c.fillStyle='#ffe13b';E(-.37,.15,.07,.07);E(.38,.15,.07,.07);break;
  case 3:c.fillStyle='#16161d';c.fillRect(-1,0,2,1.1);c.fillStyle='#fff';P(.1,0,.75,0,.42,.65);c.fillStyle='#e02020';P(.42,.1,.25,-.02,.25,.22);P(.42,.1,.6,-.02,.6,.22);break;
  case 4:c.fillStyle='#7a3cff';c.fillRect(-1,-.05,2,1.2);c.fillStyle='#ffc400';c.fillRect(-1,.25,2,.12);star(c,-.3,.62,.13,'#ffe13b');star(c,.4,.7,.1,'#ffe13b');break;
  case 5:c.fillStyle='#fff';c.fillRect(-1,-.05,2,1.2);c.fillStyle='#e02020';for(let q=0;q<4;q++)c.fillRect(-1,-.05+q*.3,2,.15);break;
  case 7:c.fillStyle='#9aa3b5';c.fillRect(-1,-.1,2,1.2);c.fillStyle='#c9d1e0';c.fillRect(-1,-.1,2,.14);c.fillRect(-1,.45,2,.1);c.fillStyle='#5b6478';E(-.4,.25,.06,.06);E(0,.25,.06,.06);E(.4,.25,.06,.06);break;}
 c.restore();
 c.strokeStyle='rgba(20,10,40,.55)';c.lineWidth=.08;c.beginPath();c.ellipse(0,0,.82,1,0,0,TAU);c.stroke();
 c.fillStyle='rgba(255,255,255,.25)';E(-.3,-.55,.22,.14);
 if(L.dress===1){c.fillStyle='#ff8fd0';E(0,.42,1.15,.26);c.fillStyle='#ffc3e6';E(0,.36,1,.18);}
 if(L.dress===6){c.fillStyle='#22c55e';P(-.68,.25,.68,.25,1.05,.88,-1.05,.88);c.fillStyle='#15803d';c.fillRect(-.68,.22,1.36,.1);}
 // face
 c.fillStyle='#fff';E(.12,-.3,.2,.25);E(.55,-.3,.17,.23);c.fillStyle='#1a1030';E(.2,-.28,.09,.12);E(.61,-.28,.08,.11);
 c.strokeStyle='#1a1030';c.lineWidth=.06;c.beginPath();c.arc(.38,.05,.16,.15*Math.PI,.85*Math.PI);c.stroke();
 // glasses
 c.lineWidth=.07;
 switch(L.glasses){
  case 1:c.strokeStyle='#1a1030';c.beginPath();c.arc(.12,-.3,.27,0,TAU);c.stroke();c.beginPath();c.arc(.57,-.3,.24,0,TAU);c.stroke();break;
  case 2:c.fillStyle='#111';c.fillRect(-.16,-.5,1,.36);c.fillStyle='#555';c.fillRect(-.08,-.45,.3,.07);break;
  case 3:star(c,.12,-.3,.32,'#ffe13b');star(c,.57,-.3,.28,'#ffe13b');break;
  case 4:c.strokeStyle='#ffc400';c.beginPath();c.arc(.57,-.3,.27,0,TAU);c.stroke();c.beginPath();c.moveTo(.57,-.03);c.lineTo(.5,.5);c.stroke();break;
  case 5:c.fillStyle='rgba(0,229,255,.65)';c.fillRect(-.2,-.5,1.04,.36);c.fillStyle='#fff';c.fillRect(-.2,-.53,1.04,.06);break;
  case 6:c.fillStyle='#fff';c.fillRect(-.2,-.52,1.04,.42);c.fillStyle='#ff2a2a';c.fillRect(-.14,-.46,.42,.3);c.fillStyle='#2a5bff';c.fillRect(.36,-.46,.42,.3);break;
  case 7:c.fillStyle='#ff5fa2';heartPath(c,.12,-.3,.22);c.fill();heartPath(c,.57,-.3,.2);c.fill();break;}
 // hat
 switch(L.hat){
  case 1:c.fillStyle='#e02020';c.beginPath();c.arc(0,-.78,.6,Math.PI,0);c.fill();c.fillRect(.2,-.86,.8,.13);break;
  case 2:c.fillStyle='#16161d';c.fillRect(-.7,-1,1.4,.13);c.fillRect(-.45,-1.75,.9,.78);c.fillStyle='#e02020';c.fillRect(-.45,-1.2,.9,.14);break;
  case 3:c.fillStyle='#ffc400';P(-.5,-.85,-.5,-1.45,-.25,-1.15,0,-1.5,.25,-1.15,.5,-1.45,.5,-.85);c.fillStyle='#ff3b6b';E(0,-1,.09,.09);c.fillStyle='#2ec5ff';E(-.3,-1,.07,.07);E(.3,-1,.07,.07);break;
  case 4:c.fillStyle='#ff5fa2';P(-.4,-.85,0,-1.9,.4,-.85);c.fillStyle='#2ec5ff';P(-.3,-1.1,.3,-1.1,.22,-1.3,-.22,-1.3);c.fillStyle='#ffe13b';E(0,-1.9,.14,.14);break;
  case 5:c.fillStyle='#3a2fd0';E(0,-.88,.9,.14);P(-.5,-.9,.2,-2,.5,-.9);star(c,.08,-1.3,.15,'#ffe13b');break;
  case 6:c.fillStyle='#8a5a2b';E(0,-.86,1.1,.16);c.beginPath();c.ellipse(0,-.9,.5,.5,0,Math.PI,0);c.fill();c.fillStyle='#3b2410';c.fillRect(-.5,-1.02,1,.1);break;
  case 7:c.fillStyle='#2ec5ff';c.beginPath();c.arc(0,-.8,.5,Math.PI,0);c.fill();c.fillStyle='#ffe13b';c.fillRect(-.03,-1.5,.06,.22);c.fillStyle='#ff3b6b';E(-.28,-1.5,.28,.07);c.fillStyle='#52e36b';E(.28,-1.5,.28,.07);break;}
 c.restore();}
