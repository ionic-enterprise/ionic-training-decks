# Lab: Get the Current Location

When we run the application as a Hybrid Mobile application, we use a Cordova plugin to get the current location. We then fall back to a default location when running on the web. This allowed us to continue using our app in development mode. Now that is not a good strategy. We want our app to behave the same as a Hybrid Mobile app and as a PWA, and that means getting the actual current location and not some default value.

In this lab, we will learn:

* How to check if certain functionallity is supported by Web APIs
* How to modify our code to handle this situation for Geolocation

## Check Web Capabilities

The first step to rectifying this situation is to check that it can be done, and can be done reliably. That is where <a href="https://whatwebcando.today/" target="_blank">whatwebcando.today</a> comes in handy. It tells you what your current browser can do so far as typical "device" type capabilities are concerned. It also contains simple documentation and samples on how to use the APIs.

Another good place to check is <a href="https://caniuse.com/" target="_blank">caniuse.com</a>. Type in a capability and you will be shown which browsers support it as well as the minimum version in which it is supported. If we go there and type in "geolocation" we will see that it is well supported accross all of the browsers we care about. There are a few known issues, but those are all on really old versions of browsers or mobile OSes, so no worries there. Let's use it.

## Use the Geolocation Web API

The location code currently looks like this:

```TypeScript
  async current(): Promise<Coordinate> {
    const loc =
      this.cachedLocation ||
      (this.platform.is('cordova')
        ? await this.geolocation.getCurrentPosition()
        : this.defaultLocation);
    this.cachedLocation = loc;
    return {
      longitude: loc.coords.longitude,
      latitude: loc.coords.latitude
    };
  }
```

We want to take the `: this.defaultLocation)` line and replace it with code that gets the location using the Web API. Time to write a private function:

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
    return Promise.resolve(this.defaultLocation);
  }
```

Let's walk through what that is doing:

1. if the current environment supports geolocation
   1. call the web API
   1. the web API takes callbacks, convert that to a Promise
1. in the rare case that geolocation is not supported, fallback to our default location

Now in the main code we can replace `: this.defaultLocation);` with `: await this.getCurrentPositionWebApi());`.

## Run Another Lighthouse Audit

Commit those changes and deploy the application. Load your app in an Ingocnito window. Itshould ask for permission to track your location. Allow it to do so. Run a Lighthouse audit again. Notice that the Performance and Best Practices scores have both gone down. This is because of the geolocation we just added. If the Lighthouse scores are super important to you, then you could redesign your app to NOT default to "current location".

## Conclusion

We now have a functional application that can be build as a PWA and as a hybrid mobile application. The application will used Cordova plugins when run natively and web APIs when run as a PWA, and has the same basic functionallity in both cases. It installs properly as a PWA on both iOS and Android.

There is still more we could do, including:

* Reverse geolocation on the current location to get the city name
* Restructuring the application startup to address the Lighthouse test scores
* Writing unit tests (we have completely ignored those)
