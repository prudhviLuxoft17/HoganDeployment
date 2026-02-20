(function () {
  'use strict';

  const KG_TO_LBS = 2.20462;

  const kgInput = document.getElementById('kilograms');
  const resultEl = document.getElementById('result');

  function updateResult() {
    const kg = parseFloat(kgInput.value);

    if (!Number.isFinite(kg) || kg < 0) {
      resultEl.textContent = '—';
      return;
    }

    const lbs = kg * KG_TO_LBS;
    resultEl.textContent = lbs.toFixed(2) + ' lbs';
  }

  function debounce(fn, ms) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  kgInput.addEventListener('input', debounce(updateResult, 100));
  kgInput.addEventListener('change', updateResult);
})();
