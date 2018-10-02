# Completed Code for Lab: Getting Data

Please try to write this code on your own before consulting this part of the guide.

## App Module

Your `src/app/app.module.ts` should currently look something like this:

```TypeScript
import { 
  NgModule, 
  ErrorHandler,
  CUSTOM_ELEMENTS_SCHEMA 
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ForecastPage } from '../pages/forecast/forecast';
import { UVIndexPage } from '../pages/uv-index/uv-index';
import { CurrentWeatherPage } from '../pages/current-weather/current-weather';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IconMapProvider } from '../providers/icon-map/icon-map';
import { WeatherProvider } from '../providers/weather/weather';

@NgModule({
  declarations: [
    MyApp,
    ForecastPage,
    UVIndexPage,
    CurrentWeatherPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ForecastPage,
    UVIndexPage,
    CurrentWeatherPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    IconMapProvider,
    WeatherProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule {}
```

## Weather Provider

Your `src/providers/weather/weather.ts` should currently look something like this:

```TypeScript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Forecast } from '../../models/forecast';
import { UVIndex } from '../../models/uv-index';
import { Weather } from '../../models/weather';

@Injectable()
export class WeatherProvider {
  private appId = 'db046b8bbe642b799cb40fa4f7529a12';
  private baseUrl = 'http://api.openweathermap.org/data/2.5';

  private latitude = 43.073051;
  private longitude = -89.40123;

  constructor(private http: HttpClient) {}

  current(): Observable<Weather> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  forecast(): Observable<Forecast> {
    return this.http
      .get(
        `${this.baseUrl}/forecast?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  uvIndex(): Observable<UVIndex> {
    return this.http
      .get(
        `${this.baseUrl}/uvi?lat=${this.latitude}&lon=${this.longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackUVIndex(res)));
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

  private unpackUVIndex(res: any): UVIndex {
    const level = this.riskLevel(res.value);
    return {
      value: res.value,
      riskLevel: level
    };
  }

  private unpackWeather(res: any): Weather {
    return {
      temperature: res.main.temp,
      condition: res.weather[0].id,
      date: new Date(res.dt * 1000)
    };
  }

  private riskLevel(value: number) {
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
}
```