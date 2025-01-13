let orientationListener;
let mouseControlActive = false;

document.getElementById("switch1").addEventListener("change", getUserLocation);

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
        deactivateSwitch("switch1");
      }
    );
  } else {
    deactivateSwitch("switch1");
  }
}

function displayLocation(lat, lon) {
  const locationElement = document.getElementById("location");
  locationElement.innerHTML = `Your location: <br> Latitude: ${lat.toFixed(4)} <br> Longitude: ${lon.toFixed(4)}`;
}

// calculates the distance between the user and the location
function calculateDistanceForCurrentPage(userLat, userLon) {
  const currentPage = getCurrentPageName();
  const distanceElement = document.getElementById("distance");

  if (locationMap.has(currentPage)) {  // if location exists in the map
    const destinationCoords = locationMap.get(currentPage);
    const distance = calculateDistance(userLat, userLon, destinationCoords.lat, destinationCoords.lon);

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

// if the feature the switch is calling is not activated, the switch is to be turned off again
function deactivateSwitch(switchName) {
  const switchElement = document.getElementById(switchName);
  if (switchElement) {
    switchElement.checked = false;
  }
}

// switch to enable/disable device orientation
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

// request permission for device orientation
function permission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
          .then(response => {
              if (response === "granted") {
                  // if permission is granted
                  rotateBackground();
              } else {
                  // if permission is denied
                  deactivateSwitch("switch2");
              }
          })
          .catch(console.error);
  } else {
      // device orientation not supported
      startedRotation();
      enableMouseControl();
  }
}

// translates the device orientation into a background shift
function rotateBackground() {

  startedRotation();
  let startOrientation = null;
  let lastAlpha = null;       
  let shift = -50;    // starting position

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

          // shift in %, * 200 so that 360° = 100%
          shift += (delta / 360) * 200;

          // only shift if device is held vertically in landscape mode
          if (Math.abs(beta) < 30 && (90 - Math.abs(gamma)) < 40) {
              container.style.backgroundPositionX = `${-shift}%`;
          }
      }
      lastAlpha = alpha; // store alpha value for next event
  };
  window.addEventListener("deviceorientation", orientationListener);
}

// if the user does not want to be able to rotate the background anymore
function disableOrientationListener() {

  endedRotation();
  if (orientationListener) {
    window.removeEventListener("deviceorientation", orientationListener);  // removes the listener
    orientationListener = null;  // to make sure listener was removed
  }
  if (mouseControlActive) {
    mouseControlActive = false;
    disableMouseControl();
  }
}

function startedRotation() {
  const experienceElement = document.getElementById("experience");
  experienceElement.innerHTML = `Rotational shifting now possible`;
}

function endedRotation() {
  const experienceElement = document.getElementById("experience");
  experienceElement.innerHTML = `Enable Device Orientation to enjoy the full experience`;
}

// event handler for mouse events
let onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel;

// handles the mouse control
function enableMouseControl() {
    const container = document.getElementById("container");
    let isDragging = false;
    let startX = 0;
    let shift = 0;

    // Event-Handler for mouse events
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

    // event listeners
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("wheel", onWheel);

    // activate mouse control
    mouseControlActive = true;
}

function disableMouseControl() {
    const container = document.getElementById("container");
    // remove event listener
    container.removeEventListener("mousedown", onMouseDown);
    container.removeEventListener("mousemove", onMouseMove);
    container.removeEventListener("mouseup", onMouseUp);
    container.removeEventListener("mouseleave", onMouseLeave);
    container.removeEventListener("wheel", onWheel);

    // deactivate mouse control
    mouseControlActive = false;
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

// to calculate the distance between the user and a location
function getCurrentPageName() {
  const url = window.location.href;  // complete url of the page
  const pathParts = url.split("/");
  
  // penultimate part of the split url is the name of the location
  let currentPage = pathParts[pathParts.length - 1].toLowerCase();
  currentPage = currentPage.replace(".html", "");

  return currentPage;
}

// to access the nasa space picture of the day
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

// activate fullscreen mode
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (fullscreenBtn) {  
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
          container.requestFullscreen()
              .catch((err) => console.log(`Error while activating full screen mode: ${err.message}`));
      } else {
          document.exitFullscreen()
              .catch((err) => console.log(`Error while deactivating full screen mode: ${err.message}`));
      }
    });
  }
});