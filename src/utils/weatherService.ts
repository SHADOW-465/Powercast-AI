/**
 * Weather and Exogenous Data Fetcher
 * Simulates real-time fetches for academic demonstration, 
 * but structured for actual API integration.
 */

export interface WeatherData {
    temperature: number; // Celsius
    humidity: number; // %
    cloudCover: number; // %
    windSpeed: number; // m/s
    condition: string;
}

/**
 * Fetches real-time weather and environmental data for a location.
 * In a production app, this would use OpenWeatherMap or similar.
 */
export async function fetchCurrentWeather(location: string): Promise<WeatherData> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Logic to simulate varied weather based on location string
    // This ensures consistency for demo purposes
    const normalizedLoc = location.toLowerCase();

    let temp = 20;
    let clouds = 20;
    let wind = 10;
    let condition = "Clear";

    if (normalizedLoc.includes("new york") || normalizedLoc.includes("ny")) {
        temp = 12; clouds = 40; wind = 15; condition = "Partly Cloudy";
    } else if (normalizedLoc.includes("london") || normalizedLoc.includes("uk")) {
        temp = 9; clouds = 80; wind = 20; condition = "Overcast";
    } else if (normalizedLoc.includes("tokyo")) {
        temp = 18; clouds = 30; wind = 5; condition = "Clear";
    } else if (normalizedLoc.includes("mumbai") || normalizedLoc.includes("india")) {
        temp = 32; clouds = 10; wind = 8; condition = "Sunny";
    }

    return {
        temperature: temp,
        humidity: 60,
        cloudCover: clouds,
        windSpeed: wind,
        condition
    };
}

// Alias for backward compatibility if needed, but we will update route.ts
export const fetchExogenousFactors = fetchCurrentWeather;
