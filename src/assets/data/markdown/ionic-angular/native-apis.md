# Lab: Access Native APIs

There are serveral ways to access native functionality from your Ionic Framework application:
- Use a Capacitor API
- Use a Capacitor Plugin
- Use a Cordova Plugin
- Create a custom Capacitor plugin in your native project

We are going to cover the first of these options.

In this lab you will learn how to:

- Use the Capacitor APIs
- Create a non-HTTP service
- Use Promises and Observables
- Map a Promise to an Observable
- Use `flatMap` to "chain" observables
- Keep complex code clean

## Switch to Capacitor APIs

The App Component is currently using Cordova plugins and Ionic Native Community Edition wrappers in order to hide the splashscreen and configure the status bar. We should favor using Capacitor APIs when we can. Let's switch over to using the Capacitor APIs.

- <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen API</a>
- <a href="https://capacitorjs.com/docs/apis/status-bar" target="_blank">Status Bar API</a>

### Test First

The Capacitor APIs are defined on the `Plugin` object from `@capacitor/core` so we will need to import that.

```TypeScript
import { Plugins, StatusBarStyle } from '@capacitor/core';
```

We will use the `SplashScreen` and `StatusBar` API objects in our AppComponent, so we should create mocks for them in our test file. We should also remove the mocks for the existing `StatusBar` and `SplashScreen` services. When we are done, the test setup and teardown should look like this.

```TypeScript
  let originalSplashScreen: any;
  let originalStatusBar: any;
 
  beforeEach(async(() => {
    originalStatusBar = Plugins.StatusBar;
    originalSplashScreen = Plugins.SplashScreen;
    Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle']);
    Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Platform, useFactory: createPlatformMock }
      ]
    }).compileComponents();
  }));

  afterEach(() => {
    Plugins.StatusBar = originalStatusBar;
    Plugins.SplashScreen = originalSplashScreen;
  });
```

With Capacitor, we do not have to wait for the Cordova `platformReady` event, so we won't need the test for it. We also will no longer be calling the `StatusBar` and `SplashScreen` services

**Remove these tests:**

```TypeScript
  describe('initialization', () => {
    it('waits for the platform to be ready', () => {
      TestBed.createComponent(AppComponent);
      expect(platform.ready).toHaveBeenCalledTimes(1);
    });

    it('sets the default status bar style when ready', async () => {
      const statusBar = TestBed.inject(StatusBar);
      TestBed.createComponent(AppComponent);
      await platform.ready();
      expect(statusBar.styleDefault).toHaveBeenCalledTimes(1);
    });

    it('hides the splash screen when ready', async () => {
      const splashScreen = TestBed.inject(SplashScreen);
      TestBed.createComponent(AppComponent);
      await platform.ready();
      expect(splashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });
```

The behavior should be such that when the app is running in a hybrid mobile conext it dismisses the splash screen and styles the status bar. When it is not, then it does neither. The new `initialization` tests should look like this.


```TypeScript
  describe('initialization', () => {
    let platform: Platform;
    beforeEach(() => {
      platform = TestBed.inject(Platform);
    });

    describe('in a hybrid mobile context', () => {
      beforeEach(() => {
        (platform.is as any).withArgs('hybrid').and.returnValue(true);
      });

      it('styles the status bar', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledTimes(1);
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith({ style: StatusBarStyle.Dark });
      });

      it('hides the splash screen', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });
    });

    describe('in a web context', () => {
      beforeEach(() => {
        (platform.is as any).withArgs('hybrid').and.returnValue(false);
      });

      it('does not style the status bar', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
      });

      it('does not hide the splash screen', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      });
    });
  });
```

### Then Code 

**Challenge:** now that you have failing tests, modify the `AppComponent` such that the tests pass. The completed `AppComponent` is included at the bottom of this page if you get stuck, but try to complete the challenge without looking.

Your code will look something like this:

```typescript
  initializeApp() {
    if (this.platform.is('hybrid')) {
      // Do the things!
    }
  }
```

### Extra Credit: Android Status Bar Background Color

On Android, it is common with apps such as this to style the background of the status bar to be a color that is just slightly different from the color of the application's header. Since we are using `--ion-color-primary` for that, using `--ion-color-primary-shade` is a good option. Let's do that.

1. Add two `describe()` sections within the "in a hybrid mobile context" section. One for when we are running on Android and one for when we re not.
1. When we are running on Android, verify that `Plugin.StatusBar.setBackgroundColor` has been called once with `{ color: '#value'}` where `#value` is the value of `--ion-color-primary-shade`.
1. When we are not running on Android, verify that `Plugin.StatusBar.setBackgroundColor` has not been called.
1. When we are not running in a hybrid context at all, verify that `Plugin.StatusBar.setBackgroundColor` has not been called.

Once you have the tests in place, the one verifying the call of `setBackgroundColor()` should be failing. Write the code that makes it pass.

**Hints:**

- You will need to add `setBackgroundColor` to the `Plugins.StatusBar` mock where it is created.
- Links to the Capacitor API docs are above, use them to determine what needs to be passed to `setBackgroundColor()`.
- The Platform service's `is()` method is used to determine what platform you are running on.
- For the test, it would be best to control the value of `--ion-color-primary-shade`. Setting it to a known value in the test setup can be done via `document.documentElement.style.setProperty('--ion-color-primary-shade', ' #ff0000');` (the extra space simulates how the value commonly comes back due to formatting in the file that sets it, so it needs to be trimmed upon reading)
- Getting the vaule of `--ion-color-primary-shade` within the component code can be accomplished via code similar to the following snippet:

```JavaScript
const style = getComputedStyle(document.body);
console.log('primary shade', style.getPropertyValue('--ion-color-primary-shade').trim());
```

## Use Geolocation

Right now, the application gives us the weather for a specific location. It would be nice if it could let us know what the weather is for our current location. As it turns out, Capacitor includes a <a href="https://capacitorjs.com/docs/apis/geolocation" target="_blank">Geolocation API</a>.

### Use the Capacitor API 

#### Create the Coordinate Model

Add another model under `src/app/models` called `Coordinate`:

```TypeScript
export interface Coordinate {
  latitude: number;
  longitude: number;
}
```

**Hint:** Remember to add it to the models barrel file as well.

#### Create the Location Service

1. Using the CLI, generate a service called `location` in the `core/location` directory.
1. Add the stub for a single method that will get the current location.

```TypeScript
import { Injectable } from '@angular/core';

import { Coordinate } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor() {}

  current(): Promise<Coordinate> {
    return null;
  }
}
```

Let's write some tests and code.

##### Step 1: Call the Geolocation API

###### `location.service.spec.ts`

````TypeScript
...
import { Plugins } from '@capacitor/core';
...

  let originalGeolocation: any;
  let service: LocationService;

  beforeEach(() => {
    originalGeolocation = Plugins.Geolocation;
    Plugins.Geolocation = jasmine.createSpyObj('Geolocation', {
      getCurrentPosition: Promise.resolve({
        coords: { latitude: 42, longitude: 73 },
        timestamp: 19943002359
      })
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationService);
  });

  afterEach(() => {
    Plugins.Geolocation = originalGeolocation;
  });

  ...
  describe('current', ()=> {
    it('gets the current location using the Geolocation API', ()=>{
      service.current();
      expect(Plugins.Geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });
  });
  ...
});
````

###### `location.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

import { Coordinate } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor() {}

  current(): Promise<Coordinate> {
    const { Geolocation } = Plugins;
    Geolocation.getCurrentPosition();
    return null;
  }
}
```

##### Step 2: Return the Unpacked Value

###### `location.service.spec.ts`

```TypeScript
    it('resolves the coordinates', async () => {
      const c = await service.current();
      expect(c).toEqual({ latitude: 42, longitude: 73 });
    });
```

###### `location.service.ts`

```TypeScript
  async current(): Promise<Coordinate> {
    const { Geolocation } = Plugins;
    const { coords } = await Geolocation.getCurrentPosition();
    return { latitude: coords.latitude, longitude: coords.longitude };
  }
```

*Note:* you may ask why even create such a simple service? The answer is that the Geolocation API is an external dependency. As such, we may want to change it some day. For example, we may decide to create our own Capacitor Geolocation plugin and use it instead. Building our own abstraction over the API allows us to easily do this if we so choose. It is unlikely we will, but it is better to have the abstraction and not need it then to not have the abstraction, decide to swap out the Geolocation API, and then have to change a lot of extra code.

#### Use the Location Service

Now that the service exists, let's use it to get the current location before grabbing data. We will again use a test-first development strategy.

Our basic requirements are:

1. The location is obtained from the location service.
1. The location returned by the service is used in the HTTP call.
1. The value current weather is unpacked and returned.

##### Step 0 - Create and Use a Mock Location Service Factory

###### `src/app/core/location/location.service.mock.ts`

```TypeScript
import { LocationService } from './location.service';

export function createLocationServiceMock() {
  return jasmine.createSpyObj<LocationService>('LocationService', {
    current: Promise.resolve({ latitude: 0, longitude: 0 })
  });
}
```

###### `weather.service.spec.ts`

In the weather service test, provide the `LocationService` using the mock and set it up to return a latitude and longitude. Be sure to change the latitude and longitude constants to be different from what you currently have hard coded in the service. This will cause _a lot_ of tests to fail, which is good. **This will help ensure that you ultimatly are using the coordinates from your `LocationService`.**

```TypeScript
import { createLocationServiceMock } from '../location/location.service.mock';
import { LocationService } from '../location/location.service';
...
describe('WeatherService', () => {
  const latitude = 42.731338;
  const longitude = -88.314159;
...
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LocationService, useFactory: createLocationServiceMock }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WeatherService);
    const location = TestBed.inject(LocationService);
    (location.current as any).and.returnValue(
      Promise.resolve({ latitude, longitude })
    );
  });
```

##### Step 1 - Get the Current Location

###### `weather.service.spec.ts`

Add tests that verify that we are indeed getting the current location. Here is an example for the `WeatherService` `current()` method.  Be sure to also create similar tests for `forecast()` and `uvIndex()`.

```TypeScript
  describe('current', () => {
    it('gets the current location', () => {
      const locaction = TestBed.inject(LocationService);
      const service: WeatherService = TestBed.inject(WeatherService);
      service.current().subscribe();
      expect(locaction.current).toHaveBeenCalledTimes(1);
    });
    ...
  });
```

We are already have tests verifying the HTTP call and return value. These tests will need to be updated to use Angular's `fakeAsync()` zone and a `tick()` call so the location Promise gets resolved.

**Hint:** Here is the general pattern:

```TypeScript
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
...

    it('gets the data from the server', fakeAsync(() => {
      const service: SomeService = TestBed.inject(SomeService);
      service.someMethod().subscribe();
      tick();
      const req = httpTestingController.expectOne('some url');
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));
...
```


###### `weather.service.ts`

You should now have serveral failing tests. Getting the tests to pass is a matter of doing the following:

- Inject the `LocationService` in the `WeatherService`'s constructor.
- Call the `LocationService`'s `current()` method in the correct spot(s).
- Pass the location coordinates to the method that gets the data .

**Hint #1:** You will need to convert the output of the `LocationService` from a `Promise` to an `Observable` and then pipe in through the `flatMap` operator.

**Hint #2:** Recall this pattern from when we talked about combining Observables and Promises:

```TypeScript
function getSomeData (): Observable<ChildDataType> {
  return from(this.getParentData()).pipe(
    flatMap((data: DataType) =>
      this.getChildData(data)
    )
  );
}
```

You will need to perform similar code in your `WeatherService`. Where, exactly, depends on whether or not use did the **Extra Credit** when we created the service. If you did, then you only need to change one method. Otherwise, you may have to change three methods.

Once this is complete, you should be able to remove the following code from the `WeatherService`:

```TypeScript
  private latitude = 43.073051;
  private longitude = -89.40123;
```

## The AppComponent

Just in case you got stuck on the `AppComponent` refactoring, here is the `AppComponent` code:

```TypeScript
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    if (this.platform.is('hybrid')) {
      const { SplashScreen, StatusBar } = Plugins;
      SplashScreen.hide();
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
      if (this.platform.is('android')) {
        const style = getComputedStyle(document.body);
        StatusBar.setBackgroundColor({ color: style.getPropertyValue('--ion-color-primary-shade').trim() });
      }
    }
  }
}
```

## Conclusion

We have learned how to utilize Capacitor APIs in order to easily access native mobile APIs.

Build the application for a mobile device and give it a try.
