# Lab: Copy the Pages

Pages are just special components, so the process is the same

1. generate the page (if needed)
1. copy and fix the imports
1. copy and fix the code
1. copy and fix the HTML

In our case we do not need to generate any pages. They were generated with the starter and we renamed this.

Let's walk through one page in detail, and then do the other two independently. Note that we are not doing any styling yet, so do not be overly concerned if the pages look a little odd when displayed.

Let's start with `current-weather`. I will give you the starting and ending code, but I suggest that rather than grabbing the code straight from here, you copy it in from the v3 app and see if you can determine the modifications that need to be made.

## Copy and Fix the Imports

**Ionic v3 Version**

```TypeScript
import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { UserPreferencesComponent } from '../../components/user-preferences/user-preferences';
import { UserPreferencesProvider } from '../../providers/user-preferences/user-preferences';
import { Weather } from '../../models/weather';
import { WeatherProvider } from '../../providers/weather/weather';
```

**Ionic v4 Version**

```TypeScript
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { IconMapService } from '../services/icon-map/icon-map.service';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';
import { Weather } from '../models/weather';
import { WeatherService } from '../services/weather/weather.service';
```

Besides the usual renaming and path changes, notice that `IonicPage` no longer exists.

## Copy and Fix the Code

Here I suggest copying the properties first, then going method by method. A couple of interesting items are:

* `ionViewDidLoad()` becomes `ngOnInit()` which requires the class to implement `OnInit'
* `ionViewWillUnload()` becomes `ngOnDestroy()` which requires the class to implement `OnDestroy'
* both of those require additions to the imports that I did not include above
* check out the <a href="https://ionicframework.com/docs/api/modal" target="_blank">modal docs</a> for some interesting modifications to how they are presented

**Ionic v3 Version**

```TypeScript
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

**Ionic v4 Version**

```TypeScript
export class CurrentWeatherPage implements OnDestroy, OnInit {
  scale: string;
  cityName: string;
  currentWeather: Weather;

  private subscription: Subscription;

  constructor(
    public iconMap: IconMapService,
    private modal: ModalController,
    private userPreferences: UserPreferencesService,
    private weather: WeatherService
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

  async openUserPreferences() {
    const m = await this.modal.create({ component: UserPreferencesComponent });
    return await m.present();
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

## Copy and Fix the HTML

The linting tool will come in handy here again.

**Ionic v3 Version**

```HTML
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

**Ionic v4 Version**

```HTML
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Current Weather</ion-title>

    <ion-buttons slot="primary">
      <ion-button icon-only (click)="openUserPreferences()">
        <ion-icon name="settings"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content text-center padding>
  <div class="information">
    <ion-label class="city">{{cityName}}</ion-label>
    <kws-temperature class="primary-value" [scale]="scale" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
  <kws-condition [condition]="currentWeather?.condition" [iconPaths]="iconMap"></kws-condition>
</ion-content>
```

There were clearly some changes that were required, but nothing too big. As a challenge, do the other pages now following this process.