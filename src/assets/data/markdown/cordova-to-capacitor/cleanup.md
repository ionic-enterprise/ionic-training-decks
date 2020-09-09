# Phase 2: Project Cleanup

Cleanup involves three main steps:

- Replace Cordova plugins with Capacitor Plugins or APIs where possible
- Configure remaining Cordova plugins where needed
- Remove the Cordova configuration and any plugins that are no longer being used

Let's jump right in.

## Replace Plugins

The first thing we should do in our cleanup efforts is to look for opportunities to use <a href="https://github.com/capacitor-community/" target="_blank">Capacitor Plugins</a> and <a href="https://capacitorjs.com/docs/apis" target="_blank">Capacitor's built in plugin APIs</a> instead of using Cordova plugins.

In the case of our application, the only Cordova plugins that are actively being used are the status bar and splash screen plugins. Both of these should be replaced with Capacitor Plugin API calls. This change involves the following modifications:

- Modify the `AppComponent` test to expect Capacitor API calls
- Modify the `AppComponent` itself to call the Capacitor APIs
- Modify the `AppComponentModule` to no longer provide the `@ionic-native` wrappers for the Cordova plugins

### Modify `src/app/app.component.spec.ts`

Import the `Plugins` object from `@capacitor/core`. In our case, we will also be styling the status bar, so we will need to import the `StatusBarStyle` enumeration.

```typescript
import { Plugins, StatusBarStyle } from '@capacitor/core';
```

Replace the current `beforeEach()` portion of the test with the following code:

```typescript
let originalSplashScreen: any;
let originalStatusBar: any;

beforeEach(async(() => {
  originalStatusBar = Plugins.StatusBar;
  originalSplashScreen = Plugins.SplashScreen;
  Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle']);
  Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
  TestBed.configureTestingModule({
    declarations: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      {
        provide: Platform,
        useFactory: () => jasmine.createSpyObj('Platform', { is: false })
      }
    ]
  }).compileComponents();
}));

afterEach(() => {
  Plugins.StatusBar = originalStatusBar;
  Plugins.SplashScreen = originalSplashScreen;
});
```

Replace the `should initialize the app` test with the following set of tests:

```typescript
describe('initialization', () => {
  let platform: Platform;
  beforeEach(() => {
    platform = TestBed.inject(Platform);
  });

  describe('in a hybrid mobile context', () => {
    beforeEach(() => {
      (platform.is as any).withArgs('hybrid').and.returnValue(true);
    });

    it('styles the status bar', () => {
      TestBed.createComponent(AppComponent);
      expect(Plugins.StatusBar.setStyle).toHaveBeenCalledTimes(1);
      expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith({ style: StatusBarStyle.Light });
    });

    it('hides the splash screen', () => {
      TestBed.createComponent(AppComponent);
      expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('in a web context', () => {
    beforeEach(() => {
      (platform.is as any).withArgs('hybrid').and.returnValue(false);
    });

    it('does not style the status bar', () => {
      TestBed.createComponent(AppComponent);
      expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
    });

    it('does not hide the splash screen', () => {
      TestBed.createComponent(AppComponent);
      expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
    });
  });
});
```

You should now clean up any unsed imports or variable declarations you may have. Your `AppComponent` tests will be failing at this point, but we will fix that next.

### Modify `src/app/app.component.ts`

You need to modify the `AppComponent` as such:

- You no longer need to import the `@ionic-native` services
- You need to call the Capacitor Plugin APIs instead of the `@ionic-native` services

Your final code should look like this:

```typescript
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    if (this.platform.is('hybrid')) {
      const { SplashScreen, StatusBar } = Plugins;
      SplashScreen.hide();
      StatusBar.setStyle({ style: StatusBarStyle.Light });
    }
  }
}
```

### Modify `src/app/app.module.ts`

Since nothing is referencing the `@ionic-native` services any more, they no longer need to be provided. Remove all references to them in this file as well.

- Remove the ES6 imports of them
- Remove the code that adds them to the `providers` array

## Configure Plugins

This step may or may not be required for your project. For the base Cordova project we are converting here it is not required at all. However, if it is required, common tasks include:

- Handling Cordova plugin preferences
- Handling additional `config.xml` items
- Handling Cordova hooks
- Handling plugin variables

### Handling Cordova Plugin Preferences

If any of your Cordova plugins require preferences to be set the `config.xml` file, those preferences should be set in the `cordova` section of the `capacitor.config.json` file. These should have been automatically copied over for you during Phase 1, but you may want to double check them. Here is what I have in my project:

```JSON
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

We are also no longer using any of the `@ionic-native` stuff (in your own project, you may or may not be still using some `@ionic-native` packages, so only remove `@ionic-native/core` here if all other `@ionic-native` packages are beging removed):

```bash
$ npm uninstall @ionic-native/core @ionic-native/status-bar @ionic-native/splash-screen
```

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

### Modify the `capacitor.config.json` File

Remember all of those preferences that were copied over when we initially added the Capacitor integration? They look like this in the `capacitor.config.json` file:

```JSON
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
```

Since we were able to remove all of the Cordova plugins in this project, we don't need any of those any more. So let's just remove the preferences but leave the actual object in the JSON in case we need them for a new plugin we add later.

```JSON
  "cordova": {
    "preferences": {
    }
  }
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

Your application has been fully converted to Capacitor at this point. You may or may not still be including some Cordova plugins, but Capacitor is the only system being used to build your iOS and Android applications for this project.
