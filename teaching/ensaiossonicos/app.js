/*
 * Laboratório Virtual de Ensaios Sónicos em Alvenaria
 * Modelo didático de ensaio direto. Não constitui modelo de propagação tridimensional
 * nem reprodução de registos instrumentais experimentais.
 * Frequência de aquisição: 125 kHz; intervalos de amostragem: 0,008 ms.
 */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const fs = 125000;
  const sampleIntervalMs = 1000 / fs;
  const tMax = 5.5;
  const count = Math.floor(tMax / sampleIntervalMs) + 1;
  const nu = 0.20;
  const poissonFactor = ((1 + nu) * (1 - 2 * nu)) / (1 - nu);
  const maxRepetitions = 10;
  // Os três níveis usam módulos dinâmicos hipotéticos constantes em cada série.
  // Com módulo e ν constantes, Vp varia inversamente com a raiz quadrada de ρ.
  const materials = {
    low: { eGpa: 1.20, name: 'Rigidez reduzida' },
    medium: { eGpa: 3.23, name: 'Rigidez intermédia' },
    high: { eGpa: 4.30, name: 'Rigidez elevada' }
  };
  const thicknessRange = [0.60, 2.50];
  const densityRange = [1500, 2800];
  let setup = { thickness: 1.2, rho: 2300, material: 'medium' };
  const $ = id => document.getElementById(id);
  const els = {
    materialSelect: $('materialSelect'), thicknessInput: $('thicknessInput'), rhoInput: $('rhoInput'), setupMessage: $('setupMessage'),
    startBtn: $('startBtn'), startLabel: $('startLabel'), resetBtn: $('resetBtn'), statusBadge: $('statusBadge'),
    inlineStatus: $('inlineStatus'), wallSvg: $('wallSvg'), stones: $('stones'), waveFront: $('waveFront'),
    wallThicknessLabel: $('wallThicknessLabel'),
    recordId: $('recordId'), forceChart: $('forceChart'), accChart: $('accChart'), rawCsvBtn: $('rawCsvBtn'), zoomSpan: $('zoomSpan'), zoomCentre: $('zoomCentre'), zoomCentreValue: $('zoomCentreValue'), focusImpactBtn: $('focusImpactBtn'), focusArrivalBtn: $('focusArrivalBtn'), impactTime: $('impactTime'),
    arrivalTime: $('arrivalTime'), travelResult: $('travelResult'), lengthResult: $('lengthResult'),
    studentV: $('studentV'), studentE: $('studentE'), calcForm: $('calcForm'), checkBtn: $('checkBtn'),
    revealBtn: $('revealBtn'), feedback: $('feedback'), revealPanel: $('revealPanel'), trueT: $('trueT'),
    trueV: $('trueV'), trueE: $('trueE'), testCounter: $('testCounter'), historyBody: $('historyBody'),
    meanV: $('meanV'), meanT: $('meanT'), stdT: $('stdT'), meanE: $('meanE'), stdV: $('stdV'), covV: $('covV'), csvBtn: $('csvBtn'), reportName: $('reportName'), reportNotes: $('reportNotes'), reportBtn: $('reportBtn'), reportSheet: $('reportSheet')
  };
  const params = new URLSearchParams(window.location.search);
  const requestedSeed = Number(params.get('seed'));
  let campaignSeed = Number.isSafeInteger(requestedSeed) && requestedSeed >= 1 && requestedSeed <= 999999999
    ? requestedSeed : Math.floor(100000 + Math.random() * 899999);
  let current = null;
  let history = [];
  let animationId = null;
  let animationStart = 0;
  let reveal = false;
  let selectedIteration = null;
  let cursorImpact = null;
  let cursorArrival = null;
  const fmt = (n, decimals = 2) => Number(n).toLocaleString('pt-PT', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
  });
  const svgel = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  };
  // Deterministic pseudorandom generator, enabling reproducible test series by URL seed.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a += 0x6D2B79F5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(rng) {
    const u = Math.max(rng(), 1e-10);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  }
  function dynamicE(v, density = setup.rho) { return density * v * v * poissonFactor / 1e9; }
  function showFeedback(type, title, details) {
    els.feedback.hidden = false;
    els.feedback.className = 'feedback' + (type === 'good' ? '' : ' ' + type);
    els.feedback.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = title;
    const rest = document.createElement('span');
    rest.textContent = details;
    els.feedback.append(heading, rest);
  }
  function hideFeedback() { els.feedback.hidden = true; els.feedback.replaceChildren(); }
  function setStatus(state, text) {
    els.statusBadge.className = 'status' + (state === 'running' ? ' running' : (state === 'finished' ? ' finished' : ''));
    els.statusBadge.innerHTML = '<span class="status-dot"></span> ' + text;
  }
  function clearAnimation() {
    if (animationId !== null) cancelAnimationFrame(animationId);
    animationId = null;
    els.waveFront.setAttribute('opacity', '0');
  }
  function buildStoneWall() {
    const rng = mulberry32(982312);
    els.stones.replaceChildren();
    const rows = [75, 109, 149, 190, 232, 280];
    const shades = ['#858a82', '#a3a59a', '#92958c', '#b0ada2', '#777e77', '#969587', '#a8a69b', '#b2b3aa', '#8b918c'];
    for (let row = 0; row < rows.length - 1; row++) {
      let x = 187;
      const y0 = rows[row], y1 = rows[row + 1];
      while (x < 555 - 3) {
        const width = Math.min(555 - x, 38 + 45 * rng());
        const right = x + width;
        const topLeft = y0 + (row === 0 ? 0 : (rng() - .5) * 5);
        const topRight = y0 + (row === 0 ? 0 : (rng() - .5) * 5);
        const bottomLeft = y1 + (row === rows.length - 2 ? 0 : (rng() - .5) * 5);
        const bottomRight = y1 + (row === rows.length - 2 ? 0 : (rng() - .5) * 5);
        const polygon = svgel('polygon', {
          points: `${x},${topLeft} ${right},${topRight} ${right},${bottomRight} ${x},${bottomLeft}`,
          fill: shades[Math.floor(rng() * shades.length)],
          stroke: '#d2cbbd', 'stroke-width': 3.2, 'stroke-linejoin': 'round'
        });
        els.stones.appendChild(polygon);
        for (let i = 0; i < 5; i++) {
          const speckX = x + rng() * width;
          const speckY = y0 + 6 + rng() * Math.max(2, y1 - y0 - 12);
          els.stones.appendChild(svgel('circle', {
            cx: speckX.toFixed(2), cy: speckY.toFixed(2), r: (.6 + rng() * 1.2).toFixed(2),
            fill: rng() < .5 ? '#555f5d' : '#d8d6c8', opacity: (.12 + .18 * rng()).toFixed(2)
          }));
        }
        x = right;
      }
    }
  }
  function makeSyntheticSignals(repetition) {
    const config = materials[setup.material];
    // A mesma semente produz a mesma perturbação de repetição, independentemente
    // da geometria e massa volúmica, para permitir estudos de sensibilidade.
    const rng = mulberry32((Math.imul(campaignSeed, 1664525) +
      Math.imul(repetition, 1013904223) + 3127) >>> 0);
    const t0 = 0.43 + .036 * (rng() - .5); // ms, início físico do impacto
    const baselineVp = Math.sqrt(config.eGpa * 1e9 / (setup.rho * poissonFactor));
    const idealTravel = setup.thickness / baselineVp * 1000; // ms
    // As propriedades do meio mantêm-se constantes em todas as repetições.
    // A dispersão é introduzida no tempo de chegada aparente por efeitos
    // didáticos de contacto/disparo e NÃO por alteração material entre impactos.
    const travel = idealTravel * (1 + .0075 * normal(rng));
    const tP = t0 + travel;
    const vp = 1000 * setup.thickness / travel; // velocidade aparente inferida
    const amplitude = .82 + .3 * rng();
    const attenuation = Math.exp(-.32 * (setup.thickness - 1.2));
    const force = new Float64Array(count);
    const acceleration = new Float64Array(count);
    const frequency1 = 7.3 + .7 * rng(); // kHz, cycles per ms
    const frequency2 = 11 + rng();
    const codaDelay = .46 + .14 * rng();
    for (let i = 0; i < count; i++) {
      const t = i * sampleIntervalMs;
      const d0 = t - t0;
      let impulse = 0;
      if (d0 >= 0 && d0 <= .2) {
        impulse = Math.sin(Math.PI * d0 / .2) ** 2;
      }
      force[i] = Math.max(-.03, Math.min(1.1, impulse * amplitude + .006 * normal(rng)));
      const d = t - tP;
      let pWave = 0;
      if (d > 0) {
        const rise = 1 - Math.exp(-d / .025);
        pWave = rise * (
          .47 * Math.exp(-d / .29) * Math.sin(2 * Math.PI * frequency1 * d) +
          .22 * Math.exp(-d / .54) * Math.sin(2 * Math.PI * frequency2 * d + .4)
        );
      }
      const echoT = tP + codaDelay;
      const echoD = t - echoT;
      const echo = echoD > 0
        ? .32 * (1 - Math.exp(-echoD / .030)) * Math.exp(-echoD / .60)
          * Math.sin(2 * Math.PI * 4.8 * echoD + .1) : 0;
      acceleration[i] = attenuation * (pWave + echo) + .012 * normal(rng);
    }
    return { force, acceleration, t0, tP, travel, vp, e: dynamicE(vp), length: setup.thickness,
      rho: setup.rho, material: setup.material, baselineE: config.eGpa, baselineVp,
      repetition, seed: campaignSeed, startDate: new Date().toISOString() };
  }
  // SVG charts use the same explicit time domain and sampling interval.
  const chart = { left: 64, right: 963, top: 18, bottom: 188, centreForce: 155, centreAcc: 111 };
  function timeDomain() {
    const span = Number(els.zoomSpan.value) || tMax;
    const centre = Number(els.zoomCentre.value);
    if (span >= tMax) return [0, tMax];
    const left = Math.max(0, Math.min(tMax - span, centre - span / 2));
    return [left, left + span];
  }
  function refreshZoom() {
    els.zoomCentreValue.textContent = fmt(Number(els.zoomCentre.value), 2) + ' ms';
    els.zoomCentre.disabled = Number(els.zoomSpan.value) >= tMax;
    renderSignals();
    sweepProgress(1);
  }
  function focusAt(t) {
    if (!Number.isFinite(t)) return;
    if (Number(els.zoomSpan.value) >= tMax) els.zoomSpan.value = '0.5';
    els.zoomCentre.value = String(Math.min(tMax, Math.max(0, t)));
    refreshZoom();
  }
  const chartX = t => { const [a, b] = timeDomain(); return chart.left + (t - a) * (chart.right - chart.left) / (b - a); };
  const chartTime = x => { const [a, b] = timeDomain(); return Math.max(a, Math.min(b, (x - chart.left) * (b - a) / (chart.right - chart.left) + a)); };
  function chartMarkup(kind) {
    const svgId = kind === 'force' ? 'force' : 'acc';
    const mid = kind === 'force' ? chart.centreForce : chart.centreAcc;
    let parts = `<defs><clipPath id="clip-${svgId}"><rect x="${chart.left}" y="${chart.top}" width="${chart.right - chart.left}" height="${chart.bottom - chart.top + 3}" /></clipPath><clipPath id="sweep-${svgId}"><rect id="sweep-rect-${svgId}" x="${chart.left}" y="${chart.top}" width="${chart.right - chart.left}" height="${chart.bottom - chart.top + 3}" /></clipPath></defs>`;
    const [minTime, maxTime] = timeDomain();
    const tickStep = maxTime - minTime <= 2.5 ? 0.5 : 1;
    const firstTick = Math.ceil((minTime - 1e-6) / tickStep);
    const lastTick = Math.floor((maxTime + 1e-6) / tickStep);
    for (let k = firstTick; k <= lastTick; k++) {
      const t = k * tickStep;
      const x = chartX(t);
      const tickLabel = tickStep === 1 ? String(t) : fmt(t, 1);
      parts += `<line class="grid-line" x1="${x}" y1="${chart.top}" x2="${x}" y2="${chart.bottom}" /><text class="axis-text" x="${x}" y="208" text-anchor="middle">${tickLabel}</text>`;
    }
    for (let y = 37; y <= 163; y += 42) parts += `<line class="grid-line" x1="${chart.left}" y1="${y}" x2="${chart.right}" y2="${y}" />`;
    parts += `<line class="zero-line" x1="${chart.left}" y1="${mid}" x2="${chart.right}" y2="${mid}" />`;
    parts += '<text class="xlabel" x="964" y="227" text-anchor="end">Tempo [ms]</text>';
    parts += `<g clip-path="url(#clip-${svgId})"><g clip-path="url(#sweep-${svgId})"><path class="signal-path" id="path-${svgId}" stroke="${kind === 'force' ? '#4d87b0' : '#268b90'}" /></g></g>`;
    parts += `<g id="markers-${svgId}"></g>`;
    parts += `<g id="placeholder-${svgId}"><text x="505" y="113" text-anchor="middle" class="no-signal">À espera da primeira aquisição</text></g>`;
    return parts;
  }
  function renderSignals() {
    for (const kind of ['force', 'acc']) {
      const svg = kind === 'force' ? els.forceChart : els.accChart;
      const value = current && (kind === 'force' ? current.force : current.acceleration);
      const path = svg.querySelector('#path-' + kind);
      const placeholder = svg.querySelector('#placeholder-' + kind);
      placeholder.style.display = value ? 'none' : '';
      if (!value) { path.setAttribute('d', ''); continue; }
      const centre = kind === 'force' ? chart.centreForce : chart.centreAcc;
      const scale = kind === 'force' ? 112 : 116;
      const result = [];
      for (let i = 0; i < value.length; i++) {
        const x = chartX(i * sampleIntervalMs);
        const y = Math.max(chart.top, Math.min(chart.bottom, centre - value[i] * scale));
        result.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
      }
      path.setAttribute('d', result.join(' '));
    }
    drawCursors();
  }
  function drawCursors() {
    for (const [kind, selected, truth] of [
      ['force', cursorImpact, current && current.t0],
      ['acc', cursorArrival, current && current.tP]
    ]) {
      const parent = $(kind === 'force' ? 'markers-force' : 'markers-acc');
      parent.replaceChildren();
      const [minTime, maxTime] = timeDomain();
      if (selected !== null && Number.isFinite(selected) && selected >= minTime && selected <= maxTime)
        addMarker(parent, selected, kind === 'force' ? 't₀' : 'tₚ', 'cursor-line');
      if (reveal && Number.isFinite(truth) && truth >= minTime && truth <= maxTime) addMarker(parent, truth, 'ref.', 'true-line');
    }
  }
  function addMarker(parent, t, label, cls) {
    const x = chartX(t);
    parent.appendChild(svgel('line', { x1: x, x2: x, y1: chart.top, y2: chart.bottom, class: cls }));
    const labelPos = x < chart.left + 44 ? x + 5 : x > chart.right - 42 ? x - 5 : x + 6;
    const anchor = x > chart.right - 42 ? 'end' : 'start';
    const text = svgel('text', { x: labelPos, y: 25, 'text-anchor': anchor,
      fill: cls === 'cursor-line' ? '#b0772f' : '#8f669f', 'font-size': 15, 'font-weight': 'bold' });
    text.textContent = label;
    parent.appendChild(text);
  }
  function sweepProgress(progress) {
    const width = Math.max(0, Math.min(1, progress)) * (chart.right - chart.left);
    for (const kind of ['force', 'acc']) {
      const rect = $('sweep-rect-' + kind);
      rect.setAttribute('width', width.toFixed(1));
    }
  }
  function animateAcquisition() {
    clearAnimation();
    sweepProgress(0);
    animationStart = performance.now();
    setStatus('running', 'A adquirir');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { finishAnimation(); return; }
    const duration = 1950;
    function frame(now) {
      const p = Math.max(0, Math.min(1, (now - animationStart) / duration));
      sweepProgress(p);
      // Sincronização com o tempo de propagação obtido do modelo físico.
      // A aquisição é reproduzida lentamente; as proporções temporais são mantidas.
      const simulatedTime = p * tMax;
      const waveP = (simulatedTime - current.t0) / current.travel;
      if (waveP >= 0 && waveP <= 1) {
        const x = 195 + 345 * waveP;
        els.waveFront.setAttribute('transform', `translate(${(x - 195).toFixed(1)} 0)`);
        els.waveFront.setAttribute('opacity', Math.min(1, waveP * 9, (1 - waveP) * 9).toFixed(2));
      } else els.waveFront.setAttribute('opacity', '0');
      if (p < 1) animationId = requestAnimationFrame(frame);
      else finishAnimation();
    }
    animationId = requestAnimationFrame(frame);
  }
  function finishAnimation() {
    clearAnimation();
    sweepProgress(1);
    setStatus('finished', 'Registo disponível');
    els.inlineStatus.textContent = 'Registo concluído. Marque o início do impacto e a primeira chegada da onda P.';
    els.impactTime.disabled = false;
    els.arrivalTime.disabled = false;
    els.studentV.disabled = false;
    els.studentE.disabled = false;
    els.checkBtn.disabled = false;
    els.startBtn.disabled = true;
    els.rawCsvBtn.disabled = false;
    els.zoomSpan.disabled = false;
    els.zoomCentre.disabled = Number(els.zoomSpan.value) >= tMax;
  }
  function setCursor(kind, time) {
    if (!current || !Number.isFinite(time)) return;
    const t = Math.round(Math.max(0, Math.min(tMax, time)) / sampleIntervalMs) * sampleIntervalMs;
    const effectiveTime = Math.min(tMax, t);
    if (kind === 'force') {
      cursorImpact = effectiveTime;
      els.impactTime.value = effectiveTime.toFixed(3);
    } else {
      cursorArrival = effectiveTime;
      els.arrivalTime.value = effectiveTime.toFixed(3);
    }
    updateTravelTime();
    drawCursors();
    els.focusImpactBtn.disabled = cursorImpact === null;
    els.focusArrivalBtn.disabled = cursorArrival === null;
    if (!current.validated) hideFeedback();
  }
  function bindChart(svg, kind) {
    let dragging = false;
    function fromPointer(evt) {
      if (!current || current.validated || animationId !== null) return;
      const transform = svg.getScreenCTM();
      if (!transform) return;
      const point = svg.createSVGPoint();
      point.x = evt.clientX;
      point.y = evt.clientY;
      const pointLocal = point.matrixTransform(transform.inverse());
      setCursor(kind, chartTime(pointLocal.x));
    }
    svg.addEventListener('pointerdown', evt => {
      if (!current || current.validated || animationId !== null) return;
      dragging = true;
      try { svg.setPointerCapture(evt.pointerId); } catch (_) { /* browser fallback */ }
      fromPointer(evt);
    });
    svg.addEventListener('pointermove', evt => { if (dragging) fromPointer(evt); });
    const finish = evt => {
      dragging = false;
      if (svg.hasPointerCapture && svg.hasPointerCapture(evt.pointerId)) svg.releasePointerCapture(evt.pointerId);
    };
    svg.addEventListener('pointerup', finish);
    svg.addEventListener('pointercancel', finish);
  }
  function updateTravelTime() {
    const length = setup.thickness;
    els.lengthResult.textContent = fmt(length) + ' m';
    if (cursorImpact === null || cursorArrival === null) {
      els.travelResult.textContent = 'Por determinar';
      return;
    }
    const travel = cursorArrival - cursorImpact;
    els.travelResult.textContent = travel > 0 ? fmt(travel, 3) + ' ms' : 'Instantes inválidos';
  }
  function readConfiguration() {
    const thickness = parseInput(els.thicknessInput.value);
    const rho = parseInput(els.rhoInput.value);
    if (!Number.isFinite(thickness) || thickness < thicknessRange[0] || thickness > thicknessRange[1])
      return { error: 'Introduza uma espessura entre 0,60 e 2,50 m.' };
    if (!Number.isFinite(rho) || rho < densityRange[0] || rho > densityRange[1])
      return { error: 'Introduza uma massa volúmica entre 1500 e 2800 kg/m³.' };
    if (!materials[els.materialSelect.value])
      return { error: 'Selecione uma condição mecânica válida.' };
    return { thickness, rho, material: els.materialSelect.value };
  }
  function applyConfiguration() {
    const next = readConfiguration();
    if (next.error) {
      els.setupMessage.textContent = next.error;
      els.setupMessage.classList.add('invalid');
      if (!current) els.startBtn.disabled = true;
      return false;
    }
    setup = next;
    els.setupMessage.textContent = 'Parâmetros válidos. Inicie o ensaio.';
    els.setupMessage.classList.remove('invalid');
    els.wallThicknessLabel.textContent = fmt(setup.thickness) + ' m';
    updateTravelTime();
    if (!current) els.startBtn.disabled = false;
    return true;
  }
  function lockConfiguration(locked) {
    els.materialSelect.disabled = locked;
    els.thicknessInput.disabled = locked;
    els.rhoInput.disabled = locked;
    els.setupMessage.textContent = locked
      ? 'Parâmetros fixos durante a série. Reinicie as medições para os alterar.'
      : 'Parâmetros válidos. Inicie o ensaio.';
  }
  function startAcquisition() {
    if (animationId !== null || history.length >= maxRepetitions || (current && !current.validated)) return;
    if (!applyConfiguration()) return;
    const n = history.length + 1;
    current = makeSyntheticSignals(n);
    current.validated = false;
    current.attempted = false;
    cursorImpact = null;
    cursorArrival = null;
    reveal = false;
    selectedIteration = null;
    els.focusImpactBtn.disabled = true;
    els.focusArrivalBtn.disabled = true;
    els.impactTime.value = '';
    els.arrivalTime.value = '';
    els.studentV.value = '';
    els.studentE.value = '';
    els.revealPanel.hidden = true;
    els.revealBtn.textContent = 'Revelar referência';
    els.revealBtn.disabled = true;
    hideFeedback();
    els.recordId.textContent = `Registo ${String(n).padStart(2, '0')} · ${campaignSeed}`;
    els.testCounter.textContent = `Medição ${n} / ${maxRepetitions}`;
    els.inlineStatus.textContent = 'Impacto e resposta do acelerómetro em aquisição (animação didática).';
    renderSignals();
    updateTravelTime();
    els.startBtn.disabled = true;
    els.rawCsvBtn.disabled = true;
    els.zoomSpan.disabled = true;
    els.zoomCentre.disabled = true;
    lockConfiguration(true);
    els.impactTime.disabled = true;
    els.arrivalTime.disabled = true;
    els.studentV.disabled = true;
    els.studentE.disabled = true;
    els.checkBtn.disabled = true;
    animateAcquisition();
  }
  function parseInput(v) {
    const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return NaN;
    return Number(s);
  }
  function verifyCalculations(event) {
    event.preventDefault();
    if (!current || current.validated || animationId !== null) return;
    if (cursorImpact === null || cursorArrival === null || cursorArrival <= cursorImpact) {
      showFeedback('warning', 'Defina corretamente os cursores.', 'Assinale o instante de impacto e um instante posterior para a chegada da onda P.');
      return;
    }
    const delta = cursorArrival - cursorImpact;
    if (delta < .08) {
      showFeedback('warning', 'Intervalo demasiado curto.', 'Reveja as posições dos dois cursores.');
      return;
    }
    const v = parseInput(els.studentV.value);
    const e = parseInput(els.studentE.value);
    if (!Number.isFinite(v) || !Number.isFinite(e) || v <= 0 || e <= 0 || v > 10000 || e > 100) {
      showFeedback('warning', 'Introduza dois valores positivos válidos.', 'A velocidade deve ser indicada em m/s e o módulo dinâmico em GPa. Pode usar vírgula decimal.');
      return;
    }
    const expectedV = 1000 * current.length / delta;
    const expectedE = dynamicE(expectedV);
    current.attempted = true;
    els.revealBtn.disabled = false;
    const vOk = Math.abs(v / expectedV - 1) <= .015;
    const eOk = Math.abs(e / expectedE - 1) <= .03;
    const timeError = Math.abs(delta / current.travel - 1);
    // O limiar de 3% é exclusivamente um critério pedagógico configurado para
    // esta simulação, NÃO uma tolerância normativa para ensaios reais.
    const pickOk = timeError <= .03;
    if (vOk && eOk && !pickOk) {
      current.pickIssue = true;
      const detail = `Os cálculos estão consistentes com os cursores, mas o intervalo selecionado difere ${fmt(100 * timeError, 1)}% do tempo sintético de referência. Reveja o início do impacto e a primeira perturbação no recetor.`;
      showFeedback('warning', 'Cálculo correto; leitura experimental a rever.', detail);
      return;
    }
    if (vOk && eOk && pickOk) {
      current.validated = true;
      current.t0Selected = cursorImpact;
      current.tPSelected = cursorArrival;
      current.userV = v;
      current.userE = e;
      selectedIteration = current.repetition;
      history.push({ iteration: current.repetition, t0: cursorImpact, tP: cursorArrival,
        delta, v: expectedV, e: expectedE, vUser: v, eUser: e,
        referenceV: current.vp, referenceTravel: current.travel,
        timeError: 100 * timeError, assisted: Boolean(current.revealed), data: current });
      showFeedback('good', 'Medição validada: cálculo e identificação consistentes.',
        `Vₚ = ${fmt(expectedV, 0)} m/s e E𝒅 = ${fmt(expectedE, 2)} GPa. ` +
        `O desvio relativamente ao tempo sintético gerado é ${fmt(100 * timeError, 1)}%. ` +
        'Esta tolerância de 3% é um critério didático, não um limite normativo.');
      els.startBtn.disabled = history.length >= maxRepetitions;
      els.startLabel.textContent = history.length >= maxRepetitions ? 'Campanha concluída' : 'Nova repetição';
      els.checkBtn.disabled = true;
      els.impactTime.disabled = true;
      els.arrivalTime.disabled = true;
      els.studentV.disabled = true;
      els.studentE.disabled = true;
      updateHistory();
      els.inlineStatus.textContent = history.length >= maxRepetitions
        ? 'Dez medições registadas. Consulte as estatísticas e gere o relatório.'
        : 'Cálculos verificados. Pode revelar a referência e iniciar nova repetição.';
    } else {
      const detail = 'Reveja os cálculos e as conversões de unidades. Utilize as equações fornecidas nos materiais do curso e tente novamente.';
      showFeedback('warning', 'Erro de cálculo.', detail);
    }
  }
  function revealReference() {
    if (!current || !current.attempted) return;
    reveal = true;
    current.revealed = true;
    const record = history.find(r => r.iteration === current.repetition);
    if (record && !current.validated) record.assisted = true;
    els.revealPanel.hidden = false;
    els.trueT.textContent = fmt(current.travel, 3) + ' ms';
    els.trueV.textContent = fmt(current.vp, 0) + ' m/s';
    els.trueE.textContent = fmt(current.e, 2) + ' GPa';
    els.revealBtn.textContent = 'Referência revelada';
    els.revealBtn.disabled = true;
    drawCursors();
  }
  function seriesStatistics() {
    if (!history.length) return null;
    const mean = values => values.reduce((sum, v) => sum + v, 0) / values.length;
    const std = values => values.length > 1
      ? Math.sqrt(values.reduce((sum, v) => sum + (v - mean(values)) ** 2, 0) / (values.length - 1)) : null;
    const times = history.map(r => r.delta);
    const velocities = history.map(r => r.v);
    const meanTime = mean(times);
    const representativeV = 1000 * setup.thickness / meanTime;
    return { n: history.length, meanTime, stdTime: std(times),
      representativeV, representativeE: dynamicE(representativeV),
      stdV: std(velocities), meanV: mean(velocities),
      covV: history.length > 1 ? 100 * std(velocities) / mean(velocities) : null };
  }
  function updateHistory() {
    els.historyBody.replaceChildren();
    const stats = seriesStatistics();
    if (!stats) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'empty-row'; td.colSpan = 4;
      td.textContent = 'Sem resultados. Inicie o primeiro ensaio.';
      tr.appendChild(td); els.historyBody.appendChild(tr);
      for (const id of ['meanV', 'meanE', 'meanT', 'stdT', 'stdV', 'covV']) els[id].textContent = '—';
      els.csvBtn.disabled = true;
      els.reportBtn.disabled = true;
      return;
    }
    for (const r of history) {
      const tr = document.createElement('tr');
      tr.className = selectedIteration === r.iteration ? 'history-selected' : '';
      const first = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'history-link';
      button.textContent = `Reg. ${String(r.iteration).padStart(2, '0')}`;
      button.title = 'Consultar sinais desta medição';
      button.setAttribute('aria-label', `Ver os sinais da medição ${r.iteration}`);
      button.addEventListener('click', () => selectHistory(r.iteration));
      first.appendChild(button);
      tr.append(first);
      for (const val of [fmt(r.delta, 3), fmt(r.v, 0), fmt(r.e, 2)]) {
        const td = document.createElement('td'); td.textContent = val; tr.appendChild(td);
      }
      els.historyBody.appendChild(tr);
    }
    els.meanT.textContent = fmt(stats.meanTime, 3) + ' ms';
    els.stdT.textContent = stats.stdTime === null ? '—' : fmt(stats.stdTime, 3) + ' ms';
    els.meanV.textContent = fmt(stats.representativeV, 0) + ' m/s';
    els.meanE.textContent = fmt(stats.representativeE, 2) + ' GPa';
    els.stdV.textContent = stats.stdV === null ? '—' : fmt(stats.stdV, 1) + ' m/s';
    els.covV.textContent = stats.covV === null ? '—' : fmt(stats.covV, 2) + ' %';
    els.csvBtn.disabled = false;
    els.reportBtn.disabled = false;
  }
  function selectHistory(iteration) {
    if (current && !current.validated) {
      els.inlineStatus.textContent = 'Conclua primeiro a medição atual antes de consultar os registos anteriores.';
      return;
    }
    const record = history.find(r => r.iteration === iteration);
    if (!record) return;
    selectedIteration = iteration;
    current = record.data;
    cursorImpact = record.t0;
    cursorArrival = record.tP;
    reveal = Boolean(current.revealed);
    els.recordId.textContent = `Registo ${String(iteration).padStart(2, '0')} · ${campaignSeed}`;
    els.testCounter.textContent = `Medição ${iteration} / ${maxRepetitions}`;
    els.impactTime.value = cursorImpact.toFixed(3);
    els.arrivalTime.value = cursorArrival.toFixed(3);
    els.studentV.value = String(record.vUser);
    els.studentE.value = String(record.eUser);
    for (const id of ['impactTime', 'arrivalTime', 'studentV', 'studentE', 'checkBtn']) els[id].disabled = true;
    els.revealBtn.disabled = reveal;
    els.revealBtn.textContent = reveal ? 'Referência revelada' : 'Revelar referência';
    els.revealPanel.hidden = !reveal;
    if (reveal) {
      els.trueT.textContent = fmt(current.travel, 3) + ' ms';
      els.trueV.textContent = fmt(current.vp, 0) + ' m/s';
      els.trueE.textContent = fmt(current.e, 2) + ' GPa';
    }
    els.rawCsvBtn.disabled = false;
    els.focusImpactBtn.disabled = false;
    els.focusArrivalBtn.disabled = false;
    els.zoomSpan.disabled = false;
    els.zoomCentre.disabled = Number(els.zoomSpan.value) >= tMax;
    els.startBtn.disabled = history.length >= maxRepetitions;
    els.startLabel.textContent = history.length >= maxRepetitions ? 'Série concluída' : 'Nova repetição';
    els.inlineStatus.textContent = `A consultar o registo ${iteration}. Os cursores estão preservados; pode consultar os sinais ou gerar o relatório.`;
    setStatus('finished', 'Registo consultado');
    hideFeedback();
    renderSignals();
    sweepProgress(1);
    updateTravelTime();
    updateHistory();
  }
  function exportCsv() {
    if (!history.length) return;
    const lines = [
      '# Laboratório virtual: ensaios sónicos diretos em alvenaria',
      `# Sem dados reais: sinais sinteticos; semente=${campaignSeed}; condicao=${setup.material}`,
      `# L=${setup.thickness} m; rho=${setup.rho} kg/m3; nu=${nu}; fs=${fs} Hz`,
      '# VP e Ed calculados a partir dos cursores; serie estatistica determinada sobre os tempos',
      'ensaio;t0_ms;tP_ms;delta_t_ms;Vp_m_s;Ed_GPa;Vp_introduzida_m_s;Ed_introduzido_GPa;Vp_interna_simulador_m_s;delta_interno_simulador_ms;erro_tempo_percentagem;referencia_consultada_antes_da_validacao'
    ];
    for (const r of history) {
      lines.push([r.iteration, r.t0, r.tP, r.delta, r.v, r.e, r.vUser, r.eUser, r.referenceV, r.referenceTravel, r.timeError, r.assisted ? 1 : 0]
        .map((v, index) => (index === 0 || index === 11) ? String(v) : (typeof v === 'number' ? v.toFixed(6).replace('.', ',') : String(v))).join(';'));
    }
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ensaios_sonicos_${setup.material}_seed${campaignSeed}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportRawCsv() {
    if (!current) return;
    const lines = [
      '# Sinais sinteticos de ensaio sonico direto',
      `# semente=${campaignSeed}; repeticao=${current.repetition}; L=${current.length} m; rho=${current.rho} kg/m3; nu=${nu}; fs=${fs} Hz`,
      '# Forca e aceleracao normalizadas, sem calibracao metrologica',
      'tempo_ms;forca_normalizada;aceleracao_normalizada'
    ];
    for (let i = 0; i < count; i++) {
      const values = [i * sampleIntervalMs, current.force[i], current.acceleration[i]];
      lines.push(values.map(v => v.toFixed(6).replace('.', ',')).join(';'));
    }
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sinais_sonicos_${setup.material}_rep${current.repetition}_seed${campaignSeed}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[ch]));
  }
  function reportPlot(kind, measurement) {
    const values = kind === 'force' ? measurement.force : measurement.acceleration;
    const center = kind === 'force' ? 111 : 83;
    const scale = kind === 'force' ? 78 : 83;
    let d = '';
    for (let i = 0; i < values.length; i++) {
      const x = 58 + 832 * i / (values.length - 1);
      const y = Math.min(144, Math.max(10, center - values[i] * scale));
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    const t = kind === 'force' ? measurement.t0Selected : measurement.tPSelected;
    const cursorX = 58 + 832 * t / tMax;
    return `<svg class="report-chart" viewBox="0 0 920 172" role="img" aria-label="Sinal sintético de ${kind === 'force' ? 'força' : 'aceleração'} do registo selecionado"><line x1="58" y1="144" x2="890" y2="144" stroke="#a7b6c0"/>`+
      `<path d="${d}" fill="none" stroke="${kind === 'force' ? '#4d87b0' : '#268b90'}" stroke-width="1.5"/>`+
      `<line x1="${cursorX.toFixed(2)}" y1="8" x2="${cursorX.toFixed(2)}" y2="145" stroke="#b47b31" stroke-width="2" stroke-dasharray="5 4"/>`+
      `<text x="58" y="165" font-size="13" fill="#506d7d">0 ms</text><text x="889" y="165" text-anchor="end" font-size="13" fill="#506d7d">5,5 ms</text></svg>`;
  }
  function generateReport() {
    if (!history.length) return;
    // A tabela conserva apenas medições aceites, sem alterar os registos existentes.
    const s = seriesStatistics();
    const chosen = history.find(r => r.iteration === selectedIteration) || history[history.length - 1];
    const name = escapeHtml(els.reportName.value.trim() || 'Não indicado');
    const notes = escapeHtml(els.reportNotes.value.trim() || 'Não indicadas').replace(/\n/g, '<br>');
    const continuedHeader = history.length >= 7 ? `<div class="report-continued"><div><div class="continued-kicker">CURSO FUNDEC · ENSAIO SÓNICO DIRETO</div><strong>RELATÓRIO DE ENSAIO SÓNICO EM ALVENARIA</strong><small>Continuação · ${history.length} medições</small></div><div class="continued-logos"><img src="${document.getElementById('fundecLogo').getAttribute('src')}" alt="FUNDEC"><img src="${document.getElementById('tecnicoLogo').getAttribute('src')}" alt="Técnico Lisboa"></div></div>` : '';
    const rows = history.map(r => `<tr><td>${r.iteration}</td><td>${fmt(r.t0, 3)}</td><td>${fmt(r.tP, 3)}</td><td>${fmt(r.delta, 3)}</td><td>${fmt(r.v, 0)}</td><td>${fmt(r.e, 2)}</td><td>${fmt(r.timeError, 1)}</td><td>${r.assisted ? 'Sim' : 'Não'}</td></tr>`).join('');
    const fundecSrc = document.getElementById('fundecLogo').getAttribute('src');
    const tecnicoSrc = document.getElementById('tecnicoLogo').getAttribute('src');
    els.reportSheet.innerHTML = `<div class="report-head">
      <div class="report-course"><span class="report-course-rule" aria-hidden="true"></span><span><b>CURSO FUNDEC</b>CARACTERIZAÇÃO DE ESTRUTURAS EXISTENTES<br>PARA APOIO À AVALIAÇÃO DA SEGURANÇA ESTRUTURAL</span></div>
      <div class="report-logos"><img src="${fundecSrc}" alt="FUNDEC"><img src="${tecnicoSrc}" alt="Técnico Lisboa"></div>
      </div>
      <div class="report-title-band"><div class="report-eyebrow">LABORATÓRIO VIRTUAL <span>·</span> ENSAIO DIRETO</div><h1>RELATÓRIO DE ENSAIO<br>SÓNICO EM ALVENARIA</h1><div class="report-title-bottom"><span>Documento didático com dados sintéticos</span><strong>SIMULAÇÃO EDUCATIVA</strong></div></div>
      <div class="report-meta"><div><b>Participantes</b><span>${name}</span></div><div><b>Identificador da série</b><span>${campaignSeed}</span></div><div><b>Data da exportação</b><span>${new Date().toLocaleDateString('pt-PT')}</span></div></div>
      <h2>1. Configuração e hipóteses</h2>
      <p>Condição mecânica: ${escapeHtml(materials[setup.material].name)}. Espessura: ${fmt(setup.thickness, 2)} m. Massa volúmica: ${fmt(setup.rho, 0)} kg/m³. Coeficiente de Poisson: ${fmt(nu, 2)}. Frequência de aquisição: 125 kHz (8 µs entre amostras). Configuração direta, com emissor e recetor em faces opostas.</p>
      <p>Modelo equivalente homogéneo, isotrópico e elástico. Velocidade e módulo calculados com Vₚ = L / Δt e E𝒅 = ρ Vₚ² (1 + ν)(1 − 2ν)/(1 − ν). Os sinais são gerados por um modelo didático sem calibração com ensaios reais.</p>
      <h2>2. Registos e resultados</h2>
      <table class="report-table"><thead><tr><th>N.º</th><th>t₀ [ms]</th><th>tₚ [ms]</th><th>Δt [ms]</th><th>Vₚ [m/s]</th><th>E𝒅 [GPa]</th><th>Erro Δt [%]</th><th>Referência*</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="report-footnote">* Referência indica se o participante consultou os valores internos da simulação antes de concluir a medição. O erro de Δt compara o valor lido com o intervalo sintético gerado; não constitui uma medida de precisão experimental real.</p>
      <div class="report-metrics"><div><small>Número de medições</small><strong>${s.n}</strong></div><div><small>Tempo médio</small><strong>${fmt(s.meanTime, 3)} ms</strong></div><div><small>Desvio padrão de Δt</small><strong>${s.stdTime === null ? 'N/D' : fmt(s.stdTime, 3) + ' ms'}</strong></div><div><small>Vₚ representativa</small><strong>${fmt(s.representativeV, 0)} m/s</strong></div><div><small>E𝒅 representativo</small><strong>${fmt(s.representativeE, 2)} GPa</strong></div><div><small>CV de Vₚ</small><strong>${s.covV === null ? 'N/D' : fmt(s.covV, 2) + ' %'}</strong></div></div>
      ${continuedHeader}<h2>3. Sinais da medição ${chosen.iteration}</h2>
      <p>Registos instrumentais sintéticos normalizados, com os cursores preservados após validação.</p><div class="report-plots"><div><strong>Força do martelo</strong>${reportPlot('force', chosen.data)}</div><div><strong>Aceleração no recetor</strong>${reportPlot('acc', chosen.data)}</div></div>
      <h2>4. Observações do participante</h2><p>${notes}</p>
      <h2>5. Limitações e referência</h2><p>O critério de aceitação de 3% para identificação do tempo é exclusivamente pedagógico. As amplitudes são normalizadas e não representam leituras calibradas de força ou aceleração. O módulo dinâmico corresponde a uma estimativa equivalente, não à medição direta de um módulo estático nem da resistência à compressão.</p><p>Referência científica: Arêde et al. (2026), <em>Caracterização mecânica in situ de alvenarias antigas através de ensaios sónicos e de macacos planos</em>, rpee, Série III, n.º 31.</p>`;
    els.reportSheet.classList.toggle('long-series', history.length >= 7);
    els.reportSheet.classList.toggle('compact-series', history.length >= 2 && history.length <= 6);
    els.reportSheet.hidden = false;
    // O diálogo de impressão permite guardar como PDF sem bibliotecas externas.
    window.print();
  }
  function reset({ newSeed = false } = {}) {
    clearAnimation();
    if (newSeed) campaignSeed = Math.floor(100000 + Math.random() * 899999);
    history = [];
    current = null;
    selectedIteration = null;
    reveal = false;
    cursorImpact = null;
    cursorArrival = null;
    lockConfiguration(false);
    applyConfiguration();
    els.recordId.textContent = 'Sem registo';
    els.testCounter.textContent = 'Medição 0 / 10';
    els.impactTime.value = '';
    els.arrivalTime.value = '';
    els.studentV.value = '';
    els.studentE.value = '';
    els.impactTime.disabled = true;
    els.arrivalTime.disabled = true;
    els.studentV.disabled = true;
    els.studentE.disabled = true;
    els.checkBtn.disabled = true;
    els.revealBtn.disabled = true;
    els.rawCsvBtn.disabled = true;
    els.zoomSpan.disabled = false;
    els.zoomSpan.value = '5.5';
    els.zoomCentre.value = '2.75';
    els.focusImpactBtn.disabled = true;
    els.focusArrivalBtn.disabled = true;
    els.reportSheet.hidden = true;
    els.revealBtn.textContent = 'Revelar referência';
    els.revealPanel.hidden = true;
    els.startBtn.disabled = Boolean(readConfiguration().error);
    els.startLabel.textContent = 'Iniciar ensaio';
    els.inlineStatus.textContent = 'Defina a espessura, a massa volúmica e a condição mecânica; depois inicie o ensaio.';
    setStatus('ready', 'Pronto');
    hideFeedback();
    refreshZoom();
    updateTravelTime();
    updateHistory();
  }
  function handleTimeInput(kind, input) {
    const value = Number(input.value);
    if (input.value.trim() === '' || !Number.isFinite(value) || value < 0 || value > tMax) {
      if (kind === 'force') cursorImpact = null;
      else cursorArrival = null;
      els.focusImpactBtn.disabled = cursorImpact === null;
      els.focusArrivalBtn.disabled = cursorArrival === null;
      drawCursors(); updateTravelTime(); return;
    }
    setCursor(kind, value);
  }
  // User interface binding.
  buildStoneWall();
  els.forceChart.innerHTML = chartMarkup('force');
  els.accChart.innerHTML = chartMarkup('acc');
  bindChart(els.forceChart, 'force');
  bindChart(els.accChart, 'acc');
  els.startBtn.addEventListener('click', startAcquisition);
  els.resetBtn.addEventListener('click', () => reset({ newSeed: true }));
  for (const input of [els.thicknessInput, els.rhoInput, els.materialSelect]) input.addEventListener('input', applyConfiguration);
  els.impactTime.addEventListener('input', () => handleTimeInput('force', els.impactTime));
  els.arrivalTime.addEventListener('input', () => handleTimeInput('acc', els.arrivalTime));
  els.calcForm.addEventListener('submit', verifyCalculations);
  els.revealBtn.addEventListener('click', revealReference);
  els.csvBtn.addEventListener('click', exportCsv);
  els.rawCsvBtn.addEventListener('click', exportRawCsv);
  els.zoomSpan.addEventListener('change', refreshZoom);
  els.zoomCentre.addEventListener('input', refreshZoom);
  els.focusImpactBtn.addEventListener('click', () => focusAt(cursorImpact));
  els.focusArrivalBtn.addEventListener('click', () => focusAt(cursorArrival));
  els.reportBtn.addEventListener('click', generateReport);
  reset();
})();
