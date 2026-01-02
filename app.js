// --- 1. AUTH CHECK ---
const currentUser = localStorage.getItem('echo_user');
if (!currentUser) window.location.href = 'login.html';
document.getElementById('userDisplay').innerText = currentUser;

function logout() {
    localStorage.removeItem('echo_user');
    window.location.href = 'login.html';
}

// --- 2. MAP SETUP ---
let map;
let userLat = 41.0082; 
let userLng = 28.9784;
let echoes = JSON.parse(localStorage.getItem('echoes_db')) || [];

function initMap() {
    map = L.map('map').setView([userLat, userLng], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'ECHO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // User Marker
    L.marker([userLat, userLng], {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background:#6c5ce7; width:15px; height:15px; border-radius:50%; border:2px solid white;"></div>',
            iconSize: [20, 20]
        })
    }).addTo(map);

    renderEchoes();
}

// --- 3. GEOLOCATION ---
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (pos) => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            if(!map) initMap();
        },
        () => initMap()
    );
} else {
    initMap();
}

// --- 4. IMAGE HANDLING & SAVING ---
let currentImageBase64 = null;

function previewImage() {
    const file = document.getElementById('echoImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            currentImageBase64 = reader.result;
            document.getElementById('imagePreview').src = currentImageBase64;
            document.getElementById('imagePreviewContainer').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

function openDropModal() {
    document.getElementById('dropModal').style.display = 'block';
}

function closeDropModal() {
    document.getElementById('dropModal').style.display = 'none';
    // Reset inputs
    document.getElementById('echoText').value = '';
    document.getElementById('echoImage').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    currentImageBase64 = null;
}

function saveEcho() {
    const text = document.getElementById('echoText').value;
    
    // Check if user entered text OR image
    if (!text && !currentImageBase64) return alert("Lütfen bir yazı veya fotoğraf ekleyin.");

    const newEcho = {
        id: Date.now(),
        user: currentUser,
        text: text,
        image: currentImageBase64, // Save the image string
        lat: userLat,
        lng: userLng,
        timestamp: new Date().toLocaleDateString('tr-TR')
    };

    try {
        echoes.push(newEcho);
        localStorage.setItem('echoes_db', JSON.stringify(echoes));
        renderEchoes();
        closeDropModal();
    } catch (e) {
        alert("Depolama alanı dolu! Fotoğraf çok büyük.");
    }
}

function renderEchoes() {
    // We are clearing markers to prevent duplicates in this simple version
    // In a real app, you'd manage layers better
    
    echoes.forEach(echo => {
        const echoIcon = L.divIcon({
            className: 'echo-marker',
            html: `<div style="font-size:24px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">
                    ${echo.image ? '📸' : '💬'} 
                   </div>`,
            iconSize: [30, 30]
        });

        const marker = L.marker([echo.lat, echo.lng], {icon: echoIcon}).addTo(map);
        
        // Popup Content
        let popupContent = `<strong style="color:#6c5ce7">${echo.user}</strong><br>`;
        if(echo.image) {
            popupContent += `<img src="${echo.image}" style="width:100%; border-radius:8px; margin:5px 0;"><br>`;
        }
        popupContent += `${echo.text}<br><small style="color:#999">${echo.timestamp}</small>`;
        
        marker.bindPopup(popupContent);
    });
}
