# Lab: Using Plugins

Cordova plugins are used when you want to access native functionality from your application.

In this lab you will learn how to:

* use the status bar plugin
* use the platform service
* create a non-HTTP service
* use promises
* use promises and observables together by mapping the promises to observables
* use `flatMap` to essentially "chain" observables
* keep complex code clean

## Status Bar

The application is currently using some corodova plugings. You just don't have to interact with them much, yet.

**app.component.ts**

In the AppComponent constructor, the application waits for the platform to be ready and then interacts with the status bar and the 

```TypeScript
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
```

**Challenge:** The application has a fairly dark background, which makes the status bar content difficult to read on iOS devices. Have a look at the documentation for the <a href="" target="_blank">Status Bar Plugin</a> and see if you can find a method to call that will fix that. Then implement it in the code.

**Hint:** This method will replace the `statusBar.styleDefault();` call in the code listed above. 


**Challenge:** Android has <a href="https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-statusbar/#android-quirks" target="_blank">some quirks</a>. Modify the code to deal with this by setting the background color to `#06487F`, but only for Android.

**Hint:** use Ionic's <a href="https://ionicframework.com/docs/api/platform/Platform/" target="_blank">Platform</a> service to determine if the current platform is Android or not.

Commit these changes directly to `master` and push them to Ionic Pro so you can see the changes on your device.


## Geo-Location

Right now, the application gives us the weather for a specific location. It would be nice if it could let us know what the weather is for our current location.

If you check <a href="https://whatwebcando.today/" target="_blank">What Web Can Do Today</a>, you will see that geolocation is fully supported via the web APIs. In my experience, however, the performance is not always that great, so let's use a plugin to get our current location.

### Install the Plugin

The <a href="https://ionicframework.com/docs/native/geolocation/" target="_blank">Ionic Native wrapper page</a> is a good place to start any time you are installing a new plugin. Let's add this to our project.

* create a feature branch
* `ionic cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="To determine the location for which to get weather data"`
* `npm i @ionic-native/geolocation`
* <a href="https://ionicframework.com/docs/native/#Add_Plugins_to_Your_App_Module" target="_blank">add the plugin to your app module</a> (note that the instructions are generic, modify for your needs)

### Use the Plugin

#### Create the Location Service

Generate a service ("provider") that will be used to get the current location. Specify the name as `location` in the CLI command. Once that service is generated, add a single method that will get the current location.

Before updating the service, add another model called `Location`

```TypeScript
export interface Location {
  latitude: number;
  longitude: number;
}
```

**Hint:** add it in the model folder in its own file

Let's add a `current()` method to the `LocationProvider`:

```TypeScript
  current(): Promise<Location> {
    return this.geolocation.getCurrentPosition().then(loc => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    }));
  }
```

Ignoring the complete lack of error handling here, there is another issue. The `geolocation` plugin is only available if we are running on a device. This leaves us some options:

1. let the app be broken on the web OR
1. use a hard coded location when on the web OR
1. use the web API call when on the web

The problem with the first option is that it makes your app hard to develop since the most convenient development option is to use the browser. The problem with the last option is that in my experience it tends to be very slow sometimes. Let's compromise and go with option number 2.

```TypeScript
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
```

#### Use the Location Service

Now that we have the service, let's use it to get the current location before grabbing data. This leaves us with a problem: competing paradigms for dealing with async code. This will be a lot easier if we can bring our Observable code into a Promise based world, or if we can bring our Promises into an Observable based world. The problem with the former is that it would result in having to rewrite all of our pages where we use this service. Therefore, we will do the latter.

First, let's create a private method in the `WeatherProvider` that gets the current location and creates an `Observable` from it.

```TypeScript
  private getCurrentLocation(): Observable<Location> {
    return Observable.fromPromise(this.location.current());
  }
```

**Hint:** as you work through this, you may need to `import` more things at the top of your file.

We can use the rxjs `flatMap` operator to combine this observable with the other one, returning just the output of the other observable.

We _could_ accomplish this by just wrapping the exsting code in the callback for `flatMap`, like this:

```TypeScript
  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((loc: Location) => {
        return this.http
          .get(
            `${this.baseUrl}/weather?lat=${loc.latitude}&lon=${
              loc.longitude
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
      flatMap((loc: Location) =>
        this.getCurrentWeather(loc.latitude, loc.longitude)
      )
    );
  }

  private getCurrentWeather(
    latitude: number,
    longitude: number
  ): Observable<Weather> {
    return this.http
      .get(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${
          this.appId
        }`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }
```

**Challenge:** rewrite the other two public methods to also get the current location before returning the weather data related observables.

## Finish the Feature

When your code is complete and you have tested it both on the web and by side-loading the application on your device, perform the usual squashing and merging and push your changes to both the `origin` and `ionic` repos.

**Note:** in the real world, you would need to resubmit your app to the app store at this point and not deploy it via Ionic Pro because adding a Cordova Plugin is a change that effects the binary bundle of the application.