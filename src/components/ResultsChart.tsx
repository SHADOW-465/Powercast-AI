"use client";

import React, { useMemo, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, RotateCcw } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ResultsChartProps {
    history: { timestamp: string; load: number; originalLoad?: number }[];
    forecast: { timestamp: string; load: number }[];
    horizon: number;
    horizonUnit: 'hours' | 'days' | 'years';
    maintenanceWindows?: any[];
    isLoading?: boolean;
}

export default function ResultsChart({
    history = [],
    forecast = [],
    horizonUnit,
    isLoading
}: ResultsChartProps) {
    const chartRef = useRef<any>(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const zoomPlugin = require('chartjs-plugin-zoom');
            ChartJS.register(zoomPlugin);
        }
    }, []);

    const resetZoom = () => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };

    const data = useMemo(() => {
        // Dynamic context slicing: 
        // Hours: 48h context, Days: 30d context, Years: 2y context
        let contextSize = 48;
        if (horizonUnit === 'days') contextSize = 30;
        else if (horizonUnit === 'years') contextSize = 2;


        const labels = [
            ...history.map(d => d.timestamp), // Include FULL history for panning
            ...forecast.map(d => d.timestamp)
        ];

        const fullHistoryLength = history.length;
        const forecastLength = forecast.length;

        const historicalDataset = {
            label: 'Historical Load',
            data: [
                ...history.map(d => d.originalLoad || d.load),
                ...new Array(forecastLength).fill(null)
            ],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
        };

        const smoothedDataset = {
            label: 'Smoothed Load',
            data: [
                ...history.map(d => d.load),
                ...new Array(forecastLength).fill(null)
            ],
            borderColor: '#10B981',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.4,
        };

        const forecastDataset = {
            label: 'Predicted Load',
            data: [
                ...new Array(Math.max(0, fullHistoryLength - 1)).fill(null),
                history[fullHistoryLength - 1]?.load || null,
                ...forecast.map(d => d.load)
            ],
            borderColor: '#EF4444', // RED (MANDATORY)
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
        };

        return { labels, datasets: [historicalDataset, smoothedDataset, forecastDataset] };
    }, [history, forecast, horizonUnit]);

    const labels = data.labels;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: { size: 10, weight: 'bold' as any, family: 'Inter' }
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x' as const,
                    threshold: 5,
                },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    drag: {
                        enabled: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: 'rgba(59, 130, 246, 0.4)',
                        borderWidth: 1,
                    },
                    mode: 'x' as const,
                }
            }
        },
        scales: {
            x: {
                // Focus on the end of history + forecast
                min: history.length > 12 ? labels[Math.max(0, history.length - 12)] : undefined,
                title: {
                    display: true,
                    text: `Time (${horizonUnit.charAt(0).toUpperCase() + horizonUnit.slice(1)})`,
                    font: { size: 10, weight: 'bold' as any }
                },
                grid: { display: false },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 12,
                    font: { size: 9 },
                    callback: function (value: any, index: number): string {
                        const label = labels[index] || '';
                        if (horizonUnit === 'years') return label.split('-')[0]; // Just year
                        if (horizonUnit === 'days') return label.split(' ')[0].split('-').slice(1).join('/'); // MM/DD/YY -> MM/DD
                        return (label as string).split(' ')[1] || (label as string); // HH:mm
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Power Demand (MW)',
                    font: { size: 10, weight: 'bold' as any }
                },
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { font: { size: 9 } }
            }
        }
    };

    return (
        <div className="neo-card w-full h-full p-8 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dynamic Load Forecast Visualization</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Drag to zoom • Scroll to magnify • Drag pan</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetZoom}
                        className="neo-btn py-1.5 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 flex items-center gap-2"
                    >
                        <RotateCcw size={12} />
                        Reset View
                    </button>
                    {isLoading && (
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                            <span className="text-[9px] font-bold text-blue-500 uppercase">Updating</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-[350px] relative">
                {!isLoading && forecast.length > 0 && (
                    <div
                        className="absolute top-0 right-0 h-[82%] bg-red-400/5 border-l border-dashed border-red-200 pointer-events-none flex items-start justify-center pt-2"
                        style={{ width: `${(forecast.length / (history.slice(-48).length + forecast.length)) * 100}%` }}
                    >
                        <span className="text-[9px] font-black text-red-300 uppercase tracking-[0.2em]">Forecast Region</span>
                    </div>
                )}

                {history.length > 0 ? (
                    <Line ref={chartRef} data={data} options={options} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <div className="w-16 h-16 neo-inset rounded-full flex items-center justify-center mb-4">
                            <Activity size={32} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting System Input</p>
                    </div>
                )}
            </div>
        </div>
    );
}
