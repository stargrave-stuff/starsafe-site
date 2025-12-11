const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch'); 
const path = require('path');
require('dotenv').config(); 

const app = express();
// Use PORT from environment variables, defaulting to 3001
const PORT = process.env.PORT || 3001; 

// ====================================================
// DISCORD & ENVIRONMENT CONSTANTS
// ====================================================
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; 
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
const OAUTH_SCOPES = 'identify email'; 


// ====================================================
// MIDDLEWARE & CONFIGURATION
// ====================================================

// REQUIRED when running behind a proxy like Render/Heroku
app.set('trust proxy', 1); 

// 1. Session Setup for user authentication state
app.use(
    session({
        secret: process.env.SESSION_SECRET, 
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours (1 day)
            // *** REQUIRED FOR HTTPS/PRODUCTION HOSTING (Render/Heroku) ***
            secure: true, 
            sameSite: 'none'
        }
    })
);

// 2. Static File Serving (Public Assets)
// Maps the base URL to files in the 'public' directory, using 'home.html' as the default.
app.use(express.static(path.join(__dirname, 'public')));

// 3. Static Assets for Dashboard (Crucial for loading /dashboard/styles.css etc.)
// Allows the browser to load CSS/JS from the public/dashboard folder when viewing /dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public', 'dashboard')));


// 4. Authentication Check Middleware
/**
 * Express middleware to ensure the user is logged in.
 */
function checkAuth(req, res, next) {
    if (req.session.user) {
        return next(); 
    }
    // Not logged in, redirect to the landing page
    res.redirect('/'); 
}


// ====================================================
// ROUTES
// ====================================================

// 1. Root Route ('/')
app.get('/', (req, res, next) => {
    if (req.session.user) {
        // Logged in: Automatically redirect to the protected dashboard
        return res.redirect('/dashboard');
    }
    // Not logged in: Serve public/home.html via static middleware
    next(); 
});


// 2. Dashboard Route ('/dashboard') - PROTECTED CONTENT
app.get('/dashboard', checkAuth, (req, res) => {
    // Serves the main HTML file from the public/dashboard directory
    res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
});


// 3. User Data API Endpoint (Required for client-side panel)
// Securely sends the minimal user data needed for the dashboard panel.
app.get('/user-data', checkAuth, (req, res) => {
    // Sends the user object (including id, username, and avatar hash)
    res.json(req.session.user);
});


// 4. The Login Route - Initiates Discord OAuth flow
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard'); 
    }

    // Redirect the client to Discord's authorization endpoint
    const discordAuthUrl = `${DISCORD_API_ENDPOINT}/oauth2/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(OAUTH_SCOPES)}`;

    res.redirect(discordAuthUrl);
});

// 5. The Callback Route (Core Discord OAuth2 Logic)
app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.redirect('/');
    }

    try {
        // --- Part A: Exchange Authorization Code for Access Token ---
        const tokenResponse = await fetch(`${DISCORD_API_ENDPOINT}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        if (!access_token) {
            console.error('Token exchange failed:', tokenData);
            return res.status(500).send('Authentication Error: Failed to get access token from Discord. Check your Client Secret and Redirect URI.');
        }

        // --- Part B: Use Access Token to Get User Data ---
        const userResponse = await fetch(`${DISCORD_API_ENDPOINT}/users/@me`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userData = await userResponse.json();

        // --- Part C: Log In the User and Redirect ---
        req.session.user = {
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar, // IMPORTANT: Store the avatar hash for the panel
        };

        // Success! Redirect to the protected dashboard
        res.redirect('/dashboard'); 

    } catch (error) {
        console.error('Error during Discord login flow:', error);
        res.status(500).send('An unexpected error occurred during authentication. Check server logs.');
    }
});

// 6. Utility Route (Logout)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out.');
        }
        // Redirect to the root (public/home.html)
        res.redirect('/');
    });
});

// ====================================================
// SERVER START
// ====================================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
