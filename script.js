let isSpeaking = false;
let isPaused = false;
let devMode = false;
let konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
let konamiCodePosition = 0;
var coll = document.getElementsByClassName("collapsible");

document.addEventListener("keydown", function (e) {

    // console.log(e.key);
    if (e.key === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            console.log("Konami Code activated!");
            devMode = true;
            console.log("Developer Mode: ON");
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const backbutton = document.getElementById("back-button");
    const body = document.body;
    const openMenuButton = document.getElementById("open-menu");
    const menu = document.getElementById("menu");
    
    // Load theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        themeToggle.textContent = "🌙";
    }

    themeToggle.addEventListener("click", function () {
        if (body.classList.contains("dark-mode")) {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";
        } else {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️";
        }
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
        if (devMode && !document.getElementById("dev-window")) {
            console.log("Developer Mode is active. Additional features enabled.");

            // Create floating window
            const devWindow = document.createElement("div");
            devWindow.id = "dev-window";
            // devWindow.className = "dark-mode";
            devWindow.innerHTML = `
                <div id="dev-window-header" class="dark-mode">Developer Mode</div>
                <div id="dev-window-content" class="dark-mode">
                    <p>Developer Mode is active. Additional features enabled.</p>
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
                    <button class="remove-dev-window">Close</button>
                </div>
            `;
            document.body.appendChild(devWindow);
            // Make the window draggable
            collapsibleSetup();
            dragElement(devWindow);
        }
    }, 1000); // Check every second
});

function collapsibleSetup() {
    coll = document.getElementsByClassName("collapsible");
    ultrakill = document.getElementById("download-ultrakill");
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

    ultrakill.addEventListener("click", function() {
        console.log("Downloading Ultrakill...");
        window.location.href = "https://ultrakill.newblood.games/";
    });

    const removeDevWindow = document.getElementsByClassName("remove-dev-window");
    for (var i = 0; i < removeDevWindow.length; i++) {
        removeDevWindow[i].addEventListener("click", function() {
            document.getElementById("dev-window").remove();
            devMode = false;
            console.log("Developer Mode: OFF");
        });
    }
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
  
