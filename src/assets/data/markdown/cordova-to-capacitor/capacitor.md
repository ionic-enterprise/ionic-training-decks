# Phase 1: Install and Cofigure Capacitor

Installing and cnfiguring Capacitor is a multi-step process, but each step is very small. The full set of steps looks like this:

```bash
# Step 1
# Always work in a dedicated branch, NEVER work directly in the main branch of your application
$ git checkout -b feature/convertToCapacitor

# Step 2
$ ionic integration enable capacitor

# Step 3
edit capacitor.config.json

# Step 4
# Note: if you have never built your project, do "npm run build" first
$ ionic cap add ios
$ ionic cap add android

# Step 5
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy

# Step 6
$ ionic cap open ios
$ ionic cap open android
```

At the end of this process, many apps will already be working fine. Other apps may require minor tweaks due to issues with plugin configuration, but those will be addressed in the "Cleanup" phase.

Let's have a look at each of the above steps in detail.

## Create a Working Branch

You should never ever do any work in the main branch of your application. You should always use a "branch and merge" strategy for every change you make, even if you are the only developer on your application. This way, should you decide that whatever changes you are making are not a path you want to go down, you just need to abandon the branch rather than undo a bunch of commits. This advice holds especially true here where you are replacing a whole section of your stack. Even though this process is very easy, you should still approach it with care.

```bash
$ git checkout -b feature/convertToCapacitor
```

Also remember to commit early and commit often. Always make small commits as you go, and then squash them into a single commit before merging your branch into the main branch.

## Integrate Capacitor

```bash
$ ionic integration enable capacitor
```

This command installs `@capacitor/core` and `@capacitor/cli` in your project and creates a template basic `capacitor.config.json` file.

## Edit `capacitor.config.json`

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

## Add the iOS and Android Platforms

Let's add the iOS and Android platforms:

```bash
$ ionic cap add ios
$ ionic cap add android
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

## Add the Icons and Slash Screen

The final step is to initialize the newly created projects with the icon and splash screen from our original project. Since our original project already has `icon.png` and `splash.png` template files in the `resources` directory, all we have to do is use the `cordova-res` script to copy them to our newly generated platforms.

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

If `cordova-res` produces any warnings with this step, you can ignore them.

## Run the App

At this point, you are able to view your Capacitor application by loading it in either Xcode or Android Studio and running it on a device or emulator. Use `ionic cap open` to open the appropriate IDE.

```bash
$ ionic cap open ios
$ ionic cap open android
```

## Conclusion

At this point, our basic app is fully functional as a Capacitor application. Some applications may need a little more care based on the plugins that are used and the amount of configuration that they require. In the next phase, we will clean up the application and tie up any loose ends.
