'use strict';
const $=s=>document.querySelector(s);
const cv=$('#ecg'),g=cv.getContext('2d'),grid=document.createElement('canvas'),gg=grid.getContext('2d');
const isM=()=>window.matchMedia('(max-width:860px)').matches;
const S={r:null,speed:25,gain:10,layout:isM()?'12x1':'3x4',theme:'monitor',paused:false,sound:false,hi:true,lead:'II',cat:'Tümü',q:'',quiz:null,score:{ok:0,n:0}};
const TH={
  monitor:{bg:'#060a08',minor:'rgba(62,227,138,.07)',major:'rgba(62,227,138,.17)',tr:'#45f293',lab:'#9fb8aa',hi:'rgba(255,107,94,.09)',tag:'#ff8a7f',cal:'#45f293',sep:'rgba(159,184,170,.35)'},
  paper:{bg:'#fff8f4',minor:'rgba(230,120,110,.22)',major:'rgba(214,80,70,.48)',tr:'#151515',lab:'#5a2a26',hi:'rgba(255,190,60,.18)',tag:'#b3261e',cal:'#151515',sep:'rgba(90,42,38,.4)'}
};
let sim=null,now=0,lastF=performance.now(),L={},beepT=-1,cal=null,audio=null;

/* ---------- Simülasyon ---------- */
function select(id,keepScroll){
  const r=RH.find(x=>x.id===id)||RH[0];S.r=r;const inst=r.make();
  sim={ev:[],sp:[],t:now-15000,n:0,s:{},gen:inst.gen,base:inst.base||null};
  fill(now+3000);beepT=now;
  renderList();if(!S.quiz)renderInfo();updVitals();
  if(!keepScroll&&isM())closeLib();
}
function fill(until){let guard=0;while(sim.t<until&&guard++<400){const t0=sim.t;sim.gen(sim);if(sim.t<=t0)sim.t=t0+500;}
  sim.ev.sort((a,b)=>a.t-b.t);sim.sp.sort((a,b)=>a-b);}
function prune(){const lim=now-17000;let i=0;while(i<sim.ev.length&&sim.ev[i].t<lim)i++;if(i)sim.ev.splice(0,i);
  i=0;while(i<sim.sp.length&&sim.sp[i]<lim)i++;if(i)sim.sp.splice(0,i);
  if(sim.s.b)sim.s.b=sim.s.b.filter(b=>b[1]>lim);}
function sample(li,t){
  const ev=sim.ev;let lo=0,hi=ev.length;const tt=t-1100;
  while(lo<hi){const m=(lo+hi)>>1;if(ev[m].t<tt)lo=m+1;else hi=m;}
  let v=0;
  for(let i=lo;i<ev.length;i++){const e=ev[i],x=t-e.t;if(x<-300)break;if(x<e.m.lo||x>e.m.hi)continue;
    const cs=e.m.L[li],q=e.qs;for(let j=0;j<cs.length;j++){const c=cs[j],val=evc(c,x);v+=(c.q&&q!==undefined)?val*q:val;}}
  if(sim.base)v+=sim.base(li,t,sim);
  v+=.03*Math.sin(t*TAU/6800+li*.7)+.015*Math.sin(t*TAU/3100+li)+.006*hn((t/4|0)*13+li*7919);
  return v;
}
const spikeA=LEADS.map((l)=>l==='aVR'?-1.1:1.4);

/* ---------- Düzen ---------- */
const LAY={
  '3x4':{rows:[[0,3,6,9],[1,4,7,10],[2,5,8,11]],strip:true,mm:27,div:262},
  '6x2':{rows:[[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]],strip:false,mm:24,div:205},
  '12x1':{rows:LEADS.map((_,i)=>[i]),strip:false,mm:20,div:215},
  '1':{rows:null,strip:true,mm:48,div:150}
};
function layout(){
  const W=$('#cwrap').clientWidth,ly=LAY[S.layout];
  let ppm=W/ly.div;ppm=S.layout==='1'?Math.max(3,Math.min(7,ppm)):Math.max(2.6,Math.min(4.6,ppm));
  const rows=ly.rows||[[LI[S.lead]]];const rh=ly.mm*ppm,sh=(S.layout==='1'?24:27)*ppm;
  const H=Math.round(rows.length*rh+(ly.strip?sh:0)+2*ppm);
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.height=H+'px';
  grid.width=cv.width;grid.height=cv.height;
  L={W,H,ppm,rows,rh,sh,strip:ly.strip,dpr,ml:Math.round(8*ppm)};
  drawGrid();
  $('#leadpick').hidden=S.layout!=='1';
}
function drawGrid(){
  const {W,H,ppm,dpr}=L,th=TH[S.theme];
  gg.setTransform(dpr,0,0,dpr,0,0);gg.fillStyle=th.bg;gg.fillRect(0,0,W,H);
  const minor=ppm>=3;
  for(let pass=0;pass<2;pass++){
    gg.beginPath();gg.strokeStyle=pass?th.major:th.minor;gg.lineWidth=pass?1:.6;
    for(let i=0,x=0;x<=W;i++,x=i*ppm){if(pass?(i%5===0):(minor&&i%5!==0)){const px=Math.round(x)+.5;gg.moveTo(px,0);gg.lineTo(px,H);}}
    for(let i=0,y=0;y<=H;i++,y=i*ppm){if(pass?(i%5===0):(minor&&i%5!==0)){const py=Math.round(y)+.5;gg.moveTo(0,py);gg.lineTo(W,py);}}
    gg.stroke();
  }
}

/* ---------- Çizim ---------- */
function rowList(){
  const out=[];let y=L.ppm;
  for(const r of L.rows){out.push({leads:r,y0:y,h:L.rh});y+=L.rh;}
  if(L.strip)out.push({leads:[S.layout==='1'?LI[S.lead===  'II'?'V1':'II']:LI.II],y0:y,h:L.sh,strip:true});
  return out;
}
function draw(){
  const {W,H,ppm,dpr,ml}=L,th=TH[S.theme];
  g.setTransform(1,0,0,1,0,0);g.drawImage(grid,0,0);g.setTransform(dpr,0,0,dpr,0,0);
  const pps=S.speed*ppm,Wr=W-ml,P=Wr/pps*1000,k=Math.floor(now/P),xh=(now-k*P)/1000*pps,gap=Math.max(10,ppm*3);
  const gainPx=S.gain*ppm,hiOn=S.hi&&!S.quiz,tags=S.r.leads||{};
  const rows=rowList(),step=.5;
  g.font=`600 ${Math.max(10,Math.min(13,ppm*3.1))}px "IBM Plex Mono",monospace`;g.textBaseline='top';
  for(const row of rows){
    const nc=row.leads.length,cw=Wr/nc,yc=row.y0+row.h*(row.strip?.6:.58);
    // vurgular
    if(hiOn)row.leads.forEach((li,ci)=>{if(tags[LEADS[li]]){g.fillStyle=th.hi;g.fillRect(ml+ci*cw,row.y0,cw,row.h);}});
    // kalibrasyon
    g.strokeStyle=th.cal;g.lineWidth=1.4;g.beginPath();const cx=1.5*ppm,cwid=.2*pps;
    g.moveTo(cx-ppm,yc);g.lineTo(cx,yc);g.lineTo(cx,yc-gainPx);g.lineTo(cx+cwid,yc-gainPx);g.lineTo(cx+cwid,yc);g.lineTo(cx+cwid+ppm,yc);g.stroke();
    // iz
    g.strokeStyle=th.tr;g.lineWidth=S.theme==='monitor'?1.6:1.3;g.lineJoin='round';g.beginPath();
    let pen=false,col=-1,sp=0;const spk=sim.sp;
    for(let x=0;x<=Wr;x+=step){
      if(x>xh&&x<xh+gap){pen=false;continue;}
      const c=Math.min(nc-1,(x/cw)|0);if(c!==col){col=c;pen=false;}
      const t=(x<=xh?k*P:(k-1)*P)+x/pps*1000;const li=row.leads[c];
      let y=yc-sample(li,t)*gainPx;y=y<1?1:y>H-1?H-1:y;const px=ml+x;
      if(!pen){g.moveTo(px,y);pen=true;sp=t;continue;}
      // pace spike
      if(spk.length){const t0=t-step/pps*1000;for(let i=0;i<spk.length;i++){const s=spk[i];if(s>t0&&s<=t){const sy=yc-spikeA[li]*gainPx;g.lineTo(px,y);g.lineTo(px,sy);g.lineTo(px,y);}}}
      g.lineTo(px,y);
    }
    g.stroke();
    // kolon ayırıcı + etiketler
    for(let ci=0;ci<nc;ci++){const x0=ml+ci*cw,ln=LEADS[row.leads[ci]];
      if(ci>0){g.strokeStyle=th.sep;g.lineWidth=1.2;g.beginPath();g.moveTo(x0+.5,yc-ppm*2.5);g.lineTo(x0+.5,yc+ppm*2.5);g.stroke();}
      g.fillStyle=th.lab;g.fillText(row.strip?ln+' · ritim':ln,x0+5,row.y0+3);
      if(hiOn&&tags[ln]){g.fillStyle=th.tag;g.textAlign='right';g.fillText(tags[ln],x0+cw-6,row.y0+3);g.textAlign='left';}
    }
  }
  // tarama başı
  if(S.theme==='monitor'&&!S.paused){g.fillStyle='rgba(69,242,147,.18)';g.fillRect(ml+xh,0,2,H);}
  // kaliper
  if(cal){const a=Math.min(cal.x0,cal.x1),b=Math.max(cal.x0,cal.x1),c2=S.theme==='monitor'?'#ffb84d':'#1f5fd1';
    g.strokeStyle=c2;g.lineWidth=1.2;g.setLineDash([4,3]);g.beginPath();g.moveTo(a+.5,0);g.lineTo(a+.5,H);g.moveTo(b+.5,0);g.lineTo(b+.5,H);g.stroke();g.setLineDash([]);
    const ms=Math.round((b-a)/pps*1000);const txt=ms>20?`Δ ${ms} ms · ${Math.round(60000/ms)}/dk`:'Sürükleyin';
    g.font='600 12px "IBM Plex Mono",monospace';const tw=g.measureText(txt).width+12,ty=Math.max(4,Math.min(H-24,cal.y-30));const tx=Math.max(2,Math.min(W-tw-2,(a+b)/2-tw/2));
    g.fillStyle=c2;g.fillRect(tx,ty,tw,20);g.fillStyle=S.theme==='monitor'?'#1a1205':'#fff';g.fillText(txt,tx+6,ty+4);}
}

/* ---------- Döngü ---------- */
let pruneT=0;
function loop(ts){
  const dt=Math.min(100,ts-lastF);lastF=ts;
  if(!S.paused){now+=dt;fill(now+3000);if(ts-pruneT>2000){prune();pruneT=ts;}beats();}
  draw();requestAnimationFrame(loop);
}
function beats(){
  let fired=false;for(const e of sim.ev){if(!e.v)continue;if(e.t>beepT&&e.t<=now){fired=true;}if(e.t>now)break;}
  if(fired){beepT=now;const h=$('#heart');h.classList.add('on');setTimeout(()=>h.classList.remove('on'),110);if(S.sound)beep();updHR();}
}
function updHR(){
  const vs=sim.ev.filter(e=>e.v&&e.t<=now&&e.t>now-7000).map(e=>e.t);
  let txt='--';if(vs.length>=2){const n=Math.min(6,vs.length-1);const d=(vs[vs.length-1]-vs[vs.length-1-n])/n;txt=String(Math.round(60000/d));}
  $('#hr').textContent=txt;
}
setInterval(()=>{if(!S.paused)updHR();},1000);
function beep(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),gn=audio.createGain();
  o.frequency.value=880;o.type='sine';gn.gain.setValueAtTime(.0001,audio.currentTime);gn.gain.exponentialRampToValueAtTime(.12,audio.currentTime+.005);gn.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.09);
  o.connect(gn).connect(audio.destination);o.start();o.stop(audio.currentTime+.1);}catch(e){}}

/* ---------- Arayüz ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function renderCats(){
  $('#cats').innerHTML=['Tümü',...CATS].map(c=>`<button class="chip${S.cat===c?' on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
}
function matches(r){
  if(S.cat!=='Tümü'&&r.cat!==S.cat)return false;
  if(!S.q)return true;const q=S.q.toLocaleLowerCase('tr');
  return [r.name,r.desc,r.cat,...r.crit,...Object.values(r.leads||{})].join(' ').toLocaleLowerCase('tr').includes(q);
}
function renderList(){
  const parts=[];for(const c of CATS){const rs=RH.filter(r=>r.cat===c&&matches(r));if(!rs.length)continue;
    parts.push(`<div class="grp">${esc(c)} · ${rs.length}</div>`);
    for(const r of rs)parts.push(`<button class="item${S.r&&S.r.id===r.id&&!S.quiz?' on':''}" data-id="${r.id}"><span class="dot"></span>${esc(r.name)}</button>`);}
  $('#list').innerHTML=parts.join('')||'<div class="empty">Eşleşen ritim yok. Farklı bir terim deneyin.</div>';
}
function renderInfo(){
  const r=S.r,tags=Object.entries(r.leads||{});
  $('#info').innerHTML=`
  <article class="card">
    <span class="badge">${esc(r.cat)}</span>
    <h2>${esc(r.name)}</h2>
    <p class="desc">${esc(r.desc)}</p>
    <h3>Tanı kriterleri</h3>
    <ul class="crit">${r.crit.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
    <h3>Klinik yaklaşım</h3>
    <p class="clin">${esc(r.clin)}</p>
  </article>
  <aside class="card">
    <h3>Ölçümler</h3>
    <div class="meas"><div><span>Hız</span><b>${esc(r.rate)}</b></div><div><span>PR</span><b>${esc(r.pr)}</b></div><div><span>QRS</span><b>${esc(r.qrs)}</b></div><div><span>QT</span><b>${esc(r.qt)}</b></div></div>
    <h3>Derivasyon bulguları</h3>
    <div class="ltags">${tags.length?tags.map(([l,t])=>`<span class="ltag"><b>${esc(l)}</b>${esc(t)}</span>`).join(''):'<span class="ltag"><b>—</b>Belirgin lokal bulgu yok</span>'}</div>
    <p class="disc">Eğitim amaçlı sentetik çizimdir; gerçek hasta EKG’si değildir ve tanı/tedavi kararı için kullanılmamalıdır.</p>
  </aside>`;
}
function updVitals(){$('#vname').textContent=S.quiz&&!S.quiz.done?'Gizli ritim':S.r.name;}
function setSeg(){document.querySelectorAll('.seg').forEach(s=>{const k=s.dataset.k;s.querySelectorAll('button').forEach(b=>b.classList.toggle('on',String(S[k])===b.dataset.v));});
  $('#hiBtn').setAttribute('aria-pressed',S.hi);$('#sndBtn').setAttribute('aria-pressed',S.sound);
  const pb=$('#play');pb.classList.toggle('paused',S.paused);pb.innerHTML=S.paused?'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg><span>Devam</span>':'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span>Dondur</span>';
  $('#leadpick').innerHTML=LEADS.map(l=>`<button class="${S.lead===l?'on':''}" data-l="${l}">${l}</button>`).join('');}
function step(d){const list=RH.filter(matches);const pool=list.length?list:RH;let i=pool.findIndex(r=>r.id===S.r.id);i=(i+d+pool.length)%pool.length;select(pool[i].id,true);}
function openLib(){$('#lib').classList.add('open');$('#scrim').classList.add('open');}
function closeLib(){$('#lib').classList.remove('open');$('#scrim').classList.remove('open');}

/* ---------- Tanı testi ---------- */
function quizNext(){
  const pool=RH.filter(r=>r.id!==(S.r&&S.r.id));const ans=pool[(Math.random()*pool.length)|0];
  const same=RH.filter(r=>r.cat===ans.cat&&r.id!==ans.id).sort(()=>Math.random()-.5);
  const other=RH.filter(r=>r.cat!==ans.cat).sort(()=>Math.random()-.5);
  const opts=[ans,...same.slice(0,2),...other].slice(0,4).sort(()=>Math.random()-.5);
  S.quiz={ans:ans.id,opts:opts.map(o=>o.id),done:false,pick:null};select(ans.id,true);renderQuiz();updVitals();renderList();
}
function renderQuiz(){
  const q=S.quiz,r=RH.find(x=>x.id===q.ans);
  $('#info').innerHTML=`<article class="card quizcard">
   <div class="qhead"><span class="badge">Tanı testi</span><span class="score">Doğru: ${S.score.ok} / ${S.score.n}</span></div>
   <h2>Bu trasedeki ritim / bulgu nedir?</h2>
   <p class="desc">Derivasyonları inceleyin, gerekirse dondurup kaliperle ölçün. Bulgu vurgusu test sırasında kapalıdır.</p>
   <div class="opts">${q.opts.map(id=>{const o=RH.find(x=>x.id===id);let cl='';if(q.done){if(id===q.ans)cl=' ok';else if(id===q.pick)cl=' bad';}
     return `<button class="opt${cl}" data-o="${id}" ${q.done?'disabled':''}>${esc(o.name)}</button>`;}).join('')}</div>
   ${q.done?`<div class="fb">${q.pick===q.ans?'Doğru tanı.':'Doğru cevap: <b>'+esc(r.name)+'</b>.'} ${esc(r.crit[0])}; ${esc(r.crit[1]||'')}</div>`:''}
   <div class="qact">${q.done?'<button class="btn pri" id="qn">Sonraki soru</button><button class="btn" id="qd">Ayrıntıları gör</button>':''}<button class="btn" id="qx">Testten çık</button></div>
  </article>`;
}
function quizEnd(){S.quiz=null;$('#quizBtn').classList.remove('on');$('#quizBtn').textContent='Tanı testi';renderInfo();updVitals();renderList();}

/* ---------- Olaylar ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.id){if(S.quiz)quizEnd();select(t.dataset.id);return;}
  if(t.dataset.c){S.cat=t.dataset.c;renderCats();renderList();return;}
  if(t.dataset.l){S.lead=t.dataset.l;setSeg();layout();return;}
  if(t.dataset.o&&S.quiz&&!S.quiz.done){S.quiz.done=true;S.quiz.pick=t.dataset.o;S.score.n++;if(t.dataset.o===S.quiz.ans)S.score.ok++;renderQuiz();updVitals();return;}
  const seg=t.closest('.seg');if(seg){const k=seg.dataset.k,v=t.dataset.v;S[k]=(k==='speed'||k==='gain')?+v:v;setSeg();if(k==='layout'||k==='theme')layout();return;}
  switch(t.id){
    case 'play':S.paused=!S.paused;setSeg();break;
    case 'hiBtn':S.hi=!S.hi;setSeg();break;
    case 'sndBtn':S.sound=!S.sound;setSeg();if(S.sound)beep();break;
    case 'quizBtn':if(S.quiz)quizEnd();else{t.classList.add('on');t.textContent='Testi bitir';quizNext();}break;
    case 'qn':quizNext();break;
    case 'qd':{const id=S.quiz.ans;quizEnd();select(id,true);}break;
    case 'qx':quizEnd();break;
    case 'openLib':case 'libBtn2':openLib();break;
    case 'closeLib':closeLib();break;
    case 'prevBtn':if(!S.quiz)step(-1);break;
    case 'nextBtn':if(!S.quiz)step(1);break;
  }
});
$('#scrim').addEventListener('click',closeLib);
$('#q').addEventListener('input',e=>{S.q=e.target.value.trim();renderList();});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;
  if(e.code==='Space'){e.preventDefault();S.paused=!S.paused;setSeg();}
  else if(e.key==='ArrowRight'&&!S.quiz)step(1);else if(e.key==='ArrowLeft'&&!S.quiz)step(-1);
  else if(e.key==='Escape'){cal=null;closeLib();}});
// kaliper
let drag=null;
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
  if(cal&&!drag&&Math.abs(cal.x1-cal.x0)>4&&e.pointerType!=='mouse'){}
  drag={x,y,moved:false,had:!!cal};cal={x0:x,x1:x,y};});
cv.addEventListener('pointermove',e=>{if(!drag)return;const r=cv.getBoundingClientRect();const x=e.clientX-r.left;if(Math.abs(x-drag.x)>4){drag.moved=true;}cal.x1=x;cal.y=e.clientY-r.top;
  if(drag.moved&&e.pointerType!=='mouse')e.preventDefault();});
const endDrag=()=>{if(!drag)return;if(!drag.moved)cal=null;drag=null;};
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);cv.addEventListener('pointerleave',endDrag);

let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layout,120);});

/* ---------- Başlat ---------- */
renderCats();setSeg();layout();select('nsr',true);
requestAnimationFrame(t=>{lastF=t;requestAnimationFrame(loop);});
