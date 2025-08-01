// --- Utilities ---
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

// --- PRNG ---
function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0];
}

function getPrice(symbol, isoTime) {
  const hash = cyrb128("stock-seed-" + symbol + "-" + isoTime)[0];
  const rng = mulberry32(hash);
  return Math.round((rng() * 1000 + 10) * 100) / 100;
}

// --- Stocks ---
const STOCKS = ["AAPL", "TSLA", "AMZN", "GOOG", "MSFT", "NVDA", "NFLX"];
const TIME_SEGMENT = new Date().toISOString().slice(0, 16); // minutely

// --- Player State ---
function getState() {
  const saved = getCookie("market-state");
  let state;
  if (saved) {
    state = JSON.parse(saved);
    // Add new stocks with [] if missing
    STOCKS.forEach(s => {
      if (!(s in state.holdings)) state.holdings[s] = [];
    });
    // Remove stocks that no longer exist
    Object.keys(state.holdings).forEach(s => {
      if (!STOCKS.includes(s)) delete state.holdings[s];
    });
  } else {
    state = {
      money: 1000,
      holdings: {}
    };
    STOCKS.forEach(s => state.holdings[s] = []);
  }
  setCookie("market-state", JSON.stringify(state));
  return state;
}

function saveState(state) {
  setCookie("market-state", JSON.stringify(state));
}

function buy(symbol, price, qty = 1) {
  qty = Math.max(1, parseInt(qty) || 1);
  const state = getState();
  const totalCost = price * qty;
  if (state.money >= totalCost) {
    state.money -= totalCost;
    for (let i = 0; i < qty; i++) {
      state.holdings[symbol].push(price); // store buy price
    }
    saveState(state);
    render();
  } else {
    alert("Not enough funds!");
  }
}

function sell(symbol, price, qty = 1) {
  qty = Math.max(1, parseInt(qty) || 1);
  const state = getState();
  if (state.holdings[symbol].length >= qty) {
    state.money += price * qty;
    state.holdings[symbol].splice(0, qty); // remove oldest buy prices
    saveState(state);
    render();
  } else {
    alert("You don't own enough " + symbol);
  }
}

// --- Render ---
function render() {
  const state = getState();

  // --- Save current input values ---
  const qtyInputs = {};
  STOCKS.forEach(symbol => {
    const buyInput = document.getElementById(`buyQty-${symbol}`);
    const sellInput = document.getElementById(`sellQty-${symbol}`);
    qtyInputs[symbol] = {
      buy: buyInput ? buyInput.value : "1",
      sell: sellInput ? sellInput.value : "1"
    };
  });

  document.getElementById("wallet").textContent = `💰 Balance: $${state.money.toFixed(2)}`;

  const tbody = document.getElementById("stockTable");
  tbody.innerHTML = "";

  STOCKS.forEach(symbol => {
    const price = getPrice(symbol, getCurrentTimeSegment());
    const owned = state.holdings[symbol].length;
    const avgBought = owned
      ? (state.holdings[symbol].reduce((a, b) => a + b, 0) / owned).toFixed(2)
      : "-";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${symbol}</td>
      <td>$${price}</td>
      <td>${owned}</td>
      <td>${avgBought !== "-" ? "$" + avgBought : "-"}</td>
      <td>
        <input type="number" id="buyQty-${symbol}" value="${qtyInputs[symbol]?.buy || 1}" min="1" style="width:50px;">
        <button onclick="buy('${symbol}', ${price}, document.getElementById('buyQty-${symbol}').value)">Buy</button>
      </td>
      <td>
        <input type="number" id="sellQty-${symbol}" value="${qtyInputs[symbol]?.sell || 1}" min="1" max="${owned}" style="width:50px;">
        <button onclick="sell('${symbol}', ${price}, document.getElementById('sellQty-${symbol}').value)">Sell</button>
      </td>
      <td><button onclick="showGraph('${symbol}')">📈</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function getCurrentTimeSegment() {
  return new Date().toISOString().slice(0, 16);
}

let chartInstance = null;

function showGraph(symbol) {
  const ctx = document.getElementById('stockGraph').getContext('2d');
  const now = new Date();
  const labels = [];
  const data = [];
  // Show last 60 minutes
  for (let i = 59; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000);
    const iso = t.toISOString().slice(0, 16);
    labels.push(t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0'));
    data.push(getPrice(symbol, iso));
  }
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: symbol + ' Price (last hour)',
        data,
        borderColor: '#00d2ff',
        backgroundColor: 'rgba(0,210,255,0.1)',
        tension: 0.2,
        pointRadius: 0
      }]
    },
    options: {
      scales: {
        x: { display: true },
        y: { display: true }
      }
    }
  });
  document.getElementById('graphModal').style.display = 'flex';
}

function closeGraph() {
  document.getElementById('graphModal').style.display = 'none';
}

// --- Dev Panel & Konami Code ---
const KONAMI = [38,38,40,40,37,39,37,39,66,65];
let konamiPos = 0;

document.addEventListener('keydown', function(e) {
  if (e.keyCode === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      openDevPanel();
      konamiPos = 0;
    }
  } else {
    konamiPos = 0;
  }
});

function openDevPanel() {
  const state = getState();
  document.getElementById('devPanel').style.display = 'flex';
  document.getElementById('devMoney').value = state.money;

  // Build stock controls
  let html = '<table style="width:100%;color:#fff;"><tr><th>Stock</th><th>Owned</th><th>Set Owned</th></tr>';
  for (const symbol of STOCKS) {
    html += `<tr>
      <td>${symbol}</td>
      <td id="devOwned-${symbol}">${state.holdings[symbol].length}</td>
      <td>
        <input type="number" id="devSet-${symbol}" value="${state.holdings[symbol].length}" min="0" style="width:60px;">
        <button onclick="devSetOwned('${symbol}')">Set</button>
      </td>
    </tr>`;
  }
  html += '</table>';
  document.getElementById('devStocks').innerHTML = html;
}

function closeDevPanel() {
  document.getElementById('devPanel').style.display = 'none';
}

function devSetMoney() {
  const state = getState();
  state.money = parseFloat(document.getElementById('devMoney').value) || 0;
  saveState(state);
  render();
  openDevPanel();
}

function devSetOwned(symbol) {
  const state = getState();
  const qty = Math.max(0, parseInt(document.getElementById('devSet-' + symbol).value) || 0);
  const current = state.holdings[symbol].length;
  if (qty > current) {
    // Add at current price
    const price = getPrice(symbol, getCurrentTimeSegment());
    for (let i = 0; i < qty - current; i++) state.holdings[symbol].push(price);
  } else if (qty < current) {
    state.holdings[symbol].splice(0, current - qty);
  }
  saveState(state);
  render();
  openDevPanel();
}

// Initial load
render();

// Live update every minute
// setInterval(render, 60 * 1000);
// Optionally, update every second for a smoother UI (but prices only change each minute)
setInterval(render, 1000);
