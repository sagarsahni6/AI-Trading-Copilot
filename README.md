# ⚡ AI Trading Copilot

<p align="center">
  <img src="https://raw.githubusercontent.com/sagarsahni6/AI-Trading-Copilot/main/extension/src/assets/icons/icon128.svg" alt="AI Trading Copilot Logo" width="128" height="128" />
</p>

<h3 align="center">AI-Powered Real-Time Market Analysis for Zerodha Kite</h3>

<p align="center">
  <a href="https://github.com/sagarsahni6/AI-Trading-Copilot/actions/workflows/ci.yml"><img src="https://github.com/sagarsahni6/AI-Trading-Copilot/actions/workflows/ci.yml/badge.svg" alt="CI Build" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://www.nvidia.com/en-us/ai/nim/"><img src="https://img.shields.io/badge/AI_Inference-NVIDIA_NIM-green.svg" alt="NVIDIA NIM" /></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/Backend-FastAPI-teal.svg" alt="FastAPI" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React_18-blue.svg" alt="React 18" /></a>
</p>

---

> [!WARNING]
> **Decision Support Only**
> This extension acts purely as a decision-support system. It **never** places, modifies, or executes trades on your behalf. All final trading decisions are solely the user's responsibility.

---

## 🎯 Features & Capabilities

AI Trading Copilot injects a floating, glassmorphic sidebar directly into your Zerodha Kite interface. It works in the background to aggregate data across various engines, compute key metrics, and provide real-time suggestions.

### 🚀 Key Features

* **⚡ Real-Time Trade Scoring:** Calculates a real-time, weighted conviction score from `0` to `100` based on inputs from 6 specialized analysis engines.
* **📊 Option Chain Insights:** Tracks PCR (Put-Call Ratio), Max Pain, Open Interest (OI) shifts, support/resistance levels, and Gamma Exposure (GEX).
* **📈 Chart & Indicator Analysis:** Leverages technical indicators (EMA, RSI, MACD, ATR, ADX, VWAP, Supertrend) and automated pattern detection.
* **🕯️ Smart Money Concepts (SMC):** Automatically highlights Break of Structure (BOS), Change of Character (CHOCH), Order Blocks, Fair Value Gaps (FVG), and liquidity pools.
* **💬 NVIDIA NIM AI Chat:** Interact with an advanced AI assistant (powered by Llama 3.3 70B via NVIDIA NIM) that understands your current charts and option chain context.
* **📓 Integrated Trade Journal:** Keep track of your trades, psychology notes, and mistakes, syncing directly with your performance stats.
* **📈 Analytics Dashboard:** Visualize your win rate, equity curve, current streak, and profit/loss performance.
* **🔔 Smart Notifications:** Get alerted immediately to option chain OI shifts, technical breakouts, and high-scoring setups.

---

## 🏗 System Architecture

The project is structured as a decoupled **React/Zustand Chrome Extension (MV3)** communicating via WebSockets and REST APIs with a highly optimized **FastAPI Python Backend**.

```mermaid
graph TD
    subgraph Chrome Extension (MV3)
        CS[Content Script / DOM Observer] <--> BG[Background Service Worker]
        SB[React Sidebar UI / Zustand] <--> BG
    end

    subgraph FastAPI Backend
        WS[WebSocket Manager] <--> TE[Trade Aggregation Engine]
        API[REST API Gateway] <--> TE
        
        TE --> ME[Market Engine]
        TE --> OCE[Option Chain Engine]
        TE --> CE[Chart Engine]
        TE --> SMCE[SMC Engine]
        TE --> AIE[AI NVIDIA NIM Engine]
        TE --> TJE[Trade Journal Engine]
    end

    BG <-->|WebSockets & REST| WS
    BG <-->|REST API| API
```

---

## 📊 Signal Weighting Matrix

To generate the final trade conviction score, the backend aggregates outputs from different engines with the following weights:

| Engine | Weight | Focus Areas |
| :--- | :---: | :--- |
| **Chart Engine** | `25%` | Trend alignment (EMA, ADX, Supertrend) |
| **Option Chain Engine** | `20%` | PCR, OI Shifts, Max Pain, GEX |
| **SMC Engine** | `20%` | BOS, CHOCH, Order Blocks, FVGs |
| **Chart Engine (Volume)** | `15%` | Volume spikes, VWAP consistency |
| **Market Engine** | `10%` | IV, ATR, overall market volatility, India VIX |
| **Technical Indicators** | `10%` | RSI divergence, MACD momentum |

> [!TIP]
> **Conviction Threshold:** Only setups scoring **80/100 or higher** are highlighted as trade setups. This minimizes overtrading and encourages patience.

---

## 🛠 Tech Stack

| Component | Technology | Purpose / Details |
| :--- | :--- | :--- |
| **Extension UI** | React 18 & TypeScript | Modern, reactive, type-safe interface |
| **State Management** | Zustand | Light-weight, high-performance global state |
| **Styling** | Tailwind CSS & Framer Motion | Smooth transitions, modern dashboard aesthetics |
| **Build Tooling** | Vite & CRXJS | Fast builds and hot-module replacement for extensions |
| **Backend Framework** | FastAPI | High performance, async web framework |
| **AI Inference** | NVIDIA NIM | Low-latency inference using Llama 3.3 70B |
| **Numerical Processing**| NumPy & Pandas | Lightning-fast indicators and data manipulation |
| **Database & Cache** | PostgreSQL (SQLAlchemy) & Redis | Persistent trade log storage and fast option chain caching |

---

## 📂 Repository Layout

<details>
<summary>📂 Click to view directory details</summary>

```
ai-trading-copilot/
├── extension/                      # Chrome Extension Root
│   ├── src/
│   │   ├── background/             # Service Worker (WebSockets, alarms, state sync)
│   │   ├── content/                # DOM observer & Kite UI integration scripts
│   │   ├── sidebar/                # React app loaded into the floating sidebar
│   │   │   ├── components/         # Dashboard, Chat, Indicators, Option Chain UI
│   │   │   └── stores/             # Zustand stores for state management
│   │   ├── popup/                  # Toolbar icon action popup
│   │   ├── options/                # Extension settings and API key manager
│   │   ├── offscreen/              # Independent offscreen context (Black-Scholes calculations)
│   │   └── shared/                 # Shared TypeScript models, contracts, and utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                        # Python Backend Root
│   ├── app/
│   │   ├── api/                    # REST endpoints & WebSocket gateway
│   │   ├── engines/                # Core analysis engines (Market, Chart, SMC, Option Chain, AI)
│   │   ├── core/                   # Security, auth, and central configs
│   │   └── main.py                 # FastAPI application entry point
│   ├── tests/                      # Pytest test suite
│   ├── requirements.txt
│   └── pyproject.toml
├── .github/workflows/              # CI/CD pipelines
├── docker-compose.yml              # Local containers setup
└── .env.example                    # Environment template
```
</details>

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** v20+ & **pnpm** v9+
* **Python** v3.12+
* **Docker & Docker Compose** (Optional, recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/sagarsahni6/AI-Trading-Copilot.git
cd AI-Trading-Copilot
```

### 2. Configure Environment Variables
Copy the env template and populate your credentials:
```bash
cp .env.example .env
```
Open `.env` and configure:
* `NVIDIA_API_KEY` (Get from NVIDIA NIM console)
* Kite API credentials (if automating data fetch, optional for local mockup)
* Database connection string

---

### 3. Execution Options

#### Option A: Running with Docker (Recommended)
This spins up PostgreSQL, Redis, the FastAPI Backend, and Vite dev server automatically.
```bash
docker-compose up --build
```

#### Option B: Manual Setup

**1. Launch Backend:**
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**2. Launch Extension Builder:**
```bash
cd extension
pnpm install
pnpm dev
```

---

### 4. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** (top right corner).
3. Click **Load unpacked** (top left corner).
4. Select the `extension/dist/` folder.
5. Go to [kite.zerodha.com](https://kite.zerodha.com). You will see the floating **AI Trading Copilot** sidebar on the right side!

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Extension type check
cd extension
pnpm tsc --noEmit
```

---

## ⚙️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | Toggle sidebar |
| `Ctrl+Shift+R` | Refresh analysis |
| `Ctrl+Shift+C` | Toggle AI chat |
| `Ctrl+Shift+A` | Quick analysis |

---

## ⚠️ Disclaimer

This software is for **educational and informational purposes only**. It does not constitute financial advice. Trading in financial markets involves substantial risk of loss. Past performance is not indicative of future results. The developers are not responsible for any financial losses incurred through the use of this software.

**Always:**
- Conduct your own research
- Never risk more than you can afford to lose
- Consult a qualified financial advisor
- Paper trade before using real capital

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
