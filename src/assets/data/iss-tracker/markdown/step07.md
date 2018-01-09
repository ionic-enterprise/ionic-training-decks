# Try it on Mobile

Now would be a good time to try running the application on some devices to make sure everything works well.

## Overview

In this step, we will:

- give the application a name
- give the application a nice icon and splash screen
- build the application
- run the application on iOS 
- run the application on Android 
- use a better color for the status bar on Android

## Details

Up to now, our application has been named `MyApp`, which is the default upon creation. This issue does not really make itself known until we install the application on a device and see that it is titled `MyApp` and that it has the default Ionic application icon and splash screen. Let's fix all of that.

### Renaming the Application

To give the application a better name, open the `config.xml` file and change the `name` and `description` information. You may also want to change the `author` information since you are very likely not us.

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="io.ionic.starter" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>ISSTracker</name>
    <description>Tracks the Location of the International Space Station</description>
    <author email="hi@ionicframework" href="http://ionicframework.com/">Ionic Framework Team</author>
```

Take a moment to look at the rest of this file. This is where a lot of Cordova related options are set. Some of this file is maintained automatically when certain Ionic CLI commands are run, but other times you may need to come in here to change some default settings. It is a good idea to familiarize yourself with this file a bit.

### Icons and Splash Screens

If you look in the `resources` folder, you will find an `icon.png` and a `splash.png` file along with a `README.md` file that has links to the appropriate Cordova documentation. To create a custom icon and splash screen for your application:

1. create an `icon.png` that is 1024x1024 pixels in size, replace `resources/icon.png`
1. create an `splash.png` that is 2732x2732 pixels in size, replace `resources/splash.png`
1. run `ionic cordova resources`

The `ionic cordova resources` command uploads your `icon.png` and `splash.png` to an Ionic server where they are processed into the various sizes required for the supported devices and then downloaded. This command requires that you log in using your Ionic account. You should only need to do the login once.

**Note:** The above sizes are minimum sizes and are subject to change as new devices are released. You can make the images larger, but you might have scaling issues. The splash screen will be cropped and scaled, so it is best to put any logos or other images in the center.

### Build the Application

There are multiple ways to build the application, and it depends on what you want the output to be:

- `ionic build`
- `ionic cordova build ios`
- `ionic cordova build android`

I usually use the first as the extra stuff done by the other two is not necessary until an actual deployment, and that can be done at that time.

All of these commands take various options, including `--prod` (all three) and `--release` (only the last two)

### Running the Application on a device

There are two ways to run an application on a device:

- use the appropriate IDE
- use the `ionic cordova run` command

#### Running the Application on iOS

Usually, I choose to use the IDE for running an iOS application on a device. To do this for our project:

```bash
$ open platforms/ios/ISSTracker.xcodeproj
```

This will open Xcode, from which you can set up the signing of the application, pick a device or sim to run the application on, and launch the application. 

You can also use `ionic cordova run ios` to run your application on a connected device (or in a simulator if no device is connected). I find that the tools that Cordova requires in order to support this can be flakey so I tend not to use this method.

#### Running the Application on Android

For running the application on one of my Android devices, I usually choose to use the command line: `ionic cordova run android`. This command usually works well.

Another option is to use Android Studio to open the `<app>/platforms/android` folder and then run the application from there. This puts a lot of options at your finger tips, but it can also be slow.

#### Debugging the Application

While the application is running, you can connect to it via Safari (for iOS) or Chrome (for Android) to monitor and debug it if you need to. For more information on using a browser to debug your applications, see [our helpful guide](https://ionicframework.com/docs/developer-resources/developer-tips/)

### Styling the Status Bar on Android

If you ran your application on Android, you may have noticed that the status bar does not really blend in with the application. As a matter of fact, depending on the version of Android, the color could be downright ugly in combination with the purple header we have. Let's fix that.

On iOS, the color of the status bar is the same as the color of the header of the application. The Android application guidelines call for the status bar to be a different color than the application's header. We certainly have that, but let's pick a different color that matches better, and let's only do that for Android.

The color I picked is just a darker shade of purple. It looks nice and it creates the differentiation that the style guide is looking for. Change the code in `app.component.ts` to set it if we are on the Android platform.

```ts
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleLightContent();
      splashScreen.hide();
      if (platform.is('android')) {
        statusBar.backgroundColorByHexString('#520E7A');
      }
    });
```

Since the new background is dark, I am also using the `statusBar.styleLightContent();` to make the icons shown in the status bar lighter. That applies to both iOS and Android.

But wait. When I rebuild and run the application on Android I still have the old ugly status bar. What is going on?

You can use Chrome on your computer to connect remotely to the application running on the device. When you do this, you will see some warnings in the console about not having the `cordova-plugin-statusbar` plugin installed. What is happening is that we have `@ionic-native/status-bar` installed. However, that is just a wrapper around the actual plug-in, and it provides us with a helpful warning if we try to do anything to the status bar without the actual plugin installed. For more information on what the Ionic Native plugin wrappers get you, see [the documentation](https://ionicframework.com/docs/native/).

To install the plugin: `ionic cordova plugin add cordova-plugin-statusbar`

Now when you rebuild and run the application on an Android device you should see the nicely colored status bar.

