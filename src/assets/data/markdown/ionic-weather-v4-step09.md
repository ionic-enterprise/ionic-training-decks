# Lab: Using Plugins

Cordova plugins are used when you want to access native functionality from your application.

In this lab you will learn how to:

- Install Cordova Plugins
- Use Ionic Native wrappers
- Create a non-HTTP service
- Use promises
- Use promises and observables together by mapping the promises to observables
- Use `flatMap` to essentially "chain" observables
- Keep complex code clean

## Geo-Location

Right now, the application gives us the weather for a specific location. It would be nice if it could let us know what the weather is for our current location. Checking the <a href="https://ionicframework.com/docs/native/" target="_blank">Ionic Native</a> project page we see that a plugin and Ionic Native wrapper exists for geolocation.

### Install the Plugin

The <a href="https://ionicframework.com/docs/native/geolocation/" target="_blank">Ionic Native wrapper page</a> is a good place to start any time you are installing a new plugin. Let's add this to our project.

- `ionic cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="To determine the location for which to get weather data"`
- `npm i @ionic-native/geolocation@beta`
- Add the plugin to the list of providers in the `AppModule`. Use either `StatusBar` or `SplashScreen` as your guide.
- Add the following configuration item to the `config.xml` file

```xml
    <config-file parent="NSLocationWhenInUseUsageDescription" platform="ios" target="*-Info.plist">
      <string>To determine the location for which to get weather data</string>
    </config-file>
```

The `config.xml` file change is required in order to modify the `info.plist` file that is generated via a Cordova build for iOS. This is something that Apple requires you to specify if you are going to use Geolocation.

### Use the Plugin

#### Create the Coordinate Model

Add another model called `Coordinate`

```TypeScript
export interface Coordinate {
  latitude: number;
  longitude: number;
}
```

**Hint:** add it in the model folder in its own file.

#### Create the Location Service

Generate a service that will be used to get the current location. Specify the name as `services/location/location` in the CLI command. Once that service is generated, add a single method that will get the current location.

Let's add a `current()` method to the `LocationProvider`:

```TypeScript
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Coordinate } from '../../models/coordinate';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private geolocation: Geolocation) { }

  current(): Promise<Coordinate> {
    return this.geolocation.getCurrentPosition().then(loc => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    }));
  }
}
```

Ignoring the complete lack of error handling here, there is another issue. The `geolocation` plugin is only available if we are running on a device. This leaves us some options:

1. Let the app be broken on the web OR
1. Use a hard coded location when on the web OR
1. Use the web API call when on the web

Our goal at this time is to be able to continue to use `ionic serve` during the development of our application. Option #1 would not allow that. Options #2 and #3 do allow that, with option #2 being far more simple, so let's go with that option.

- Inject the Platform service
- Use the `Platform` service `is()` method to determine if the application is running in a "cordova" environment
- Return a default location if it is not (`weather.service.ts` is currently using default latitude and longitude values, those would make a good default here as well)

```TypeScript
  private defaultPosition = {
    coords: {
      latitude: 43.073051,
      longitude: -89.40123
    }
  };

...

  async current(): Promise<Coordinate> {
    const loc = this.platform.is('cordova')
      ? await this.geolocation.getCurrentPosition()
      : this.defaultPosition;
    return {
      longitude: loc.coords.longitude,
      latitude: loc.coords.latitude
    };
  }
```

#### Use the Location Service

Now that the service exists, let's use it to get the current location before grabbing data. This leaves us with a problem: competing paradigms for dealing with async code. This will be a lot easier if we can bring our Observable code into a Promise based world, or if we can bring our Promises into an Observable based world. The problem with the former is that it would result in having to rewrite all of our pages where we use this service. Therefore, we will do the latter.

First, let's create a private method in the `WeatherService` that gets the current location and creates an `Observable`.

```TypeScript
  private getCurrentLocation(): Observable<Coordinate> {
    return from(this.location.current());
  }
```

**Hint:** as you work through this, you may need to `import` more things at the top of your file as well as inject more things in different places.

* `from` is part of `rxjs` and needs to be imported
* `Coordinate` was just created by us and needs to be imported
* `location` is the `LocationService` that was just created, and that needs to be imported and injected

We can use the rxjs `flatMap` operator to combine this observable with the other one, returning just the output of the other observable.

We _could_ accomplish this by just wrapping the exsting code in the callback for `flatMap`, like this:

```TypeScript
  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate ) => {
        return this.http
          .get(
            `${this.baseUrl}/weather?lat=${coord.latitude}&lon=${
              coord.longitude
            }&appid=${this.appId}`
          )
          .pipe(map((res: any) => this.unpackWeather(res)));
      })
    );
  }
```

But I find that messy because there are two different levels of abstraction being used. We can mitigate that issue by abstracting the part that gets the weather into its own private method. In reality, what we are doing is:

1. take the original `current(): Observable<Weather>` method, change the signature to `private getCurrentWeather(coord: Coordinate): Observable<Weather>` and change the code to use the `latitude` and `longitude` from the `coord`
1. create a new `current(): Observable<Weather>` that gets the current location, and then uses `flatMap` to feed the location into `getCurrentWeather()` returning the latter observable.

```TypeScript
  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) =>
        this.getCurrentWeather(coord)
      )
    );
  }

  private getCurrentWeather(coord: Coordinate): Observable<Weather> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${this.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }
```

**Challenge:** rewrite the other two public methods to also get the current location before returning the weather data related observables.

Once this rewrite is complete, you should be able to remove the following code from the `WeatherService`:

```TypeScript
  private latitude = 43.073051;
  private longitude = -89.40123;
```

## Conclusion

We have learned how to utilize Cordova plugins and the Ionic Native wrappers in order to easily access native mobile APIs.

Build the application for a mobile device and give it a try.

**Challenge:** You may notice some slight delays when the application is run on the mobile device. Add a <a href="https://beta.ionicframework.com/docs/api/loading/" target="_blank">Loading Indicator</a> to each page. Here is the basic logic (where `loading` is the injected `LoadingController`):

```TypeScript
async ionViewDidEnter() {
  const l = await this.loading.create({ options });
  l.present();
  this.weather.someMethod().subscribe(d => {
    this.someData = d;
    l.dismiss();
  });
}
```

Have a look at the docs for the various options you can use.

**Challenge:** If you instrument the code you will see that the periodic delays that occur usually involve getting the location information. Change the location service to cache the location data to avoid this.
