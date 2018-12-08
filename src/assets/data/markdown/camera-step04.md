# Lab: Running Tests

In this lab, you will:

* remove the Cordova plugin scaffolding
* use the Capacitor APIs
* update the tests to stub the Capactior APIs (optional)

## Remove the Cordova Plugin Scaffolding

The starter installed the core `ionic-native` package and some common wrappers. For a Cordova appication, the corresponding plugins would likely be added at some point in the development. The functionallity of these plugins is built into Capacitor, so we will not need them or their wrappers.

### `package.json`

Find the following three lines in the `package.json` file and remove them:

```JSON
    "@ionic-native/core": "5.0.0-beta.21",
    "@ionic-native/splash-screen": "5.0.0-beta.21",
    "@ionic-native/status-bar": "5.0.0-beta.21",
```

Run `npm i` to update the `node_modules` directory.

### `app.component.ts`

The `SplashScreen` and `StatusBar` wrappers are used in the `app.component.ts` file. Remove all mentions of them. The `this.platform.ready()` call is also no longer necessary.

Whe complete, the `app.compnent.ts` file should look like this:

```TypeScript
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {}
}
```

## Use the Capacitor APIs

Capacitor has taken some of the most commonly used plugins and has included them in the Capacitor core as a set of APIs that are avaliable by default. This includes the Splash Screen and Status Bar plugins that we removed in the previous step.

To use any of the plugins from the Capacitor core:

* import the Plugins: `import { Plugins } from '@capacitor/core';`
* obtain references to the plugins: `const { SplashScreen, StatusBar } = Plugins;`
* call their methods: `await SplashScreen.hide();`

After replacing the Cordova plugin code that we removed from the starter, your `app.component.ts` should look like this:

```TypeScript
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    const { SplashScreen, StatusBar } = Plugins;
    try {
      await SplashScreen.hide();
      await StatusBar.setStyle({ style: StatusBarStyle.Dark });
    } catch (err) {
      console.log('This is normal in a browser', err);
    }
  }
}
```

## Update the Tests