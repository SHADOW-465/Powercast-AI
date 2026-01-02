# PowerCast AI: Electrical Load Forecasting Application

A comprehensive, AI-based electrical load forecasting and decision support system built with Next.js, Tailwind CSS, and Google Gemini AI.

## Overview

PowerCast AI provides a modern dashboard for utility operators and planners to:
1.  **Visualize** historical load data with Savitzky-Golay smoothing for trend analysis.
2.  **Forecast** future electrical load (next hour to N days) using Generative AI (Google Gemini).
3.  **Optimize** generation schedules with unit commitment recommendations.
4.  **Plan** maintenance during identified low-load periods.

## System Architecture

*   **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons, Recharts.
*   **Backend**: Next.js API Routes (Serverless functions).
*   **AI Engine**: Google Gemini 1.5 Flash (via Google Generative AI SDK).
*   **Data Processing**: Savitzky-Golay filtering (custom implementation matching SciPy parameters), CSV parsing.

## Features

*   **Data Input**: CSV file upload (timestamp, load) and manual parameter configuration.
*   **Signal Processing**: Automatic noise reduction using Savitzky-Golay filter (Window=11, Poly=2).
*   **Forecasting**: Flexible horizon (hours/days) driven by LLM context understanding.
*   **Decision Support**:
    *   **Unit Commitment**: Greedy algorithm to suggest optimal generator mix based on capacity.
    *   **Maintenance Planning**: Algorithmic detection of low-load windows suitable for maintenance.
*   **Visualization**: Interactive, responsive charts showing actual vs. smoothed vs. predicted load.

## Getting Started

### Prerequisites

*   Node.js 20+
*   Google Gemini API Key (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: This project uses modern versions of Next.js (16.x) and Tailwind (4.x). Ensure your environment supports them.*

### Configuration

Create a `.env.local` file in the root directory and add your API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### Running the Application

```bash
npm run dev
# Open http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## Usage

1.  **Upload Data**: Use the provided `load_data.csv` or your own dataset. Format: `timestamp` (YYYY-MM-DD HH:MM), `load` (numeric).
2.  **Configure**: Set the desired forecast horizon (e.g., 24 hours).
3.  **Run**: Click "Run Forecast Analysis".
4.  **Analyze**: View the generated forecast, unit commitment schedule, and maintenance suggestions.

## License

MIT
