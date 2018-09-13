# Completed Code for Lab: Use the Data

Please try to write this code on your own before consulting this part of the guide.

## `src/app/app.module.ts`

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
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';

import { Pro } from '@ionic/pro';

import { ForecastPage } from '../pages/forecast/forecast';
import { UVIndexPage } from '../pages/uv-index/uv-index';
import { CurrentWeatherPage } from '../pages/current-weather/current-weather';
import { TabsPage } from '../pages/tabs/tabs';

import { ComponentsModule } from '../components/components.module';

import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IconMapProvider } from '../providers/icon-map/icon-map';
import { WeatherProvider } from '../providers/weather/weather';
import { LocationProvider } from '../providers/location/location';
import { UserPreferencesProvider } from '../providers/user-preferences/user-preferences';

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
  imports: [
    BrowserModule,
    ComponentsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
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
    Geolocation,
    StatusBar,
    SplashScreen,
    IonicErrorHandler,
    { provide: ErrorHandler, useClass: MyErrorHandler },
    IconMapProvider,
    LocationProvider,
    UserPreferencesProvider,
    WeatherProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

## `src/components/user-preferences/user-preferences.html`

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>User Preferences</ion-title>

    <ion-buttons end>
      <button ion-button icon-only (click)="dismiss()">
        <ion-icon name="close"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item>
      <ion-label>Use Celcius</ion-label>
      <ion-toggle [(ngModel)]="useCelcius"></ion-toggle>
    </ion-item>

    <ion-item>
      <ion-label>Location</ion-label>
      <ion-select [(ngModel)]="city">
        <ion-option *ngFor="let city of cities" [value]="city">{{city.name}}</ion-option>
      </ion-select>
    </ion-item>
  </ion-list>
</ion-content>

<ion-footer>
  <button ion-button block color="secondary" (click)="save()">Save</button>
</ion-footer>
```

## `src/components/user-preferences/user-preferences.ts`

```TypeScript
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { City } from '../../models/city';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';

@Component({
  selector: 'user-preferences',
  templateUrl: 'user-preferences.html'
})
export class UserPreferencesComponent {
  cities: Array<City>;
  city: City;
  useCelcius: boolean;

  constructor(
    private modal: ViewController,
    private userPreferences: UserPreferencesProvider
  ) {}

  async ionViewDidLoad() {
    this.cities = this.userPreferences.availableCities();
    this.city = await this.userPreferences.getCity();
    this.useCelcius = await this.userPreferences.getUseCelcius();
  }

  dismiss() {
    this.modal.dismiss();
  }

  save() {
    this.userPreferences.setUseCelcius(this.useCelcius);
    this.userPreferences.setCity(this.city);
    this.modal.dismiss();
  }
}
```

## `src/pages/current-weather/current-weather.html`

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>Current Weather</ion-title>

    <ion-buttons end>
      <button ion-button icon-only (click)="openUserPreferences()">
        <ion-icon name="settings"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content text-center padding>
  <div class="information">
    <ion-label class="city">{{cityName}}</ion-label>
    <kws-temperature class="primary-value" [scale]="scale" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
  <kws-condition [condition]="currentWeather?.condition" [iconPaths]="iconMap"></kws-condition>
</ion-content>
```

## `src/pages/current-weather/current-weather.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';
import { Weather } from '../../models/weather';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-current-weather',
  templateUrl: 'current-weather.html'
})
export class CurrentWeatherPage {
  scale: string;
  cityName: string;
  currentWeather: Weather;

  private subscription: Subscription;

  constructor(
    public iconMap: IconMapProvider,
    private modal: ModalController,
    private userPreferences: UserPreferencesProvider,
    private weather: WeatherProvider
  ) {}

  ionViewDidLoad() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }

  private getData() {
    this.userPreferences.getCity().then(c => (this.cityName = c.name));
    this.userPreferences.getUseCelcius().then(u => {
      this.scale = u ? 'C' : 'F';
    });
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
}
```

## `src/pages/forecast/forecast.html`

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>
      Forecast
    </ion-title>

    <ion-buttons end>
      <button ion-button icon-only (click)="openUserPreferences()">
        <ion-icon name="settings"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content padding>
  <ion-list>
    <ion-item *ngFor="let f of forecast">
      <kws-daily-forecast [scale]="scale" [forecasts]="f" [iconPaths]="iconMap"></kws-daily-forecast>
    </ion-item>
  </ion-list>
</ion-content>
```

## `src/pages/forecast/forecast.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { Forecast } from '../../models/forecast';
import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-forecast',
  templateUrl: 'forecast.html'
})
export class ForecastPage {
  scale: string;
  forecast: Forecast;

  private subscription: Subscription;

  constructor(
    public iconMap: IconMapProvider,
    private modal: ModalController,
    private userPreferences: UserPreferencesProvider,
    private weather: WeatherProvider
  ) {}

  ionViewDidLoad() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }

  private getData() {
    this.userPreferences.getUseCelcius().then(u => {
      this.scale = u ? 'C' : 'F';
    });
    this.weather.forecast().subscribe(f => (this.forecast = f));
  }
}
```

## `src/pages/uv-index/uv-index.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';
import { UVIndex } from '../../models/uv-index';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-uv-index',
  templateUrl: 'uv-index.html'
})
export class UVIndexPage {
  uvIndex: UVIndex;

  private subscription: Subscription;

  advice: Array<string> = [
    'Wear sunglasses on bright days. If you burn easily, cover up and use broad spectrum SPF 30+ sunscreen. ' +
      'Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Stay in the shade near midday when the sun is strongest. If outdoors, wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, ' +
      'even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Reduce time in the sun between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, ' +
      'and after swimming or sweating. Bright surfaces, such sand, water and snow, will increase UV exposure.',
    'Minimize sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, and after ' +
      'swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Try to avoid sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, ' +
      'and after swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.'
  ];

  constructor(
    private modal: ModalController,
    private userPreferences: UserPreferencesProvider,
    private weather: WeatherProvider
  ) {}

  ionViewDidLoad() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }

  private getData() {
    this.weather.uvIndex().subscribe(i => (this.uvIndex = i));
  }
}
```

## `src/providers/user-preferences/user-preferences.ts`

```TypeScript
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { City } from '../../models/city';
import { cities } from './cities';

@Injectable()
export class UserPreferencesProvider {
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
    this.changed.next();
    this.storage.set(this.keys.useCelcius, value);
  }

  async getCity(): Promise<City> {
    await this.storage.ready();
    if (!this._city) {
      const city = await this.storage.get(this.keys.city);
      this._city = cities.find(c => c.name === (city && city.name)) || cities[0];
    }
    return this._city;
  }

  async setCity(city: City): Promise<void> {
    await this.storage.ready();
    this._city = cities.find(c => c.name === city.name) || cities[0];
    this.changed.next();
    this.storage.set(this.keys.city, city);
  }

  availableCities(): Array<City> {
    return cities;
  }
}
```

## `src/providers/weather/weather.ts`

```TypeScript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { LocationProvider } from '../../providers/location/location';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';

import { Forecast } from '../../models/forecast';
import { Location } from '../../models/location';
import { UVIndex } from '../../models/uv-index';
import { Weather } from '../../models/weather';

@Injectable()
export class WeatherProvider {
  private appId = 'db046b8bbe642b799cb40fa4f7529a12';
  private baseUrl = 'http://api.openweathermap.org/data/2.5';

  constructor(
    private http: HttpClient,
    private location: LocationProvider,
    private userPreferences: UserPreferencesProvider
  ) {}

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

  uvIndex(): Observable<UVIndex> {
    return this.getCurrentLocation().pipe(
      flatMap((loc: Location) => this.getUVIndex(loc.latitude, loc.longitude))
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
    return Observable.fromPromise(
      this.userPreferences.getCity().then(c => {
        if (c.location) {
          return c.location;
        } else {
          return this.location.current();
        }
      })
    );
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
