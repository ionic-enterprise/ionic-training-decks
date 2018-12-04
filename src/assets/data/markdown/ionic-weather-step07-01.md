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

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IconMapProvider } from '../providers/icon-map/icon-map';
import { WeatherProvider } from '../providers/weather/weather';

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
    StatusBar,
    SplashScreen,
    IonicErrorHandler,
    { provide: ErrorHandler, useClass: MyErrorHandler },
    IconMapProvider,
    WeatherProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

## Current Weather Page

Your `src/pages/current-weather/current-weather.ts` should current look something like this:

```TypeScript
import { Component } from '@angular/core';

import { IconMapProvider } from '../../providers/icon-map/icon-map';
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
    private weather: WeatherProvider
  ) {}

  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
}
```

Your `src/pages/forecast/forecast.ts should` look something like this:

```TypeScript
import { Component } from '@angular/core';

import { Forecast } from '../../models/forecast';
import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { WeatherProvider } from '../../providers/weather/weather';

@Component({
  selector: 'page-forecast',
  templateUrl: 'forecast.html'
})
export class ForecastPage {
  forecast: Forecast;

  constructor(
    public iconMap: IconMapProvider,
    private weather: WeatherProvider
  ) {}

  ionViewDidEnter() {
    this.weather.forecast().subscribe(f => (this.forecast = f));
  }
}
```

Your `src/pages/uv-index/uv-index.ts should` look something like this:

```TypeScript
import { Component } from '@angular/core';

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

  constructor(private weather: WeatherProvider) {}

  ionViewDidEnter() {
    this.weather.uvIndex().subscribe(i => (this.uvIndex = i));
  }
}
```

No other code should have needed to be changed in this lab unless bugs were found with code from previous steps.