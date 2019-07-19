# Lab: User Preferences Phase 2

The user preferences will be stored on the device using the Ionic Storage module, which encapsulates several local storage options. In this lab, we will:

- Create a service to store and retrieve the data
- Create a subject that will emit when data changes
- Modify the user preferences dialog to store the data
- Modify the pages to respond to the user preference data changing

## Create a Data Service

This service will save and retrieve/cache the user preference data.

1. Using the CLI, create a service called `services/user-preferences/user-preferences`.
1. Using NPM, install the `@ionic/storage` package as a dependency of our application.
1. Add the `IonicStorageModule` to the list of `imports` in `app.module.ts` as per the <a href="https://github.com/ionic-team/ionic-storage" target="_blank">documentation on GitHub</a>.
1. Create methods to get and set the user preference data in the service that was just created.

### Test First

Here is the basic test set up.

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';

import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useFactory: createIonicStorageMock }]
    })
  );

  it('should be created', () => {
    const service: UserPreferencesService = TestBed.get(UserPreferencesService);
    expect(service).toBeTruthy();
  });

  describe('getUseCelcius', () => {
    // Test for each requirement will go here
  });

  describe('setUseCelcius', () => {
    // Test for each requirement will go here
  });
});

function createIonicStorageMock() {
  return jasmine.createSpyObj('Platform', {
    get: Promise.resolve(),
    set: Promise.resolve(),
    ready: Promise.resolve()
  });
}
```

### Then Code

I will provide the requirements one by one as tests.

1. Copy them one by one into the proper `describe` block.
1. Write the code that staisfies the requirement as you copy in each test.

**`getUseCelcius()`**

```TypeScript
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.getUseCelcius();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

```TypeScript
    it('gets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.getUseCelcius();
      expect(storage.get).toHaveBeenCalledTimes(1);
      expect(storage.get).toHaveBeenCalledWith('useCelcius');
    });
```

```TypeScript
    it('resolves the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
    });
```

```TypeScript
    it('caches the resolved useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(storage.get).toHaveBeenCalledTimes(1);
    });
```

**`setUseCelcius()`**

```TypeScript
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.setUseCelcius(false);
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

```TypeScript
    it('sets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setUseCelcius(false);
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('useCelcius', false);
    });
```

```TypeScript
    it('updates the cache value for useCelcius', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setUseCelcius(false);
      expect(await service.getUseCelcius()).toEqual(false);
      expect(storage.get).not.toHaveBeenCalled();
    });
```

When you are done your code should look similar to this:

```TypeScript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private keys = {
    useCelcius: 'useCelcius',
    city: 'city'
  };
  private useCelcius: boolean;

  constructor(private storage: Storage) {}

  async getUseCelcius(): Promise<boolean> {
    await this.storage.ready();
    if (this.useCelcius === undefined) {
      this.useCelcius = await this.storage.get(this.keys.useCelcius);
    }
    return this.useCelcius;
  }

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this.useCelcius = value;
    return this.storage.set(this.keys.useCelcius, value);
  }
}
```

**Challenge:** create similar tests and methods for the city.

## Refactor

At this point, it does not make much sense for the cities to be defined where they are. Furthermore, due to how the `ion-select-option` works with objects as values, we want to consistently return an object from the `cities` array. Let's do a couple of things:

1. move the `cities.ts` file in with the service (`mv src/app/user-preferences/cities.ts src/app/services/user-preferences/cities.ts`)
1. fix the path to the `City` model in the moved `cities.ts` file
1. fix the path to the `cities.ts` file in the `user-preferences.component.ts` file (this is a temporary fix)
1. add a method to the service that returns the available cities, call it `availableCities()` (remember to write a test)
1. makes two changes to the `getCity()` method
   1. if there is a city stored in user preferences, look up the city by name in the cities array
   1. if there is no city stored in user preferences, return the "Current Location" city (cities[0]).

### Changes to the Tests

We want to make sure we are getting the exact objects from the `cities` array. Our tests for `getCity()` probably look something like this:

```TypeScript
    it('resolves the city value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('city').and.returnValue(Promise.resolve(cities[1]));
      expect(await service.getCity()).toEqual(cities[1]);
    });
```

1. Change the mock setup to resolve a copy of the object
1. Change the `toEqual()` (which does a deep compare) to `toBe()` (which does a shallow compare)

```TypeScript
    it('resolves the city value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('city').and.returnValue(Promise.resolve({...cities[1]}));
      expect(await service.getCity()).toBe(cities[1]);
    });
```

That test should fail now.

We also need a test to exercise the new requirement that `cities[0]` is returned if there is no city currently stored.

```TypeScript
    it('resolves the first city if there is no stored value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      expect(await service.getCity()).toBe(cities[0]);
    });
```

### Changes to the Code

Here is what the code for `getCity()` should look like when you are done (try to do it without peaking first):

```TypeScript
  async getCity(): Promise<City> {
    await this.storage.ready();
    if (this.city === undefined) {
      const city = await this.storage.get(this.keys.city);
      this.city = cities.find(c => c.name === (city && city.name)) || cities[0];
    }
    return this._city;
  }
```

## Use the Service in the User Preferences Component

**Challenge:** this one is (almost) all on you (I will give you the tests), try to do it without looking at the completed code that is available in the repo. Here are the requirements:

1. When the view is created
   1. Initialize the `cities` property to all available cities
   1. Initialize the `city` property via the service
   1. Initialize the `useCelcius` property via the service
1. When the user saves the data
   1. Save the user preferences via the service
   1. Dismiss the modal once the save completes

Here is the mock for the service and the tests for the User Prerferences copmonent.

**`src/app/services/user-preferences/user-preferences.service.mock.ts`**

```TypeScript
import { cities } from './cities';

export function createUserPreferencesServiceMock() {
  return jasmine.createSpyObj('UserPreferencesService', {
    availableCities: cities,
    getUseCelcius: Promise.resolve(),
    setUseCelcius: Promise.resolve(),
    getCity: Promise.resolve(),
    setCity: Promise.resolve()
  });
}
```

**`src/app/user-preferences/user-preferences.component.spec.ts`**

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { createOverlayControllerMock } from '../../../test/mocks';
import { createUserPreferencesServiceMock } from '../services/user-preferences/user-preferences.service.mock';

import { UserPreferencesComponent } from './user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

describe('UserPreferencesPage', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserPreferencesComponent],
      providers: [
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('ModalController')
        },
        {
          provide: UserPreferencesService,
          useFactory: createUserPreferencesServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('on view create', async () => {
    it('gets all cities', async () => {
      const ups = TestBed.get(UserPreferencesService);
      await component.ngOnInit();
      expect(ups.availableCities).toHaveBeenCalledTimes(1);
      expect(component.cities).toEqual(ups.availableCities());
    });

    it('gets the use celcius setting', async () => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(true));
      await component.ngOnInit();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.useCelcius).toEqual(true);
    });

    it('gets the city', async () => {
      const ups = TestBed.get(UserPreferencesService);
      const cities = ups.availableCities();
      ups.getCity.and.returnValue(Promise.resolve(cities[2]));
      await component.ngOnInit();
      expect(ups.getCity).toHaveBeenCalledTimes(1);
      expect(component.city).toEqual(cities[2]);
    });
  });

  describe('dismiss', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('dismisses the modal', () => {
      const modalController = TestBed.get(ModalController);
      component.dismiss();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });

  describe('save', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('sets the city', async () => {
      component.city = component.cities[3];
      const ups = TestBed.get(UserPreferencesService);
      await component.save();
      expect(ups.setCity).toHaveBeenCalledTimes(1);
      expect(ups.setCity).toHaveBeenCalledWith(component.cities[3]);
    });

    it('sets the use celcius flag', async () => {
      component.useCelcius = true;
      const ups = TestBed.get(UserPreferencesService);
      await component.save();
      expect(ups.setUseCelcius).toHaveBeenCalledTimes(1);
      expect(ups.setUseCelcius).toHaveBeenCalledWith(true);
    });

    it('dismisses the modal', async () => {
      const modalController = TestBed.get(ModalController);
      await component.save();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Use the Service in the Base Class

### Add Tests

Our requirements are defined at the page level, specifically the Current Weather, Forecast, and UV Index pages. That is where we will add the tests.

1. Modify the tests for the all three main pages to provide the `UserPreferencesService` mock via the factory.
1. Modify the `beforeEach` test configuration on the same test files to configure `getCity()` to always resolve to a valid value. For example: `userPreferencesService.getCity.and.returnValue(Promise.resolve({ name: 'Unavailable' }));`
1. To the Current Weather and Forecast page, add tests that verifies that the scale is set to 'C' or 'F' depending on the value resolved by `getUseCelcius()`
1. To the Current Weather page, add a test that verifies that the `cityName` is set to the name of the city resolved by `getCity()`.

### Write the Code

In the `WeatherPageBase`:

1. Include the `UserPreferencesService` in the constructor
1. In each page, inject the `UserPreferencesService` and pass it down to the base class
1. Add `cityName` and `scale` properties (both strings)
1. Update the `ionViewDidEnter()` to get the data and set the properties

**Example:**

```TypeScript
  async ionViewDidEnter() {
    const l = await this.loadingController.create({
      message: 'Loading...'
    });
    l.present();
    this.cityName = (await this.userPreferences.getCity()).name;
    this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
    this.weather.current().subscribe(w => {
      this.data = w;
      l.dismiss();
    });
  }
```

### Update the Views

In the page views, bind the user preference data. Here is an example from the current weather page:

```html
<div class="information">
  <div class="city">{{cityName}}</div>
  <kws-temperature
    class="primary-value"
    [scale]="scale"
    temperature="{{currentWeather?.temperature}}"
  ></kws-temperature>
</div>
```

## Use the Service in the Weather Service

When getting the current location, the user preferences need to be taken into account. This will require a change to the tests. Here is a synoposis of what we will do:

1. Add a test that ensures that the user preferences for the city are read.
1. Move the existing 'for the current location' and 'gets the data from the server' into a `describe` that verifies the behavior when the user has selected "Current Location."
1. Add a set of tests that exercise when the user has selected a city.
1. Many test cases now need to await both the user preferences service and the location service.

Here are the new and modified tests for `current()`. Add similar tests for `forecast()` and `uvIndex()`:

```TypeScript
  describe('current', () => {
    it('gets the city specified by the user preferences', () => {
      const userPreferences = TestBed.get(UserPreferencesService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      expect(userPreferences.getCity).toHaveBeenCalledTimes(1);
    });

    describe('for the current location', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({ name: 'Current Location' })
        );
      });

      it('gets the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        expect(loc.current).toHaveBeenCalledTimes(1);
      }));

      it('gets the data from the server', fakeAsync(() => {
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/weather?lat=42.731338&lon=-88.314159&appid=${
            environment.appId
          }`
        );
        expect(req.request.method).toEqual('GET');
        httpTestingController.verify();
      }));
    });

    describe('with a selected city', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({
            name: 'Edmonton, AB',
            coordinate: { latitude: 53.544388, longitude: -113.490929 }
          })
        );
      });

      it('does not get the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        expect(loc.current).not.toHaveBeenCalled();
      }));

      it('gets the data from the server', fakeAsync(() => {
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/weather?lat=53.544388&lon=-113.490929&appid=${
            environment.appId
          }`
        );
        expect(req.request.method).toEqual('GET');
        httpTestingController.verify();
      }));
    });

    it('transforms the data', fakeAsync(() => {
      // This test does not change...
    });
  });
```

In order to make the tests pass:

1. inject the `UserPreferencesService`
1. modify the `getCurrentLocation()` function to check the city from user preferences and either return that city's location or use geo-location via `this.location.current()`

**Hints:**

1. You need to change the code inside of the `from()`
1. Promises can be chained
1. When promises are chained, the promise ultimately resolves to whatever is returned by the inner-most `then()` callback.

## Respond to Changes in the User Preferences

### Publishing the Change

In rxjs, the `Subject` is kind of like an Event Emitter. Set one up in the `UserPreferenceService`.

1. `import { Subject } from 'rxjs';`
1. create a public property on the class: `changed: Subject<void>;`
1. Instantiate a new `Subject` in the constructor

Often, you will emit a value. In this case, we just want to know what something changed so we will emit nothing. Here are the tests to add:

```TypeScript
 describe('setUseCelcius', () => {
    ...

    it('triggers changed', async () => {
      let changed = false;
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      service.changed.subscribe(() => changed = true);
      await service.setUseCelcius(false);
      expect(changed).toEqual(true);
    });
  });

  ...

  describe('setCity', () => {
    ...

    it('triggers changed', async () => {
      let changed = false;
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      service.changed.subscribe(() => changed = true);
      await service.setCity(cities[2]);
      expect(changed).toEqual(true);
    });
  });
```

Now add code to the `UserPreferencesService` that makes the tests pass. **Hint:** You need to call `this.changed.next();` after awaiting for the data to be set.

Be sure to update the mock factory to include a changed subject so we can use it in subsequent tests:

```TypeScript
import { cities } from './cities';
import { Subject } from 'rxjs';

export function createUserPreferencesServiceMock() {
  const mock = jasmine.createSpyObj('UserPreferencesService', {
    availableCities: cities,
    getUseCelcius: Promise.resolve(),
    setUseCelcius: Promise.resolve(),
    getCity: Promise.resolve(),
    setCity: Promise.resolve()
  });
  mock.changed = new Subject();
  return mock;
}
```

### Subscribing to the Change

When responding to a change in the user preferences, each of the main pages of the app needs to essentially redo all of the logic that is currently tested by the "entering the page" tests. This involves creating a similar set of tests for "when the user preferences change". Here is an example from the `CurrentWeatherPage` test:

```TypeScript
  describe('when the user preferences change', () => {
    it('displays a loading indicator', fakeAsync(() => {
      const loadingController = TestBed.get(LoadingController);
      const ups = TestBed.get(UserPreferencesService);
      ups.changed.next();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Checking the weather'
      });
      expect(loading.present).toHaveBeenCalledTimes(1);
    }));

    ...

  });
```

Complete the rest of the tests for when the user preferences change.

In order to make the tests pass, the base page should be changed as such:

- Since we will get data when the view enters and when the user preferences data changes, put that logic in a private method called `getData()`
- When the view loads, subscribe to the changed subject
- When the subject fires, get the data
- When the view unloads, remove the subscription

Try writing the code to satisfy the tests without peeking at the sample code for this lab.

## Conclusion

Our weather app now has a simple set of preferences and responds to changes to them.
