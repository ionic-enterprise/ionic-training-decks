# Completed Code for Lab: User Preferences Phase 2

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `user-preferences.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Subject } from 'rxjs';

import { cities } from './cities';
import { City } from '../../models/city';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private keys = {
    useCelcius: 'useCelcius',
    city: 'city'
  };
  private _city: City;
  private _useCelcius: boolean;

  changed: Subject<void>;

  constructor(private storage: Storage) {
    this.changed = new Subject();
  }

  async getUseCelcius(): Promise<boolean> {
    await this.storage.ready();
    if (this._useCelcius === undefined) {
      this._useCelcius = await this.storage.get(this.keys.useCelcius);
    }
    return this._useCelcius;
  }

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this._useCelcius = value;
    await this.storage.set(this.keys.useCelcius, value);
    this.changed.next();
  }

  getAllCities(): Array<City> {
    return cities;
  }

  async getCity(): Promise<City> {
    await this.storage.ready();
    if (this._city === undefined) {
      const city = await this.storage.get(this.keys.city);
      this._city =
        cities.find(c => c.name === (city && city.name)) || cities[0];
    }
    return this._city;
  }

  async setCity(value: City): Promise<void> {
    await this.storage.ready();
    this._city = value;
    await this.storage.set(this.keys.city, value);
    this.changed.next();
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
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private appId = '69f068bb8bf2bc3e061cb2b62c255c65'; // or use your own API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private http: HttpClient,
    private location: LocationService,
    private userPreferences: UserPreferencesService
  ) {}

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
    return from(
      this.userPreferences.getCity().then(city => {
        if (city && city.coordinate) {
          return Promise.resolve(city.coordinate);
        } else {
          return this.location.current();
        }
      })
    );
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

## `user-preferences.component.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { City } from '../models/city';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  cities: Array<City> = this.userPreferences.getAllCities();
  city: City = this.cities[0];
  useCelcius: boolean;

  constructor(
    private modal: ModalController,
    private userPreferences: UserPreferencesService
  ) {}

  async ngOnInit() {
    this.city = await this.userPreferences.getCity();
    this.useCelcius = await this.userPreferences.getUseCelcius();
  }

  dismiss() {
    this.modal.dismiss();
  }

  async save() {
    await Promise.all([
      this.userPreferences.setUseCelcius(this.useCelcius),
      this.userPreferences.setCity(this.city)
    ]);
    this.modal.dismiss();
  }
}
```

## `current-weather.page.ts`

Other pages are similar in concept.

```TypeScript
import { Component } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';

import { Weather } from '../models/weather';
import { IconMapService } from '../services/icon-map/icon-map.service';
import { WeatherService } from '../services/weather/weather.service';

import { WeatherPageBase } from '../weather-page-base/weather-page-base';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss']
})
export class CurrentWeatherPage extends WeatherPageBase<Weather> {
  currentWeather: Weather;

  constructor(
    public iconMap: IconMapService,
    loading: LoadingController,
    modal: ModalController,
    userPreferences: UserPreferencesService,
    weather: WeatherService
  ) {
    super(loading, modal, userPreferences, () => weather.current());
  }
}
```

## `weather-page-base.ts`

```TypeScript
import { OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';

import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

export class WeatherPageBase<T> implements OnInit, OnDestroy {
  private subscription: Subscription;

  cityName: string;
  scale: string;
  data: T;

  constructor(
    private loading: LoadingController,
    private modal: ModalController,
    private userPreferences: UserPreferencesService,
    private fetch: () => Observable<T>
  ) {}

  ngOnInit() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async openUserPreferences(): Promise<void> {
    const m = await this.modal.create({ component: UserPreferencesComponent });
    m.present();
  }

  private async getData() {
    const l = await this.loading.create({ message: 'Refreshing Data' });
    l.present();
    this.cityName = (await this.userPreferences.getCity()).name;
    this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
    this.fetch().subscribe(w => {
      this.data = w;
      l.dismiss();
    });
  }
}
```
