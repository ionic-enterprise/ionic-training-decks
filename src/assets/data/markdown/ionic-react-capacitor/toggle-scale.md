# Lab: Switch the Scale

Not all users measure temperature using the same scale. Let's allow the user to switch the scale by tapping or clicking on the temperature on the Current Weather page. Let's also save the user's current preference.

## Settings Service

First we need a service to store the data. This will be a very simple service that uses Capacitor's Storage API. Create a `util/settings.ts` file. Be sure to add it to the `util/index.ts` file as well.

```TypeScript
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

class SettingsService {
  setScale(value: string): Promise<void> {
    return Storage.set({ key: 'scale', value });
  }

  async getScale(): Promise<string> {
    const data = await Storage.get({ key: 'scale' });
    return data.value || 'F';
  }
}

export const settings = new SettingsService();
```

TODO: This should have a unit test. Currently that is left as an exercise for the reader to do at another time.

## Change the Pages

Only two pages show the temperature: Current Weather and Forecast, so only two pages need to read use the scale.

### Forecast

The changes for the `ForeccastPage` are pretty straight forward:

1. Import the `settings` service along with the other ones: `import { settings, weather } from '../util';`
1. Create a state hook for the scale: `const [scale, setScale] = useState();`
1. In the `useIonViewWillEnter()` callback, set the scale: `setScale(await settings.getScale());`
1. When rendering the page, use the scale from the state: `<DailyForecast scale={scale} forecast={f}></DailyForecast>`


### Current Weather

The `CurrentWeatherPage` needs to do more work because it needs to also toggle the scale.

First, though, make very similar changes as to what we need for the `ForecastPage`:

1. Import the `settings` service along with the other ones: `import { iconPaths, settings, weather } from '../util';`
1. Create a state hook for the scale: `const [scale, setScale] = useState();`
1. In the `useIonViewWillEnter()` callback, set the scale: `setScale(await settings.getScale());`
1. When rendering the page, use the scale from the state: `<kws-temperature class="primary-value" scale={scale} temperature={temperature}></kws-temperature`

We want the user to be able to change the scale when they click on the temperature. Create a method that does that:

```TypeScript
  const toggleScale = () => {
    const newScale = scale === 'F' ? 'C' : 'F';
    settings.setScale(newScale);
    setScale(newScale);
  }
```

We also would like the cursor to change to a pointer when they are in the web so user knows that they can click there. Create a style for that:

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

Congratulations, your application is now complete.
