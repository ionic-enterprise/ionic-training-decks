# Lab: Using Native APIs

## Use the Geolocation API

### Test First

First, mock the Geolocation API.  The only requirement for the value resolved by `getCurrentPosition()` is that the `coords` should be different than than the hard-coded ones you picked. All of the following modifications should take place in the `src/util/weather.*` set of files.

```TypeScript
import { Plugins } from '@capacitor/core';
...
  beforeEach(() => {
    (Plugins.Geolocation.getCurrentPosition as any) = jest.fn(() =>
      Promise.resolve({ coords: { latitude: 42.123, longitude: -73.4242 } })
    );
  });

  afterEach(() => (Plugins.Geolocation.getCurrentPosition as any).mockRestore());
```

Next, change the tests that compare the URL. Use the latitude and longitude resoled by the mock instead of the hard coded values that are in the code. All of those tests should fail now.

### Code Second

Modify the `currentLocation()` method to call the Geolocation API.

```TypeScript
import { Plugins } from '@capacitor/core';
...
  private async currentLocation(): Promise<Coordinate> {
    const { coords } = await Plugins.Geolocation.getCurrentPosition();
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  }
```

Test the code changes on Android and iOS devices (or emulators). The application should now ask for permission to use Geolocation.

## Conclusion

You have now used your first Capacitor API in order to access native APIs.
