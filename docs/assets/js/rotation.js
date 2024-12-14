let orientationListener;
let mouseControlActive = false;

const switchElement = document.getElementById("switch2");
if (switchElement) {
  switchElement.addEventListener("change", (event) => {
    if (event.target.checked) {
        permission();
    } else {
        disableOrientationListener();
    }
  });
}

function deactivateSwitch(switchName) {
  const switchElement = document.getElementById(switchName);
  console.log(switchElement.checked);
  if (switchElement) {
    console.log("switch element active");
    switchElement.checked = false;
  }
  console.log(switchElement.checked);
  console.log("deactivating switch");
}

function disableOrientationListener() {
  console.log("Switch deaktiviert, Listener wird entfernt.");
  endedRotation();
  if (orientationListener) {
    console.log("Wir gehen rein");
    window.removeEventListener("deviceorientation", orientationListener);  // removes the listener
    orientationListener = null;  // to make sure listener was removed
  }
  console.log("wir sind hier");
  if (mouseControlActive) {
    console.log("wir werden die mausssteuerung deaktivieren");
    mouseControlActive = false;
    disableMouseControl();
  }
}

document.getElementById("switch1").addEventListener("change", getUserLocation);

function permission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
          .then(response => {
              console.log("Response: ", response);
              if (response === "granted") {
                  console.log("Permission granted");
                  startedRotation();
                  let startOrientation = null;
                  let lastAlpha = null;       
                  let shift = -50;    // starting position

                  // Gerät-Orientierung-Listener
                  console.log("wir starten das ding");
                  orientationListener = (event) => {
                      const alpha = event.alpha; 
                      const beta = event.beta;
                      const gamma = event.gamma;

                      if (startOrientation === null) {
                          startOrientation = alpha;
                          lastAlpha = alpha; 
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

                          // position nur anpassen, wenn das Gerät richtig gehalten wird
                          if (Math.abs(beta) < 30 && (90 - Math.abs(gamma)) < 40) {
                              console.log("delta " + delta);
                              console.log("shift " + shift);
                              container.style.backgroundPositionX = `${-shift}%`;
                              console.log(container.style.backgroundPositionX);
                          }
                      }

                      lastAlpha = alpha; // store alpha value for next event
                  };

                  // Bestätige, dass der Event-Listener gesetzt wird
                  console.log("Event listener wird gesetzt");
                  window.addEventListener("deviceorientation", orientationListener);
              } else {
                  console.log("Permission wurde nicht erteilt");
                  deactivateSwitch("switch2");
              }
          })
          .catch(console.error);
  } else {
      console.log("Device Orientation nicht verfügbar.");
      startedRotation();
      enableMouseControl();
  }
}

// Event-Handler für mouse events
let onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel;

// Funktion zur Aktivierung der Maussteuerung
function enableMouseControl() {
    const container = document.getElementById("container");
    let isDragging = false;
    let startX = 0;
    let shift = 0;

    // Event-Handler für mouse events
    onMouseDown = (event) => {
        isDragging = true;
        startX = event.clientX; // starting position
    };

    onMouseMove = (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - startX; // calculate shift
        shift += (deltaX / window.innerWidth) * 100; // shift in %
        container.style.backgroundPositionX = `${-shift}%`;
        startX = event.clientX; // adapt starting position
    };

    onMouseUp = () => isDragging = false;
    onMouseLeave = () => isDragging = false;

    onWheel = (event) => {
        const deltaX = event.deltaX; // horizontal
        const deltaY = event.deltaY; // vertical
        shift += (deltaX / window.innerWidth) * 100; // horizontal scrolling
        shift += (deltaY / window.innerHeight) * 100; // vertical scrolling
        container.style.backgroundPositionX = `${-shift}%`;
    };

    // Event-Listener hinzufügen
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("wheel", onWheel);

    // Maussteuerung aktivieren
    mouseControlActive = true;
    console.log("Maussteuerung aktiviert.");
}

// Funktion zur Deaktivierung der Maussteuerung
function disableMouseControl() {
    const container = document.getElementById("container");
    // Entferne Event-Listener
    container.removeEventListener("mousedown", onMouseDown);
    container.removeEventListener("mousemove", onMouseMove);
    container.removeEventListener("mouseup", onMouseUp);
    container.removeEventListener("mouseleave", onMouseLeave);
    container.removeEventListener("wheel", onWheel);

    // Maussteuerung deaktivieren
    mouseControlActive = false;
    console.log("Maussteuerung deaktiviert.");
}


// places with coordinates
const locationMap = new Map([
  ["vancouver", { lat: 49.246292, lon: -123.116226 }],
  ["atacama-desert", { lat: -23.863213, lon: -69.141754 }],
  ["bad-wildbad", { lat: 48.750244, lon: 8.550301 }],
  ["cerro-paranal", { lat:  -24.6230, lon: -70.4025 }],
  ["singapore", { lat:  1.290270, lon: 103.851959 }],
  ["waterfront", { lat:  1.282375, lon: 103.864273 }],
  ["skyscraper", { lat:  1.28414719674, lon: 103.850613264 }]
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
        console.log("Error");
        deactivateSwitch("switch1");
      }
    );
  } else {
    deactivateSwitch("switch1");
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

function startedRotation() {
  const experienceElement = document.getElementById("experience");
  experienceElement.innerHTML = `Rotational shifting now possible`;
}

function endedRotation() {
  const experienceElement = document.getElementById("experience");
  experienceElement.innerHTML = `Enable Device enjoy the full experience`;
}

function displayLocation(lat, lon) {
  const locationElement = document.getElementById("location");
  locationElement.innerHTML = `Your location: <br> Latitude: ${lat.toFixed(4)} <br> Longitude: ${lon.toFixed(4)}`;
}


function calculateDistanceForCurrentPage(userLat, userLon) {
  const currentPage = getCurrentPageName();  // Extrahiert den Namen des Ortes von der URL
  const distanceElement = document.getElementById("distance");

  if (locationMap.has(currentPage)) {  // Wenn der Ort in der Map existiert
    const destinationCoords = locationMap.get(currentPage);  // Holt die Koordinaten des Ortes
    const distance = calculateDistance(userLat, userLon, destinationCoords.lat, destinationCoords.lon);  // Berechnet die Distanz

    // Zeigt die Distanz auf der Seite an
    distanceElement.innerHTML = `<br>Distance to ${currentPage}: ${distance.toFixed(2)} km`;
  } else {
    distanceElement.innerHTML = `<br>You can't travel there (yet)...`;
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

const spaceContainer = document.getElementById("spaceContainer");
if (spaceContainer) {
  document.addEventListener("DOMContentLoaded", () => {
    // API key gets inserted in the request URL
    const apiKey = 'IObSXih5k3lG7dSsjcj10QGQhmhnA2lRR9dDeFfl';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const imageUrl = data.url;
        spaceContainer.style.backgroundImage = `url(${imageUrl})`;
      })
      .catch(error => {
        console.error('Error while loading the image:', error);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (fullscreenBtn) {  
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
          container.requestFullscreen()
              .then(() => {
                  console.log("Vollbildmodus aktiviert");
              })
              .catch((err) => console.log(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`));
      } else {
          document.exitFullscreen()
              .then(() => {
                  console.log("Vollbildmodus beendet");
              })
              .catch((err) => console.log(`Fehler beim Beenden des Vollbildmodus: ${err.message}`));
      }
    });
  }
});