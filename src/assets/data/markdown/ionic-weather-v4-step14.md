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
1. Create a simple getter in the service. I have provided a skeleton of the tests that define the requirements.
   1. Write the tests for each requirement.
   1. Write the code that satisfies the tests.

```TypeScript
import { TestBed } from '@angular/core/testing';

import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { createPlatformMock } from '../../../../test/mocks';

import { NetworkService } from './network.service';

describe('NetworkService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Platform,
          useFactory: createPlatformMock
        },
        { provide: Network, useValue: { type: 'SneakerNet' } }
      ]
    })
  );

  it('should be created', () => {
    const service: NetworkService = TestBed.get(NetworkService);
    expect(service).toBeTruthy();
  });

  describe('onLine', () => {
    describe('in a device context', () => {
      beforeEach(() => {
        const plt = TestBed.get(Platform);
        plt.is.withArgs('cordova').and.returnValue(true);
      });

      it('is false if the network type is unknown', () => {
      });

      it('is false if the network type is none', () => {
      });

      it('is true if the network type is something other than "unknown" or "none"', () => {
      });
    });

    describe('in a web context', () => {
      beforeEach(() => {
        const plt = TestBed.get(Platform);
        plt.is.withArgs('cordova').and.returnValue(false);
      });

      it('returns the navigator.onLine value', () => {
      });
    });
  });
});
```

## Update the Pages

### Code Changes

In each of the pages (`current-weather`, `forecast`, and `uv-index`), provide the `NetworkService` like this:

```TypeScript
{ provide: NetworkService, useValue: { onLine: true }},
```

This will allow the current tests to continue to work as-is.

Next, add some tests that define the requirements for off-line handling. Here is an example from `current-weather.page.spec.ts`. This block is nested within the "entering the page" `describe()`:

```TypeScript
    describe('when off line', () => {
      beforeEach(() => {
        const net = TestBed.get(NetworkService);
        net.onLine = false;
      });

      it('does not get the weather data', async () => {
        const weather = TestBed.get(WeatherService);
        await component.ionViewDidEnter();
        expect(weather.current).not.toHaveBeenCalled();
      });

      it('gets the user selected city', async () => {
        const ups = TestBed.get(UserPreferencesService);
        ups.getCity.and.returnValue(Promise.resolve({ name: 'Mad City' }));
        await component.ionViewDidEnter();
        expect(ups.getCity).toHaveBeenCalledTimes(1);
        expect(component.cityName).toEqual('Mad City');
      });

      it('sets the scale to "C" if we are to use celcius', async () => {
        const ups = TestBed.get(UserPreferencesService);
        ups.getUseCelcius.and.returnValue(Promise.resolve(true));
        await component.ionViewDidEnter();
        expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
        expect(component.scale).toEqual('C');
      });

      it('sets the scale to "F" if we are not to use celcius', async () => {
        const ups = TestBed.get(UserPreferencesService);
        ups.getUseCelcius.and.returnValue(Promise.resolve(false));
        await component.ionViewDidEnter();
        expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
        expect(component.scale).toEqual('F');
      });
    });
```

Create similar tests within the "when the user preferences change" `describe()`.

**Note:** when adding the same tests to the `forecast` and `uv-index` pages, they do not have the same requirements as it applies to the setting of the `cityName` and `scale` properties in that `forecast` only requires `scale` and `uv-index` requires neither.

Six tests should now be failing. Specifically, the six tests that specify that data is not fetched. Write the code required to satisfy all of the requirements defined by the tests.

**Hint:** the code is in `weather-page-base.ts`

### View Markup Changes

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

**Note:** depending on how the `NetworkService` was defined in `weather-page-base.ts` it may need to be made `public` at this point.

## Conclusion

Test the application in your browser and on your device. Turn off the network and verify that the application continues to work, even though it may not display any data. Verify that the warning message is displayed after navigating while the network is off and is hidden when navigating while the network is on.
