import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
// TODO: Complete the WeatherService class
class Weather {
  cityName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherIcon: string;
  constructor(cityName: string, temperature: number, humidity: number, windSpeed: number, uvIndex: number, weatherIcon: string) {
    this.cityName = cityName;
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.uvIndex = uvIndex;
    this.weatherIcon = weatherIcon;
  }
}

class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName!: string;


  constructor(cityName: string) {
    this.baseURL = 'https://api.openweathermap.org/';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = cityName;

  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    const coordinates: Coordinates = { lat, lon };
    return coordinates; 
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return encodeURI(`${this.baseURL}geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`);
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const response = await fetch(this.buildGeocodeQuery());
    console.log(response);
    console.log(this.buildGeocodeQuery());
    if (!response.ok) 
      throw new Error(response.statusText);
    const locationData = await response.json();
    if (!locationData || locationData.length === 0) 
      throw new Error('Location data not found');
    
    const { lat, lon } = this.destructureLocationData(locationData);
    return { lat, lon };
    
  }



  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) 
      throw new Error('Error fetching weather data');
    return await response.json();
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const { temp, humidity, wind_speed, uvi, weather } = response.current;
    return new Weather(this.cityName, temp, humidity, wind_speed, uvi, weather[0].icon);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    return weatherData.map((day) => {
      const { temp, humidity } = day;
      return new Weather(this.cityName, temp, humidity, currentWeather.windSpeed, currentWeather.uvIndex, currentWeather.weatherIcon || '');
    });
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity() {

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(currentWeather, weatherData.daily);

      return { current: currentWeather, forecast };
    } catch (error) {
      console.error(`Error fetching weather for city: ${this.cityName}`, error);
      throw error;
    }
  }
}

export default WeatherService;


