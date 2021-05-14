# Lab: Getting Data

In this lab, you will learn how to:

- Intercept HTTP requests with Axios
- Create a custom hook that makes CRUD operations to a backend data service

## Overview

Our application now requires authentication in order to access the tea page. We can start leveraging the user's identity to make requests to our backend data service that requires authorization.

## HTTP Interceptor

Remember the amount of code we had to write in order to make the network request for the current application user? If not, here's a reminder:

```TypeScript
const headers = { Authorization: 'Bearer ' + token };
const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
const { data } = await Axios.get(url, { headers });
```

If we had to write this once or twice it wouldn't be so bad, but we have a back end data service that requires authorization for most of it's API endpoints.

Axios allows us to intercept outgoing and incoming network calls and make modifications to them. That is extremely helpful when making multiple API calls to the same back end.

Axios allows the ability to create instances of the main `Axios` class. We will do this to create an instance that works for our backend data service. It will do the following:

- Set the base URL of relative paths
- Inject the authorization header into outgoing requests
- Dispatch `CLEAR_SESSION` if a 401 Unauthorized status code is returned

Create a new file `src/core/auth/useAuthInterceptor.tsx` and populate it with the following code:

**`src/core/auth/useAuthInterceptor.tsx`**

```TypeScript
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthInterceptor = () => {
  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthInterceptor must be used with an AuthProvider');
  }

  const axios = useRef(Axios.create());
  const instance = axios.current;

  instance.defaults.baseURL = process.env.REACT_APP_DATA_SERVICE;

  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (state.session)
      config.headers.Authorization = `Bearer ${state.session.token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse<any>) => response,
    (error: any) => {
      if (error.response.status === 401) {
        dispatch({ type: 'CLEAR_SESSION' });
        return Promise.reject({ ...error, message: 'Unauthorized session.' });
      }
      return Promise.reject(error);
    },
  );

  return { instance };
};
```

Don't forget to export this in `src/core/auth/index.ts`!

## Tea Data Hook

The backend data service has two endpoints to be leveraged for this application:

- An endpoint that returns the entire list of teas
- An endpoint that returns data for a single tea item

Create two new files in `src/tea` named `useTea.tsx` and `useTea.test.tsx`.

Let's start by scaffolding `useTea.tsx`:

**`src/tea/useTea.tsx`**

```TypeScript
import { Tea } from '../shared/models';

export const useTea = () => {
  const getTeas = async (): Promise<Tea[]> => {
    return [];
  };

  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    return undefined;
  };

  return { getTeas, getTeaById };
};
```

Do the same for `useTea.test.tsx`:

**`src/tea/useTea.test.tsx`**

```TypeScript
import { renderHook, act } from '@testing-library/react-hooks';
import { useTea } from './useTea';
import { Tea } from '../shared/models';

jest.mock('../core/auth/useAuthInterceptor', () => ({
  useAuthInterceptor: () => ({
    instance: {
      get: mockInstanceVerb,
    },
  }),
}));

let mockInstanceVerb = jest.fn();

describe('useTea', () => {
  describe('get all teas', () => {});

  describe('get a specific tea', () => {});

  afterEach(() => jest.restoreAllMocks());
});
```

---

## Tea Hook

### Setup the Test Data

We are going to need some test data that represents a successful response back from the endpoints. For our application, the data we get back looks like the test data we provided for the tea page, only it does not have an image associated with it.

Like we did for `src/core/auth`, let's create a folder under `src/tea` named `__mocks__`. Inside that folder create a file named `mockTeas.ts` and populate it with a list of `expectedTeas` - the data we expect returned back from our hook to components - and a function `resultTeas` which will return a list of teas in the format returned from the backend data service.

**`src/tea/__mocks__/mockTeas.ts`**

```TypeScript
import { Tea } from '../../shared/models';

export const expectedTeas = [
  {
    id: 1,
    name: 'Green',
    image: require(`../../assets/images/green.jpg`).default,
    description: 'Green tea description.',
  },
  {
    id: 2,
    name: 'Black',
    image: require(`../../assets/images/black.jpg`).default,
    description: 'Black tea description.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: require(`../../assets/images/herbal.jpg`).default,
    description: 'Herbal Infusion description.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: require(`../../assets/images/oolong.jpg`).default,
    description: 'Oolong tea description.',
  },
  {
    id: 5,
    name: 'Dark',
    image: require(`../../assets/images/dark.jpg`).default,
    description: 'Dark tea description.',
  },
  {
    id: 6,
    name: 'Puer',
    image: require(`../../assets/images/puer.jpg`).default,
    description: 'Puer tea description.',
  },
  {
    id: 7,
    name: 'White',
    image: require(`../../assets/images/white.jpg`).default,
    description: 'White tea description.',
  },
  {
    id: 8,
    name: 'Yellow',
    image: require(`../../assets/images/yellow.jpg`).default,
    description: 'Yellow tea description.',
  },
];

export const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    // @ts-ignore
    delete tea.image;
    return tea;
  });
};
```

### Getting all the Teas

Let's place some setup logic for our "get all teas" tests in `useTea.test.tsx` and a test to make sure `getTeas` makes a network request to our endpoint:

**`src/tea/useTea.test.tsx`**

```TypeScript
...
describe('useTea', () => {
  describe('get all teas', () => {
    beforeEach(
      () => (mockInstanceVerb = jest.fn(async () => ({ data: resultTeas() }))),
    );

    it('gets the teas', async () => {
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.getTeas();
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });
  });
  ...
});
```

Let's make this test pass.
**`src/tea/useTea.tsx`**

```TypeScript
import { useAuthInterceptor } from '../core/auth';
import { Tea } from '../shared/models';

export const useTea = () => {
  const { instance } = useAuthInterceptor();

  const getTeas = async (): Promise<Tea[]> => {
    const url = `/tea-categories`;
    const { data } = await instance.get(url);
    return data;
  };

  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    return undefined;
  };

  return { getTeas, getTeaById };
};
```

Now let's write a test to ensure that `getTeas()` will add images to each tea item:

**`src/tea/useTea.test.tsx`**

```TypeScript
...
describe('get all teas', () => {
  ...
  it('adds an image to each tea item', async () => {
    let teas: Array<Tea> = [];
    const { result } = renderHook(() => useTea());
    await act(async () => {
      teas = await result.current.getTeas();
    });
    expect(teas).toEqual(expectedTeas);
  });
});
...
```

Let's add images to each tea item:

**`src/tea/useTea.tsx`**

```TypeScript
...

const images: string[] = [
  'green',
  'black',
  'herbal',
  'oolong',
  'dark',
  'puer',
  'white',
  'yellow',
];

export const useTea = () => {
  ...
  const getTeas = async (): Promise<Tea[]> => {
    const url = `/tea-categories`;
    const { data } = await instance.get(url);
    return data.map((tea: Tea) => ({
      ...tea,
      image: require(`../assets/images/${images[tea.id - 1]}.jpg`).default,
    }));
  };

  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    ...
  };

  return { getTeas, getTeaById };
};
```

Our tests should now pass, but there's still one thing left to do. We want to wrap `getTeas` in a `useCallback` hook:

```TypeScript
const getTeas = useCallback(async (): Promise<Tea[]> => {
  const url = `/tea-categories`;
  const { data } = await instance.get(url);
  return data.map((tea: Tea) => ({
    ...tea,
    image: require(`../assets/images/${images[tea.id - 1]}.jpg`).default,
  }));
}, [instance]);
```

Make sure you add the import for `useCallback`. This allows the function to be memoized, preventing it from being called multiple times when part of a dependency list (such as in a `useEffect`).

### Getting a Specific Tea

Start by filling out the describe block for "get a specific tea":

**`src/tea/useTeas.test.tsx`**

```TypeScript
...
describe('get a specific tea', () => {
  beforeEach(
    () =>
      (mockInstanceVerb = jest.fn(async () => ({ data: resultTeas()[0] }))),
  );

  it('gets the specific tea', async () => {
    const { result } = renderHook(() => useTea());
    await act(async () => {
      await result.current.getTeaById(4);
    });
    expect(mockInstanceVerb).toBeCalledTimes(1);
  });

  it('adds an image to the tea item', async () => {
    let tea: Tea | undefined = undefined;
    const { result } = renderHook(() => useTea());
    await act(async () => {
      tea = await result.current.getTeaById(4);
    });
    expect(tea).toEqual(expectedTeas[0]);
  });
});
```

**Challenge:** Your next challenge is to implement `getTeaById()` to make the tests pass:

1. The URL will be `/tea-categories/${id}`
2. Wrap the function in a `useCallback()`

Let's refactor the common bits out:

**`src/tea/useTea.tsx`**

```TypeScript
...
export const useTea = () => {
  const getTeas = useCallback(async (): Promise<Tea[]> => {
    const { instance } = useAuthInterceptor();

    const url = `/tea-categories`;
    const { data } = await instance.get(url);
    return data.map((item: any) => fromJsonToTea(item));
  }, [instance);

  const getTeaById = useCallback(async (id: number): Promise<Tea | undefined> => {
    const url = `/tea-categories/${id}`;
    const { data } = await instance.get(url);
    return fromJsonToTea(data);
  }, [instance]);

  const fromJsonToTea = (obj: any): Tea => {
    return {
      ...obj,
      image: require(`../assets/images/${images[obj.id - 1]}.jpg`).default,
    };
  };

  return { getTeas, getTeaById };
};
```

## Conclusion

You have created an HTTP interceptor, simplifying requests made to our back end services. You also created another hook to fetch tea data from the back end. Next, we'll use the data our hook obtains within our tea page.
