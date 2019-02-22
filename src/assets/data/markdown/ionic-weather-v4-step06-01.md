# Completed Code for Lab: Getting Data

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `weather.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Forecast } from '../../models/forecast';
import { Weather } from '../../models/weather';
import { UVIndex } from '../..//models/uv-index';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private latitude = 43.073051;
  private longitude = -89.40123;

  constructor(private http: HttpClient) {}

  current(): Observable<any> {
    return this.http
      .get(
        `${environment.baseUrl}/weather?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  forecast(): Observable<any> {
    return this.http
      .get(
        `${environment.baseUrl}/forecast?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  uvIndex(): Observable<any> {
    return this.http
      .get(
        `${environment.baseUrl}/uvi?lat=${this.latitude}&lon=${this.longitude}&appid=${
          environment.appId
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