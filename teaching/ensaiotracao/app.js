'use strict';

const presets = {
  'Aço macio': { behaviour:'Patamar de cedência', E:200, fy:250, fu:450, L0:50, d0:10, epsU:0.15, epsF:0.25 },
  'Liga de alumínio': { behaviour:'Endurecimento suave', E:70, fy:280, fu:330, L0:50, d0:10, epsU:0.08, epsF:0.14 },
  'Material frágil': { behaviour:'Frágil', E:30, fy:0, fu:60, L0:50, d0:10, epsU:0.002, epsF:0.002 }
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

let params = {...presets['Aço macio']};
let data = null;
let index = 0;
let running = false;
let lastFrame = 0;
let draggingStress = false;

const el = id => document.getElementById(id);
const materialSelect = el('materialSelect');
const behaviourSelect = el('behaviourSelect');
const sliderGrid = el('sliderGrid');
const stressCanvas = el('stressCanvas');
const forceCanvas = el('forceCanvas');
const specimenCanvas = el('specimenCanvas');

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
    label.append(name, output);
    const input = document.createElement('input');
    input.type = 'range';
    input.id = `${c.key}Input`;
    input.min = c.min;
    input.max = c.max;
    input.step = c.step;
    input.addEventListener('input', () => {
      params[c.key] = Number(input.value);
      materialSelect.value = 'Definido pelo utilizador';
      normaliseParameters(c.key);
      updateAll();
    });
    wrap.append(label,input);
    sliderGrid.appendChild(wrap);
  }
}

function normaliseParameters(changedKey=''){
  if(params.behaviour !== 'Frágil'){
    if(params.fu < params.fy) params.fu = params.fy;
    const epsY = (params.fy*1e6)/(params.E*1e9);
    const epsPlateau = params.behaviour === 'Patamar de cedência' ? Math.max(0.02,1.05*epsY) : epsY;
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
    input.disabled = params.behaviour === 'Frágil' && ['fy','epsU','epsF'].includes(c.key);
    let v = params[c.key];
    if(c.key.startsWith('eps')) output.textContent = formatPT(v,3);
    else output.textContent = `${formatPT(v,c.step < 1 ? 1 : 0)} ${c.unit}`.trim();
  }
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

  if(p.behaviour === 'Frágil'){
    for(let i=0;i<N;i++) sigma[i] = Math.min(E*eps[i],fu);
  } else {
    const epsY = fy/E;
    const epsPlateau = p.behaviour === 'Patamar de cedência' ? Math.max(0.02,1.05*epsY) : epsY;
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
  if(p.behaviour !== 'Frágil'){
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
  if(params.behaviour === 'Frágil'){
    return e < Math.min(params.fu*1e6/E,params.epsF) ? 'Elástico' : 'Rotura';
  }
  const epsY = fy/E;
  const epsPlateau = params.behaviour === 'Patamar de cedência' ? Math.max(0.02,1.05*epsY) : epsY;
  if(e <= epsY) return 'Elástico';
  if(e <= epsPlateau) return 'Cedência';
  if(e <= params.epsU) return 'Encruamento';
  if(e < params.epsF) return 'Estricção';
  return 'Rotura';
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

function drawAxes(canvas, xMax, yMax, xLabel, yLabel){
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

function formatPT(v,digits){
  return Number(v).toFixed(digits).replace('.', ',');
}

function formatTick(v){
  if(v >= 1000) return formatPT(v,0);
  if(v >= 10) return formatPT(v,0);
  if(v >= 1) return formatPT(v,1);
  return formatPT(v,3);
}

function drawPolyline(ctx, xs, ys, mapX, mapY, width=2){
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
  const xMax = Math.max(params.epsF, showTrue ? maxTrueStrain : 0)*1.05;
  const maxEng = Math.max(...data.sigma)/1e6;
  const maxTrue = Math.max(...data.sigmaTrue.filter(Number.isFinite))/1e6;
  const yMax = Math.max(maxEng,showTrue?maxTrue:0)*1.12;
  const g = drawAxes(stressCanvas,xMax,yMax,'Extensão','Tensão [MPa]');
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
      const x=mapX(data.epsTrue[i]),y=mapY(data.sigmaTrue[i]/1e6);
      if(!started){ g.ctx.moveTo(x,y); started=true; } else g.ctx.lineTo(x,y);
    }
    g.ctx.stroke();
    g.ctx.setLineDash([]);
  }

  if(el('showPoints').checked){
    characteristicIndices().forEach(({i,label}) => {
      const x=mapX(data.eps[i]), y=mapY(data.sigma[i]/1e6);
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
  if(params.behaviour === 'Frágil'){
    return [{i:data.sigma.indexOf(Math.max(...data.sigma)),label:'Rotura'}];
  }
  const epsY = params.fy*1e6/(params.E*1e9);
  const iY = nearestIndex(data.eps,epsY);
  const iU = data.sigma.indexOf(Math.max(...data.sigma));
  return [{i:iY,label:'Cedência'},{i:iU,label:'Tensão última'},{i:data.eps.length-1,label:'Rotura'}];
}

function drawForce(){
  const xVals = data.delta.map(v=>v*1e3);
  const yVals = data.F.map(v=>v/1e3);
  const xMax = Math.max(...xVals)*1.05 || 1;
  const yMax = Math.max(...yVals)*1.12 || 1;
  const g = drawAxes(forceCanvas,xMax,yMax,'Alongamento [mm]','Força [kN]');
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
  const n=180;
  for(let j=0;j<n;j++){
    const x = L*j/(n-1);
    let r = dUniform/2;
    if(params.behaviour !== 'Frágil' && e > params.epsU){
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
  ctx.fillText(`Comprimento atual: ${formatPT(L,2)} mm`,18,h-18);
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
  if(params.behaviour !== 'Frágil' && e > params.epsU){
    const progress = Math.min((e-params.epsU)/Math.max(params.epsF-params.epsU,Number.EPSILON),1);
    dNow *= 1-0.42*progress;
  }
  const stage = stageName(e);
  el('sigmaValue').textContent = `${formatPT(sigma,1)} MPa`;
  el('epsilonValue').textContent = formatPT(e,5);
  el('forceValue').textContent = `${formatPT(F,2)} kN`;
  el('deltaValue').textContent = `${formatPT(delta,3)} mm`;
  el('diameterValue').textContent = `${formatPT(dNow,2)} mm`;
  el('stageValue').textContent = stage;
  el('stageBadge').textContent = stage;
}

function updateAll(){
  normaliseParameters();
  data = simulate(params);
  index = Math.min(index,data.eps.length-1);
  drawStress(); drawForce(); drawSpecimen(); updateReadouts();
}

function nearestIndex(arr,value){
  let lo=0, hi=arr.length-1;
  while(lo<hi){
    const mid=Math.floor((lo+hi)/2);
    if(arr[mid]<value) lo=mid+1; else hi=mid;
  }
  if(lo>0 && Math.abs(arr[lo-1]-value)<Math.abs(arr[lo]-value)) return lo-1;
  return lo;
}

function animate(t){
  if(running && data){
    const speed = Number(el('speedSlider').value);
    const interval = Math.max(12,90-speed*3);
    if(t-lastFrame > interval){
      index += Math.max(1,Math.round(speed/3));
      if(index >= data.eps.length-1){ index=data.eps.length-1; running=false; }
      drawStress(); drawForce(); drawSpecimen(); updateReadouts();
      lastFrame=t;
    }
  }
  requestAnimationFrame(animate);
}

function dragStress(ev){
  if(!data || !stressCanvas._graph) return;
  const rect=stressCanvas.getBoundingClientRect();
  const x=ev.clientX-rect.left;
  const g=stressCanvas._graph;
  const frac=Math.min(Math.max((x-g.m.l)/(g.w-g.m.l-g.m.r),0),1);
  const strain=frac*g.xMax;
  index=nearestIndex(data.eps,Math.min(strain,params.epsF));
  running=false;
  drawStress(); drawForce(); drawSpecimen(); updateReadouts();
}

materialSelect.addEventListener('change',()=>{
  if(materialSelect.value !== 'Definido pelo utilizador') params={...presets[materialSelect.value]};
  index=0; running=false; normaliseParameters(); updateAll();
});

behaviourSelect.addEventListener('change',()=>{
  params.behaviour=behaviourSelect.value;
  materialSelect.value='Definido pelo utilizador';
  normaliseParameters(); index=0; updateAll();
});

el('startButton').addEventListener('click',()=>{
  if(index>=data.eps.length-1) index=0;
  running=true;
});
el('pauseButton').addEventListener('click',()=>running=false);
el('resetButton').addEventListener('click',()=>{ index=0; running=false; updateAll(); });
el('showTrue').addEventListener('change',drawStress);
el('showPoints').addEventListener('change',drawStress);

stressCanvas.addEventListener('pointerdown',ev=>{draggingStress=true;stressCanvas.setPointerCapture(ev.pointerId);dragStress(ev);});
stressCanvas.addEventListener('pointermove',ev=>{if(draggingStress)dragStress(ev);});
stressCanvas.addEventListener('pointerup',()=>draggingStress=false);
stressCanvas.addEventListener('pointercancel',()=>draggingStress=false);

el('revealButton').addEventListener('click',()=>{
  const c=el('challengeSelect').value;
  const answers={
    'Duplicar o diâmetro':'Ao duplicar o diâmetro, a área inicial aumenta quatro vezes. Para a mesma tensão, a força aumenta quatro vezes. A curva tensão extensão do material não se altera.',
    'Duplicar o comprimento de referência':'Ao duplicar o comprimento de referência, o alongamento duplica para a mesma extensão. A curva tensão extensão e o nível de força não se alteram.',
    'Duplicar o módulo de Young':'Ao duplicar o módulo de Young, duplica o declive no regime elástico. Mantendo as resistências, a extensão correspondente ao início da cedência reduz para metade.',
    'Duplicar a área':'Para a mesma tensão, a força duplica. A curva tensão extensão do material não se altera.'
  };
  el('challengeAnswer').textContent=answers[c];
});

window.addEventListener('resize',()=>{drawStress();drawForce();drawSpecimen();});

createSliders();
syncInputs();
updateAll();
requestAnimationFrame(animate);
