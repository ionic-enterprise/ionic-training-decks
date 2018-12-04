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

## `src/components/components.module.ts`

```TypeScript
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { UserPreferencesComponent } from './user-preferences/user-preferences';
@NgModule({
  declarations: [UserPreferencesComponent],
  entryComponents: [UserPreferencesComponent],
  imports: [IonicModule],
  exports: [UserPreferencesComponent]
})
export class ComponentsModule {}
```

## `src/components/user-preferences/cities.ts`

```TypeScript
import { City } from '../../models/city';

export let cities: Array<City> = [
  { name: 'Current Location' },
  {
    name: 'Chicago, IL',
    location: { latitude: 41.878113, longitude: -87.629799 }
  },
  {
    name: 'Edmonton, AB',
    location: { latitude: 53.544388, longitude: -113.490929 }
  },
  {
    name: 'London, UK',
    location: { latitude: 51.507351, longitude: -0.127758 }
  },
  {
    name: 'Madison, WI',
    location: { latitude: 43.073051, longitude: -89.40123 }
  },
  {
    name: 'Milwaukee, WI',
    location: { latitude: 43.038902, longitude: -87.906471 }
  },
  {
    name: 'Orlando, FL',
    location: { latitude: 28.538336, longitude: -81.379234 }
  },
  {
    name: 'Ottawa, ON',
    location: { latitude: 45.42042, longitude: -75.69243 }
  }
];
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

## `src/components/user-preferences/user-preferences.scss`

```scss
user-preferences {
  .footer {
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 5px;
  }

  .item {
    background-color: white;
  }

  .content {
    background-color: white;
  }
}
```

## `src/components/user-preferences/user-preferences.ts`

```TypeScript
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { City } from '../../models/city';
import { cities } from './cities';

@Component({
  selector: 'user-preferences',
  templateUrl: 'user-preferences.html'
})
export class UserPreferencesComponent {
  cities: Array<City> = cities;
  city: City = this.cities[0];
  useCelcius: boolean;

  constructor(private modal: ViewController) {}

  dismiss() {
    this.modal.dismiss();
  }

  save() {
    console.log('city:', this.city);
  }
}
```

## `src/models/city.ts`

```TypeScript
import { Location } from './location';

export interface City {
  name: string;
  location?: Location;
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
    <ion-label class="city">Madison</ion-label>
    <kws-temperature class="primary-value" scale="F" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
  <kws-condition [condition]="currentWeather?.condition" [iconPaths]="iconMap"></kws-condition>
</ion-content>
```

## `src/pages/current-weather/current-weather.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { Weather } from '../../models/weather';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-current-weather',
  templateUrl: 'current-weather.html'
})
export class CurrentWeatherPage {
  currentWeather: Weather;

  constructor(
    public iconMap: IconMapProvider,
    private modal: ModalController,
    private weather: WeatherProvider
  ) {}

  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
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
      <kws-daily-forecast scale="F" [forecasts]="f" [iconPaths]="iconMap"></kws-daily-forecast>
    </ion-item>
  </ion-list>
</ion-content>
```

## `src/pages/forecast/forecast.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { Forecast } from '../../models/forecast';
import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-forecast',
  templateUrl: 'forecast.html'
})
export class ForecastPage {
  forecast: Forecast;

  constructor(
    public iconMap: IconMapProvider,
    private modal:ModalController,
    private weather: WeatherProvider
  ) {}

  ionViewDidEnter() {
    this.weather.forecast().subscribe(f => (this.forecast = f));
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }
}
```

## `src/pages/uv-index/uv-index.html`

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>
      UV Index
    </ion-title>

    <ion-buttons end>
      <button ion-button icon-only (click)="openUserPreferences()">
        <ion-icon name="settings"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content text-center padding>
  <kws-uv-index class="primary-value" [uvIndex]="uvIndex?.value"></kws-uv-index>
  <div class="description">
    {{advice[uvIndex?.riskLevel]}}
  </div>
</ion-content>
```

## `src/pages/uv-index/uv-index.ts`

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { UVIndex } from '../../models/uv-index';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-uv-index',
  templateUrl: 'uv-index.html'
})
export class UVIndexPage {
  uvIndex: UVIndex;

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
    private weather: WeatherProvider
  ) {}

  ionViewDidEnter() {
    this.weather.uvIndex().subscribe(i => (this.uvIndex = i));
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }
}
```

## `src/theme/variables.scss`

```scss
// Ionic Variables and Theming. For more info, please see:
// http://ionicframework.com/docs/theming/

// Font path is used to include ionicons,
// roboto, and noto sans fonts
$font-path: '../assets/fonts';

// The app direction is used to include
// rtl styles in your app. For more info, please see:
// http://ionicframework.com/docs/theming/rtl-support/
$app-direction: ltr;

@import 'ionic.globals';

// Shared Variables
// --------------------------------------------------
// To customize the look and feel of this app, you can override
// the Sass variables found in Ionic's source scss files.
// To view all the possible Ionic variables, see:
// http://ionicframework.com/docs/theming/overriding-ionic-variables/

// Named Color Variables
// --------------------------------------------------
// Named colors makes it easy to reuse colors on various components.
// It's highly recommended to change the default colors
// to match your app's branding. Ionic uses a Sass map of
// colors so you can add, rename and remove colors as needed.
// The "primary" color is the only required color in the map.

$colors: (
  primary: #085a9e,
  secondary: #f58e00,
  danger: #f53d3d,
  light: #f4f4f4,
  dark: #222
);

// App iOS Variables
// --------------------------------------------------
// iOS only Sass variables can go here

// App Material Design Variables
// --------------------------------------------------
// Material Design only Sass variables can go here

// App Windows Variables
// --------------------------------------------------
// Windows only Sass variables can go here

// App Theme
// --------------------------------------------------
// Ionic apps can have different themes applied, which can
// then be future customized. This import comes last
// so that the above variables are used and Ionic's
// default are overridden.

@import 'ionic.theme.default';

// Ionicons
// --------------------------------------------------
// The premium icon font for Ionic. For more info, please see:
// http://ionicframework.com/docs/ionicons/

@import 'ionic.ionicons';

// Fonts
// --------------------------------------------------

@import 'roboto';
@import 'noto-sans';
```