# Lab: Use the Data

In this lab you will learn how to:

- Retrieve real data from the service, replacing the mock data
- Mock hooks that are used in components

## Overview

In the last lab, we created a React Context provider that holds the state the application will use for tea data. A custom hook was created to allow components to access the provider's API. It's time to replace our application's mock tea data with the real deal.

## Refactor

Let's start by cleaning up `TeaPage.tsx` a bit. Make the following changes:

1. Refactor `listToMatrix` to take a single array of teas and return a matrix of teas
2. Update the component template that calls `listToMatrix` to compensate for the change (pass in an empty array)
3. Remove `teaData`. In `TeaList.test.tsx`, import and use `expectedTeas` from `./__mocks__/mockTeas` instead
4. Finally update the `makes a tea matrix` test to compensate for the changes made

## Prime Tea Data

We will be utilizing the tea data on multiple pages of the application. We can save the end user bandwidth by making this call once, and using the data stored within `<TeaProvider />`. There is one consideration we have to make, the user must be signed in for us to successfully make the network call.

The `<TeaProvider />` loads whether the user is signed in or not, so it wouldn't be appropriate to set up a `useEffect` on `<TeaProvider />` to initially load the tea data. However, we will not call the `useTea` hook until we're on a page where we know a user is signed in, so we use it to prime our tea data.

Make the following change to the `useTea` hook:

**`src/tea/TeaProvider.tsx`**

```TypeScript
export const useTea = () => {
  const { teas, getTeas, getTeaById } = useContext(TeaContext);

  if (teas === undefined) {
    throw new Error('useTea must be used within a TeaProvider');
  }

  useEffect(() => {
    !teas.length && getTeas();
  }, [teas, getTeas]);

  return { teas };
};
```

Note that we are no longer exposing `getTeas` to components. They'll have no reason to need to invoke this method.

We should also add some functionality to reset the list of teas if the user session is no longer valid:

```TypeScript
...
const { session } = useSession();

useEffect(() => {
  session === undefined && setTeas([]);
}, [session]);
...
```

These modifications will break the unit tests we have in place to test the `useTea()` hook. Update the unit tests so that they pass:

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
...
  it('GETs the teas from the backend', async () => {
    const { waitForNextUpdate } = renderHook(() => useTea(), { wrapper });
    await waitForNextUpdate();
    expect(mockedAxios.get).toHaveBeenCalledWith('/tea-categories');
  });

  it('adds an image to each tea item', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTea(), { wrapper });
    await waitForNextUpdate();
    expect(result.current.teas).toEqual(expectedTeas);
  });
...
```

## Binding the Tea Data

Binding the data is quite simple, and we don't have to modify any of the unit tests within `TeaPage.test.tsx`. We do, however, have to mock the `useTea()` hook.

Add the following mock to `TeaPage.test.tsx`:

**`src/tea/TeaPage.test.tsx`**

```TypeScript
const mockTeas = expectedTeas;
jest.mock('./TeaProvider', () => ({
  useTea: () => ({ teas: mockTeas }),
}));
```

**Challenge:** Update `TeaPage.tsx` such that it pulls and displays the list of teas from `useTea()`.

### Side-note: Reference Material

As we continue to make use of built-in React hooks, such as `useEffect()`, I strongly urge a reading of <a href="https://overreacted.io/a-complete-guide-to-useeffect/" target="_blank">A Complete Guide to useEffect</a> by Dan Abramov at a later time. This article is a comprehensive guide to `useEffect()` and answers several questions that come with using it.

## Conclusion

Your application finally has a list of tea categories coming from a real-live data service! In the process, you learned how to create a custom React Hook and a bit about the Ionic Page Lifecycle. Next we'll create a detail page for each tea.
