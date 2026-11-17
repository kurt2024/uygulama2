'use strict';
/* EKG sinyal motoru: vektör projeksiyonlu dalga sentezi */
const LEADS = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];
const ANG = [0,60,120,-150,-30,90, 120,95,75,55,30,0];
const LI = Object.fromEntries(LEADS.map((l,i)=>[l,i]));
const D2R = Math.PI/180, TAU = Math.PI*2;
const proj = (li,f,h) => li<6 ? Math.cos((f-ANG[li])*D2R) : Math.cos((h-ANG[li])*D2R);
const sg = x => 1/(1+Math.exp(-x));
const QT = (rr,qtc=400) => qtc*Math.sqrt(rr/1000);
const jit = (x,f) => x*(1+(Math.random()*2-1)*f);
const rnd = (a,b) => a+Math.random()*(b-a);

function evc(c,x){
  if(c.k===0){const d=(x-c.c)/c.s; return d*d>30?0:c.a*Math.exp(-.5*d*d);}
  if(c.k===1){const d=(x-c.c)/(x<c.c?c.sl:c.sr); return d*d>30?0:c.a*Math.exp(-.5*d*d);}
  if(x<c.c0-6*c.e||x>c.c1+6*c.e) return 0;
  const w=sg((x-c.c0)/c.e)*sg((c.c1-x)/c.e); let u=(x-c.c0)/(c.c1-c.c0); u=u<0?0:u>1?1:u;
  return w*(c.a0+(c.a1-c.a0)*u);
}
function bounds(c){
  if(c.k===0) return [c.c-5*c.s,c.c+5*c.s];
  if(c.k===1) return [c.c-5*c.sl,c.c+5*c.sr];
  return [c.c0-6*c.e,c.c1+6*c.e];
}
function finalize(L){let lo=1e9,hi=-1e9;for(const cs of L)for(const c of cs){const[a,b]=bounds(c);if(a<lo)lo=a;if(b>hi)hi=b;}if(lo>hi){lo=0;hi=0;}return{L,lo,hi};}
const EMPTY = finalize(LEADS.map(()=>[]));

function stdQRS(o={}){
  const f=o.axis??60,h=o.hax??-15,A=o.amp??1,k=(o.qrsd??90)/90;
  return [
    {t:13*k,s:5.5*k,a:(o.septA??.17)*A,f:o.septF??(f+90),h:o.septH??100},
    {t:33*k,s:7.5*k,a:.62*A,f:f-5,h:h+35},
    {t:47*k,s:7.5*k,a:.62*A,f:f+5,h:h-35},
    {t:64*k,s:7*k,a:.2*A,f:o.termF??-120,h:o.termH??-150}
  ];
}
function wideQRS(o){
  const D=o.qrsd??160,A=o.amp??1.2,f=o.axis??0,h=o.hax??0;
  return [{t:.28*D,s:.13*D,a:.75*A,f,h},{t:.56*D,s:.15*D,a:.7*A,f:f+(o.rot??20),h:h+(o.roth??20)}];
}
function pushST(cs,shape,a,J,tc,T){
  const c1=tc-T.sl*.6;
  if(shape==='flat') cs.push({k:2,c0:J,c1:Math.max(J+20,c1+10),a0:a,a1:a,e:10});
  else if(shape==='up') cs.push({k:2,c0:J,c1:tc,a0:a,a1:0,e:7});
  else if(shape==='down') cs.push({k:2,c0:J,c1:tc,a0:a*.2,a1:a,e:10});
  else if(shape==='scoop') cs.push({k:0,c:(J+tc)/2,s:(tc-J)*.33,a});
  else if(shape==='convex'){cs.push({k:0,c:(J+tc)*.5,s:(tc-J)*.45,a:a*.7});cs.push({k:2,c0:J,c1:tc-15,a0:a*.55,a1:0,e:8});}
}
/* Ventrikül morfolojisi: QRS + ST + T + U */
function V(o={}){
  const D=o.qrsd??90, qrs=o.qrs??(o.wide?wideQRS(o):stdQRS(o));
  const ps=o.pscale??1.5, pg=o.precGain??[1,1,1,1,1,1];
  const qt=o.qt??370, T=Object.assign({a:.3,f:45,h:25,sl:55,sr:36,p:1.3},o.T||{});
  const tc=qt-2.1*T.sr, J=D+(o.jOff??4), L=[];
  for(let li=0;li<12;li++){
    const n=LEADS[li], pre=li>=6, g=pre?ps*pg[li-6]:1, cs=[];
    for(const v of qrs){const a=v.a*proj(li,v.f,v.h)*g; if(Math.abs(a)>.004) cs.push({k:0,c:v.t,s:v.s,a,q:1});}
    let sa=0;
    if(o.stLead&&n in o.stLead) sa=o.stLead[n];
    else if(o.st) sa=o.st.a*proj(li,o.st.f,o.st.h)*(pre?(o.st.p??1.1):(o.st.l??1));
    if(Math.abs(sa)>.003) pushST(cs,(o.st&&o.st.shape)||o.stShape||'flat',sa,J,tc,T);
    const ta=(o.tLead&&n in o.tLead)?o.tLead[n]:T.a*proj(li,T.f,T.h)*(pre?T.p*pg[li-6]**.3:1);
    if(Math.abs(ta)>.003) cs.push({k:1,c:tc,sl:T.sl,sr:T.sr,a:ta});
    if(o.u){const ua=o.u*(pre?[.6,1,1.1,1,.7,.5][li-6]:Math.max(.15,proj(li,60,0)*.7));cs.push({k:0,c:qt+55,s:30,a:ua});}
    if(o.j){const ja=o.j.a*proj(li,o.j.f??60,o.j.h??20)*(pre?1.3:1);if(ja>.01)cs.push({k:1,c:D+2,sl:8,sr:16,a:ja});}
    if(o.delta){const da=o.delta.a*proj(li,o.delta.f,o.delta.h)*(pre?1.3:1);cs.push({k:2,c0:-o.delta.w,c1:4,a0:0,a1:da,e:6,q:1});}
    if(o.prd){const pa=o.prd.a*proj(li,o.prd.f,o.prd.h);cs.push({k:2,c0:-o.prd.w,c1:-8,a0:pa,a1:pa,e:8});}
    if(o.extra&&o.extra[n]) for(const c of o.extra[n]) cs.push(Object.assign({},c));
    L.push(cs);
  }
  return finalize(L);
}
/* Atriyal (P) morfolojisi */
const PT={
  n:[[30,13,.085,70,90],[56,14,.085,40,-60]],
  m:[[30,14,.08,70,90],[80,17,.13,35,-75]],
  pul:[[36,12,.24,80,95],[58,13,.06,40,-60]],
  retro:[[40,16,.12,-90,-60]]
};
function P(o={}){
  const parts=PT[o.type||'n'], s=o.a??1, L=[];
  for(let li=0;li<12;li++) L.push(parts.map(([c,sd,a,f,h])=>({k:0,c,s:sd,a:a*s*proj(li,o.f??f,o.h??h)*(li>=6?.8:1)})));
  return finalize(L);
}
/* Yardımcılar */
function sinus(c,rr,pr,pm,vm,qs){c.ev.push({t:c.t,m:pm});if(vm)c.ev.push({t:c.t+pr,m:vm,v:1,qs:qs??1});c.t+=rr;}
function vbeat(c,t,m,qs){c.ev.push({t,m,v:1,qs:qs??1});}
function hn(n){n=Math.imul(n^(n>>>15),0x2c1b3c6d);n=Math.imul(n^(n>>>12),0x297a2d39);n^=n>>>15;return (n&0xffff)/32768-1;}
function fwaves(li,t,g=1){const s=t/1000;const a=[.035,.05,.045,.03,.03,.045,.1,.07,.05,.04,.03,.03][li]*g;
  return a*(Math.sin(TAU*6.3*s+li)+.7*Math.sin(TAU*7.9*s+2*li+1)+.5*Math.sin(TAU*4.7*s+.5*li))*(.6+.4*Math.sin(TAU*.37*s+li));}
function saw(li,t,F=200){const ph=((t/F)%1+1)%1;const w=ph<.78?.5-ph/.78:-.5+(ph-.78)/.22;return .26*proj(li,-90,110)*(li>=6?.7:1)*w;}
function vfw(li,t,A=1){const s=t/1000,k=li*1.37;const env=.55+.35*Math.sin(TAU*.23*s+k*.3)+.15*Math.sin(TAU*.61*s+k);
  return A*env*(.45*Math.sin(TAU*4.6*s+k)+.3*Math.sin(TAU*6.1*s+2.1*k+.5)+.25*Math.sin(TAU*3.3*s+.7*k+1.3)+.15*Math.sin(TAU*8.2*s+k*3))*(li>=6?1.1:.8);}
