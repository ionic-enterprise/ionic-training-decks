# Phase 1: Install and Configure Capacitor

Installing and configuring Capacitor is a multi-step process, but each step is very small. The full set of steps are:

1. Create a working branch. _Never_ work directly in the main branch of your application.
1. Enable the Capacitor integration.
1. Edit the capacitor configuration file.
1. Add the native Capacitor platforms.
1. Generate the icons and splash screens.
1. Build the native applications and test.

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

This command installs `@capacitor/core` and `@capacitor/cli` in your project and creates a template `capacitor.config.ts` file.

## Edit `capacitor.config.ts`

Have a look at the newly created `capacitor.config.ts` file:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cor-to-cap',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
    },
  },
};

export default config;
```

Change the `appId` and the `appName` to match what you currently have in the `config.xml` file. The rest of the file can remain as-is:

```typescript
  ...
  appId: 'com.kensodemann.cortocap',
  appName: 'Cor to Cap',
  webDir: 'www',
  bundledWebRuntime: false,
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
$  ionic cap add ios
> npm i -E @capacitor/ios@latest

added 1 package, and audited 1734 packages in 5s

137 packages are looking for funding
  run `npm fund` for details

5 moderate severity vulnerabilities

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
> capacitor add ios
[capacitor] ✔ Adding native Xcode project in ios in 36.84ms
[capacitor] ✔ add in 37.82ms
[capacitor] [success] ios platform added!
[capacitor] Follow the Developer Workflow guide to get building:
[capacitor] https://capacitorjs.com/docs/basics/workflow
[capacitor] ✔ Copying web assets from www to ios/App/App/public in 1.18s
[capacitor] ✔ Creating capacitor.config.json in ios/App/App in 819.27μp
[capacitor] (node:73341) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./" in the "exports" field module resolution of the package at /Users/ken/Projects/Training/cor-to-cap/node_modules/tslib/package.json.
[capacitor] Update this package.json to use a subpath pattern like "./*".
[capacitor] (Use `node --trace-deprecation ...` to show where the warning was created)
[capacitor] [info] Found 1 Cordova plugin for ios:
[capacitor]        cordova-plugin-device@2.0.2
[capacitor] ✔ copy ios in 1.26s
[capacitor] ✔ Updating iOS plugins in 21.20ms
[capacitor] [info] Found 4 Capacitor plugins for ios:
[capacitor]        @capacitor/app@1.0.3
[capacitor]        @capacitor/haptics@1.0.3
[capacitor]        @capacitor/keyboard@1.0.3
[capacitor]        @capacitor/status-bar@1.0.3
[capacitor] [info] Found 1 Cordova plugin for ios:
[capacitor]        cordova-plugin-device@2.0.2
[capacitor] ✔ Updating iOS native dependencies with pod install in 8.05s
[capacitor] [info] Found 5 incompatible Cordova plugins for ios, skipped install:
[capacitor]        cordova-plugin-ionic-keyboard@2.2.0
[capacitor]        cordova-plugin-ionic-webview@4.2.1
[capacitor]        cordova-plugin-splashscreen@5.0.2
[capacitor]        cordova-plugin-statusbar@2.4.2
[capacitor]        cordova-plugin-whitelist@1.3.3
[capacitor] ✔ update ios in 8.12s
```

Unlike Cordova, where the platforms are build artifacts, and thus cannot be directly touched, these platforms are source artifacts and are fully under your control. That means no more trying to manipulate the platforms via weird directives in the `config.xml` file or via hard to maintain hooks. Yes!! 🎉

## Add the Icons and Slash Screen

The final step is to initialize the newly created projects with the icon and splash screen from our original project. Since our original project already has `icon.png` and `splash.png` template files in the `resources` directory, all we have to do is use the `cordova-res` script to copy them to our newly generated platforms.

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

`cordova-res` will produce warnings with this step. These warnings as associaited with <a href="https://github.com/ionic-team/cordova-res#adaptive-icons">Android Adaptive Icons</a> and can be ignored for now. You should account for these is a production application, however.

## Run the App

At this point, you are able to view your Capacitor application by loading it in either Xcode or Android Studio and running it on a device or emulator. Use `ionic cap open` to open the appropriate IDE.

```bash
$ ionic cap open ios
$ ionic cap open android
```

## Conclusion

Our basic app is fully functional as a Capacitor application. Some applications may need a little more care based on the plugins that are used and the amount of configuration that they require. In the next phase, we will clean up the application and tie up any loose ends.
