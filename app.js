// --- 1. AUTH CHECK ---
// If no user is found, kick them back to login page
const currentUser = localStorage.getItem('echo_user');
if (!currentUser) {
    window.location.href = 'login.html';
} else {
    document.getElementById('userDisplay').innerText = currentUser;
}

function logout() {
    localStorage.removeItem('echo_user');
    window.location.href = 'login.html';
}

// --- 2. MAP SETUP ---
let map;
let userMarker;
let userLat = 41.0082; // Default Istanbul
let userLng = 28.9784;

// Load existing echoes from local storage
let echoes = JSON.parse(localStorage.getItem('echoes_db')) || [];

function initMap() {
    // Initialize Leaflet Map
    map = L.map('map').setView([userLat, userLng], 15);

    // Dark Mode Tiles (CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'ECHO Prototype',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add User Marker
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background:#6c5ce7; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #6c5ce7;"></div>',
        iconSize: [20, 20]
    });
    userMarker = L.marker([userLat, userLng], {icon: userIcon}).addTo(map);

    // Load Echoes
    renderEchoes();
}

// --- 3. GEOLOCATION ---
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (pos) => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            
            if (map) {
                userMarker.setLatLng([userLat, userLng]);
                // Optional: map.setView([userLat, userLng]); // Follow user
            } else {
                initMap();
            }
        },
        (err) => {
            console.error("Konum hatası:", err);
            initMap(); // Init with defaults if blocked
        }
    );
} else {
    initMap();
}

// --- 4. ECHO LOGIC ---
function openDropModal() {
    document.getElementById('dropModal').style.display = 'block';
}

function closeDropModal() {
    document.getElementById('dropModal').style.display = 'none';
}

function saveEcho() {
    const text = document.getElementById('echoText').value;
    if (!text) return;

    const newEcho = {
        id: Date.now(),
        user: currentUser,
        text: text,
        lat: userLat,
        lng: userLng,
        timestamp: new Date().toLocaleString()
    };

    echoes.push(newEcho);
    localStorage.setItem('echoes_db', JSON.stringify(echoes));

    renderEchoes();
    closeDropModal();
    document.getElementById('echoText').value = '';
}

function renderEchoes() {
    // Clear existing markers (except user) logic would go here in a full app
    // For prototype, we just add new ones
    
    echoes.forEach(echo => {
        const echoIcon = L.divIcon({
            className: 'echo-marker',
            html: `<div style="font-size:20px;">💬</div>`,
            iconSize: [30, 30]
        });

        const marker = L.marker([echo.lat, echo.lng], {icon: echoIcon}).addTo(map);
        
        marker.bindPopup(`
            <strong style="color:#6c5ce7">${echo.user}</strong><br>
            ${echo.text}<br>
            <small style="color:#999">${echo.timestamp}</small>
        `);
    });
}
