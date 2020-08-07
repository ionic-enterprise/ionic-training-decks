# Lab: Switch the Scale

Not all users measure temperature using the same scale. Let's allow the user to switch the scale by tapping or clicking on the temperature on the Current Weather page. Let's also save the user's current preference.

## Settings Service

First we need a service to store the data. This will be a very simple service that uses Capacitor's Storage API.

1. create a `src/util/settings.ts` file (initial contents are below)
1. create a `src/util/settings.test.ts` file (initial contents are below)
1. add an export of the `settings.ts` file in the `src/util/index.ts` file

Here is the shell of the service:

```TypeScript
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

class SettingsService {
  setScale(value: string): Promise<void> {}

  async getScale(): Promise<string> {}
}

export const settings = new SettingsService();
```

We will build up the code as we go. I will provide you with the tests and you will write the code that satisfies each test. Let's start with the shell for the test:

```typescript
import { settings } from './settings';
import { Plugins } from '@capacitor/core';

describe('settings service', () => {
  const { Storage } = Plugins;
  let value: string | undefined | null;
  beforeEach(() => {
    value = 'F';
    (Storage.get as any) = jest.fn(() => Promise.resolve({ value }));
    (Storage.set as any) = jest.fn(() => Promise.resolve());
  });

  afterEach(() => {
    (Storage.get as any).mockRestore();
    (Storage.set as any).mockRestore();
  });

  it('exists', () => {
    expect(settings).toBeTruthy();
  });

  describe('set scale', () => {
  });

  describe('get scale', () => {
  });
});
````

### Set Scale

Add the follow tests within the "set scale" `describe()` in `src/util/settings.test.ts`:

```typescript
    it('sets the value to C', () => {
      settings.setScale('C');
      expect(Storage.set).toHaveBeenCalledTimes(1);
      expect(Storage.set).toHaveBeenCalledWith({ key: 'scale', value: 'C' });
    });

    it('sets the value to F', () => {
      settings.setScale('F');
      expect(Storage.set).toHaveBeenCalledTimes(1);
      expect(Storage.set).toHaveBeenCalledWith({ key: 'scale', value: 'F' });
    });
```

You should have two failing tests at this point. If you do not, then restart the test server.

Now write the code required in `src/util/settings.ts` to make those tests pass.

### Get Scale

Add the follow tests within the "get scale" `describe()` in `src/util/settings.test.ts`:

```typescript
    it('gets the scale', async () => {
      await settings.getScale();
      expect(Storage.get).toHaveBeenCalledTimes(1);
      expect(Storage.get).toHaveBeenCalledWith({ key: 'scale' });
    });

    it.each([
      ['F', 'F'],
      ['C', 'C'],
      ['', 'F'],
      [undefined, 'F'],
      [null, 'F'],
    ])('returns the proper scale', async (scale, expected) => {
      value = scale
      const res = await settings.getScale();
      expect(res).toEqual(expected);
    });
  });
```

Now write the code required in `src/util/settings.ts` to make those tests pass. Note the last three test cases. The implication here is that the default scale is 'F' if it is otherwise unspecified.


## Change the Pages

Only two pages show the temperature: Current Weather and Forecast, so only two pages need to read the scale setting.

### Forecast

The changes for the `ForeccastPage` are pretty straight forward:

1. Import the `settings` service from `../util`: `import { settings, weather } from '../util';`
1. Create a state hook for the scale: `const [scale, setScale] = useState<string>();`
1. In the `useIonViewWillEnter()` callback, set the scale: `setScale(await settings.getScale());`
1. When rendering the page, use the scale from the state instead of the previously hard coded value: `<DailyForecast scale={scale} forecast={f}></DailyForecast>`


### Current Weather

The `CurrentWeatherPage` needs to do more work because it needs to also toggle the scale.

First, though, make very similar changes as to what we need for the `ForecastPage`:

1. Import the `settings` service along with the other ones: `import { iconPaths, settings, weather } from '../util';`
1. Create a state hook for the scale: `const [scale, setScale] = useState('F');`
1. In the `useIonViewWillEnter()` callback, set the scale: `setScale(await settings.getScale());`
1. When rendering the page, use the scale from the state: `<kws-temperature class="primary-value" scale={scale} temperature={temperature}></kws-temperature`

We want the user to be able to change the scale when they click on the temperature. Create a function that does that:

```TypeScript
  const toggleScale = () => {
    const newScale = scale === 'F' ? 'C' : 'F';
    settings.setScale(newScale);
    setScale(newScale);
  }
```

We also would like the cursor to change to a pointer when they are in the web so the user knows that they can click there. Create a style for that:

```TypeScript
  const cursorPointer = {
    cursor: 'pointer'
  };
```

Now all we have to do is bind the click event and the style when we render the page:

```HTML
          <kws-temperature
            class="primary-value"
            scale={scale}
            temperature={temperature}
            onClick={toggleScale}
            style={cursorPointer}
          ></kws-temperature>
```

## Conclusion

At this point you should be able to toggle the temperature scale used. Furthermore, once set the application should remember your choice and use it upon a restart. Build for your device and try it out.

Congratulations, your application is now complete.
