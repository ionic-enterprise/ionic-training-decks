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

Capacitor applications are set to automatically hide the splash screen once the application starts. In certain scenarios it makes sense to run some startup logic in our application while the splash screen is still visible, and then dismiss the splash screen once that logic has finished running. This will be the case in the application we build, as we will see later on.

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

```typescript
/// <reference types="@capacitor/splash-screen" />

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.teataster',
  appName: 'Tea Tasting Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
```

## Programmatically Hide the Splash Screen

### Mock the Plugin

This training practices test-driven development (TDD), the process of writing tests first and then going back to implement logic to make the tests pass.

In the spirit of test-driven development, let's start off by creating a mock for `@capacitor/splash-screen` so we can properly test any piece of functionality that uses it.

Create a new folder at the root of the project named `__mocks__/@capacitor` and add a file `splash-screen.ts` to it:

```bash
mkdir -p __mocks__/@capacitor
touch __mocks__/@capacitor/splash-screen.ts
```

Populate `__mocks__/@capacitor/splash-screen.ts` with the mock below.

```typescript
import { vi } from 'vitest';

const hide = vi.fn().mockResolvedValue(undefined);
const show = vi.fn().mockResolvedValue(undefined);

export const SplashScreen = { hide, show };
```

This type of mock is called a "manual mock", and many test frameworks (such as Vitest) use this file directory structure to pull in mock versions of modules in test files.

### The Splash Container

Create a new folder `src/components/splash`. In it, create two new files: `SplashContainer.tsx` and `SplashContainer.test.tsx`:

```bash
mkdir src/components/splash
touch src/components/splash/SplashContainer.tsx
touch src/components/splash/SplashContainer.test.tsx
```

Scaffold out the component like so:

```tsx
import { ReactNode } from 'react';

type Props = { children?: ReactNode };

const SplashContainer = ({ children }: Props) => {
  return <>{children}</>;
};
export default SplashContainer;
```

Import it into `src/App.tsx` and adjust the component template so `<SplashContainer />` wraps `<IonReactRouter />`:

```tsx
...
import SplashContainer from './components/splash/SplashContainer';

setupIonicReact();

const App: React.FC = () => {
  <IonApp>
    <SplashContainer>
      <IonReactRouter>
        ...
      </IonReactRouter>
    </SplashContainer>
  </IonApp>
};
```

### Hide the Splash Screen

Let's put our `@capacitor/splash-screen` mock to work. Open `src/components/splash/SplashContainer.test.tsx` and add the following test:

```typescript
import { vi } from 'vitest';
import { SplashScreen } from '@capacitor/splash-screen';
import { render } from '@testing-library/react';
import SplashContainer from './SplashContainer';

vi.mock('@capacitor/splash-screen');

describe('<SplashContainer />', () => {
  it('should hide the splash screen', () => {
    render(<SplashContainer />);
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});
```

Note `vi.mock('@capacitor/splash-screen')`. This line of code tells Vitest that we want to use a mock of the imported `@capacitor/splash-screen` module, and not the real deal. Vitest looks within the `__mocks__` folder, finds `@capacitor/splash-screen.ts`, and uses it instead of the actual implementation for this file. Pretty neat!

The test will fail, as we would expect with TDD. Let's do the bare minimum to make the test pass by tweaking `src/components/splash/SplashContainer.tsx`:

```tsx
import { SplashScreen } from '@capacitor/splash-screen';
import { ReactNode, useEffect } from 'react';

type Props = { children?: ReactNode };

const SplashContainer = ({ children }: Props) => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return <>{children}</>;
};
export default SplashContainer;
```

## Detect the Running Platform

There is no notion of a splash screen for the web. Wouldn't it be nice if we only hid the splash screen when the application is running on iOS or Android?

The Ionic Framework contains functionality to detect what platform the application is being run on through the <a href="https://ionicframework.com/docs/react/platform" target="_blank">Platform API</a>. The utility function `isPlatform` will let us know if the application is being run on a particular platform.

### Mocking `isPlatform`

Just like the Splash Screen Capacitor plugin, we need to supply a mock for the `isPlatform` method provided by `@ionic/react`. We'll take advantage of "automatic mocking" this time.

First, add `import { isPlatform } from '@ionic/react';` to your list of imports, then add the following code to `src/components/splash/SplashContainer.tsx`, below `vi.mock('@capacitor/splash-screen');`:

```typescript
vi.mock('@ionic/react', async (getOriginal) => {
  const original: any = await getOriginal();
  return { ...original, isPlatform: vi.fn() };
});
```

Delete the existing "should hide the splash screen" test. We want to test two different scenarios now: if the app is running on a mobile device, we want `SplashScreen.hide` to be called, and if the app is running on the web, we don't want to make that call at all.

Add two separate `describe()` blocks, one per scenario:

```typescript
describe('<SplashContainer />', () => {
  beforeEach(() => vi.clearAllMocks);

  describe('in a mobile context', () => {
    beforeEach(() => (isPlatform as Mock).mockReturnValue(true));

    it('should hide the splash screen', () => {
      render(<SplashContainer />);
      expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('in a web context', () => {
    beforeEach(() => (isPlatform as Mock).mockReturnValue(false));

    it('should not hide the splash screen', () => {
      render(<SplashContainer />);
      expect(SplashScreen.hide).not.toHaveBeenCalled();
    });
  });
});
```

Notice the `beforeEach()` statements. The first one tells the test runner to clear any mock values set during the execution of any test we run. This is good form, you wouldn't want a mocked value to leak outside of it's individual test. The `beforeEach()` statement in the `in a mobile context` describe block tells Vitest that anytime `isPlatform()` is called, it should return `true`. The third `beforeEach()` statement is the inverse.

### Using `isPlatform`

Looking through the <a href="https://ionicframework.com/docs/react/platform#platforms" target="_blank">Platform API documentation</a> we see the list of all possible platform values `isPlatform` can return. Note that <a href="https://ionicframework.com/docs/react/platform#isplatform" target="_blank">isPlatform</a> can return true for multiple inputs. For instance, an iPad would return true for the `mobile`, `ios`, `ipad`, and `tablet` platforms.

Using this knowledge, update the `useEffect` in `src/components/splash/SplashContainer` to check if the application is being run in a `hybrid` context. If so, then and only then will we call `SplashScreen.hide`.

```typescript
useEffect(() => {
  isPlatform('hybrid') && SplashScreen.hide();
}, []);
```

**Note:** `import` statements may be omitted from code samples for brevity. Most IDEs will prompt you when your code is using functionality from a module that needs to be imported. Should you get stuck with any imports, please let your instructor know.

## Conclusion

We have learned how to utilize Capacitor plugins in order to easily access native APIs and how to detect the platform the application is running on.

Build the application for a mobile device and give it a try! Next we will mock a user interface.
