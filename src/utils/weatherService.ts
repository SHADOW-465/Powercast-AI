/**
 * Weather and Exogenous Data Fetcher
 * Simulates real-time fetches for academic demonstration, 
 * but structured for actual API integration.
 */

export interface ExogenousFactors {
    location: string;
    temperature: number; // Celsius
    humidity: number; // %
    cloudCover: number; // %
    windSpeed: number; // m/s
    isHoliday: boolean;
}

/**
 * Fetches real-time weather and environmental data for a location.
 * In a production app, this would use OpenWeatherMap or similar.
 * Here we provide a robust simulation based on the requested location.
 */
export async function fetchExogenousFactors(location: string): Promise<ExogenousFactors> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Logic to simulate varied weather based on common city names or random walk
    // If location is provided as "Lat, Lng", we can use that in a real API.

    const seed = location.length;
    const tempBase = 20 + (seed % 15); // 20-35 deg
    const windBase = 5 + (seed % 10); // 5-15 m/s
    const cloudBase = (seed * 7) % 100;

    return {
        location,
        temperature: tempBase,
        humidity: 50 + (seed % 30),
        cloudCover: cloudBase,
        windSpeed: windBase,
        isHoliday: false // In real app, check a calendar API
    };
}
