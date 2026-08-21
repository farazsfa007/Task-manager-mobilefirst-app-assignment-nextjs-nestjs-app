import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class WeatherService {
  async getWeather(location: string) {
    if (!location) {
      throw new BadRequestException('Location is required');
    }

    if (!process.env.OPENWEATHER_API_KEY) {
      throw new BadRequestException('OpenWeather API key is not configured');
    }

    const url =
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}` +
      `&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException('Weather could not be found for this location');
    }

    const data = await response.json();

    return {
      location: data.name,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      description: data.weather?.[0]?.description || '',
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather?.[0]?.icon || '',
    };
  }
}
