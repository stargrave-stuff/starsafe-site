// Wait until the entire HTML document is loaded before trying to access the elements.
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Get references to the necessary HTML elements
    // This will now successfully find the elements because the page is loaded.
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    // 2. NEW: Get the icon element
    const themeIcon = document.getElementById('theme-icon'); 
    
    // 🛑 CRITICAL CHECK: Ensure the button exists before attaching the listener
    if (!themeToggleBtn || !themeIcon) {
        console.error("Theme toggle button or icon not found. Check your HTML IDs.");
        // Stop the script if elements are missing
        return; 
    }

    // Function to set the icon based on the current theme
    function updateThemeIcon(theme) {
        // Remove all previous icon classes (fa-sun, fa-moon, etc.)
        themeIcon.classList.remove('fa-sun', 'fa-moon', 'fa-solid', 'fa'); 
        
        // Add the new icon class
        if (theme === 'dark') {
            // Use a Moon icon for the Dark theme
            themeIcon.classList.add('fa-solid', 'fa-moon'); 
        } else {
            // Use a Sun icon for the Light theme
            themeIcon.classList.add('fa-solid', 'fa-sun'); 
        }
    }

    // 3. Add an event listener to the button
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = bodyElement.getAttribute('data-theme');
        let newTheme;
        
        if (currentTheme === 'dark') {
            newTheme = 'light';
        } else {
            newTheme = 'dark';
        }
        
        // Set the new theme
        bodyElement.setAttribute('data-theme', newTheme);
        console.log(`Theme switched to ${newTheme}`);
        
        // Update the icon to match the new theme
        updateThemeIcon(newTheme);
    });

    // Optional: Run on load to ensure the icon matches the initial body theme
    updateThemeIcon(bodyElement.getAttribute('data-theme'));

});

// --- Mobile Menu Logic ---
const openBtn = document.getElementById('menu-open-btn');
const closeBtn = document.getElementById('menu-close-btn');
const mobileMenu = document.getElementById('mobile-menu');
const activeClass = 'is-active'; 
openBtn.addEventListener('click', function() {
    mobileMenu.classList.add(activeClass);
    openBtn.style.display = 'none'; 
});

closeBtn.addEventListener('click', function() {
    mobileMenu.classList.remove(activeClass);
    openBtn.style.display = 'block'; 
});

// Optional: Close the menu if a link is clicked
// mobileMenu.querySelectorAll('a').forEach(link => {
//    link.addEventListener('click', function() {
//        mobileMenu.classList.remove(activeClass);
//        openBtn.style.display = 'block'; 
//    });
//});

