/**
 * Keep Android Open – Countdown Banner
 * Licensed under the GNU General Public License v3.0
 * SPDX-License-Identifier: GPL-3.0-only
 */

(function () {
  "use strict";

  // ── Localized banner strings ──────────────────────────────────────────
  var messages = {
    fa: "اندروید، یک سکّوی بسته خواهد شد!",
    ar: "سيصبح نظام أندرويد منصة مغلقة في",
    he: "אנדרואיד תהפוך לפלטפורמה נעולה בעוד",
    en: "Android will become a locked-down platform in",
    ca: "Android es convertir\u00E0 en una plataforma tancada",
    cs: "Android se stane uzamčenou platformou za",
    de: "Android wird eine geschlossene Plattform werden.",
    da: "Android vil blive en lukket platform om",
    nl: "Android zal een gesloten platform worden over",
    el: "\u03A4\u03BF Android \u03B8\u03B1 \u03B3\u03AF\u03BD\u03B5\u03B9 \u03BC\u03AF\u03B1 \u03BA\u03BB\u03B5\u03B9\u03C3\u03C4\u03AE \u03C0\u03BB\u03B1\u03C4\u03C6\u03CC\u03C1\u03BC\u03B1",
    es: "Android se convertir\u00E1 en una plataforma cerrada en",
    fr: "Android va devenir une plateforme ferm\u00E9e dans",
    id: "Android akan menjadi platform yang terkunci.",
    it: "Android diventer\u00E0 una piattaforma bloccata",
    ko: "Android\uAC00 \uD3D0\uC1C4\uB41C \uD50C\uB7AB\uD3FC\uC774 \uB418\uAE30\uAE4C\uC9C0 \uB0A8\uC740 \uC2DC\uAC04:",
    pl: "Android stanie si\u0119 platform\u0105 zamkni\u0119t\u0105 za",
    "pt-BR": "O Android se tornar\u00E1 uma plataforma fechada em",
    ru: "Android \u0441\u0442\u0430\u043D\u0435\u0442 \u0437\u0430\u043A\u0440\u044B\u0442\u043E\u0439 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u043E\u0439 \u0447\u0435\u0440\u0435\u0437",
    sk: "Android sa stane uzamknutou platformou",
    th: "Android\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E41\u0E1E\u0E25\u0E15\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E25\u0E47\u0E2D\u0E01",
    tr: "Android k\u0131s\u0131tl\u0131 bir platform haline gelecek.",
    uk: "Android \u0441\u0442\u0430\u043D\u0435 \u0437\u0430\u043A\u0440\u0438\u0442\u043E\u044E \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u043E\u044E",
    "zh-CN": "\u5B89\u5353\u5C06\u6210\u4E3A\u4E00\u4E2A\u5C01\u95ED\u5E73\u53F0",
    "zh-TW": "Android \u5C07\u6210\u70BA\u4E00\u500B\u5C01\u9589\u5E73\u53F0",
    ja: "Androidは閉鎖的なプラットフォームになろうとしています",
    fi: "Androidista tulee suljettu alusta",
    hu: "Az Android egy lezárt platform lesz",
    vi: "Android sẽ trở thành một hệ điều hành đóng",
    bg: "Android ще стане заключена платформа след",
    be: "Android \u0441\u0442\u0430\u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0442\u0430\u0439 \u043f\u043b\u0430\u0444\u0442\u043e\u0440\u043c\u0430\u0439",
  };

  // ── FIXED: robust script parameter parsing ───────────────────────────
  function getScriptParams() {
    var params = {};

    try {
      var scripts = document.getElementsByTagName("script");
      var script = null;

      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.includes("banner.js")) {
          script = scripts[i];
          break;
        }
      }

      if (!script) return params;

      var src = script.src;
      var q = src.indexOf("?");
      if (q === -1) return params;

      var pairs = src.substring(q + 1).split("&");

      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split("=");
        params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      }
    } catch (e) {}

    return params;
  }

  var params = getScriptParams();

  // ── Locale ────────────────────────────────────────────────────────────
  function resolveLocale(tag) {
    if (!tag) return "en";
    if (messages[tag]) return tag;

    var lower = tag.toLowerCase();

    for (var key in messages) {
      if (key.toLowerCase() === lower) return key;
    }

    var base = lower.split("-")[0];

    for (var key2 in messages) {
      if (key2.toLowerCase().split("-")[0] === base) return key2;
    }

    return "en";
  }

  var locale = resolveLocale(
    params.lang ||
    document.documentElement.lang ||
    navigator.language ||
    navigator.userLanguage
  );

  // ── Settings ──────────────────────────────────────────────────────────
  var size =
    params.size === "mini"
      ? "mini"
      : params.size === "minimal"
      ? "minimal"
      : "normal";

  var linkParam = params.link;
  var defaultLink =
    "https://keepandroidopen.org" +
    (locale === "en" ? "" : "/" + locale + "/");

  var linkUrl = linkParam === "none" ? null : (linkParam || defaultLink);

  var showClose = params.hidebutton !== "off";
  var storageKey = "kao-banner-hidden";
  var dismissDays = 30;

  // ── CSS ───────────────────────────────────────────────────────────────
  var cssNormal =
    ".kao-banner{position:relative;font-variant-numeric:tabular-nums;" +
    "background:linear-gradient(180deg,#d32f2f 0%,#b71c1c 100%);" +
    "border-bottom:4px solid #801313;color:#fff;font-family:'Arial Black',sans-serif;" +
    "font-weight:900;text-transform:uppercase;letter-spacing:2px;font-size:1.5rem;" +
    "text-align:center;text-shadow:0px 1px 0px #9e1a1a,0px 2px 0px #8a1515," +
    "0px 3px 0px #751111,0px 4px 0px #5e0d0d,0px 6px 10px rgba(0,0,0,0.5);" +
    "padding:0.5rem 2.5rem;line-height:1.6;box-sizing:border-box;}";

  var cssMini = cssNormal.replace("1.5rem", "0.75rem").replace("4px", "2px");

  var cssMinimal = cssMini;

  var cssCommon =
    ".kao-banner a{color:#fff;text-decoration:none;}" +
    ".kao-banner-close{position:absolute;right:0.5rem;top:50%;" +
    "transform:translateY(-50%);background:none;border:none;color:#fff;" +
    "font-size:0.8em;cursor:pointer;opacity:0.7;}";

  var style = document.createElement("style");
  style.textContent =
    (size === "mini"
      ? cssMini
      : size === "minimal"
      ? cssMinimal
      : cssNormal) + cssCommon;

  document.head.appendChild(style);

  // ── Dismiss logic ─────────────────────────────────────────────────────
  if (showClose) {
    try {
      var dismissed = localStorage.getItem(storageKey);
      if (dismissed) {
        var elapsed = Date.now() - Number(dismissed);
        if (elapsed < dismissDays * 86400000) return;
        localStorage.removeItem(storageKey);
      }
    } catch (e) {}
  }

  // ── Create banner ─────────────────────────────────────────────────────
  var banner = document.createElement("div");
  banner.className = "kao-banner";

  var messageText = messages[locale] || messages.en;

  if (linkUrl) {
    var a = document.createElement("a");
    a.href = linkUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = messageText;
    banner.appendChild(a);
  } else {
    banner.textContent = messageText;
  }

  banner.appendChild(document.createElement("br"));

  var countdownSpan = document.createElement("span");
  banner.appendChild(countdownSpan);

  if (showClose) {
    var btn = document.createElement("button");
    btn.className = "kao-banner-close";
    btn.textContent = "×";
    btn.onclick = function () {
      banner.style.display = "none";
      try {
        localStorage.setItem(storageKey, String(Date.now()));
      } catch (e) {}
    };
    banner.appendChild(btn);
  }

  // ── FIXED: DOM-safe mounting ─────────────────────────────────────────
  function mount() {
    var targetId = params.id;
    var target = targetId && document.getElementById(targetId);

    if (target) {
      target.appendChild(banner);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // ── Countdown ─────────────────────────────────────────────────────────
  var end = new Date("Sep 1, 2026 00:00:00").getTime();

  function update() {
    var now = Date.now();
    var d = end - now;

    if (d < 0) d = 0;

    var days = Math.floor(d / 86400000);
    var hours = Math.floor((d % 86400000) / 3600000);
    var mins = Math.floor((d % 3600000) / 60000);
    var secs = Math.floor((d % 60000) / 1000);

    countdownSpan.textContent =
      days + "d " + hours + "h " + mins + "m " + secs + "s";
  }

  setInterval(update, 1000);
  update();
})();