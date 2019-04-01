# Lab: Get the Current Location

When we run the application as a Hybrid Mobile application, we use a Cordova plugin to get the current location. We then fall back to a default location when running on the web. This allowed us to continue using our app in development mode. Now that is not a good strategy. We want our app to behave the same as a Hybrid Mobile app and as a PWA, and that means getting the actual current location and not some default value.

In this lab, we will learn:

* How to check if certain functionallity is supported by Web APIs
* How to modify our code to handle this situation for Geolocation

## Check Web Capabilities

The first step to rectifying this situation is to check that it can be done, and can be done reliably. That is where <a href="https://whatwebcando.today/" target="_blank">whatwebcando.today</a> comes in handy. It tells you what your current browser can do so far as typical "device" type capabilities are concerned. It also contains simple documentation and samples on how to use the APIs.

Another good place to check is <a href="https://caniuse.com/" target="_blank">caniuse.com</a>. Type in a capability and you will be shown which browsers support it as well as the minimum version in which it is supported. If we go there and type in "geolocation" we will see that it is well supported accross all of the browsers we care about. There are a few known issues, but those are all on really old versions of browsers or mobile OSes, so no worries there. Let's use it.

## Use the Geolocation Web API

The location service currently uses a default position if the user is on the web. It should be changed to use the web API when running within a web context.

### Test First

1. Spy on the web API and call a fake instead of the real method
1. Modify the "when not hybrid mobile" tests to express the requirements to get the position using the web API

```TypeScript
  describe('current', () => {
    beforeEach(() => {
      spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
        function() {
          const position = { coords: { latitude: 32, longitude: -96 } };
          arguments[0](position);
        }
      );
    });

    ... // most tests stay the same

    describe('when not hybrid mobile', () => {
      beforeEach(() => {
        const platform = TestBed.get(Platform);
        platform.is.withArgs('cordova').and.returnValue(false);
      });

      it('does not call the geolocation plugin', () => {
        const geolocation = TestBed.get(Geolocation);
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });

      it('calls the web API geolocation', () => {
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(
          1
        );
      });

      it('resolves the position using the web API', async () => {
        const service: LocationService = TestBed.get(LocationService);
        expect(await service.current()).toEqual({
          latitude: 32,
          longitude: -96
        });
      });
    });
  });
```


### Then Code

Create a private function that uses the web API. Here is an example:

```TypeScript
  private getCurrentPositionWebApi(): Promise<{
    coords: { latitude: number; longitude: number };
  }> {
    if ('geolocation' in navigator) {
      return new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          p => resolve(p),
          err => reject(err)
        )
      );
    }
    return Promise.resolve(this.defaultPosition);
  }
```

Let's walk through what that is doing:

1. If the current environment supports geolocation:
   1. Call the web API
   1. The web API takes callbacks, convert that to a Promise
1. In the rare case that geolocation is not supported, fallback to our default location (not tested)

Now in the main code we can replace `: this.defaultPosition);` with `: await this.getCurrentPositionWebApi());`.

## Run Another Lighthouse Audit

Commit those changes and deploy the application. Load your app in an Ingocnito window. It should ask for permission to track your location. Allow it to do so. Run a Lighthouse audit again. Notice that the Performance and Best Practices scores have both gone down. This is because of the geolocation we just added. If the Lighthouse scores are super important to you, then you could redesign your app to NOT default to "current location".

## Conclusion

We now have a functional application that can be build as a PWA and as a hybrid mobile application. The application will used Cordova plugins when run natively and web APIs when run as a PWA, and has the same basic functionallity in both cases. It installs properly as a PWA on both iOS and Android.

There is still more we could do, including:

* Reverse geolocation on the current location to get the city name
* Restructuring the application startup to address the Lighthouse test scores
* Add handling for cases where the user does not allow their location to be tracked
* Writing unit tests (we have completely ignored those)
