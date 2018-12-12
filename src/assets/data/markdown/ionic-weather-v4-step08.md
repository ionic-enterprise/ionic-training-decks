# Lab: Using Plugins

Cordova plugins are used when you want to access native functionality from your application.

In this lab you will learn how to:

* Install Cordova Plugins
* Use Ionic Native wrappers
* Create a non-HTTP service
* Use promises
* Use promises and observables together by mapping the promises to observables
* Use `flatMap` to essentially "chain" observables
* Keep complex code clean

## Geo-Location

Right now, the application gives us the weather for a specific location. It would be nice if it could let us know what the weather is for our current location.

If you check <a href="https://whatwebcando.today/" target="_blank">What Web Can Do Today</a>, you will see that geolocation is fully supported via the web APIs. In my experience, however, the performance is not always that great, so let's use a plugin to get our current location.

### Install the Plugin

The <a href="https://ionicframework.com/docs/native/geolocation/" target="_blank">Ionic Native wrapper page</a> is a good place to start any time you are installing a new plugin. Let's add this to our project.

* `ionic cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="To determine the location for which to get weather data"`
* `npm i @ionic-native/geolocation@beta`
* Add the plugin to the list of providers in your app module. Use either `StatusBar` or `SplashScreen` as your guide.
* Add the following configuration item to the `config.xml` file

```xml
    <config-file parent="NSLocationWhenInUseUsageDescription" platform="ios" target="*-Info.plist">
      <string>To determine the location for which to get weather data</string>
    </config-file>
```

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
  current(): Promise<Coordinate> {
    return this.geolocation.getCurrentPosition().then(loc => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    }));
  }
```

Ignoring the complete lack of error handling here, there is another issue. The `geolocation` plugin is only available if we are running on a device. This leaves us some options:

1. Let the app be broken on the web OR
1. Use a hard coded location when on the web OR
1. Use the web API call when on the web

The problem with the first option is that it makes your app hard to develop since the most convenient development option is to use the browser. The problem with the last option is that in my experience it tends to be very slow sometimes. Let's compromise and go with option number 2.

* Inject the Platform service
* Use the `Platform` service `is()` method to determine if the application is running in a "Cordova" environment
* Return a default location if it is not (use the value from `current-weather.page.ts`)

```TypeScript
  async current(): Promise<Coordinate> {
    const loc = this.platform.is('cordova')
      ? await this.geolocation.getCurrentPosition()
      : this.defaultLocation;
    return {
      longitude: loc.coords.longitude,
      latitude: loc.coords.latitude
    };
  }
```

#### Use the Location Service

Now that we have the service, let's use it to get the current location before grabbing data. This leaves us with a problem: competing paradigms for dealing with async code. This will be a lot easier if we can bring our Observable code into a Promise based world, or if we can bring our Promises into an Observable based world. The problem with the former is that it would result in having to rewrite all of our pages where we use this service. Therefore, we will do the latter.

First, let's create a private method in the `WeatherService` that gets the current location and creates an `Observable` from it.

```TypeScript
  private getCurrentLocation(): Observable<Coordinate> {
    return Observable.fromPromise(this.location.current());
  }
```

**Hint:** as you work through this, you may need to `import` more things at the top of your file as well as inject more things in different places.

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

1. take the original `current(): Observable<Weather>` method, change the signature to `private getCurrentWeather(latititude: number, longitude: number): Observable<Weather>` and change the code to use the passed `latitude` and `longitude` values
1. create a new `current(): Observable<Weather>` that gets the current location, and then uses `flatMap` to feed the location into `getCurrentWeather()` returning the latter observable.



```TypeScript
  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) =>
        this.getCurrentWeather(coord
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

## Conclusion 

We have learned how to utilize Cordova plugins and the Ionic Native wrappers in order to easily access native mobile APIs. Build the application for a mobile device and give it a try. 

**Challenge:** You may notice some slight delays when the application is run on the mobile device. Add a <a href="https://beta.ionicframework.com/docs/api/loading/">Loading Indicator</a> to each page. Here is the basic logic:

```TypeScript
async ionViewDidEnter() {
  const loading = await this.loadingController.create({ options });
  loading.present();
  this.weather.someMethod().subscribe(d => {
    this.someData = d;
    loading.dismiss();
  });
}
```

Have a look at the docs for the various options you can use.

**Challenge:** If you instrument the code you will see that the periodic delays that occur usually involve getting the location information. Change the location service to cache the location data to avoid this.
