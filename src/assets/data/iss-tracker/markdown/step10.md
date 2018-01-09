# Add a Configuration Page

## Overview

For the final step, we will add a simple configuration page. We will have two options:

1. show passes for - show the passes for a specific address rather than getting the current location
1. refresh rate - how often to refresh the map view, in seconds

## Details

We will:

1. add the [App Preferences](https://ionicframework.com/docs/native/app-preferences/) plug-in
1. create a provider for our configuration items
1. create a page

### Adding the Plugin

First we need to install the plugin:

```bash
$ ionic cordova plugin add cordova-plugin-app-preferences
$ npm install --save @ionic-native/app-preferences
```

The plugin will add an app-settings.json file. We do not need this file and can remove it. We should probably also add this file to our `.gitignore` file so we do not accidentally commit it at some point in the future.

Then we need to update the app's main module to make the plugin available.

```ts
...

import { AppPreferences } from '@ionic-native/app-preferences';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

...

@NgModule({

...

  providers: [
    AppPreferences,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    IssTrackingDataProvider,
    LocationProvider,
    StatusBar,
    SplashScreen
  ]
})
export class AppModule {}
```

Basically, just look at how we are already including the `StatusBar` plugin and follow the same pattern.

### Creating the Provider

The configuration data is abstracted into a provider. This allows us to handle all of the logic associated with the data in a centralized manner. This includes using local storage when we are on the web, and the app preferences plugin when we are on a device.

```bash
$ ionic g provider configuration
```

Here is the code for the provider. Have a look at the `isNative()` method which uses the [platform](https://ionicframework.com/docs/api/platform/Platform/) service to determine if we are running natively on a device or via the web.


```ts
import { AppPreferences } from '@ionic-native/app-preferences';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Position } from '../../models/position';

@Injectable()
export class ConfigurationProvider {
  private _address: string;
  private _position: Position;
  private _refreshRate: number;
  private _useCurrentLocation: boolean;
  private _promise: Promise<void>;

  private _addressKey = 'address';
  private _positionKey = 'position';
  private _refreshRateKey = 'refreshRate';
  private _useCurrentLocationKey = 'useCurrentLocation';

  constructor(
    private platform: Platform,
    private preferences: AppPreferences
  ) {}

  init(): Promise<void> {
    if (!this._promise) {
      this._promise = this.loadData();
    }
    return this._promise;
  }

  set address(value: string) {
    this._address = value;
    this.store(this._addressKey, value);
  }

  get address(): string {
    return this._address;
  }

  set position(value: Position) {
    this._position = value;
    this.store(this._positionKey, value);
  }

  get position(): Position {
    return this._position;
  }

  set refreshRate(value: number) {
    this._refreshRate = value;
    this.store(this._refreshRateKey, value);
  }

  get refreshRate(): number {
    return this._refreshRate || 15;
  }

  set useCurrentLocation(value: boolean) {
    this._useCurrentLocation = value;
    this.store(this._useCurrentLocationKey, value);
  }

  get useCurrentLocation(): boolean {
    return this._useCurrentLocation === false ? false : true;
  }

  private isNative(): boolean {
    return this.platform.is('cordova');
  }

  private async loadData(): Promise<void> {
    await this.platform.ready();
    if (this.isNative()) {
      await this.loadFromAppPreferences();
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromAppPreferences(): Promise<void> {
    return Promise.all([
      this.preferences
        .fetch(undefined, this._addressKey)
        .then(x => (this._address = x)),
      this.preferences
        .fetch(undefined, this._positionKey)
        .then(x => (this._position = x)),
      this.preferences
        .fetch(undefined, this._refreshRateKey)
        .then(x => (this._refreshRate = x)),
      this.preferences
        .fetch(undefined, this._useCurrentLocationKey)
        .then(x => (this._useCurrentLocation = x))
    ]).then(() => null);
  }

  private loadFromLocalStorage(): void {
    const posStr = localStorage.getItem(this._positionKey);
    this._address = localStorage.getItem(this._addressKey);
    if (posStr) {
      this._position = JSON.parse(posStr);
    }
    this._refreshRate =
      parseInt(localStorage.getItem(this._refreshRateKey)) || 15;
    this._useCurrentLocation =
      localStorage.getItem(this._useCurrentLocationKey) === 'false'
        ? false
        : true;
  }

  private async store(key: string, value: any) {
    await this.platform.ready();
    if (this.isNative()) {
      await this.preferences.store(undefined, this._positionKey, value);
    } else {
      localStorage.setItem(
        key,
        key === this._positionKey
          ? value && JSON.stringify(value)
          : value && value.toString()
      );
    }
  }
}

```

Make sure the provider was added to your `app.module.ts` file.

### Adding the Page

Now we can add the configuration page itself.

```bash
$ ionic g page configuration
```

The generator assumes we are using lazy loading, which we are not. This means that we need to manually add the page to our `app.modules.ts` file. This also means that we can remove the `ionicPage` decorator from the generated code and remove the module that was generated for the page. You could also leave those items there, but I like all of my pages to be consistent in general structure, so I remove them. They will need to be added for all pages if we ever switch to lazy loading.

We need another tab in order to display the configuration page:

**tabs.ts**
```ts
import { AstronautsPage } from '../astronauts/astronauts'; 
import { ConfigurationPage } from '../configuration/configuration'; 
import { MapPage } from '../map/map'; 
import { PassesPage } from '../passes/passes'; 
...
  tab1Root = MapPage; 
  tab2Root = PassesPage; 
  tab3Root = AstronautsPage; 
  tab4Root = ConfigurationPage; 
```

**tabs.html**
```html
  <ion-tab [root]="tab1Root" tabTitle="Maps" tabIcon="locate"></ion-tab> 
  <ion-tab [root]="tab2Root" tabTitle="Passes" tabIcon="list"></ion-tab> 
  <ion-tab [root]="tab3Root" tabTitle="Astronauts" tabIcon="people"></ion-tab> 
  <ion-tab [root]="tab4Root" tabTitle="Configuration" tabIcon="options"></ion-tab> 
```

We should now be able to navigate to our page so let's update it to deal with the configuration of our application.

The markup for our configuration page is straightforward.

```html
<ion-header> 
  <ion-navbar> 
    <ion-title>Configuration</ion-title> 
  </ion-navbar> 
</ion-header> 
 
<ion-content> 
  <ion-list> 
    <ion-item> 
      <ion-label floating>Refresh Map (Seconds)</ion-label> 
      <ion-input type="number" [(ngModel)]="refreshRate"></ion-input> 
    </ion-item> 
 
    <ion-item> 
      <ion-label floating>Address</ion-label> 
      <ion-textarea [(ngModel)]="address" (change)="addressChanged()"></ion-textarea> 
    </ion-item> 
 
    <ion-item> 
      <ion-label>Use Current Location</ion-label> 
      <ion-toggle [(ngModel)]="useLocation"></ion-toggle> 
    </ion-item> 
  </ion-list> 
</ion-content> 
```

In code, we need to read the configuration data upon entry and save it upon exit. I have put the code that saves the address changes in its own method called on a `(change)` event such that we only geo-code the address when we need to rather than with every visit.

```ts
import { Component } from '@angular/core';

import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { LocationProvider } from '../../providers/location/location';

@Component({
  selector: 'page-configuration',
  templateUrl: 'configuration.html'
})
export class ConfigurationPage {
  private originalAddress: string;

  address: string;
  refreshRate: string;
  useLocation: boolean;

  constructor(
    private configuration: ConfigurationProvider,
    private location: LocationProvider
  ) {}

  ionViewDidEnter() {
    this.address = this.configuration.address;
    this.refreshRate =
      this.configuration.refreshRate &&
      this.configuration.refreshRate.toString();
    this.useLocation = this.configuration.useCurrentLocation;
    this.originalAddress = this.address;
  }

  addressChanged(): void {
    (async () => {
      this.configuration.address = this.address;
      this.configuration.position = await this.location.position(this.address);
    })();
  }

  ionViewWillLeave() {
    this.configuration.refreshRate =
      this.refreshRate && parseInt(this.refreshRate);
    this.configuration.useCurrentLocation = this.useLocation;
  }
}
```

We also need to add a `position` method to the `location` service in order to geocode a position from an address string:

```ts
  position(address: string): Promise<Position> { 
    return new Promise(resolve => { 
      this.geocoder.geocode({ address: address }, (results, status) => { 
        if (status === 'OK' && results[0]) { 
          resolve({ 
            latitude: results[0].geometry.location.lat(), 
            longitude: results[0].geometry.location.lng() 
          }); 
        } else { 
          resolve(this.defaultPosition); 
        } 
      }); 
    }); 
  } 
```

**Note:** we currently have a private property called `position`. Use your editor's refactoring tools to rename that property to `_currentPosition` first.

### Using the Configuration

Now we just need to update the map page and the passes page to respect the configuration. Only the important bits of these changes are included here. See the diffs for this step's commit if you get stuck on the surrounding changes.

In the map page, rather than having a hard-coded refresh rate, we use the one from the configuration. Remember to inject the configuration provider.


```ts
  async ionViewDidEnter() { 
    this.showLocation(); 
    await this.configuration.init(); 
    this.interval = setInterval( 
      this.showLocation.bind(this), 
      this.configuration.refreshRate * 1000 
    ); 
  } 
```

For the passes page, we do not have to change the component at all. Rather, we need to modify the `location` provider to provide the correct position based on the configuration.

```ts
  async currentPosition(): Promise<Position> { 
    await this.configuration.init(); 
    if (this.configuration.useCurrentLocation && 'geolocation' in navigator) { 
      return await this.getCurrentPosition(); 
    } else { 
      return this.configuration.position || this.defaultPosition; 
    } 
  } 
 
  private getCurrentPosition(): Promise<Position> { 
    return new Promise(resolve => { 
      navigator.geolocation.getCurrentPosition(p => { 
        if (p.coords) { 
          this._currentPosition.latitude = p.coords.latitude; 
          this._currentPosition.longitude = p.coords.longitude; 
        } 
        resolve(this._currentPosition); 
      }); 
    }); 
  } 
```
