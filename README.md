# ❄️ POLAR TWIN — Antarctic Research Station Digital Twin & Remote Operations Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MQTT](https://img.shields.io/badge/MQTT-Aedes%20%2F%20Mosquitto-660066?logo=mqtt&logoColor=white)](https://mqtt.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

> **Smart India Hackathon (SIH) Project**  
> An advanced, real-time IoT Digital Twin and Mission Control platform built for remote monitoring, failure simulation, predictive maintenance, and operational management of India's permanent Antarctic research stations: **Maitri** (Schirmacher Oasis) and **Bharati** (Larsemann Hills).

---

## 📌 Table of Contents

1. [Problem Statement & Background](#-problem-statement--background)
2. [Key Features](#-key-features)
3. [System Architecture & Workflow](#-system-architecture--workflow)
4. [Technology Stack](#-technology-stack)
5. [Directory Structure](#-directory-structure)
6. [Quick Start & Installation](#-quick-start--installation)
7. [Demo Accounts & Credentials](#-demo-accounts--credentials)
8. [Telemetry Simulation & Scenarios](#-telemetry-simulation--scenarios)
9. [API & WebSocket Specifications](#-api--websocket-specifications)
10. [Authors & Acknowledgments](#-authors--acknowledgments)

---

## 🏔️ Problem Statement & Background

India operates two year-round permanent scientific research bases in Antarctica:
- **Maitri Station** ($70^\circ 45' 57'' \text{ S}, 11^\circ 44' 09'' \text{ E}$) — Schirmacher Oasis
- **Bharati Station** ($69^\circ 24' 28'' \text{ S}, 76^\circ 11' 14'' \text{ E}$) — Larsemann Hills

### Challenges in Polar Operations
- **Extreme Weather**: Temperatures plunging below $-50^\circ\text{C}$ to $-89^\circ\text{C}$, katabatic winds exceeding $200\text{ km/h}$, and prolonged polar nights.
- **Critical Subsystem Dependencies**: Power generators, fuel stores, heating/HVAC, and wastewater treatment plants cannot fail; failure is life-threatening.
- **Extreme Remoteness & Bandwidth Constraints**: Stations are isolated for 8+ months with limited satellite communication uplink.
- **Lack of Predictive Foresight**: Traditional SCADA systems display static indicators without interactive 3D spatial context, what-if disaster simulation, or automated predictive health scoring.

### The POLAR TWIN Solution
**POLAR TWIN** bridges this gap by providing an end-to-end mission-control digital twin that aggregates live sensor data, models physical spatial structures in 3D, monitors microgrid power and consumables, runs real-time emergency scenario simulations, and forecasts environmental risks using automated anomaly detection and AI-assisted insights.

---

## 🚀 Key Features

- **🌐 Interactive 3D Station Digital Twin**:
  - Immersive Three.js / React Three Fiber interactive model of station modules, buildings, generator sheds, fuel reserves, and satellite ground stations.
  - Spatial telemetry heatmaps, status indicators (Normal, Warning, Critical), and interactive subsystem inspection drawers.
- **⚡ Real-Time IoT Telemetry Engine**:
  - Built-in MQTT ingestion pipeline (Aedes embedded broker & Mosquitto support).
  - WebSockets (Socket.IO) streaming sub-second sensor readings directly to UI components.
- **🧠 Anomaly Detection & AI Insights**:
  - Continuous telemetry evaluation evaluating vibration thresholds, exhaust temperatures, voltage fluctuations, fuel consumption rates, and thermal insulation drop.
  - Automated generation of actionable mitigation recommendations for mission directors.
- **🌪️ Scenario Simulator ("What-If" Analysis)**:
  - Trigger synthetic disaster & stress conditions on the fly:
    - *Extreme Katabatic Blizzard* (solar dropped to 0%, heating surge, structural wind alarm)
    - *Main Generator #1 Failure* (load shedding, battery backup cut-over)
    - *Low Fuel Reserve Contingency* (rationing protocols, generator throttle)
    - *Supply Chain / Inventory Shortage* (critical spare parts, medical consumables)
    - *High Energy Spike*
- **🔋 Microgrid & Life Support Monitoring**:
  - Generator load balances (kW), solar PV arrays, wind turbines, and battery state-of-charge (SoC).
  - Indoor temperature, oxygen levels, CO2 concentration, humidity, and water recycling metrics.
- **📦 Polar Logistics & Inventory**:
  - Real-time stock tracking for fuel (Jet A-1, Arctic Diesel), spare filters, heating elements, medical kits, and food reserves.
- **👥 Role-Based Access Control (RBAC)**:
  - Distinct views and capabilities for `ADMIN` (Mission Director), `OPERATOR` (Chief Station Engineer), and `VIEWER` (Scientific Researcher).
- **🛡️ Resilience & Zero-Config Fallback**:
  - Auto-seeds initial demo database automatically.
  - In-memory database fallback (`mongodb-memory-server`) ensures the platform runs smoothly out of the box even without external MongoDB installed.

---

## 🔄 System Architecture & Workflow

### High-Level Architecture Diagram

```
 +-------------------------------------------------------------------------+
 |                          ANTARCTIC STATIONS                             |
 |                                                                         |
 |  [Sensors & SCADA]       [NCPOR Weather Met]    [Open-Meteo Polar API]  |
 |  (Generators, HVAC,      (Wind, Temp, Baro,     (Atmospheric Model)     |
 |   Fuel Tanks, Power)      Solar Radiation)                              |
 +--------------------+--------------------+-------------------------------+
                      |                    |
                      v                    v
       +-----------------------------------------------+
       |             MQTT TELEMETRY BROKER             |
       |     (Mosquitto / Embedded Aedes Engine)       |
       +----------------------+------------------------+
                              |
                              v
       +-----------------------------------------------+
       |            POLAR TWIN BACKEND API             |
       |  - Telemetry Ingestion Service                |
       |  - Anomaly Detection & Health Scoring Engine  |
       |  - Scenario Engine & Simulator Controller     |
       |  - MongoDB / In-Memory Persistence Layer      |
       |  - RESTful Express API + JWT Auth             |
       |  - Socket.IO Real-Time Broadcast Server       |
       +----------------------+------------------------+
                              |
                     WebSocket / REST API
                              |
                              v
       +-----------------------------------------------+
       |            POLAR TWIN FRONTEND (UI)           |
       |  - 3D Digital Twin Viewer (Three.js/Fiber)    |
       |  - Mission Control Dashboard & KPIs           |
       |  - Real-Time Telemetry Inspector Drawer       |
       |  - Microgrid & Life Support Graphs (Recharts) |
       |  - Emergency Scenario Trigger Panel           |
       |  - Alerts, Asset Inventory & Audit History    |
       +-----------------------------------------------+
```

### End-to-End Data Workflow

1. **Telemetry Generation / Ingestion**:
   - Station sensors or the built-in `simulator.js` publish sensor payloads on MQTT topics (e.g. `stations/bharati/telemetry`, `stations/maitri/energy`).
2. **Backend Processing**:
   - `mqttSubscriber.js` intercepts messages, validates data with `zod` schemas, and persists snapshots to MongoDB.
   - `anomalyService.js` and `healthService.js` evaluate thresholds against historical trends and compute health scores ($0 - 100\%$).
   - If an anomaly is caught, an `Alert` document is generated and AI recommendations are formulated.
3. **Real-Time Client Broadcast**:
   - `socket.js` relays telemetry payloads, new alerts, and status changes across connected browser clients via WebSocket rooms.
4. **Digital Twin Visualization**:
   - Frontend stores (`stationStore.js`, `dashboardStore.js`) update in real-time.

---

## 💻 Technology Stack

### Frontend
| Technology | Description |
|---|---|
| **React 18** | High-performance user interface framework |
| **Vite** | Modern, lightning-fast frontend tooling and bundler |
| **Tailwind CSS** | Utility-first responsive design with dark mode polar theme |
| **Recharts** | Interactive charts for power grids, weather, and telemetry histories |
| **Zustand** | Lightweight client-side reactive state management |
| **Socket.IO Client** | Bi-directional low-latency event communication |
| **Lucide React** | Clean, modern iconography |

### Backend
| Technology | Description |
|---|---|
| **Node.js (ES Modules)** | Asynchronous server runtime |
| **Express.js** | RESTful HTTP API framework |
| **Socket.IO** | Real-time WebSocket server for multi-client synchronization |
| **MQTT.js & Aedes** | IoT message broker and ingestion pipeline |
| **Mongoose & MongoDB** | Flexible NoSQL document database |
| **MongoDB Memory Server** | Zero-friction local in-memory database fallback |
| **Zod** | Runtime schema declaration and validation |
| **JWT & Bcrypt.js** | Secure role-based authentication and password hashing |
| **Helmet & Morgan** | Security headers and HTTP request logging |

---

## 📁 Directory Structure

```text
SIH-project/
├── .gitignore                   # Global monorepo ignore rules
├── package.json                 # Monorepo root package & orchestration scripts
├── start-dev.js                 # Dual backend & frontend startup script
├── docker-compose.yml           # Multi-container deployment orchestrator
├── mosquitto.conf               # Mosquitto MQTT broker configuration
│
├── backend/
│   ├── .env.example             # Backend environment variable template
│   ├── .gitignore               # Backend specific gitignore
│   ├── Dockerfile               # Production container definition for backend
│   ├── package.json             # Backend dependencies and scripts
│   └── src/
│       ├── app.js               # Express application configuration & middleware
│       ├── server.js            # Server entry point, DB bootstrap & listeners
│       ├── config/              # Database, MQTT, and environment configurations
│       ├── controllers/         # Request handling & HTTP response logic
│       ├── middleware/          # Auth, error handling, role verification
│       ├── models/              # Mongoose schemas (Station, Asset, Telemetry, Alert, etc.)
│       ├── mqtt/                # MQTT subscriber & telemetry processor
│       ├── routes/              # Express REST route definitions
│       ├── seed/                # Initial database seed script (users, stations, assets)
│       ├── services/            # Business logic (AI insights, anomaly detection, health)
│       ├── simulator/           # Telemetry simulator & emergency scenario generators
│       ├── sockets/             # Socket.IO connection & event dispatchers
│       └── validators/          # Zod request payload validation schemas
│
└── frontend/
    ├── .gitignore               # Frontend specific gitignore
    ├── Dockerfile               # Production container definition for frontend
    ├── index.html               # Web application HTML shell
    ├── package.json             # Frontend dependencies & scripts
    ├── tailwind.config.js       # Tailwind theme colors and customizations
    ├── vite.config.js           # Vite build and proxy settings
    ├── public/
    │   └── images/              # Station images, schematics, and twin references
    └── src/
        ├── App.jsx              # App entry point, routing & providers
        ├── main.jsx             # React DOM root render
        ├── components/
        │   ├── common/          # Reusable UI elements (Buttons, Cards, Badges, Modals)
        │   ├── dashboard/       # KPI widgets, AI insight cards, environmental metrics
        │   └── digital-twin/    # Three.js 3D canvas, twin viewer & inspector drawer
        ├── data/                # Station layout specs & configuration defaults
        ├── hooks/               # Custom React hooks (useSocket, useTelemetry, etc.)
        ├── layouts/             # Dashboard, Mission Control, and Auth layouts
        ├── pages/               # Views: Dashboard, Digital Twin, Energy, Logistics, etc.
        ├── services/            # Axios API client integrations
        ├── simulation/          # Client-side telemetry simulation hooks
        └── store/               # Zustand global state stores (station, auth, alerts)
```

---

## ⚙️ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- *(Optional)* **Docker & Docker Compose** for containerized setup

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Mohit-Sahu1494/SIH-Demo.git
cd SIH-Demo
```

---

### Step 2: Install Dependencies

You can install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

---

### Step 3: Environment Setup

Create your environment file in `backend/`:

```bash
# In backend directory
cp .env.example .env
```

Default settings in `.env.example`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=polar_twin_super_secret_jwt_key_sih_2024_antarctica
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/polar_twin
USE_MEMORY_DB_FALLBACK=true
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_EMBEDDED_BROKER=true
NODE_ENV=development
```

> **Note**: `USE_MEMORY_DB_FALLBACK=true` allows the backend to automatically spin up a temporary in-memory MongoDB instance if no local MongoDB service is detected.

---

### Step 4: Run the Platform

From the root directory, simply run:

```bash
npm run dev
```

This triggers `start-dev.js`, which concurrently boots up:
- **Backend API & Simulator**: [http://localhost:5000](http://localhost:5000)
- **Frontend Mission Control UI**: [http://localhost:5173](http://localhost:5173)
- **Embedded MQTT Broker**: Port `1883`


### Pre-Configured Scenarios:
1. **Normal Operations**: Standard polar baseline data (stable microgrid, nominal heating, normal winds).
2. **Extreme Katabatic Blizzard**: Wind speeds spike to $> 180\text{ km/h}$, solar generation drops to zero, building thermal load surges.
3. **Main Generator #1 Failure**: Generator 1 trips, emergency diesel generator auto-starts, load shedding protocol activates.
4. **Low Fuel Reserve**: Fuel storage levels simulate rapid drop below critical $15\%$ threshold, generating high-priority logistics alert.
5. **High Energy Consumption**: Heavy heating and science lab experiments create peak load warnings.

---

## 📡 API & WebSocket Specifications

### Core REST Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/stations` | List all monitored Antarctic stations (Maitri, Bharati) | Authenticated |
| `GET` | `/api/stations/:id` | Get detailed station status, subsystems, & telemetry | Authenticated |
| `GET` | `/api/telemetry/:stationId` | Fetch latest telemetry snapshots & historical metrics | Authenticated |
| `GET` | `/api/assets` | Retrieve station asset registry and health ratings | Authenticated |
| `GET` | `/api/alerts` | Get real-time and historical operational alerts | Authenticated |
| `PATCH` | `/api/alerts/:id/resolve` | Mark an alert as acknowledged/resolved | Operator / Admin |
| `POST` | `/api/scenarios/trigger` | Activate a simulation scenario | Operator / Admin |
| `GET` | `/api/energy/:stationId` | Get power distribution, microgrid & battery metrics | Authenticated |
| `GET` | `/api/environment/:stationId` | Get outdoor weather & indoor life support readings | Authenticated |

### Real-Time WebSocket Events

| Event Name | Direction | Description |
|---|---|---|
| `telemetry:update` | Server ➔ Client | Broadcasts live sensor readings every 2 seconds |
| `alert:new` | Server ➔ Client | Emits newly detected critical / warning events |
| `scenario:change` | Server ➔ Client | Notifies active simulation mode across all clients |
| `station:health` | Server ➔ Client | Updates calculated station health score |

---

## 🐳 Docker Deployment

To spin up the entire ecosystem (MongoDB, Mosquitto MQTT Broker, Backend API, and Frontend) using Docker:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

Services exposed:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MQTT Broker**: Port `1883` (TCP) / Port `9001` (WebSockets)
- **MongoDB**: Port `27017`

---

## 👥 Authors & Acknowledgments

- **Developed by**: POLAR TWIN Team for **Smart India Hackathon (SIH)**
- **Domain**: Remote Sensing, Digital Twins, Extreme Environment Operations, IoT Telemetry
- **Inspirations & Data Sources**:
  - [NCPOR](https://ncpor.res.in) — National Centre for Polar and Ocean Research, Ministry of Earth Sciences, Govt. of India
  - [Open-Meteo](https://open-meteo.com) — Polar Weather API
