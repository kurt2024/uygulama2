'use strict';
const CATS=['Sinüs','Supraventriküler','Ventriküler','İleti blokları','İskemi / İnfarkt','Elektrolit & İlaç','Yapısal & Diğer'];
const RH=[];
function R(id,name,cat,info,make){RH.push(Object.assign({id,name,cat},info,{make}));}
const N70=857;

/* ---------- Ortak morfolojiler ---------- */
const M={
  pvcR:()=>V({wide:1,axis:95,hax:-70,qrsd:150,amp:1.35,qt:400,T:{a:.45,f:-85,h:110,sl:60,sr:45}}),
  pvcL:()=>V({wide:1,axis:-60,hax:-70,qrsd:150,amp:1.3,qt:400,T:{a:.42,f:120,h:110,sl:60,sr:45}}),
  vt:(qt=330)=>V({wide:1,axis:-80,hax:80,qrsd:170,amp:.95,qt,T:{a:.4,f:100,h:-100,sl:55,sr:42},st:{a:.1,f:100,h:-100,shape:'down'}}),
  esc:(qt=470)=>V({wide:1,axis:-30,hax:-40,qrsd:145,amp:1.1,qt,T:{a:.35,f:150,h:140,sl:60,sr:44}}),
  paced:()=>V({wide:1,axis:-70,hax:-55,qrsd:160,amp:1.1,qt:420,T:{a:.35,f:110,h:125,sl:60,sr:42}}),
  rbbb:(o={})=>V(Object.assign({qrsd:135,qrs:[...stdQRS({axis:o.axis??60,septF:o.septF,qrsd:90}),{t:100,s:15,a:.62,f:-170,h:130}],qt:QT(N70)+30,T:{a:.28,f:45,h:-30}},o)),
  lbbb:()=>V({qrsd:150,qrs:[{t:40,s:17,a:.7,f:-15,h:-35},{t:92,s:19,a:.85,f:5,h:-55}],st:{a:.2,f:175,h:130,shape:'up',p:1.2},T:{a:.32,f:175,h:130,sl:60,sr:40},qt:QT(N70)+50}),
  wpw:(w=45,a=.35,qrsd=115)=>V({qrsd,hax:20,delta:{a,f:70,h:80,w},T:{a:.2,f:220,h:-110},qt:QT(N70)+10})
};

/* ================= SİNÜS ================= */
R('nsr','Normal Sinüs Ritmi','Sinüs',{rate:'60–100/dk',pr:'120–200 ms',qrs:'80–100 ms',qt:'QTc 350–450 ms',
 desc:'Referans ritim. Her QRS’den önce DII’de pozitif, aVR’de negatif tek tip P dalgası; sabit PR ve dar QRS.',
 crit:['Düzenli R–R, hız 60–100/dk','P: DI, DII, aVF’de pozitif; aVR’de negatif','Her P’yi bir QRS izler (1:1 ileti)','Göğüs derivasyonlarında normal R progresyonu (geçiş V3–V4)'],
 clin:'Patolojik trasenin karşılaştırıldığı temel çizim. Tüm derivasyonlardaki normal polariteleri bu ritimle ezberleyin.',
 leads:{II:'P+',aVR:'P−'}},
 ()=>{const pm=P(),vm=V({qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.015),160,pm,vm);}};});

R('sbrady','Sinüs Bradikardisi','Sinüs',{rate:'< 60/dk',pr:'Normal',qrs:'Dar',qt:'Uzun RR’ye bağlı uzun QT',
 desc:'Sinüs kaynaklı, düzenli ama yavaş ritim. P–QRS ilişkisi normaldir.',
 crit:['Hız < 60/dk, düzenli','Normal P aksı ve morfolojisi','PR sabit 120–200 ms'],
 clin:'Sporcularda ve uykuda fizyolojik. Beta bloker, hipotiroidi, hipotermi, inferior MI ve artmış KİBAS’ı düşünün. Semptomatikse atropin.',
 leads:{II:'Yavaş'}},
 ()=>{const rr=1350,pm=P(),vm=V({qt:QT(rr)});return{gen(c){sinus(c,jit(rr,.015),170,pm,vm);}};});

R('stach','Sinüs Taşikardisi','Sinüs',{rate:'100–160/dk',pr:'Kısa-normal',qrs:'Dar',qt:'Kısa QT',
 desc:'Hızlı ama normal sinüs ritmi. P dalgası önceki T dalgasının hemen arkasına yaklaşır.',
 crit:['Hız > 100/dk, düzenli','Her QRS öncesi normal P','Hız yavaş artar/azalır (ani başlangıç yok)'],
 clin:'Altta yatan nedeni tedavi edin: ateş, hipovolemi, ağrı, anemi, sepsis, PE, hipertiroidi.',
 leads:{II:'P on T'}},
 ()=>{const rr=500,pm=P({a:1.15}),vm=V({qt:QT(rr)});return{gen(c){sinus(c,jit(rr,.01),130,pm,vm);}};});

R('sarr','Sinüs Aritmisi','Sinüs',{rate:'60–100/dk (değişken)',pr:'Sabit',qrs:'Dar',qt:'Normal',
 desc:'Solunumla senkron R–R değişimi: inspiryumda hızlanma, ekspiryumda yavaşlama.',
 crit:['Fazik R–R değişimi > %10','Tüm P dalgaları aynı morfolojide','PR sabit'],
 clin:'Genç ve sağlıklı bireylerde fizyolojik; vagal tonusu gösterir.',
 leads:{II:'R–R ↔'}},
 ()=>{const pm=P(),vm=V({qt:QT(N70)});return{gen(c){const rr=880+260*Math.sin(c.n*.85);c.n++;sinus(c,rr,160,pm,vm);}};});

R('sarrest','Sinüs Arresti / Duraklama','Sinüs',{rate:'Değişken',pr:'Normal',qrs:'Dar',qt:'Normal',
 desc:'Sinüs düğümü uyarı üretmeyi aniden keser; P ve QRS’siz uzun duraklama oluşur.',
 crit:['Ani P–QRS kaybı','Duraklama süresi PP aralığının katı değildir (SA bloktan farkı)','> 3 sn duraklama klinik önemlidir'],
 clin:'Hasta sinüs sendromu, ilaçlar (BB, KKB, digoksin), vagal reaksiyonlar. Semptomatik ise kalıcı pacemaker.',
 leads:{II:'Duraklama'}},
 ()=>{const pm=P(),vm=V({qt:QT(N70)});return{gen(c){if(c.n%6===5)c.t+=2300;c.n++;sinus(c,jit(N70,.01),160,pm,vm);}};});

R('pmitrale','P Mitrale (Sol Atriyal Genişleme)','Sinüs',{rate:'Normal',pr:'Normal',qrs:'Dar',qt:'Normal',
 desc:'Sol atriyum depolarizasyonu gecikir: DII’de çentikli, geniş P; V1’de derin negatif terminal bileşen.',
 crit:['DII’de P süresi > 120 ms, “M” şeklinde çift tepeli','V1’de negatif terminal kısım > 40 ms ve > 1 mm','Pikler arası > 40 ms'],
 clin:'Mitral stenoz, hipertansiyon, aort darlığı ve HKMP. AF gelişimi açısından risklidir.',
 leads:{II:'Çentikli P',V1:'Bifazik P'}},
 ()=>{const pm=P({type:'m'}),vm=V({qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.015),190,pm,vm);}};});

R('ppulm','P Pulmonale (Sağ Atriyal Genişleme)','Sinüs',{rate:'Normal',pr:'Normal',qrs:'Dar',qt:'Normal',
 desc:'Sağ atriyal yüklenme: inferior derivasyonlarda sivri ve yüksek P dalgası.',
 crit:['DII, DIII, aVF’de P amplitüdü > 2.5 mm','P süresi normal (< 120 ms)','V1’de belirgin pozitif P'],
 clin:'KOAH, pulmoner hipertansiyon, triküspit darlığı ve konjenital kalp hastalıkları.',
 leads:{II:'Sivri P',III:'Sivri P',aVF:'Sivri P',V1:'P+'}},
 ()=>{const pm=P({type:'pul'}),vm=V({axis:80,qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.015),150,pm,vm);}};});

/* ================= SUPRAVENTRİKÜLER ================= */
R('pac','Prematür Atriyal Atım (PAC)','Supraventriküler',{rate:'Altta yatan ritim',pr:'Değişken',qrs:'Dar',qt:'Normal',
 desc:'Erken gelen, farklı morfolojide P dalgası ve dar QRS. Sinüs düğümü resetlenir; kompansatuvar olmayan duraklama.',
 crit:['Erken gelen, farklı şekilli (burada inferiorda negatif) P','Dar QRS (aberran ileti yoksa)','Kompansatuvar olmayan duraklama'],
 clin:'Sıklıkla benign; kafein, stres, alkol. Sık PAC’ler AF’yi tetikleyebilir.',
 leads:{II:'Erken P′',aVF:'P′ −'}},
 ()=>{const pm=P(),pe=P({f:-50,a:.9}),vm=V({qt:QT(N70)});return{gen(c){const k=c.n%4;c.n++;
  if(k===2)sinus(c,N70*.6,160,pm,vm);else if(k===3)sinus(c,N70*1.12,140,pe,vm);else sinus(c,N70,160,pm,vm);}};});

R('af','Atriyal Fibrilasyon','Supraventriküler',{rate:'Ventrikül 100–160/dk (hızlı yanıt)',pr:'Yok',qrs:'Dar',qt:'Ölçümü zor',
 desc:'Kaotik atriyal aktivite: P dalgası yok, ince fibrilasyon (f) dalgaları ve düzensiz-düzensiz R–R.',
 crit:['Tamamen düzensiz R–R aralıkları','Belirgin P dalgası yok','İzoelektrik hat yerine f dalgaları (en iyi V1 ve DII’de)'],
 clin:'İnme riski (CHA₂DS₂-VASc) ile antikoagülasyon; hız/ritim kontrolü. Hemodinamik instabilitede senkronize kardiyoversiyon.',
 leads:{II:'f dalgası',V1:'f dalgası'}},
 ()=>{const vm=V({qt:QT(650)});return{gen(c){vbeat(c,c.t,vm);c.t+=rnd(380,940);},base:(li,t)=>fwaves(li,t)};});

R('afl21','Atriyal Flutter 2:1','Supraventriküler',{rate:'Atriyum 300, ventrikül 150/dk',pr:'—',qrs:'Dar',qt:'Kısa',
 desc:'Sağ atriyumda makro-reentry: inferior derivasyonlarda testere dişi F dalgaları. 150/dk düzenli dar QRS taşikardide mutlaka düşünülmeli.',
 crit:['F dalgaları ~300/dk, izoelektrik hat yok','DII, DIII, aVF’de negatif testere dişi; V1’de pozitif','Sabit 2:1 iletim → ventrikül hızı ~150/dk'],
 clin:'Hız kontrolü, antikoagülasyon ve kavotriküspit istmus ablasyonu (yüksek başarı).',
 leads:{II:'Testere dişi',III:'Testere dişi',aVF:'Testere dişi',V1:'F+'}},
 ()=>{const vm=V({qt:QT(400)});return{gen(c){vbeat(c,c.t,vm);c.t+=400;},base:(li,t)=>saw(li,t+60)};});

R('aflv','Atriyal Flutter (Değişken Blok)','Supraventriküler',{rate:'Ventrikül 75–150/dk',pr:'—',qrs:'Dar',qt:'Normal',
 desc:'Flutter dalgaları sabit, AV iletim oranı 2:1, 3:1 ve 4:1 arasında değişir; düzensiz ama “gruplanmış” R–R.',
 crit:['Testere dişi F dalgaları (~300/dk)','Değişen iletim oranı → düzensiz ventrikül yanıtı','Yüksek blok oranında F dalgaları çok net görülür'],
 clin:'Yüksek blok oranında F dalgaları netleşir; tanı için vagal manevra veya adenozin yardımcı olabilir.',
 leads:{II:'F dalgası',aVF:'F dalgası',V1:'F+'}},
 ()=>{const vm=V({qt:QT(700)});const b=[4,4,2,3,4,2];return{gen(c){vbeat(c,c.t,vm);c.t+=200*b[c.n++%b.length];},base:(li,t)=>saw(li,t+60)};});

R('svt','AVNRT (Paroksismal SVT)','Supraventriküler',{rate:'150–250/dk',pr:'Görünmez',qrs:'Dar',qt:'Kısa',
 desc:'AV düğüm içinde reentry. P dalgası QRS içine gömülü veya hemen arkasında: V1’de psödo-r′, inferiorda psödo-S.',
 crit:['Düzenli, dar QRS taşikardi ~180/dk','Ani başlangıç ve sonlanma','V1’de psödo-r′, DII/DIII/aVF’de psödo-S (retrograd P)'],
 clin:'Vagal manevra (modifiye Valsalva), ardından adenozin 6–12–12 mg. İnstabilitede senkronize kardiyoversiyon.',
 leads:{II:'Psödo-S',III:'Psödo-S',aVF:'Psödo-S',V1:'Psödo-r′'}},
 ()=>{const rp=a=>[{k:0,c:98,s:10,a}];const vm=V({qt:QT(333),extra:{II:rp(-.08),III:rp(-.09),aVF:rp(-.09),V1:rp(.08),aVR:rp(.06)}});
  return{gen(c){vbeat(c,c.t,vm);c.t+=jit(333,.005);}};});

R('mat','Multifokal Atriyal Taşikardi','Supraventriküler',{rate:'> 100/dk',pr:'Değişken',qrs:'Dar',qt:'Değişken',
 desc:'En az üç farklı ektopik atriyal odak: değişken P morfolojisi, değişken PR ve düzensiz R–R.',
 crit:['≥ 3 farklı P morfolojisi aynı derivasyonda','Değişken PP, PR ve RR aralıkları','P dalgaları arasında izoelektrik hat vardır (AF’den farkı)'],
 clin:'Ağır KOAH, hipoksi, hipomagnezemi ve teofilin toksisitesi. Tedavi altta yatan nedene yöneliktir.',
 leads:{II:'≥3 P tipi',V1:'≥3 P tipi'}},
 ()=>{const ps=[P(),P({f:-30,a:.8}),P({f:100,a:1.4}),P({type:'pul',a:.6}),P({f:20,a:.6})],vm=V({qt:QT(520)});
  return{gen(c){sinus(c,rnd(420,640),rnd(115,205),ps[(Math.random()*ps.length)|0],vm);}};});

R('junc','Kavşak (Junctional) Ritmi','Supraventriküler',{rate:'40–60/dk',pr:'< 120 ms (retrograd)',qrs:'Dar',qt:'Normal',
 desc:'AV kavşaktan kaynaklanan kaçış ritmi. P dalgası inferiorda negatif ve QRS’ye çok yakın (veya gömülü).',
 crit:['Düzenli, dar QRS, hız 40–60/dk','DII, DIII, aVF’de ters P (retrograd)','PR < 120 ms veya P QRS’ye gömülü'],
 clin:'Sinüs düğüm disfonksiyonu, digoksin toksisitesi, inferior MI. Hız 60–100 ise hızlanmış kavşak ritmi.',
 leads:{II:'Ters P',III:'Ters P',aVF:'Ters P'}},
 ()=>{const pm=P({type:'retro'}),vm=V({qt:QT(1150)});return{gen(c){sinus(c,jit(1150,.01),80,pm,vm);}};});

R('wpw','Wolff-Parkinson-White (Pre-eksitasyon)','Supraventriküler',{rate:'Normal',pr:'< 120 ms',qrs:'> 110 ms (delta)',qt:'Sekonder ST-T',
 desc:'Aksesuar yol ventrikülü erken uyarır: kısa PR, QRS başında yavaş yükselen delta dalgası ve sekonder ST-T değişiklikleri.',
 crit:['PR < 120 ms','Delta dalgası (QRS başlangıcında çamurlaşma)','QRS > 110 ms','Diskordan ST-T değişiklikleri; psödo-infarkt Q olabilir'],
 clin:'AF gelişirse AV nodal blokerlerden (adenozin, BB, KKB, digoksin) kaçının. Kesin tedavi kateter ablasyonu.',
 leads:{II:'δ dalgası',V1:'δ + R',V2:'δ',V3:'δ',aVL:'Psödo-Q'}},
 ()=>{const pm=P(),vm=M.wpw();return{gen(c){sinus(c,jit(N70,.01),155,pm,vm);}};});

R('pxaf','Pre-eksite Atriyal Fibrilasyon','Supraventriküler',{rate:'200–300/dk',pr:'Yok',qrs:'Geniş, değişken',qt:'—',
 desc:'WPW zemininde AF: aksesuar yol üzerinden çok hızlı, düzensiz ve morfolojisi atımdan atıma değişen geniş QRS.',
 crit:['Çok hızlı, düzensiz-düzensiz ritim (> 200/dk)','Geniş, değişken QRS morfolojisi (farklı derecede pre-eksitasyon)','Bazı R–R aralıkları < 250 ms'],
 clin:'VF’ye dönüşebilir. AV nodal blokerler kontrendike. İnstabilitede senkronize kardiyoversiyon; stabil ise prokainamid.',
 leads:{II:'Değişken QRS',V1:'Değişken QRS',V2:'δ'}},
 ()=>{
  const vs=[V({qrsd:115,hax:20,delta:{a:.3,f:70,h:80,w:30},T:{a:.15,f:220,h:-110},qt:280}),V({qrsd:135,hax:20,delta:{a:.5,f:70,h:80,w:55},T:{a:.2,f:220,h:-110},qt:290}),V({qrsd:150,hax:30,delta:{a:.6,f:70,h:80,w:70},T:{a:.2,f:220,h:-110},qt:300})];
  return{gen(c){vbeat(c,c.t+60,vs[(Math.random()*3)|0]);c.t+=rnd(220,460);},base:(li,t)=>fwaves(li,t,.8)};});

/* ================= VENTRİKÜLER ================= */
R('pvcbig','PVC – Ventriküler Bigemini','Ventriküler',{rate:'Altta yatan ritim',pr:'—',qrs:'Geniş (PVC)',qt:'—',
 desc:'Her sinüs atımını bir prematür ventriküler atım izler. PVC geniş, öncesinde P yok ve diskordan T dalgalıdır.',
 crit:['Normal atım + PVC şeklinde ikili gruplar','PVC: QRS > 120 ms, P yok, T dalgası QRS’ye zıt','Tam kompansatuvar duraklama'],
 clin:'Elektrolit (K, Mg), iskemi, ilaç ve kardiyomiyopati araştırılmalı. Yük > %10–15 ise kardiyomiyopati riski.',
 leads:{II:'PVC',V1:'LBBB tipi PVC'}},
 ()=>{const rr=820,pm=P(),vm=V({qt:QT(rr)}),pv=M.pvcR();return{gen(c){sinus(c,0,160,pm,vm);vbeat(c,c.t+160+470,pv);c.ev.push({t:c.t+rr,m:pm});c.t+=2*rr;}};});

R('pvctri','PVC – Ventriküler Trigemini','Ventriküler',{rate:'Altta yatan ritim',pr:'—',qrs:'Geniş (PVC)',qt:'—',
 desc:'İki normal atımı bir PVC izler. Bu örnekte PVC sol ventrikül kaynaklıdır (RBBB morfolojisi, üst aks).',
 crit:['Normal–normal–PVC tekrarı','PVC: geniş, P’siz, diskordan ST-T','Kompansatuvar duraklama'],
 clin:'Sıklıkla benign; yapısal kalp hastalığı varsa ileri değerlendirme gerekir.',
 leads:{II:'PVC',V1:'RBBB tipi PVC'}},
 ()=>{const rr=800,pm=P(),vm=V({qt:QT(rr)}),pv=V({wide:1,axis:-70,hax:100,qrsd:150,amp:1.3,qt:400,T:{a:.4,f:110,h:-80,sl:60,sr:44}});
  return{gen(c){sinus(c,rr,160,pm,vm);sinus(c,0,160,pm,vm);vbeat(c,c.t+160+460,pv);c.ev.push({t:c.t+rr,m:pm});c.t+=2*rr;}};});

R('nsvt','Non-sustained VT (NSVT)','Ventriküler',{rate:'> 100/dk (atak)',pr:'—',qrs:'Geniş',qt:'—',
 desc:'Sinüs ritmi arasında 3 veya daha fazla ardışık geniş QRS atımından oluşan, 30 saniyeden kısa süren VT atakları.',
 crit:['≥ 3 ardışık ventriküler atım, > 100/dk','Süre < 30 sn ve kendiliğinden sonlanır','Monomorfik geniş QRS'],
 clin:'Yapısal kalp hastalığında ani ölüm riski göstergesi; EF değerlendirmesi ve ICD endikasyonu açısından incelenmeli.',
 leads:{II:'VT atağı',V1:'VT atağı'}},
 ()=>{const rr=820,pm=P(),vm=V({qt:QT(rr)}),vt=M.vt(300);return{gen(c){for(let i=0;i<4;i++)sinus(c,rr,160,pm,vm);
  let t=c.t-rr+160+420;for(let i=0;i<6;i++){vbeat(c,t,vt);t+=340;}c.t=t+700;}};});

R('vt','Monomorfik Ventriküler Taşikardi','Ventriküler',{rate:'150–250/dk',pr:'AV disosiyasyon',qrs:'> 140 ms',qt:'—',
 desc:'Ventrikül kaynaklı düzenli geniş QRS taşikardi. Bağımsız P dalgaları (AV disosiyasyon) zaman zaman QRS-T üzerinde çentik yapar.',
 crit:['Düzenli, geniş QRS (> 140 ms), ~170/dk','AV disosiyasyon; füzyon/capture atımları','Ekstrem (kuzeybatı) aks, V1–V6 konkordans eğilimi','Brugada / Vereckei kriterleri'],
 clin:'Nabızlı ve stabil: amiodaron/prokainamid; instabil: senkronize kardiyoversiyon; nabızsız: defibrilasyon (VF algoritması).',
 leads:{aVR:'Başlangıç R',V1:'Monofazik R',II:'Geniş QRS',I:'Negatif'}},
 ()=>{const vm=M.vt(),pm=P();return{gen(c){c.s.ta??=c.t;vbeat(c,c.t,vm);c.t+=350;while(c.s.ta<c.t){c.ev.push({t:c.s.ta,m:pm});c.s.ta+=820;}}};});

R('bvt','Bidireksiyonel VT','Ventriküler',{rate:'140–180/dk',pr:'—',qrs:'Geniş, alternan aks',qt:'—',
 desc:'QRS aksı her atımda 180° yön değiştirir (sırayla sol üst / sağ alt aks), RBBB morfolojisi.',
 crit:['Atımdan atıma frontal aks alternansı','RBBB benzeri morfoloji','Düzenli geniş QRS taşikardi'],
 clin:'Digoksin toksisitesi ve katekolaminerjik polimorfik VT (CPVT) için patognomonik. Digoksin antikoru (Fab) düşünülmeli.',
 leads:{II:'Alternan',aVF:'Alternan',V1:'RBBB'}},
 ()=>{const a=M.rbbb({axis:-60,septF:110,qt:300}),b=M.rbbb({axis:120,septF:-40,qt:300});return{gen(c){vbeat(c,c.t,c.n++%2?a:b);c.t+=380;}};});

R('tdp','Torsades de Pointes','Ventriküler',{rate:'200–250/dk',pr:'—',qrs:'Polimorfik',qt:'Atak öncesi QTc > 500 ms',
 desc:'Uzun QT zemininde, QRS amplitüdü ve polaritesinin izoelektrik hat etrafında “kıvrılarak” değiştiği polimorfik VT.',
 crit:['Atak öncesi belirgin uzun QT','R-on-T PVC ile başlangıç (kısa–uzun–kısa dizisi)','İğ şeklinde dönen polimorfik QRS kompleksleri'],
 clin:'IV magnezyum sülfat 2 g; QT uzatan ilaçları kesin, K’yı düzeltin; overdrive pacing/izoproterenol. Nabızsızsa defibrilasyon.',
 leads:{II:'Polimorfik',V2:'Uzun QT',V3:'Uzun QT'}},
 ()=>{const rr=1050,pm=P(),vm=V({qt:590,T:{a:.34,sl:80,sr:50}});
  return{gen(c){c.s.b??=[];for(let i=0;i<3;i++)sinus(c,rr,170,pm,vm);const t0=c.t-rr+170+440,dur=4200;
   c.s.b.push([t0,t0+dur]);for(let t=t0;t<t0+dur;t+=238)c.ev.push({t,m:EMPTY,v:1});c.t=t0+dur+900;},
   base(li,t,c){if(!c.s.b)return 0;for(const[a,b]of c.s.b){if(t>=a&&t<=b){const x=t-a;const env=sg(x/60)*sg((b-a-x)/160);
    const mod=Math.cos(TAU*x/2100+li*.42);const s=Math.sin(TAU*4.2*x/1000);return 1.25*env*mod*Math.sign(s)*Math.abs(s)**1.5;}}return 0;}};});

R('vf','Ventriküler Fibrilasyon','Ventriküler',{rate:'Ölçülemez',pr:'—',qrs:'Yok',qt:'—',
 desc:'Organize ventrikül aktivitesi yok: amplitüd ve frekansı sürekli değişen kaotik dalgalar. Kalp debisi sıfırdır.',
 crit:['Tanımlanabilir P, QRS veya T yok','Düzensiz, değişken amplitüdlü dalgalanmalar','Kaba VF zamanla ince VF’ye döner'],
 clin:'Kardiyak arrest: derhal KPR ve defibrilasyon (bifazik 120–200 J), adrenalin, 3. şoktan sonra amiodaron.',
 leads:{II:'Kaotik',V1:'Kaotik'}},
 ()=>({gen(c){c.t+=1000;},base:(li,t)=>vfw(li,t,1)}));

R('asys','Asistoli','Ventriküler',{rate:'0',pr:'—',qrs:'Yok',qt:'—',
 desc:'Elektriksel aktivite yok; düz çizgi. Elektrot kopması ve düşük kazanç mutlaka dışlanmalı.',
 crit:['Hiçbir derivasyonda QRS yok','Hafif taban hattı oynaması olabilir','En az iki derivasyonda doğrulanmalı'],
 clin:'Şoklanamayan ritim: KPR, en kısa sürede adrenalin 1 mg, geri döndürülebilir nedenler (4H–4T).',
 leads:{II:'Düz çizgi'}},
 ()=>({gen(c){c.t+=1000;}}));

R('aivr','Hızlanmış İdiyoventriküler Ritim (AIVR)','Ventriküler',{rate:'50–110/dk',pr:'Disosiye',qrs:'Geniş',qt:'—',
 desc:'Ventriküler odaktan kaynaklanan, hızı sinüse yakın geniş QRS ritim. Sinüs P’leri bağımsız ilerler.',
 crit:['Geniş QRS, düzenli, 50–110/dk','AV disosiyasyon, füzyon atımları','Kademeli başlangıç ve sonlanma'],
 clin:'Reperfüzyon aritmisi olarak tipiktir (trombolitik/PCI sonrası). Genellikle benign, tedavi gerektirmez.',
 leads:{II:'Geniş QRS',V1:'Geniş QRS'}},
 ()=>{const vm=V({wide:1,axis:110,hax:-60,qrsd:145,amp:1.2,qt:430,T:{a:.38,f:-70,h:120,sl:60,sr:44}}),pm=P();
  return{gen(c){c.s.ta??=c.t+200;vbeat(c,c.t,vm);c.t+=800;while(c.s.ta<c.t){c.ev.push({t:c.s.ta,m:pm});c.s.ta+=870;}}};});

R('vvi','Ventriküler Pace Ritmi (VVI)','Ventriküler',{rate:'Programlanan (70/dk)',pr:'—',qrs:'Geniş (LBBB tipi)',qt:'—',
 desc:'Sağ ventrikül apeksinden uyarı: her QRS’den önce keskin pace spike’ı, ardından LBBB morfolojisinde geniş QRS ve üst aks.',
 crit:['QRS öncesi dar vertikal pace spike','Geniş QRS, LBBB benzeri, sol üst aks','Diskordan ST-T (normal bulgu)'],
 clin:'Capture/sensing kusurlarını değerlendirin. Pace ritminde STEMI tanısı için modifiye Sgarbossa kriterleri.',
 leads:{II:'Spike',V1:'LBBB tipi',aVF:'Üst aks'}},
 ()=>{const vm=M.paced();return{gen(c){c.sp.push(c.t-3);vbeat(c,c.t,vm);c.t+=N70;}};});

R('ddd','Çift Odacık Pace (DDD)','Ventriküler',{rate:'Programlanan',pr:'AV gecikme ~160 ms',qrs:'Geniş',qt:'—',
 desc:'Atriyal spike + P dalgası, ardından programlanmış AV gecikmesi sonrası ventriküler spike ve geniş QRS.',
 crit:['İki spike: atriyal ve ventriküler','Atriyal spike’ı P, ventriküler spike’ı geniş QRS izler','AV gecikmesi sabit'],
 clin:'Fizyolojik AV senkronizasyonu sağlar. Pacemaker aracılı taşikardi (PMT) açısından izlenmelidir.',
 leads:{II:'A + V spike',V1:'Spike'}},
 ()=>{const vm=M.paced(),pm=P({a:.7});return{gen(c){c.sp.push(c.t-3);c.ev.push({t:c.t,m:pm});c.sp.push(c.t+157);vbeat(c,c.t+160,vm);c.t+=N70;}};});

/* ================= İLETİ BLOKLARI ================= */
R('avb1','Birinci Derece AV Blok','İleti blokları',{rate:'Normal',pr:'> 200 ms (burada 320)',qrs:'Dar',qt:'Normal',
 desc:'Her P iletilir ancak AV iletim gecikmiştir; PR aralığı sabit ve uzundur.',
 crit:['PR > 200 ms ve sabit','Her P’yi bir QRS izler','Dar QRS'],
 clin:'Genellikle benign. İlaçlar (BB, KKB, digoksin), inferior MI, Lyme hastalığı ve dejeneratif ileti hastalıkları.',
 leads:{II:'Uzun PR'}},
 ()=>{const pm=P(),vm=V({qt:QT(900)});return{gen(c){sinus(c,jit(900,.01),320,pm,vm);}};});

R('mob1','İkinci Derece AV Blok – Mobitz I (Wenckebach)','İleti blokları',{rate:'Değişken',pr:'Giderek uzar',qrs:'Dar',qt:'Normal',
 desc:'PR aralığı her atımda giderek uzar ve sonunda bir P iletilmez. Gruplanmış atımlar (“group beating”).',
 crit:['Kademeli PR uzaması → bloke P','Bloke P sonrası ilk PR en kısadır','R–R aralığı giderek kısalır','Duraklama 2×PP’den kısadır'],
 clin:'Blok genellikle AV düğüm düzeyinde, prognoz iyi. İnferior MI ve yüksek vagal tonusta görülür.',
 leads:{II:'PR ↑ → blok',V1:'Bloke P'}},
 ()=>{const pm=P(),vm=V({qt:QT(800)}),pr=[170,250,300];return{gen(c){const k=c.n++%4;if(k<3)sinus(c,760,pr[k],pm,vm);else sinus(c,760,0,pm,null);}};});

R('mob2','İkinci Derece AV Blok – Mobitz II','İleti blokları',{rate:'Değişken',pr:'Sabit',qrs:'Genellikle geniş',qt:'Normal',
 desc:'PR aralığı sabitken aniden bir P dalgası iletilmez. Blok His-Purkinje düzeyindedir; genellikle dal bloğu eşlik eder.',
 crit:['Sabit PR ile ani bloke P','Bloke P sonrası PR değişmez','Sıklıkla eşlik eden RBBB/LBBB'],
 clin:'Tam bloğa ilerleme riski yüksek: transkutan pace hazırlığı ve kalıcı pacemaker endikasyonu.',
 leads:{II:'Bloke P',V1:'RBBB'}},
 ()=>{const pm=P(),vm=M.rbbb();return{gen(c){const k=c.n++%3;sinus(c,720,k<2?180:0,pm,k<2?vm:null);}};});

R('avb21','2:1 AV Blok','İleti blokları',{rate:'Atriyum 100, ventrikül 50/dk',pr:'Sabit',qrs:'Dar',qt:'Normal',
 desc:'Her iki P dalgasından biri iletilir. Mobitz I ile II arasında yalnızca bu traseyle ayrım yapılamaz.',
 crit:['P:QRS oranı 2:1, sabit','İletilen atımlarda PR sabit','Bloke P çoğu zaman T dalgasına yakındır'],
 clin:'Dar QRS düğüm düzeyini, geniş QRS infranodal bloğu düşündürür. Uzun ritim kaydı ve egzersiz/atropin yanıtı yardımcıdır.',
 leads:{II:'2:1',V1:'Bloke P'}},
 ()=>{const pm=P(),vm=V({qt:QT(1200)});return{gen(c){sinus(c,600,180,pm,vm);sinus(c,600,0,pm,null);}};});

R('avb3','Üçüncü Derece (Tam) AV Blok','İleti blokları',{rate:'Ventrikül 30–40/dk',pr:'Değişken (ilişkisiz)',qrs:'Geniş kaçış',qt:'Uzun',
 desc:'Atriyum ve ventriküller birbirinden bağımsız atar. P dalgaları düzenli yürür; geniş ventriküler kaçış ritmi yavaş ve düzenlidir.',
 crit:['Tam AV disosiyasyon: P–P ve R–R kendi içinde düzenli','Atriyal hız > ventriküler hız','PR aralığı rastgele değişir','Geniş QRS → ventriküler kaçış (dar ise kavşak kaçışı)'],
 clin:'Atropin genellikle etkisiz; transkutan/transvenöz pace, dopamin/adrenalin infüzyonu ve kalıcı pacemaker.',
 leads:{II:'AV disosiyasyon',V1:'Geniş kaçış'}},
 ()=>{const pm=P(),vm=M.esc(QT(1550)+40);return{gen(c){c.s.ta??=c.t+150;vbeat(c,c.t,vm);c.t+=1550;while(c.s.ta<c.t){c.ev.push({t:c.s.ta,m:pm});c.s.ta+=jit(690,.02);}}};});

R('rbbb','Sağ Dal Bloğu (RBBB)','İleti blokları',{rate:'Normal',pr:'Normal',qrs:'≥ 120 ms',qt:'Normal',
 desc:'Sağ ventrikül gecikmeli aktive olur: V1’de rSR′ (“tavşan kulağı”), DI ve V6’da geniş geç S dalgası.',
 crit:['QRS ≥ 120 ms','V1–V2’de rSR′ (R′ > r)','DI, aVL, V5–V6’da geniş, çamurlaşmış S','V1–V3’te sekonder T negatifliği'],
 clin:'Sağlıklı bireylerde de görülebilir. Yeni gelişen RBBB’de PE, iskemi ve myokardit düşünülmeli.',
 leads:{V1:'rSR′',V2:'rSR′',I:'Geniş S',V6:'Geniş S',aVR:'Geç R'}},
 ()=>{const pm=P(),vm=M.rbbb();return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('lbbb','Sol Dal Bloğu (LBBB)','İleti blokları',{rate:'Normal',pr:'Normal',qrs:'≥ 120 ms',qt:'Diskordan ST-T',
 desc:'Sol ventrikül sağdan sola gecikmeli aktive olur: V1’de derin geniş QS, DI ve V6’da çentikli geniş R; septal q kaybolur.',
 crit:['QRS ≥ 120 ms','V1’de geniş QS veya rS','DI, aVL, V5–V6’da geniş, çentikli R; septal q yok','Uygun diskordans: ST-T, QRS’nin zıt yönünde'],
 clin:'Yapısal kalp hastalığı göstergesi. Akut koroner sendrom şüphesinde (modifiye) Sgarbossa kriterlerini uygulayın.',
 leads:{V1:'Geniş QS',V2:'ST↑ diskordan',I:'Çentikli R',aVL:'Çentikli R',V6:'Çentikli R'}},
 ()=>{const pm=P(),vm=M.lbbb();return{gen(c){sinus(c,jit(N70,.01),170,pm,vm);}};});

R('lafb','Sol Anterior Fasiküler Blok','İleti blokları',{rate:'Normal',pr:'Normal',qrs:'< 120 ms',qt:'Normal',
 desc:'Sol anterior fasikül iletmez; ventrikül aktivasyonu yukarı ve sola yönelir: belirgin sol aks sapması.',
 crit:['Frontal aks −45° ile −90° arası','DI ve aVL’de qR','DII, DIII ve aVF’de rS','QRS genişliği normal'],
 clin:'En sık fasiküler blok. Hipertansiyon, iskemik kalp hastalığı ve dejeneratif ileti hastalıklarıyla ilişkili.',
 leads:{I:'qR',aVL:'qR',II:'rS',III:'rS',aVF:'rS'}},
 ()=>{const pm=P(),vm=V({axis:-55,septF:110,septA:.2,qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('lpfb','Sol Posterior Fasiküler Blok','İleti blokları',{rate:'Normal',pr:'Normal',qrs:'< 120 ms',qt:'Normal',
 desc:'Sol posterior fasikül bloğu: sağ aks sapması, DI’de rS, inferiorda qR.',
 crit:['Frontal aks > +90° (≈ +115°)','DI ve aVL’de rS','DIII ve aVF’de qR','RVH, lateral MI gibi diğer sağ aks nedenleri dışlanmalı'],
 clin:'Nadir görülür; genellikle yaygın ileti sistemi hastalığını gösterir.',
 leads:{I:'rS',aVL:'rS',III:'qR',aVF:'qR'}},
 ()=>{const pm=P(),vm=V({axis:115,septF:-40,septA:.2,qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('trifas','Trifasiküler Blok (RBBB + LAFB + 1. Derece AVB)','İleti blokları',{rate:'Normal',pr:'> 200 ms',qrs:'≥ 120 ms',qt:'Normal',
 desc:'Bifasiküler blok (RBBB + sol anterior fasiküler blok) ile birlikte uzamış PR aralığı.',
 crit:['V1’de rSR′, geniş QRS','Sol aks sapması (−60°)','PR > 200 ms'],
 clin:'Tam AV bloğa ilerleme riski. Senkop öyküsü varsa pacemaker değerlendirmesi.',
 leads:{V1:'rSR′',I:'qR + S',II:'rS',aVF:'rS'}},
 ()=>{const pm=P(),vm=V({qrsd:135,qrs:[...stdQRS({axis:-55,septF:110,septA:.2}),{t:100,s:15,a:.6,f:-170,h:130}],qt:QT(N70)+30,T:{a:.28,f:45,h:-30}});
  return{gen(c){sinus(c,jit(N70,.01),280,pm,vm);}};});

/* ================= İSKEMİ / İNFARKT ================= */
R('ant','Anterior STEMI (LAD)','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'Q gelişimi',qt:'—',
 desc:'LAD proksimal tıkanıklık: V1–V4’te konveks ST elevasyonu, hiperakut T dalgaları, gelişen Q dalgaları ve inferiorda resiprokal ST çökmesi.',
 crit:['≥ 2 komşu göğüs derivasyonunda ST↑ (V2–V3’te ≥ 2 mm erkek / ≥ 1.5 mm kadın)','Konveks (“tombstone”) ST yükselmesi, hiperakut T','V1–V3’te QS/Q dalgaları, R progresyonunda kayıp','DIII ve aVF’de resiprokal ST↓ (aVL’de ST↑ → proksimal LAD)'],
 clin:'Acil reperfüzyon: kapı–balon < 90 dk. Aspirin, P2Y12 inhibitörü ve antikoagülasyon.',
 leads:{V1:'ST↑',V2:'ST↑ QS',V3:'ST↑ QS',V4:'ST↑',aVL:'ST↑',III:'ST↓',aVF:'ST↓'}},
 ()=>{const pm=P(),vm=V({qrs:[...stdQRS({septA:0}),{t:14,s:8,a:.3,f:-90,h:-90}],precGain:[1,.6,.5,.7,1,1],st:{a:.32,f:-60,h:80,shape:'convex',l:.5},T:{a:.55,f:-20,h:70,sl:55,sr:38},qt:QT(N70)+15});
  return{gen(c){sinus(c,jit(800,.01),160,pm,vm);}};});

R('inf','İnferior STEMI (RCA)','İskemi / İnfarkt',{rate:'Normal / bradikardi',pr:'Normal',qrs:'Inferior Q',qt:'—',
 desc:'Sağ koroner arter tıkanıklığı: DII, DIII, aVF’de ST elevasyonu; DIII’teki yükselme DII’den fazla; aVL’de resiprokal çökme.',
 crit:['DII, DIII, aVF’de ST↑ (DIII > DII → RCA)','aVL ve DI’de resiprokal ST↓','İnferior derivasyonlarda patolojik Q','V1–V2’de ST↓ → posterior uzanım'],
 clin:'Sağ ventrikül tutulumu için V4R çekin; RV infarktında nitrat ve diüretikten kaçının. AV blok gelişebilir.',
 leads:{II:'ST↑ Q',III:'ST↑ Q',aVF:'ST↑ Q',aVL:'ST↓',I:'ST↓',V2:'ST↓'}},
 ()=>{const pm=P(),vm=V({qrs:[...stdQRS({septA:.1}),{t:14,s:8,a:.28,f:-90,h:0}],st:{a:.3,f:105,h:-80,shape:'convex',p:.4},T:{a:.45,f:100,h:-40,sl:55,sr:38},qt:QT(N70)+15});
  return{gen(c){sinus(c,jit(950,.01),170,pm,vm);}};});

R('lat','Lateral STEMI (Cx / Diagonal)','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'Normal',qt:'—',
 desc:'Sirkumfleks veya diagonal arter tıkanıklığı: DI, aVL, V5–V6’da ST elevasyonu, DIII’te resiprokal çökme.',
 crit:['DI, aVL (yüksek lateral) ve V5–V6’da ST↑','DIII ve aVF’de resiprokal ST↓','Hiperakut lateral T dalgaları'],
 clin:'Sirkumfleks infarktları EKG’de “sessiz” olabilir; posterior derivasyonları (V7–V9) da değerlendirin.',
 leads:{I:'ST↑',aVL:'ST↑',V5:'ST↑',V6:'ST↑',III:'ST↓',aVF:'ST↓'}},
 ()=>{const pm=P(),vm=V({septA:.25,septF:165,st:{a:.25,f:-25,h:15,shape:'convex',p:.9},T:{a:.45,f:-25,h:15},qt:QT(N70)+15});
  return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('post','Posterior MI','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'V1–V2 uzun R',qt:'—',
 desc:'Posterior duvar infarktının ayna görüntüsü: V1–V3’te horizontal ST çökmesi, uzun R dalgası ve dik T dalgaları.',
 crit:['V1–V3’te horizontal ST↓ (≥ 0.5 mm)','V1–V2’de R/S > 1, geniş R','V1–V3’te dik pozitif T','V7–V9’da ST↑ ≥ 0.5 mm ile doğrulanır'],
 clin:'STEMI eşdeğeri — acil reperfüzyon. Sıklıkla inferior veya lateral MI ile birliktedir.',
 leads:{V1:'ST↓ uzun R',V2:'ST↓ uzun R',V3:'ST↓'}},
 ()=>{const pm=P(),vm=V({qrs:[...stdQRS({hax:10}),{t:28,s:9,a:.45,f:60,h:110}],st:{a:.22,f:0,h:-80,shape:'flat',l:0},tLead:{V1:.35,V2:.5,V3:.45},qt:QT(N70)});
  return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('avr','Yaygın ST Çökmesi + aVR Elevasyonu','İskemi / İnfarkt',{rate:'Sıklıkla taşikardi',pr:'Normal',qrs:'Normal',qt:'—',
 desc:'Subendokardiyal iskemi paterni: ≥ 6 derivasyonda horizontal ST çökmesi ve aVR’de (± V1) ST elevasyonu.',
 crit:['≥ 6–8 derivasyonda ≥ 1 mm horizontal/downsloping ST↓','aVR’de ST↑ ≥ 1 mm','aVR ST↑ > V1 ST↑ → sol ana / 3 damar hastalığı'],
 clin:'Sol ana koroner veya 3 damar hastalığı, ciddi anemi, şok ya da taşiaritmi sonrası görülebilir. Acil kardiyoloji konsültasyonu.',
 leads:{aVR:'ST↑',I:'ST↓',II:'ST↓',V4:'ST↓',V5:'ST↓',V6:'ST↓',aVF:'ST↓'}},
 ()=>{const pm=P(),vm=V({st:{a:.18,f:-150,h:-170,shape:'flat',p:1},T:{a:.15},qt:QT(600)});return{gen(c){sinus(c,jit(600,.01),140,pm,vm);}};});

R('wellens','Wellens Sendromu','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'Normal',qt:'—',
 desc:'Ağrısız dönemde V2–V3’te derin, simetrik T negatifliği (tip B). Kritik proksimal LAD darlığını gösterir.',
 crit:['V2–V3’te derin simetrik T negatifliği (tip B) veya bifazik T (tip A)','ST segmenti izoelektrik ya da < 1 mm yükselmiş','Q dalgası yok, R progresyonu korunmuş','Göğüs ağrısı öyküsü, ağrısız dönemde çekim'],
 clin:'Yüksek risk: büyük anterior MI gelişebilir. Stres testi kontrendike; erken koroner anjiyografi.',
 leads:{V2:'Derin T↓',V3:'Derin T↓',V4:'T↓'}},
 ()=>{const pm=P(),vm=V({T:{a:.3,sl:44,sr:40},tLead:{V1:-.1,V2:-.5,V3:-.58,V4:-.32},qt:QT(N70)+10});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('dewinter','de Winter T Dalgaları','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'Normal',qt:'—',
 desc:'STEMI eşdeğeri: göğüs derivasyonlarında J noktasından yukarı eğimli ST çökmesi ve uzun, simetrik T dalgaları; aVR’de hafif ST elevasyonu.',
 crit:['V1–V6’da J noktasında 1–3 mm yukarı eğimli ST↓','Uzun, simetrik, sivri prekordiyal T dalgaları','aVR’de 1–2 mm ST↑','Klasik ST elevasyonu yok'],
 clin:'Akut proksimal LAD tıkanıklığı — STEMI gibi acil reperfüzyon gerektirir.',
 leads:{V2:'ST↓ T↑',V3:'ST↓ T↑',V4:'ST↓ T↑',V5:'ST↓',aVR:'ST↑'}},
 ()=>{const pm=P(),vm=V({stShape:'up',stLead:{V1:-.05,V2:-.18,V3:-.24,V4:-.22,V5:-.14,V6:-.1,aVR:.1},T:{a:.3,sl:42,sr:34},tLead:{V1:.3,V2:.9,V3:1,V4:.85,V5:.55,V6:.35},qt:QT(N70)});
  return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('oldmi','Eski İnferior MI (Patolojik Q)','İskemi / İnfarkt',{rate:'Normal',pr:'Normal',qrs:'Inferior Q',qt:'—',
 desc:'Tamamlanmış (geçirilmiş) inferior infarkt: DII, DIII ve aVF’de geniş Q dalgaları ve T negatifliği; ST izoelektrik.',
 crit:['Q süresi ≥ 40 ms veya derinliği R’nin ≥ %25’i','En az iki komşu inferior derivasyonda','ST segmenti izoelektrik, T negatif olabilir'],
 clin:'Skar dokusunu gösterir; ventrikül fonksiyonunun ve VT riskinin değerlendirilmesi gerekir.',
 leads:{II:'Q',III:'Q T↓',aVF:'Q T↓'}},
 ()=>{const pm=P(),vm=V({qrs:[...stdQRS({septA:.08,axis:20}),{t:16,s:9,a:.35,f:-90,h:0}],tLead:{II:-.08,III:-.22,aVF:-.16},qt:QT(N70)});
  return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

/* ================= ELEKTROLİT & İLAÇ ================= */
R('hyperk','Hiperkalemi','Elektrolit & İlaç',{rate:'Değişken',pr:'Uzar',qrs:'Genişler',qt:'—',
 desc:'Ciddi hiperkalemi: sivri, dar tabanlı uzun T dalgaları, düzleşen P, uzayan PR ve genişleyen QRS. İlerlerse sinüs dalgası ve VF.',
 crit:['Sivri, simetrik, dar tabanlı (“çadır”) T dalgaları','P amplitüdünde azalma, PR uzaması','QRS genişlemesi (> 120 ms)','İlerlemiş: sinüs dalgası paterni, bradikardi, VF/asistoli'],
 clin:'IV kalsiyum glukonat (membran stabilizasyonu), insülin + glukoz, salbutamol, gerekirse hemodiyaliz.',
 leads:{V2:'Sivri T',V3:'Sivri T',V4:'Sivri T',II:'Düz P',V1:'Geniş QRS'}},
 ()=>{const pm=P({a:.35}),vm=V({qrsd:125,qrs:stdQRS({qrsd:122}),T:{a:.95,f:50,h:20,sl:28,sr:22,p:1.45},qt:350});return{gen(c){sinus(c,jit(900,.01),220,pm,vm);}};});

R('hypok','Hipokalemi','Elektrolit & İlaç',{rate:'Normal',pr:'Hafif uzun',qrs:'Normal',qt:'QU uzar',
 desc:'T dalgası düzleşir, belirgin U dalgası ortaya çıkar; ST segmentinde hafif çökme. T ve U birleşince uzun QT görünümü.',
 crit:['Belirgin U dalgası (> 1 mm, en iyi V2–V3)','T düzleşmesi / negatifliği','Hafif ST çökmesi','Uzamış QU aralığı'],
 clin:'Potasyum ve magnezyum replasmanı. Digoksin toksisitesi ve aritmi riskini artırır.',
 leads:{V2:'U dalgası',V3:'U dalgası',II:'Düz T',V4:'U dalgası'}},
 ()=>{const pm=P({a:1.2}),vm=V({T:{a:.1},u:.17,st:{a:-.06,f:50,h:20,shape:'scoop'},qt:360});return{gen(c){sinus(c,jit(N70,.01),180,pm,vm);}};});

R('hyperca','Hiperkalsemi','Elektrolit & İlaç',{rate:'Normal',pr:'Normal',qrs:'Normal',qt:'QTc < 360 ms',
 desc:'ST segmenti kısalır veya kaybolur; T dalgası QRS’nin hemen ardından başlar. QT aralığı belirgin kısalır.',
 crit:['Kısa QT (QTc < 360 ms)','ST segmenti kısa veya yok','Ciddi olgularda J (Osborn) dalgası, AV blok'],
 clin:'Hiperparatiroidi ve malignite en sık nedenler. IV sıvı, kalsitonin, bifosfonatlar.',
 leads:{II:'Kısa ST',V3:'Kısa QT'}},
 ()=>{const pm=P(),vm=V({qt:290,T:{a:.32,sl:45,sr:32}});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('hypoca','Hipokalsemi','Elektrolit & İlaç',{rate:'Normal',pr:'Normal',qrs:'Normal',qt:'QTc > 460 ms',
 desc:'ST segmenti uzar (T dalgasının genişliği değişmez); sonuçta QT aralığı uzar.',
 crit:['Uzun, düz ST segmenti','T dalgası morfolojisi normale yakın','QTc uzaması'],
 clin:'Hipoparatiroidi, D vitamini eksikliği, böbrek yetmezliği, pankreatit. IV kalsiyum glukonat. Torsades riski.',
 leads:{II:'Uzun ST',V3:'Uzun ST',V4:'Uzun QT'}},
 ()=>{const pm=P(),vm=V({qt:510,T:{sl:50,sr:34}});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('lqt','Uzun QT Sendromu','Elektrolit & İlaç',{rate:'Normal-yavaş',pr:'Normal',qrs:'Normal',qt:'QTc > 500 ms',
 desc:'Repolarizasyon belirgin uzamıştır: geniş tabanlı, geç T dalgası. Torsades de pointes için yüksek risk.',
 crit:['QTc > 470 ms (erkek) / > 480 ms (kadın); > 500 ms yüksek risk','Geniş tabanlı veya çentikli T','T dalgası alternansı olabilir'],
 clin:'Konjenital (LQT1–3) veya edinsel (ilaçlar, hipoK, hipoMg). QT uzatan ilaçları kesin, elektrolitleri düzeltin.',
 leads:{II:'Uzun QT',V2:'Uzun QT',V3:'Uzun QT'}},
 ()=>{const pm=P(),vm=V({qt:570,T:{a:.3,sl:75,sr:48}});return{gen(c){sinus(c,jit(950,.01),160,pm,vm);}};});

R('digox','Digoksin Etkisi','Elektrolit & İlaç',{rate:'Normal-yavaş',pr:'Hafif uzun',qrs:'Normal',qt:'Kısa',
 desc:'Terapötik digoksin etkisi: lateral derivasyonlarda “kepçe” (Salvador Dali bıyığı) şeklinde ST çökmesi, düzleşmiş T, kısa QT.',
 crit:['Kepçe / “hockey stick” şeklinde sarkan ST çökmesi','T amplitüdünde azalma','Kısa QT, hafif PR uzaması','Toksisitede: PAT + blok, bidireksiyonel VT, sık PVC'],
 clin:'Bu bulgular toksisite değil, etki göstergesidir. Toksisite şüphesinde düzey, K ve böbrek fonksiyonu; gerekirse Digifab.',
 leads:{V4:'Kepçe ST',V5:'Kepçe ST',V6:'Kepçe ST',II:'Kepçe ST',I:'Kepçe ST'}},
 ()=>{const pm=P(),vm=V({stShape:'scoop',stLead:{I:-.12,II:-.15,III:-.06,aVF:-.1,aVL:-.06,aVR:.06,V3:-.08,V4:-.15,V5:-.18,V6:-.16},T:{a:.12},qt:330});
  return{gen(c){sinus(c,jit(1000,.01),210,pm,vm);}};});

/* ================= YAPISAL & DİĞER ================= */
R('brugada','Brugada Sendromu (Tip 1)','Yapısal & Diğer',{rate:'Normal',pr:'Normal',qrs:'Normal / inkomplet RBBB',qt:'Normal',
 desc:'Sodyum kanalopatisi: V1–V2’de ≥ 2 mm “kubbe (coved)” şeklinde ST elevasyonu ve onu izleyen negatif T dalgası.',
 crit:['V1–V2’de ≥ 2 mm J noktası yükselmesi','Kubbe şeklinde, aşağı eğimli ST segmenti','Negatif T dalgası','Ateş ve sodyum kanal blokerleri paterni belirginleştirir'],
 clin:'Ani kardiyak ölüm riski (VF). Senkop veya arrest öyküsünde ICD. Ateşi agresif tedavi edin.',
 leads:{V1:'Kubbe ST↑',V2:'Kubbe ST↑'}},
 ()=>{const cov=a=>[{k:0,c:82,s:9,a:.22,q:1},{k:2,c0:84,c1:285,a0:a,a1:.02,e:5},{k:0,c:150,s:45,a:.06}];
  const pm=P(),vm=V({tLead:{V1:-.2,V2:-.24},extra:{V1:cov(.36),V2:cov(.42)},qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.01),170,pm,vm);}};});

R('peri','Akut Perikardit','Yapısal & Diğer',{rate:'Sıklıkla taşikardi',pr:'PR çökmesi',qrs:'Normal',qt:'Normal',
 desc:'Yaygın, konkav ST elevasyonu ve PR segment çökmesi; aVR’de ise ST çökmesi ve PR elevasyonu. Resiprokal değişiklik yok.',
 crit:['Çok sayıda derivasyonda konkav ST↑ (tek bir koroner alana uymaz)','PR segment çökmesi (en iyi DII’de)','aVR’de PR↑ ve ST↓','Spodick bulgusu: TP segmentinde aşağı eğim'],
 clin:'NSAİİ + kolşisin. Efüzyon ve tamponad açısından ekokardiyografi. Troponin artışı → miyoperikardit.',
 leads:{I:'ST↑',II:'ST↑ PR↓',aVF:'ST↑',V2:'ST↑',V3:'ST↑',V4:'ST↑',V5:'ST↑',V6:'ST↑',aVR:'ST↓ PR↑'}},
 ()=>{const pm=P(),vm=V({st:{a:.17,f:50,h:30,shape:'flat',p:1},prd:{a:-.07,f:50,h:30,w:70},T:{a:.3},qt:QT(600)});return{gen(c){sinus(c,jit(600,.01),150,pm,vm);}};});

R('pe','Pulmoner Emboli (S1Q3T3)','Yapısal & Diğer',{rate:'Sinüs taşikardisi',pr:'Normal',qrs:'İnkomplet RBBB',qt:'—',
 desc:'Akut sağ ventrikül yüklenmesi: sinüs taşikardisi, S1Q3T3 paterni, sağ aks, inkomplet RBBB ve V1–V3’te T negatifliği.',
 crit:['Sinüs taşikardisi (en sık bulgu)','DI’de S, DIII’te Q ve negatif T (S1Q3T3)','V1–V4’te T negatifliği (sağ ventrikül yüklenmesi)','Sağ aks sapması, inkomplet/komplet RBBB'],
 clin:'EKG ne duyarlı ne de özgüldür. Klinik olasılık + D-dimer / BT pulmoner anjiyografi. Masif PE’de trombolitik.',
 leads:{I:'S1',III:'Q3 T3',V1:'T↓ R′',V2:'T↓',V3:'T↓'}},
 ()=>{const pm=P({type:'pul',a:.8}),vm=V({qrsd:105,qrs:[...stdQRS({axis:95,septF:-60,septA:.2}),{t:80,s:12,a:.4,f:-170,h:130}],tLead:{III:-.18,V1:-.2,V2:-.25,V3:-.2,V4:-.08},qt:QT(520)});
  return{gen(c){sinus(c,jit(520,.01),140,pm,vm);}};});

R('lvh','Sol Ventrikül Hipertrofisi + Strain','Yapısal & Diğer',{rate:'Normal',pr:'Normal',qrs:'Yüksek voltaj',qt:'—',
 desc:'Artmış sol ventrikül kitlesi: göğüs derivasyonlarında yüksek voltaj ve lateral derivasyonlarda asimetrik ST çökmesi + T negatifliği (strain).',
 crit:['Sokolow-Lyon: S(V1) + R(V5/V6) > 35 mm','Cornell: R(aVL) + S(V3) > 28 mm (E) / > 20 mm (K)','Lateralde downsloping ST↓ ve asimetrik T negatifliği','Sol atriyal genişleme (P mitrale)'],
 clin:'Hipertansiyon, aort darlığı, HKMP. Strain paterni artmış kardiyovasküler riskle ilişkili.',
 leads:{V1:'Derin S',V2:'Derin S',V5:'Yüksek R strain',V6:'Yüksek R strain',I:'Strain',aVL:'Strain'}},
 ()=>{const pm=P({type:'m'}),vm=V({amp:1.45,axis:10,hax:-25,pscale:2.1,qrsd:100,st:{a:.12,f:200,h:170,shape:'down',p:1},T:{a:.3,f:200,h:170,sl:50,sr:38},qt:QT(N70)+10});
  return{gen(c){sinus(c,jit(N70,.01),170,pm,vm);}};});

R('rvh','Sağ Ventrikül Hipertrofisi','Yapısal & Diğer',{rate:'Normal',pr:'Normal',qrs:'V1’de dominant R',qt:'—',
 desc:'Sağ ventrikül kitlesi artmıştır: sağ aks sapması, V1’de dominant R, V5–V6’da derin S ve sağ prekordiyal strain.',
 crit:['Sağ aks sapması (> +110°)','V1’de R/S > 1, R ≥ 7 mm','V5–V6’da derin S','V1–V3’te ST↓ / T negatifliği, P pulmonale'],
 clin:'Pulmoner hipertansiyon, pulmoner darlık, konjenital kalp hastalıkları ve kronik akciğer hastalığı.',
 leads:{V1:'Dominant R T↓',V2:'T↓',I:'S',V6:'Derin S',II:'Sivri P'}},
 ()=>{const pm=P({type:'pul'}),vm=V({axis:115,hax:70,qrsd:95,pscale:1.4,septA:.08,T:{a:.28,f:45,h:-40},qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('hypoth','Hipotermi (Osborn J Dalgası)','Yapısal & Diğer',{rate:'Bradikardi',pr:'Uzun',qrs:'J dalgası',qt:'Uzun',
 desc:'Vücut ısısı < 32 °C: QRS sonunda belirgin Osborn (J) dalgası, sinüs bradikardisi, uzamış intervaller ve titreme artefaktı.',
 crit:['J noktasında kubbe şeklinde pozitif çentik (Osborn dalgası)','Bradikardi, PR/QRS/QT uzaması','Titreme artefaktı','Isı düştükçe AF, VF ve asistoli riski'],
 clin:'Aktif ısıtma. Isı < 30 °C’de antiaritmik ve defibrilasyon etkinliği azalır — “ısınmadan ölü sayılmaz”.',
 leads:{II:'J dalgası',V3:'J dalgası',V4:'J dalgası',V5:'J dalgası'}},
 ()=>{const pm=P(),vm=V({qrsd:100,j:{a:.32,f:60,h:30},qt:540,T:{a:.25}});
  return{gen(c){sinus(c,jit(1500,.02),210,pm,vm);},base:(li,t)=>.045*hn((t/3|0)*31+li*977)*(.5+.5*Math.sin(TAU*t/5200+li*.3))};});

R('tamp','Perikardiyal Tamponad (Elektriksel Alternans)','Yapısal & Diğer',{rate:'Taşikardi',pr:'Normal',qrs:'Düşük voltaj, alternans',qt:'—',
 desc:'Büyük perikardiyal efüzyonda kalp sıvı içinde salınır: atımdan atıma değişen QRS amplitüdü, düşük voltaj ve sinüs taşikardisi.',
 crit:['Atımdan atıma QRS amplitüd alternansı','Düşük voltaj (ekstremite < 5 mm, göğüs < 10 mm)','Sinüs taşikardisi'],
 clin:'Beck triadı (hipotansiyon, juguler dolgunluk, derinden gelen kalp sesleri). Acil ekokardiyografi ve perikardiyosentez.',
 leads:{II:'Alternans',V2:'Alternans',V3:'Düşük voltaj',V4:'Alternans'}},
 ()=>{const pm=P({a:.6}),vm=V({amp:.45,pscale:1.4,T:{a:.13},qt:QT(520)});return{gen(c){sinus(c,jit(520,.01),140,pm,vm,c.n++%2?1:.55);}};});

R('dextro','Dekstrokardi','Yapısal & Diğer',{rate:'Normal',pr:'Normal',qrs:'Ters progresyon',qt:'Normal',
 desc:'Kalp sağ hemitoraksta: DI’de P, QRS ve T negatif; aVR pozitif; göğüs derivasyonlarında R amplitüdü V1’den V6’ya giderek azalır.',
 crit:['DI’de tüm dalgalar negatif','aVR’de pozitif P ve QRS','Ters R progresyonu, V6’da düşük voltaj','Elektrot ters takılmasından ayırt edin (göğüs derivasyonları burada belirleyici)'],
 clin:'Situs inversus (Kartagener sendromu) olabilir. Sağ göğüs derivasyonları (V1R–V6R) ile tekrar çekin.',
 leads:{I:'Tümü ters',aVR:'Pozitif',V1:'R ↑',V5:'R ↓',V6:'R ↓'}},
 ()=>{const pm=P({f:150}),vm=V({axis:150,hax:165,septF:-120,precGain:[1,.8,.55,.4,.3,.22],T:{a:.3,f:150,h:160},qt:QT(N70)});return{gen(c){sinus(c,jit(N70,.01),160,pm,vm);}};});

R('arvc','Aritmojenik Sağ Ventrikül Kardiyomiyopatisi','Yapısal & Diğer',{rate:'Normal',pr:'Normal',qrs:'V1–V3 epsilon',qt:'—',
 desc:'Sağ ventrikülde fibroyağlı doku: QRS sonunda küçük epsilon dalgaları, V1–V3’te T negatifliği ve LBBB morfolojili PVC’ler.',
 crit:['V1–V3’te epsilon dalgası (QRS sonunda küçük çentik)','V1–V3’te T negatifliği (> 14 yaş, RBBB yokken)','V1–V3’te terminal aktivasyon süresi ≥ 55 ms','LBBB morfolojili PVC / VT'],
 clin:'Genç sporcularda ani ölüm nedeni. Kardiyak MR, ICD değerlendirmesi ve yoğun egzersizden kaçınma.',
 leads:{V1:'ε T↓',V2:'ε T↓',V3:'T↓'}},
 ()=>{const ep=a=>[{k:0,c:106,s:6,a,q:1}];const pm=P(),vm=V({qrsd:105,tLead:{V1:-.2,V2:-.25,V3:-.18},extra:{V1:ep(.1),V2:ep(.09),V3:ep(.05)},qt:QT(N70)}),pv=M.pvcL();
  return{gen(c){if(c.n++%7===6){vbeat(c,c.t+160-330,pv);c.ev.push({t:c.t,m:pm});c.t+=N70;}else sinus(c,jit(N70,.01),160,pm,vm);}};});

R('erep','Erken Repolarizasyon (Benign)','Yapısal & Diğer',{rate:'Sıklıkla bradikardi',pr:'Normal',qrs:'J çentiği',qt:'Normal',
 desc:'Genç ve sporcularda sık: QRS sonunda J çentiği/çamurlaşması, konkav ST elevasyonu ve uzun T dalgaları; resiprokal çökme yok.',
 crit:['J noktasında çentik veya çamurlaşma (“balık kancası”)','Konkav ST↑ (genellikle V2–V5)','Uzun, asimetrik T dalgaları','Seri EKG’lerde değişmez'],
 clin:'Genellikle benign. İnferolateral yaygın J dalgaları + horizontal ST ise aritmik riskle ilişkili olabilir.',
 leads:{V2:'ST↑ J',V3:'ST↑ J',V4:'ST↑ J',V5:'J çentiği',II:'J çentiği'}},
 ()=>{const pm=P(),vm=V({j:{a:.15,f:60,h:40},st:{a:.12,f:55,h:45,shape:'flat'},T:{a:.42},qt:QT(1050)});return{gen(c){sinus(c,jit(1050,.02),160,pm,vm);}};});
