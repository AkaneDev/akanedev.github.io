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
