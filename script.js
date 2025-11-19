let isSpeaking = false;
let isPaused = false;
let allowdevkey = true;
let devMode = false;
let konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
let allowdevmodekey = ["a", "k", "a", "n", "e"];
let allowdevmodeposition = 0;
let konamiCodePosition = 0;
var coll = document.getElementsByClassName("collapsible");
const ghosts = ["Banshee", "Demon", "Deogen", "Goryo", "Hantu", "Jinn", "Mare", "Moroi", "Myling", "Obake", "Oni", "Onryo", "Phantom", "Poltergeist", "Raiju", "Revenant", "Shade", "Spirit", "Thaye", "The Mimic", "The Twins", "Wraith", "Yokai", "Yurei"];
let ghost = ghosts[Math.floor(Math.random() * ghosts.length)];
let aprilFools = new Date();
let isAprilFools = aprilFools.getMonth() === 3 && aprilFools.getDate() === 1;

// redirect all pages to 404 if it is april fools
if (isAprilFools) {
    if (window.location.pathname !== "/404.html" && window.location.pathname !== "/site/404.html") {
        window.location.replace("/404.html");
    }
}

document.addEventListener("keydown", function (e) {
    if (e.key === allowdevmodekey[allowdevmodeposition]) {
        allowdevmodeposition++;
        if (allowdevmodeposition === allowdevmodekey.length) {
            allowdevmode();
            konamiCodePosition = 0;
        }
    }
    else {
        allowdevmodeposition = 0;
    }
    // console.log(e.key);
    if (e.key === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            if (allowdevkey) {
                devMode = true;
                konamiCodePosition = 0;
            }
            else {
                window.location.replace("/site/index.html");
                konamiCodePosition = 0;
            }
        }
    } else {
        konamiCodePosition = 0;
    }

});

function allowdevmode() {
    allowdevkey = true;
    console.log("Allowed Dev Mode")
}

function EnableAprilFools() {
    const confirmAprilFools = prompt("Are you sure you want to enable April Fools mode? This will redirect you to a 404 page. Type 'YES' to confirm.");
    if (confirmAprilFools.toLocaleUpperCase() === "YES") {
        isAprilFools = true;
        window.location.replace("/404.html");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Ghost is: " + ghost);
    const themeToggle = document.getElementById("theme-toggle");
    const backbutton = document.getElementById("back-button");
    const body = document.body;
    const openMenuButton = document.getElementById("open-menu");
    const menu = document.getElementById("menu");
    const allowdevmodeonpage = document.getElementById("no-dev-mode");

    async function fetchLiveStatus() {
      try {
        const res = await fetch("https://api.akanedev.au/livechecker/twitch");
        const data = await res.json();

        const list = document.getElementById("streamlist");
        list.innerHTML = ""; // Clear previous content

        data.forEach(user => {
            const a = document.createElement("a");
            a.href = `https://twitch.tv/${user.user}`
            a.innerHTML = `<h4>${user.user}</h4>
            <p>Status: ${user.live ? "LIVE" : "OFFLINE"}</p>`
            a.className = `project-card`
            list.appendChild(a);
        });
      } catch (err) {
        const list = document.getElementById("streamlist");
        list.innerHTML = ""; // Clear previous content

        const a = document.createElement("div");
        a.innerHTML = `<h4>Please Wait for me to update our backend</h4>
        <p>Status: ERR</p>`
        a.className = `project-card`
        list.appendChild(a);
        console.error("Failed to fetch live status:", err);
      }
    }

    fetchLiveStatus();

    // Load theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        themeToggle.textContent = "🌙";
    }

    themeToggle.addEventListener("click", function () {
        flashbang(1000, "#ffffff");
    });

    if (backbutton !== null) {
        backbutton.addEventListener("click", function () {
            window.history.back();
        });
    }
    if (openMenuButton !== null) {
        openMenuButton.addEventListener("click", function () {
            // alert("open menu");
            menu.classList.toggle("open");
        });
    }

    // Ensure text remains unaffected by light mode
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        card.style.color = "white";
    });

    setInterval(function () {
        let isdefined;
        if (devMode && !document.getElementById("dev-window") && (allowdevmodeonpage === null || allowdevmodeonpage === undefined)) {
            console.log("Developer Mode is active. Additional features enabled.");
            try {
                currentGhost;
                isdefined = true;
                console.log("currentGhost is defined");
            } catch (e) {
                console.log("currentGhost is not defined");
                isdefined = false;
            }
            // Create floating window
            const devWindow = document.createElement("div");
            devWindow.id = "dev-window";
            if (isdefined) {
                console.log("Executing")
                devWindow.innerHTML = `
                <div id="dev-window-header" class="dark-mode">Developer Mode</div>
                <div id="dev-window-content" class="dark-mode">
                    <p>Developer Mode is active. Additional features enabled.</p>` + `<p id="devGhost">Ghost is: ` + currentGhost.name + `</p>` + `
                    <button class="collapsible">TTS Test</button>
                    <div class="dark-mode" style="display: none;">
                        <p id="status">Status: Idle</p>
                        <section id="tts">This is a test of the text to speech system.</section>
                        <button onclick="speakText()">Speak</button>
                        <button onclick="stopSpeaking()">Stop</button>
                    </div>
                    <br>
                    <button class="collapsible">Force Darkmode</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Force darkmode is active.</p>
                        <button onclick="document.body.classList.add('dark-mode')">Enable</button>
                        <button onclick="document.body.classList.remove('dark-mode')">Disable</button>
                    </div>
                    <br>
                    <button class="looks-nice" id="download-ultrakill">Download Ultrakill</button>
                    <br>
                    <button class="collapsible">Design tools</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Design tools are active.</p>
                        <button onclick="addCenteringLines()">Add Centering Lines</button>
                    </div>
                    <br>
                    <button class="collapsible">Set Current Ghost</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Select a ghost from the dropdown menu:</p>
                        <select id="ghost-dropdown">
                            ${MiniGameghosts.map(ghost => `<option value="${ghost.name}">${ghost.name}</option>`).join('')}
                        </select>
                        <button onclick="setCurrentGhost()">Set Ghost</button>
                    </div>
                    <button class="remove-dev-window">Close</button>
                </div>
                `;
            }
            else {
                // devWindow.className = "dark-mode";
                devWindow.innerHTML = `
                <div id="dev-window-header" class="dark-mode">Developer Mode</div>
                <div id="dev-window-content" class="dark-mode">
                    <p>Developer Mode is active. Additional features enabled.</p>` + `<p>Ghost is: ` + ghost + `</p>` + `
                    <button class="collapsible">TTS Test</button>
                    <div class="dark-mode" style="display: none;">
                        <p id="status">Status: Idle</p>
                        <section id="tts">This is a test of the text to speech system.</section>
                        <button onclick="speakText()" class="looks-nice">Speak</button>
                        <button onclick="stopSpeaking()" class="looks-nice">Stop</button>
                    </div>
                    <br>
                    <button class="collapsible">Force Darkmode</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Force darkmode is active.</p>
                        <button onclick="document.body.classList.add('dark-mode')" class="looks-nice">Enable</button>
                        <button onclick="document.body.classList.remove('dark-mode')" class="looks-nice">Disable</button>
                    </div>
                    <br>
                    <button class="collapsible">Page Jump</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Jump to a page:</p>
                        <select id="page-dropdown">
                            <option value="index.html">Home</option>
                            <option value="projects.html">Projects</option>
                            <option value="about.html">About</option>
                            <option value="contact.html">Contact</option>
                            <option value="/minigames/GhostGuesserCompetive/guessghost.html">Locked Page, GGC</option>
                        </select>
                        <button onclick="jumpToPage()" class="looks-nice">Jump</button>
                    </div>
                    <br>
                    <button class="collapsible">Design tools</button>
                    <div class="dark-mode" style="display: none;">
                        <p>Design tools are active.</p>
                        <button onclick="addCenteringLines()" class="looks-nice">Add Centering Lines</button>
                    </div>
                    <button class="remove-dev-window">Close</button>
                </div>
                `;
            }
            document.body.appendChild(devWindow);
            // Make the window draggable
            collapsibleSetup();
            dragElement(devWindow);
        }
        else if (devMode && (allowdevmodeonpage !== null || allowdevmodeonpage !== undefined) && !document.getElementById("dev-window")) {
            console.log("ERR: Refused feature");
            const devWindow = document.createElement("div");
            devWindow.id = "dev-window";
            devWindow.className = "hidden";
            devWindow.innerHTML = ``;
            document.body.appendChild(devWindow);
            devMode = false;
            devWindow.remove();
        }
    }, 1000); // Check every second
});

function jumpToPage() {
    const pageDropdown = document.getElementById("page-dropdown");
    window.location.href = pageDropdown.value;
}

function collapsibleSetup() {
    coll = document.getElementsByClassName("collapsible");
    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }

    const removeDevWindow = document.getElementsByClassName("remove-dev-window");
    for (var i = 0; i < removeDevWindow.length; i++) {
        removeDevWindow[i].addEventListener("click", function() {
            document.getElementById("dev-window").remove();
            devMode = false;
            console.log("Developer Mode: OFF");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const flashEl = document.getElementById("Flashbang");
    if (!flashEl) return;
    flashEl.addEventListener("click", () => {
        const duration = parseInt(flashEl.dataset.duration, 10) || undefined;
        flashbang(duration);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const flashEl = document.getElementById("Headshot");
    if (!flashEl) return;
    flashEl.addEventListener("click", () => {
        const duration = parseInt(flashEl.dataset.duration, 10) || undefined;
        flashbang(duration, '#ff0000', "https://github.com/AkaneDev/akanedev.github.io/raw/refs/heads/main/assets/sfx/Headshot.mp3");
    });
});

function flashbang(duration = 500, color = '#ffffff', audiopath = "null") {
    const el = document.createElement('div');
    el.id = 'flashbang-overlay';
    let audioenabled = true;
    let audioEl = null;
    if (audiopath == null || audiopath === "null" || audiopath === "") {
        audioenabled = false;
    }
    // Basic inline styles (positioning, size, stacking)
    Object.assign(el.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '2147483647',
        pointerEvents: 'none',
        opacity: '1',
        transition: 'opacity 200ms ease'
    });

    // Enforce background color regardless of external CSS:
    el.style.setProperty('background-color', color, 'important');

    const styleEl = document.createElement('style');
    styleEl.textContent = '#flashbang-overlay { background-color: ' + color + ' !important; }';
    document.head.appendChild(styleEl);

    const mo = new MutationObserver(() => {
        el.style.setProperty('background-color', color, 'important');
    });
    mo.observe(document, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
    mo.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });

    document.body.appendChild(el);

    // Play audio if provided
    if (audioenabled) {
        try {
            audioEl = new Audio(audiopath);
            audioEl.preload = 'auto';
            audioEl.playsInline = true;
            audioEl.volume = 1;
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('flashbang: audio playback blocked or failed:', err);
                });
            }
        } catch (e) {
            console.warn('flashbang: failed to initialize audio:', e);
            audioEl = null;
        }
    }

    // Start fade-out so the overlay is visible for (duration - fadeTime)
    const fadeTime = 200;
    const fadeStart = Math.max(0, duration - fadeTime);
    requestAnimationFrame(() => {
        setTimeout(() => { el.style.opacity = '0'; }, fadeStart);
    });

    // Cleanup after completion: remove element, stylesheet, observer and stop audio
    setTimeout(() => {
        try { mo.disconnect(); } catch (e) { /* ignore */ }
        try { styleEl.remove(); } catch (e) { /* ignore */ }
        try { el.remove(); } catch (e) { /* ignore */ }
        if (audioEl) {
            try {
                audioEl.pause();
                audioEl.removeAttribute('src'); // prevents browser from retrying current page as audio
            } catch (e) { /* ignore */ }
            audioEl = null;
        }
    }, duration + 50);
}

function speakText() {
    if (!isSpeaking) {
        isSpeaking = true;
        var text = document.getElementById('tts').textContent;
        document.getElementById('status').textContent = "Status: Speaking";
        console.log("Text to speak: " + text);
        if (text !== '') {
        var speech = new SpeechSynthesisUtterance(text);
        var voices = window.speechSynthesis.getVoices();
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
        speech.voice = voices[0]; // Select first available voice
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
        } else {
        alert("Error: No TTS section found. Please Alert the developer.");
        }
    }
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    document.getElementById('status').textContent = "Status: Stopped Speaking";
}

function togglepauseSpeaking() {
    if (isSpeaking) {
        if (isPaused) {
            window.speechSynthesis.resume();
            document.getElementById('status').textContent = "Status: Speaking";
        } else {
            window.speechSynthesis.pause();
            document.getElementById('status').textContent = "Status: Paused";
        }
        isPaused = !isPaused;
    }
}

function testSpeaking() {
    var text = "This is a test of the text to speech system.";
    var speech = new SpeechSynthesisUtterance(text);
    var voices = window.speechSynthesis.getVoices();
    speech.voice = voices[3]; // Select first available voice
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

function testAllVoices() {
    var text = "test";
    var voices = window.speechSynthesis.getVoices();
    voices.forEach(function(voice, index) {
        console.log("Voice " + index + ": " + voice.name);
        var speech = new SpeechSynthesisUtterance(text);
        speech.voice = voice;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    });
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "-header");
    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function addCenteringLines() {
    const lines = ['vertical', 'horizontal'];
  
    lines.forEach(line => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.pointerEvents = 'none'; // Allow click-through to elements below
      div.style.backgroundColor = 'rgba(255, 0, 0, 100)'; // Light color for visibility
      div.style.zIndex = '9999'; // Make sure the lines are on top
  
      if (line === 'vertical') {
        div.style.width = '1px'; // Thin vertical line
        div.style.height = '100%';
        div.style.left = '50%';
        div.style.top = '0';
        div.style.transform = 'translateX(-50%)'; // Center horizontally
      } else if (line === 'horizontal') {
        div.style.height = '1px'; // Thin horizontal line
        div.style.width = '100%';
        div.style.top = '50%';
        div.style.left = '0';
        div.style.transform = 'translateY(-50%)'; // Center vertically
      }
  
      document.body.appendChild(div);
    });
  }
  
  // Call the function to add centering lines
//   addCenteringLines();

