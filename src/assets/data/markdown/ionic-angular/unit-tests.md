# Lab: Unit Tests

In this lab, you will learn how to:

- Setup headless support for Chrome
- Run the existing suite of unit tests
- Create and use mock objects
- Structure Unit Tests

## Set Up Headless Chrome Support

Using Chrome in headless mode allows the tests to run in a real browser (Chrome) without taking up valuable screen real estate with an actual browser window. Since there is no drawing being performed, the tests also tend to run faster. Finally, if tests are going to be run on a CI/CD server of some type, headless support is almost certainly required.

Setting up the tests to use headless Chrome is a straight forward process:

1. Optionally add a custom launcher to the `karma.conf.js` file
1. Add some testing scripts that use the custom launcher

### `karma.conf.js` (optional)

Some CI/CD servers will run into issues running `ChromeHeadless` as-is. The solution is to run it with the `--no-sandbox` option. Add a custom launcher called `ChromeHeadlessCI` right after the `browsers` array in the `src/karma.conf.js` file. It will look like this:

```JavaScript
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
```

_Note:_ This is only required in certain specific circumstances. See <a href="https://developers.google.com/web/updates/2017/04/headless-chrome" target="_blank">Getting Started with Headless Chrome</a> for details.

### `package.json`

I suggest changing the `test` script configuration in the `package.json` file as such:

- `test` - use the `ChromeHeadless` browser configuration, re-run the tests as changes are made
- `test:ci` - use the `ChromeHeadlessCI` browser configuration, run the tests once and exit
- `test:debug` - use the regular `Chrome` browser configuration, re-run the tests as changes are made

```JSON
  "scripts": {
    "build": "ng build",
    "e2e": "ng e2e",
    "lint": "ng lint",
    "ng": "ng",
    "start": "ng serve",
    "test": "ng test --browsers=ChromeHeadless",
    "test:ci": "ng test --no-watch --browsers=ChromeHeadlessCI",
    "test:debug": "ng test"
  },
```

## Run the Tests

With our current configuration, there are three convenient ways to run the tests:

- `npm test` - runs the tests in a headless environment and waits for changes. This is the default and should be used for most development.
- `npm run test:debug` - runs the tests in a visible browser and waits for changes. This configuration is most useful for debugging tests and the code being tested.
- `npm run test:ci` - runs the tests in a headless environment and exits. This is intended for use on your CI/CD server but is also useful for cases where you want to run the tests once.

Type `npm test` and verify that the tests run.

## Refactor `app.component.spec.ts`

### Use Mock Objects

- remove the existing spy variables
- import the platform mock factory: `import { createPlatformMock } from '../../test/mocks';`
- provide the `StatusBar` and `SplashScreen` via a factory: `{ provide: StatusBar, useFactory: () => jasmine.createSpyObj<StatusBar>('StatusBar', ['styleDefault']) }`
- provide the `Platform` via the factory: `{ provide: Platform, useFactory: createPlatformMock }`

```TypeScript
import { createPlatformMock } from '../../test/mocks';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StatusBar, useFactory: () => jasmine.createSpyObj<StatusBar>('StatusBar', ['styleDefault']) },
        { provide: SplashScreen, useFactory: () => jasmine.createSpyObj<SplashScreen>('SplashScreen', ['hide']) },
        { provide: Platform, useFactory: createPlatformMock }
      ]
    }).compileComponents();
  }));
```

- get the provided mock services. Example: `const platform = TestBed.inject(Platform);`
- use the mocks just obtained and not the former mock objects

```TypeScript
  it('should initialize the app', async () => {
    const platform = TestBed.inject(Platform);
    const statusBar = TestBed.inject(StatusBar);
    const splashScreen = TestBed.inject(SplashScreen);
    TestBed.createComponent(AppComponent);
    expect(platform.ready).toHaveBeenCalled();
    await platform.ready();
    expect(statusBar.styleDefault).toHaveBeenCalled();
    expect(splashScreen.hide).toHaveBeenCalled();
  });
```

The end result is that we are now using the standard `Platform` mock that we created to use throughout the application wherever we need to mock the `Platform` service. The next step is to break the test down to a `describe()` for the feature (initialization), and an `it()` case per requirement.

### Break-up the "should initialize the app" Test

Tests should be structured by feature with a seperate `it()` function covering each requirement. Here is an example:

```TypeScript
describe('my-module', () => {
  it('builds', () => {});

  describe('feature 1', () => {
    it('does something for requirement 1', () => {});
    it('does something else for requirement 1', () => {});
    it('does something for requirement 2', () => {});
    it('does something for requirement 3', () => {});
  });

  describe('feature 2', () => {
    ...
  });
});
```

_Note:_ it may take more than one `it()` to cover a requirement, but a single it should not itself try to test more than a single requirement.

The current "should initialize the app" test violates that a bit. Let's refactor it into a structure like this (I'll give you the code for the first test to get started):

```TypeScript
describe('initialization', () => {
  it('waits for the platform to be ready', () => {
    const platform = TestBed.inject(Platform);
    TestBed.createComponent(AppComponent);
    expect(platform.ready).toHaveBeenCalledTimes(1);
  });

  it('sets the default status bar style when ready', async () => {});
  it('hides the splash screen when ready', async () => {});
});
```

Refactor the current test into these test cases and let's compare notes when you are done. Was there any repetative code that could perhaps be refactored?

## Conclusion

In this lab we learned the basics of unit testing. We will apply what we learned here and expand upon it as we develop our application. Next we will take a peek at styling the application.
