# Phase 2: Project Cleanup

Cleanup involves three main steps:

- Replace Cordova plugins with Capacitor Plugins or APIs where possible
- Configure remaining Cordova plugins where needed
- Remove the Cordova configuration and any plugins that are no longer being used

Let's jump right in.

## Replace Plugins

The first thing we should do in our cleanup efforts is to look for opportunities to use <a href="https://capacitorjs.com/docs/apis" target="_blank">Capacitor Plugins</a> or <a href="https://github.com/capacitor-community/" target="_blank">Capacitor Community Plugins</a> instead of using Cordova plugins.

In the case of our application, none of the Cordova plugins are being called from within our application. If we were doing something like setting the style from within the `AppComponent`, for example, though, we would want to replace the `@ionic-native` / Cordova code with calls to the Capacitor plugin instead. Here is an example of what this might look like:

**Note:** do not actually do this, this is just a sample of what this _would_ look like if we needed to do this.

```typescript
import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    this.initApplication();
  }

  private initApplication() {
    StatusBar.setStyle({ style: Style.Light });
  }
}
```

## Clean Up `src/app/app.module.ts`

If your application was using some `@ionic-native` services that have all been replaced by Capacitor plugins, then you will very likely need to remove them from here as well.

- Remove the ES6 imports of them
- Remove the code that adds them to the `providers` array

In our case we have nothing to remove.

## Configure Plugins

This step may or may not be required for your project. For the base Cordova project we are converting here it is not required at all. However, if it is required, common tasks include:

- Handling Cordova plugin preferences
- Handling additional `config.xml` items
- Handling Cordova hooks
- Handling plugin variables

### Handling Cordova Plugin Preferences

If any of your Cordova plugins require preferences to be set the `config.xml` file, those preferences should be set in the `cordova` section of the `capacitor.config.ts` file. These should have been automatically copied over for you during Phase 1, but you may want to double check them. Here is what I have in my project:

```typescript
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
```

**Note:** in our case, we will later remove all of these as we have replaced the use of all Cordova plugins in our application and thus will end up removing all of them. This may or may not be the case in any of your projects.

### Handling Additional `config.xml` Items

You may have other directives in your `config.xml` file such an `edit-config` node. For example, the following `edit-config` node modifies the iOS project's `info.plist` file:

```xml
<edit-config file="*-Info.plist" mode="merge" target="NSCameraUsageDescription">
  <string>Used to take photos</string>
</edit-config>
```

In these cases, the you need to update the appropriate native project yourself. So the proper question to ask yourself is "How do I configure X in iOS (or Android)?" and then go modify the proper configuration file. You can usually figure this out via the nodes in the `config.xml` file themselves.

### Handling Cordova Hooks

Some plugins install Cordova hooks. These can be a little trickier to deal with. If you have a plugin that does this, you need to figure out what the hooks are doing and replicate that set up yourself. The good news is, since the native projects are now source artifacts you should only need to do this once.

### Handling Cordova Plugin Variables

Some plugins require installation time variable. If you have a plugin like this, you will need to figure out what the plugin is using that variable for and then perform the same operation in your native projects. Similar to the situation with Cordova Hooks, you should only need to do this once, however.

## Remove Cordova

In this step, you will:

- Remove unused plugins
- Remove the Cordova platforms
- Remove unused `@ionic/native` services
- Modify the `package.json` file
- Remove unused files from the filesystem

### Remove Unused Plugins

Right now, the following plugins are being installed:

- `cordova-plugin-whitelist` - not needed by anything
- `cordova-plugin-statusbar` - using Capacitor API instead
- `cordova-plugin-device` - not used
- `cordova-plugin-splashscreen` - using Capacitor API instead
- `cordova-plugin-ionic-webview` - not needed with Capacitor
- `cordova-plugin-ionic-keyboard` - not needed with Capacitor

As you can see from the comments here, we don't actually need to install any of them. You can uninstall them all:

```bash
$ npm uninstall cordova-plugin-whitelist cordova-plugin-statusbar cordova-plugin-device cordova-plugin-splashscreen cordova-plugin-ionic-webview cordova-plugin-ionic-keyboard
```

### Remove the Cordova Platforms

You will no longer be building the application using the Cordova platforms so you can remove them now.

```bash
$ npm uninstall cordova-android cordova-ios
```

### Remove Unused `@ionic-native` Services

Our project is not using any `@ionic-native` stuff, but now is a good time to make sure you have removed any `@ionic-native` packages that are associated with the plugins that you removed. In ideal situations, you will have removed all Cordova plugins and can remove all `@ionic-native` packages including `@ionic-native/core`. In other situations you may still be using some Cordova plugins and need to keep a few of the packages around. In that case, do not remove `@ionic-native/core`.

### Modify the `package.json` File

Open the `package.json` file and look for the `cordova` section. Remove the whole section. It will look something like the following:

```JSON
  "cordova": {
    "plugins": {
      "cordova-plugin-whitelist": {},
      "cordova-plugin-statusbar": {},
      "cordova-plugin-device": {},
      "cordova-plugin-splashscreen": {},
      "cordova-plugin-ionic-webview": {
        "ANDROID_SUPPORT_ANNOTATIONS_VERSION": "27.+"
      },
      "cordova-plugin-ionic-keyboard": {}
    },
    "platforms": [
      "ios",
      "android"
    ]
  }
```

While you are in there, find the build script. I like to add a `cap copy` command to it to ensure that my Capacitor projects are updated with each web build:

```JSON
    "build": "ng build && cap copy",
```

### Modify the `capacitor.config.ts` File

Remember all of those preferences that were copied over when we initially added the Capacitor integration? They look like this in the `capacitor.config.ts` file:

```typescript
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
```

Since we were able to remove all of the Cordova plugins in this project, we don't need any of those any more. So let's just remove the preferences but leave the actual object in the JSON in case we need them for a new plugin we add later.

```typescript
  cordova: {
    preferences: {},
  },
```

**Note:** In your own project, you may still need some preferences based on which Cordova plugins you still have left.

### Remove Unused Files

At this point, you no longer need any of the Cordova related files or folders in your project. You can remove all of the following:

- The `plugins` folder
- The `platforms` folder
- The `config.xml` file

```bash
$ rm -rf platforms plugins config.xml
```

## Conclusion

The application has been fully converted to Capacitor at this point.

In your own project, you may or may not still be including some Cordova plugins, but Capacitor is the only system being used to build the iOS and Android applications. You may also have various native interactions such as Push Notifications that need some special attention. Please see one of our other more targeted guides for those types of situation.

If you have further questions, please be sure to contact us so we can discuss setting up some advisory sessions to discuss any challenges you may be experiencing.
