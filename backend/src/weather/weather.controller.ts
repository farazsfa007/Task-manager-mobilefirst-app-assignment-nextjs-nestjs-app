import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherService } from './weather.service';

@UseGuards(JwtAuthGuard)
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Query('location') location: string) {
    return this.weatherService.getWeather(location);
  }
}
