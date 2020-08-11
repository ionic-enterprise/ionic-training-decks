# Lab: Unit Tests

In this lab, you will learn how to:

- Setup support for CI, code coverage, and snapshots
- Run the existing suite of unit tests
- Structure unit tests
- Write tests for the Home Page

## Setup CI, Coverage, and Snapshot Support

The application is configured to use [Jest](https://jestjs.io) to run our tests. The `npm test` script will run all of our tests and then watch for changes to the code.

If you would like to run tests once without the watch, you can do something like this: `(export CI=true; npm test)`. There are additional options to capture code coverage, and to update component snapshots during the test run.

### `package.json`

I suggest adding additional test script configurations in the `package.json` file as such:

- `test` - use the default configuration, re-run the tests as changes are made
- `test:ci` - use the default configuration, run the tests once and exit
- `test:cov` - collect and report code coverage information, run the tests once and exit
- `test:upd` - regenerate snapshots, run the tests once and exit

```JSON
  "scripts": {
    "build": "react-scripts test",
    "eject": "react-scripts eject",
    "start": "react-scripts start",
    "test": "react-scripts test",
    "test:ci": "export CI=true; react-scripts test",
    "test:cov": "export CI=true; react-scripts test --coverage",
    "test:upd": "export CI=true; react-scripts test --updateSnapshot"
  },
```

## Run the Tests

With our current configuration, there are four convenient ways to run the tests:

- `npm test` - runs the tests and waits for changes. This is the default and should be used for most development.
- `npm run test:ci` - runs the tests and exits. This is intended for use on your CI/CD server but is also useful for cases where you want to run the tests once.
- `npm run test:cov` - runs the tests and collects coverage information. This is intended for use on your CI/CD server but is also useful for cases where you want to identify non-tested areas.
- `npm run test:upd` - runs the tests and regenerate failed snapshots. This is intended for use when component markup is modified and you have tests that assert against the composition of components.

Type `npm test` and verify that the tests run.

### Jest VSCode Extension

If you are using Visual Studio Code as your editor, a [Jest extension](https://github.com/jest-community/vscode-jest) exists that will -- among other things -- automatically run the tests for you and report on the status.

## Structuring Unit Tests

The Jest test structure calls for a single file with setup and teardown code and individidual test cases to be created per project file. Jest also supports grouping test cases together in nested blocks, which allows you to group tests together by functionality.

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

### Side Note: Where to place test files?

There are three popularized ways to organize test files in Jest:

- Putting all your test code into a neatly organized `__tests__` directory at the root of the project
- Putting test code for a given folder within a `__tests__` subfolder.
- Putting your test code next to the files they are testing.

Use whichever method works best for you and your team. Personally, I prefer to put test code next to the files they are testing. This keeps project structures flatter and easier to visibly scan and allows me to easily see which files have tests written for them, and which files have yet to have tests written against them.

## Write tests for the Home Page

The application is not very complex in it's current state; it currently contains three components:

- `<App />`
- `<Home />`
- `<ExploreContainer />`

Let's write some test cases for our `<Home />` component.

### `Home.test.tsx`

Start by creating a new file, `Home.test.tsx`, in the `src/pages` folder.

After creating `Home.test.tsx`, add the required imports and insert a `describe` block where we can group our tests.

```Typescript
import React from 'react';
import { render } from '@testing-library/react';
import Home from './Home';

describe('<Home />', () => {

});
```

### Side Note: React Testing Library

The application is bundled with <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank"> React Testing Library</a>, which provides a set of light-weight utility functions to test React components in a way that encourages better testing practices. Instead of dealing with instances of rendered React components, tests will work with actual DOM nodes providing more confidence that your application will work in the way a real user would interact with it.

### Setup and Teardown Code

The tests we'll be creating for `Home.test.tsx` will not require any setup or teardown code. We will add tests later that require this, and will revisit setup and teardown code at that time.

### Test Header Text Value

By default, our Home page has it's header text set to "Blank". We can query the DOM in order to make sure that our header text is rendering correctly.

```Typescript
it('displays the header', () => {
  const { container } = render(<Home />);
  expect(container).toHaveTextContent('Blank');
```

### Add Snapshot Test

We can also create snapshots of the component under specific conditions and compare them as we modify the application. Add a test like this to your file:

```TypeScript
it('renders consistently', () => {
  const { asFragment } = render(<Home />);
  expect(asFragment()).toMatchSnapshot();
});
```

When the tests run, if a change is made that changes the way your component renders, this test will fail. If the change is intentional, there are a couple of ways to update the snapshots:

- If you are using the VSCode Jest plugin, it will display a toast asking you if you would like to update the snapshots
- If you are running the tests interactively, pressing `u` will update the snapshots
- You can manually update the snapshots via a command like `(export CI=true; npm test -- --updateSnapshot)`
- You can create a command in your `package.json` file like we did at the start of this section and run that

## Conclusion

In this lab we learned the basics of unit testing. We will apply what we learned here and expand upon it as we develop our application. Next we will perform some basic styling for our application.
