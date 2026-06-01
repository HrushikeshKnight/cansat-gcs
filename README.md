# CanSat Ground Control Software (GCS)

## Project Overview

A complete **Single Page Application (SPA)** Ground Control Software for CanSat missions built with pure **HTML, CSS, and JavaScript**. This is an academic-level project designed for Aerospace Engineering students to monitor and control satellite data in real-time.

**No frameworks used** – Pure vanilla JavaScript, responsive design, beginner-friendly code.

---

## 📁 Project Structure

```
cansat-gcs/
├── index.html          # Complete dashboard structure
├── style.css           # All styling and responsive design
├── script.js           # Full functionality and telemetry logic
└── README.md           # This file
```

---

## 🚀 How to Run the Project

### Option 1: Direct File Opening
1. **Download** or **clone** the repository
2. **Navigate** to the project folder
3. **Open** `index.html` in your web browser
4. ✅ The GCS dashboard will load immediately

### Option 2: Local Server (Recommended)
For better performance with the map feature:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server
```

Then visit: `http://localhost:8000`

---

## 📚 External Libraries Used

All libraries are loaded via **CDN** (no installation needed):

| Library | Purpose | CDN Link |
|---------|---------|----------|
| **Chart.js** | Real-time data visualization | https://cdn.jsdelivr.net/npm/chart.js@3.9.1 |
| **Leaflet.js** | Interactive GPS mapping | https://unpkg.com/leaflet@1.9.4 |
| **OpenStreetMap** | Map tiles for GPS tracking | https://tile.openstreetmap.org |
| **html2canvas** | Export graphs as PNG images | https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1 |

---

## 🎛️ Dashboard Features

### 1️⃣ **Top Control Bar**
- **Start Telemetry** – Begin data generation (1 packet/second)
- **Stop Telemetry** – Pause data collection
- **Export CSV** – Download all telemetry logs as CSV file
- **Export Graph as PNG** – Export graph section as image
- **Sync PC Time** – Display and update current system time
- **Reset Packet Count** – Reset packet counter to zero

### 2️⃣ **Mission Control Panel**
Execute critical commands:
- **Manual Separation** – Trigger payload separation
- **Emergency Parachute Deployment** – Deploy parachute system
- **Redundant Activation** – Activate redundant systems

Each command logs:
- Command name
- Exact timestamp (HH:MM:SS)
- Status in mission log

### 3️⃣ **Container Telemetry** (9 Parameters)
Real-time display of CanSat container data:
- Mission Time (seconds)
- Packet Count
- Altitude (meters)
- Pressure (hPa)
- Temperature (°C)
- Battery Voltage (V)
- GPS Latitude
- GPS Longitude
- Descent Rate (m/s)

### 4️⃣ **Payload Telemetry** (4 Parameters)
Independent payload data:
- Payload Altitude
- Payload Temperature
- Payload Battery
- Payload Status (Nominal/Separated)

### 5️⃣ **Error Code System** (4-Digit Code)

**Format: `XXXX`** where each digit represents:

| Digit | Parameter | Value `0` | Value `1` |
|-------|-----------|-----------|-----------|
| **1** | Descent Rate | Safe (8-10 m/s) | ⚠️ UNSAFE (Outside range) |
| **2** | GPS Status | ✅ Available | ❌ Unavailable |
| **3** | Separation | ✅ Separated | ❌ Failure |
| **4** | Parachute | Inactive | Active |

**Display:**
- Green text: `0000` (All systems nominal)
- Red text: Any non-zero code (Fault detected)

**Examples:**
- `0000` – All systems normal
- `1000` – Unsafe descent rate
- `0100` – GPS signal lost
- `1111` – Multiple faults detected

### 6️⃣ **Real-Time Graphs** (5 Charts)
Live updating graphs using Chart.js:
- **Altitude Graph** – Shows descent profile
- **Pressure Graph** – Tracks atmospheric pressure
- **Temperature Graph** – Monitors temperature changes
- **Descent Rate Graph** – Displays descent velocity
- **Battery Voltage Graph** – Shows power consumption

**Features:**
- Updates every 1 second
- Displays last 20 data points
- Smooth line interpolation
- Color-coded for easy reading

### 7️⃣ **GPS Tracking Map**
Interactive map using Leaflet.js and OpenStreetMap:
- **Real-time marker** showing current CanSat position
- **Mission path history** drawn as polyline
- **Live coordinate display** (Latitude, Longitude)
- **Map controls** (zoom, pan)
- **Starting location:** NIT Rourkela Campus (20.2961°N, 85.8245°E)

### 8️⃣ **Orientation Visualization**
3D orientation display:
- **Rotating box** showing Roll, Pitch, Yaw
- **3D CSS transforms** for realistic rotation
- **Numerical values** updated every second
- **Range:** -180° to +180°

### 9️⃣ **Live Video Streaming**
Browser camera integration:
- **Camera selection** – Dropdown to choose camera device
- **Start Camera** – Begin live video feed
- **Stop Camera** – Stop camera stream
- **Stream Status** – Shows "Online" or "Offline"
- **Error handling** – Display permission errors
- **Requires:** Camera permissions from user

### 🔟 **Telemetry Logs Table**
Live database of all measurements:
- **Timestamp** – Time of each packet
- **Altitude** – Current altitude
- **Temperature** – Current temperature
- **Pressure** – Current pressure
- **Battery** – Current battery voltage
- **Descent Rate** – Current descent velocity

**Features:**
- Newest entries on top
- Auto-scrollable
- Maximum 100 entries stored
- Sortable (newest first)

---

## 📊 Telemetry Packet Format

### Packet Structure
```
MISSION_TIME,PACKET_COUNT,ALTITUDE,PRESSURE,TEMP,BATTERY,LAT,LON,DESCENT_RATE
```

### Example Packet
```
120,45,650.3,1012.5,28.6,8.7,20.2961,85.8245,9.1
```

### Field Descriptions
| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| MISSION_TIME | Float | Seconds | 0-999 | Elapsed time since launch |
| PACKET_COUNT | Integer | Count | 0-999 | Sequential packet number |
| ALTITUDE | Float | Meters | 0-1200 | Height above ground |
| PRESSURE | Float | hPa | 500-1013 | Atmospheric pressure |
| TEMP | Float | °C | -50 to +50 | Air temperature |
| BATTERY | Float | Volts | 0-12 | Power supply voltage |
| LAT | Float | Degrees | -90 to +90 | GPS latitude |
| LON | Float | Degrees | -180 to +180 | GPS longitude |
| DESCENT_RATE | Float | m/s | 0-15 | Vertical velocity |

---

## 🔧 Code Quality & Structure

### JavaScript Organization
```javascript
// Global Variables & State Management
let telemetryActive = false;
let packetCount = 0;
let missionTime = 0;

// Packet Parsing
parsePacket(packetString) {}

// Telemetry Generation
generateTelemetryData() {}

// Display Updates
updateTelemetryDisplay(data) {}
updateErrorCode(data) {}
updateOrientation() {}

// Chart Management
initializeCharts() {}
updateCharts(data) {}

// Map Operations
initializeMap() {}
updateMapMarker() {}

// Mission Control
executeMissionCommand(command) {}

// Export Functions
exportCSV() {}
exportGraphAsPNG() {}

// Camera Controls
startCamera() {}
stopCamera() {}

// Event Listeners
DOMContentLoaded event handler {}
```

### Features
✅ **Beginner-friendly** – Clear comments on all functions  
✅ **No frameworks** – Pure vanilla JavaScript  
✅ **Modular design** – Separated concerns  
✅ **Responsive** – Works on desktop, tablet, mobile  
✅ **Academic style** – Simple, clean UI  
✅ **Error handling** – Camera permissions, GPS errors  

---

## 💻 System Requirements

### Browser Compatibility
- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+

### Required Features
- **JavaScript** enabled
- **Geolocation** permission (optional, for map)
- **Camera** permission (optional, for video stream)
- **Modern CSS** support (Grid, Flexbox, Transforms)

### Hardware
- **Minimum RAM:** 512 MB
- **Minimum Disk Space:** 50 KB
- **Internet:** Required for CDN libraries (works offline if cached)

---

## 📖 How Each Requirement is Satisfied

### 1. Dashboard Layout ✅
- **CSS Grid** used for responsive multi-column layout
- **Flexbox** for button groups and telemetry items
- **10 sections** implemented as required
- Simple, readable design without animations

### 2. Top Control Bar ✅
- All 6 buttons implemented with full functionality
- Start/Stop toggle working correctly
- CSV and PNG export fully functional
- PC time synchronized and updating
- Packet count resets properly

### 3. Mission Control Panel ✅
- 3 command buttons implemented
- Each command logs timestamp and status
- Mission log displays newest entries on top
- Status updates dynamically

### 4. Telemetry Simulation ✅
- `generateTelemetryData()` creates realistic packets
- Data updates every 1 second
- 9 container fields simulated
- 4 payload fields simulated
- Packet parser implemented: `parsePacket()`

### 5. Error Code System ✅
- 4-digit error code generated dynamically
- All 4 digits calculated correctly based on:
  - Descent rate (8-10 m/s safe range)
  - GPS availability
  - Separation status
  - Parachute deployment status
- Color-coded display (green for normal, red for faults)
- Digit explanations updated in real-time

### 6. Real-Time Graphs ✅
- **5 charts** implemented (Altitude, Pressure, Temp, Descent, Battery)
- Chart.js library integrated
- Updates every 1 second
- Last 20 points displayed
- Smooth animations disabled for performance

### 7. GPS Tracking Map ✅
- Leaflet.js + OpenStreetMap integrated
- Real marker on map
- Path history drawn as polyline
- Updates every 1 second
- Starting location: NIT Rourkela (realistic)

### 8. Orientation Visualization ✅
- Rotating 3D box using CSS transforms
- Roll, Pitch, Yaw values displayed
- Updates every 1 second
- Simple design (not complex aerospace simulation)

### 9. Live Video Streaming ✅
- `navigator.mediaDevices.getUserMedia()` implemented
- Camera selection dropdown
- Start/Stop buttons with proper state management
- Stream status indicator
- Permission error handling

### 10. Telemetry Logging ✅
- Log table with 6 columns
- Newest entries on top
- Maximum 100 entries stored
- Auto-updates with each packet

### 11. CSV Export ✅
- Download button creates CSV file
- Format: `telemetry_log.csv`
- All columns included
- Proper CSV formatting

### 12. Graph Export ✅
- html2canvas library integrated
- Exports graph section as PNG
- Filename includes timestamp
- High quality (2x scale)

### 13. Packet Parser ✅
- `parsePacket()` function parses the exact format
- All 9 fields extracted correctly
- Used before displaying values

### 14. Code Quality ✅
- Beginner-friendly comments
- Proper function separation
- No frameworks or complex libraries
- Pure HTML/CSS/JavaScript

### 15. Project Structure ✅
- Single index.html with all structure
- style.css with all styling
- script.js with all functionality
- Runs immediately from opening HTML file

---

## 🎮 Quick Start Guide

### Step 1: Open the Application
Open `index.html` in your browser

### Step 2: Start Telemetry
Click **"Start Telemetry"** button
- Green button changes to disabled
- Red "Stop" button becomes enabled
- Data updates every second

### Step 3: Monitor Data
- **Top Left:** Container telemetry values
- **Top Right:** Payload telemetry values
- **Error Code:** Updates based on system state
- **Graphs:** Real-time plotting begins
- **Map:** Shows CanSat position

### Step 4: Control Mission
Click mission control buttons to:
- Execute separation
- Deploy parachute
- Activate redundant systems

### Step 5: Export Data
- **Export CSV:** Downloads all telemetry logs
- **Export Graph:** Saves graph section as PNG

---

## 🎓 Learning Objectives

This project teaches:
1. **DOM Manipulation** – JavaScript updating HTML
2. **Data Visualization** – Chart.js integration
3. **Real-time Systems** – Interval-based updates
4. **Responsive Design** – CSS Grid & Flexbox
5. **API Integration** – Camera, Geolocation, Maps
6. **File I/O** – CSV export, PNG export
7. **State Management** – Global variables, flags
8. **Event Handling** – Click listeners, form inputs
9. **Error Handling** – Try-catch, permission checks
10. **Aerospace Concepts** – CanSat, telemetry, error codes

---

## 📝 Sample Scenarios

### Scenario 1: Normal Flight
1. Click "Start Telemetry"
2. Watch altitude decrease steadily
3. Descent rate stays at 9±1.5 m/s
4. Error code stays `0000` (green)
5. Graphs update smoothly

### Scenario 2: GPS Loss
1. Watch GPS status in error code
2. When GPS unavailable, digit 2 becomes `1`
3. Error code changes to `X1XX` (red)
4. Location updates stop on map

### Scenario 3: Unsafe Descent
1. If descent rate > 10 m/s
2. Error code digit 1 becomes `1`
3. Error code becomes `1XXX` (red)

### Scenario 4: Manual Separation
1. Click "Manual Separation" button
2. Command logs in mission log
3. Payload status changes to "Separated"
4. Error code digit 3 becomes `0`

---

## 🐛 Troubleshooting

### Map not showing?
- Check internet connection (OpenStreetMap needs CDN)
- Wait 2-3 seconds for map to load
- Check browser console for errors

### Camera not working?
- Click "Allow" when browser asks for camera permission
- Ensure camera device is selected in dropdown
- Check if camera is in use by another application

### Charts not updating?
- Ensure telemetry is running (green Start button should be disabled)
- Check browser console for JavaScript errors
- Refresh page and try again

### CSV export empty?
- Start telemetry and let it run for at least 10 seconds
- Then click "Export CSV"
- CSV will include all logged entries

---

## 📄 License

This is an educational project for Aerospace Engineering students. Feel free to use, modify, and distribute for learning purposes.

---

## 👨‍💻 Author

**Developed by:** Hrushikesh Mohapatra  
**Purpose:** CanSat Ground Control Software  
**Type:** Single Page Application (SPA)  
**Stack:** HTML5 + CSS3 + Vanilla JavaScript  

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Open browser developer console (F12) for error messages
3. Ensure all CDN libraries are loading correctly
4. Test in a different browser if issues persist

---

**Happy monitoring! 🛰️**
