# Lab: Use the Data

In this lab you will learn how to:

- Create a custom React hook to abstract logic from components
- Use lifecycle events to retrieve data upon entering a page

## Overview

With our tea data service singleton built and tested, it's time to replace our mock tea data with the real deal.

We could simply make calls to the tea singleton from our `<TeaList />` component, but we'd have to have the component call the identity singleton to obtain the current user's authorization token. That...doesn't feel right. Not to mention that it adds additional business logic to our component which we should always try to avoid.

A better approach would be to <a href="https://reactjs.org/docs/hooks-custom.html" target="_target">build our own React hook</a> that orchestrates the steps required to fetch the data from the server and returns it back to `<TeaList />`.

## Writing a Custom Hook

Create a new file `src/tea/useTeaCategories.ts` and scaffold the file like so:

```TypeScript
import { useState } from 'react';
import IdentitySingleton from '../auth/Identity';
import TeaCategoriesSingleton from './TeaCategories';
import { Tea } from '../models';

export const useTeaCategories = () => {
  const identity = IdentitySingleton.getInstance();
  const teaCategories = TeaCategoriesSingleton.getInstance();
  const [error, setError] = useState<string>('');

  const getCategories = async (): Promise<Array<Tea | undefined>> => {
    return [];
  };

  const getCategory = async (id: number): Promise<Tea | undefined> => {
    return { id: 1, description: '', image: '', name: '' };
  };

  return { error, getCategories, getCategory };
};
```

Our hook has the following responsibilities for the application:

- Obtain the current user's authorization token
- Return data from our data service
- Retain the most recent error message, should a service call fail

### `@testing-library/react-hooks`

Before we can test our hook, we need to add another dependency to our application. Open a terminal and change directories to the root of the application. Then run the following command:

```bash
$ npm install @testing-library/react-hooks
```

If you currently have your tests running, terminate the process and start run it again after the dependency has been added.

### Test First

Create a new file in our tea feature folder named `useTeaCategories.test.ts` and populate it with the following code:

```TypeScript
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useTeaCategories } from './useTeaCategories';
import IdentitySingleton, { Identity } from '../auth/Identity';
import TeaCategoriesSingleton, { TeaCategories } from './TeaCategories';
import { Tea } from '../models';

const mockToken = '3884915llf950';

describe('useTeaCategories', () => {
  let identity: Identity;
  let teaCategories: TeaCategories;

  beforeEach(() => {
    identity = IdentitySingleton.getInstance();
    identity['_token'] = mockToken;
    teaCategories = TeaCategoriesSingleton.getInstance();
    teaCategories.get = jest.fn();
    teaCategories.getAll = jest.fn();
  });

  describe('get all tea categories', () => {
    it('returns an array of Tea', async () => {
      teaCategories.getAll = jest.fn(() => Promise.resolve([]));
      let teas: Array<Tea> | undefined;
      const { result } = renderHook(() => useTeaCategories());
      await act(async () => {
        teas = await result.current.getCategories();
      });
      expect(teas).toEqual([]);
    });

    it('sets an error if there is a failure', async () => {
      const expected = 'Uh-oh, something went wrong!';
      teaCategories.getAll = jest.fn(() => {
        throw new Error('Uh-oh, something went wrong!');
      });
      const { result } = renderHook(() => useTeaCategories());
      await act(async () => {
        await result.current.getCategories();
      });
      expect(result.current.error).toEqual(expected);
    });
  });

  describe('get a specific tea category', () => {
    it('returns a Tea object', async () => {
      const expected = { id: 1, name: '', description: '', image: '' };
      teaCategories.get = jest.fn(() => Promise.resolve(expected));
      let tea: Tea | undefined;
      const { result } = renderHook(() => useTeaCategories());
      await act(async () => {
        tea = await result.current.getCategory(2);
      });
      expect(tea).toEqual(expected);
    });

    it('sets an error if there is a failure', async () => {
      const expected = 'Uh-oh, something went wrong!';
      teaCategories.get = jest.fn(() => {
        throw new Error('Uh-oh, something went wrong!');
      });
      const { result } = renderHook(() => useTeaCategories());
      await act(async () => {
        await result.current.getCategory(1);
      });
      expect(result.current.error).toEqual(expected);
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

The tests should break, which means it's time to implement some code!

### Then Code

Update `useTeaCategories.ts` so that our methods will pass our tests:

```TypeScript
  ...
  const getCategories = async (): Promise<Array<Tea> | undefined> => {
    try {
      return await teaCategories.getAll(identity.token || '');
    } catch (error) {
      setError(error.message);
    }
  };

  const getCategory = async (id: number): Promise<Tea | undefined> => {
    try {
      return await teaCategories.get(id, identity.token || '');
    } catch (error) {
      setError(error.message);
    }
  };
  ...
```

Not too bad, huh? Our hook acts as a proxy between components and our data service singletons. Many third party libraries provide hooks that act as proxies around their APIs. In fact, the Capacitor community has built <a href="https://github.com/capacitor-community/react-hooks" target="_blank"> a collection of hooks</a> for Capacitor Plugin APIs!

## Displaying Tea Categories

There are two lifecycle events that are good candidates for getting our data:

- `useEffect` - React Hook that can fire initialization logic upon mounting of a component
- `ionViewWillEnter` - Ionic Framework lifecycle event fired each time a page is navigated to

Because the Ionic Framework manages the lifetime of a page, certain React events might not fire when you expect them to. If we used `useEffect` to fire our page's intiialization logic, it will fire the first time the tea page is displayed, but if we navigate away from it the component may stick around in the DOM; meaning the logic is only run once. This would mean that our list of tea categories could get pretty stale pretty quickly!

Sounds like `ionViewWillEnter` is the better option. The <a href="https://ionicframework.com/docs/react/lifecycle#guidance-for-each-lifecycle-method" target="_blank">Ionic Framework React documentation agrees</a>!

Let's start by cleaning up `<TeaList />` a bit:

1. Refactor `listToMatrix` to take a single array of teas and return a matrix of teas
2. Update the code that calls it to compensate for the change
3. Update the test `makes a tea matrix` to compensate for the change
4. Finally, move the `teaData` constant to `TeaList.test.tsx` and update the matrix test accordingly

The last item broke your application; it now fails to compile. That's OK - we will fix that.

Once complete your `<TeaList>` component should look something like this:

```TypeScript
export const listToMatrix = (teas: Array<Tea>): Array<Array<Tea>> => {
  let teaMatrix: Array<Array<Tea>> = [];

  let row: Array<Tea> = [];
  teas.forEach(tea => {
    row.push(tea);
    if (row.length === 4) {
      teaMatrix.push(row);
      row = [];
    }
  });

  if (row.length) teaMatrix.push(row);

  return teaMatrix;
};

const TeaList: React.FC = () => {
  ...
  return (
    <IonPage>
      ...
      <IonContent>
        ...
        <IonGrid className="tea-grid">
          {listToMatrix(teaData).map((row, idx) => (
            <IonRow
              key={idx}
              className="ion-justify-content-center ion-align-items-stretch">
              {row.map(tea => (
                ...
              ))}
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TeaList;
```

### Ionic Lifecycle Hooks

Ionic Framework lifecycle events are available for use as convenient React Hooks, bundled within `@ionic/react`. Each lifecycle event hook is exported using React Hook naming conventions, so we'll need to import `useIonViewWillEnter`.

Update your `<TeaList />` with the following new code:

```TypeScript
...
const TeaList: React.FC = () => {
  ...
  const { getCategories, error } = useTeaCategories();
  const [teaCategories, setTeaCategories] = useState<Array<Tea>>([]);
  ...
  useIonViewWillEnter(async () => {
    const categories = await getCategories();
    setTeaCategories(categories || []);
  }, []);
  ...
};
...
```

Don't forget to import `useTeaCategories` and `useIonViewWillEnter`!

### Update the User Interface

Now we have a stateful component variable that holds our tea categories so we can toss the reference to our no longer existing `teaData` variable. We also are grabbing `error` from `useTeaCategories` so we can show application users a different experience if something happens to go wrong with our data service. Add the following to the `return` block of `<TeaList />`:

```TypeScript
...
const TeaList: React.FC = () => {
 ...
  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent>
        ...
        <IonGrid className="tea-grid">
          {error ? (
            //Todo: Fill this in
          ) : (
            //Todo: Fill this in
          )}
          ...
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
...
```

**Challenge:** Complete the user interface:

1. If an error exists, place it inside a row containing a full width column. To be consistent, it should also use the same styling errors on the login page have.
2. If an error doesn't exist, we should render the responsive grid.

## Conclusion

Your application finally has a list of tea categories coming from a real-live data service! In the process, you learned how to create a custom React Hook and a bit about the Ionic Page Lifecycle. Next we'll create a detail page for singular tea categories.
