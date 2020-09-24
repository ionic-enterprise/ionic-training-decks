# Lab: Add Capacitor Platforms

In this lab, you will learn how to:

- Update the application's Capacitor configuration
- Add the iOS and Android platforms to the application
- Build and run the application on both platforms
- Update the application's splash screen and application icon

## Overview

Capacitor is the cross-platform native runtime that allows us to run our Ionic Framework application across iOS, Android, and the web with the same code base. As part of initializing our application through the Ionic CLI, our project is already configured to use Capacitor; as a reminder, the Ionic CLI wraps the Capacitor command line.

We will add both iOS and Android platforms to our application. Note that this will add the Android Studio and Xcode projects to source control. This allows us to easily edit native configuration and add custom native code to Capacitor projects.

## Update the Configuration

When a platform is added or updated to a Capacitor project, information in `capacitor.config.json` is used to generate some information within the project files. Some of this information should be changed up front:

- The `appId` should be changed to something unique like `com.mycompany.teataster`
- `appName` should be changed to the application's display name

**Example:**

```xml
{
  "appId": "com.mycompany.teataster",
  "appName": "Tea Tasting Notes",
  "bundledWebRuntime": false,
  "npmClient": "npm",
  "webDir": "build",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "cordova": {}
}
```

Make similar changes to your application.

## Add the Android and iOS Platforms

Before adding any Capacitor platforms, we need to ensure that the application has been built. Capacitor copies the `webDir` folder set in `capacitor.config.json` into platform project folders -- if the directory does not exist the attempt to add the platform will fail.

Let's build the application:

```bash
$ npm run build
```

Notice that the `build` folder has been created. Now open `.gitignore`, notice that `/build` is ignored when committing files to source control. When you first pull a Capacitor project from source control, don't forget to build it otherwise you won't be able to run on Android or iOS!

Go ahead and add both the Android and iOS platforms:

```bash
$ ionic cap add android
$ ionic cap add ios
```

Once the platforms are added, open the native projects, each in their own IDE.

```bash
$ ionic cap open android
$ ionic cap open ios
```

**Note:** You need to have Android Studio installed if you want to build on Android. Likewise, you'll need to be using a Mac that has Xcode properly installed in order to build for iOS.

## Update the Splash Screen and Application Icon

The application should have its own splash screen and icon rather than using the default that Ionic supplies for you. Ionic provides a service that will take two source image files and create all of the resources that the application will require.

Remember to follow these guidelines when designing your splash screen and icon:

- Keep the images simple and clear
- You can supply source images in any of these formats: `.png`, `.psd`, `.ai`
- Icon: At least 1024x1024 pixels; the image dimensions should be square
- Splashscreen: At least 2732x2732 pixels with a simple image that is centered and no bigger than 1200x1200 pixels to faciliate reasonable display on all devices

For this application, download the following images and place them in a directory named `resources` in the root of your project:

- <a download href="/assets/images/icon.png">icon.png</a>
- <a download href="/assets/images/splash.png">splash.png</a>

To generate the required resources and copy them to the native projects, use the following commands:

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

These commands will use the source images to produce all of the various images required by the native projects and then copy them to the proper locations.

## Optional: Live Reload

Now that the projects are set up and building properly, you can make use of Capacitor's "live reload" feature if you would like to. Live reload allows you to run the application on your device and will re-build and reload the application as you develop. This is similar to `ionic serve`, but is running the application on device instead of the browser.

```bash
$ ionic cap run android --livereload --external
$ ionic cap run ios --livereload --external
```

## Optional: Update NPM Scripts

I like to have my build do a copy for me. For this reason, I do a `cap copy` with every build. This ensures my native projects are always up to date with the latest changes made.

I suggest modifying the `build` script in `package.json` like so:

```JSON
  "scripts": {
    "build": "react-scripts build && cap copy",
    "eject": "react-scripts eject",
    "start": "react-scripts start",
    "test": "react-scripts test",
    "test:ci": "export CI=true; react-scripts test",
    "test:cov": "export CI=true; react-scripts test --coverage",
    "test:upd": "export CI=true; react-scripts test --updateSnapshot"
  },
```

## Conclusion

In this lab we learned how to configure our Capacitor project, add iOS and Android platforms, and how to build the application for those platforms. Next we will learn how to access native functionality with our application.
