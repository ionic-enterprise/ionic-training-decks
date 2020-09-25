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

By default, new Capacitor applications are set to automatically hide the application splash screen once the application is in a runnable state. In some cases it makes sense to run some startup logic before the splash screen is hidden. For example, you may want to conditionally determine the first page the user sees depending on if their user session is still valid. In that case, it makes sense to run the logic before dismissing the splash screen.

We'll eventually implement that scenario. For now, we will update the Capacitor configuration to prevent the splash screen from automatically hiding, and then use the Capacitor Splash Screen API to hide the splash screen from our application code.

- <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen API</a>

## Platform Specific Logic

The application we will be building is to work across iOS, Android, and web platforms. This presents a challenge as the web does not have an implementation for splash screens! Luckily, the Ionic Framework comes equipped with functionality that allows us to derive the currently running platform context at runtime, allowing developers to write code that targets specific platforms.

- <a href="https://ionicframework.com/docs/react/platform" target="_blank">Platform API</a>

## Programmatically Hide the Splash Screen

### Capacitor Configuration

Our first step will be to modify `capacitor.config.json` such that the splash screen will not automatically hide upon application launch:

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

## Style the Status Bar

### Test First

As we start writing our tests, let's refactor `App.test.tsx` to follow the same pattern we established writing unit tests for the Home page, adding a describe block for the component.

We'll need add the imports required to test the `StatusBar` Capacitor API. Capacitor APIs are defined on the `Plugins` object on the `@capacitor/core` module, so we will need to import that. Likewise, `@capacitor/core` provides a special enumeration of the different styles the status bar supports, so we will also need to import `StatusBarStyle`.

Each of our tests will need to mock status bar behavior, so we'll introduce setup and teardown code to mock the `StatusBar` Capacitor API.

When we are done, the test file should look like this:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { Plugins, StatusBarStyle } from '@capacitor/core';

describe('<App />', () => {
  beforeEach(() => {
    (Plugins.StatusBar as any) = jest.fn();
    (Plugins.StatusBar.setStyle as any) = jest.fn();
  });

  describe('initialization', () => {})

  afterEach(() => {
    (Plugins.StatusBar as any).mockRestore();
    (Plugins.StatusBar.setStyle as any).mockRestore();
  });
});
```

We don't have a test case yet, so let's add one that asserts that the status bar style has been set to "dark":

```TypeScript
  describe('initialization', () => {
    it('should style the status bar', () => {
      const { container } = render(<App />);
      const options = { style: StatusBarStyle.Dark };
      expect(container).toBeDefined();
      expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith(options);
    });
  });
```

Now that we have a failing test, it's time to code!

### Then Code

Our objective is to style the status bar during the initialization of `<App />`. We'll achieve this using the `useEffect` hook:

```TypeScript
import React, { useEffect } from 'react';
...
import { Plugins, StatusBarStyle } from '@capacitor/core';
...

const App: React.FC = () => {
  useEffect(() => {
    const { StatusBar } = Plugins;
    const styleStatusBar = async () => {
      await StatusBar.setStyle({ style: StatusBarStyle.Dark });
    };
    if (isPlatform('android')) styleStatusBar();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/home" component={Home} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Run the tests if they are not currently being watched, and our test passes.

## Detect the Running Platform

Ionic Framework contains functionality to detect what platform the application is being run on. This is extremely helpful in cases where you want to run specific logic on the web but not on devices, if you want to take advantage of a native capability not available to both platforms, etc. In our scenario, we want to detect if the application is being run on Android, and if so, style the status bar.

The utility function `isPlatform` from the `@ionic/react` module will let us know if the application is being run on a particular platform.

### Test First

Start by removing our existing unit test, and in it's place nest additional `describe` blocks to define the different platform scenarios to test for. Add a unit test to each `describe` block that tests the desired behavior based on the platform. Once complete, the `initialization` block should look as follows:

```TypeScript
  describe('initialization', () => {
    describe('in an Android context', () => {
       it('styles the status bar', () => {
        const { container } = render(<App />);
        const options = { style: StatusBarStyle.Dark };
        expect(container).toBeDefined();
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith(options);
      });
    });

    describe('in a non-Android hybrid mobile context', () => {
      it('does not style the status bar', () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
        expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
      });
    });

    describe('in a web context', () => {
      it('does not style the status bar', () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
        expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
      });
    });
  });
```

We need to import and mock the `isPlatform` function:

```TypeScript
...
import { isPlatform } from '@ionic/react';
jest.mock('@ionic/react', () => {
  const actual = jest.requireActual('@ionic/react');
  return { ...actual, isPlatform: jest.fn() };
});

describe('<App />', () => {
  ...
  describe('initialization', () => {
    describe('in an Android context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => true));
      ...
      afterEach(() => (isPlatform as any).mockRestore());
    });

    describe('in a non-Android hybrid mobile context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => false));
      ...
      afterEach(() => (isPlatform as any).mockRestore());
    });

    describe('in a web context', () => {
      beforeEach(() => (isPlatform as any).mockImplementation(() => false));
      ...
      afterEach(() => (isPlatform as any).mockRestore());
    });
  });
  ...
});
```

Jest has the ability to generate mocks of imported modules, as long as `jest.mock('moduleName')` is placed within the same scope as import statements. However, in our case we are only looking to mock out one function from the `@ionic/react` module. We cannot simply spy on `isPlatform` and mock the implementation, otherwise Jest will throw `TypeError: win.matchMedia is not a function`.

What we are doing in the test file is allowing Jest to automock `@ionic/react` for us, and using it's optional second parameter to modify the mock. Our modification takes the actual `@ionic/react` module and clones it into the mock, then we provide our mock implementation for `isPlatform`.

## Then Code

**Challenge:** Now that you have failing tests, modify `<App />` such that the tests pass.

## Conclusion

We have learned how to utilize Capacitor APIs in order to easily access native APIs and how to detect the platform the application is running on.

Build the application for an Android device and give it a try! Next we will learn how to style our application.
