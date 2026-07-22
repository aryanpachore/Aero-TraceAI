<div align="center">

# 🌍 Aero TraceAI
### Proactive, Multi-Agent Air Quality Intelligence for Smart Cities

Transforming **raw air quality data** into **real-time civic action** using AI.

[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js)]()
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js)]()
[![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql)]()
[![Gemini](https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge)]()
[![Groq](https://img.shields.io/badge/Groq-LLM-purple?style=for-the-badge)]()

🚀 **Hackathon Project**

</div>

---

# 📖 Overview

Air pollution monitoring systems tell us **how polluted the air is**, but they rarely explain:

- Who is causing the pollution?
- Which area should authorities act on first?
- What should citizens do right now?

**Aero TraceAI** bridges this gap by combining **real-time environmental data**, **multi-agent AI**, and **geospatial intelligence** to help governments make faster and smarter decisions while providing personalized health guidance to citizens.

---

# ✨ Key Features

### 🧠 AI Source Attribution
Identifies whether pollution is caused by:
- 🚗 Traffic
- 🏭 Industries
- 🚧 Construction Dust
- 🔥 Waste Burning

instead of simply displaying AQI values.

<img width="1568" height="753" alt="image" src="https://github.com/user-attachments/assets/e3599acf-fb19-44bb-bb75-8cc696d9e2b8" />


---

### 🏛️ Smart Admin Dashboard

- Interactive AQI Heatmap
- Pollution Source Analytics
- Intervention Tracking
- Multi-Zone Comparison
- Action Recommendations

  <img width="1568" height="762" alt="image" src="https://github.com/user-attachments/assets/7a38fb4b-3bfe-4ad6-935a-0d80be8a22a5" />


---

### 👨‍👩‍👧 Citizen Portal

- Live GPS Based AQI
- 24 Hour Air Quality Forecast
- Hyperlocal Health Advisories
- Regional Language Support
- Pollution Reporting with Image Upload

  <img width="1568" height="746" alt="image" src="https://github.com/user-attachments/assets/24e39560-a561-43f6-9bc0-507056044bba" />


---

### 🤖 Multi-Agent AI System

The platform uses specialized AI agents:

### Agent 1 — Pollution Attribution
- Identifies pollution sources
- Calculates confidence scores
- Detects abnormal pollution events

**Powered by Groq (Llama 3 / Gemma)**

---

### Agent 2 — Enforcement Planner

Generates:

- Priority inspection areas
- Municipal action sheets
- Pollution control recommendations

**Powered by Groq**

---

### Agent 3 — Citizen Advisory

Generates:

- Personalized health advisories
- Multilingual alerts
- Vulnerability-aware recommendations

**Powered by Gemini 1.5 Flash**

---

# 🏗️ System Architecture

<img width="5250" height="3450" alt="System_Architecture_AirWatch" src="https://github.com/user-attachments/assets/30f43ede-baad-4c84-bfd2-dbb4aded0121" />

---

# ⚙️ How It Works

```text
Live Pollution Data
        │
        ▼
Weather + Land Use Data
        │
        ▼
AI Source Attribution
        │
        ▼
Enforcement Planning
        │
        ├──────────────► Admin Dashboard
        │
        ▼
Citizen Advisory Engine
        │
        ▼
Localized Health Alerts
```

---

# 🛠 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Maps | Mapbox GL JS |
| Backend | Node.js, Express.js |
| Database | MySQL + Sequelize |
| AI Models | Groq (Llama 3 / Gemma), Gemini 1.5 Flash |
| Authentication | Google OAuth + JWT |
| APIs | OpenWeatherMap API, Overpass API |

---

# 🔄 ETL Data Pipeline

```
OpenWeatherMap API
        │
        ▼
Node Cron Scheduler
        │
        ▼
Data Cleaning
        │
        ▼
MySQL Database
        │
        ▼
AI Processing
```

The system automatically fetches pollution and weather data every hour before passing it to the AI reasoning engine.

---

# 📍 Geolocation Workflow

```
Citizen Location
        │
        ▼
HTML5 Geolocation
        │
        ▼
Haversine Distance Algorithm
        │
        ▼
Nearest Zone
        │
        ▼
Localized AQI + Advisory
```

---

# 📊 Database Schema

<img width="4950" height="3750" alt="ER_Diagram_AirWatch" src="https://github.com/user-attachments/assets/d013bbfd-7e2c-47c8-aa86-15585a41110a" />


---

# 🖥️ User Interface


---

# 🚀 Future Scope

- 📱 Mobile Application
- 🌍 Satellite Image Integration
- 🔔 Push Notifications
- 📈 AI Pollution Prediction
- 🌐 Public Research API
- 🏙 Smart City Integration

---

# 🌟 Why Aero TraceAI?

✅ Real-time Air Quality Intelligence

✅ Multi-Agent AI Architecture

✅ Explainable AI Decisions

✅ Citizen Participation

✅ Hyperlocal Health Advisories

✅ Smart City Ready

---

# 📂 Project Structure

```
Aero-TraceAI/

│── client/

│── server/

│── assets/

│     ├── system-architecture.png

│     └── er-diagram.png

│── screenshots/

│── README.md
```

---


# 🔗 Links

## 🌐 Live Demo

Replace with your deployed application link.

```
https://aero-trace-ai.vercel.app
```

---




