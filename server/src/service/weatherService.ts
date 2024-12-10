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
    const url = `${this.baseURL}geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;
    console.log('Geocode query URL:', url);
    return encodeURI(url);
  }
  
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const url = `${this.baseURL}data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&units=metric&appid=${this.apiKey}`;
    console.log('Weather query URL:', url);
    return url;
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
    const url = this.buildWeatherQuery(coordinates);
    console.log('Fetching weather data from:', url);
  
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Error response from weather API:', response.statusText);
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }
  
    return await response.json();
  }
  

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    console.log(response);
    const { main, weather,  wind} = response;
    const { temp, humidity, uvi } = main;
    const { speed } = wind;

    return new Weather(this.cityName, temp, humidity, speed, uvi, weather[0].icon);

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


