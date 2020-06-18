# Lab: Add Capacitor Platforms

In this lab, you will:

* Update the Capacitor configuration
* Update the splash screen and application icon
* Add the iOS and Android platforms
* Build and run the application on both platforms

## Update the Configuration

When a Capacitor platform is added or updated, information in the `capacitor.config.json` file is used to generate some of the project files. Some of this information should be changed up front:

* The `appId` should be change to something unique like `com.kensodemann.ionicweather`
* The `appName` should be checked to ensure it is correct

Here is an example of those changes:

**Before:**

```xml
{
  "appId": "io.ionic.starter",
  "appName": "ionic-weather",
  "bundledWebRuntime": false,
  "npmClient": "npm",
  "webDir": "www",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "cordova": {}
}
```

**After:**

```xml
{
  "appId": "com.kensodemann.weather",
  "appName": "ionic-weather",
  "bundledWebRuntime": false,
  "npmClient": "npm",
  "webDir": "www",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "cordova": {}
}
```

In our case, only the `appId` required a change in order to make it globally unique.  Make similar changes to your application.

## Add the Android and iOS Platforms

Before adding any Capacitor platforms, you need to make sure that your application has been built. If it has not been built, the `www` directory will not exist and the attempt to add the platform will fail.

```bash
$ npm run build
```

Now you can add both the Android and iOS platforms.

```bash
$ ionic cap add android
$ ionic cap add ios
```

Once the platforms are added, open the native projects, each in their own IDE.

```bash
$ ionic cap open android
$ ionic cap open ios
```

**Note:** you need to have Android Studio installed if you want to build on Android. You need to be using a Mac that has Xcode properly installed in order to build for iOS.

## Update the Splash Screen and Application Icon

The application should have its own splash screen and icon rather than using the default that Ionic supplies for you. Ionic provides a service that will take two source image files and create all of the resources that your application will require. Follow these guidelines:

* Keep the images simple and clear
* You can supply source images in any of these formats: `.png`, `.psd`, `.ai`
* Icon - at least 1024x1024 pixels
* Splashscreen - at least 2732x2732 pixels with a simple image that is centered and no bigger than 1200x1200 pixels to facilitate reasonable display on all devices

For this application, please download the following images and copy them to your application's `resources` directory, replacing the onces that are already there:

* <a download href="/assets/images/icon.png">icon.png</a>
* <a download href="/assets/images/splash.png">splash.png</a>

To generate the required resources and copy them to the native projects, use the following commands:

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

These commands will use the source images to produce all of the various images required by the native projects and then copy them to the proper locations.

## Live Reload (Optional)

Now that the projects are set up and building properly, you can use Ionic's "live reload" feature if you would like to. This feature allows you to run the application on your device and then rebuild and reload the application on your device as you develop. This is similar to `ionic serve` but is running the application on your device(s) instead of the browser.

```bash
$ ionic cap run android --livereload --external
$ ionic cap run ios --livereload --external
```

These commands start a dev server that monitors changes to the Ionic project, launches the proper IDE, and allows you to run the application on a device. Once that is done, then when you change the Ionic application, it will be rebuilt and reloaded on the device(s).

## Update NPM Scripts (Optional)

I like to have my build do a copy for me. For this reason, I do a `cap copy` with every build. This ensures my native projects are always up to date.

```JSON
  "scripts": {
    "build": "ng build && cap copy",
    "e2e": "ng e2e",
    "lint": "ng lint",
    "ng": "ng",
    "start": "ng serve",
    "test": "ng test --browsers=ChromeHeadless",
    "test:ci": "ng test --no-watch --browsers=ChromeHeadlessCI",
    "test:debug": "ng test"
  },
```

## Conclusion

In this lab we learned how to add iOS and Android platforms and how to build the application for those platforms.
