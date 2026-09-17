'use strict';

function comparisonMode(){
  return document.querySelector('input[name="comparisonMode"]:checked')?.value || 'strain';
}

function refreshComparisonSelector(){
  document.querySelectorAll('.modeSelector label').forEach(label => {
    label.classList.toggle('selected',Boolean(label.querySelector('input:checked')));
  });
}

function refreshComparisonExplanation(clearFeedback=false){
  const explanation = document.getElementById('comparisonExplanation');
  const feedback = document.getElementById('comparisonFeedback');
  if(!explanation || !feedback) return;

  if(comparisonMode() === 'force'){
    explanation.textContent = 'Mantém se a força atual. Ao alterar o diâmetro, a área muda e o simulador procura na curva do material o estado com a tensão necessária para conservar essa força.';
  } else {
    explanation.textContent = 'Mantém se a extensão atual. A tensão do material permanece igual e a força varia com a área da secção.';
  }

  if(clearFeedback) feedback.textContent = '';
  refreshComparisonSelector();
}

function bestStateForTargetStress(targetSigma,currentEpsilon){
  const n = data.sigma.length;
  const iU = params.behaviour === 'Frágil' ? n - 1 : nearestIndex(data.eps,params.epsU);
  const afterUltimate = params.behaviour !== 'Frágil' && currentEpsilon > params.epsU;
  const branchStart = afterUltimate ? iU : 0;
  const branchEnd = afterUltimate ? n - 1 : iU;

  function bestInRange(start,end){
    let best = start;
    let bestError = Infinity;
    let bestDistance = Infinity;

    for(let i=start;i<=end;i++){
      const error = Math.abs(data.sigma[i] - targetSigma);
      const distance = Math.abs(data.eps[i] - currentEpsilon);
      if(error < bestError || (Math.abs(error - bestError) < 1e-9 && distance < bestDistance)){
        best = i;
        bestError = error;
        bestDistance = distance;
      }
    }

    return {index:best,error:bestError};
  }

  const branch = bestInRange(branchStart,branchEnd);
  const global = bestInRange(0,n - 1);
  const tolerance = Math.max(0.25e6,Math.abs(targetSigma) * 0.002);

  if(branch.error <= tolerance){
    return {index:branch.index,usedOtherBranch:false};
  }

  if(global.error < branch.error){
    return {index:global.index,usedOtherBranch:true};
  }

  return {index:branch.index,usedOtherBranch:false};
}

function renderComparisonState(){
  drawStress();
  drawForce();
  drawSpecimen();
  updateReadouts();
}

function handleDiameterInput(ev){
  if(ev.target.id !== 'd0Input') return;

  ev.stopImmediatePropagation();
  ev.preventDefault();

  const oldEpsilon = data.eps[index];
  const oldForce = data.F[index];
  const oldSigma = data.sigma[index];
  const oldDiameter = params.d0;
  const newDiameter = Number(ev.target.value);
  const feedback = document.getElementById('comparisonFeedback');

  params.d0 = newDiameter;
  materialSelect.value = 'Definido pelo utilizador';
  normaliseParameters('d0');
  data = simulate(params);
  running = false;

  if(comparisonMode() === 'force'){
    const targetSigma = oldForce / data.A0;
    const maxSigma = Math.max(...data.sigma);
    const result = bestStateForTargetStress(targetSigma,oldEpsilon);
    index = result.index;

    const newForce = data.F[index];
    const newSigma = data.sigma[index];
    const newEpsilon = data.eps[index];
    const forceError = Math.abs(newForce - oldForce);
    const forceTolerance = Math.max(2,oldForce * 0.003);

    if(targetSigma > maxSigma && forceError > forceTolerance){
      feedback.textContent = `A força anterior, ${formatPT(oldForce/1e3,2)} kN, não pode ser atingida com d₀ = ${formatPT(params.d0,1)} mm sem ultrapassar a tensão máxima do modelo. Foi selecionado o estado de força máxima, ${formatPT(newForce/1e3,2)} kN.`;
    } else if(result.usedOtherBranch){
      feedback.textContent = `Força mantida aproximadamente em ${formatPT(newForce/1e3,2)} kN. O nível de tensão necessário não existe no ramo atual, pelo que foi selecionado o ponto compatível noutro ramo da curva. A tensão é ${formatPT(newSigma/1e6,1)} MPa e a extensão é ${formatPT(newEpsilon,5)}.`;
    } else {
      feedback.textContent = `Força mantida em ${formatPT(newForce/1e3,2)} kN. Ao passar de d₀ = ${formatPT(oldDiameter,1)} mm para ${formatPT(params.d0,1)} mm, a tensão passa de ${formatPT(oldSigma/1e6,1)} MPa para ${formatPT(newSigma/1e6,1)} MPa e a extensão ajusta se para ${formatPT(newEpsilon,5)}.`;
    }
  } else {
    index = nearestIndex(data.eps,Math.min(oldEpsilon,params.epsF));
    const newForce = data.F[index];
    feedback.textContent = `Extensão mantida em ${formatPT(data.eps[index],5)}. A tensão mantém se em ${formatPT(data.sigma[index]/1e6,1)} MPa e a força passa de ${formatPT(oldForce/1e3,2)} kN para ${formatPT(newForce/1e3,2)} kN.`;
  }

  renderComparisonState();
}

function handlePredictionClick(ev){
  if(ev.target.id !== 'revealButton') return;

  ev.stopImmediatePropagation();
  ev.preventDefault();

  const choice = document.getElementById('challengeSelect').value;
  const mode = comparisonMode();
  const diameterAnswer = mode === 'force'
    ? 'Ao duplicar o diâmetro, a área inicial aumenta quatro vezes. Mantendo a força, a tensão reduz para um quarto. No regime elástico, a extensão também reduz para um quarto.'
    : 'Ao duplicar o diâmetro, a área inicial aumenta quatro vezes. Mantendo a extensão, a tensão não se altera e a força aumenta quatro vezes. A curva tensão extensão do material permanece igual.';
  const areaAnswer = mode === 'force'
    ? 'Ao duplicar a área e manter a força, a tensão reduz para metade. No regime elástico, a extensão também reduz para metade.'
    : 'Ao duplicar a área e manter a extensão, a tensão não se altera e a força duplica. A curva tensão extensão do material permanece igual.';

  const answers = {
    'Duplicar o diâmetro':diameterAnswer,
    'Duplicar o comprimento de referência':'Ao duplicar o comprimento de referência, o alongamento duplica para a mesma extensão. A curva tensão extensão e o nível de força não se alteram.',
    'Duplicar o módulo de Young':'Ao duplicar o módulo de Young, duplica o declive no regime elástico. Mantendo as resistências, a extensão correspondente ao início da cedência reduz para metade.',
    'Duplicar a área':areaAnswer
  };

  document.getElementById('challengeAnswer').textContent = answers[choice];
}

document.addEventListener('input',handleDiameterInput,true);
document.addEventListener('click',handlePredictionClick,true);

document.querySelectorAll('input[name="comparisonMode"]').forEach(input => {
  input.addEventListener('change',()=>refreshComparisonExplanation(true));
});

materialSelect.addEventListener('change',()=>{
  const feedback = document.getElementById('comparisonFeedback');
  if(feedback) feedback.textContent = '';
});

behaviourSelect.addEventListener('change',()=>{
  const feedback = document.getElementById('comparisonFeedback');
  if(feedback) feedback.textContent = '';
});

document.getElementById('resetButton').addEventListener('click',()=>{
  const feedback = document.getElementById('comparisonFeedback');
  if(feedback) feedback.textContent = '';
});

refreshComparisonExplanation();
