# Lab: Access Native APIs

There are serveral ways to access native functionality from your Ionic Framework application:
- Use a Capacitor API
- Use a Capacitor Plugin
- Use a Cordova Plugin
- Create a custom Capacitor plugin in your native project

We are going to cover the first of these options.

In this lab you will learn how to use the Capacitor APIs

## Switch to Capacitor APIs

The App Component is currently using Cordova plugins and Ionic Native Community Edition wrappers in order to hide the splashscreen and configure the status bar. We should favor using Capacitor APIs when we can. Let's switch over to using the Capacitor APIs.

- <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen API</a>
- <a href="https://capacitorjs.com/docs/apis/status-bar" target="_blank">Status Bar API</a>

### Test First

The Capacitor APIs are defined on the `Plugin` object from `@capacitor/core` so we will need to import that.

```TypeScript
import { Plugins, StatusBarStyle } from '@capacitor/core';
```

We will use the `SplashScreen` and `StatusBar` API objects in our AppComponent, so we should create mocks for them in our test file. We should also remove the mocks for the existing `StatusBar` and `SplashScreen` services. When we are done, the test setup and teardown should look like this.

```TypeScript
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
        { provide: Platform, useFactory: createPlatformMock }
      ]
    }).compileComponents();
  }));

  afterEach(() => {
    Plugins.StatusBar = originalStatusBar;
    Plugins.SplashScreen = originalSplashScreen;
  });
```

With Capacitor, we do not have to wait for the Cordova `platformReady` event, so we won't need the test for it. We also will no longer be calling the `StatusBar` and `SplashScreen` services

**Remove these tests:**

```TypeScript
    it('waits for the platform to be ready', () => {
      TestBed.createComponent(AppComponent);
      expect(platform.ready).toHaveBeenCalledTimes(1);
    });

    it('sets the default status bar style when ready', async () => {
      const statusBar = TestBed.inject(StatusBar);
      TestBed.createComponent(AppComponent);
      await platform.ready();
      expect(statusBar.styleDefault).toHaveBeenCalledTimes(1);
    });

    it('hides the splash screen when ready', async () => {
      const splashScreen = TestBed.inject(SplashScreen);
      TestBed.createComponent(AppComponent);
      await platform.ready();
      expect(splashScreen.hide).toHaveBeenCalledTimes(1);
    });
```

The behavior should be such that when the app is running in a hybrid mobile context it dismisses the splash screen. Further, when it is running on Android it styles the status bar. When it is not running in a hybrid mobile context, then it does neither. The new `initialization` tests should look like this.


```TypeScript
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
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith({ style: StatusBarStyle.Dark });
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

### Then Code 

**Challenge:** now that you have failing tests, modify the `AppComponent` such that the tests pass. The completed `AppComponent` can be found online, but try to complete the challenge without looking.

## Cleanup

We have removed the `@ionic-native` Cordova plugin services from the component and the test. The only place that they are still referenced is in the `src/app/app.module.ts` file. Let's remove those references as well and then uninstall them entirely.

When complete, the `src/app/app.module.ts` file should look something like this:

```typescript
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

Use `npm uninstall` to completely remove the `@ionic-native` Cordova plugin wrappers and core.

```bash
$ npm uninstall @ionic-native/{core,status-bar,splash-screen}
```

**Note:** The above command works on most Bash-like shells. Windows users who are using a command prompt, you may have to specify each package entirely.

## Conclusion

We have learned how to utilize Capacitor APIs in order to easily access native mobile APIs.

Build the application for a mobile device and give it a try.
