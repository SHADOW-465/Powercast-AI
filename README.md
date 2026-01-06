# ⚡ PowerCast AI: Advanced Electrical Load Forecasting & Hybrid Dispatch

PowerCast AI is a neomorphic, high-performance dashboard designed for modern electrical grid management. It leverages **Gemini 2.0 Flash** and advanced signal processing to provide accurate load forecasting and environmentally optimized generator dispatch.

---

## 🚀 Key Features

### 🧠 Intelligent Forecasting
- **Adaptive Signal Quality Controller**: Implementation of dynamic Savitzky-Golay filtering that analyzes Signal-to-Noise Ratio (SNR) and Volatility to tune smoothing parameters in real-time.
- **Seasonality Detection**: Uses Autocorrelation to detect 24h/48h/168h cycles and optimizes Gemini's context window accordingly.
- **Exogenous Integration**: Location-aware forecasting that fetches real-time weather (Temperature, Cloud Cover, Wind) to correlate atmospheric factors with grid demand.

### 🍃 Hybrid Generation Dispatch
- **Environmental Priority Dispatch**: Greedy optimization that saturates load with Renewable units (Solar, Wind, Hydro) first to minimize emissions.
- **Real-time Sustainability Scoring**: Hourly calculation of `environmentalImpact` (CO2 eq) and renewable energy mix percentage.
- **Smart Maintenance Planning**: AI-driven suggestions for maintenance windows during low-load periods, validated by internal MAPE backtests.

### 🎨 Premium Visualization
- **Interactive Neomorphic UI**: A sleek, high-contrast dashboard with pill-box controls and glassmorphism effects.
- **Context-Aware Charts**: Interactive ResultsChart with drag-to-zoom, scroll-to-zoom, and adaptive X-axis scaling for Hours vs. Years views.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Platform**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **Styling**: Tailwind CSS 4 (Custom Neomorphic Design System)
- **Charts**: Chart.js with Interactive Zoom/Pan plugins
- **Logic**: Custom Signal Processing & Autocorrelation Utilities

---

## ⚙️ Environment Variables

To run this project, you must configure the Gemini API Key.

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/) and create a free API Key for Gemini 2.0 Flash.
2.  **Setup `.env.local`**: Create a file named `.env.local` in the root directory:
    ```bash
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

> [!IMPORTANT]
> The application will fail to generate forecasts if the `GEMINI_API_KEY` is missing or invalid.

---

## 📦 Installation

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/SHADOW-465/Powercast-AI.git
    cd Powercast-AI
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

---

## 📂 Architecture Overview

- **`src/utils/signalProcessing.ts`**: Adaptive Signal Quality Controller & SG Optimization.
- **`src/utils/weatherService.ts`**: Exogenous data fetcher (Weather/Environmental).
- **`src/utils/decisionLogic.ts`**: Environmental Priority Dispatch & Unit Commitment.
- **`src/utils/gemini.ts`**: Multi-variable Prompt Engineering & AI Orchestration.
- **`app/api/forecast/route.ts`**: Unified forecasting pipeline.

---

## 📝 Recent Upgrades (Build v2.1)

- ✅ **Integrated Interactive Zoom/Pan** on ResultsChart.
- ✅ **Implemented Adaptive Lookback** logic based on data autocorrelation.
- ✅ **Added Location-Awareness** allowing grid behavior simulation based on city weather.
- ✅ **Refactored Dispatch Logic** for Hybrid Green/Brown energy mixes.
- ✅ **Optimized Signal Quality Control** with MAPE-based error feedback loop.
