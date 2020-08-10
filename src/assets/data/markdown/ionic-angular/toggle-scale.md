# Lab: Switch the Scale

The user may prefer the see the temperature in Celcius rather than Fahrenheit. We will allow them to toggle this by tapping on the temperature on the first page. The user preferences will be stored on the device using the Capacitor Storage API. In this lab, we will:

- Create a service to store and retrieve the data
- Modify the current weather page to toggle the data
- Modify the weather page base to read the current scale preference

## Create a Data Service

This service will save and retrieve/cache the user preference data.

Using the CLI, create a service called `services/user-preferences/user-preferences`. Type `ionic generate --help` if you need some help with how to do this.

### Test Setup

Here is the basic test set up (`user-preferences.service.spec.ts`).

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';

import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  let value: string | undefined | null;
  let originalStorage: any;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    originalStorage = Plugins.Storage; 
    Plugins.Storage = jasmine.createSpyObj('Storage', {
      get: Promise.resolve({ value }),
      set: Promise.resolve()
    });
  });

  afterEach(() => {
    Plugins.Storage = originalStorage;
  });

  it('should be created', () => {
    const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
    expect(service).toBeTruthy();
  });

  describe('setScale', () => {
    // Test for each requirement will go here
  });

  describe('getScale', () => {
    // Test for each requirement will go here
  });
});
```

Create some stubs in the service code as well (`user-preferences.service.ts`).

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  constructor() {}

  async setScale(value: string): Promise<void> {
  }

  async getScale(): Promise<string> {
    return 'F';
  }
}
```

### Write a Test Then Add Code

I will provide the requirements one by one as tests.

1. Copy them one by one into the proper `describe` block.
1. Write the code that staisfies the requirement as you copy in each test.

If you get stuck at all, be sure to have a look at the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API Documentation</a>.

**`setScale()`**

```typescript
    ['F', 'C'].forEach(value => {
      it(`sets the value to ${value}`, () => {
        const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
        service.setScale(value);
        expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
        expect(Plugins.Storage.set).toHaveBeenCalledWith({ key: 'scale', value });
      });
    });
```

You should have two failing tests at this point. If you do not, then restart the test server.

Now write the code required in `src/app/user-preferences/user-preferences.service.ts` to make those tests pass.

**`getScale()`**

Requirement 1: Get the value from storage

```TypeScript
    it('gets the scale', async () => {
      const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
      await service.getScale();
      expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'scale' });
    });
```

Now write the code required in `src/app/user-preferences/user-preferences.service.ts` to make that tests pass.

Requirement 2: Return the value

```TypeScript
    ['F', 'C'].forEach(value => {
      it(`gets the scale: ${value}`, async () => {
        const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
        (Plugins.Storage.get as any).and.returnValue(Promise.resolve({ value }));
        const res = await service.getScale();
        expect(res).toEqual(value);
      });
    });
```

Requirement 3: Defaults to 'F'

```TypeScript
    ['', null, undefined].forEach(value => {
      it(`gets the scale: ${value}`, async () => {
        const service: UserPreferencesService = TestBed.inject(UserPreferencesService);
        (Plugins.Storage.get as any).and.returnValue(Promise.resolve({ value }));
        const res = await service.getScale();
        expect(res).toEqual('F');
      });
    });
```

## Use the Service

At this point you have two choices:

1. Add the `UserPreferencesService` to the base class
1. Add the `UserPreferencesService` only to the Current Weather and Forecast pages

The argument for the former is that User Preferences could be expanded in the future to include items that are applicable to all pages. The argument for the latter would be that while that is true, it is not _currently_ true.

We will do the latter and only modify the Current Weather and Forecast pages.


### Initialize the Scale

Our requirements are defined at the page level, specifically the Current Weather and Forecast pages. That is where we will add the tests.

1. Create a mock factory for the `UserPreferencesService`. This factory should live in the same folder as the service. We have done this for other services, so follow that same pattern for this fatcory as well.
1. Be sure to update the appropriate barrel files.
1. Modify the tests for the Current Weather and Forecast pages to provide the `UserPreferencesService` mock via the factory.
1. Add tests that verify that a property named "scale" is set to 'C' or 'F' when entering the page, depending on the value resolved by `getScale()`
1. Write the code to satify the test(s)

**Hint:** you will use the `ionViewDidEnter()` lifecycle event

**Hint:** since `ionViewDidEnter()` exists in the base class, you will also have to call `super.ionViewDidEnter();` from the page's `ionViewDidEnter()`.


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

    it('sets the preference to "F" when toggling from "C" to "F"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'C';
      component.toggleScale();
      expect(userPreferences.setScale).toHaveBeenCalledTimes(1);
      expect(userPreferences.setScale).toHaveBeenCalledWith('F');
    });

    it('toggles from "F" to "C"', () => {
      component.scale = 'F';
      component.toggleScale();
      expect(component.scale).toEqual('C');
    });

    it('sets the preference to "C" when toggling from "F" to "C"', () => {
      const userPreferences = TestBed.inject(UserPreferencesService);
      component.scale = 'F';
      component.toggleScale();
      expect(userPreferences.setScale).toHaveBeenCalledTimes(1);
      expect(userPreferences.setScale).toHaveBeenCalledWith('C');
    });
  });
```

Once the code is written, add a `click` event binding to the `kws-temperature` component that calls the `toggleScale()` method.

```html
    <kws-temperature
      class="primary-value"
      [scale]="scale"
      temperature="{{data?.temperature}}"
      (click)="toggleScale()"
    ></kws-temperature>
```

*Note:* the cursor isn't right if you are running in the browser. For a hybrid native app, this doesn't really matter, but we should fix it anyhow just in case we decide to also host this app on the web. To fix this, add the following CSS to the `current-weather.page.scss` file.

```css
kws-temperature {
  cursor: pointer;
}
```

## Conclusion

Our weather app now allows the user to choose whichever temperature scale the desire and remembers their choice.

*Note:* this is not the most discoverable of features in the app, and we may want other preferences in the future, but this is a start even if the UI is not actually "best practice" for the UX.
