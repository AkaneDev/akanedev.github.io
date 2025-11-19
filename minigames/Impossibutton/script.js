const button = document.getElementById('explodingButton');
let buttonRect = button.getBoundingClientRect();
let ButtonParent;
let velocityX = 0; 
let velocityY = 0;
const MIN_VELOCITY = 2;
let lastPosition = { x: buttonRect.left, y: buttonRect.top };
let stuckCounter = 0;
let shouldMove = false;
let lastMousePosition = { x: 0, y: 0 };
let mouseStoppedCounter = 0;

button.style.position = 'fixed'; // Anchor the button to the screen

button.addEventListener('click', () => {
    // Remove the button momentarily
    button.style.visibility = 'hidden';
    
    // Create the explosion "Boom!" effect
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.innerText = 'BOOM!';
    ButtonParent = button.parentElement;
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
        setTimeout(() => {
            location.reload();
        }, 1050);
    }

    // Show the button again after a short delay
    setTimeout(() => {
        button.style.visibility = 'visible';
    }, 10000);
});

// Track the mouse and make the button move away when it's close
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    buttonRect = button.getBoundingClientRect(); // Update button position
    const buttonX = buttonRect.left + buttonRect.width / 2;
    const buttonY = buttonRect.top + buttonRect.height / 2;

    // Reset mouse stopped counter if the mouse is moving
    if (mouseX !== lastMousePosition.x || mouseY !== lastMousePosition.y) {
        mouseStoppedCounter = 0;
        lastMousePosition = { x: mouseX, y: mouseY };
    }

    // Calculate the new position
    let newX = buttonRect.left + velocityX;
    let newY = buttonRect.top + velocityY;

    // Bounce off the edges of the viewport
    if (newX <= 0 || newX + buttonRect.width >= window.innerWidth) {
        velocityX = -velocityX; // Reverse horizontal direction
        newX = Math.max(0, Math.min(newX, window.innerWidth - buttonRect.width));
    }
    if (newY <= 0 || newY + buttonRect.height >= window.innerHeight) {
        velocityY = -velocityY; // Reverse vertical direction
        newY = Math.max(0, Math.min(newY, window.innerHeight - buttonRect.height));
    }

    // // Ensure velocity never drops below a minimum threshold
    // if (Math.abs(velocityX) < MIN_VELOCITY) {
    //     velocityX = velocityX < 0 ? -MIN_VELOCITY : MIN_VELOCITY;
    // }
    // if (Math.abs(velocityY) < MIN_VELOCITY) {
    //     velocityY = velocityY < 0 ? -MIN_VELOCITY : MIN_VELOCITY;
    // }

    // Update the button position
    button.style.left = `${newX}px`;
    button.style.top = `${newY}px`;

    // Check mouse proximity and adjust velocity if close
    const distance = Math.sqrt(Math.pow(mouseX - buttonX, 2) + Math.pow(mouseY - buttonY, 2));
    if (distance < 350) {
        const angle = Math.atan2(mouseY - buttonY, mouseX - buttonX);
        shouldMove = true;
        // Update velocity based on the angle
        velocityX = -Math.cos(angle) * 10;
        velocityY = -Math.sin(angle) * 10;
    }
});

// // Detect if the button is stuck and reset its position
// setInterval(() => {
//     const currentPosition = { x: buttonRect.left, y: buttonRect.top };
//     if (currentPosition.x === lastPosition.x && currentPosition.y === lastPosition.y) {
//         stuckCounter++;
//     } else {
//         stuckCounter = 0;
//     }
//     lastPosition = currentPosition;

//     if (stuckCounter > 10) {
//         const randomX = Math.random() * (window.innerWidth - buttonRect.width);
//         const randomY = Math.random() * (window.innerHeight - buttonRect.height);
//         button.style.left = `${randomX}px`;
//         button.style.top = `${randomY}px`;
//         stuckCounter = 0;
//     }
// }, 25); // Check every 100ms

// Add random velocity jitter periodically
setInterval(() => {
    if (shouldMove) {
        velocityX += (Math.random() - 0.5) * 5; // Add random jitter between -1 and 1
        velocityY += (Math.random() - 0.5) * 5;

        // Update the button's position based on the new velocity
        let newX = buttonRect.left + velocityX;
        let newY = buttonRect.top + velocityY;

        // Bounce off the edges of the viewport
        if (newX <= 0 || newX + buttonRect.width >= window.innerWidth) {
            velocityX = -velocityX; // Reverse horizontal direction
            newX = Math.max(0, Math.min(newX, window.innerWidth - buttonRect.width));
        }
        if (newY <= 0 || newY + buttonRect.height >= window.innerHeight) {
            velocityY = -velocityY; // Reverse vertical direction
            newY = Math.max(0, Math.min(newY, window.innerHeight - buttonRect.height));
        }

        // Ensure the button stays within the viewport
        button.style.left = `${newX}px`;
        button.style.top = `${newY}px`;

        // Update buttonRect to reflect the new position
        buttonRect = button.getBoundingClientRect();
    }
}, 1); // Apply jitter every 500ms

// // Change direction randomly if the mouse isn't moving
// setInterval(() => {
//     if (mouseStoppedCounter > 5) { // Only change direction if the mouse hasn't moved for a while
//         velocityX = (Math.random() - 0.5) * 10; // Random horizontal velocity
//         velocityY = (Math.random() - 0.5) * 10; // Random vertical velocity

//         // Update the button's position based on the new velocity
//         let newX = buttonRect.left + velocityX;
//         let newY = buttonRect.top + velocityY;

//         // Ensure the button stays within the viewport
//         newX = Math.max(0, Math.min(newX, window.innerWidth - buttonRect.width));
//         newY = Math.max(0, Math.min(newY, window.innerHeight - buttonRect.height));

//         button.style.left = `${newX}px`;
//         button.style.top = `${newY}px`;

//         // Update buttonRect to reflect the new position
//         buttonRect = button.getBoundingClientRect();
//     }
//     mouseStoppedCounter++;
// }, 1); // Check every 100ms

document.addEventListener('DOMContentLoaded', () => {
    let buttonX;
    let buttonY;
    buttonRect = button.getBoundingClientRect();

    // Generate random positions within the viewport
    const randomX = Math.random() * (window.innerWidth - buttonRect.width);
    const randomY = Math.random() * (window.innerHeight - buttonRect.height);

    // Set the button's position
    button.style.left = `${randomX}px`;
    button.style.top = `${randomY}px`;
});
