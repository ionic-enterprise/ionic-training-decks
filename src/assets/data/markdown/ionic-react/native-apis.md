# Lab: Access Native APIs

In this lab, you will learn how to:

- Access native functionality with Capacitor
- Detect which platform the application is currently running on
- Create and use mock objects for unit testing

## Overview

There are several ways Capacitor can access native functionality:

- Install and use an official Capacitor plugin
- Install and use a community Capacitor plugin
- Install and use a Cordova plugin
- Create a custom Capacitor plugin

Throughout this training we will exclusively use the set of <a href="https://capacitorjs.com/docs/apis" target="_blank">Capacitor Official Plugins</a>.

## The Splash Screen Plugin

Capacitor applications are set to automatically hide the splash screen once the application starts. In certain scenarios it makes sense to run some startup logic in our application while the splash screen is still visible, and then dismiss the splash screen once that logic has finished running. This will be the case in the application we build.

The splash screen can be programmatically hidden (or shown) through the use of the <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen Capacitor API plugin</a>.

Install the plugin into your application:

```bash
$ npm install @capacitor/splash-screen
$ npx cap sync
```

### Update Capacitor Configuration

Some Capacitor plugins have options that configure how the plugin works at runtime. Plugin configuration options are added to the application's `capacitor.config.ts` file.

Update the application's `CapacitorConfig` object so it does not dismiss the splash screen at application launch:

**`capacitor.config.ts`**

```TypeScript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.teataster',
  appName: 'Tea Tasting Notes',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
```

### Programmatically Hide the Splash Screen

Start by refactoring `App.test.tsx` to follow the pattern we established for the home page. Additionally, we will need to add the import required to test the splash screen plugin:

**`App.test.tsx`**

```TypeScript
import { render } from '@testing-library/react';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';

describe('<App />', () => { });
```

The functionality of the splash screen plugin needs to be mocked in order to test pieces of logic that call it. Introduce setup and teardown code to mock the plugin's API, and add a test to assert that `SplashScreen.hide()` has been called:

```TypeScript
import { render } from '@testing-library/react';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';

jest.mock('@capacitor/splash-screen');

describe('<App />', () => {
  beforeEach(() => (SplashScreen.hide = jest.fn()));

  describe('initialization', () => {
    it('should hide the splash screen', () => {
      const { container } = render(<App />);
      expect(container).toBeDefined();
      expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

The test fails as we have not implemented any logic. Let's go ahead and implement the logic required to make this test pass:

**`App.tsx`**

```TypeScript
import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
...

const App: React.FC = () => {
  useEffect(() => { SplashScreen.hide(); }, []);

  return (
    <IonApp>
      ...
    </IonApp>
  );
};

export default App;
```

The test passes! The process of writing tests first then going back to implement logic to make the tests pass is known as Test Driven Development (TDD). This training will continue using the TDD approach to software development.

## Detect the Running Platform

There is no notion of a splash screen for the web. Wouldn't it be nice if we only hid the splash screen when the application is running on iOS or Android?

The Ionic Framework contains functionality to detect what platform the application is being run on through the <a href="https://ionicframework.com/docs/react/platform" target="_blank">Platform API</a>. The utility function `isPlatform` will let us know if the application is being run on a particular platform.

### Mocking `isPlatform`

Like the Splash Screen Capacitor API plugin, we need a mock for the `isPlatform` function such that it returns values our tests expect to test against:

**`App.test.tsx`**

```TypeScript
import { render } from '@testing-library/react';
import { SplashScreen } from '@capacitor/splash-screen';
import { isPlatform } from '@ionic/react';
import App from './App';

jest.mock('@capacitor/splash-screen');
jest.mock('@ionic/react', () => {
  const actual = jest.requireActual('@ionic/react');
  return { ...actual, isPlatform: jest.fn() };
});

...
```

Remove the 'should hide the splash screen' test from the 'initialization' describe block, and replace it with the following series of tests:

```TypeScript
describe('in an Android context', () => {
  beforeEach(() => (isPlatform as any).mockImplementation(() => true));
  it('should hide the splash screen', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});

describe('in an iOS context', () => {
  beforeEach(() => (isPlatform as any).mockImplementation(() => true));
  it('should hide the splash screen', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});

describe('in a web context', () => {
  beforeEach(() => (isPlatform as any).mockImplementation(() => false));
  it('should not hide the splash screen', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(SplashScreen.hide).not.toHaveBeenCalled();
  });
});
```

The last test fails; there is no conditional logic preventing `SplashScreen.hide()` from being called in the web context.

### Using `isPlatform`

Looking through the <a href="https://ionicframework.com/docs/react/platform#platforms" target="_blank">Platform API documentation</a> we see the list of all possible platform values `isPlatform` can return. Note that <a href="https://ionicframework.com/docs/react/platform#isplatform" target="_blank">isPlatform</a> can return true for multiple inputs. For instance, an iPad would return true for the `mobile`, `ios`, `ipad`, and `tablet` platforms.

Let's take this knowledge to update the `useEffect` in `App.tsx` to check if the application is being run in the `capacitor` platform:

```TypeScript
useEffect(() => { if (isPlatform('capacitor')) SplashScreen.hide(); }, []);
```

**Note:** `import` statements may be omitted from code samples for brevity. Most IDEs will prompt you when your code is using functionality from a module that needs to be imported. Should you get stuck with any imports, please let your instructor know.

## Conclusion

We have learned how to utilize Capacitor plugins in order to easily access native APIs and how to detect the platform the application is running on.

Build the application for a mobile device and give it a try! Next we will mock a user interface.
