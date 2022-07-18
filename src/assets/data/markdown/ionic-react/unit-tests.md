# Lab: Unit Tests

In this lab, you will learn how to:

- Support continuous integration, code coverage, and snapshot testing
- Run the existing suite of unit tests in the application
- Structure, group, and place unit tests for the application
- Write unit tests for the Home page component

## Overview

Ionic Framework React applications use [Jest](https://jestjs.io) as it's testing framework and runner. <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank"> React Testing Library</a> is included to write unit tests that test React components.

The `npm test` script will run all of our tests and then watch for changes to the code.

## Setup CI, Coverage, and Snapshot Support

If you would like to run tests once without the watch, you can do something like this: `(export CI=true; npm test)`. There are additional options to capture code coverage and to update component snapshots during the test run.

I suggest adding additional test script configurations in the `package.json` file like so:

- `test` - Use the default configuration, re-run the tests as changes are made
- `test:ci` - Use the default configuration, run the tests once and exit
- `test:cov` - Collect and report code coverage information, run the tests once and exit
- `test:upd` - Regenerate snapshots, run the tests once and exit

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "eject": "react-scripts eject",
  "prepare": "husky install",
  "test": "react-scripts test --transformIgnorePatterns 'node_modules/(?!(@ionic/react|@ionic/react-router|@ionic/core|@stencil/core|ionicons)/)'",
  "test:ci": "export CI=true; npm run test",
  "test:cov": "export CI=true; npm run test -- --coverage",
  "test:upd": "exportCI=true; npm run test -- --updateSnapshot"
},
```

## Run the Tests

With our updated configuration, there are four convenient ways to run the tests:

- `npm test` - Runs the tests and waits for changes. This is the default and should be used for most development.
- `npm run test:ci` - Runs the tests and exits. This is intended for use on your CI/CD server but is also useful for cases where you want to run the tests once.
- `npm run test:cov` - Runs the tests and collects coverage information. This is intended for use on your CI/CD server but is also useful for cases where you want to identify non-tested areas.
- `npm run test:upd` - Runs the tests and regenerates failed snapshots. This is intended for use when component markup is modified and you have tests that assert against the composition of components.

Enter `npm test` and verify that the tests run.

### Jest VSCode Extension

If you are using Visual Studio Code as your editor, a [Jest extension](https://github.com/jest-community/vscode-jest) exists that will (among other things) automatically run the tests for you and report on the status.

## Structuring Unit Tests

Jest test structure calls for a single file containing setup/teardown code and individual test cases to be created per project file. Jest supports grouping test cases together in nested blocks which allows you to group tests together by functionality.

### Setup and Teardown

Often when writing tests some initialization logic needs to occur before each test is run, and some cleanup needs to occur after each test has been run. Jest provides the following methods to do this:

- `beforeAll` - Run once before any test in the file or group
- `beforeEach` - Run before each test in the file or group
- `afterAll` - Run once at the completion of all tests in the file or group
- `afterEach` - Run after the completion of each test in the file or group

### Grouping Tests

Sometimes tests logically belong grouped together; for example, tests that exercise a particular method. Often these are tests that need to share specific setup and/or teardown code. Tests are grouped together using the `describe()` method in Jest.

Some important aspects of a `describe()` group are:

- They can be nested inside of another group
- They can have their own setup and teardown routines which are run in addition to the setup/teardown of the file or enclosing groups

## Test the Home Page

Start by creating a new file `Home.test.tsx` in the `src/pages` folder. Here we will add required imports and insert a `describe()` block where we can group tests for this component:

**`src/pages/Home.test.tsx`**

```Typescript
import { render } from '@testing-library/react';
import Home from './Home';

describe('<Home />', () => { });
```

### Test the Header

The home page has it's header text set to "Blank". Let's write a test that verifies that the header text renders with the correct text:

```Typescript
describe('<Home />', () => {
  it('displays the header', () => {
    const { container } = render(<Home />);
    expect(container).toHaveTextContent(/Blank/);
  });
});
```

### Add Snapshot Test

We can also create snapshots of the component under specific conditions and compare them as we modify the application. Add the following test inside the `describe()` block, under the test previously created:

```TypeScript
it('renders consistently', () => {
  const { asFragment } = render(<Home />);
  expect(asFragment()).toMatchSnapshot();
});
```

If a change had been made that changes the way the component renders, the snapshot test will fail. If the change is intentional there are a couple of ways the snapshot can be updated:

- If you are using the VSCode Jest plugin, it will display a toast asking you if you would like to update snapshots
- If you are running the tests interactively, pressing `u` will update the snapshots
- You can manually update the snapshots via a command like `(export CI=true; npm test -- --updateSnapshot)`
- You can create a command in your `package.json` file like we did at the start of this section and run that

## Conclusion

In this lab we learned the basics of unit testing. We will apply what we learned here and expand upon it as we develop our application. Next we will learn how to build and run our application on iOS and Android.
