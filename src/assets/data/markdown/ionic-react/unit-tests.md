# Lab: Unit Tests

The starter application was built with minimal testing scaffolding for a generic starter application; it does not apply to the application that we have. In this lab, you will learn how to:

- How to run the unit tests
- How to organize the unit tests
- Some basic unit testing techniques

## Running Unit Tests

Ionic React applications use <a href="https://vitest.dev" target="_blank">Vitest</a> as a testing framework and runner and <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank"> React Testing Library</a> to write unit tests for React components.

<a href="https://www.cypress.io/" target="_blank">Cypress</a> is bundled with Ionic React starters as well for end-to-end testing. However, the topic of using Cypress to conduct end-to-end testing is beyond the scope of this training and will not be used.

To run the existing unit test, run the following command:

```bash
npm run test.unit
```

Leave the test runner running. Next we will start adding tests for our components.

## Scaffold Tests for Our Application

We currently have a single test in `src/App.test.tsx`. It is a nice example, but it is not going to scale well. Since unit tests are intended to test the various parts of our system in isolation, it makes sense that the file structure for our tests will resemble the file structure of our application.

Our application currently has the following components:

- `App.tsx`
- `components/ExploreContainer.tsx`
- `pages/Home.tsx`

These components currently do not do much, so now is a really good time to scaffold tests for them so we can build the tests up as we go.

### App.tsx

Take a look at `src/App.tsx`. There's not much here that is testable. We can make sure that it renders, which is what the default test in `src/App.test.tsx` does.

Let's better organize this test file by creating a `describe()` grouping for the component. Replace the contents of `src/App.test.tsx` with the following code:

```typescript
import { render } from '@testing-library/react';
import App from './App';

describe('<App />', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeDefined();
  });
});
```

If the React Testing Library is new to you, it's important to know the guiding principle behind it:

> The more your tests resemble the way your software is used, the more confidence they can give you.

This means that we will design tests that make assertions based around what end users would see. The test above asserts that the rendered output of `<App />` should not be an empty DOM tree.

#### Snapshot Testing

Vitest has a neat feature where we can compare the output of our test against a reference snapshot file stored alongside the test. Snapshot tests will fail if the two snapshots do not match: either when a change is unexpected, or the reference snapshot needs to be updated.

Add a snapshot test to the describe block:

```typescript
it('renders consistently', () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
```

A snapshot reference file is created the first time this test runs (since there is nothing to compare against).

### Home.tsx

Take a look at `src/pages/Home.tsx`. What should we test here? We don't want to write too many tests since we will be changing this file some time soon. Let's just test that the header has a proper title and contains the text we expect.

Create a file `src/pages/Home.test.tsx` containing the following code:

```Typescript
import { render, screen } from '@testing-library/react';
import Home from './Home';

describe('<Home />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<Home />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the title', () => {
    render(<Home />);
    const titleElements = screen.getAllByText('Blank');
    expect(titleElements.length).toEqual(2);
  });

  it('displays the default text', () => {
    const { baseElement } = render(<Home />);
    expect(baseElement).toHaveTextContent(/Ready to create an app?/);
  });
});
```

These tests are markedly different than the one created for `App.tsx`. I've added comments to the code block below to break down what is going on:

```Typescript
it('displays the title', () => {
  // First, we want to render the <Home /> component.
  render(<Home />);
  // "screen" is a special version of "baseElement" that includes
  // utility methods to query the DOM.
  //
  // In this test, we are looking for all elements that contain
  // our header text: "Blank"
  const titleElements = screen.getAllByText('Blank');
  // To accommodate iOS's "collapsible title" design guideline,
  // two title elements are defined in the template. We will
  // elaborate on this more further on.
  expect(titleElements.length).toEqual(2);
});

it('displays the default text', () => {
  // This test only cares that the default text is rendered within the
  // component, but doesn't care where. That makes it a good candidate
  // to use "baseElement" instead of "screen".
  const { baseElement } = render(<Home />);
  // Text matchers, such as "toHaveTextContent" exist, that allow us
  // to create UI-based logical expressions for our tests.
  expect(baseElement).toHaveTextContent(/Ready to create an app?/);
  // "/Ready to create an app?/" is a substring matcher. We don't care
  // if additional text exists, only that _our_ text does. Full-string
  // matching uses double-quotes ("").
});
```

Testing is a critical part of software development. As such, I strongly urge you to get acquainted with the <a href="https://testing-library.com/docs/react-testing-library/intro" target="_blank">React Testing Library</a>.

## Conclusion

In this lab we learned the basics of unit testing. We will apply what we learned here and expand upon it as we develop our application. Next we will learn how to build and run our application on iOS and Android.
