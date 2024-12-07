const btn = document.getElementById("device-orientation-button");
btn.addEventListener("click", permission);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    let startOrientation = null;
                    let lastAlpha = null;       
                    let shift = -50;    //starting position
    
                    window.addEventListener("deviceorientation", (event) => {
                        
                        const alpha = event.alpha; 
                        const beta = event.beta;
                        const gamma = event.gamma;
    
                        if (startOrientation === null) {
                            startOrientation = alpha;
                            lastAlpha = alpha; 
                            displayStartingPoint(startOrientation);
                        }
    
                        if (lastAlpha !== null) {
                            
                            let delta = alpha - lastAlpha;
    
                            // transition at 360°/0°-border
                            if (delta > 180) {
                                delta -= 360;
                            } else if (delta < -180) {
                                delta += 360;
                            }
    
                            // shift in %
                            shift += (delta / 360) * 100;
    
                            // picture gets only adjusted if device held correctly
                            if (Math.abs(beta) < 30 && (90 - Math.abs(gamma)) < 40) {
                                container.style.backgroundPositionX = `${-shift}%`;
                            }
    
                            // Debugging/Anzeige
                            displayRotationData(shift);
                            displayOrientationData(alpha, beta, gamma);
                        }
    
                        lastAlpha = alpha; // store alpha value for next event
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceOrientationEvent is not defined for this device");
    }
    
}

const locationBtn = document.getElementById("location-button");
locationBtn.addEventListener("click", getUserLocation);

// Orte und deren Koordinaten
const locationMap = new Map([
  ["Berlin", { lat: 52.5200, lon: 13.4050 }],
  ["München", { lat: 48.1351, lon: 11.5820 }],
  ["Hamburg", { lat: 53.5511, lon: 9.9937 }]
]);

// Funktion, um die Position des Nutzers zu holen
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        displayLocation(userLat, userLon);
        displayDistances(userLat, userLon); // Distanzen zu allen Orten berechnen
      },
      (error) => {
        console.error("Fehler beim Abrufen des Standorts: ", error);
      }
    );
  } else {
    console.log("Geolocation wird von diesem Browser nicht unterstützt.");
  }
}

// Zeigt den Standort des Nutzers auf der Seite an
function displayLocation(lat, lon) {
  const locationElement = document.getElementById("location");
  locationElement.innerText = `Ihr Standort: Latitude ${lat.toFixed(4)}, Longitude ${lon.toFixed(4)}`;
}

// Berechnet die Entfernung zwischen zwei Koordinaten (Haversine-Formel)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in Kilometern
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Entfernung in Kilometern
}

function displayDistances(userLat, userLon) {
  const distanceElement = document.getElementById("distance");
  distanceElement.innerHTML = ''; // Liste zurücksetzen

  locationMap.forEach((coords, name) => {
    const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
    const listItem = document.createElement("p");
    listItem.textContent = `Entfernung zu ${name}: ${distance.toFixed(2)} km`;
    distanceElement.appendChild(listItem); // Distanz zur Anzeige hinzufügen
  });
}

document.addEventListener("DOMContentLoaded", () => {
    
    // container whose background image we want to set
    const container = document.getElementById("spaceContainer");

    // api key gets inserted in the request url
    const apiKey = 'IObSXih5k3lG7dSsjcj10QGQhmhnA2lRR9dDeFfl';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        const imageUrl = data.url;
        container.style.backgroundImage = `url(${imageUrl})`;
    })
    .catch(error => {
        console.error('Error while loading the image:', error);
    });
});

const container = document.getElementById("container");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const fullscreenIcon = document.getElementById("fullscreen-icon");

// paths
const expandPath = "M3 3h6v2H5v4H3V3zm18 0v6h-2V5h-4V3h6zm0 18h-6v-2h4v-4h2v6zM3 21v-6h2v4h4v2H3z";
const collapsePath = "M5 5h4v2H7v2H5V5zm14 0v4h-2V7h-2V5h4zM5 19v-4h2v2h2v2H5zm14 0h-4v-2h2v-2h2v4z"; 

fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        container.requestFullscreen()
            .then(() => {
                // Wenn der Vollbildmodus aktiviert wird, ändere das Icon
                fullscreenIcon.setAttribute("d", collapsePath);
            })
            .catch((err) => alert(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`));
    } else {
        document.exitFullscreen()
            .then(() => {
                // Wenn der Vollbildmodus verlassen wird, ändere das Icon zurück
                fullscreenIcon.setAttribute("d", expandPath);
            })
            .catch((err) => alert(`Fehler beim Beenden des Vollbildmodus: ${err.message}`));
    }
});

function displayStartingPoint(start) {
    document.getElementById('start').innerText = start !== null ? start.toFixed(2) : '-';
}

function displayPosition(position) {
    document.getElementById('position').innerText = position !== null ? start.toFixed(2) : '-';
}

function displayRotationData(rotation) {
    document.getElementById('rotation').innerText = rotation !== null ? rotation.toFixed(2) : '-';
}

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}

function displayLocation(lat, lon) {
  const locationElement = document.getElementById('location');
  
  if (locationElement) {
    locationElement.innerText = 
      lat !== null && lon !== null 
        ? `Standort des Benutzers: Latitude: ${lat.toFixed(2)}, Longitude: ${lon.toFixed(2)}`
        : 'Standortinformationen sind nicht verfügbar.';
  }
}

