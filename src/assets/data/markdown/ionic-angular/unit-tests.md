# Lab: Unit Testing Infrastructure

In this lab, you will learn how to:

- Setup headless support for Chrome
- Run the existing suite of unit tests
- Install some centralized mock factories

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

## Update the `HomePage` Test

Let's add a simple test to the `HomePage` test. This test will:

- Use the `debugElement` to query the DOM for the `ion-title`
- Peek at the `textContent` of the title's native element and make sure it is correct

This is a very simple test involving the page's DOM, but it will give you an idea of the types of DOM level testing we can do.

Add the following to the `src/app/home/home.page.spec.ts` file:

```TypeScript
...
import { By } from '@angular/platform-browser';
...
  it('displays the correct title', () => {
    const titles = fixture.debugElement.queryAll(By.css('ion-title'));
    expect(titles.length).toBe(2);
    expect(titles[0].nativeElement.textContent.trim()).toBe('Blank');
    expect(titles[1].nativeElement.textContent.trim()).toBe('Blank');
  });
```

That new test case should go directly under the existing "should create" test case.

While in this file, remove the `forRoot()` from the import of the `IonicModule` when the `TestBed` is configured. It is not required here.

```diff
-        imports: [IonicModule.forRoot()],
+        imports: [IonicModule],
```

You should be able to do this in any component or page test that you add to the project, though I will not remind you to do so each time. That will be up to you.

## Install Mock Factories

I favor the use of centralized factory functions to create mocks whenever it makes sense. This allows me to use a consistently defined mock throughout the tests in my application and reduces maintenance costs. For this application, I provide a set of centralized mock factories. <a download href="/assets/packages/ionic-angular/test.zip">Download the zip file</a> and unpack it in the root of the project creating a `test` folder.

Once that is in place it is often used within the `TestBed` configuration in order to provide the mock object instead of the real object for various dependencies. For example:

```TypeScript
...
import { SomeComponent } from './some.component';
import { createPlatformMock } from '../../test/mocks';

describe('SomeComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SomeComponent],
      providers: [
        { provide: Platform, useFactory: createPlatformMock }
      ]
    }).compileComponents();
  }));
...
```

## Conclusion

In this lab we confiured our basic testin infrastructure and added a simple test. We will expand on our testing as we develop our application. As such, we will learn more unit testing techniques hand as we develop the code.
