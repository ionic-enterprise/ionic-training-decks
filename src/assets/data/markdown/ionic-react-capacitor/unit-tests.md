# Lab: Unit Tests

In this lab, you will learn how to:

* Run the existing suite of unit tests
* Structure Unit Tests
* Add component unit tests

## Run the Tests

The application is configured to use [jest](https://jestjs.io) to run our tests. The `npm test` script will run all of our tests and then watch for changes to the code.

Type `npm test` and verify that the tests run.

If you would like to run the tests once without the watch, you can do something like this: `(export CI=true; npm test)`

If you would like to, you could also set up various other `test` scripts in your `package.json` file that would run the tests for you in various ways. For example:

```
    "test": "react-scripts test",
    "test:ci": "export CI=true; react-scripts test",
    "test:cov": "export CI=true; react-scripts test --coverage",
    "test:upd": "export CI=true; react-scripts test --updateSnapshot"
```

## The Jest VSCode Extension

If you are using VSCode as your editor, a <a href="https://github.com/jest-community/vscode-jest" target="_blank">Jest extension</a> exists that will, among other actions, automatically run the tests for you and report on the status.

## Test Structure

The basic Jest test structure is a sinlge file with Setup and Teardown code and individual tests cases. Jest also supports grouping test cases together in nested blocks, which allows you to group test together by functionality.

### Setup and Teardown

Often when writing tests there is some initialization that needs to occur before each test is run and some cleanup that needs to occur after each test has been run. Jest provides the following methods to do this:

- `beforeAll` - run once before any test in the file or group
- `beforeEach` - run before each test in the file or group
- `afterAll` - run once at the completion of all tests in the file or group
- `afterEach` - run after the completion of each test in the file or group

### Grouping Tests

Sometimes tests logically belong grouped together. For example, tests that exercise a particular method. Often these are tests that also need to share specific setup or and teardown code. Tests are grouped together using the `describe()` method. Some important aspects of a `describe()` group are:

- they can be nested inside of another group
- they can have their own setup and teardown routines which are run in addition to the setup and teardown of the file or enclosing groups

## Refactor `App.test.tsx`

### Setup and Teardown Code

The `App.test.tsx` test does not require any setup or teardown code. We will add tests later that require this, and will revisit setup and teardown code at that time.

### Simplify the "renders without crashing" Test

Install the <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank">React Testing Library</a> to help us simplify our testing. 

```
npm i @testing-library/react -D
```

Import the renderer from this library into the `App.test.tsx` file and use it to simplify the current test:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

it('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container.innerHTML).toBeTruthy();
})
```

### Test the Tabs

We can query the DOM in order to make sure the component is rendering correctly.

```TypeScript
it('contains three tabs', () => {
  const { container } = render(<App />);
  expect(container.querySelectorAll('ion-tab-button').length).toEqual(3);
});
```

If we have a test that is highly repetative using the same logic across differing data, we can use `it.each()` to supply an array of values to use for the test.

```TypeScript
it.each([
  [0, 'Tab One'],
  [1, 'Tab Two'],
  [2, 'Tab Three']
])('contains the proper text for tab %i', (tab, text) => {
  const { container } = render(<App />);
  expect(container.querySelectorAll('ion-tab-button')[tab as number].textContent).toEqual(text);
});
```

### Snapshot Tests

We can also create snapshots of the component under specific conditions and compare them as we modify the application. Add a test like this to your file:

```TypeScript
it('renders consistently', () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
```

When the tests run, if a change is made that changes the way your component renders, this test will fail. If the change is due intentional, there are a couple of ways to update the snapshots:

- If you are using the VSCode Jest plugin, it will display a toast asking you if you would like to update the snapshots
- If you are running the tests interactively, pressing `u` will update the snapshots
- You can manually update the snapshots via a command like `(export CI=true; npm test -- --updateSnapshot)`
- You can create a command in your `package.json` file like we did at the start of this section and run that

## Conclusion

In this lab we learned the basics of unit testing. We will apply what we learned here and expand upon it as we develop our application. Next we will perform some basic styling for our application.
