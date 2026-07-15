# ⚡ AI Trading Copilot

**AI-powered real-time market analysis for Zerodha Kite**

> 🚨 **Decision support only** — This extension never places or executes trades.

---

## 🎯 What It Does

AI Trading Copilot is a Chrome Extension that injects a floating sidebar into Zerodha Kite, providing:

| Feature | Description |
|---------|-------------|
| **Trade Scoring** | Weighted 0-100 score from 6 signal engines |
| **Option Chain Analysis** | PCR, Max Pain, OI shifts, support/resistance, GEX |
| **Chart Analysis** | EMA, RSI, MACD, ATR, ADX, VWAP, Supertrend, pattern detection |
| **Smart Money Concepts** | BOS, CHOCH, Order Blocks, Fair Value Gaps, Liquidity |
| **AI Chat** | Conversational AI powered by NVIDIA NIM (Llama 3.3 70B) |
| **Trade Journal** | Log trades with psychology notes, mistake tracking |
| **Performance Dashboard** | P&L, win rate, streaks, equity curve |
| **Real-time Alerts** | Trade signals, OI shifts, breakouts |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Chrome Extension (MV3)                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Content   │  │Background│  │ Sidebar (React + Zustand)│ │
│  │ Script    │←→│ Service  │←→│ ┌────┬────┬────┬─────┐ │ │
│  │           │  │ Worker   │  │ │Sig │ OC │Chat│Dash │ │ │
│  │ DOM       │  │          │  │ │nals│    │    │board│ │ │
│  │ Observer  │  │ WebSocket│  │ └────┴────┴────┴─────┘ │ │
│  └──────────┘  └────┬─────┘  └────────────────────────┘ │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
              ┌───────▼───────┐
              │ Python Backend │
              │   (FastAPI)    │
              │                │
              │ ┌────────────┐ │
              │ │  Engines   │ │
              │ │ ├─ Market  │ │
              │ │ ├─ Options │ │
              │ │ ├─ Chart   │ │
              │ │ ├─ SMC     │ │
              │ │ ├─ AI(NIM) │ │
              │ │ └─ Trade   │ │
              │ └────────────┘ │
              └────────────────┘
```

---

## 📊 Signal Weighting

| Signal | Weight | Source |
|--------|--------|--------|
| Trend (EMA alignment, ADX) | 25% | Chart Engine |
| Option Chain (PCR, OI, MaxPain) | 20% | Option Chain Engine |
| Volume (spikes, VWAP) | 15% | Chart Engine |
| Smart Money (BOS, OB, FVG) | 20% | SMC Engine |
| Technical Indicators (RSI, MACD) | 10% | Chart Engine |
| Volatility (IV, ATR, VIX) | 10% | Market Engine |

**Minimum trade score: 80/100** — Only high-conviction setups are recommended.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ & pnpm 9+
- Python 3.12+
- Docker & Docker Compose (optional)

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-trading-copilot.git
cd ai-trading-copilot
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your NVIDIA NIM API key and Kite Connect credentials
```

### 3. Run with Docker (Recommended)

```bash
docker-compose up --build
```

### 4. Run Manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Extension:**
```bash
cd extension
pnpm install
pnpm dev
```

### 5. Load Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist/` folder
5. Navigate to [kite.zerodha.com](https://kite.zerodha.com)

---

## 🛠 Tech Stack

### Extension
| Technology | Purpose |
|-----------|---------|
| Chrome MV3 | Extension platform |
| React 18 | UI framework |
| TypeScript | Type safety |
| Zustand | State management |
| Framer Motion | Animations |
| TanStack Query | Server state |
| Tailwind CSS | Styling |
| Vite + CRXJS | Build toolchain |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Web framework |
| NVIDIA NIM | AI model inference |
| NumPy / Pandas | Data processing |
| SQLAlchemy + PostgreSQL | Database |
| Redis | Caching |
| WebSockets | Real-time communication |

---

## 📁 Project Structure

```
ai-trading-copilot/
├── extension/                    # Chrome Extension
│   └── src/
│       ├── background/           # Service Worker (WebSocket, alarms)
│       ├── content/              # DOM scraping + sidebar injection
│       ├── sidebar/              # React sidebar app
│       │   ├── components/       # 10 UI components
│       │   └── stores/           # 4 Zustand stores
│       ├── popup/                # Toolbar popup
│       ├── options/              # Settings page
│       ├── offscreen/            # Black-Scholes calculator
│       └── shared/               # Types, constants, utils
├── backend/                      # Python Backend
│   └── app/
│       ├── api/routes/           # 6 REST endpoints + WebSocket
│       ├── engines/              # 5 analysis engines + trade aggregator
│       └── core/                 # Security, config
├── .github/workflows/            # CI/CD (GitHub Actions)
├── docker-compose.yml            # Local development
└── .env.example                  # Environment template
```

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
