# Lab: Unit Testing Infrastructure

In this lab, you will learn how to:

- Setup headless support for Chrome
- Run the existing suite of unit tests
- Install some centralized mock factories

## Set Up Headless Chrome Support

Using Chrome in headless mode allows the tests to run in a real browser (Chrome) without taking up valuable screen real estate with an actual browser window. Since there is no physical rendering being performed, the tests also tend to run faster. Finally, if tests are going to be run on a CI/CD server of some type, headless support is almost certainly required.

We suggest changing the `browsers` configuration in the `karma.conf.js` file as such:

```javascript
...
    browsers: ['ChromeHeadless'],
...
```

We also suggest modifying the `test` scripts in the `package.json` file as such:

```json
  "scripts": {
    ...
    "test": "ng test",
    "test:ci": "ng test --no-watch",
    "test:debug": "ng test --browsers=Chrome",
    "watch": "ng build --watch --configuration development"
  },
```

## Run the Tests

With our current configuration, there are three convenient ways to run the tests:

- `npm test` - runs the tests in a headless environment and waits for changes. This is the default and should be used for most development.
- `npm run test:debug` - runs the tests in a visible browser and waits for changes. This configuration is most useful for debugging tests and the code being tested.
- `npm run test:ci` - runs the tests in a headless environment and exits. This is intended for use on your CI/CD server but is also useful for cases where you want to run the tests once.

Type `npm test` and verify that the tests run. We will keep that running as we develop the application such that we are always running our tests and verifying that each step is correct. Continually running unit tests while your application is under development is an important _best practice_ that should always be followed.

## Update the `HomePage` Test

Let's add a simple test to the `HomePage` test. This test will:

- Use the `debugElement` to query the DOM for the `ion-title`
- Peek at the `textContent` of the title's native element and make sure it is correct

This is a very simple test involving the page's DOM, but it will give you an idea of the type of DOM level testing Angular allows us to do.

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

## Install Mock Factories

It is a _best practice_ to use centralized factory functions to create mocks whenever it makes sense. This allows us to use a consistently defined mock throughout the tests in our application and reduces maintenance costs. For this application, we provide a set of centralized mock factories. <a download href="/assets/packages/ionic-angular/test.zip">Download the zip file</a> and unpack it in the root of the project creating a `test` folder.

The items in that folder are often used within the `TestBed` configuration in order to provide the mock object instead of the real object for various dependencies. For example:

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

In this lab we configured our basic testing infrastructure and added a simple test. We will expand on our testing as we develop our application. As such, we will learn more unit testing techniques hand as we develop the code.
