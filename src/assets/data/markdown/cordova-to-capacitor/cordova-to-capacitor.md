# Walkthrough: Converting a Cordova App to Capacitor

## Create a Cordova App

Unless you already have a 

```bash
$ ionic start cor-to-cap blank --type=angular --cordova
$ cd cor-to-cap
```

To make this app unique, let's give it a unique bundle ID and name by editing the `config.xml` file. Here is what I am using:

```xml
<widget id="com.kensodemann.cortocap" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/    ns/1.0">
    <name>Cor to Cap</name>
    <description>An awesome Ionic/Cordova app.</description>
```

Now let's generate the platforms:

```bash
$ npm run build
$ ionic cordova platform add ios
$ ionic cordova platform add android
```

We now have a fully functional, though minimal, Cordova application.

## Convert to Capacitor

Converting to Capacitor can be considered a two step process:

- Install and Convert
- Cleanup

### Install and Convert

Installing Capacitor and converting the native projects is a multi-step process, but each step is very small. The full set of steps looks like this:

```bash
# Step 1
$ ionic integration enable capacitor

# Step 2
edit capacitor.config.json

# Step 3
$ ionic cap add ios
$ ionic cap add android

# Step 4
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy

# Step 5
$ ionic cap open ios
$ ionic cap open android
```

At the end of this process, many apps will already be working fine. Other apps may require minor tweaks due to issues with plugin configuration, but those will be addressed in the "Cleanup" section.

Let's have a look at each of the above steps in detail.

#### Integrate Capacitor

```bash
$ ionic integration enable capacitor
```

This command installs `@capacitor/core` and `@capacitor/cli` in your project and creates a template basic `capacitor.config.json` file.

#### Edit `capacitor.config.json`

Have a look at the newly created `capacitor.config.json` file:

```json
{
  "appId": "io.ionic.starter",
  "appName": "cor-to-cap",
  "bundledWebRuntime": false,
  "npmClient": "npm",
  "webDir": "www",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "cordova": {
    "preferences": {
      "ScrollEnabled": "false",
      "BackupWebStorage": "none",
      "SplashMaintainAspectRatio": "true",
      "FadeSplashScreenDuration": "300",
      "SplashShowOnlyFirstTime": "false",
      "SplashScreen": "screen",
      "SplashScreenDelay": "3000"
    }
  }
}
```

Change the `appId` and the `appName` to match what you currently have in the `config.xml` file. The rest of the file can remain as-is:

```json
{
  "appId": "com.kensodemann.cortocap",
  "appName": "Cor to Cap",
  "bundledWebRuntime": false,
  ...
```

#### Add the iOS and Android Platforms

Let's add the iOS and Android platforms:

```bash
ionic cap add ios
ionic cap add android
```

The output of these two commands is similar. Notice that the Compatible Cordova plugins that we have in our project are automatically installed while the incompatible plugins are ignored.

```bash
> capacitor add ios
✔ Installing iOS dependencies in 17.84s
✔ Adding native xcode project in: /Users/kensodemann/Projects/Training/cor-to-cap/ios in 27.74ms
✔ add in 17.87s
✔ Copying web assets from www to ios/App/public in 866.04ms
✔ Copying native bridge in 6.84ms
✔ Copying capacitor.config.json in 1.25ms
⠇ copy  Found 1 Cordova plugin for ios
    cordova-plugin-device (2.0.2)
✔ copy in 1.01s
✔ Updating iOS plugins in 13.99ms
  Found 0 Capacitor plugins for ios:
  Found 1 Cordova plugin for ios
    cordova-plugin-device (2.0.2)
✔ Updating iOS native dependencies with "pod install" (may take several minutes) in 10.58s
  Found 5 incompatible Cordova plugins for ios, skipped install
    cordova-plugin-ionic-keyboard (2.2.0)
    cordova-plugin-ionic-webview (4.2.1)
    cordova-plugin-splashscreen (5.0.2)
    cordova-plugin-statusbar (2.4.2)
    cordova-plugin-whitelist (1.3.3)
✔ update ios in 10.62s
```

Unlike Cordova, where the platforms are build artifacts, and thus cannot be directly touched, these platforms are source artifacts and are fully under your control. That means no more trying to manipulate the platforms via weird directives in the `config.xml` file or via hard to maintain hooks. Yes!! 🎉

#### Add the Icons and Slash Screen

The final step is to initialize the newly created projects with the icon and splash screen from our original project. Since our original project already has `icon.png` and `splash.png` template files in the `resources` directory, all we have to do is use the `cordova-res` script to copy them to our newly generated platforms.

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

If `cordova-res` produces any warnings with this step, you can ignore them.

#### Run the App

At this point, you are able to view  your Capacitor application by loading it in either Xcode or Android Studio and running it on a devie or emulator. Use `ionic cap open` to open the appropriate IDE.

```bash
$ ionic cap open ios
$ ionic cap open android
```

At this point, our app is fully functional as a Capacitor application. Some applications may need a little more care based on the plugins that are used and the amount of configuration that they require.

### Cleanup

In the case of this simple app, the following plugins are incompatible with at least one of the platforms:

`cordova-plugin-ionic-keyboard` - not required by Capacitor
`cordova-plugin-ionic-webview` - not required by Capacitor
`cordova-plugin-splashscreen` - should be replaced by Capacitor SplashScreen API
`cordova-plugin-statusbar` - should be replaced by Capacitor StatusBar API
`cordova-plugin-whitelist` - not required by Capacitor (and deprecated in Cordova)
