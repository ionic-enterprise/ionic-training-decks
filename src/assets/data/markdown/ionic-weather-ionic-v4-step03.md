# Lab: Generate Services and Copy the Code

There are a couple of differences between v3 and v4 when it comes to "services":

1. in v3, they were called "providers" and not "services"
1. in v3, they were usually specified in the `providers` in the `AppModule` whereas Angular 6 has a better way of doing this
1. for services that use RxJS, there are breaking changes in RxJS that you will need to deal with

A typical v3 "Provider" looks like this:

```TypeScript
import { Geolocation } from '@ionic-native/geolocation';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Location } from '../../models/location';

@Injectable()
export class LocationProvider {
  private defaultLocation: Location = {
    latitude: 43.073051,
    longitude: -89.40123
  };

  constructor(private geolocation: Geolocation, private platform: Platform) {}

  current(): Promise<Location> {
    if (this.platform.is('cordova')) {
      return this.geolocation.getCurrentPosition().then(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      }));
    } else {
      return Promise.resolve(this.defaultLocation);
    }
  }
}
```

An analogous service in v4 looks like this:

```TypeScript
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Location } from '../../models/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private defaultLocation: Location = {
    latitude: 43.073051,
    longitude: -89.40123
  };

  constructor(private geolocation: Geolocation, private platform: Platform) {}

  current(): Promise<Location> {
    if (this.platform.is('cordova')) {
      return this.geolocation.getCurrentPosition().then(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      }));
    } else {
      return Promise.resolve(this.defaultLocation);
    }
  }
}
```

Items to note:

* `@ionic-native/geolocation` -> `@ionic-native/geolocation/ngx`
* `ionic-angular` -> `@ionic/angular`
* the `@injectable` decorator has the `providedIn: 'root'` option so there is no need to add this to any `NgModule`
* `export class LocationProvider` -> `export class LocationService` (you could keep the `Provider` name, but I suggest changing it as you refactor, cleaning up code is always good)
* the code in the class is identical (in most cases)

I suggest the following workflow:

1. `ionic g service services/location/location` (or whatever the base name of the service is)
1. copy the `import` statements and fix any issues
1. copy the code inside the `class` and fix any issues

Let's do that for all of our v3 "Providers."

* recall that for `user-preferences` we had the cities defined in a `cities.ts` file, which can just be copied as-is
* the `weather` service is the only one that takes some significant changing
   * the paths to the dependent services need to change
   * the class names for the dependent services need to change in the imports and when injected via the constructor
   * `Observable.fromPromise()` is no longer a thing, you need to use `from` instead
      * import `from` from `rxjs`
      * where it is called, change `Observalbe.fromPromise` to `from` 