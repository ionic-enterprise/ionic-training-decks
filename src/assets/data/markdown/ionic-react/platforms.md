# Lab: Using Capacitor

## Update the Config

Modify the `capacitor.config.json` file. At this time, you should change the following two items:

- `appId` - this needs to be unique within the app stores, and is typically your company's URL with the app name in reverse order, like `com.acme.tntroadrunner`. For the purpose of this course, I will just use `com.kensodemann.myweather`
- `appName` - this is the name that will display under the icon. For the purpose of this course, I will just use "My Weather"

## Install Platforms

We want to build for two platforms: Android and iOS. Install both of those platforms now (note: I am assuming you are developing on a Mac, if not that is OK, just get one 😂, well..., or only do the Android bit, whichever you find best)

Run the following two commands:

- `npx cap add android`
- `npx cap add ios`

**Note:** If you get an error like "Capacitor could not find the web assets directory" then run `npm run build` and re-try the command.

The `npx` command is one you may not have used much before. Basically, it will use your current NPM environment to run the command that follows it.

Those commands installed a couple of libraries and constructed the project directories for iOS and Android. Go ahead and have a look at the changes, then commit them.

## Update the Build Script

Capacitor applications consist of a web application wrapped in a native application and run inside a webview. The current `npm run build` command will only run the web build. Once it is complete we need to copy it to the native projects. To do that manually, we can run `npx cap copy` after the `npm run build` completes. If we do that, though, there are times that we will probably forget to do it. It would be better to update the "build" script in the `package.json` to just do it for us.

The build script currently looks like this: `"build": "react-scripts build",`

Change the build script to look like this: `"build": "react-scripts build && cap copy",`

Note that we not need the `npx` part here because this command is automatically run within the current NPM environment.

## Run on Devices

To run on a device or an emulator, use `npx cap open android` or `npx cap open ios` to open the proper IDE and then run anywhere you want to from there.

```bash
$ npx cap open android
$ npx cap open ios
```

## Update Icon and Splash Screen

The app runs fine on our devices, but the splash screen and icon are just the Capacitor defaults. Let's fix that now.

For this application: 

1. create a `resources/` directory 
1. download the following images
1. place the images in the `resources` directory

- <a download href="/assets/images/icon.png">icon.png</a>
- <a download href="/assets/images/splash.png">splash.png</a>

To generate the required resources and have them copied to the native projects, use the following commands:

```bash
$ npm i -g cordova-res
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

The "npm install" command is only required if you do not currently have `cordova-res` installed.

Rebuild the application and run it on a device. You should see the updated icon and splash screen.

**Note:** iOS has a bug having nothing to do with Capactor where it is overly agressive on caching the splash screen image. You may need to delete the app, reboot the device, and then try again in order to see the correct splash screen.

## Conclusion

You have now integrated your application with Capacitor and can now build it for native platforms.
