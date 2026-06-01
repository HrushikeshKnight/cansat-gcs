// ===== GLOBAL VARIABLES =====
let telemetryActive = false;
let telemetryInterval = null;
let packetCount = 0;
let missionTime = 0;
let telemetryLogs = [];
let chartInstances = {};
let gpsLatitude = 20.2961;
let gpsLongitude = 85.8245;
let mapMarker = null;
let pathCoordinates = [];
let separationExecuted = false;
let parachuteDeployed = false;
let descentRateHistory = [];
let gpsAvailable = true;

// Chart colors for simple academic look
const chartColors = {
    altitude: '#3498db',
    pressure: '#e74c3c',
    temperature: '#f39c12',
    descent: '#27ae60',
    battery: '#9b59b6'
};

// ===== PACKET PARSER =====
// This function parses telemetry packets in the format:
// MISSION_TIME,PACKET_COUNT,ALTITUDE,PRESSURE,TEMP,BATTERY,LAT,LON,DESCENT_RATE
function parsePacket(packetString) {
    const parts = packetString.split(',');
    return {
        missionTime: parseFloat(parts[0]),
        packetCount: parseInt(parts[1]),
        altitude: parseFloat(parts[2]),
        pressure: parseFloat(parts[3]),
        temperature: parseFloat(parts[4]),
        battery: parseFloat(parts[5]),
        latitude: parseFloat(parts[6]),
        longitude: parseFloat(parts[7]),
        descentRate: parseFloat(parts[8])
    };
}

// ===== TELEMETRY GENERATOR =====
// Generates realistic simulated telemetry data
function generateTelemetryData() {
    missionTime++;
    packetCount++;

    // Simulate altitude decreasing (descent phase)
    let baseAltitude = Math.max(0, 1200 - (missionTime * 5) + (Math.random() - 0.5) * 20);
    
    // Simulate pressure increasing as altitude decreases
    let basePressure = 1013.25 - (baseAltitude / 100) * 10 + (Math.random() - 0.5) * 5;
    
    // Simulate temperature based on altitude
    let baseTemp = 25 - (baseAltitude / 1000) * 6.5 + (Math.random() - 0.5) * 2;
    
    // Simulate battery voltage decreasing slowly
    let batteryVoltage = Math.max(6, 12 - (missionTime * 0.01) + (Math.random() - 0.5) * 0.5);
    
    // Simulate descent rate (should be 8-10 m/s in safe range)
    let descentRate = 9 + (Math.random() - 0.5) * 3;
    descentRateHistory.push(descentRate);
    if (descentRateHistory.length > 20) descentRateHistory.shift();
    
    // Simulate GPS movement (slow drift)
    gpsLatitude += (Math.random() - 0.5) * 0.0001;
    gpsLongitude += (Math.random() - 0.5) * 0.0001;
    
    // Randomly simulate GPS loss occasionally
    if (Math.random() > 0.95) {
        gpsAvailable = !gpsAvailable;
    }
    
    // Create packet string for parsing
    const packetString = `${missionTime},${packetCount},${baseAltitude.toFixed(2)},${basePressure.toFixed(2)},${baseTemp.toFixed(2)},${batteryVoltage.toFixed(2)},${gpsLatitude.toFixed(4)},${gpsLongitude.toFixed(4)},${descentRate.toFixed(2)}`;
    
    // Parse the packet
    const data = parsePacket(packetString);
    
    // Add payload data (slightly different from container)
    data.payloadAltitude = baseAltitude * 0.98 + (Math.random() - 0.5) * 10;
    data.payloadTemp = baseTemp + (Math.random() - 0.5) * 1;
    data.payloadBattery = batteryVoltage * 0.9;
    data.payloadStatus = separationExecuted ? 'Separated' : 'Nominal';
    
    return data;
}

// ===== UPDATE TELEMETRY DISPLAY =====
function updateTelemetryDisplay(data) {
    document.getElementById('missionTime').textContent = data.missionTime;
    document.getElementById('packetCount').textContent = data.packetCount;
    document.getElementById('altitude').textContent = data.altitude.toFixed(2);
    document.getElementById('pressure').textContent = data.pressure.toFixed(2);
    document.getElementById('temperature').textContent = data.temperature.toFixed(2);
    document.getElementById('battery').textContent = data.battery.toFixed(2);
    document.getElementById('latitude').textContent = data.latitude.toFixed(4);
    document.getElementById('longitude').textContent = data.longitude.toFixed(4);
    document.getElementById('descentRate').textContent = data.descentRate.toFixed(2);
    
    document.getElementById('payloadAltitude').textContent = data.payloadAltitude.toFixed(2);
    document.getElementById('payloadTemp').textContent = data.payloadTemp.toFixed(2);
    document.getElementById('payloadBattery').textContent = data.payloadBattery.toFixed(2);
    document.getElementById('payloadStatus').textContent = data.payloadStatus;
}

// ===== UPDATE ERROR CODE SYSTEM =====
// Digit 1: 0 = descent rate safe (8-10 m/s), 1 = outside safe range
// Digit 2: 0 = GPS available, 1 = GPS unavailable
// Digit 3: 0 = payload separated, 1 = separation failure
// Digit 4: 0 = parachute inactive, 1 = parachute activated
function updateErrorCode(data) {
    let digit1 = (data.descentRate < 8 || data.descentRate > 10) ? '1' : '0';
    let digit2 = !gpsAvailable ? '1' : '0';
    let digit3 = !separationExecuted ? '1' : '0';
    let digit4 = parachuteDeployed ? '1' : '0';
    
    const errorCode = digit1 + digit2 + digit3 + digit4;
    const errorElement = document.getElementById('errorCode');
    
    errorElement.textContent = errorCode;
    
    // Change color based on faults
    if (errorCode !== '0000') {
        errorElement.classList.add('fault');
    } else {
        errorElement.classList.remove('fault');
    }
    
    // Update digit explanations
    document.getElementById('digit1Msg').textContent = 
        digit1 === '0' ? '0 = Safe (8-10 m/s)' : '1 = UNSAFE - Outside range';
    document.getElementById('digit2Msg').textContent = 
        digit2 === '0' ? '0 = Available' : '1 = UNAVAILABLE';
    document.getElementById('digit3Msg').textContent = 
        digit3 === '0' ? '0 = Separated' : '1 = FAILURE';
    document.getElementById('digit4Msg').textContent = 
        digit4 === '0' ? '0 = Inactive' : '1 = ACTIVE';
}

// ===== UPDATE ORIENTATION VISUALIZATION =====
function updateOrientation() {
    // Generate random orientation values
    const roll = (Math.random() - 0.5) * 30;
    const pitch = (Math.random() - 0.5) * 30;
    const yaw = (Math.random() - 0.5) * 360;
    
    const box = document.getElementById('orientationBox');
    box.style.transform = `rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
    
    document.getElementById('rollValue').textContent = roll.toFixed(1);
    document.getElementById('pitchValue').textContent = pitch.toFixed(1);
    document.getElementById('yawValue').textContent = yaw.toFixed(1);
}

// ===== INITIALIZE CHARTS =====
function initializeCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    // Altitude Chart
    const altCtx = document.getElementById('altitudeChart').getContext('2d');
    chartInstances.altitude = new Chart(altCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Altitude (m)',
                data: [],
                borderColor: chartColors.altitude,
                backgroundColor: chartColors.altitude + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }
    });

    // Pressure Chart
    const presCtx = document.getElementById('pressureChart').getContext('2d');
    chartInstances.pressure = new Chart(presCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Pressure (hPa)',
                data: [],
                borderColor: chartColors.pressure,
                backgroundColor: chartColors.pressure + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }
    });

    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    chartInstances.temperature = new Chart(tempCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: chartColors.temperature,
                backgroundColor: chartColors.temperature + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }
    });

    // Descent Rate Chart
    const decentCtx = document.getElementById('descentChart').getContext('2d');
    chartInstances.descent = new Chart(decentCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Descent Rate (m/s)',
                data: [],
                borderColor: chartColors.descent,
                backgroundColor: chartColors.descent + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }
    });

    // Battery Chart
    const battCtx = document.getElementById('batteryChart').getContext('2d');
    chartInstances.battery = new Chart(battCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Battery Voltage (V)',
                data: [],
                borderColor: chartColors.battery,
                backgroundColor: chartColors.battery + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }
    });
}

// ===== UPDATE CHARTS =====
function updateCharts(data) {
    const timeLabel = missionTime;

    // Helper function to update chart data
    function updateChartData(chart, value, maxPoints = 20) {
        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(value);

        if (chart.data.labels.length > maxPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    updateChartData(chartInstances.altitude, data.altitude);
    updateChartData(chartInstances.pressure, data.pressure);
    updateChartData(chartInstances.temperature, data.temperature);
    updateChartData(chartInstances.descent, data.descentRate);
    updateChartData(chartInstances.battery, data.battery);
}

// ===== INITIALIZE MAP =====
function initializeMap() {
    const map = L.map('map').setView([gpsLatitude, gpsLongitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add initial marker
    mapMarker = L.marker([gpsLatitude, gpsLongitude], {
        title: 'CanSat Position'
    }).addTo(map);

    // Store map for later updates
    window.gcsMap = map;
}

// ===== UPDATE MAP =====
function updateMapMarker() {
    if (mapMarker && window.gcsMap) {
        mapMarker.setLatLng([gpsLatitude, gpsLongitude]);
        window.gcsMap.setView([gpsLatitude, gpsLongitude], 13);
        
        // Store path
        pathCoordinates.push([gpsLatitude, gpsLongitude]);
        
        // Draw path if we have multiple points
        if (pathCoordinates.length > 1 && !window.pathPolyline) {
            window.pathPolyline = L.polyline(pathCoordinates, {
                color: '#3498db',
                weight: 2,
                opacity: 0.7
            }).addTo(window.gcsMap);
        } else if (window.pathPolyline) {
            window.pathPolyline.setLatLngs(pathCoordinates);
        }
        
        document.getElementById('mapCoords').textContent = 
            `${gpsLatitude.toFixed(4)}°N, ${gpsLongitude.toFixed(4)}°E`;
    }
}

// ===== ADD LOG ENTRY =====
function addLogEntry(data) {
    const timestamp = new Date().toLocaleTimeString();
    telemetryLogs.unshift({
        timestamp,
        altitude: data.altitude,
        temperature: data.temperature,
        pressure: data.pressure,
        battery: data.battery,
        descentRate: data.descentRate
    });

    // Keep only last 100 entries
    if (telemetryLogs.length > 100) {
        telemetryLogs.pop();
    }

    updateLogsTable();
}

// ===== UPDATE LOGS TABLE =====
function updateLogsTable() {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';

    telemetryLogs.forEach(log => {
        const row = tbody.insertRow(0);
        row.innerHTML = `
            <td>${log.timestamp}</td>
            <td>${log.altitude.toFixed(2)}</td>
            <td>${log.temperature.toFixed(2)}</td>
            <td>${log.pressure.toFixed(2)}</td>
            <td>${log.battery.toFixed(2)}</td>
            <td>${log.descentRate.toFixed(2)}</td>
        `;
    });
}

// ===== TELEMETRY LOOP =====
function startTelemetry() {
    if (telemetryActive) return;

    telemetryActive = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    telemetryInterval = setInterval(() => {
        const data = generateTelemetryData();
        updateTelemetryDisplay(data);
        updateErrorCode(data);
        updateOrientation();
        updateCharts(data);
        updateMapMarker();
        addLogEntry(data);
    }, 1000);
}

function stopTelemetry() {
    if (!telemetryActive) return;

    telemetryActive = false;
    clearInterval(telemetryInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

// ===== MISSION CONTROL FUNCTIONS =====
function executeMissionCommand(command) {
    const timestamp = new Date().toLocaleTimeString();
    const missionLog = document.getElementById('missionLog');
    
    let commandStatus = '';

    if (command === 'separation') {
        separationExecuted = true;
        commandStatus = 'COMMAND EXECUTED: Manual Separation';
    } else if (command === 'parachute') {
        parachuteDeployed = true;
        commandStatus = 'COMMAND EXECUTED: Emergency Parachute Deployment';
    } else if (command === 'redundant') {
        commandStatus = 'COMMAND EXECUTED: Redundant Activation';
    }

    const entry = document.createElement('p');
    entry.innerHTML = `<strong>${commandStatus}</strong><br/>Time: ${timestamp}`;
    missionLog.insertBefore(entry, missionLog.firstChild);

    // Keep last 10 entries
    const entries = missionLog.querySelectorAll('p');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
    }
}

// ===== EXPORT CSV =====
function exportCSV() {
    let csv = 'Timestamp,Altitude (m),Temperature (°C),Pressure (hPa),Battery (V),Descent Rate (m/s)\n';

    telemetryLogs.forEach(log => {
        csv += `${log.timestamp},${log.altitude.toFixed(2)},${log.temperature.toFixed(2)},${log.pressure.toFixed(2)},${log.battery.toFixed(2)},${log.descentRate.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'telemetry_log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ===== EXPORT GRAPH AS PNG =====
function exportGraphAsPNG() {
    const graphsSection = document.querySelector('.graphs-section');
    
    html2canvas(graphsSection, {
        backgroundColor: '#ffffff',
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'graphs_' + new Date().getTime() + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// ===== SYNC PC TIME =====
function syncPCTime() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('pcTime').textContent = 'PC Time: ' + timeString;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// ===== RESET PACKET COUNT =====
function resetPacketCount() {
    packetCount = 0;
    document.getElementById('packetCount').textContent = '0';
}

// ===== CAMERA CONTROLS =====
async function enumerateCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const select = document.getElementById('cameraSelect');

        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${index + 1}`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error enumerating cameras:', err);
    }
}

async function startCamera() {
    try {
        const cameraSelect = document.getElementById('cameraSelect');
        const deviceId = cameraSelect.value;

        if (!deviceId) {
            showCameraError('Please select a camera');
            return;
        }

        const constraints = {
            video: { deviceId: { exact: deviceId } },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('videoStream');
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        document.getElementById('videoPlaceholder').style.display = 'none';
        document.getElementById('streamStatus').textContent = 'Online';
        document.getElementById('streamStatus').classList.add('online');
        document.getElementById('startCameraBtn').disabled = true;
        document.getElementById('stopCameraBtn').disabled = false;
        clearCameraError();

        // Store stream for later stopping
        window.currentStream = stream;
    } catch (err) {
        showCameraError('Camera access denied or not available: ' + err.message);
    }
}

function stopCamera() {
    if (window.currentStream) {
        window.currentStream.getTracks().forEach(track => track.stop());
    }

    const videoElement = document.getElementById('videoStream');
    videoElement.style.display = 'none';
    videoElement.srcObject = null;
    document.getElementById('videoPlaceholder').style.display = 'block';
    document.getElementById('streamStatus').textContent = 'Offline';
    document.getElementById('streamStatus').classList.remove('online');
    document.getElementById('startCameraBtn').disabled = false;
    document.getElementById('stopCameraBtn').disabled = true;
    clearCameraError();
}

function showCameraError(message) {
    const errorDiv = document.getElementById('cameraError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearCameraError() {
    const errorDiv = document.getElementById('cameraError');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();

    // Initialize map
    setTimeout(() => {
        initializeMap();
    }, 100);

    // Initialize PC time
    syncPCTime();

    // Enumerate cameras
    enumerateCameras();

    // Event Listeners - Top Control Bar
    document.getElementById('startBtn').addEventListener('click', startTelemetry);
    document.getElementById('stopBtn').addEventListener('click', stopTelemetry);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
    document.getElementById('exportGraphBtn').addEventListener('click', exportGraphAsPNG);
    document.getElementById('syncTimeBtn').addEventListener('click', syncPCTime);
    document.getElementById('resetPacketBtn').addEventListener('click', resetPacketCount);

    // Event Listeners - Mission Control
    document.getElementById('separationBtn').addEventListener('click', () => {
        executeMissionCommand('separation');
    });
    document.getElementById('parachuteBtn').addEventListener('click', () => {
        executeMissionCommand('parachute');
    });
    document.getElementById('redundantBtn').addEventListener('click', () => {
        executeMissionCommand('redundant');
    });

    // Event Listeners - Camera
    document.getElementById('startCameraBtn').addEventListener('click', startCamera);
    document.getElementById('stopCameraBtn').addEventListener('click', stopCamera);

    // Initialize error code
    updateErrorCode({
        descentRate: 9,
        latitude: gpsLatitude,
        longitude: gpsLongitude
    });

    console.log('CanSat GCS initialized successfully');
});
