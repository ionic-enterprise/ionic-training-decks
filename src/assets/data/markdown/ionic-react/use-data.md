# Lab: Use the Data

In this lab you will learn how to:

- Retrieve real data from the service, replacing the mock data
- Mock hooks that are used in components

## Overview

With our custom tea hook built and tested, it's time to replace our mock tea data with the real deal.

### Refactor

Let's start by cleaning up `TeaPage.tsx` a bit. Make the following changes:

1. Refactor `listToMatrix` to take a single array of teas and return a matrix of teas
2. Update the component template that calls `listToMatrix` to compensate for the change (pass in an empty array)
3. Remove `teaData`. In `TeaList.test.tsx`, import and use `expectedTeas` from `./__mocks__/mockTeas` instead
4. Finally update the `makes a tea matrix` test to compensate for the changes made

### Mocking `useTea`

We need a way to mock the `useTea()` hook created in the last lab. Go ahead and add the following code to `TeaPage.test.tsx` after the import statements and before the describe block:

**`src/tea/TeaPage.test.tsx`**

```TypeScript
const mockTeas = expectedTeas;
jest.mock('./useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(() => Promise.resolve(mockTeas)),
    getTeaById: jest.fn(),
  }),
}));
```

### Fetching the Data

When the user first enters the tea page, we want to fetch the list of teas from the backend data service. This process will be partially completed for you, it will be up to you to finish the implementation.

**`src/tea/TeaPage.tsx`**

```TypeScript
// Todo: Import useState from the 'react' module.
...
import { useTea } from './useTea';
...
const TeaPage: React.FC = () => {
  const { getTeas } = useTea();
  const [teas, setTeas] = useState<Tea[]>([]);
  ...
  useEffect(() => {
    (async () => {
      const teas = await getTeas();
      setTeas(teas);
    })();
  }, [getTeas]);

  const handleLogout = async () => {
    ...
  };

  // Todo: Update the component to use the list of teas from the component's state.
  return (...);
};
export default TeaPage;
```

Once complete, you should notice that our tests are throwing an error:

```bash
Warning: An update to TeaPage inside a test was not wrapped in act(...).
```

Let's go ahead and fix that:

**`src/tea/TeaPage.test.tsx`**

```TypeScript
...
describe('<TeaPage />', () => {
  it('displays the header', async () => {
    const { container } = render(<TeaPage />);
    await waitFor(() => expect(container).toHaveTextContent(/Tea/));
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<TeaPage />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
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
