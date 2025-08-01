// --- Utilities ---
function setStorage(name, value) {
  try {
    localStorage.setItem(name, value);
  } catch (e) {
    // Fallback to cookies if localStorage fails
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }
}

function getStorage(name) {
  try {
    const value = localStorage.getItem(name);
    if (value !== null) return value;
  } catch (e) {
    // Fallback to cookies
  }

  // Cookie fallback
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
const STOCKS = ["AAPL", "TSLA", "AMZN", "GOOG", "MSFT", "NVDA", "NFLX", "SOULS"];
const TIME_SEGMENT = new Date().toISOString().slice(0, 16); // minutely

// --- Player State ---
function getState() {
  const saved = getStorage("market-state");
  let state;
  let isReturningPlayer = false;
  
  if (saved) {
    state = JSON.parse(saved);
    isReturningPlayer = true;
    
    // Add new stocks with [] if missing
    STOCKS.forEach(s => {
      if (!(s in state.holdings)) state.holdings[s] = [];
    });
    // Remove stocks that no longer exist
    Object.keys(state.holdings).forEach(s => {
      if (!STOCKS.includes(s)) delete state.holdings[s];
    });
    // Add lastInterest timestamp if missing (set to current time for existing players)
    if (!state.lastInterest) {
      state.lastInterest = Date.now();
    }
  } else {
    // New player - set lastInterest to current time (no retroactive interest)
    state = {
      money: 1000,
      holdings: {},
      lastInterest: Date.now()
    };
    STOCKS.forEach(s => state.holdings[s] = []);
  }

  // Only check for interest payment if this is a returning player
  if (isReturningPlayer) {
    state = checkAndPayInterest(state);
  }

  setStorage("market-state", JSON.stringify(state));
  return state;
}

function saveState(state) {
  setStorage("market-state", JSON.stringify(state));
}

// --- Interest System ---
function checkAndPayInterest(state) {
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  const interestRate = 0.02; // 2% interest every 3 hours
  
  // Fixed start date: 10/10/2010 @ 12:00am UTC
  const startDate = new Date('2010-10-10T00:00:00.000Z').getTime();
  
  // Calculate total periods since start date
  const totalPeriodsSinceStart = Math.floor((now - startDate) / threeHours);
  
  // Calculate periods since last interest payment
  const lastInterestPeriod = Math.floor((state.lastInterest - startDate) / threeHours);
  const periodsToProcess = totalPeriodsSinceStart - lastInterestPeriod;
  
  if (periodsToProcess > 0 && state.money > 0) {
    // Calculate compound interest for offline periods
    let totalInterestEarned = 0;
    let currentMoney = state.money;
    
    for (let i = 0; i < periodsToProcess; i++) {
      const periodInterest = currentMoney * interestRate;
      totalInterestEarned += periodInterest;
      currentMoney += periodInterest;
    }
    
    state.money = currentMoney;
    state.lastInterest = startDate + (totalPeriodsSinceStart * threeHours);
    
    // Show interest notification
    showInterestNotification(totalInterestEarned, periodsToProcess);
  } else if (periodsToProcess > 0) {
    // Update timestamp even if no money to earn interest on
    state.lastInterest = startDate + (totalPeriodsSinceStart * threeHours);
  }
  
  return state;
}

function getNextInterestTime(state) {
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  const startDate = new Date('2010-10-10T00:00:00.000Z').getTime();
  
  // Calculate the next interest payment time based on the fixed schedule
  const totalPeriodsSinceStart = Math.floor((now - startDate) / threeHours);
  const nextPaymentTime = startDate + ((totalPeriodsSinceStart + 1) * threeHours);
  const timeUntil = nextPaymentTime - now;

  if (timeUntil <= 0) {
    return "Now!";
  }

  const hours = Math.floor(timeUntil / (60 * 60 * 1000));
  const minutes = Math.floor((timeUntil % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function showInterestNotification(amount, periods) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: bold;
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    💰 Interest Earned!<br>
    +$${amount.toFixed(2)} (${periods} period${periods > 1 ? 's' : ''})
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove notification after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
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

// --- Net Worth Calculation ---
function calculateNetWorth(state) {
  let stockValue = 0;
  STOCKS.forEach(symbol => {
    const currentPrice = getPrice(symbol, getCurrentTimeSegment());
    stockValue += state.holdings[symbol].length * currentPrice;
  });
  return {
    cash: state.money,
    stockValue: stockValue,
    netWorth: state.money + stockValue
  };
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

  // Update wallet display with net worth
  const netWorthData = calculateNetWorth(state);
  const nextInterestTime = getNextInterestTime(state);

  document.getElementById("wallet").innerHTML = `
    � Balaonce: $${netWorthData.cash.toFixed(2)}<br>
    📈 Stock Value: $${netWorthData.stockValue.toFixed(2)}<br>
    💎 <strong>Net Worth: $${netWorthData.netWorth.toFixed(2)}</strong><br>
    🏦 Next Interest: ${nextInterestTime}
  `;

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
        <button onclick="openTradeModal('buy','${symbol}')">Buy</button>
      </td>
      <td>
        <button onclick="openTradeModal('sell','${symbol}')">Sell</button>
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
  // Show modal first so canvas is visible and has correct size
  document.getElementById('graphModal').style.display = 'flex';

  // Give the browser a moment to render the modal and canvas
  setTimeout(() => {
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
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
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
  }, 50); // 50ms delay to ensure canvas is rendered
}

function closeGraph() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  document.getElementById('graphModal').style.display = 'none';
}

// --- Dev Panel & Konami Code ---
const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39];
let konamiPos = 0;

document.addEventListener('keydown', function (e) {
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
        <input type="number" id="devSet-${symbol}" value="${state.holdings[symbol].length}" style="width:60px;">
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
  const qty = parseInt(document.getElementById('devSet-' + symbol).value) || 0;
  const current = state.holdings[symbol].length;

  // Clear current holdings first
  state.holdings[symbol] = [];

  // Add the desired quantity at current price
  if (qty > 0) {
    const price = getPrice(symbol, getCurrentTimeSegment());
    for (let i = 0; i < qty; i++) {
      state.holdings[symbol].push(price);
    }
  }

  saveState(state);
  render();
  openDevPanel();
}

function devReset() {
  // Reset state to initial values
  const state = {
    money: 1000,
    holdings: {}
  };
  STOCKS.forEach(s => state.holdings[s] = []);
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

let tradeModalState = null;

function openTradeModal(type, symbol) {
  const state = getState();
  const nowPrice = getPrice(symbol, getCurrentTimeSegment());
  const max = type === "buy"
    ? Math.floor(state.money / nowPrice)
    : state.holdings[symbol].length;
  tradeModalState = {
    type,
    symbol,
    price: nowPrice,
    max
  };
  document.getElementById('tradeTitle').textContent =
    (type === "buy" ? "Buy " : "Sell ") + symbol;
  document.getElementById('tradeInfo').innerHTML =
    `Price: <b>$${nowPrice}</b><br>` +
    (type === "buy"
      ? `You can afford: <b>${max}</b>`
      : `You own: <b>${max}</b>`);
  document.getElementById('tradeAmount').value = max > 0 ? 1 : 0;
  document.getElementById('tradeAmount').min = max > 0 ? 1 : 0;
  document.getElementById('tradeAmount').max = max;
  document.getElementById('tradeError').textContent = "";
  document.getElementById('tradeModal').style.display = 'flex';

  // Set confirm button handler
  document.getElementById('tradeConfirmBtn').onclick = function () {
    const amt = Math.max(1, Math.min(max, parseInt(document.getElementById('tradeAmount').value) || 0));
    if (amt < 1 || amt > max) {
      document.getElementById('tradeError').textContent = "Invalid amount.";
      return;
    }
    if (type === "buy") {
      doBuy(symbol, nowPrice, amt);
    } else {
      doSell(symbol, nowPrice, amt);
    }
    closeTradeModal();
  };
}

function closeTradeModal() {
  document.getElementById('tradeModal').style.display = 'none';
  tradeModalState = null;
}

function doBuy(symbol, price, qty) {
  const state = getState();
  const totalCost = price * qty;
  if (state.money >= totalCost) {
    state.money -= totalCost;
    for (let i = 0; i < qty; i++) {
      state.holdings[symbol].push(price);
    }
    saveState(state);
    render();
  }
}

function doSell(symbol, price, qty) {
  const state = getState();
  if (state.holdings[symbol].length >= qty) {
    state.money += price * qty;
    state.holdings[symbol].splice(0, qty);
    saveState(state);
    render();
  }
}

// --- Gift Code System ---
function encodeGift(giftData) {
  // Simple base64 encoding with obfuscation
  const json = JSON.stringify(giftData);
  const encoded = btoa(json);
  // Add prefix and some scrambling
  return 'GIFT-' + encoded.split('').reverse().join('');
}

function decodeGift(giftCode) {
  try {
    if (!giftCode.startsWith('GIFT-')) return null;
    const encoded = giftCode.substring(5).split('').reverse().join('');
    const json = atob(encoded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function generateGiftCode() {
  const money = parseFloat(document.getElementById('giftMoney').value) || 0;
  const stocks = {};
  const state = getState();

  // Validate money
  if (money > state.money) {
    document.getElementById('generatedCode').innerHTML = '<span style="color:#ff8080;">Not enough money to create this gift!</span>';
    return;
  }

  // Validate and collect stock quantities
  let validationError = false;
  STOCKS.forEach(symbol => {
    const qty = parseInt(document.getElementById(`giftStock-${symbol}`).value) || 0;
    if (qty > 0) {
      if (qty > state.holdings[symbol].length) {
        document.getElementById('generatedCode').innerHTML = `<span style="color:#ff8080;">Not enough ${symbol} shares! You only have ${state.holdings[symbol].length}</span>`;
        validationError = true;
        return;
      }
      stocks[symbol] = qty;
    }
  });

  if (validationError) return;

  if (money <= 0 && Object.keys(stocks).length === 0) {
    document.getElementById('generatedCode').innerHTML = '<span style="color:#ff8080;">Gift must contain money or stocks!</span>';
    return;
  }

  // Deduct money from player
  if (money > 0) {
    state.money -= money;
  }

  // Deduct stocks from player (remove oldest shares)
  Object.entries(stocks).forEach(([symbol, qty]) => {
    state.holdings[symbol].splice(0, qty);
  });

  // Save the updated state
  saveState(state);
  render();

  const giftData = {
    money,
    stocks,
    timestamp: Date.now()
  };

  const code = encodeGift(giftData);
  document.getElementById('generatedCode').innerHTML = `
    <div style="background:#333;padding:10px;border-radius:5px;margin-top:10px;">
      <strong style="color:#4caf50;">Gift Code Generated!</strong><br>
      <code style="color:#00d2ff;font-size:12px;">${code}</code><br>
      <button onclick="copyToClipboard('${code}')" style="margin-top:5px;font-size:12px;">Copy</button>
      <div style="color:#ffa726;font-size:11px;margin-top:5px;">
        Deducted from your account: ${money > 0 ? `$${money.toFixed(2)}` : ''}${money > 0 && Object.keys(stocks).length > 0 ? ', ' : ''}${Object.entries(stocks).map(([s, q]) => `${q} ${s}`).join(', ')}
      </div>
    </div>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Code copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Code copied to clipboard!');
  });
}

function redeemGiftCode() {
  const code = document.getElementById('redeemCode').value.trim();
  const resultDiv = document.getElementById('redeemResult');

  if (!code) {
    resultDiv.innerHTML = '<span style="color:#ff8080;">Please enter a gift code!</span>';
    return;
  }

  const giftData = decodeGift(code);
  if (!giftData) {
    resultDiv.innerHTML = '<span style="color:#ff8080;">Invalid gift code!</span>';
    return;
  }

  // Check if code was already redeemed
  const redeemedCodes = JSON.parse(getStorage('redeemed-gifts') || '[]');
  if (redeemedCodes.includes(code)) {
    resultDiv.innerHTML = '<span style="color:#ff8080;">This gift code has already been redeemed!</span>';
    return;
  }

  // Apply the gift
  const state = getState();
  let rewardText = [];

  if (giftData.money > 0) {
    state.money += giftData.money;
    rewardText.push(`$${giftData.money.toFixed(2)}`);
  }

  if (giftData.stocks) {
    Object.entries(giftData.stocks).forEach(([symbol, qty]) => {
      if (STOCKS.includes(symbol) && qty > 0) {
        const currentPrice = getPrice(symbol, getCurrentTimeSegment());
        for (let i = 0; i < qty; i++) {
          state.holdings[symbol].push(currentPrice);
        }
        rewardText.push(`${qty} ${symbol} shares`);
      }
    });
  }

  // Mark code as redeemed
  redeemedCodes.push(code);
  setStorage('redeemed-gifts', JSON.stringify(redeemedCodes));

  saveState(state);
  render();

  resultDiv.innerHTML = `
    <div style="color:#4caf50;background:#1b5e20;padding:10px;border-radius:5px;">
      <strong>🎉 Gift Redeemed!</strong><br>
      You received: ${rewardText.join(', ')}
    </div>
  `;

  // Clear the input
  document.getElementById('redeemCode').value = '';
}

function openGiftModal() {
  document.getElementById('giftModal').style.display = 'flex';

  // Build stock quantity inputs
  let stocksHtml = '';
  STOCKS.forEach(symbol => {
    stocksHtml += `
      <div style="margin-bottom:5px;">
        <label style="color:#fff;">${symbol}: <input type="number" id="giftStock-${symbol}" min="0" value="0" style="width:60px;"> shares</label>
      </div>
    `;
  });
  document.getElementById('giftStocks').innerHTML = stocksHtml;

  // Clear previous results
  document.getElementById('generatedCode').innerHTML = '';
  document.getElementById('redeemResult').innerHTML = '';
}

function closeGiftModal() {
  document.getElementById('giftModal').style.display = 'none';
}
