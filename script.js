let isSpeaking = false;
let isPaused = false;

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

    openMenuButton.addEventListener("click", function () {
        // alert("open menu");
        menu.classList.toggle("open");
    });

    // Ensure text remains unaffected by light mode
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach(card => {
        card.style.color = "white";
    });
});

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
