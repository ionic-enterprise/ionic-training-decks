# Completed Code for Lab: Using Plugins 

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `location.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';

import { Coordinate } from '../../models/coordinate';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private defaultLocation = {
    coords: {
      latitude: 43.073051,
      longitude: -89.40123
    }
  };

  private cachedLocation;

  constructor(private geolocation: Geolocation, private platform: Platform) {}

  async current(): Promise<Coordinate> {
    const loc =
      this.cachedLocation ||
      (this.platform.is('cordova')
        ? await this.geolocation.getCurrentPosition()
        : this.defaultLocation);
    this.cachedLocation = loc;
    return {
      longitude: loc.coords.longitude,
      latitude: loc.coords.latitude
    };
  }
}
```

## `weather.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { Forecast } from '../../models/forecast';
import { Coordinate } from '../../models/coordinate';
import { Weather } from '../../models/weather';
import { UVIndex } from '../..//models/uv-index';
import { LocationService } from '../../services/location/location.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private appId = '69f068bb8bf2bc3e061cb2b62c255c65'; // or use your own API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient, private location: LocationService) {}

  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap(coord => this.getCurrentWeather(coord))
    );
  }

  forecast(): Observable<Forecast> {
    return this.getCurrentLocation().pipe(
      flatMap(coord => this.getForecast(coord))
    );
  }

  uvIndex(): Observable<UVIndex> {
    return this.getCurrentLocation().pipe(
      flatMap(coord => this.getUVIndex(coord))
    );
  }

  private getCurrentLocation(): Observable<Coordinate> {
    return from(this.location.current());
  }

  private getCurrentWeather(coord: Coordinate): Observable<Weather> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  private getForecast(coord: Coordinate): Observable<Forecast> {
    return this.http
      .get(
        `${this.baseUrl}/forecast?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  private getUVIndex(coord: Coordinate): Observable<UVIndex> {
    return this.http
      .get(
        `${this.baseUrl}/uvi?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${this.appId}`
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
