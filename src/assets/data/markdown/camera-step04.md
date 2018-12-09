# Lab: Use the Capacitor API 

In this lab, you will:

* remove the Cordova plugin scaffolding
* use the Capacitor APIs
* update the tests to stub the Capactior APIs

## Remove the Cordova Plugin Scaffolding

The starter installed the core `ionic-native` package and some common wrappers. For a Cordova appication, the corresponding plugins would likely be added at some point in the development. The functionallity of these plugins is built into Capacitor, so we will not need them or their wrappers.

### `app.component.ts`

The `SplashScreen` and `StatusBar` Ionic Native wrappers are used in the `app.component.ts` file. Remove all mentions of them. The `this.platform.ready()` call is also no longer necessary.

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
j
### `app.module.ts`

The `SplashScreen` and `StatusBar` Ionic Native wrappers are no longer used by the application. Thus they no longer need to be provided here. Remove their imports as well. Also remove them from the list of `providers`.

The `app.module.ts` code should now look like this:

```TypeScript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### `package.json`

Find the following three lines in the `package.json` file and remove them:

```JSON
    "@ionic-native/core": "5.0.0-beta.21",
    "@ionic-native/splash-screen": "5.0.0-beta.21",
    "@ionic-native/status-bar": "5.0.0-beta.21",
```

Run `npm i` to update the `node_modules` directory.

## Use the Capacitor APIs

Capacitor has taken some of the most commonly used plugins and has included them in the Capacitor core as a set of APIs that are avaliable by default. This includes the Splash Screen and Status Bar plugins that we removed in the previous step.

To use any of the plugins from the Capacitor core:

* import the Plugins: `import { Plugins } from '@capacitor/core';`
* obtain references to the plugins: `const { SplashScreen, StatusBar } = Plugins;`
* call their methods: `await SplashScreen.hide();`

After replacing the Cordova plugin code that we removed from the starter, your `app.component.ts` should look like this:

```TypeScript
import { Component } from '@angular/core';
import { Plugins, StatusBarStyle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor() {
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

Build and run the project on an emulator to ensure that it still works properly.

```bash
ionic build
ionic capacitor copy
ionic capacitor open ios
```

## Update the Tests

The tests are broken. They are checking that the Cordova plugins are called properly but the application is now using the Capacitor API.

### Remove the Spies

```TypeScript
  let statusBarSpy, splashScreenSpy, platformReadySpy, platformSpy;

  beforeEach(async(() => {
    statusBarSpy = jasmine.createSpyObj('StatusBar', ['styleDefault']);
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StatusBar, useValue: statusBarSpy },
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: Platform, useValue: platformSpy },
      ],
    }).compileComponents();
  }));
```

```TypeScript
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [ ]
    }).compileComponents();
  }));
```

The spies were all used in a single test. Find that test and completely remove the four lines that use them.

### Create New Spies

The tests now pass, but the test that checks for proper initiaization of the app component does not actually do anything. In order to fix that, spies need to be created for the Capacitor APIs that we are using.

```TypeScript
  let originalSplashScreen;
  let originalStatusBar;

  kbeforeEach(async(() => {
    originalSplashScreen = Plugins.SplashScreen;
    originalStatusBar = Plugins.StatusBar;
    Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle']);
    Plugins.SplashScreen = jasmine.createSpyObj('StatusBar', ['hide']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    }).compileComponents();
  }));
```

```TypeScript
  afterEach(() => {
    Plugins.StatusBar = originalStatusBar;
    Plugins.SplashScreen = originalSplashScreen;
  });
```