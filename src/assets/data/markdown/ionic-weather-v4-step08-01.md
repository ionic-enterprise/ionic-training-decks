# Completed Code for Lab: Using the Data

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `app.module.ts`

```TypeScript
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## `current-weather.page.spec.ts`

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CurrentWeatherPage } from './current-weather.page';
import { createWeatherServiceMock } from '../services/weather/weather.service.mock';
import { WeatherService } from '../services/weather/weather.service';

describe('CurrentWeatherPage', () => {
  let component: CurrentWeatherPage;
  let fixture: ComponentFixture<CurrentWeatherPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentWeatherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('entering the page', () => {
    it('gets the current weather', () => {
      const weather =  TestBed.get(WeatherService);
      component.ionViewDidEnter();
      expect(weather.current).toHaveBeenCalledTimes(1);
    });

    it('assigns the current weather', () => {
      const weather =  TestBed.get(WeatherService);
      weather.current.and.returnValue(of({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      }));
      component.ionViewDidEnter();
      expect(component.currentWeather).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    });
  });
});
```

## `current-weather.page.ts`

```TypeScript
import { Component } from '@angular/core';

import { IconMapService } from '../services/icon-map/icon-map.service';
import { Weather } from '../models/weather';
import { WeatherService } from '../services/weather/weather.service';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss']
})
export class CurrentWeatherPage {
  currentWeather: Weather;

  constructor(
    public iconMap: IconMapService,
    private weather: WeatherService
  ) {}

  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
}
```

## Forecast and UV Index Pages

The code for the Forecast and UV Index pages and tests are similar to the Current Weather page.
