'use strict';
// ---------- tiny immediate-mode 3D layer on top of three.js ----------
// Everything uses game coords: (x,y) on the ground, h = height. Draw calls are keyed; anything
// not drawn this frame is hidden automatically.
const g3=(()=>{
 let ren,scene,cam,objs={},used=new Set(),labels=[],camOk=false,camT=0,info={me:0},tgt;
 const GEO={},MAT={};
 function init(cv){
  ren=new THREE.WebGLRenderer({canvas:cv,antialias:true});ren.setSize(1280,720,false);
  scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(55,16/9,.1,500);tgt=new THREE.Vector3();
  scene.add(new THREE.HemisphereLight(0xffffff,0x554477,.95));const d=new THREE.DirectionalLight(0xffffff,.7);d.position.set(6,14,8);scene.add(d);
  GEO.box=new THREE.BoxGeometry(1,1,1);GEO.sph=new THREE.SphereGeometry(.5,18,12);GEO.cyl=new THREE.CylinderGeometry(.5,.5,1,20);GEO.cone=new THREE.ConeGeometry(.5,1,16);
  GEO.tor=new THREE.TorusGeometry(.5,.07,8,28);GEO.hemi=new THREE.SphereGeometry(.5,18,8,0,TAU,Math.PI/2,Math.PI/2);GEO.plane=new THREE.PlaneGeometry(1,1);}
 // color suffix: '*' = glowing (unlit), '~' = see-through
 function mat(c){let m=MAT[c];if(!m){if(c.endsWith('*'))m=new THREE.MeshBasicMaterial({color:c.slice(0,-1)});
  else if(c.endsWith('~'))m=new THREE.MeshLambertMaterial({color:c.slice(0,-1),transparent:true,opacity:.42,depthWrite:false});
  else m=new THREE.MeshLambertMaterial({color:c});MAT[c]=m;}return m;}
 function get(k,geo,c){let o=objs[k];if(!o){o=new THREE.Mesh(GEO[geo],mat(c));o.userData.c=c;scene.add(o);objs[k]=o;}else if(o.userData.c!==c){o.material=mat(c);o.userData.c=c;}o.visible=true;used.add(k);return o;}
 const adder=g=>(geo,c,x,y,z,sx,sy,sz,rx,ry,rz)=>{const m=new THREE.Mesh(GEO[geo],mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m;};
 // 3D character, facing +x, about 1.4 tall
 function build3(L){const g=new THREE.Group(),A=adder(g);
  A('sph',SKINS[L.skin][1],0,.72,0,1,1.25,1);
  for(const z of[-.22,.22])A('sph','#2b2140',.08,.1,z,.36,.2,.26);
  for(const z of[-.17,.17]){A('sph','#ffffff',.38,.92,z,.22,.28,.22);A('sph','#1a1030',.47,.92,z,.1,.14,.1);}
  const cp=CAPES[L.cape][1];
  if(cp==='rainbow')RAIN.forEach((c,k)=>A('box',c,-.52,.62,-.33+k*.132,.05,.95,.134,0,0,-.22));else if(cp)A('box',cp,-.52,.62,0,.05,.95,.8,0,0,-.22);
  switch(L.hat){
   case 1:A('sph','#e02020',0,1.2,0,.74,.5,.74);A('box','#e02020',.38,1.2,0,.5,.05,.6);break;
   case 2:A('cyl','#16161d',0,1.3,0,.95,.05,.95);A('cyl','#16161d',0,1.58,0,.58,.52,.58);A('cyl','#e02020',0,1.38,0,.6,.1,.6);break;
   case 3:A('cyl','#ffc400',0,1.38,0,.6,.2,.6);for(let k=0;k<5;k++){const a=k/5*TAU;A('cone','#ffc400',Math.cos(a)*.25,1.56,Math.sin(a)*.25,.14,.2,.14);}A('sph','#ff3b6b',.3,1.38,0,.1,.1,.1);break;
   case 4:A('cone','#ff5fa2',0,1.62,0,.5,.7,.5);A('sph','#ffe13b',0,1.98,0,.16,.16,.16);A('cyl','#2ec5ff',0,1.3,0,.52,.06,.52);break;
   case 5:A('cyl','#3a2fd0',0,1.28,0,1.05,.05,1.05);A('cone','#3a2fd0',0,1.75,0,.62,.95,.62);A('sph','#ffe13b',.2,1.55,0,.12,.12,.12);break;
   case 6:A('cyl','#8a5a2b',0,1.3,0,1.2,.05,1.2);A('cyl','#8a5a2b',0,1.46,0,.56,.32,.56);A('cyl','#3b2410',0,1.36,0,.58,.07,.58);break;
   case 7:A('sph','#2ec5ff',0,1.22,0,.72,.46,.72);A('cyl','#ffe13b',0,1.52,0,.05,.2,.05);A('box','#ff3b6b',0,1.63,0,.7,.03,.12);A('box','#52e36b',0,1.63,0,.12,.03,.7);break;}
  switch(L.glasses){
   case 1:for(const z of[-.17,.17])A('tor','#1a1030',.5,.92,z,.3,.3,.3,0,Math.PI/2);break;
   case 2:A('box','#111111',.48,.93,0,.1,.2,.78);break;
   case 3:for(const z of[-.17,.17])A('box','#ffe13b',.5,.92,z,.05,.24,.24,Math.PI/4);break;
   case 4:A('tor','#ffc400',.5,.92,.17,.32,.32,.32,0,Math.PI/2);A('box','#ffc400',.48,.7,.3,.02,.4,.02);break;
   case 5:A('box','#00e5ff*',.48,.93,0,.1,.16,.82);break;
   case 6:A('box','#ffffff',.47,.93,0,.08,.24,.8);A('box','#ff2a2a',.5,.93,-.18,.06,.17,.3);A('box','#2a5bff',.5,.93,.18,.06,.17,.3);break;
   case 7:for(const z of[-.17,.17])A('sph','#ff5fa2',.5,.92,z,.08,.26,.28);break;}
  const hemi=c=>A('hemi',c,0,.72,0,1.05,1.3,1.05);
  switch(L.dress){
   case 1:A('cyl','#ff8fd0',0,.5,0,1.5,.07,1.5);A('cyl','#ffc3e6',0,.56,0,1.3,.06,1.3);break;
   case 2:hemi('#2a5bd7');for(const z of[-.15,.15])A('sph','#ffe13b',.5,.6,z,.09,.09,.09);break;
   case 3:hemi('#16161d');A('box','#ffffff',.5,.52,0,.06,.3,.26);A('box','#e02020',.54,.68,0,.05,.1,.26);break;
   case 4:hemi('#7a3cff');A('cyl','#7a3cff',0,.3,0,1.05,.45,1.05);A('tor','#ffc400',0,.68,0,1.04,1.04,1.04,Math.PI/2);break;
   case 5:hemi('#ffffff');A('tor','#e02020',0,.55,0,1,1,1,Math.PI/2);A('tor','#e02020',0,.35,0,.82,.82,.82,Math.PI/2);break;
   case 6:A('cone','#22c55e',0,.5,0,1.5,.75,1.5);break;
   case 7:hemi('#9aa3b5');A('tor','#ffc400',0,.7,0,1.05,1.05,1.05,Math.PI/2);for(const z of[-.5,.5])A('sph','#c9d1e0',0,1,z,.3,.3,.3);break;}
  return g;}
 function buildKart(L,i,hover){const g=new THREE.Group(),A=adder(g),c=PCOL[i];
  A('box',c,0,.38,0,1.9,.34,1.05);A('box',c,.95,.34,0,.5,.24,.8);A('box','#1a1030',-.2,.58,0,.8,.14,.8);
  A('box','#1a1030',-.95,.8,0,.12,.08,1.2);for(const z of[-.45,.45])A('box','#1a1030',-.95,.66,z,.08,.3,.08);
  if(hover){A('tor','#00e5ff*',0,.12,0,1.6,1.6,1.6,Math.PI/2);A('box','#ff9a1f*',-1.05,.4,0,.2,.2,.5);}
  else for(const x of[-.62,.68])for(const z of[-.62,.62])A('cyl','#16161d',x,.24,z,.48,.24,.48,Math.PI/2);
  const ch=build3(L);ch.scale.setScalar(.72);ch.position.set(-.2,.5,0);g.add(ch);return g;}
 function grp(k,sig,make){let g=objs[k];if(!g||g.userData.c!==sig){if(g)scene.remove(g);g=make();g.userData.c=sig;scene.add(g);objs[k]=g;}g.visible=true;used.add(k);return g;}
 const api={
  sky(c){if(scene.userData.sky!==c){scene.background=new THREE.Color(c);scene.fog=new THREE.Fog(c,70,240);scene.userData.sky=c;}},
  box(k,x,y,h,sx,sy,sh,c,rot,pt){const o=get(k,'box',c);o.position.set(x,h+sh/2,y);o.scale.set(sx,sh,sy);o.rotation.y=-(rot||0);o.rotation.z=pt||0;},
  sph(k,x,y,h,r,c){const o=get(k,'sph',c);o.position.set(x,h,y);o.scale.setScalar(r*2);},
  cyl(k,x,y,h,r,sh,c){const o=get(k,'cyl',c);o.position.set(x,h+sh/2,y);o.scale.set(r*2,sh,r*2);},
  cone(k,x,y,h,r,sh,c){const o=get(k,'cone',c);o.position.set(x,h+sh/2,y);o.scale.set(r*2,sh,r*2);},
  ring(k,x,y,h,r,c,up){const o=get(k,'tor',c);o.position.set(x,h,y);o.scale.setScalar(r*2);o.rotation.x=up?0:Math.PI/2;},
  floor(c1,c2,size,h,ox,oy){const k='floor',sig=c1+c2+size;let o=objs[k];
   if(!o||o.userData.c!==sig){if(o)scene.remove(o);const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
    x.fillStyle=c1;x.fillRect(0,0,128,128);x.fillStyle=c2;x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=3;x.strokeRect(0,0,64,64);x.strokeRect(64,64,64,64);
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(size/4,size/4);
    o=new THREE.Mesh(GEO.plane,new THREE.MeshLambertMaterial({map:t}));o.rotation.x=-Math.PI/2;o.scale.set(size,size,1);o.userData.c=sig;scene.add(o);objs[k]=o;}
   o.position.set(ox||0,h||0,oy||0);o.visible=true;used.add(k);},
  cam(px,py,ph,tx,ty,th,k){const now=performance.now();if(k&&camOk){const q=1-Math.pow(1-k,clamp((now-camT)/16.7,.2,12));cam.position.lerp(new THREE.Vector3(px,ph,py),q);tgt.lerp(new THREE.Vector3(tx,th,ty),q);}else{cam.position.set(px,ph,py);tgt.set(tx,th,ty);camOk=true;}camT=now;cam.lookAt(tgt);},
  label(t,x,y,h,c,big){labels.push({t,c,big,v:new THREE.Vector3(x,h,y)});},
  chr(i,x,y,h,ang,o){o=o||{};const pl=TP.players[i];if(!pl)return;const g=grp('chr'+i,JSON.stringify(pl.look),()=>build3(pl.look));
   const sc=o.sc||1;g.position.set(x,h,y);g.rotation.set(0,-(ang||0),o.tilt||0);g.scale.setScalar(sc);
   if(!o.nosh){api.cyl('sh'+i,x,y,(o.gh||0)+.02,.45*sc,.02,'#000000~');api.ring('rg'+i,x,y,(o.gh||0)+.06,.62*sc,(o.tc||PCOL[i])+'*');}
   if(!o.nolab)labels.push({t:pl.name,c:PCOL[i],me:i===info.me,v:new THREE.Vector3(x,h+1.95*sc,y)});},
  kart(i,x,y,h,ang,o){const pl=TP.players[i];if(!pl)return;const hv=o&&o.hover;const g=grp('kart'+i,JSON.stringify(pl.look)+(hv?'h':''),()=>buildKart(pl.look,i,hv));
   g.position.set(x,h,y);g.rotation.set(0,-(ang||0),(o&&o.pt)||0);labels.push({t:pl.name,c:PCOL[i],me:i===info.me,v:new THREE.Vector3(x,h+2.3,y)});}
 };
 function begin(i){used.clear();labels.length=0;info=i||{me:0};}
 function end(){for(const k in objs)if(!used.has(k))objs[k].visible=false;ren.render(scene,cam);const out=[];
  for(const l of labels){const v=l.v.project(cam);if(v.z<1&&v.z>-1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.2)out.push({t:l.t,c:l.c,me:l.me,big:l.big,x:(v.x*.5+.5)*W,y:(1-(v.y*.5+.5))*H});}return out;}
 function clear(){for(const k in objs)scene.remove(objs[k]);objs={};camOk=false;}
 return{init,begin,end,clear,api};
})();
