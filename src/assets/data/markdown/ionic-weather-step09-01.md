# Completed Code for Lab: Use the Data

Please try to write this code on your own before consulting this part of the guide.

## App Module

Your `src/app/app.module.ts` should currently look something like this:

```TypeScript
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  Injectable,
  Injector,
  NgModule
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Pro } from '@ionic/pro';

import { ForecastPage } from '../pages/forecast/forecast';
import { UVIndexPage } from '../pages/uv-index/uv-index';
import { CurrentWeatherPage } from '../pages/current-weather/current-weather';
import { TabsPage } from '../pages/tabs/tabs';

import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IconMapProvider } from '../providers/icon-map/icon-map';
import { WeatherProvider } from '../providers/weather/weather';
import { LocationProvider } from '../providers/location/location';

Pro.init('1ec81629', {
  appVersion: '0.0.1'
});

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch (e) {
      console.error(e);
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

@NgModule({
  declarations: [
    MyApp,
    ForecastPage,
    UVIndexPage,
    CurrentWeatherPage,
    TabsPage
  ],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ForecastPage,
    UVIndexPage,
    CurrentWeatherPage,
    TabsPage
  ],
  providers: [
    Geolocation,
    StatusBar,
    SplashScreen,
    IonicErrorHandler,
    { provide: ErrorHandler, useClass: MyErrorHandler },
    IconMapProvider,
    LocationProvider,
    WeatherProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

## Location Model

Your `src/models/location.ts` should currently look something like this:

```TypeScript
export interface Location {
  latitude: number;
  longitude: number;
}
```


## Location Service

Your `src/models/location/location.ts` should currently look something like this:

```TypeScript
import { Geolocation } from '@ionic-native/geolocation';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Location } from '../../models/location';

@Injectable()
export class LocationProvider {
  private defaultLocation: Location = {
    latitude: 43.073051,
    longitude: -89.40123
  };

  constructor(private geolocation: Geolocation, private platform: Platform) {}

  current(): Promise<Location> {
    if (this.platform.is('cordova')) {
      return this.geolocation.getCurrentPosition().then(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      }));
    } else {
      return Promise.resolve(this.defaultLocation);
    }
  }
}
```

## Weather Model

Your `src/models/weather/weather.ts` should currently look something like this:

```TypeScript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { LocationProvider } from '../location/location';

import { Forecast } from '../../models/forecast';
import { Location } from '../../models/location';
import { UVIndex } from '../../models/uv-index';
import { Weather } from '../../models/weather';

@Injectable()
export class WeatherProvider {
  private appId = 'db046b8bbe642b799cb40fa4f7529a12';
  private baseUrl = 'http://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient, private location: LocationProvider) {}

  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((loc: Location) =>
        this.getCurrentWeather(loc.latitude, loc.longitude)
      )
    );
  }

  forecast(): Observable<Forecast> {
    return this.getCurrentLocation().pipe(
      flatMap((loc: Location) =>
        this.getWeatherForecast(loc.latitude, loc.longitude)
      )
    );
  }

  uvIndex(): Observable<UVIndex>{
    return this.getCurrentLocation().pipe(
      flatMap((loc: Location) =>
        this.getUVIndex(loc.latitude, loc.longitude)
      )
    );
  }

  private getCurrentWeather(
    latitude: number,
    longitude: number
  ): Observable<Weather> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  private getWeatherForecast(
    latitude: number,
    longitude: number
  ): Observable<Forecast> {
    return this.http
      .get(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  private getUVIndex(latitude: number, longitude: number): Observable<UVIndex> {
    return this.http
      .get(
        `${this.baseUrl}/uvi?lat=${latitude}&lon=${longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackUVIndex(res)));
  }

  private getCurrentLocation(): Observable<Location> {
    return Observable.fromPromise(this.location.current());
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
