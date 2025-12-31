import * as Location from 'expo-location';

interface WeatherData {
    temperature: number;
    condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Clear' | 'Partly Cloudy';
    isDay: boolean;
}

export const WeatherService = {
    async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`
            );
            const data = await response.json();

            if (!data.current) {
                throw new Error('No weather data');
            }

            return {
                temperature: Math.round(data.current.temperature_2m),
                condition: mapWmoCode(data.current.weather_code),
                isDay: data.current.is_day === 1
            };
        } catch (error) {
            console.warn('Weather fetch failed, using fallback', error);
            // Fallback to "GoodRunss Weather" (aka nice California weather)
            return {
                temperature: 72,
                condition: 'Sunny',
                isDay: true
            };
        }
    }
};

function mapWmoCode(code: number): WeatherData['condition'] {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Cloudy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 80 && code <= 82) return 'Rain';
    return 'Sunny'; // Default
}
