let orientationListener;

document.getElementById("switch1").addEventListener("change", (event) => {
  if (event.target.checked) {
      permission();
  } else {
      disableOrientationListener();
  }
});

function disableOrientationListener() {
  console.log("Switch deaktiviert, Listener wird entfernt.");
  window.removeEventListener("deviceorientation", orientationListener); // Entfernt den Event-Listener
}

document.getElementById("switch2").addEventListener("change", getUserLocation);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    console.log("Permission granted");
                    let startOrientation = null;
                    let lastAlpha = null;       
                    let shift = -50;    //starting position

                    // Gerät-Orientierung-Listener
                    orientationListener = (event) => {
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
                            shift += (delta / 360) * 200;

                            // position nur anpassen, wenn das Gerät richtig gehalten wird
                            if (Math.abs(beta) < 30 && (90 - Math.abs(gamma)) < 40) {
                                container.style.backgroundPositionX = `${-shift}%`;
                            }

                            displayRotationData(shift);
                            displayPosition(shift);
                        }

                        lastAlpha = alpha; // store alpha value for next event
                    };

                    // Füge den Event-Listener für deviceorientation hinzu
                    window.addEventListener("deviceorientation", orientationListener);
                }
            })
            .catch(console.error);
    } else {
        console.log("Device Orientation nicht verfügbar.");
        enableMouseControl();
    }
    
}

// mouse and trackpad control
function enableMouseControl() {

  const container = document.getElementById("container");

  let isDragging = false;
  let startX = 0;        
  let shift = 0;

  container.addEventListener("mousedown", (event) => {
      isDragging = true;
      startX = event.clientX; // starting position
  });

  container.addEventListener("mousemove", (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - startX; // calculate shift
      shift += (deltaX / window.innerWidth) * 100; // transfer shift to %
      container.style.backgroundPositionX = `${-shift}%`;
      startX = event.clientX; // adapt starting position
  });

  // End dragging on mouse up or leaving container
  container.addEventListener("mouseup", () => isDragging = false);
  container.addEventListener("mouseleave", () => isDragging = false);

  container.addEventListener("wheel", (event) => {
    const deltaX = event.deltaX; // horizontal
    const deltaY = event.deltaY; // vertical

    // horizontal scrolling
    shift += (deltaX / window.innerWidth) * 100;

    // vertical scrolling
    shift += (deltaY / window.innerHeight) * 100;

    container.style.backgroundPositionX = `${-shift}%`;
  });
}

// places with coordinates
const locationMap = new Map([
  ["vancouver", { lat: 49.246292, lon: -123.116226 }],
  ["atacama-desert", { lat: -23.863213, lon: -69.141754 }],
  ["bad-wildbad", { lat: 48.750244, lon: 8.550301 }],
  ["starry-sky", { lat:  -24.6230, lon: -70.4025 }]
]);

// Funktion, um die Position des Nutzers zu holen
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        displayLocation(userLat, userLon);
        calculateDistanceForCurrentPage(userLat, userLon);
      },
      (error) => {
        console.error("Fehler beim Abrufen des Standorts: ", error);
      }
    );
  } else {
    console.log("Geolocation wird von diesem Browser nicht unterstützt.");
  }
}

function getCurrentPageName() {
  const url = window.location.href;  // Holt die vollständige URL der Seite
  const pathParts = url.split("/");  // Teilt die URL anhand des "/"
  
  // Hier nehmen wir den letzten Teil der URL als den aktuellen Ort an
  let currentPage = pathParts[pathParts.length - 1].toLowerCase(); // Der Name des Ortes in Kleinbuchstaben
  currentPage = currentPage.replace(".html", "");

  return currentPage;
}

function displayLocation(lat, lon) {
  const locationElement = document.getElementById("location");
  locationElement.innerHTML = `Your location: <br> Latitude: ${lat.toFixed(4)} <br> Longitude: ${lon.toFixed(4)}`;
}


function calculateDistanceForCurrentPage(userLat, userLon) {
  const currentPage = getCurrentPageName();  // Extrahiert den Namen des Ortes von der URL

  if (locationMap.has(currentPage)) {  // Wenn der Ort in der Map existiert
    const destinationCoords = locationMap.get(currentPage);  // Holt die Koordinaten des Ortes
    const distance = calculateDistance(userLat, userLon, destinationCoords.lat, destinationCoords.lon);  // Berechnet die Distanz

    // Zeigt die Distanz auf der Seite an
    const distanceElement = document.getElementById("distance");
    distanceElement.innerHTML = `<br>Distance to ${currentPage}: ${distance.toFixed(2)} km`;
  } else {
    distanceElement.innerText = `You can't travel there (yet)...`;
  }
}

// haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371; // earth radius
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // distance in km
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

// needs to be fixed
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

function displayRotationData(rotation) {
    document.getElementById('rotation').innerText = rotation !== null ? rotation.toFixed(2) : '-';
}

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}

