# Lab: Use the Data

In this lab you will learn how to:

- Retrieve real data from the service, replacing the mock data
- Mock hooks that are used in components

## Overview

With our custom tea hook built and tested, it's time to replace our mock tea data with the real deal.

## Displaying the Teas

There are two lifecycle events that are good candidates for getting our data:

- `useEffect` - React Hook that can fire initialization logic upon mounting of a component
- `ionViewWillEnter` - Ionic Framework lifecycle event fired each time a page is navigated to

We only want to fetch our tea data once per user session, it doesn't change often enough that we should fetch it each time the user navigates to our tea page. That said, it looks like `useEffect` is the correct choice for this situation. If we were loading data that updated more frequently, such as user comments or the delivery status of a package we ordered online, we would want to use `ionViewWillEnter`.

### Refactor

Let's start by cleaning up `TeaPage.tsx` a bit. Make the following changes:

1. Refactor `listToMatrix` to take a single array of teas and return a matrix of teas
2. Update the component template that calls `listToMatrix` to compensate for the change
3. Update the test `makes a tea matrix` to compensate for the change
4. Finally, move the `teaData` constant to `TeaList.test.tsx`, rename it to `mockTeas` and fix the `makes a tea matrix` test accordingly.

The last item broke your application; it now fails to compile. That's OK - we will fix that.

### Mocking `useTea`

We need to remove the reference to our hard-coded tea data and replace it with the data returned from the `getTeas` function exposed by our `useTea` hook.

In the spirit of TDD, we're going to start with our test file. We don't actually have to modify any of our existing tests, but we do need to mock the `useTea` hook.

Open up the test file and add the following code:

**`src/tea/TeaPage.test.tsx`**

```TypeScript
import React from 'react';
...
jest.mock('./useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(() => Promise.resolve(mockTeas)),
    getTeaById: jest.fn(),
  }),
}));

const mockTeas: Array<Tea> = [ ... ];

describe('<TeaPage />', () => {
  ...
});
```

This doesn't have any impact on our tests yet; they still fail and the application does too because `teaData` is no longer defined in `TeaPage.tsx`.

### Fetching the Data

We know we want to use a `useEffect()` to run logic when the tea page component mounts, and we know that we want that logic to fetch the tea data, so let's set that up:

**`src/tea/TeaPage.tsx`**

```TypeScript
...
import { useTea } from './useTea';
...
const TeaPage: React.FC = () => {
  const { getTeas } = useTea();
  ...

  useEffect(() => {
    const init = async () => await getTeas());
    init();
  }, [getTeas]);

  const handleLogout = async () => {
    ...
  };

  return (...);
};
export default TeaPage;
```

Notice the way that we're telling the `useEffect` to run only once. Instead of telling the `useEffect` to only run once on mount using an empty dependency list (`[]`) we're saying "run this effect when `getTeas` changes". Since the function `getTeas` never changes, the `useEffect` is only called once - when the tea page component mounts. We could use an empty dependency list and our application would work, but it's not the correct way to manage `useEffect` dependencies.

Now that our `useEffect()` is partially complete, I leave it up to you to add a `useState` to set the contents of `await getTeas()` to, and bind the state within `listToMatrix`.

**Challenge:** Finish implementing the `init` function and bind the list of teas to the template.

Once complete, you should notice that our tests are throwing an error:

```bash
Warning: An update to TeaPage inside a test was not wrapped in act(...).
```

That's because our component is updated after it was rendered. So far, we've been wrapping some tests in an `await wait()` and haven't really dug into _why_ we're doing it. It's to prevent errors like the one above; React Testing Library knows when our components re-render, and throws an error letting us know. Adding `await wait(() => { ...our assertion... })` waits until the component re-renders to the point that our assertion passes, otherwise it times out after a few seconds. `wait()` actually wraps our code inside an `act()` call, so that's how we'll resolve the error for our tests:

**`src/tea/TeaPage.test.tsx`**

```TypeScript
...
describe('<TeaPage />', () => {
  it('displays the header', async () => {
    const { container } = render(<TeaPage />);
    await wait(() => expect(container).toHaveTextContent(/Tea/));
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<TeaPage />);
    await wait(() => expect(asFragment()).toMatchSnapshot());
  });

  describe('initialization', () => {
    ...
  });
});
```

That will fix our test cases. Don't forget to update your snapshots!

### Side-note: Reference Material

I strongly urge you to read <a href="https://overreacted.io/a-complete-guide-to-useeffect/" target="_blank">A Complete Guide to useEffect</a> by Dan Abramov at a later time. It's a comprehensive guide to the `useEffect()` hook and answers several questions, including "How do I correctly fetch data inside useEffect?".

## Conclusion

Your application finally has a list of tea categories coming from a real-live data service! In the process, you learned how to create a custom React Hook and a bit about the Ionic Page Lifecycle. Next we'll create a detail page for each tea.
