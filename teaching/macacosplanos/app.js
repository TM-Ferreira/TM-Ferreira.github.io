'use strict';
(() => {
  const $ = id => document.getElementById(id);
  // Três alvenarias HIPOTÉTICAS, inspiradas qualitativamente nos resultados
  // de Vicente et al. (2015) e Arêde et al. (2026). Os parâmetros NÃO foram
  // ajustados a curvas individuais nem constituem valores normativos.
  // Todas as tensões e módulos são introduzidos em MPa; extensões adimensionais.
  const SCENARIOS = Object.freeze({
    weak:   { label:'Alvenaria de qualidade reduzida', stress:0.53, C:0.210,
      Ebase:900, Eur:1900, epsSeat:.00055, sigmaSeat:.14, sigmaOnset:.65,
      epsCurve:.00300, sigmaRef:2.40 },
    normal: { label:'Alvenaria de qualidade intermédia', stress:0.78, C:0.160,
      Ebase:1900, Eur:3500, epsSeat:.00028, sigmaSeat:.19, sigmaOnset:1.15,
      epsCurve:.00155, sigmaRef:2.40 },
    strong: { label:'Alvenaria de boa qualidade', stress:0.94, C:0.110,
      Ebase:3100, Eur:4900, epsSeat:.00012, sigmaSeat:.25, sigmaOnset:1.80,
      epsCurve:.00068, sigmaRef:2.40 }
  });
  const cfg = {maxSingle:2.5,maxDouble:3.2,lg:300,maxRowsSingle:20,maxRowsDouble:50};
  const maxReadings = () => state.mode==='single'?cfg.maxRowsSingle:cfg.maxRowsDouble;
  const state = {mode:'single', stage:0, scenario:'normal', km:.84,ka:.88,records:[],lastPressure:0,maxSigma:0,checked:false,selectedToggle:0,focusModulus:'initial',autoSelect:{initial:true,secant:true,ur:true},validation:{initial:false,secant:false,ur:false}};
  const fmt = (x,n=3) => Number.isFinite(x) ? x.toLocaleString('pt-PT',{minimumFractionDigits:n,maximumFractionDigits:n}) : '—';
  const fixed = (x,n=5) => Number.isFinite(x) ? x.toFixed(n).replace('.',',') : '';
  const cleanNum = el => {
    const x=Number(String(el.value).trim().replace(',','.'));
    return Number.isFinite(x) ? x : NaN;
  };
  const htmlEscape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const material = () => SCENARIOS[state.scenario];
  const factor = () => state.km * state.ka;
  // Lei fenomenológica uniaxial CONTÍNUA para a primeira envolvente:
  // (i) acomodação inicial e fecho gradual de microfissuras,
  // (ii) troço de deformabilidade aproximadamente constante,
  // (iii) curvatura progressiva a partir da tensão sigmaOnset.
  // NÃO se simula resistência de pico, rotura, dano cíclico nem histerese.
  function envelope(sigma) {
    const m=material();
    const s=Math.max(0,sigma);
    const seat=m.epsSeat*(-Math.expm1(-s/m.sigmaSeat));
    const shifted=Math.max(0,(s-m.sigmaOnset)/(m.sigmaRef-m.sigmaOnset));
    return s/m.Ebase + seat + m.epsCurve*shifted*shifted;
  }
  // Descarga/recarga elásticas em torno do máximo anterior, com deformação
  // residual determinada pela envolvente; sem área de histerese artificial.
  function strainAt(sigma,maxSigma) {
    if(sigma>=maxSigma-1e-10) return envelope(sigma);
    return envelope(maxSigma) - (maxSigma-sigma)/material().Eur;
  }
  // Escala horizontal ajustada às leituras, para evitar esconder curvaturas
  // por causa de uma gama de tensão ainda não explorada pelo estudante.
  function chartStrainMax() {
    const full=envelope(factor()*cfg.maxDouble)*1000;
    if(state.records.length<2) return full*1.20;
    const measured=Math.max(...state.records.map(r=>r.eps*1000),0);
    return Math.max(full*.22,measured*1.23,.20);
  }
  // Ruído determinístico pequeno, para reprodutibilidade com os mesmos parâmetros.
  function perturb(n,g,pressure) {
    const h=Math.sin(n*29.417 + g*71.931 + pressure*13.13 + (state.scenario==='weak'?4:state.scenario==='strong'?9:2))*143758.5453;
    return 2*(h-Math.floor(h))-1;
  }
  function singleDelta(pressure,gauge,recordIndex) {
    const m=material(), compliance=m.C*[.97,1.01,1.045][gauge];
    return compliance*(factor()*pressure-m.stress)+.0026*perturb(recordIndex+1,gauge,pressure);
  }
  function currentValue() {
    if(state.stage<1) return null;
    const p=cleanNum($('pressure'));
    if(state.mode==='single'){
      return [0,1,2].reduce((a,g)=>a+singleDelta(p,g,state.records.length),0)/3;
    }
    const sigma=factor()*p;
    return cfg.lg * strainAt(sigma,state.maxSigma);
  }
  function setMsg(text) { $('statusMessage').textContent=text; }
  function setCheck(id,text,cls='') { const el=$(id);el.className='check-result '+cls;el.textContent=text; }
  function validatedParameters() {
    const km=cleanNum($('km')),ka=cleanNum($('ka'));
    if(!(km>=.70&&km<=1&&ka>=.70&&ka<=1)) {
      $('km').value=state.km.toFixed(2); $('ka').value=state.ka.toFixed(2);
      setMsg('Introduza coeficientes entre 0,70 e 1,00. Foram mantidos os valores anteriores.');
      return false;
    }
    state.km=km;state.ka=ka;return true;
  }
  function reset(message=true) {
    state.stage=0;state.records=[];state.lastPressure=0;state.maxSigma=0;state.checked=false;state.autoSelect={initial:true,secant:true,ur:true};state.validation={initial:false,secant:false,ur:false};
    $('pressure').value='0';$('pressure').disabled=true;
    $('cutBtn').disabled=false;$('jackBtn').disabled=true;$('saveBtn').disabled=true;
    $('studentPr').value='';$('studentSigma').value='';['studentInitial','studentSecant','studentUR'].forEach(id=>$(id).value='');resetModulusFeedback();
    setCheck('singleFeedback','A verificação fica disponível após leituras que enquadrem o retorno a Δd = 0.');
    setCheck('doubleFeedback','Registe patamares de carregamento e uma descarga ou recarga para comparar os três módulos.');
    $('status').textContent='Preparação';
    if(message) setMsg('Ensaio reiniciado. Execute o rasgo para começar.');
    render();
  }
  function changeMode(mode){
    state.mode=mode;
    $('tabSingle').classList.toggle('active',mode==='single');
    $('tabDouble').classList.toggle('active',mode==='double');
    $('tabSingle').setAttribute('aria-selected',mode==='single');
    $('tabDouble').setAttribute('aria-selected',mode==='double');
    $('singleAssessment').hidden=mode!=='single'; $('doubleAssessment').hidden=mode!=='double';
    $('testKicker').textContent=mode==='single'?'ENSAIO DE MACACO PLANO SIMPLES':'ENSAIO DE MACACOS PLANOS DUPLOS';
    $('analysisTitle').textContent=mode==='single'?'Tensão instalada na alvenaria':'Comparação de módulos de elasticidade';
    $('plotTitle').textContent=mode==='single'?'Variação de distância e pressão':'Tensão e deformação da alvenaria';
    $('measuredLabel').textContent=mode==='single'?'Variação média dos pontos':'Encurtamento entre marcas';
    $('modeNote').textContent=mode==='single'?'A pressão aplicada não coincide necessariamente com a tensão instalada na parede.':'A deformação é calculada a partir do encurtamento medido entre marcas com distância inicial de 300 mm.';
    $('scienceNoteText').textContent=mode==='single'?'A tensão estimada é local, correspondente ao pano de alvenaria instrumentado. A idealização não reproduz a distribuição tridimensional das tensões.':'O modelo distingue acomodação inicial, regime aproximadamente elástico e deformação progressivamente não linear. Os ciclos têm descarga e recarga lineares, sem histerese nem previsão de rotura.';
    $('plotFootnote').textContent=mode==='single'?'Δd < 0 indica aproximação dos pontos relativamente à geometria inicial. O cruzamento com zero corresponde à restituição.':'Deformação de compressão positiva. Escala horizontal adaptativa. A curva pode mostrar acomodação inicial, maior rigidez intermédia e não linearidade acentuada.';
    $('pressure').max=mode==='single'?cfg.maxSingle:cfg.maxDouble;
    $('maxPressureLabel').textContent=mode==='single'?'0 a 2,50 MPa':'0 a 3,20 MPa';
    reset(false);setMsg(mode==='single'?'Execute o rasgo para observar a aproximação dos pontos.':'Execute os dois rasgos para instrumentar o troço de alvenaria.');
  }
  function performCut(){
    if(state.stage!==0)return;
    state.stage=1;$('cutBtn').disabled=true;$('jackBtn').disabled=false;$('status').textContent='Rasgo aberto';
    setMsg(state.mode==='single'?'A distância entre as marcas diminuiu após a abertura do rasgo. Introduza o macaco plano.':'Foram executados dois rasgos. Introduza os macacos planos para iniciar o carregamento.');
    render();
  }
  function insertJack(){
    if(state.stage!==1)return;
    state.stage=2;$('jackBtn').disabled=true;$('pressure').disabled=false;$('saveBtn').disabled=false;$('status').textContent='A adquirir';
    setMsg('Ajuste a pressão e registe patamares. Comece por p = 0,00 MPa. Pode voltar a diminuir a pressão para simular uma descarga.');
    render();
  }
  function record(){
    if(state.stage!==2)return;
    if(state.records.length>=maxReadings()){setMsg('Foram atingidas '+maxReadings()+' leituras. Exporte o conjunto ou limpe as leituras para uma nova série.');return;}
    const p=cleanNum($('pressure'));
    if(!Number.isFinite(p) || p<0 || p>Number($('pressure').max)){setMsg('Pressão inválida.');return;}
    const n=state.records.length;
    if(state.mode==='single'){
      const gauges=[0,1,2].map(g=>singleDelta(p,g,n));
      const mean=gauges.reduce((a,b)=>a+b,0)/3;
      state.records.push({n:n+1,p, gauges,mean,phase:'Restituição'});
    }else{
      const sigma=factor()*p;
      const prev=state.records.length?state.records[state.records.length-1].p:0;
      const oldMax=state.maxSigma;
      const phase=n===0?'Inicial':p<prev-1e-9?'Descarga':p>prev+1e-9&&sigma<=oldMax+1e-9?'Recarga':sigma>oldMax+1e-9?'Carregamento':'Estabilização';
      const epsilon = strainAt(sigma,oldMax);
      // Ruído de leitura de deslocamentos apenas; a lei interna não muda.
      const delta = cfg.lg*epsilon + .0005*perturb(n+1,4,p);
      state.records.push({n:n+1,p,sigma,eps:delta/cfg.lg,delta,phase});
      state.maxSigma=Math.max(state.maxSigma,sigma);
      state.lastPressure=p;
    }
    state.checked=false;
    setMsg('Leitura '+(n+1)+' registada. Pode ajustar a pressão e acrescentar outro patamar.');
    if(state.records.length>=maxReadings())$('saveBtn').disabled=true;
    render();
  }
  function pressureRoot(){
    if(state.mode!=='single')return null;
    // Seleção dos valores imediatamente abaixo e acima de zero minimiza o erro de interpolação.
    const neg=state.records.filter(r=>r.mean<=0).sort((a,b)=>b.mean-a.mean)[0];
    const pos=state.records.filter(r=>r.mean>=0).sort((a,b)=>a.mean-b.mean)[0];
    if(!neg||!pos)return null;
    if(Math.abs(neg.mean)<1e-12)return {pr:neg.p,neg,pos};
    if(Math.abs(pos.mean)<1e-12)return {pr:pos.p,neg,pos};
    if(Math.abs(pos.mean-neg.mean)<1e-12)return null;
    const pr=neg.p+(pos.p-neg.p)*(-neg.mean)/(pos.mean-neg.mean);
    if(!Number.isFinite(pr) || pr<0 || pr>cfg.maxSingle)return null;
    return {pr,neg,pos};
  }
  function checkSingle(){
    const root=pressureRoot();if(!root){setCheck('singleFeedback','Ainda não existem leituras dos dois lados de Δd = 0. Registe um patamar com Δd negativo e outro positivo.','warn');return;}
    const pr=cleanNum($('studentPr')),sigma=cleanNum($('studentSigma'));
    if(!Number.isFinite(pr)||!Number.isFinite(sigma)||pr<=0||sigma<=0){setCheck('singleFeedback','Introduza valores numéricos positivos para a pressão de restituição e a tensão instalada.','warn');return;}
    const expectedSigma=factor()*pr;
    const timingOk=Math.abs(pr-root.pr)<=Math.max(.03,.025*root.pr);
    const arithmeticOk=Math.abs(sigma-expectedSigma)<=Math.max(.02,.02*expectedSigma);
    const measSigma=factor()*root.pr;
    const actual=material().stress;
    state.checked=true;
    if(timingOk&&arithmeticOk){setCheck('singleFeedback',`Correto. Interpolação dos dados: pᵣ ≈ ${fmt(root.pr,3)} MPa. Tensão correspondente ≈ ${fmt(measSigma,3)} MPa. Referência interna do modelo: ${fmt(actual,3)} MPa. A diferença residual decorre do ruído sintético.`, 'good');}
    else if(!timingOk&&arithmeticOk){setCheck('singleFeedback',`A aplicação de σ₀ = Kₘ Kₐ pᵣ está correta, mas reveja a interpolação da pressão de restituição. Os dois patamares mais próximos de Δd = 0 conduzem a aproximadamente ${fmt(root.pr,3)} MPa.`, 'warn');}
    else if(timingOk&&!arithmeticOk){setCheck('singleFeedback',`A pressão de restituição foi bem estimada. Reveja a correção da pressão: σ₀ = ${fmt(state.km,2)} × ${fmt(state.ka,2)} × pᵣ.`, 'warn');}
    else {setCheck('singleFeedback','Verifique separadamente a interpolação de pᵣ e a aplicação dos fatores Kₘ e Kₐ.','bad');}
  }
  function resetModulusFeedback(){
    ['initial','secant','ur'].forEach(k=>setCheck(k+'Feedback','Introduza o módulo calculado para verificar a resposta.'));
    if($('moduliSummary'))$('moduliSummary').hidden=true;
  }
  // Segmentos são definidos pelas inversões de sentido da tensão, não por rótulos soltos.
  // O extremo de uma fase é partilhado com a fase seguinte; não é permitido atravessar a inversão.
  function loadingSegments(){
    const R=state.records,segments=[];
    let active=null,hasUnloaded=false,oldPeak=-Infinity;
    for(let i=0;i<R.length;i++){
      if(i===0){oldPeak=R[0].sigma;continue;}
      const difference=R[i].sigma-R[i-1].sigma;
      if(Math.abs(difference)<1e-8){oldPeak=Math.max(oldPeak,R[i].sigma);continue;}
      let kind;
      if(difference<0){kind='unload';hasUnloaded=true;}
      else if(!hasUnloaded)kind='initial';
      else if(R[i].sigma<=oldPeak+1e-8)kind='reload';
      else kind='envelope';
      if(!active||active.kind!==kind){active={kind,indices:[i-1,i]};segments.push(active);}
      else if(!active.indices.includes(i))active.indices.push(i);
      oldPeak=Math.max(oldPeak,R[i].sigma);
    }
    return segments;
  }
  function onEnvelopeRecords(){
    let top=-Infinity;
    return state.records.filter(r=>{
      const onEnvelope=r.sigma>top+1e-8 && r.sigma>1e-8;
      top=Math.max(top,r.sigma);
      return onEnvelope;
    });
  }
  // Índices comparáveis aos da Figura 12 de Arêde et al. (2026):
  // σmax = máximo EFECTIVAMENTE registado, nunca resistência inferida.
  // ε nos 10, 30 e 60% é interpolada na envolvente da primeira carga.
  function referenceIndices(){
    const en=onEnvelopeRecords().filter(r=>r.sigma>0).sort((a,b)=>a.sigma-b.sigma);
    if(en.length<3)return null;
    const pts=[{sigma:0,eps:0},...en], peak=pts[pts.length-1].sigma;
    if(peak<.10)return null;
    const epsAt=ratio=>{
      const target=peak*ratio;
      for(let i=1;i<pts.length;i++){
        const a=pts[i-1],b=pts[i];
        if(b.sigma>=target-1e-10){
          return a.eps+(target-a.sigma)*(b.eps-a.eps)/(b.sigma-a.sigma);
        }
      }
      return NaN;
    };
    const e10=epsAt(.1),e30=epsAt(.3),e60=epsAt(.6);
    const A=peak*.1/e10/1000,B=peak*.3/e30/1000,C=peak*.3/(e60-e30)/1000;
    return [A,B,C].every(x=>Number.isFinite(x)&&x>0)?{peak,A,B,C}:null;
  }
  function updateReferenceIndices(){
    const r=referenceIndices(),el=$('referenceIndicesResults');
    el.innerHTML=r?`<table><thead><tr><th>Módulo</th><th>Valor interpolado</th></tr></thead><tbody><tr><td>E₀, secante a 10% de σmáx</td><td>${fmt(r.A,3)} GPa</td></tr><tr><td>Esec,30%, secante a 30%</td><td>${fmt(r.B,3)} GPa</td></tr><tr><td>Esec,30 a 60%, corda</td><td>${fmt(r.C,3)} GPa</td></tr></tbody></table><p>σmáx registada = ${fmt(r.peak,3)} MPa. Estimativas obtidas por interpolação linear entre os patamares da envolvente. Não representam necessariamente os módulos que seriam medidos num ensaio real.</p>`:
      '<p>Registe pelo menos três níveis crescentes de tensão para obter os índices de referência.</p>';
  }
  function selectedModulus(kind){
    const r=state.records;
    if(kind==='secant'){
      const pt=r.find(v=>String(v.n)===$('secantPoint').value);
      if(!pt||!onEnvelopeRecords().includes(pt)||pt.eps<=1e-8)return null;
      const E=pt.sigma/pt.eps/1000;
      return E>0&&Number.isFinite(E)?{kind,E,A:null,B:pt,ds:pt.sigma,de:pt.eps,source:'Origem até leitura '+pt.n}:null;
    }
    const aa=$(kind==='initial'?'initialA':'urA').value,bb=$(kind==='initial'?'initialB':'urB').value;
    if(!aa||!bb||aa===bb)return null;
    const A=r.find(x=>String(x.n)===aa),B=r.find(x=>String(x.n)===bb);
    if(!A||!B)return null;
    const segments=loadingSegments();
    const permissible=kind==='initial'?segments.filter(x=>x.kind==='initial'):segments.filter(x=>['unload','reload'].includes(x.kind));
    if(!permissible.some(seg=>seg.indices.includes(A.n-1)&&seg.indices.includes(B.n-1)))return null;
    const ds=B.sigma-A.sigma,de=B.eps-A.eps;
    if(Math.abs(ds)<1e-8||Math.abs(de)<1e-9)return null;
    const E=ds/de/1000;
    return Number.isFinite(E)&&E>0?{kind,E,A,B,ds,de,source:'Leituras '+A.n+' a '+B.n}:null;
  }
  function updateModulusInputs(){
    const label=r=>`Leitura ${r.n} · p = ${fmt(r.p,2)} MPa`;
    const options=r=>'<option value="">Selecione uma leitura</option>'+r.map(x=>`<option value="${x.n}">${htmlEscape(label(x))}</option>`).join('');
    const segs=loadingSegments(),first=segs.find(x=>x.kind==='initial');
    const initial=first?first.indices.map(i=>state.records[i]):[];
    const en=onEnvelopeRecords();
    // Em fase de descarga/recarga, as opções incluem pontos de inversão, pertencentes a dois segmentos.
    const urOptions=segs.filter(x=>['unload','reload'].includes(x.kind)).flatMap(seg=>seg.indices.map(i=>state.records[i]));
    const uniqueUR=[...new Map(urOptions.map(r=>[r.n,r])).values()].sort((a,b)=>a.n-b.n);
    const pairs=[['initialA',initial],['initialB',initial],['secantPoint',en],['urA',uniqueUR],['urB',uniqueUR]];
    const old={};pairs.forEach(([id])=>old[id]=$(id).value);
    pairs.forEach(([id,list])=>{$(id).innerHTML=options(list);if(list.some(r=>String(r.n)===old[id]))$(id).value=old[id];});
    if(state.autoSelect.initial&&initial.length>=2){$('initialA').value=String(initial[0].n);$('initialB').value=String(initial[Math.min(2,initial.length-1)].n);}
    if(state.autoSelect.secant&&en.length){$('secantPoint').value=String(en[en.length-1].n);}
    const unSegment=segs.find(seg=>['unload','reload'].includes(seg.kind)&&seg.indices.length>=2);
    if(state.autoSelect.ur&&unSegment){$('urA').value=String(state.records[unSegment.indices[0]].n);$('urB').value=String(state.records[unSegment.indices[unSegment.indices.length-1]].n);}
    updateModulusDescriptions();
    updateReferenceIndices();
  }
  function updateModulusDescriptions(){
    for(const [kind,id] of [['initial','initialInterval'],['secant','secantInterval'],['ur','urInterval']]){
      const m=selectedModulus(kind);
      $(id).innerHTML=m?`Δσ = <b>${fmt(Math.abs(m.ds),4)} MPa</b> · Δε = <b>${fmt(Math.abs(m.de)*1000,5)} ‰</b><br>${htmlEscape(m.source)}. Calcule E [GPa] = (Δσ/Δε)/1000.`:
        kind==='initial'?'Selecione dois patamares distintos do primeiro carregamento crescente.':kind==='secant'?'Selecione um ponto da envolvente com tensão positiva.':'Selecione dois patamares do mesmo trecho contínuo de descarga ou recarga.';
    }
  }
  function selectModulus(kind){
    state.focusModulus=kind;
    ['initial','secant','ur'].forEach(k=>{const id=k==='initial'?'focusInitial':k==='secant'?'focusSecant':'focusUR';$(id).classList.toggle('active',k===kind);$(id).setAttribute('aria-pressed',String(k===kind));});
    drawChart();
  }
  function getComputedModuli(){return {initial:selectedModulus('initial'),secant:selectedModulus('secant'),ur:selectedModulus('ur')};}
  function verifyModuli(){
    const computed=getComputedModuli();
    const inputs={initial:'studentInitial',secant:'studentSecant',ur:'studentUR'};
    const names={initial:'E inicial',secant:'E sec',ur:'E ur'};
    let success=0;
    for(const kind of ['initial','secant','ur']){
      const m=computed[kind],value=cleanNum($(inputs[kind]));
      if(!m){setCheck(kind+'Feedback','Os pontos escolhidos não definem um intervalo válido deste tipo. Reveja a seleção.','warn');state.validation[kind]=false;continue;}
      if(!Number.isFinite(value)||value<=0){setCheck(kind+'Feedback','Introduza um valor positivo em GPa.','warn');state.validation[kind]=false;continue;}
      const good=Math.abs(value-m.E)<=Math.max(.04,.025*m.E);
      state.validation[kind]=good;
      if(good){success++;setCheck(kind+'Feedback',`${names[kind]} correto: ${fmt(m.E,3)} GPa. ${m.source}.`,'good');}
      else setCheck(kind+'Feedback',`Reveja a relação Δσ / Δε e a conversão de MPa para GPa. Para o intervalo escolhido: ${fmt(m.E,3)} GPa.`,'warn');
    }
    if(success===3){
      setCheck('doubleFeedback','Os três resultados estão corretos. Compare a rigidez no início do carregamento, a secante à origem e a rigidez na descarga ou recarga.','good');
      const {initial,secant,ur}=computed;
      $('moduliSummary').hidden=false;
      $('moduliSummary').innerHTML=`<h3>Comparação das estimativas</h3><div class="summary-tiles"><div><small>E<sub>inicial</sub></small><strong>${fmt(initial.E,3)} GPa</strong></div><div><small>E<sub>sec</sub></small><strong>${fmt(secant.E,3)} GPa</strong></div><div><small>E<sub>ur</sub></small><strong>${fmt(ur.E,3)} GPa</strong></div></div><p>E<sub>ur</sub> / E<sub>inicial</sub> = <b>${fmt(ur.E/initial.E,2)}</b> · E<sub>sec</sub> / E<sub>inicial</sub> = <b>${fmt(secant.E/initial.E,2)}</b>. Estas razões caracterizam apenas os intervalos selecionados.</p>`;
    }else { $('moduliSummary').hidden=true;setCheck('doubleFeedback',`${success} de 3 módulos verificados. Cada estimativa exige pontos adequados ao ramo considerado.`,success?'warn':''); }
  }
  function svgWall(){
    const isSingle=state.mode==='single';
    const bricks=[];const x0=126,y0=46,w=420,h=244;
    for(let row=0;row<8;row++){
      let xx=x0-(row%2?31:0);
      while(xx<x0+w){const bw=72+(row*7%4)*5;const bx=Math.max(x0,xx),xEnd=Math.min(x0+w,xx+bw);if(xEnd>bx+3){const shade=(row*5+Math.round(xx))%3;const fill=['#b6b7b0','#a9aaa3','#c1bfb4'][Math.abs(shade)];bricks.push(`<rect x="${bx}" y="${y0+row*30+1}" width="${xEnd-bx-2}" height="28" rx="2" fill="${fill}" stroke="#8a8c87" stroke-width="1.1"/>`);}xx+=bw;}
    }
    const upper=101,lower=225,mid=164;
    const dd=currentValue();
    const displacement=isSingle?Math.max(-16,Math.min(16, -(dd||0)*85)):Math.max(-16,Math.min(16,(dd||0)*42));
    const upperMarker=isSingle?122+displacement/2:128+displacement/2;
    const lowerMarker=isSingle?212-displacement/2:210-displacement/2;
    const slot=at => `<rect x="200" y="${at}" width="274" height="7" rx="2" fill="${state.stage>=1?'#35383b':'#999a92'}"/>`;
    const jack=at=>`<g><rect x="211" y="${at-1}" width="252" height="8" rx="4" fill="#18abc9" stroke="#006f8b" stroke-width="1.5"/><path d="M463 ${at+3}H576V${at+20}H605" fill="none" stroke="#15799a" stroke-width="3"/></g>`;
    const gages= isSingle?`
      <g><line x1="160" y1="${upperMarker}" x2="160" y2="${lowerMarker}" stroke="#4d7688" stroke-width="3"/><circle cx="160" cy="${upperMarker}" r="6" fill="#f5ae56" stroke="#fff" stroke-width="2"/><circle cx="160" cy="${lowerMarker}" r="6" fill="#f5ae56" stroke="#fff" stroke-width="2"/><path d="M154 ${upperMarker}h-10m10 ${lowerMarker-upperMarker}h-10" stroke="#334d5f" stroke-width="2"/><text x="149" y="106" text-anchor="middle" class="wall-label">Marcas de medição</text></g>`:`<g><line x1="178" y1="${upperMarker}" x2="178" y2="${lowerMarker}" stroke="#4e7d8f" stroke-width="3"/><circle cx="178" cy="${upperMarker}" r="6" fill="#f5ae56" stroke="white" stroke-width="2"/><circle cx="178" cy="${lowerMarker}" r="6" fill="#f5ae56" stroke="white" stroke-width="2"/><path d="M164 ${upperMarker}h10m-10 ${lowerMarker-upperMarker}h10" stroke="#355a6a" stroke-width="1"/><text x="177" y="117" class="wall-label" text-anchor="middle">Base 300 mm</text></g>`;
    const dash=`<g><rect x="566" y="265" width="112" height="46" rx="5" fill="#395263"/><text x="622" y="281" font-size="10" fill="#d5e9ed" text-anchor="middle">PRESSÃO</text><text x="622" y="300" font-size="15" fill="white" font-weight="bold" text-anchor="middle">${fmt(cleanNum($('pressure')),2)} MPa</text></g>`;
    const jacks=state.stage===2 ? (isSingle?jack(mid):jack(upper)+jack(lower)) : '';
    const slots=state.stage>=1?(isSingle?slot(mid):slot(upper)+slot(lower)):'';
    const label=isSingle?'Macaco plano simples':'Macacos planos duplos';
    const additional=isSingle?'<text x="340" y="330" class="wall-label" text-anchor="middle">Rasgo único · medição da restituição</text>':'<text x="340" y="330" class="wall-label" text-anchor="middle">Dois rasgos · compressão do troço entre macacos</text>';
    $('wallSvg').innerHTML=`<style>.wall-label{font:11px Arial,sans-serif;fill:#476575}.wall-title{font:bold 12px Arial,sans-serif;fill:#3b5c6d}</style>
      <rect x="100" y="41" width="452" height="251" rx="3" fill="#c2c3bc"/><g>${bricks.join('')}</g>
      <rect x="100" y="41" width="452" height="251" rx="3" fill="none" stroke="#7e898c" stroke-width="2"/>
      ${gages}${slots}${jacks}
      <text x="328" y="28" class="wall-title" text-anchor="middle">${label}</text>
      <path d="M554 196h46m-46-6v12m46-12v12" stroke="#6992a1" stroke-width="1.6"/>
      <text x="607" y="187" class="wall-label">Ligação</text><text x="607" y="200" class="wall-label">hidráulica</text>
      ${dash}${additional}`;
  }
  function drawChart(){
    const svg=$('plot'), w=720,h=350,left=77,right=26,top=29,bottom=65,pw=w-left-right,ph=h-top-bottom;
    const isSingle=state.mode==='single', pmax=isSingle?cfg.maxSingle:factor()*cfg.maxDouble;
    let xmin,xmax,ymin,ymax,xLabel,yLabel;
    if(isSingle){xmin=0;xmax=cfg.maxSingle;ymin=Math.min(-.24,-material().C*material().stress*1.18);ymax=Math.max(.24,material().C*(factor()*cfg.maxSingle-material().stress)*1.18);xLabel='Pressão hidráulica, p [MPa]';yLabel='Variação média, Δd [mm]';}
    else {xmin=0;xmax=chartStrainMax();ymin=0;ymax=Math.max(.6,pmax*1.18);xLabel='Deformação, ε [‰]';yLabel='Tensão, σ [MPa]';}
    const xs=x=>left+(x-xmin)/(xmax-xmin)*pw;
    const ys=y=>top+ph-(y-ymin)/(ymax-ymin)*ph;
    const f=(x,d=1)=>Number(x).toFixed(d).replace('.',',');
    let out=`<text x="${w/2}" y="17" class="chart-caption" text-anchor="middle">${isSingle?'Ensaio simples · restituição':'Ensaio duplo · curva experimental'}</text>`;
    for(let i=0;i<=5;i++){
      const x=xmin+(xmax-xmin)*i/5,px=xs(x),y=ymin+(ymax-ymin)*i/5,py=ys(y);
      out+=`<line x1="${px}" x2="${px}" y1="${top}" y2="${top+ph}" class="chart-grid"/><text x="${px}" y="${top+ph+21}" text-anchor="middle" class="chart-label">${f(x,isSingle?2:xmax<1?3:xmax<3?2:1)}</text>`;
      out+=`<line x1="${left}" x2="${left+pw}" y1="${py}" y2="${py}" class="chart-grid"/><text x="${left-10}" y="${py+4}" text-anchor="end" class="chart-label">${f(y,2)}</text>`;
    }
    out+=`<line x1="${left}" x2="${left}" y1="${top}" y2="${top+ph}" class="chart-axis"/><line x1="${left}" x2="${left+pw}" y1="${top+ph}" y2="${top+ph}" class="chart-axis"/>`;
    out+=`<text x="${left+pw/2}" y="${h-8}" text-anchor="middle" class="chart-label">${xLabel}</text><text x="18" y="${top+ph/2}" text-anchor="middle" transform="rotate(-90 18 ${top+ph/2})" class="chart-label">${yLabel}</text>`;
    if(isSingle){out+=`<line x1="${left}" x2="${left+pw}" y1="${ys(0)}" y2="${ys(0)}" stroke="#c69550" stroke-width="2" stroke-dasharray="6 5"/>`;}
    const pts=state.records.map(r=>[xs(isSingle?r.p:r.eps*1000),ys(isSingle?r.mean:r.sigma)]);
    if(pts.length>1)out+=`<polyline points="${pts.map(p=>p.map(x=>x.toFixed(2)).join(',')).join(' ')}" fill="none" stroke="#00a6ce" stroke-width="2.5" stroke-linejoin="round"/>`;
    const activeModulus=isSingle?null:selectedModulus(state.focusModulus);
    const targets=activeModulus?[activeModulus.A?.n,activeModulus.B?.n].filter(Boolean):[];
    // Realçar apenas a reta relativa ao módulo atualmente selecionado.
    if(activeModulus){
      const a=activeModulus.A?[xs(activeModulus.A.eps*1000),ys(activeModulus.A.sigma)]:[xs(0),ys(0)];
      const b=[xs(activeModulus.B.eps*1000),ys(activeModulus.B.sigma)];
      const hue=state.focusModulus==='initial'?'#00a6ce':state.focusModulus==='secant'?'#546ea2':'#c48a40';
      out+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${hue}" stroke-width="4.5" stroke-dasharray="7 4" stroke-linecap="round"/>`;
      if(!activeModulus.A)out+=`<circle cx="${a[0]}" cy="${a[1]}" r="5" fill="${hue}" stroke="white" stroke-width="2"/>`;
    }
    state.records.forEach((r,i)=>{
      const [x,y]=pts[i];const active=!isSingle&&targets.includes(r.n);
      out+=`<circle class="chart-point${active?' active':''}" cx="${x}" cy="${y}" r="${active?7:5}" data-point="${r.n}" tabindex="0" role="button" aria-label="Selecionar ponto ${r.n}"><title>Leitura ${r.n}: p=${fmt(r.p,3)} MPa</title></circle>`;
    });
    if(isSingle){const root=pressureRoot();if(root){const xx=xs(root.pr);out+=`<line x1="${xx}" x2="${xx}" y1="${top+ph}" y2="${ys(0)}" stroke="#c28a3d" stroke-width="1.8" stroke-dasharray="4 4"/><text x="${Math.min(xx+10,600)}" y="${ys(0)-9}" class="chart-label">pᵣ (interpolação)</text>`;}}
    if(pts.length===0)out+=`<text x="${left+pw/2}" y="${top+ph/2}" text-anchor="middle" class="chart-label">Registe leituras para construir o gráfico.</text>`;
    svg.innerHTML=out;
    svg.querySelectorAll('[data-point]').forEach(el=>{
      function select(){
        if(state.mode!=='double')return;
        const id=el.getAttribute('data-point'),kind=state.focusModulus;
        const targets=kind==='initial'?['initialA','initialB']:kind==='ur'?['urA','urB']:['secantPoint'];
        const target=targets.length===1?targets[0]:targets[state.selectedToggle%2];
        if([...$(target).options].some(o=>o.value===id)){
          $(target).value=id;
          if(targets.length===2)state.selectedToggle=(state.selectedToggle+1)%2;
          state.autoSelect[kind]=false;
          state.validation[kind]=false;
          $('moduliSummary').hidden=true;
          setCheck(kind+'Feedback','A seleção mudou. Volte a verificar o cálculo.');
          updateModulusDescriptions();drawChart();
        }else setCheck('doubleFeedback','Este ponto não pertence ao trecho adequado para o módulo destacado.','warn');
      }
      el.addEventListener('click',select);
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    });
  }
  function renderTable(){
    if(state.mode==='single'){$('tableHead').innerHTML='<tr><th>Leitura</th><th>p (MPa)</th><th>Δd médio (mm)</th><th>Marcas 1, 2 e 3 (mm)</th></tr>';}
    else{$('tableHead').innerHTML='<tr><th>Leitura</th><th>Fase</th><th>p (MPa)</th><th>Encurt. (mm)</th><th>σ (MPa)</th><th>ε (‰)</th></tr>';}
    $('tableBody').innerHTML=state.records.length?state.records.map(r=>state.mode==='single'
      ?`<tr><td>${r.n}</td><td>${fmt(r.p,3)}</td><td>${fmt(r.mean,4)}</td><td>${r.gauges.map(v=>fmt(v,4)).join(' · ')}</td></tr>`
      :`<tr><td>${r.n}</td><td>${htmlEscape(r.phase)}</td><td>${fmt(r.p,3)}</td><td>${fmt(r.delta,4)}</td><td>${fmt(r.sigma,3)}</td><td>${fmt(r.eps*1000,4)}</td></tr>`).join('')
      :`<tr><td colspan="${state.mode==='single'?4:6}" class="empty">Ainda não existem leituras.</td></tr>`;
    $('counter').textContent=state.records.length+' / '+maxReadings()+' '+(state.records.length===1?'leitura':'leituras');
  }
  function render(){
    svgWall();
    $('pressureValue').innerHTML=fmt(cleanNum($('pressure')),2)+' <span>MPa</span>';
    const v=currentValue();$('measuredValue').innerHTML=v===null?'—':fmt(v,4)+' <span>mm</span>';
    $('saveBtn').disabled=state.stage!==2||state.records.length>=maxReadings();
    renderTable();if(state.mode==='double')updateModulusInputs();drawChart();
  }
  function downloadCSV(){
    if(!state.records.length){setMsg('Registe pelo menos uma leitura antes de exportar os dados.');return;}
    const single=state.mode==='single';
    const lines=single?['leitura;pressao_MPa;distancia_media_mm;marca_1_mm;marca_2_mm;marca_3_mm'] : ['leitura;fase;pressao_MPa;tensao_MPa;encurtamento_mm;deformacao_adimensional'];
    state.records.forEach(r=>lines.push(single?[r.n,fixed(r.p,4),fixed(r.mean,6),...r.gauges.map(v=>fixed(v,6))].join(';'):[r.n,r.phase,fixed(r.p,4),fixed(r.sigma,6),fixed(r.delta,6),fixed(r.eps,8)].join(';')));
    const blob=new Blob(['\ufeff'+lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='FUNDEC_macacos_planos_'+(single?'simples':'duplos')+'.csv';
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function printGraphWithAllModuli(mods){
    if(state.mode==='single')return $('plot').innerHTML;
    // Mesma geometria de eixos do gráfico interativo. Imprime os três intervalos selecionados.
    const w=720,left=77,right=26,top=29,bottom=65,h=350;
    const xmax=chartStrainMax();
    const ymax=Math.max(.6,factor()*cfg.maxDouble*1.18);
    const x=e=>left+e*1000/xmax*(w-left-right);
    const y=t=>top+(h-top-bottom)*(1-t/ymax);
    let base=$('plot').innerHTML;
    // O gráfico do ecrã tem só a reta ativa. As três são desenhadas de novo no relatório.
    const additions=[['initial','#00a6ce'],['secant','#546ea2'],['ur','#c48a40']].map(([kind,color])=>{
      const m=mods[kind];if(!m)return '';
      const A=m.A??{eps:0,sigma:0},B=m.B;
      return `<line x1="${x(A.eps)}" y1="${y(A.sigma)}" x2="${x(B.eps)}" y2="${y(B.sigma)}" stroke="${color}" stroke-width="4" stroke-dasharray="7 3" stroke-linecap="round"/>`;
    }).join('');
    return base+additions;
  }
  function generateReport(){
    if(!state.records.length){setMsg('Registe pelo menos uma leitura antes de gerar o relatório.');return;}
    const single=state.mode==='single';const root=pressureRoot(),mods=getComputedModuli(),standard=single?null:referenceIndices();
    const name=htmlEscape($('testName').value.trim()||'Ensaio virtual de alvenaria');
    const date=new Date().toLocaleDateString('pt-PT',{day:'2-digit',month:'long',year:'numeric'});
    const rows=state.records.map(r=>single?`<tr><td>${r.n}</td><td>${fmt(r.p,3)}</td><td>${fmt(r.mean,4)}</td><td>${r.gauges.map(g=>fmt(g,4)).join(' / ')}</td></tr>`:`<tr><td>${r.n}</td><td>${htmlEscape(r.phase)}</td><td>${fmt(r.p,3)}</td><td>${fmt(r.sigma,3)}</td><td>${fmt(r.delta,4)}</td><td>${fmt(r.eps*1000,4)}</td></tr>`).join('');
    const header=single?'<tr><th>N.º</th><th>p (MPa)</th><th>Δd médio (mm)</th><th>Marcas 1 / 2 / 3 (mm)</th></tr>':'<tr><th>N.º</th><th>Fase</th><th>p (MPa)</th><th>σ (MPa)</th><th>ΔL (mm)</th><th>ε (‰)</th></tr>';
    const measures=single?`<div><small>Pressão de restituição estimada</small><strong>${root?fmt(root.pr,3)+' MPa':'Não determinada'}</strong></div><div><small>Tensão instalada estimada</small><strong>${root?fmt(root.pr*factor(),3)+' MPa':'Não determinada'}</strong></div><div><small>Leituras adquiridas</small><strong>${state.records.length}</strong></div>`:`<div><small>Distância inicial entre marcas</small><strong>300 mm</strong></div><div><small>Estimativa E inicial</small><strong>${mods.initial?fmt(mods.initial.E,3)+' GPa':'Não disponível'}</strong></div><div><small>Leituras adquiridas</small><strong>${state.records.length}</strong></div>`;
    const note=single?'A pressão de restituição é obtida por interpolação entre as leituras mais próximas de Δd = 0. A tensão de compressão estimada é Kₘ × Kₐ × pᵣ.':'A tensão é calculada por Kₘ × Kₐ × p e a deformação por ΔL / 300 mm. A envolvente sintética inclui acomodação inicial, região aproximadamente elástica e curvatura progressiva. E inicial: declive entre dois pontos do primeiro carregamento. E sec: declive da origem até um ponto da envolvente. E ur: declive entre dois pontos do mesmo trecho de descarga ou recarga.';
    const disclaimer='Os resultados são sintéticos e provêm de uma lei fenomenológica idealizada, inspirada qualitativamente na variedade de curvas publicada por Vicente et al. (2015) e Arêde et al. (2026). A curva NÃO foi ajustada a qualquer ensaio específico. Os ciclos de descarga e recarga são lineares, sem histerese, degradação cíclica ou rotura; também não se reproduzem redistribuição tridimensional de tensões, efeitos de confinamento ou fissuração localizada. Os resultados referem-se apenas à zona instrumentada.';
    const logo1=document.querySelector('.logos img:first-child').src,logo2=document.querySelector('.logos img:last-child').src;
    $('printSheet').classList.toggle('long-report',!single||state.records.length>=7);
    $('printSheet').classList.toggle('extra-long-report',!single&&state.records.length>=15);
    $('printSheet').classList.toggle('short-report',single&&state.records.length<=6);
    $('printSheet').classList.toggle('many-readings',state.records.length>=20);
    $('printSheet').classList.toggle('many-double-readings',!single&&state.records.length>=25);
    const labels={initial:'E inicial (intervalo inicial)',secant:'E sec (origem e envolvente)',ur:'E ur (descarga ou recarga)'};
    const studentIds={initial:'studentInitial',secant:'studentSecant',ur:'studentUR'};
    const comparisonRows=['initial','secant','ur'].map(kind=>{
      const m=mods[kind],student=String($(studentIds[kind]).value).trim()?cleanNum($(studentIds[kind])):NaN;
      return `<tr><td>${labels[kind]}</td><td>${m?htmlEscape(m.source):'Não determinado'}</td><td>${m?fmt(Math.abs(m.ds),4):'—'}</td><td>${m?fmt(Math.abs(m.de)*1000,5):'—'}</td><td>${m?fmt(m.E,3):'—'}</td><td>${Number.isFinite(student)&&student>0?fmt(student,3):'—'}</td></tr>`;
    }).join('');
    const comparisonSection=single?'':`<section class="comparison-report"><div class="comparison-page-head"><span>CURSO FUNDEC · COMPARAÇÃO DE RIGIDEZ</span><div class="print-logos"><img src="${logo1}" alt="FUNDEC"><img src="${logo2}" alt="Técnico Lisboa"></div></div><h2>3. Comparação de módulos de elasticidade</h2><table class="comparison-table"><thead><tr><th>Parâmetro</th><th>Intervalo</th><th>Δσ (MPa)</th><th>Δε (‰)</th><th>E calculado (GPa)</th><th>E introduzido (GPa)</th></tr></thead><tbody>${comparisonRows}</tbody></table><p>O módulo inicial é aproximado num intervalo do primeiro carregamento. O módulo secante é medido desde a origem da curva. O módulo E ur refere-se a um único trecho contínuo de descarga ou recarga. Valores não determinados indicam ausência de leituras adequadas ou intervalos não selecionados.</p>${standard?`<p class="reference-report">Índices de referência interpolados (Figura 12 de Arêde et al., 2026), usando σmáx registada = ${fmt(standard.peak,3)} MPa: E₀ (10%) = ${fmt(standard.A,3)} GPa; Esec,30% = ${fmt(standard.B,3)} GPa; Esec,30 a 60% = ${fmt(standard.C,3)} GPa. Estes índices usam intervalos predefinidos e não substituem a seleção dos estudantes.</p>`:''}</section>`;
    $('printSheet').innerHTML=`<div class="print-head"><div><div class="print-course">CURSO FUNDEC</div><div class="print-course-title">Caracterização de Estruturas Existentes para Apoio à Avaliação da Segurança Estrutural</div></div><div class="print-logos"><img src="${logo1}" alt="FUNDEC"><img src="${logo2}" alt="Técnico Lisboa"></div></div>
      <h1>Relatório de ensaio com macacos planos</h1><div class="subhead">${single?'Macaco plano simples · estimativa da tensão instalada':'Macacos planos duplos · deformabilidade em compressão'}</div>
      <div class="report-meta"><div><small>Identificação</small><strong>${name}</strong></div><div><small>Data</small><strong>${date}</strong></div><div><small>Cenário</small><strong>${htmlEscape(material().label)}</strong></div></div>
      <div class="report-meta"><div><small>Coeficiente Kₘ</small><strong>${fmt(state.km,2)}</strong></div><div><small>Relação de áreas Kₐ</small><strong>${fmt(state.ka,2)}</strong></div><div><small>Produto Kₘ × Kₐ</small><strong>${fmt(factor(),4)}</strong></div></div>
      <section><h2>1. Procedimento e medições</h2><p>${single?'Rasgo horizontal, introdução do macaco e restituição da distância inicial dos pontos de referência.':'Dois rasgos horizontais, introdução dos macacos e aplicação de pressão em patamares. Leitura de deformações entre marcas no troço central.'}</p><table><thead>${header}</thead><tbody>${rows}</tbody></table></section>
      <section><h2>2. Resultados</h2><div class="print-stats">${measures}</div><p class="report-method">${note}</p></section>
      ${comparisonSection}
      <section class="graph-report"><div class="print-page-two-head"><span>CURSO FUNDEC · ENSAIO DE MACACOS PLANOS</span><div class="print-logos"><img src="${logo1}" alt="FUNDEC"><img src="${logo2}" alt="Técnico Lisboa"></div></div><h2>${single?'3':'4'}. Representação gráfica</h2><svg class="print-chart" viewBox="0 0 720 350" xmlns="http://www.w3.org/2000/svg">${printGraphWithAllModuli(mods)}</svg>${single?'':'<p class="print-legend"><span style="color:#00a6ce">●</span> E inicial &nbsp; <span style="color:#546ea2">●</span> E sec &nbsp; <span style="color:#c48a40">●</span> E ur. Linhas de referência de cada módulo selecionado.</p>'}</section>
      <section><h2>${single?'4':'5'}. Hipóteses e limitações</h2><p>${disclaimer}</p></section>
      <div class="report-footer">FUNDEC · Instituto Superior Técnico · Laboratório virtual para apoio ao ensino · Valores sintéticos.</div>`;
    setMsg('Relatório preparado. Na janela de impressão, selecione «Guardar como PDF».');
    setTimeout(()=>window.print(),120);
  }
  $('tabSingle').addEventListener('click',()=>changeMode('single'));
  $('tabDouble').addEventListener('click',()=>changeMode('double'));
  $('cutBtn').addEventListener('click',performCut);$('jackBtn').addEventListener('click',insertJack);
  $('restartBtn').addEventListener('click',()=>reset());
  $('clearBtn').addEventListener('click',()=>{state.records=[];state.maxSigma=0;state.lastPressure=0;state.checked=false;$('pressure').value='0';state.autoSelect={initial:true,secant:true,ur:true};state.validation={initial:false,secant:false,ur:false};resetModulusFeedback();setMsg('Leituras apagadas. Pode iniciar uma nova sequência de patamares sem repetir a preparação.');render();});
  $('saveBtn').addEventListener('click',record);$('pressure').addEventListener('input',()=>{svgWall();$('pressureValue').innerHTML=fmt(cleanNum($('pressure')),2)+' <span>MPa</span>';const v=currentValue();$('measuredValue').innerHTML=v===null?'—':fmt(v,4)+' <span>mm</span>';});
  $('scenario').addEventListener('change',()=>{state.scenario=$('scenario').value;reset();});
  ['km','ka'].forEach(id=>$(id).addEventListener('change',()=>{if(validatedParameters())reset();}));
  $('checkSingle').addEventListener('click',checkSingle);$('checkDouble').addEventListener('click',verifyModuli);
  [['focusInitial','initial'],['focusSecant','secant'],['focusUR','ur']].forEach(([id,kind])=>$(id).addEventListener('click',()=>selectModulus(kind)));
  [['initialA','initial'],['initialB','initial'],['secantPoint','secant'],['urA','ur'],['urB','ur']].forEach(([id,kind])=>$(id).addEventListener('change',()=>{state.autoSelect[kind]=false;state.validation[kind]=false;$('moduliSummary').hidden=true;setCheck(kind+'Feedback','A seleção mudou. Volte a verificar o cálculo.');updateModulusDescriptions();drawChart();}));
  ['studentInitial','studentSecant','studentUR'].forEach(id=>$(id).addEventListener('input',()=>{$('moduliSummary').hidden=true;}));
  $('csvBtn').addEventListener('click',downloadCSV);$('reportBtn').addEventListener('click',generateReport);
  changeMode('single');
})();
