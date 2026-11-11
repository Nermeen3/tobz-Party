'use strict';
// ---------- Tobz Party music: every mini game gets its own original tune ----------
// Songs are composed by the code from the game's name (same game = same song, on every player's machine):
// a bouncy party-band setup of drums, bass, off-beat chord stabs and a lead melody. No recordings, nothing copied.
const Music=(()=>{
 let ac=null,out=null,cur=null,on=true,want=null,nbuf=null;
 try{on=localStorage.getItem('tobzMusic')!=='0';}catch(e){}
 const SCALES=[[0,2,4,5,7,9,11],[0,2,4,5,7,9,10],[0,2,3,5,7,9,10],[0,2,4,6,7,9,11],[0,2,3,5,7,8,10]]; // major, mixolydian, dorian, lydian, minor
 const PROGS=[[0,4,5,3],[0,3,4,3],[0,5,3,4],[0,2,3,4],[5,3,0,4],[0,6,3,4],[0,3,0,4],[0,5,1,4]];
 const RH=[[0,3,6,8,11,14],[0,2,4,6,8,10,12,14],[0,4,6,8,12,14],[0,3,4,6,10,12],[2,4,6,10,12,14],[0,6,8,14],[0,2,3,6,8,10,11,14],[0,3,6,9,12,14]];
 const BASS=[[0,4,8,12],[0,3,6,8,11,14],[0,6,8,14],[0,2,8,10],[0,4,6,8,12,14],[0,3,8,11]];
 const KICK=[[0,8],[0,6,8],[0,4,8,12],[0,3,8,10],[0,8,11]];
 const STAB=[[2,6,10,14],[4,12],[3,6,11,14],[2,6,10,14],[6,14]];
 function make(id){let h=2166136261;for(let k=0;k<id.length;k++)h=Math.imul(h^id.charCodeAt(k),16777619);let a=h>>>0;
  const r=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;},pk=x=>x[Math.floor(r()*x.length)];
  const S={bpm:Math.round(112+r()*50),root:43+Math.floor(r()*9),sc:pk(SCALES),prog:pk(PROGS),bass:pk(BASS),kick:pk(KICK),stab:pk(STAB),hat:r()<.5?2:1,lead:pk(['square','sawtooth','triangle','square']),sw:r()<.35?.18:0};
  const motif=()=>{const rh=pk(RH),o=[];let d=7+pk([0,2,4]);for(let k=0;k<16;k++){if(!rh.includes(k)){o.push(null);continue;}d=Math.max(4,Math.min(11,d+pk([-2,-1,-1,0,1,1,2])));
    if(k%8===0){const m=d%7;if(m===1||m===3||m===5)d-=1;else if(m===6)d+=1;}o.push(d);}return o;};
  const A=motif(),A2=motif(),B=motif(),B2=motif();S.mel=[A,A2,A,B2,B,A2,B,B2];return S;}
 const hz=n=>440*Math.pow(2,(n-69)/12),deg=(S,d)=>S.root+S.sc[((d%7)+7)%7]+12*Math.floor(d/7);
 function tone(type,f,t,dur,vol){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.03);}
 function drum(kind,t){const g=ac.createGain();g.connect(out);
  if(kind==='k'){const o=ac.createOscillator();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);o.start(t);o.stop(t+.18);return;}
  const n=ac.createBufferSource(),f=ac.createBiquadFilter();n.buffer=nbuf;f.type='highpass';f.frequency.value=kind==='s'?1700:7000;const d=kind==='s'?.13:.035;g.gain.setValueAtTime(kind==='s'?.22:.07,t);g.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(f);f.connect(g);n.start(t);n.stop(t+d+.02);}
 function step(S,n,t){const st=n%16,bar=Math.floor(n/16)%8,ch=S.prog[bar%4],sp=60/S.bpm/4;
  if(S.kick.includes(st))drum('k',t);if(st===4||st===12)drum('s',t);if(st%S.hat===0)drum('h',t);
  if(S.bass.includes(st))tone('triangle',hz(deg(S,ch)+(st%8===6?12:0)),t,sp*1.8,.26);
  if(S.stab.includes(st))for(const q of[0,2,4])tone('square',hz(deg(S,ch+q)+12),t,sp*.9,.03);
  const m=S.mel[bar][st];if(m!==null)tone(S.lead,hz(deg(S,ch+m)+12),t,sp*1.7,S.lead==='triangle'?.13:.06);}
 function tick(){if(!cur||!ac||ac.state!=='running')return;const sp=60/cur.S.bpm/4;if(cur.next<ac.currentTime-.1)cur.next=ac.currentTime+.05;
  while(cur.next<ac.currentTime+.25){step(cur.S,cur.n,cur.next+(cur.n%2?cur.S.sw*sp:0));cur.next+=sp;cur.n++;}}
 function unlock(){try{if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();out=ac.createGain();out.gain.value=.3;const c=ac.createDynamicsCompressor();out.connect(c);c.connect(ac.destination);
    nbuf=ac.createBuffer(1,ac.sampleRate*.3,ac.sampleRate);const d=nbuf.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=Math.random()*2-1;setInterval(tick,40);}
   if(ac.state==='suspended')ac.resume();if(want&&on&&!cur)set(want);}catch(e){}}
 function set(id){want=id;if(!on||!ac){cur=null;return;}if(cur&&cur.id===id)return;cur={id,S:make(id),n:0,next:ac.currentTime+.12};}
 addEventListener('pointerdown',unlock);addEventListener('keydown',unlock);
 return{set,unlock,isOn:()=>on,make,toggle(){on=!on;try{localStorage.setItem('tobzMusic',on?'1':'0');}catch(e){}if(on)set(want);else cur=null;return on;}};
})();
