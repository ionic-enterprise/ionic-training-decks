# Lab: Access Native APIs

In this lab, you will learn how to:

- Access native functionality with Capacitor
- Use the built-in Capacitor APIs to leverage native functionality
- Detect which platform the application is currently running on
- Create and use mock objects for unit testing

## Overview

There are several ways Capacitor can access native functionality:

- Using Capacitor APIs
- Installing and using Capacitor plugins
- Installing and using Cordova plugins
- Creating custom Capacitor plugins within native platform projects

We will make use of the out-of-the-box Capacitor APIs throughout this training to access native functionality.

## The Splash Screen

Capacitor applications are set to automatically hide the splash screen once the application starts. In some cases it makes sense to run some startup logic before the splash screen is hidden. We will run into such a case in a later lab, for now we will use the <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen API</a> to programmatically hide the splash screen from our application code.

To programmatically hide the splash screen we need to make modifications to the existing Capacitor configuration in addition to adding initialization logic to the `<App />` component.

### Update Capacitor Configuration

Open `capacitor.config.json`. Notice that under `plugins` there is an entry for `SplashScreen` configuration where `launchShowDuration` is set to zero. We no longer need that configuration property; replace it with the `launchAutoHide` property:

**`capacitor.config.json`**

```JSON
{
  ...
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false
    }
  },
  ...
}
```

This configuration property on the `SplashScreen` API tells Capacitor to prevent any sort of automatic hiding of the application's splash screen.

### Programmatically Hide the Splash Screen

Start by refactoring `App.test.tsx` to follow the pattern we established for the home page. Additionally, we will need to add the imports required to test the Capacitor Splash Screen API. Capacitor APIs are defined on the `Plugins` object of the `@capacitor/core` module:

**`App.test.tsx`**

```TypeScript
import { render } from '@testing-library/react';
import { Plugins } from '@capacitor/core';
import App from './App';

describe('<App />', () => {

});
```

The functionality of the Splash Screen API needs to be _mocked_ in order to test any logic that runs them. Introduce setup and teardown code to mock the API. A test will be added to assert that `SplashScreen.hide()` has been called:

```TypeScript
import { render } from '@testing-library/react';
import { Plugins } from '@capacitor/core';
import App from './App';

describe('<App />', () => {
  beforeEach(() => {
    (Plugins.SplashScreen as any) = jest.fn();
    (Plugins.SplashScreen.hide as any) = jest.fn();
  });

  describe('initialization', () => {
    it('should hide the splash screen', () => {
      const { container } = render(<App />);
      expect(container).toBeDefined();
      expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

The test fails as we have not implemented any logic. Let's go ahead and implement the logic required to make this test pass:

**`App.tsx`**

```TypeScript
import { useEffect } from 'react';
import { Plugins } from '@capacitor/core';
...

const App: React.FC = () => {
  useEffect(() => {
    const { SplashScreen } = Plugins;
    SplashScreen.hide();
  }, []);

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

Like the Capacitor Splash Screen API, we need to mock the `isPlatform` function such that it returns values our tests expect to test against:

**`App.test.tsx`**

```TypeScript
import { render } from '@testing-library/react';
import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/react';
import App from './App';

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
    expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});

describe('in an iOS context', () => {
  beforeEach(() => (isPlatform as any).mockImplementation(() => true));
  it('should hide the splash screen', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});

describe('in a web context', () => {
  beforeEach(() => (isPlatform as any).mockImplementation(() => false));
  it('should not hide the splash screen', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
  });
});
```

The last test fails; there is no conditional logic preventing `SplashScreen.hide()` from being called in the web context.

### Using `isPlatform`

Looking through the <a href="https://ionicframework.com/docs/react/platform#platforms" target="_blank">Platform API documentation</a> we see the list of all possible platform values `isPlatform` can return. Note that <a href="https://ionicframework.com/docs/react/platform#isplatform" target="_blank">isPlatform</a> can return true for multiple inputs. For instance, an iPad would return true for the `mobile`, `ios`, `ipad`, and `tablet` platforms.

Let's take this knowledge to update the `useEffect` in `App.tsx` to check if the application is being run in the `capacitor` platform:

```TypeScript
useEffect(() => {
  if (isPlatform('capacitor')) {
    const { SplashScreen } = Plugins;
    SplashScreen.hide();
  }
}, []);
```

## Conclusion

We have learned how to utilize Capacitor APIs in order to easily access native APIs and how to detect the platform the application is running on.

Build the application for a mobile device and give it a try! Next we will mock a user interface.
