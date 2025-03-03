// ==UserScript==
// @name         Re-enable Dev Mode
// @namespace    http://akanedev.au/
// @version      1.0
// @description  Re-enable developer mode on akanedev.au and localhost
// @author       Akane
// @match        *://akanedev.au/*
// @match        *://127.0.0.1:5500/*  // Add this line to include localhost
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Use requestAnimationFrame to run on every frame
    function setDevMode() {
        window.allowdevkey = true;  // Ensure it's accessible globally
        // alllowdevkey = true;  // Fix typo in the original code
        requestAnimationFrame(setDevMode); // Keep calling it on every frame
    }

    // Start the animation frame loop
    requestAnimationFrame(setDevMode);
})();
