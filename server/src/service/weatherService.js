import dotenv from 'dotenv';
dotenv.config();
// TODO: Define a class for the Weather object
// TODO: Complete the WeatherService class
class Weather {
    constructor(cityName, temperature, humidity, windSpeed, uvIndex, weatherIcon) {
        this.cityName = cityName;
        this.temperature = temperature;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.uvIndex = uvIndex;
        this.weatherIcon = weatherIcon;
    }
}
class WeatherService {
    static async getWeather(city) {
        return new WeatherService().getWeatherForCity(city);
    }
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/data/2.5/';
        this.apiKey = process.env.WEATHER_API_KEY || '';
        this.cityName = '';
        this.getWeatherForCity = this.getWeatherForCity.bind(this);
    }
    // TODO: Create destructureLocationData method
    destructureLocationData(locationData) {
        const { lat, lon } = locationData.results[0];
        return { lat, lon };
    }
    // TODO: Create buildGeocodeQuery method
    buildGeocodeQuery() {
        return `${this.baseURL}geocode/json?address=${this.cityName}&key=${this.apiKey}`;
    }
    // TODO: Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.apiKey}`;
    }
    // TODO: Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        const response = await fetch(this.buildGeocodeQuery());
        if (!response.ok)
            throw new Error('Error fetching location data');
        const locationData = await response.json();
        if (!locationData || locationData.length === 0)
            throw new Error('Location data not found');
        return this.destructureLocationData(locationData);
    }
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        const response = await fetch(this.buildWeatherQuery(coordinates));
        if (!response.ok)
            throw new Error('Error fetching weather data');
        return await response.json();
    }
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const { temp, humidity, wind_speed, uvi, weather } = response.current;
        return new Weather(this.cityName, temp, humidity, wind_speed, uvi, weather[0].icon || '');
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        return weatherData.map((day) => {
            const { temp, humidity } = day;
            return new Weather(this.cityName, temp, humidity, currentWeather.windSpeed, currentWeather.uvIndex, day.weather[0].icon || '');
        });
    }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        this.cityName = city;
        const coordinates = await this.fetchAndDestructureLocationData();
        const weatherData = await this.fetchWeatherData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecast = this.buildForecastArray(currentWeather, weatherData.daily);
        return { current: currentWeather, forecast };
    }
}
export default new WeatherService();
