'use strict';

const translations = {
  pt: {
    pageTitle:'Ensaio de Tração Uniaxial | Resistência dos Materiais',
    courseTitle:'Resistência dos Materiais',
    simulatorTitle:'Ensaio de Tração Uniaxial',
    subtitle:'Simulador interativo para apoio às aulas',
    reset:'Reiniciar',
    languageAria:'Idioma',
    orcidAria:'ORCID de Tiago Miguel Ferreira',
    material:'Material',
    behaviour:'Comportamento',
    materialSteel:'Aço macio',
    materialAluminium:'Liga de alumínio',
    materialBrittle:'Material frágil',
    materialCustom:'Definido pelo utilizador',
    behaviourPlateau:'Patamar de cedência',
    behaviourSmooth:'Endurecimento suave',
    behaviourBrittle:'Frágil',
    geometryComparison:'Comparação da geometria',
    whenDiameterChanges:'Ao alterar o diâmetro',
    comparisonAria:'Grandeza mantida ao alterar o diâmetro',
    sameStrain:'Mesma extensão',
    sameForce:'Mesma força',
    comparisonStrainExplanation:'Mantém-se a extensão atual. A tensão do material permanece igual e a força varia com a área da secção.',
    comparisonForceExplanation:'Mantém-se a força atual. Ao alterar o diâmetro, a área muda e o simulador procura na curva do material o estado com a tensão necessária para conservar essa força.',
    showTrue:'Mostrar tensão e extensão verdadeiras',
    showPoints:'Mostrar pontos característicos',
    startTest:'Iniciar ensaio',
    pause:'Pausa',
    loadingSpeed:'Velocidade de carregamento',
    materialResponse:'Resposta do material',
    stressStrainCurve:'Curva tensão extensão',
    dragHint:'Arraste sobre o gráfico',
    stressCanvasAria:'Curva tensão extensão',
    specimenResponse:'Resposta do provete',
    forceElongationCurve:'Curva força alongamento',
    forceCanvasAria:'Curva força alongamento',
    virtualSpecimen:'Provete virtual',
    strain:'Extensão',
    specimenCanvasAria:'Provete de tração animado',
    currentState:'Estado atual',
    measuredQuantities:'Grandezas medidas',
    stress:'Tensão',
    force:'Força',
    elongation:'Alongamento',
    diameter:'Diâmetro',
    stage:'Fase',
    predictionMode:'Modo de previsão',
    materialOrSpecimen:'Propriedade do material ou do provete?',
    challengeQuestion:'Escolha um desafio, formule uma previsão e revele depois o resultado.',
    doubleDiameter:'Duplicar o diâmetro',
    doubleGaugeLength:'Duplicar o comprimento de referência',
    doubleYoung:'Duplicar o módulo de Young',
    doubleArea:'Duplicar a área',
    revealResult:'Revelar resultado',
    fundamentalRelations:'Relações fundamentais',
    nominalStress:'Tensão nominal',
    nominalStrain:'Extensão nominal',
    elasticRelation:'Relação elástica',
    axialForce:'Força axial',
    footerDisclaimer:'Simulador desenvolvido para fins didáticos. Os ramos após a cedência são fenomenológicos e servem para apoiar a interpretação de um ensaio de tração uniaxial.',
    elastic:'Elástico',
    yielding:'Cedência',
    hardening:'Encruamento',
    necking:'Estricção',
    fracture:'Rotura',
    ultimateStress:'Tensão última',
    currentLength:'Comprimento atual',
    axisStrain:'Extensão',
    axisStress:'Tensão [MPa]',
    axisElongation:'Alongamento [mm]',
    axisForce:'Força [kN]',
    forceUnavailable:(oldForce,d)=>`A força anterior, ${oldForce} kN, não pode ser atingida com d₀ = ${d} mm sem ultrapassar a tensão máxima do modelo. Foi selecionado o estado de força máxima.`,
    forceOtherBranch:(force,sigma,epsilon)=>`Força mantida aproximadamente em ${force} kN. O nível de tensão necessário não existe no ramo atual, pelo que foi selecionado um ponto compatível noutro ramo da curva. A tensão é ${sigma} MPa e a extensão é ${epsilon}.`,
    forceMaintained:(force,d0,d1,s0,s1,e1)=>`Força mantida em ${force} kN. Ao passar de d₀ = ${d0} mm para ${d1} mm, a tensão passa de ${s0} MPa para ${s1} MPa e a extensão ajusta-se para ${e1}.`,
    strainMaintained:(d0,f0,d1,f1,sigma)=>`Para d₀ = ${d0} mm, F = ${f0} kN. Para d₀ = ${d1} mm, mantendo a mesma extensão, F = ${f1} kN. A tensão mantém-se em ${sigma} MPa.`,
    predictDiameterForce:'Ao duplicar o diâmetro, a área inicial aumenta quatro vezes. Mantendo a força, a tensão reduz para um quarto. No regime elástico, a extensão também reduz para um quarto.',
    predictDiameterStrain:'Ao duplicar o diâmetro, a área inicial aumenta quatro vezes. Mantendo a extensão, a tensão não se altera e a força aumenta quatro vezes. A curva tensão extensão do material permanece igual.',
    predictAreaForce:'Ao duplicar a área e manter a força, a tensão reduz para metade. No regime elástico, a extensão também reduz para metade.',
    predictAreaStrain:'Ao duplicar a área e manter a extensão, a tensão não se altera e a força duplica. A curva tensão extensão do material permanece igual.',
    predictGaugeLength:'Ao duplicar o comprimento de referência, o alongamento duplica para a mesma extensão. A curva tensão extensão e o nível de força não se alteram.',
    predictYoung:'Ao duplicar o módulo de Young, duplica o declive no regime elástico. Mantendo as resistências, a extensão correspondente ao início da cedência reduz para metade.'
  },
  en: {
    pageTitle:'Uniaxial Tensile Test | Strength of Materials',
    courseTitle:'Strength of Materials',
    simulatorTitle:'Uniaxial Tensile Test',
    subtitle:'Interactive simulator for teaching support',
    reset:'Reset',
    languageAria:'Language',
    orcidAria:'Tiago Miguel Ferreira ORCID',
    material:'Material',
    behaviour:'Behaviour',
    materialSteel:'Mild steel',
    materialAluminium:'Aluminium alloy',
    materialBrittle:'Brittle material',
    materialCustom:'User defined',
    behaviourPlateau:'Yield plateau',
    behaviourSmooth:'Smooth hardening',
    behaviourBrittle:'Brittle',
    geometryComparison:'Geometry comparison',
    whenDiameterChanges:'When changing the diameter',
    comparisonAria:'Quantity held constant when changing the diameter',
    sameStrain:'Same strain',
    sameForce:'Same force',
    comparisonStrainExplanation:'The current strain is held constant. The material stress remains unchanged and the force varies with the cross sectional area.',
    comparisonForceExplanation:'The current force is held constant. When the diameter changes, the area changes and the simulator finds the state on the material curve that provides the stress required to preserve that force.',
    showTrue:'Show true stress and true strain',
    showPoints:'Show characteristic points',
    startTest:'Start test',
    pause:'Pause',
    loadingSpeed:'Loading speed',
    materialResponse:'Material response',
    stressStrainCurve:'Stress strain curve',
    dragHint:'Drag along the graph',
    stressCanvasAria:'Stress strain curve',
    specimenResponse:'Specimen response',
    forceElongationCurve:'Force elongation curve',
    forceCanvasAria:'Force elongation curve',
    virtualSpecimen:'Virtual specimen',
    strain:'Strain',
    specimenCanvasAria:'Animated tensile specimen',
    currentState:'Current state',
    measuredQuantities:'Measured quantities',
    stress:'Stress',
    force:'Force',
    elongation:'Elongation',
    diameter:'Diameter',
    stage:'Stage',
    predictionMode:'Prediction mode',
    materialOrSpecimen:'Material property or specimen response?',
    challengeQuestion:'Choose a challenge, make a prediction, then reveal the result.',
    doubleDiameter:'Double the diameter',
    doubleGaugeLength:'Double the gauge length',
    doubleYoung:'Double Young’s modulus',
    doubleArea:'Double the area',
    revealResult:'Reveal result',
    fundamentalRelations:'Fundamental relations',
    nominalStress:'Engineering stress',
    nominalStrain:'Engineering strain',
    elasticRelation:'Elastic relation',
    axialForce:'Axial force',
    footerDisclaimer:'Simulator developed for teaching purposes. The post yield branches are phenomenological and are intended to support interpretation of a uniaxial tensile test.',
    elastic:'Elastic',
    yielding:'Yielding',
    hardening:'Strain hardening',
    necking:'Necking',
    fracture:'Fracture',
    ultimateStress:'Ultimate stress',
    currentLength:'Current length',
    axisStrain:'Strain',
    axisStress:'Stress [MPa]',
    axisElongation:'Elongation [mm]',
    axisForce:'Force [kN]',
    forceUnavailable:(oldForce,d)=>`The previous force, ${oldForce} kN, cannot be reached with d₀ = ${d} mm without exceeding the maximum stress represented by the model. The maximum force state has been selected.`,
    forceOtherBranch:(force,sigma,epsilon)=>`The force is maintained approximately at ${force} kN. The required stress is not available on the current branch, so a compatible point on another branch of the curve has been selected. The stress is ${sigma} MPa and the strain is ${epsilon}.`,
    forceMaintained:(force,d0,d1,s0,s1,e1)=>`The force is maintained at ${force} kN. When d₀ changes from ${d0} mm to ${d1} mm, the stress changes from ${s0} MPa to ${s1} MPa and the strain adjusts to ${e1}.`,
    strainMaintained:(d0,f0,d1,f1,sigma)=>`For d₀ = ${d0} mm, F = ${f0} kN. For d₀ = ${d1} mm, with the same strain, F = ${f1} kN. The stress remains ${sigma} MPa.`,
    predictDiameterForce:'Doubling the diameter increases the initial area by a factor of four. If the force is held constant, the stress falls to one quarter. In the elastic range, the strain also falls to one quarter.',
    predictDiameterStrain:'Doubling the diameter increases the initial area by a factor of four. If the strain is held constant, the stress is unchanged and the force increases by a factor of four. The material stress strain curve is unchanged.',
    predictAreaForce:'Doubling the area while holding the force constant halves the stress. In the elastic range, the strain also halves.',
    predictAreaStrain:'Doubling the area while holding the strain constant leaves the stress unchanged and doubles the force. The material stress strain curve is unchanged.',
    predictGaugeLength:'Doubling the gauge length doubles the elongation for the same strain. The stress strain curve and the force level are unchanged.',
    predictYoung:'Doubling Young’s modulus doubles the slope in the elastic range. If the strengths are unchanged, the strain corresponding to the onset of yielding is halved.'
  }
};

const presets = {
  steel: { behaviour:'plateau', E:200, fy:250, fu:450, L0:50, d0:10, epsU:0.15, epsF:0.25 },
  aluminium: { behaviour:'smooth', E:70, fy:280, fu:330, L0:50, d0:10, epsU:0.08, epsF:0.14 },
  brittle: { behaviour:'brittle', E:30, fy:0, fu:60, L0:50, d0:10, epsU:0.002, epsF:0.002 }
};

const controls = [
  { key:'E', label:'E', unit:'GPa', min:10, max:250, step:1 },
  { key:'fy', label:'fy', unit:'MPa', min:0, max:800, step:5 },
  { key:'fu', label:'fu', unit:'MPa', min:20, max:1000, step:5 },
  { key:'L0', label:'L₀', unit:'mm', min:20, max:200, step:1 },
  { key:'d0', label:'d₀', unit:'mm', min:2, max:30, step:0.5 },
  { key:'epsU', label:'εu', unit:'', min:0.001, max:0.35, step:0.001 },
  { key:'epsF', label:'εf', unit:'', min:0.001, max:0.50, step:0.001 }
];

function getSavedLanguage(){
  try { return localStorage.getItem('tensileSimulatorLanguage') === 'en' ? 'en' : 'pt'; }
  catch { return 'pt'; }
}

function saveLanguage(value){
  try { localStorage.setItem('tensileSimulatorLanguage',value); }
  catch { }
}

let language = getSavedLanguage();
let params = {...presets.steel};
let data = null;
let index = 0;
let running = false;
let lastFrame = 0;
let draggingStress = false;
let geometryComparisonBaseline = null;

const el = id => document.getElementById(id);
const materialSelect = el('materialSelect');
const behaviourSelect = el('behaviourSelect');
const sliderGrid = el('sliderGrid');
const stressCanvas = el('stressCanvas');
const forceCanvas = el('forceCanvas');
const specimenCanvas = el('specimenCanvas');
const t = key => translations[language][key];

function formatNumber(value,digits){
  return new Intl.NumberFormat(language === 'pt' ? 'pt-PT' : 'en-GB',{
    minimumFractionDigits:digits,
    maximumFractionDigits:digits,
    useGrouping:false
  }).format(Number(value));
}

function applyTranslations(){
  document.documentElement.lang = language === 'pt' ? 'pt-PT' : 'en-GB';
  document.title = t('pageTitle');

  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.dataset.i18n;
    if(typeof t(key) === 'string') node.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(node => {
    const key = node.dataset.i18nAriaLabel;
    if(typeof t(key) === 'string') node.setAttribute('aria-label',t(key));
  });

  el('langPt').classList.toggle('active',language === 'pt');
  el('langEn').classList.toggle('active',language === 'en');
  el('langPt').setAttribute('aria-pressed',String(language === 'pt'));
  el('langEn').setAttribute('aria-pressed',String(language === 'en'));

  updateComparisonExplanation(false);
  if(el('challengeAnswer').textContent.trim()) showChallengeAnswer();
  if(data) renderAll();
}

function setLanguage(nextLanguage){
  language = nextLanguage === 'en' ? 'en' : 'pt';
  saveLanguage(language);
  el('comparisonFeedback').textContent = '';
  clearGeometryComparison();
  applyTranslations();
}

function createSliders(){
  sliderGrid.innerHTML = '';
  for(const c of controls){
    const wrap = document.createElement('div');
    wrap.className = 'sliderItem';
    const label = document.createElement('label');
    const name = document.createElement('span');
    name.textContent = c.label;
    const output = document.createElement('output');
    output.id = `${c.key}Output`;
    label.append(name,output);
    const input = document.createElement('input');
    input.type = 'range';
    input.id = `${c.key}Input`;
    input.min = c.min;
    input.max = c.max;
    input.step = c.step;
    input.addEventListener('input',()=>handleParameterChange(c.key,Number(input.value)));
    wrap.append(label,input);
    sliderGrid.appendChild(wrap);
  }
}

function normaliseParameters(){
  if(params.behaviour !== 'brittle'){
    if(params.fu < params.fy) params.fu = params.fy;
    const epsY = (params.fy*1e6)/(params.E*1e9);
    const epsPlateau = params.behaviour === 'plateau' ? Math.max(0.02,1.05*epsY) : epsY;
    if(params.epsU <= epsPlateau) params.epsU = epsPlateau + 0.001;
    if(params.epsF <= params.epsU) params.epsF = params.epsU + 0.001;
  } else {
    params.fy = 0;
    const epsFracture = (params.fu*1e6)/(params.E*1e9);
    params.epsF = epsFracture;
    params.epsU = epsFracture;
  }
  syncInputs();
}

function syncInputs(){
  behaviourSelect.value = params.behaviour;
  for(const c of controls){
    const input = el(`${c.key}Input`);
    const output = el(`${c.key}Output`);
    if(!input) continue;
    input.value = params[c.key];
    input.disabled = params.behaviour === 'brittle' && ['fy','epsU','epsF'].includes(c.key);
    const v = params[c.key];
    if(c.key.startsWith('eps')) output.textContent = formatNumber(v,3);
    else output.textContent = `${formatNumber(v,c.step < 1 ? 1 : 0)} ${c.unit}`.trim();
  }
}

function currentComparisonMode(){
  return document.querySelector('input[name="comparisonMode"]:checked')?.value || 'strain';
}

function updateComparisonExplanation(clearFeedback=false){
  const mode = currentComparisonMode();
  el('comparisonExplanation').textContent = mode === 'force' ? t('comparisonForceExplanation') : t('comparisonStrainExplanation');
  if(clearFeedback) el('comparisonFeedback').textContent = '';
}

function renderAll(){
  drawStress();
  drawForce();
  drawSpecimen();
  updateReadouts();
}

function captureGeometryBaseline(){
  if(!data || !data.eps || !data.eps.length) return null;
  const i = Math.min(index,data.eps.length-1);
  return {epsilon:data.eps[i],force:data.F[i],sigma:data.sigma[i],diameter:params.d0};
}

function beginGeometryComparison(){
  if(!geometryComparisonBaseline) geometryComparisonBaseline = captureGeometryBaseline();
}

function clearGeometryComparison(){
  geometryComparisonBaseline = null;
}

function bestIndexForStress(targetSigma,currentEpsilon){
  const n = data.sigma.length;
  const iU = params.behaviour === 'brittle' ? n-1 : nearestIndex(data.eps,params.epsU);
  const afterUltimate = params.behaviour !== 'brittle' && currentEpsilon > params.epsU;
  const branchStart = afterUltimate ? iU : 0;
  const branchEnd = afterUltimate ? n-1 : iU;

  function bestInRange(start,end){
    let best = start;
    let bestErr = Infinity;
    let bestDistance = Infinity;
    for(let i=start;i<=end;i++){
      const err = Math.abs(data.sigma[i]-targetSigma);
      const distance = Math.abs(data.eps[i]-currentEpsilon);
      if(err < bestErr || (Math.abs(err-bestErr) < 1e-9 && distance < bestDistance)){
        best = i;
        bestErr = err;
        bestDistance = distance;
      }
    }
    return {index:best,error:bestErr};
  }

  const branch = bestInRange(branchStart,branchEnd);
  const global = bestInRange(0,n-1);
  const tolerance = Math.max(0.25e6,Math.abs(targetSigma)*0.002);
  if(branch.error <= tolerance) return {index:branch.index,usedOtherBranch:false,exact:true};
  if(global.error < branch.error) return {index:global.index,usedOtherBranch:true,exact:global.error <= tolerance};
  return {index:branch.index,usedOtherBranch:false,exact:false};
}

function handleParameterChange(key,newValue){
  const hasState = data && data.eps && data.eps.length;
  const baseline = key === 'd0' ? (geometryComparisonBaseline || captureGeometryBaseline()) : null;
  const oldEpsilon = hasState ? (baseline ? baseline.epsilon : data.eps[index]) : 0;
  const oldForce = hasState ? (baseline ? baseline.force : data.F[index]) : 0;
  const oldSigma = hasState ? (baseline ? baseline.sigma : data.sigma[index]) : 0;
  const oldDiameter = baseline ? baseline.diameter : params.d0;

  params[key] = newValue;
  materialSelect.value = 'custom';
  normaliseParameters();
  data = simulate(params);

  if(hasState){
    if(key === 'd0' && currentComparisonMode() === 'force'){
      const targetSigma = oldForce/data.A0;
      const maxSigma = Math.max(...data.sigma);
      const result = bestIndexForStress(targetSigma,oldEpsilon);
      index = result.index;
      running = false;

      const newForce = data.F[index];
      const newSigma = data.sigma[index];
      const newEpsilon = data.eps[index];
      const forceError = Math.abs(newForce-oldForce);
      const forceTolerance = Math.max(2,oldForce*0.003);

      if(targetSigma > maxSigma && forceError > forceTolerance){
        el('comparisonFeedback').textContent = t('forceUnavailable')(formatNumber(oldForce/1e3,2),formatNumber(params.d0,1));
      } else if(result.usedOtherBranch){
        el('comparisonFeedback').textContent = t('forceOtherBranch')(formatNumber(newForce/1e3,2),formatNumber(newSigma/1e6,1),formatNumber(newEpsilon,5));
      } else {
        el('comparisonFeedback').textContent = t('forceMaintained')(formatNumber(newForce/1e3,2),formatNumber(oldDiameter,1),formatNumber(params.d0,1),formatNumber(oldSigma/1e6,1),formatNumber(newSigma/1e6,1),formatNumber(newEpsilon,5));
      }
    } else {
      index = nearestIndex(data.eps,Math.min(oldEpsilon,params.epsF));
      if(key === 'd0'){
        running = false;
        const newForce = data.F[index];
        el('comparisonFeedback').textContent = t('strainMaintained')(formatNumber(oldDiameter,1),formatNumber(oldForce/1e3,2),formatNumber(params.d0,1),formatNumber(newForce/1e3,2),formatNumber(data.sigma[index]/1e6,1));
      }
    }
  } else {
    index = 0;
  }

  renderAll();
}

function simulate(p){
  const N = 1200;
  const E = p.E*1e9;
  const fy = p.fy*1e6;
  const fu = p.fu*1e6;
  const L0 = p.L0*1e-3;
  const d0 = p.d0*1e-3;
  const A0 = Math.PI*d0*d0/4;
  const eps = new Array(N);
  const sigma = new Array(N).fill(0);

  for(let i=0;i<N;i++) eps[i] = p.epsF*i/(N-1);

  if(p.behaviour === 'brittle'){
    for(let i=0;i<N;i++) sigma[i] = Math.min(E*eps[i],fu);
  } else {
    const epsY = fy/E;
    const epsPlateau = p.behaviour === 'plateau' ? Math.max(0.02,1.05*epsY) : epsY;
    for(let i=0;i<N;i++){
      const e = eps[i];
      if(e <= epsY){
        sigma[i] = E*e;
      } else if(e <= epsPlateau){
        sigma[i] = fy;
      } else if(e <= p.epsU){
        const den = Math.max(p.epsU-epsPlateau,Number.EPSILON);
        const x = (e-epsPlateau)/den;
        sigma[i] = fy + (fu-fy)*(2*x-x*x);
      } else {
        const den = Math.max(p.epsF-p.epsU,Number.EPSILON);
        const x = Math.min(Math.max((e-p.epsU)/den,0),1);
        const smooth = 3*x*x-2*x*x*x;
        const sigmaF = 0.70*fu;
        sigma[i] = fu-(fu-sigmaF)*smooth;
      }
    }
  }

  const F = sigma.map(s => s*A0);
  const delta = eps.map(e => e*L0);
  const epsTrue = eps.map(e => Math.log(1+e));
  const sigmaTrue = sigma.map((s,i) => s*(1+eps[i]));
  if(p.behaviour !== 'brittle'){
    for(let i=0;i<N;i++){
      if(eps[i] > p.epsU){
        epsTrue[i] = Number.NaN;
        sigmaTrue[i] = Number.NaN;
      }
    }
  }
  return {eps,sigma,F,delta,epsTrue,sigmaTrue,E,fy,fu,L0,d0,A0};
}

function stageName(e){
  const E = params.E*1e9;
  const fy = params.fy*1e6;
  if(params.behaviour === 'brittle'){
    return e < Math.min(params.fu*1e6/E,params.epsF) ? t('elastic') : t('fracture');
  }
  const epsY = fy/E;
  const epsPlateau = params.behaviour === 'plateau' ? Math.max(0.02,1.05*epsY) : epsY;
  if(e <= epsY) return t('elastic');
  if(e <= epsPlateau) return t('yielding');
  if(e <= params.epsU) return t('hardening');
  if(e < params.epsF) return t('necking');
  return t('fracture');
}

function sizeCanvas(canvas){
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const w = Math.max(1,Math.round(rect.width*ratio));
  const h = Math.max(1,Math.round(rect.height*ratio));
  if(canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio,0,0,ratio,0,0);
  return {ctx,w:rect.width,h:rect.height,ratio};
}

function drawAxes(canvas,xMax,yMax,xLabel,yLabel){
  const {ctx,w,h} = sizeCanvas(canvas);
  const m = {l:58,r:18,t:14,b:48};
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle = '#1f2933';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,h-m.b); ctx.lineTo(w-m.r,h-m.b); ctx.stroke();
  ctx.fillStyle = '#59636f';
  ctx.font = '12px system-ui';
  ctx.fillText('0',m.l-12,h-m.b+16);
  ctx.fillText(formatTick(xMax),w-m.r-30,h-m.b+18);
  ctx.fillText(formatTick(yMax),6,m.t+5);
  ctx.textAlign = 'center';
  ctx.fillText(xLabel,(m.l+w-m.r)/2,h-10);
  ctx.save();
  ctx.translate(14,(m.t+h-m.b)/2); ctx.rotate(-Math.PI/2); ctx.fillText(yLabel,0,0); ctx.restore();
  ctx.textAlign = 'start';
  return {ctx,w,h,m,xScale:(w-m.l-m.r)/xMax,yScale:(h-m.t-m.b)/yMax};
}

function formatTick(v){
  if(v >= 1000) return formatNumber(v,0);
  if(v >= 10) return formatNumber(v,0);
  if(v >= 1) return formatNumber(v,1);
  return formatNumber(v,3);
}

function drawPolyline(ctx,xs,ys,mapX,mapY,width=2){
  ctx.beginPath();
  for(let i=0;i<xs.length;i++){
    const x = mapX(xs[i]), y = mapY(ys[i]);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.lineWidth = width;
  ctx.strokeStyle = '#202833';
  ctx.stroke();
}

function drawStress(){
  const showTrue = el('showTrue').checked;
  const finiteTrueStrains = data.epsTrue.filter(Number.isFinite);
  const maxTrueStrain = finiteTrueStrains.length ? Math.max(...finiteTrueStrains) : 0;
  const xMax = Math.max(params.epsF,showTrue ? maxTrueStrain : 0)*1.05;
  const maxEng = Math.max(...data.sigma)/1e6;
  const finiteTrueStress = data.sigmaTrue.filter(Number.isFinite);
  const maxTrue = finiteTrueStress.length ? Math.max(...finiteTrueStress)/1e6 : 0;
  const yMax = Math.max(maxEng,showTrue ? maxTrue : 0)*1.12;
  const g = drawAxes(stressCanvas,xMax,yMax,t('axisStrain'),t('axisStress'));
  const mapX = x => g.m.l + x*g.xScale;
  const mapY = y => g.h-g.m.b-y*g.yScale;
  drawPolyline(g.ctx,data.eps,data.sigma.map(v=>v/1e6),mapX,mapY,2.4);

  if(showTrue){
    g.ctx.setLineDash([6,5]);
    g.ctx.strokeStyle = '#6b7280';
    g.ctx.beginPath();
    let started = false;
    for(let i=0;i<data.epsTrue.length;i++){
      if(!Number.isFinite(data.epsTrue[i]) || !Number.isFinite(data.sigmaTrue[i])) continue;
      const x = mapX(data.epsTrue[i]), y = mapY(data.sigmaTrue[i]/1e6);
      if(!started){ g.ctx.moveTo(x,y); started=true; } else g.ctx.lineTo(x,y);
    }
    g.ctx.stroke();
    g.ctx.setLineDash([]);
  }

  if(el('showPoints').checked){
    characteristicIndices().forEach(({i,label})=>{
      const x = mapX(data.eps[i]), y = mapY(data.sigma[i]/1e6);
      g.ctx.beginPath(); g.ctx.arc(x,y,4,0,Math.PI*2); g.ctx.fillStyle='#ffffff'; g.ctx.fill(); g.ctx.strokeStyle='#202833'; g.ctx.stroke();
      g.ctx.fillStyle='#4e5965'; g.ctx.font='11px system-ui'; g.ctx.fillText(label,x+7,y-7);
    });
  }

  const i = Math.min(index,data.eps.length-1);
  g.ctx.beginPath();
  g.ctx.arc(mapX(data.eps[i]),mapY(data.sigma[i]/1e6),6,0,Math.PI*2);
  g.ctx.fillStyle='#111827'; g.ctx.fill();
  stressCanvas._graph = {m:g.m,w:g.w,h:g.h,xMax};
}

function characteristicIndices(){
  if(params.behaviour === 'brittle'){
    return [{i:data.sigma.indexOf(Math.max(...data.sigma)),label:t('fracture')}];
  }
  const epsY = params.fy*1e6/(params.E*1e9);
  const iY = nearestIndex(data.eps,epsY);
  const iU = data.sigma.indexOf(Math.max(...data.sigma));
  return [{i:iY,label:t('yielding')},{i:iU,label:t('ultimateStress')},{i:data.eps.length-1,label:t('fracture')}];
}

function drawForce(){
  const xVals = data.delta.map(v=>v*1e3);
  const yVals = data.F.map(v=>v/1e3);
  const xMax = Math.max(...xVals)*1.05 || 1;
  const yMax = Math.max(...yVals)*1.12 || 1;
  const g = drawAxes(forceCanvas,xMax,yMax,t('axisElongation'),t('axisForce'));
  const mapX = x => g.m.l + x*g.xScale;
  const mapY = y => g.h-g.m.b-y*g.yScale;
  drawPolyline(g.ctx,xVals,yVals,mapX,mapY,2.4);
  const i = Math.min(index,data.eps.length-1);
  g.ctx.beginPath(); g.ctx.arc(mapX(xVals[i]),mapY(yVals[i]),6,0,Math.PI*2); g.ctx.fillStyle='#111827'; g.ctx.fill();
}

function drawSpecimen(){
  const {ctx,w,h} = sizeCanvas(specimenCanvas);
  ctx.clearRect(0,0,w,h);
  const i = Math.min(index,data.eps.length-1);
  const e = data.eps[i];
  const L = params.L0*(1+e);
  const A0 = Math.PI*params.d0*params.d0/4;
  const A = A0/(1+e);
  const dUniform = Math.sqrt(4*A/Math.PI);
  const plotL = Math.max(params.L0*(1+params.epsF),L)*1.08;
  const x0 = 18, x1 = w-18;
  const cx = x => x0 + x/plotL*(x1-x0);
  const midY = h/2;
  const radiusScale = Math.min(10,Math.max(4,120/params.d0));
  const ptsTop = [], ptsBottom=[];
  const n = 180;

  for(let j=0;j<n;j++){
    const x = L*j/(n-1);
    let r = dUniform/2;
    if(params.behaviour !== 'brittle' && e > params.epsU){
      const progress = Math.min((e-params.epsU)/Math.max(params.epsF-params.epsU,Number.EPSILON),1);
      const neck = Math.exp(-Math.pow((x-L/2)/(0.12*L),2));
      r *= 1-0.42*progress*neck;
    }
    ptsTop.push([cx(x),midY-r*radiusScale]);
    ptsBottom.push([cx(x),midY+r*radiusScale]);
  }

  ctx.beginPath();
  ptsTop.forEach((p,j)=>j===0?ctx.moveTo(...p):ctx.lineTo(...p));
  ptsBottom.reverse().forEach(p=>ctx.lineTo(...p));
  ctx.closePath();
  ctx.fillStyle='#d6d9dd'; ctx.fill();
  ctx.strokeStyle='#202833'; ctx.lineWidth=1.5; ctx.stroke();

  ctx.strokeStyle='#8a939d'; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(cx(0),midY); ctx.lineTo(cx(L),midY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#5f6975'; ctx.font='12px system-ui';
  ctx.fillText(`${t('currentLength')}: ${formatNumber(L,2)} mm`,18,h-18);
}

function updateReadouts(){
  const i = Math.min(index,data.eps.length-1);
  const e = data.eps[i];
  const sigma = data.sigma[i]/1e6;
  const F = data.F[i]/1e3;
  const delta = data.delta[i]*1e3;
  const A0 = Math.PI*Math.pow(params.d0*1e-3,2)/4;
  const A = A0/(1+e);
  let dNow = Math.sqrt(4*A/Math.PI)*1e3;

  if(params.behaviour !== 'brittle' && e > params.epsU){
    const progress = Math.min((e-params.epsU)/Math.max(params.epsF-params.epsU,Number.EPSILON),1);
    dNow *= 1-0.42*progress;
  }

  const stage = stageName(e);
  el('sigmaValue').textContent = `${formatNumber(sigma,1)} MPa`;
  el('epsilonValue').textContent = formatNumber(e,5);
  el('forceValue').textContent = `${formatNumber(F,2)} kN`;
  el('deltaValue').textContent = `${formatNumber(delta,3)} mm`;
  el('diameterValue').textContent = `${formatNumber(dNow,2)} mm`;
  el('stageValue').textContent = stage;
  el('stageBadge').textContent = stage;
  syncInputs();
}

function updateAll(){
  normaliseParameters();
  data = simulate(params);
  index = Math.min(index,data.eps.length-1);
  renderAll();
}

function nearestIndex(arr,value){
  let lo = 0, hi = arr.length-1;
  while(lo < hi){
    const mid = Math.floor((lo+hi)/2);
    if(arr[mid] < value) lo = mid+1; else hi = mid;
  }
  if(lo > 0 && Math.abs(arr[lo-1]-value) < Math.abs(arr[lo]-value)) return lo-1;
  return lo;
}

function animate(timestamp){
  if(running && data){
    const speed = Number(el('speedSlider').value);
    const interval = Math.max(12,90-speed*3);
    if(timestamp-lastFrame > interval){
      index += Math.max(1,Math.round(speed/3));
      if(index >= data.eps.length-1){ index=data.eps.length-1; running=false; }
      renderAll();
      lastFrame = timestamp;
    }
  }
  requestAnimationFrame(animate);
}

function dragStress(ev){
  if(!data || !stressCanvas._graph) return;
  const rect = stressCanvas.getBoundingClientRect();
  const x = ev.clientX-rect.left;
  const g = stressCanvas._graph;
  const frac = Math.min(Math.max((x-g.m.l)/(g.w-g.m.l-g.m.r),0),1);
  const strain = frac*g.xMax;
  index = nearestIndex(data.eps,Math.min(strain,params.epsF));
  running = false;
  renderAll();
}

function showChallengeAnswer(){
  const choice = el('challengeSelect').value;
  const mode = currentComparisonMode();
  const answers = {
    doubleDiameter: mode === 'force' ? t('predictDiameterForce') : t('predictDiameterStrain'),
    doubleGaugeLength:t('predictGaugeLength'),
    doubleYoung:t('predictYoung'),
    doubleArea: mode === 'force' ? t('predictAreaForce') : t('predictAreaStrain')
  };
  el('challengeAnswer').textContent = answers[choice];
}

document.querySelectorAll('input[name="comparisonMode"]').forEach(input=>{
  input.addEventListener('change',()=>{
    clearGeometryComparison();
    updateComparisonExplanation(true);
    if(el('challengeAnswer').textContent.trim()) showChallengeAnswer();
  });
});

materialSelect.addEventListener('change',()=>{
  clearGeometryComparison();
  if(materialSelect.value !== 'custom') params = {...presets[materialSelect.value]};
  index = 0;
  running = false;
  el('comparisonFeedback').textContent = '';
  normaliseParameters();
  updateAll();
});

behaviourSelect.addEventListener('change',()=>{
  clearGeometryComparison();
  params.behaviour = behaviourSelect.value;
  materialSelect.value = 'custom';
  normaliseParameters();
  index = 0;
  running = false;
  el('comparisonFeedback').textContent = '';
  updateAll();
});

el('startButton').addEventListener('click',()=>{
  if(index >= data.eps.length-1) index = 0;
  running = true;
});
el('pauseButton').addEventListener('click',()=>running=false);
el('resetButton').addEventListener('click',()=>{
  clearGeometryComparison();
  index = 0;
  running = false;
  el('comparisonFeedback').textContent = '';
  updateAll();
});
el('showTrue').addEventListener('change',drawStress);
el('showPoints').addEventListener('change',drawStress);
el('langPt').addEventListener('click',()=>setLanguage('pt'));
el('langEn').addEventListener('click',()=>setLanguage('en'));

document.addEventListener('pointerdown',ev=>{
  if(ev.target.id === 'd0Input') beginGeometryComparison();
},true);
document.addEventListener('keydown',ev=>{
  if(ev.target.id === 'd0Input') beginGeometryComparison();
},true);
document.addEventListener('change',ev=>{
  if(ev.target.id === 'd0Input') clearGeometryComparison();
},true);
document.addEventListener('keyup',ev=>{
  if(ev.target.id === 'd0Input') clearGeometryComparison();
},true);
document.addEventListener('pointercancel',ev=>{
  if(ev.target.id === 'd0Input') clearGeometryComparison();
},true);

stressCanvas.addEventListener('pointerdown',ev=>{
  draggingStress = true;
  stressCanvas.setPointerCapture(ev.pointerId);
  dragStress(ev);
});
stressCanvas.addEventListener('pointermove',ev=>{ if(draggingStress) dragStress(ev); });
stressCanvas.addEventListener('pointerup',()=>draggingStress=false);
stressCanvas.addEventListener('pointercancel',()=>draggingStress=false);

el('revealButton').addEventListener('click',showChallengeAnswer);
window.addEventListener('resize',renderAll);

createSliders();
syncInputs();
applyTranslations();
updateAll();
requestAnimationFrame(animate);
