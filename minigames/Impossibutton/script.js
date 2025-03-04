const button = document.getElementById('explodingButton');
let buttonRect = button.getBoundingClientRect();

button.style.position = 'fixed'; // Anchor the button to the screen

button.addEventListener('click', () => {
    // Remove the button momentarily
    button.style.visibility = 'hidden';

    // Create the explosion "Boom!" effect
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.innerText = 'BOOM!';
    button.parentElement.appendChild(explosion);

    // Generate explosion particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Randomize the position of particles around the button
        const angle = Math.random() * 360;
        const distance = Math.random() * 100 + 50;
        const x = Math.cos(angle) * distance + button.offsetLeft + button.offsetWidth / 2;
        const y = Math.sin(angle) * distance + button.offsetTop + button.offsetHeight / 2;
        
        particle.style.width = `${Math.random() * 10 + 10}px`;
        particle.style.height = particle.style.width; // Make it a circle
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        button.parentElement.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    // Show the button again after a short delay
    setTimeout(() => {
        button.style.visibility = 'visible';
    }, 1000);
});

// Track the mouse and make the button move away when it's close
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    buttonRect = button.getBoundingClientRect();  // Update button position
    const buttonX = buttonRect.left + buttonRect.width / 2;
    const buttonY = buttonRect.top + buttonRect.height / 2;
    
    const distance = Math.sqrt(Math.pow(mouseX - buttonX, 2) + Math.pow(mouseY - buttonY, 2));
    // Move the button away when mouse is within 150px range
    if (distance < 350) {
        const angle = Math.atan2(mouseY - buttonY, mouseX - buttonX);
        const moveDistance = 5; // distance to move away from the mouse

        // Calculate the new position to move the button away
        let newX = buttonX - Math.cos(angle) * moveDistance;
        let newY = buttonY - Math.sin(angle) * moveDistance;

        // Ensure the button stays within the viewport
        if (newX < 0) {
            newX = window.innerWidth - buttonRect.width / 2;
        } else if (newX > window.innerWidth) {
            newX = buttonRect.width / 2;
        }

        if (newY < 0) {
            newY = window.innerHeight - buttonRect.height / 2;
        } else if (newY > window.innerHeight) {
            newY = buttonRect.height / 2;
        }

        // Update the button position
        button.style.left = `${newX - buttonRect.width / 2}px`;
        button.style.top = `${newY - buttonRect.height / 2}px`;
    }
});
