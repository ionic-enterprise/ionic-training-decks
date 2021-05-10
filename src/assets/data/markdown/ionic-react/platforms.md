# Lab: Add Capacitor Platforms

In this lab, you will learn how to:

- Update the application's Capacitor configuration
- Add the iOS and Android platforms to the application
- Build and run the application on both platforms
- Update the application's splash screen and application icon

## Overview

Capacitor is the cross-platform native runtime that allows us to run our Ionic Framework application across iOS, Android, and the web with the same code base. As part of initializing our application through the Ionic CLI, our project is already configured to use Capacitor. As a reminder, the Ionic CLI wraps the Capacitor command line.

We will add both iOS and Android platforms to our application. Note that this will add the Android Studio and Xcode projects to source control. This allows us to easily edit native configuration and add custom native code to Capacitor projects.

## Update the Configuration

When a platform is added or updated to a Capacitor project, information in `capacitor.config.json` is used to generate some information within the project files. Some of this information should be changed up front:

- The `appId` should be changed to something unique like `com.mycompany.teataster`
- `appName` should be changed to the application's display name

**Example:**

```json
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

Before adding any Capacitor platforms, you need to make sure that your application has been built. If it has not been built, the `build` folder will not exist and the attempt to add the platform will fail.

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

**Note:** You need to have Android Studio installed if you want to build on Android. You need to be using a Mac that has Xcode properly installed in order to build for iOS.

## Update the Splash Screen and Application Icon

Before taking this step, make sure you have `cordova-res` installed globally by typing `cordova-res --version`. If you do not have it installed, run the following command:

```bash
$ npm install -g cordova-res
```

`cordova-res` is a tool that is used to create icon and splash screen images. Despite the name, it can be used with Capacitor applications.

The application should have its own splash screen and icon rather than using the default that Ionic supplies for you. Ionic provides a service that will take two source image files and create all of the resources that the application will require.

Remember to follow these guidelines when designing your splash screen and icon:

- Keep the images simple and clear
- You can supply source images in any of these formats: `.png`, `.psd`, `.ai`
- Icon: At least 1024x1024 pixels; the image dimensions should be square
- Splash Screen: At least 2732x2732 pixels with a simple image that is centered and no bigger than 1200x1200 pixels to facilitate reasonable display on all devices

For this application, download the following images and place them in a directory named `resources` in the root of your project:

- <a download href="/assets/packages/ionic-react/icon.png">icon.png</a>
- <a download href="/assets/packages/ionic-react/splash.png">splash.png</a>

Create an `android` directory under the `resources` directory. Download the following images to the newly created `resources/android` directory:

- <a download href="/assets/packages/ionic-react/icon-background.png">icon-background.png</a>
- <a download href="/assets/packages/ionic-react/icon-foreground.png">icon-foreground.png</a>

To generate the required resources and copy them to the native projects, use the following commands:

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

These commands will use the source images to produce all of the various images required by the native projects and then copy them to the proper locations.

## Update NPM Scripts

I like to have my build do a copy for me. For this reason, I do a `cap copy` with every build. This ensures my native projects are always up to date with the latest changes made.

```JSON
  "scripts": {
    "build": "react-scripts build && cap copy",
    ...
  },
```

At this point, run `npm run build` and then open either the Android or iOS native project and run the application on device or emulator. The application should have the updated icon as well as the new splash screen, and it should run normally.

Stage all of your files and commit them to the git repo at this point (I suggest doing that at the end of every lab).

## Live Reload (Optional)

Now that the projects are set up and building properly, you can make use of Capacitor's "live reload" feature if you would like to. Live reload allows you to run the application on your device and will re-build and reload the application as you develop. This is similar to `ionic serve`, but is running the application on device instead of the browser.

```bash
$ ionic cap run android --livereload --external
$ ionic cap run ios --livereload --external
```

These commands start a dev server that monitors changes to the Ionic Framework project, launches the proper IDE, and allows you to run the application on device. Once that is done, when you change code in the Ionic Framework project, it will be rebuilt and reloaded on the device(s).

## Conclusion

In this lab we learned how to configure our Capacitor project, add iOS and Android platforms, and how to build the application for those platforms. Next we will learn how to access native functionality with our application.
