const btn = document.getElementById("requestButton");
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

function getUserLocation() {
    if (navigator.geolocation) {
      // requesting Geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log(`Standort des Benutzers: Latitude: ${lat}, Longitude: ${lon}`);
          // calculate the distance
          getStreetDistance(lat, lon);
        },
        (error) => {
          console.error("Fehler beim Abrufen des Standorts: ", error);
        }
      );
    } else {
      console.log("Geolocation wird von diesem Browser nicht unterstützt.");
    }
  }
  
  async function getStreetDistance(userLat, userLon) {
    const apiKey = '5b3ce3597851110001cf624870ac6064badc44ada9975b1ed44447c9';
  
    const startCoords = [userLon, userLat];  // Benutzerkoordinaten (Längengrad, Breitengrad)
    const endCoords = [2.3522, 48.8566];    // Beispielziel (Paris)
  
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${startCoords.join(',')}&end=${endCoords.join(',')}`;
  
    const options = {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    };
  
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        const distance = data.routes[0].summary.distance / 1000;  // in kilometers
        console.log(`Straßendistanz: ${distance.toFixed(2)} km`);
      } else {
        console.error('Fehler beim Abrufen der Route:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
    }
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
