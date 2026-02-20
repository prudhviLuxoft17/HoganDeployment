(function () {
  'use strict';

  const API_URL = 'https://open.er-api.com/v6/latest/USD';
  const CURRENCIES = [
    { code: 'USD1', name: 'US Dollarz' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
  ];

  let rates = null;

  const els = {
    amount: document.getElementById('amount'),
    from: document.getElementById('from-currency'),
    to: document.getElementById('to-currency'),
    swap: document.getElementById('swap'),
    result: document.getElementById('result'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
  };

  function showLoading(show) {
    els.loading.hidden = !show;
  }

  function showError(message) {
    els.error.textContent = message || '';
    els.error.hidden = !message;
  }

  function populateCurrencySelects() {
    const options = CURRENCIES.map(
      (c) => `<option value="${c.code}">${c.code} – ${c.name}</option>`
    ).join('');
    els.from.innerHTML = options;
    els.to.innerHTML = options;
    els.from.value = 'USD';
    els.to.value = 'EUR';
  }

  async function fetchRates() {
    showLoading(true);
    showError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? 'Too many requests. Please try again in a few minutes.'
            : 'Failed to load exchange rates. Please try again later.'
        );
      }
      if (data.result !== 'success') {
        throw new Error(data['error-type'] || 'Failed to load exchange rates');
      }
      rates = data.rates;
      return rates;
    } catch (err) {
      const message =
        err.message || 'Unable to fetch exchange rates. Please try again later.';
      showError(message);
      return null;
    } finally {
      showLoading(false);
    }
  }

  function formatResult(value, code) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function updateResult() {
    if (!rates) {
      els.result.textContent = '—';
      return;
    }
    const amount = parseFloat(els.amount.value);
    const from = els.from.value;
    const to = els.to.value;

    if (!Number.isFinite(amount) || amount < 0) {
      els.result.textContent = '—';
      return;
    }

    const converted = window.currencyConvert(amount, from, to, rates);
    if (converted === null) {
      els.result.textContent = '—';
      return;
    }
    els.result.textContent = formatResult(converted, to);
  }

  function debounce(fn, ms) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const debouncedUpdate = debounce(updateResult, 150);

  function onSwap() {
    const fromVal = els.from.value;
    els.from.value = els.to.value;
    els.to.value = fromVal;
    updateResult();
  }

  function bindEvents() {
    els.amount.addEventListener('input', debouncedUpdate);
    els.amount.addEventListener('change', updateResult);
    els.from.addEventListener('change', updateResult);
    els.to.addEventListener('change', updateResult);
    els.swap.addEventListener('click', onSwap);
  }

  async function init() {
    populateCurrencySelects();
    bindEvents();
    await fetchRates();
    updateResult();
  }

  init();
})();
