# Lab: Simple Offline Handling

This application relies heavily on being online. If data cannot be obtained, the application is of little use, but the application should still do _something_. Currently, it just freezes up trying to get data.

There are many ways to handle this scenario, including full "offline first" strategies that store the data using a local database and then sync the data with the server once online. Since that could be a full course of work on its own, for this application will we take a more simple approach. It can always be expanded upon in the future if needed.

For this application, we will:

* Create a service to determine if the device is online or offline
* Modify the pages to only get data if the device is online
* Modify the pages to display a warning if the device is offline

## Determine the Network Status

If the application is running on a device, we will use the <a href="https://ionicframework.com/docs/native/network/" target="_blank">Network Status</a> plugin to determine the status. If the `type` is false or `unknown` or `none`, then the application will assume it is offline. If the `type` is anything else, the application will assume it is online.

If the application is running in a web-hosted scenario, `navigator.onLine` will be used to determine the online status.

### Install and Configure the Plugin

1. `ionic cordova plugin add cordova-plugin-network-information`
1. `npm i @ionic-native/network`
1. Modify `app.module.ts` to provide the service for the plugin

### Create a Network Service

1. `ionic g service services/network/network`
1. Create a simple getter in the service. The whole service is listed below.

```TypeScript
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  constructor(private network: Network, private platform: Platform) {}

  get onLine(): boolean {
    return this.platform.is('cordova')
      ? !!this.network.type &&
      this.network.type.toLowerCase() !== 'unknown' &&
      this.network.type.toLowerCase() !== 'none'
      : navigator.onLine;
  }
}
```

## Update the Pages

For the purposes of this application, it will be sufficient modify the screens such that if the device is offline they will not fetch the data and they will warn the user that the data (if it exists) may be stale.

### `weather-page-base.ts`

The change to not get the data if the device is offline is done in the base class. Note that the `NetworkService` is declared `public` as it is needed in the HTML.

```TypeScript
...
import { NetworkService } from '../services/network/network.service';
...

export class WeatherPageBase<T> implements OnDestroy, OnInit {

  ...

  constructor(
    private loading: LoadingController,
    private modal: ModalController,
    private userPreferences: UserPreferencesService,
    private fetch: () => Observable<T>,
    public network: NetworkService
  ) {}

  ...

  private async getData() {
    if (this.network.onLine) {
      const l = await this.loading.create({
        message: 'Loading...'
      });
      l.present();
      this.cityName = (await this.userPreferences.getCity()).name;
      this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
      this.weather.current().subscribe(w => {
        this.currentWeather = w;
        l.dismiss();
      });
    }
  }
}
```

### Page Changes

Here is an example of the page changes from the Current Weather page:

#### `current-weather.page.html`

```HTML
<ion-header>
  ...
</ion-header>

<ion-content padding text-center>
  <div *ngIf="!network.onLine">Warning: network is offline, data may be stale</div>
  ...
</ion-content>
```

#### `current-weather.page.ts`

```TypeScript
```

Update the other two pages in a similar fashion.

## Conclusion

Test the application in your browser and on your device. Turn off the network and verify that the application continues to work, even though it may not display any data. Verify that the warning message is displayed after navigating while the network is off and is hidden when navigating while the network is on.
