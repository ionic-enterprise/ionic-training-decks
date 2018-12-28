# Lab: Add Cordova Platforms

In this lab, you will:

* Update the Cordova configuration
* Update the splash screen and application icon
* Add the iOS and Android platforms
* Build and run the application on both platforms

## Update the Configuration

When a Cordova project is built, information in the `config.xml` file is used to generate some of the project files. Some of this information should be changed up front:

* The widget id should be change to something unique like `com.kensodemann.ionicweather`
* The name and description should be changed
* The author information should be changed

Here is an example of those changes:

**Before:**

```xml
<widget id="io.ionic.starter" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>ionic-weather</name>
    <description>An awesome Ionic/Cordova app.</description>
    <author email="hi@ionicframework" href="http://ionicframework.com/">Ionic Framework Team</author>
```

**After:**

```xml
<widget id="com.kensodemann.ionicweather" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>My Weather App</name>
    <description>Shows the weather locally and in key cities</description>
    <author email="ken@ionic.io" href="http://ionicframework.com/">Ken Sodemann</author>
```

Make similar changes to your application.

## Update the Splash Screen and Application Icon

The application should have its own splash screen and icon rather than using the default that Ionic supplies for you. Ionic provides a service that will take two source image files and create all of the resources that your application will require. Follow these guidelines:

* Keep the images simple and clear
* You can supply source images in any of these formats: `.png`, `.psd`, `.ai`
* Icon - at least 1024x1024 pixels
* Splashscreen - at least 2732x2732 pixels with a simple image that is centered and no bigger than 1200x1200 pixels to facilitate reasonable display on all devices

For this application, please download the following images and copy them to your application's `resources` directory, replacing the onces that are already there:

* <a download href="/assets/images/icon.png">icon.png</a>
* <a download href="/assets/images/splash.png">splash.png</a>

The appropriate icon and splash screen resources will be generated as the platforms are added. If you ever need to change the icon or splash screen, replace the appropriate source file(s) and run `ionic cordova resources` to generate new resources.

## Add the Android and iOS Platforms

Use `ionic cordova platform add android` to add the Android platform. This will create a `www/` directory if it does not exist, install the Android platform and any required Cordova plugins, and generate the appropriate icon and splash screen resources.

```bash
~/Projects/Training/ionic-weather (master *): ionic cordova platform add android
✔ Creating ./www directory for you - done!
> cordova platform add android --save
Using cordova-fetch for cordova-android@~7.1.1
Adding android project...
Creating Cordova project for the Android platform:
	Path: platforms/android
	Package: com.kensodemann.ionicweather
	Name: My_Weather_App
	Activity: MainActivity
	Android target: android-27
Android project created with cordova-android@7.1.4
Android Studio project detected
...
> ionic cordova resources android --force
✔ Collecting resource configuration and source images - done!
✔ Filtering out image resources that do not need regeneration - done!
✔ Uploading source images to prepare for transformations: 2 / 2 complete - done!
✔ Generating platform resources: 18 / 18 complete - done!
✔ Modifying config.xml to add new image resources - done!
```

Use `ionic cordova platform add ios` to add the iOS platform. This will create a `www/` directory if it does not exist, install the iOS platform and any required Cordova plugins, and generate the appropriate icon and splash screen resources.

```bash
~/Projects/Training/ionic-weather (master *): ionic cordova platform add ios
> cordova platform add ios --save
Using cordova-fetch for cordova-ios@~4.5.4
Adding ios project...
Creating Cordova project for the iOS platform:
	Path: platforms/ios
	Package: com.kensodemann.ionicweather
	Name: My Weather App
iOS project created with cordova-ios@4.5.5
Installing "cordova-plugin-device" for ios
Installing "cordova-plugin-ionic-keyboard" for ios
Installing "cordova-plugin-ionic-webview" for ios
Installing "cordova-plugin-splashscreen" for ios
Installing "cordova-plugin-statusbar" for ios
Installing "cordova-plugin-whitelist" for ios
--save flag or autosave detected
Saving ios@~4.5.5 into config.xml file ...
> ionic cordova resources ios --force
✔ Collecting resource configuration and source images - done!
✔ Filtering out image resources that do not need regeneration - done!
✔ Uploading source images to prepare for transformations: 2 / 2 complete - done!
✔ Generating platform resources: 32 / 32 complete - done!
✔ Modifying config.xml to add new image resources - done!
```

## Build for Android

When building for Android, the command line tools work very well:

* `ionic cordova build android` - builds the APK
* `ionic cordova run android` - build the APK and runs it on an emulator or attached device

Both commands take several options. See `ionic cordova run --help` for details.

**Android Quirks**

* If `ionic cordova run android` fails the first time, it is often due to the emulator taking too long to launch. In that case, leave the emulator open and re-do the `ionic cordova run android` command.
* The `--target` option is used to specify different targets in the emulator or different devices attached to the build machine. Use `cordova run android --list` to get a list of targets.

## Build for iOS

* `ionic cordova build ios` - builds the IPA
* `ionic cordova run ios` - builds the IPA and runs it on an emulator or attached device

Both commands take several options. See `ionic cordova run --help` for details.

**iOS Quirks**

* If `ionic cordova run ios` does not work, use `open platforms/ios/Ionic\ Weather.xcworkspace` to open Xcode to build and run the application (NOTE: actual file name may differ depending on the `config.xml` contents at the time the platform was added)
* When deploying to a device, you need to specify a team, provisioning profile, and signing certificate. It is usually easiest to use Xcode for this.
* Currently if you are using Xcode 10, you need to specify the old build system as such: `ionic cordova build ios -- -buildFlag='-UseModernBuildSystem=0'`
* Depending on how your system is set up, the default emulator may be too old to run your app. In that case, be sure to specify a `target`. Use `cordova run ios --list` to get a list of targets.

Here is how you would run the application on the iPhone 7, iOS 12.1 emulator if you have Xcode 10 on your machine: `ionic cordova run ios --target='iPhone-7, 12.1' -- -buildFlag='-UseModernBuildSystem=0'`

**Note:** I find it hard to remember the full command for the iOS build, so I often add a script to the `package.json` file to do it, like this:

```JSON
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:ios": "ionic cordova build ios -- -buildFlag='-UseModernBuildSystem=0'",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
```

Then all I have to do is `npm run build:ios` when I want to build for iOS.

## Add Untracked Files and Commit

The above processes modified a lot of files, mostly in the `resources/` folder, and added a couple as well. Use `git status` to see them all:

```bash
~/Projects/Training/ionic-weather (master *): git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   config.xml
	modified:   package-lock.json
	modified:   package.json

...

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	resources/icon.png.md5
	resources/splash.png.md5

no changes added to commit (use "git add" and/or "git commit -a")
```

Add the two untracked files and commit:

```bash
~/Projects/Training/ionic-weather (master *): git add resources/
~/Projects/Training/ionic-weather (master *+): git commit -am "add android and ios platforms"
```

## Conclusion

In this lab we learned how to add various platforms and how to build the application for those platforms.
