# Completed Code for Lab: Getting Data

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `weather.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Forecast } from '../../models/forecast';
import { Weather } from '../../models/weather';
import { UVIndex } from '../..//models/uv-index';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private appId = '69f068bb8bf2bc3e061cb2b62c255c65'; // use your own API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  private latitude = 43.073051;
  private longitude = -89.40123;

  constructor(private http: HttpClient) {}

  current(): Observable<any> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  forecast(): Observable<any> {
    return this.http
      .get(
        `${this.baseUrl}/forecast?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  uvIndex(): Observable<any> {
    return this.http
      .get(
        `${this.baseUrl}/uvi?lat=${this.latitude}&lon=${this.longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackUvIndex(res)));
  }

  private unpackForecast(res: any): Forecast {
    let currentDay: Array<Weather>;
    let prevDate: number;
    const forecast: Forecast = [];

    res.list.forEach(item => {
      const w = this.unpackWeather(item);
      if (w.date.getDate() !== prevDate) {
        prevDate = w.date.getDate();
        currentDay = [];
        forecast.push(currentDay);
      }
      currentDay.push(w);
    });

    return forecast;
  }

  private unpackUvIndex(res: any): UVIndex {
    return {
      value: res.value,
      riskLevel: this.riskLevel(res.value)
    };
  }

  private riskLevel(value: number): number {
    if (value < 3) {
      return 0;
    }
    if (value < 6) {
      return 1;
    }
    if (value < 8) {
      return 2;
    }
    if (value < 11) {
      return 3;
    }
    return 4;
  }

  private unpackWeather(res: any): Weather {
    return {
      temperature: res.main.temp,
      condition: res.weather[0].id,
      date: new Date(res.dt * 1000)
    };
  }
}
```