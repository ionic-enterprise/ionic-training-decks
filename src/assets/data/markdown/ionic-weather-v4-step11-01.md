# Completed Code for Lab: User Preferences Phase 1 

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `cities.ts`

```TypeScript
import { City } from '../models/city';

export let cities: Array<City> = [
  { name: 'Current Location' },
  {
    name: 'Chicago, IL',
    coordinate: { latitude: 41.878113, longitude: -87.629799 }
  },
  {
    name: 'Edmonton, AB',
    coordinate: { latitude: 53.544388, longitude: -113.490929 }
  },
  {
    name: 'London, UK',
    coordinate: { latitude: 51.507351, longitude: -0.127758 }
  },
  {
    name: 'Madison, WI',
    coordinate: { latitude: 43.073051, longitude: -89.40123 }
  },
  {
    name: 'Milwaukee, WI',
    coordinate: { latitude: 43.038902, longitude: -87.906471 }
  },
  {
    name: 'Orlando, FL',
    coordinate: { latitude: 28.538336, longitude: -81.379234 }
  },
  {
    name: 'Ottawa, ON',
    coordinate: { latitude: 45.42042, longitude: -75.69243 }
  }
];
```

## `user-preferences.component.html`

```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-buttons slot="primary">
      <ion-button (click)="dismiss()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title>User Preferences</ion-title>
  </ion-toolbar>
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
        <ion-select-option *ngFor="let city of cities" [value]="city">{{
          city.name
        }}</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-list>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button expand="block" color="secondary" (click)="save()"
      >Save</ion-button
    >
  </ion-toolbar>
</ion-footer>
```

## `user-preferences.component.spec.ts`

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { createOverlayControllerMock } from '../../../test/mocks';

import { UserPreferencesComponent } from './user-preferences.component';

describe('UserPreferencesPage', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserPreferencesComponent],
      providers: [
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('ModalController')
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dismiss', () => {
    it('dismisses the modal', () => {
      const modalController = TestBed.get(ModalController);
      component.dismiss();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

## `user-preferences.component.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { City } from '../models/city';
import { cities } from './cities';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  cities: Array<City> = cities;
  city: City = this.cities[0];
  useCelcius: boolean;

  constructor(private modal: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modal.dismiss();
  }

  save() {
    console.log('save', this.city, this.useCelcius);
    this.modal.dismiss();
  }
}
```

## `current-weather.page.spec.ts`

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';

import {
  createOverlayControllerMock,
  createOverlayElementMock
} from '../../../test/mocks';

import { CurrentWeatherPage } from './current-weather.page';
import { createWeatherServiceMock } from '../services/weather/weather.service.mock';
import { WeatherService } from '../services/weather/weather.service';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';

describe('CurrentWeatherPage', () => {
  let component: CurrentWeatherPage;
  let fixture: ComponentFixture<CurrentWeatherPage>;
  let loading;
  let modal;

  beforeEach(async(() => {
    loading = createOverlayElementMock('Loading');
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock },
        {
          provide: LoadingController,
          useFactory: () =>
            createOverlayControllerMock('LoadingController', loading)
        },
        {
          provide: ModalController,
          useFactory: () =>
            createOverlayControllerMock('ModalController', modal)
        }
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
    it('displays a loading indicator', async () => {
      const loadingController = TestBed.get(LoadingController);
      await component.ionViewDidEnter();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Checking the weather'
      });
      expect(loading.present).toHaveBeenCalledTimes(1);
    });

    it('gets the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      await component.ionViewDidEnter();
      expect(weather.current).toHaveBeenCalledTimes(1);
    });

    it('assigns the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      await component.ionViewDidEnter();
      expect(component.currentWeather).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    });

    it('dismisses a loading indicator', async () => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      await component.ionViewDidEnter();
      expect(loading.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('opening the user preferences dialog', () => {
    it('creates the modal', () => {
      const modalController = TestBed.get(ModalController);
      component.openUserPreferences();
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: UserPreferencesComponent
      });
    });

    it('presents the modal', async () => {
      await component.openUserPreferences();
      expect(modal.present).toHaveBeenCalledTimes(1);
    });
  });
});
```

## `current-weather.page.ts`

```TypeScript
import { Component } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';

import { IconMapService } from '../services/icon-map/icon-map.service';
import { Weather } from '../models/weather';
import { WeatherService } from '../services/weather/weather.service';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss']
})
export class CurrentWeatherPage {
  currentWeather: Weather;

  constructor(
    public iconMap: IconMapService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private weather: WeatherService
  ) {}

  async ionViewDidEnter() {
    const loading = await this.loadingController.create({
      message: 'Checking the weather'
    });
    loading.present();
    this.weather.current().subscribe(w => {
      this.currentWeather = w;
      loading.dismiss();
    });
  }

  async openUserPreferences(): Promise<void> {
    const modal = await this.modalController.create({
      component: UserPreferencesComponent
    });
    modal.present();
  }
}
```

The other pages were also modified in a similar manner to the Current Weather Page. Since the code is so similar, only the Current Weather Page code is provided here.