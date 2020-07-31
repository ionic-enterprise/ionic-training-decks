# Lab: Switch the Scale

The user may prefer the see the temperature in Celcius rather than Fahrenheit. We will allow them to toggle this by tapping on the temperature on the first page. The user preferences will be stored on the device using the Ionic Storage module, which encapsulates several local storage options. In this lab, we will:

- Create a service to store and retrieve the data
- Modify the current weather page to toggle the data
- Modify the weather page base to read the current scale preference

## Create a Data Service

This service will save and retrieve/cache the user preference data.

1. Using the CLI, create a service called `services/user-preferences/user-preferences`.
1. Using NPM, install the `@ionic/storage` package as a dependency of our application.
1. Add the `IonicStorageModule` to the list of `imports` in `app.module.ts` as per the <a href="https://github.com/ionic-team/ionic-storage" target="_blank">documentation on GitHub</a>.
1. Create methods to get and set the user preference data in the service that was just created.

### Test Setup

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
    const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
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
  return jasmine.createSpyObj<Storage>('Storage', {
    get: Promise.resolve(),
    set: Promise.resolve(),
    ready: Promise.resolve(null)
  });
}
```

### Write a Test Then Add Code

I will provide the requirements one by one as tests.

1. Copy them one by one into the proper `describe` block.
1. Write the code that staisfies the requirement as you copy in each test.

If you get stuck, sample code is included in the "Conclusion" section.

**`getUseCelcius()`**

Requirement 1: Wait for storage to be ready.

```TypeScript
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      service.getUseCelcius();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

Requirement 2a: Get the value from storage.

```TypeScript
    it('gets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      await service.getUseCelcius();
      expect(storage.get).toHaveBeenCalledTimes(1);
      expect(storage.get).toHaveBeenCalledWith('useCelcius');
    });
```

Requirement 2b: Return the resolved the value from storage

```TypeScript
    it('resolves the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      (storage.get as any).withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
    });
```

Requirement 3: Cache the resolved value

```TypeScript
    it('caches the resolved useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      (storage.get as any).withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(storage.get).toHaveBeenCalledTimes(1);
    });
```

**`setUseCelcius()`**

Requirement 1: Wait for storage to be ready.

```TypeScript
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      service.setUseCelcius(false);
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

Requirement 2: Set the value in storage.

```TypeScript
    it('sets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      await service.setUseCelcius(false);
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('useCelcius', false);
    });
```

Requirement 3: Update the cached value.

```TypeScript
    it('updates the cache value for useCelcius', async () => {
      const service: UserPreferencesService = TestBed.inject(
        UserPreferencesService
      );
      const storage = TestBed.inject(Storage);
      await service.setUseCelcius(false);
      expect(await service.getUseCelcius()).toEqual(false);
      expect(storage.get).not.toHaveBeenCalled();
    });
```

## Use the Service

At this point you have two choices:

1. Add the `UserPreferencesService` to the base class
1. Add the `UserPreferencesService` only to the Current Weather and Forecast pages

The argument for the former is that User Preferences could be expanded in the future to include items that are applicable to all pages. The argument for the latter would be that while that is true, it is not _currently_ true.

We will write the tests as if we are only adding the service to the pages that actually need it. How you actually code it is an implementation detail that is left up to you.

### Add Tests

Our requirements are defined at the page level, specifically the Current Weather and Forecast pages. That is where we will add the tests.

1. Create a mock factory for the `UserPreferencesService`.
1. Modify the tests for the Current Weather and Forecast pages to provide the `UserPreferencesService` mock via the factory.
1. Add tests that verifies that a property named "scale" is set to 'C' or 'F' when entering the page, depending on the value resolved by `getUseCelcius()`

### Write the Code

Implementation details depend upon you. If you get stuck, you can have a look at the <a href="https://github.com/ionic-team/ionic-weather-starter/commit/55e0cd585b521f4871cb0d3bc59a4ba31eaf7a9d" target="_blank">"step(eleven)" commit</a> in the `training/stepByStep` branch of the training starter repo to see how I implemented this.

### Update the Views

In the page views, bind the user preference data. Here is an example from the current weather page:

```html
<div class="information">
  <kws-temperature
    class="primary-value"
    [scale]="scale"
    temperature="{{currentWeather?.temperature}}"
  ></kws-temperature>
</div>
```

## Toggle the Scale

Add the following tests to the `current-weather.page.spec.ts`, then write code to satisfy those tests.

```TypeScript
  describe('toggling the scale', () => {
    it('toggles from "C" to "F"', () => {
      component.scale = 'C';
      component.toggleScale();
      expect(component.scale).toEqual('F');
    });

    it('sets the preference false when toggling from "C" to "F"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'C';
      component.toggleScale();
      expect(userPreferences.setUseCelcius).toHaveBeenCalledTimes(1);
      expect(userPreferences.setUseCelcius).toHaveBeenCalledWith(false);
    });

    it('toggles from "F" to "C"', () => {
      component.scale = 'F';
      component.toggleScale();
      expect(component.scale).toEqual('C');
    });

    it('sets the preference true when toggling from "F" to "C"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'F';
      component.toggleScale();
      expect(userPreferences.setUseCelcius).toHaveBeenCalledTimes(1);
      expect(userPreferences.setUseCelcius).toHaveBeenCalledWith(true);
    });
  });
```

Once the code is written, add a `click` event binding to the `kws-temperature` component that calls the `toggleScale()` method.

_Note:_ the cursor isn't right if you are running in the browser. For a hybrid native app, this doesn't really matter, but we should fix it anyhow just in case we decide to also host this app on the web. To fix this, add the following CSS to the `current-weather.page.scss` file.

```css
kws-temperature {
  cursor: pointer;
}
```

## Conclusion

Our weather app now allows the user to choose whichever temperature scale the desire and remembers their choice.

In the process, you created the start of a User Preferences service. The code for that probably looks similar to this:

```TypeScript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private keys = {
    useCelcius: 'useCelcius'
  };
  private cache: Map<string, any>;

  constructor(private storage: Storage) {
    this.cache = new Map();
  }

  async getUseCelcius(): Promise<boolean> {
    await this.storage.ready();
    if (!this.cache.has(this.keys.useCelcius)) {
      this.cache.set(this.keys.useCelcius, await this.storage.get(this.keys.useCelcius));
    }
    return this.cache.get(this.keys.useCelcius);
  }

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    await this.storage.set(this.keys.useCelcius, value);
    this.cache.set(this.keys.useCelcius, value);
  }
}
```

_Note:_ this is not the most discoverable of features in the app, and we may want other preferences in the future, but this is a start even if the UI is not actually "best practice" for the UX.
