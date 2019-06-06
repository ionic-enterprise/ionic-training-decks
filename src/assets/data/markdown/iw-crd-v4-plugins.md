# Lab: Using Plugins

Cordova plugins are used when you want to access native functionality from your application.

In this lab you will learn how to:

- Install Cordova Plugins
- Use Ionic Native wrappers
- Create a non-HTTP service
- Use Promises and Observables
- Map a Promise to an Observable
- Use `flatMap` to "chain" observables
- Keep complex code clean

## Use Geolocation

Right now, the application gives us the weather for a specific location. It would be nice if it could let us know what the weather is for our current location. Checking the <a href="https://ionicframework.com/docs/native/" target="_blank">Ionic Native</a> project page, we see that a plugin and Ionic Native wrapper exists for geolocation.

### Install the Plugin

Since we are using both the Cordova Geolocation plugin and the Ionic Native wrapper for it, be sure to consult the <a href="https://ionicframework.com/docs/native/geolocation/" target="_blank">Ionic Native wrapper page</a> for any specific instructions.

Here is a synopsis of the instructions:

- `ionic cordova plugin add cordova-plugin-geolocation`
- `npm i @ionic-native/geolocation`
- Add the Ionic Native Wrapper service to the list of providers in the `AppModule`. Use either `StatusBar` or `SplashScreen` as your guide.
- Add the following configuration item to the `config.xml` file as a direct descendant of the `widget` node.

```xml
    <config-file parent="NSLocationWhenInUseUsageDescription" platform="ios" target="*-Info.plist">
      <string>To determine the location for which to get weather data</string>
    </config-file>
```

The `config.xml` file change is required in order to modify the `info.plist` file that is generated via a Cordova build for iOS. This is something that Apple requires you to specify if you are going to use Geolocation.

### Use the Cordova Plugin

#### Create the Coordinate Model

Add another model called `Coordinate`:

```TypeScript
export interface Coordinate {
  latitude: number;
  longitude: number;
}
```

**Hint:** Add it in the model folder in its own file.

#### Create the Location Service

1. Using the CLI, generate a service called `location` in the `services/location` directory.
1. Add the stub for a single method that will get the current location.

```TypeScript
import { Injectable } from '@angular/core';

import { Coordinate } from '../../models/coordinate';

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

Let's consider what the `current()` method should do. This application will run in two contexts:

1. **Cordova:** In this context, the application is installed on a device. Thus Cordova and the native functionality being bridged by the plugin is available.
1. **Web:** In this context the application is being run in a web browser. This is the context used when a developer is running the application using the development server. Neither Cordova nor the native functionality are available in this context.

With that in mind, here is what the method should do:

1. When running in a "Cordova" context, use the Geolocation plugin to return the current location.
1. When running in a "web" context, use the hard-coded default location.

We will build this method one step at a time, testing first and then coding.

##### Step 1: Check the Platform

**`location.service.spec.ts`**

```TypeScript
...
import { Platform } from '@ionic/angular';

import { createPlatformMock } from '../../../../test/mocks'

  ...

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useFactory: createPlatformMock }]
    });
  });

  ...

  describe('current', () => {
    it('determines if the appliction is hybrid native or not', () => {
      const platform = TestBed.get(Platform);
      const service: LocationService = TestBed.get(LocationService);
      service.current();
      expect(platform.is).toHaveBeenCalledTimes(1);
      expect(platform.is).toHaveBeenCalledWith('cordova');
    });
  });  
```

**`location.service.ts`**

```TypeScript
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Coordinate } from '../../models/coordinate';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private platform: Platform) {}

  current(): Promise<Coordinate> {
    this.platform.is('cordova');
    return null;
  }
}
```

##### Step 2: If Hybrid Mobile Call Plugin 

**`location.service.spec.ts`**

````TypeScript
...
import { Geolocation } from '@ionic-native/geolocation/ngx';

  ...
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: createPlatformMock },
        {
          provide: Geolocation,
          useFactory: () =>
            jasmine.createSpyObj('Geolocation', {
              getCurrentPosition: Promise.resolve({
                coords: { latitude: 42, longitude: 73 }
              })
            })
        }
      ]
    })
  );

  ...
   describe('current', () => {
     ...
    describe('when hybrid mobile', () => {
      beforeEach(() => {
        const platform = TestBed.get(Platform);
        platform.is.withArgs('cordova').and.returnValue(true);
      });

      it('calls the gelocation plugin', () => {
        const geolocation = TestBed.get(Geolocation);
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      });
    });
  }); 
  ...
````

**`location.service.ts`**

```TypeScript
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation  } from '@ionic-native/geolocation/ngx';

import { Coordinate } from '../../models/coordinate';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private geolocation: Geolocation, private platform: Platform) {}

  current(): Promise<Coordinate> {
    this.platform.is('cordova');
    this.geolocation.getCurrentPosition();
    return null;
  }
}
```

##### Step 3: If Hybrid Mobile Return the Unpacked Value from the Plugin Call

**`location.service.spec.ts`**

```TypeScript
      it('resolves the unpacked position', async () => {
        const service: LocationService = TestBed.get(LocationService);
        expect(await service.current()).toEqual({
          latitude: 42,
          longitude: 73
        });
      });
```

**`location.service.ts`**

```TypeScript
  async current(): Promise<Coordinate> {
    this.platform.is('cordova');
    const { coords } = await this.geolocation.getCurrentPosition();
    return { latitude: coords.latitude, longitude: coords.longitude };
  }
```

##### Step 4: If not Hybrid Mobile do not Call the Plugin

**`location.service.spec.ts`**

```TypeScript
    describe('when not hybrid mobile', () => {
      it('does not call the gelocation plugin', () => {
        const geolocation = TestBed.get(Geolocation);
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });
    });
```

**`location.service.ts`**

```TypeScript
  async current(): Promise<Coordinate> {
    const { coords } = this.platform.is('cordova')
      ? await this.geolocation.getCurrentPosition()
      : { coords: { latitude: 0, longitude: 0 } };
    return { latitude: coords.latitude, longitude: coords.longitude }
  }
```

##### Step 5: If not Hybrid Mobile Return Default Location

**`location.service.spec.ts`**

```TypeScript
    describe('when not hybrid mobile', () => {
      ...
      it('resolves the default position', async () => {
        const service: LocationService = TestBed.get(LocationService);
        expect(await service.current()).toEqual({
          latitude: 43.073051,
          longitude: -89.40123
        });
      });
    });
```

**`location.service.ts`**

```TypeScript
  async current(): Promise<Coordinate> {
    const pos = this.platform.is('cordova')
      ? await this.geolocation.getCurrentPosition()
      : {
          coords: {
            latitude: 43.073051,
            longitude: -89.40123
          }
        };
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }
```

Now that we have developed a fully tested method, we can clean it up a bit. We should really define the default location using a private constant defined on the class rather than a literal value in the method. Refactor the code as such.

Let's pause here and discuss what we have done.

#### Use the Location Service

Now that the service exists, let's use it to get the current location before grabbing data. We will again use a test-first development strategy.

Our basic requirements are:

1. The location is obtained from the location service.
1. The location returned by the service is used in the HTTP call.
1. The value current weather is unpacked and returned.

##### Step 0 - Create and Use a Mock Location Service Factory

**`src/app/services/location/location.service.mock.ts`**

```TypeScript
export function createLocationServiceMock() {
  return jasmine.createSpyObj('LocationService', {
    current: Promise.resolve()
  });
}
```

**`weather.service.spec.ts`**

```TypeScript
import { createLocationServiceMock } from '../location/location.service.mock';
import { LocationService } from '../location/location.service';
...
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LocationService, useFactory: createLocationServiceMock }
      ]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    const loc = TestBed.get(LocationService);
    loc.current.and.returnValue(
      Promise.resolve({ latitude: 42.731338, longitude: -88.314159 })
    );
  });
```

##### Step 1 - Get the Current Location

**`weather.service.spec.ts`**

```TypeScript
  describe('current', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });
    ...
  });
```

**`weather.service.ts`**

Getting the above test to pass is a matter of injecting the service and calling the `current()` method in the correct spot. Doing so is left as an exercise for you to complete. **Note:** we do not need to do anything with the result at this time. We just need to get the test to pass.

##### Step 2 - Use the Current Location

**`weather.service.spec.ts`**

We are already have tests verifying the HTTP call and return. Update thost tests to ensure that the returned location is used in the HTTP call.

This requires two changes to the tests:

1. Use Angular's `fakeAsync()` zone and a `tick()` call so the location Promise gets resolved.
1. Modify the values used for the `lat` and `lon` parameters in the URL.

Updating the tests accordingly is left as an exercise for you.

**Hint:** Here is the general pattern:

```TypeScript
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
...

    it('gets the data from the server', fakeAsync(() => {
      const service: SomeService = TestBed.get(SomeService);
      service.someMethod().subscribe();
      tick();
      const req = httpTestingController.expectOne('some url');
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));
...
```

**`weather.service.ts`**

Make the changes to the `WeatherService`'s `current()` method to make those tests pass.

**Hint:** Recall this pattern from when we talked about combining Observables and Promises:

```TypeScript
function getSomeData (): Observable<ChildDataType> {
  return from(this.getParentData()).pipe(
    flatMap((data: DataType) =>
      this.getChildData(data)
    )
  );
}
```

##### Step 3 - Refactor for Single Responsibility

Updating the code to work in the quickest, dirtiest way results in code something like this:

```TypeScript
  current(): Observable<Weather> {
    return from(this.location.current()).pipe(
      flatMap((coord: Coordinate) =>
        this.http
          .get(
            `${environment.baseUrl}/weather?lat=${coord.latitude}&lon=${
              coord.longitude
            }&appid=${environment.appId}`
          )
          .pipe(map(res => this.unpackWeather(res)))
      )
    );
  }
```

I find that messy because the method is responsible for knowing how to do multiple things. We can mitigate through some refactoring, made safer by the existence of our tests:

1. Abstract the Promise -> Observable logic into `private getCurrentLocation(): Observable<Coorodinate>` method
1. Abstract the HTTP call logic into `private getCurrentWeather(): Observable<Weather>` method

When complete, the `current()` method should look like this:

```TypeScript
  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) => this.getCurrentWeather(coord)));
  }
```

Now it only has one responsibility, chaining the other two methods.

**Challenge:** Rewrite the other two public methods to also get the current location before returning the weather data related observables.

Once this rewrite is complete, you should be able to remove the following code from the `WeatherService`:

```TypeScript
  private latitude = 43.073051;
  private longitude = -89.40123;
```

## Conclusion

We have learned how to utilize Cordova plugins and the Ionic Native wrappers in order to easily access native mobile APIs.

Build the application for a mobile device and give it a try.

<!-- TODO: Consider moving this into its own section on overlays... -->

**Challenge:** You may notice some slight delays when the application is run on the mobile device. Add a <a href="https://ionicframework.com/docs/api/loading/" target="_blank">Loading Indicator</a> to each page. Here is the basic logic (where `loading` is the injected `LoadingController`):

```TypeScript
async ionViewDidEnter() {
  const l = await this.loadingController.create({ options });
  l.present();
  this.weather.someMethod().subscribe(d => {
    this.someData = d;
    l.dismiss();
  });
}
```

Have a look at the docs for the various options you can use. Make similar changes to all three of the pages.

**Hints on Testing**

The LoadingController follows a pattern that is common in Ionic for type of components called "overlays." We will learn more about these later. The mock package that is supplied with this project contains two mocks we can use to test any overlay component: `createOverlayControllerMock()` which mocks the controller and `createOverlayElementMock()` which mocks the element created by the overlay controller. 

The mocks can be set up like such:

```TypeScript
  let loading;
  ...
  beforeEach(async(() => {
    loading = createOverlayElementMock('Loading');
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock },
        {
          provide: LoadingController,
          useFactory: () =>
            createOverlayControllerMock('LoadingController', loading)
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));
```

The test tests should look something like this. Note that the two existing tests are change to use `async/await`:

```TypeScript
  describe('entering the page', () => {
    it('displays a loading indicator', async () => {
      const loadingController = TestBed.get(LoadingController);
      await component.ionViewDidEnter();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
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

    it('dismisses the loading indicator', async () => {
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
```