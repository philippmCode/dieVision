const btn = document.getElementById("requestButton");
btn.addEventListener("click", permission);

//when loading the page
document.addEventListener('DOMContentLoaded', function() {
    checkDeviceOrientationPermission();
})

function checkDeviceOrientationPermission() {
    
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        // Überprüfen, ob die Berechtigung schon erteilt wurde
        DeviceOrientationEvent.requestPermission().then(function(response) {
            if (response === 'granted') {
                console.log('Berechtigung erteilt!');
                // Führe hier den Code aus, der DeviceOrientation verwendet
            } else {
                alert('Without the permission you wont be able to get the full experience!');
            }
        }).catch(function(error) {
            alert('Error while requesting permission:', error);
        });
    } else {
        alert("DeviceOrientationEvent is not defined for this device");
    }
}


function permission() {
    

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
