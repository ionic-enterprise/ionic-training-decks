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

## Programmatically Hide the Splash Screen

To programmatically hide the splash screen, we first need to modify our existing Capacitor configuration and add some initialization logic to the `<App />` component.

### Capacitor Configuration

Our first step will be to modify `capacitor.config.json` such that the splash screen will not automatically hide upon application launch. Replace the existing `"launchShowDuration"` property with `"launchAutoHide"`:

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

### Test First

As we start writing tests, let's refactor `App.test.tsx` to follow the same pattern we established for the home page. We will need to add the imports required to test the `SplashScreen` Capacitor API. Capacitor APIs are defined on the `Plugins` object of the `@capacitor/core` module, so we will need to import that.

Each of our tests will need to mock splash screen behavior so we will introduce setup and teardown code to mock the `SplashScreen` Capacitor API.

Once complete, the test file should look like this:

**`App.test.tsx`**

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { Plugins } from '@capacitor/core';
import App from './App';

describe('<App />', () => {
  beforeEach(() => {
    (Plugins.SplashScreen as any) = jest.fn();
    (Plugins.SplashScreen.hide as any) = jest.fn();
  });

  describe('initialization', () => {})

  afterEach(() => {
    (Plugins.SplashScreen as any).mockRestore();
    (Plugins.SplashScreen.hide as any).mockRestore();
  });
});
```

We don't have a test case yet, so let's add one that asserts that the `hide()` method of `SplashScreen` has been called:

```TypeScript
  ...
  describe('initialization', () => {
    it('should hide the splash screen', () => {
      const { container } = render(<App />);
      expect(container).toBeDefined();
      expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

Now that we have a failing test, we can go ahead and implement the logic.

### Then Code

Our objective is to hide the splash screen during the initialization of the application. We can achieve this by using React's `useEffect` hook from our main app component:

**`App.tsx`**

```TypeScript
import React, { useEffect } from 'react';
...
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

Run the tests if they are not currently being watched, and our test passes.

**Note:** Throughout the training, it is recommended that you both serve the application (`ionic serve`) and run the test script in "watch" mode (`npm run test`). You will be prompted to terminate and restart these processes when needed.

## Detect the Running Platform

Ionic Framework contains functionality to detect what platform the application is being run on. This is extremely helpful in cases where you want to run specific logic on the web but not on devices, if you want to take advantage of a native capability not available to both platforms, etc. In our scenario, we want to detect if the application is being run on a mobile device, and if so hide the splash screen.

The utility function `isPlatform` from the `@ionic/react` module will let us know if the application is being run on a particular platform.

- <a href="https://ionicframework.com/docs/react/platform" target="_blank">Platform API</a>

### Test First

Start by removing our existing unit test, and in it's place nest additional `describe` blocks to define the different platforms to test for. Add a unit test to each `describe` block that tests the desired behavior based on platform. Once complete, the final `initialization` block should look like this:

**`App.test.tsx`**

```TypeScript
  ...
  describe('initialization', () => {
    describe('in an Android context', () => {
      it('should hide the splash screen', () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });
    });

    describe('in an Android context', () => {
      it('should hide the splash screen', () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });
    });

    describe('in a web context', () => {
      it('should not hide the splash screen', () => {
        const { container } = render(<App />);
        expect(container).toBeDefined();
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      });
    });
    ...
```

Now we need to import and mock the `isPlatform` function:

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

    describe('in an iOS context', () => {
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

Jest has the ability to generate mocks of imported modules, as long as `jest.mock('moduleName')` is placed within the same scope as import statements. In our case we are only looking to mock out one function from the `@ionic/react` module. We cannot simply spy on `isPlatform` and mock the implementation, otherwise Jest will throw an error: `TypeError: win.matchMedia is not a function`.

What we are doing in the test file is allowing Jest to generate a mock of `@ionic/react` for us, and using it's optional second parameter to modify the mock. Our modification takes the actual `@ionic/react` module and clones it into the mock, then we provide our mock implementation for `isPlatform`.

## Then Code

**Challenge:** Look through the <a href="https://ionicframework.com/docs/react/platform#platforms" target="_blank">Platform API documentation</a> and modify `App.tsx` such that the failing test cases pass.

## Conclusion

We have learned how to utilize Capacitor APIs in order to easily access native APIs and how to detect the platform the application is running on.

Build the application for a mobile device and give it a try! Next we will mock a user interface.
