# Lab: Load Teas

So far our tea listing page has been using hardcoded data. Let's replace that with data from an actual backend service.

In this lab, you will apply techniques from previous labs to create a React Context that provides tea functionality for the application.

## Create a Tea Context

We'll be using tea data across the application, so we should build a context that allows us to do so.

The first thing we need to do is create some templates for our unit tests and context.

**`src/providers/TeaProvider.test.tsx`**

```tsx
import { vi, Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { client } from '../utils/backend-api';
import { Tea } from '../models';
import TeaProvider, { useTea } from './TeaProvider';

vi.mock('../utils/backend-api');

const MockChildComponent = () => {
  const { teas } = useTea();
  return <div data-testid="teas">{JSON.stringify(teas)}</div>;
};

const mockComponent = (
  <TeaProvider>
    <MockChildComponent />
  </TeaProvider>
);

describe('TeaProvider', () => {
  let expectedTeas: Tea[];
  let httpResultTeas: Omit<Tea, 'image'>[];

  beforeEach(() => {
    initializeTestData();
    vi.clearAllMocks();
    (client.get as Mock).mockResolvedValue({ data: [] });
  });

  describe('loadTeas', () => {
    it('gets the tea categories', async () => {});

    it('transforms the tea data', async () => {});
  });

  const initializeTestData = () => {};
});
```

**`src/providers/TeaProvider.tsx`**

```tsx
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Tea } from '../models';

type Props = { children?: ReactNode };
type Context = { teas: Tea[] };

const TeaContext = createContext<Context | undefined>(undefined);
const TeaProvider = ({ children }: Props) => {
  const [teas, setTeas] = useState<Tea[]>([]);

  const loadTeas = async () => {};

  useEffect(() => {
    loadTeas();
  }, []);

  return <TeaContext.Provider value={{ teas }}>{children}</TeaContext.Provider>;
};
export const useTea = () => {
  const context = useContext(TeaContext);
  if (context === undefined) throw new Error('useTea must be used within TeaProvider');
  return context;
};
export default TeaProvider;
```

In this case, I included the scaffolding for the test cases for you. These test cases specify the two requirements that we have for our `loadTeas()` function. It needs to:

- get the data
- transform the data

So let's tackle those requirements one at a time. First, we need to make the API call to get the data:

```tsx
it('gets the tea categories', async () => {
  render(mockComponent);
  await waitFor(() => expect(client.get).toHaveBeenCalledTimes(1));
  expect(client.get).toHaveBeenCalledWith('/tea-categories');
});
```

In order to satisfy that test, we can just perform the basic "get" pattern of sending a GET request to the backend API and then assigning the data.

```typescript
const loadTeas = async () => {
  const { data } = await client.get('/tea-categories');
  setTeas(data);
};
```

But there is a bit of a problem. The data that comes back from the API is not in the shape we want for our application. This is a common issue that needs to be handled in the application logic. Specifically, the backend team has not decided how to handle the tea images yet, so what we will do for now is map the images to our own set of assets based on the IDs of the tea.

This is where the second requirement, the requirement to transform the data, comes in to play. In our tests, let's express the difference between the two formats as two different sets of data: the raw HTTP data, and the expected data. Update the `initializeTestData()` method as such:

```typescript
const initializeTestData = () => {
  expectedTeas = [
    {
      id: 1,
      name: 'Green',
      description: 'Green tea description.',
      image: '/assets/images/green.jpg',
    },
    {
      id: 2,
      name: 'Black',
      description: 'Black tea description.',
      image: '/assets/images/black.jpg',
    },
    {
      id: 3,
      name: 'Herbal',
      description: 'Herbal Infusion description.',
      image: '/assets/images/herbal.jpg',
    },
    {
      id: 4,
      name: 'Oolong',
      description: 'Oolong tea description.',
      image: '/assets/images/oolong.jpg',
    },
    {
      id: 5,
      name: 'Dark',
      description: 'Dark tea description.',
      image: '/assets/images/dark.jpg',
    },
    {
      id: 6,
      name: 'Puer',
      description: 'Puer tea description.',
      image: '/assets/images/puer.jpg',
    },
    {
      id: 7,
      name: 'White',
      description: 'White tea description.',
      image: '/assets/images/white.jpg',
    },
    {
      id: 8,
      name: 'Yellow',
      description: 'Yellow tea description.',
      image: '/assets/images/yellow.jpg',
    },
  ];
  httpResultTeas = expectedTeas.map((t: Tea) => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { image, ...tea } = { ...t };
    return tea;
  });
};
```

What we have here is the `expectedTeas` with the data in the shape we want within the domain of our application. The `httpResultTeas` are _almost_ the same, just without the `image` property, so we strip that. The test to make sure the service reshapes the data properly is then fairly straight forward.

```typescript
it('transforms the tea data', async () => {
  (client.get as Mock).mockResolvedValue({ data: httpResultTeas });
  const { getByTestId } = render(mockComponent);
  await waitFor(() => expect(JSON.parse(getByTestId('teas').textContent || '')).toEqual(expectedTeas));
});
```

The HTTP `GET` returns the teas in one shape, we expect the results in the other shape.

So, let's get down to coding this in `src/providers/TeaProvider.tsx`. The first thing we will do is define a type for the data coming back from the HTTP API and the shell of a transforming function. This function can live within the provider component or outside of it, the choice is yours.

```typescript
const unpack = (data: Omit<Tea, 'image'>[]): Tea[] => {
  return [];
};
```

We can then also update the promise handling in our `loadTeas()` to ensure the transform is called if we have data:

```typescript
const loadTeas = async () => {
  const { data } = await client.get<Omit<Tea, 'image'>[]>('/tea-categories');
  setTeas(unpack(data) || []);
};
```

Looking at the data we have coming back, we have eight tea categories with IDs 1 through 8, so for this data it it pretty easy to map the tea to an image using the ID. First, create an array of the image names in the right order (this can either be global to the file or within the `unpack()` function):

```typescript
const images: Array<string> = ['green', 'black', 'herbal', 'oolong', 'dark', 'puer', 'white', 'yellow'];
```

Then in `unpack()` map the data, adding in the image property in the format required:

```typescript
return data.map((t) => ({ ...t, image: `/assets/images/${images[t.id - 1]}.jpg` }));
```

Obviously, this is a fairly contrived example and it does not compensate for changes such as someone adding a tea category or changing the IDs in some way, etc. However, let's say that in the future the backend team decides to add a "Type Code" to the tea category that does a better job of mapping this tea to an image within your system, you only have to go to this file to make that change.

The same applies if, for example, the backend team decides to shorten the property names in order to save on bytes going over the air. You still only need to change this file. The rest of your system is insulated from the external API changes by the use of this provider.

At this point, we should create a `src/providers/__mocks__/TeaProvider.tsx` as well:

```typescript
import { vi } from 'vitest';

export const useTea = vi.fn(() => ({ teas: [] }));
```

## Update the Tea Listing Page

Now that we have this put together, we can update the tea listing page to show the actual teas from our API rather than the hard coded teas that are being displayed right now. Open the `src/pages/tea/TeaListPage.tsx` and `src/pages/tea/TeaListPage.test.tsx` files in your editor.

### Modify the Test

Modify the test first. Since we are not changing anything about how the page works, but are only changing the source of our data, we need to modify the test to make sure the new data source has data in it.

Import the mock of the `useTea()` hook we just created:

```diff
  ...
+ import { useTea } from '../../providers/TeaProvider';

vi.mock('react-router-dom');
vi.mock('../../utils/auth');
+ vi.mock('../../providers/TeaProvider');
  ...
```

Set the value of the `teas` state it should return:

```diff
...
describe('<TeaListPage />', () => {
+ beforeEach(() => {
+   (useTea as Mock).mockReturnValue({
+     teas: // Copy the tea data for the teas from `TeaListPage.tsx` here.
+   });
+   vi.clearAllMocks();
+ });
});
...
```

There are also a couple of tests that grab the list of teas from the exported `teaData` property for comparison purposes. Remove all references to `teaData` and replace them with `useTea().teas` within unit tests.

Example:

```diff
- expect(title).toHaveTextContent(teaData[idx].name);
+ expect(title).toHaveTextContent(useTea().teas[idx].name);
```

### Modify the Component

Let's attack the component code in a methodic, orderly fashion.

1. Add imports for `useEffect` from `react`, and `useTea` from `./TeaProvider`.
2. Modify `listToMatrix` to accept an input parameter of type `Tea[]`.
3. Update the call to `listToMatrix()` in the component template to `listToMatrix(teas)`.
4. Remove the hard coded `teaData` property.

All of our tests should be passing, but we should see an error in the browser.

### Update Routing

To fix our issue when we view the page, we just need to import `TeaProvider` and wrap it around `TeaListPage` in `App.tsx`:

```diff
<Route exact path="/tea">
  <PrivateRoute>
+   <TeaProvider>
      <TeaListPage />
+   </TeaProvider>
  </PrivateRoute>
</Route>
```

Now when we run the code in the browser we should see eight teas displayed.

## Conclusion

Our tea listing page is now getting live data from our backend!

In case you had any issues transforming the page, here is the relevant component code that you can use as reference. Try to code this on your own, however, without peeking.

```tsx
const listToMatrix = (teas: Tea[], cols: number = 4): Tea[][] => {
  const teaMatrix: Tea[][] = [];

  for (let i = 0; i < teas.length; i += cols) {
    teaMatrix.push(teas.slice(i, i + cols));
  }

  return teaMatrix;
};

const TeaListPage: React.FC = () => {
  const { teas } = useTea();
  const { logout } = useAuth();
  const history = useHistory();

  const handleLogout = async (): Promise<void> => {
    await logout();
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          ...
        </IonHeader>
        <IonGrid className="tea-grid">
          {listToMatrix(teas).map((row, idx) => (
            ...
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TeaListPage;
```
