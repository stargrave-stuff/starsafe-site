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

document.addEventListener('DOMContentLoaded', () => {
    const userPanel = document.getElementById('user-panel');

    // Base URL for Discord user avatars
    const DISCORD_AVATAR_BASE_URL = 'https://cdn.discordapp.com/avatars/';

    /**
     * Constructs the correct Discord avatar URL.
     * @param {string} userId - The Discord user ID.
     * @param {string | null} avatarHash - The user's avatar hash.
     * @returns {string} The full URL for the user's avatar image.
     */
    function getAvatarUrl(userId, avatarHash) {
        if (avatarHash) {
            // Standard avatar URL for users with a custom avatar (.png is usually fine)
            return `${DISCORD_AVATAR_BASE_URL}${userId}/${avatarHash}.png`;
        }
        // Fallback for users using a default Discord avatar (if avatar hash is null).
        // The default avatar URL is determined by the discriminator, but for simplicity 
        // in modern Discord, we often use a generic fallback or one of the 5 default numbers.
        // We'll use a generic placeholder here.
        return 'https://cdn.discordapp.com/embed/avatars/0.png'; 
    }

    // Fetch the user data from the dedicated API endpoint
    fetch('/user-data')
        .then(response => {
            if (!response.ok) {
                // Should redirect to login via checkAuth if unauthorized, 
                // but this handles network errors.
                throw new Error('Failed to fetch user data. Status: ' + response.status);
            }
            return response.json();
        })
        .then(user => {
            if (!user || !user.id) {
                throw new Error('User data is empty.');
            }
            
            // Generate the avatar URL using the stored hash
            const avatarUrl = getAvatarUrl(user.id, user.avatar);
            
            // Construct the HTML for the dynamic panel
            userPanel.innerHTML = `
                <img src="${avatarUrl}" alt="${user.username}'s Avatar">
                <div class="user-info">
                    <strong>${user.username}</strong>
                    <small>#${user.id}</small> 
                </div>
                <a href="/logout" class="logout-button" title="Logout">
                    <svg style="width:20px;height:20px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                    </svg>
                </a>
            `;
            
            // If you had main dashboard content loading, you would remove the "Loading..." message here.

        })
        .catch(error => {
            console.error('Error loading user panel:', error);
            userPanel.innerHTML = `
                <p>Failed to load user info.</p>
                <a href="/logout" class="logout-button">Retry Login</a>
            `;
        });
});