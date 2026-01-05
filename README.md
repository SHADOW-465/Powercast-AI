# PowerCast AI: Electrical Load Forecasting & Decision Support

A professional, AI-driven dashboard for electrical load forecasting and power system decision support.
This application leverages **Google Gemini** for time-series forecasting and intelligent reasoning, avoiding traditional local ML model training.

## 🚀 Features

- **No-Code AI Forecasting**: Uses Gemini API to predict future load based on historical patterns.
- **Smart Preprocessing**: Applies **Savitzky-Golay smoothing** (Window=11, Poly=2) to noise-reduce data before analysis.
- **Decision Support**:
  - **Unit Commitment**: Suggests generator ON/OFF status based on predicted load and unit capacities.
  - **Maintenance Planning**: Identifies low-load windows suitable for maintenance.
- **Interactive Visualization**: Dynamic charts comparing historical, smoothed, and predicted data.
- **Neomorphic UI**: Modern, clean, control-room style dashboard.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts.
- **Backend**: Next.js API Routes (Node.js).
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`).
- **Data Processing**: Custom TypeScript implementations for signal processing.

## 📦 Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env.local` file in the root directory and add your Google Gemini API Key:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```
4.  **Run the Application**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

1.  **Upload Data**: Use the "Historical Data" upload box to select a CSV file.
    - Format: `timestamp,load`
    - Example:
      ```csv
      timestamp,load
      2024-01-01 00:00,120.5
      2024-01-01 01:00,118.2
      ```
2.  **Configure System**:
    - Set the **Forecast Horizon** (e.g., 24 hours).
    - Adjust **Generator Capacities** if needed.
3.  **Run Analysis**: Click the "Run Analysis" button.
4.  **View Results**:
    - **Graph**: See the trend continuation.
    - **Status Board**: Check which units should be running.
    - **Maintenance**: See recommended maintenance times.

## 🧠 AI Strategy (Prompt Engineering)

Instead of training a model (like LSTM), we use **In-Context Learning**:
1.  **Context**: We feed the last 48 hours of *smoothed* historical data to Gemini.
2.  **Prompt**: We instruct Gemini to act as a power systems expert, analyze seasonality/trends, and output a JSON array of future values.
3.  **Reasoning**: The system implicitly uses the LLM's vast knowledge of time-series patterns to extrapolate the load curve.

## 📂 Project Structure

- `src/utils/signalProcessing.ts`: Savitzky-Golay implementation.
- `src/utils/gemini.ts`: Interface with Google Generative AI.
- `src/utils/decisionLogic.ts`: Logic for unit commitment and maintenance.
- `app/api/forecast/route.ts`: Main API handler.
- `src/components/`: Reusable UI components (Neomorphic style).
