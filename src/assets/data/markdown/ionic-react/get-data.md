# Lab: Getting Data

In this lab, you will learn how to:

- Intercept HTTP requests with Axios
- Perform CRUD operations on a backend data service
- Use state management to share data across the application

## Overview

Our application now requires authentication in order to access the tea page. We can start leveraging the user's identity to make requests to our backend data service that requires authorization.

## HTTP Interceptor

Remember the amount of code we had to write in order to make the network request for the current application user? If not, here's a reminder:

```TypeScript
const headers = { Authorization: 'Bearer ' + token };
const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
const { data } = await axios.get(url, { headers });
```

If we had to write this once or twice it wouldn't be so bad, but we have a back end data service that requires authorization for most of its API endpoints.

Axios allows us to intercept outgoing and incoming network calls and make modifications to them. That is extremely helpful when making multiple API calls to the same back end.

Axios allows the ability to create instances of the main `Axios` class. We will do this to create an instance that works for our backend data service. It will do the following:

- Set the base URL of relative paths
- Inject the authorization header into outgoing requests
- Dispatch `CLEAR_SESSION` if a 401 Unauthorized status code is returned

First, let's add a method named `invalidate` to the `useSession()` hook. This method will remove the auth token from Preferences and dispatch our `CLEAR_SESSION` action.

Here are the unit tests for this method, add them to `src/core/session/useSession.test.tsx`:

```TypeScript
describe('invalidate', () => {
  beforeEach(() => {
    Preferences.remove = jest.fn(async () => void 0);
    Preferences.set = jest.fn(async () => void 0);
    const { token, user } = mockSession;
    mockedAxios.post.mockResolvedValue({ data: { success: true, token, user } });
  });

  it('removes the token from storage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.login('test@ionic.io', 'P@ssword!'));
    await act(() => result.current.invalidate());
    expect(Preferences.remove).toHaveBeenCalledTimes(1);
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth-token' });
  });

  it('clears the session', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.login('test@ionic.io', 'P@ssword!'));
    await act(() => result.current.invalidate());
    expect(result.current.session).toBeUndefined();
  });
});
```

**Challenge:** Go ahead and implement this method in `src/core/session/useSession.tsx`.

Create a new file `src/core/session/AuthInterceptorProvider.tsx` and populate it with the following code:

**`src/core/session/AuthInterceptorProvider.tsx`**

```TypeScript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { createContext, useContext } from 'react';
import { useSession } from './useSession';

const AuthInterceptorContext = createContext<{ api: AxiosInstance }>({ api: axios });

export const AuthInterceptorProvider: React.FC = ({ children }) => {
  const { session, invalidate } = useSession();

  const instance = useRef(axios.create());
  const api = instance.current;
  api.defaults.baseURL = process.env.REACT_APP_DATA_SERVICE;

  api.interceptors.request.use((config: AxiosRequestConfig) => {
    if (session) {
      if (!config) config = {};
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse<any>) => response,
    async (error: any) => {
      if (error.response.status === 401) {
        await invalidate();
        return Promise.reject({ ...error, message: 'Unauthorized session.' });
      }
      return Promise.reject(error);
    }
  );

  return <AuthInterceptorContext.Provider value={{ api }}>{children}</AuthInterceptorContext.Provider>;
};

export const useAuthInterceptor = () => {
  const { api } = useContext(AuthInterceptorContext);

  if (api === undefined) {
    throw new Error('useAuthInterceptor must be used within an AuthInterceptorProvider');
  }

  return { api };
};
```

Don't forget to export this in `src/core/session/index.ts`!

Note that we are including a context, provider, and hook within the same file. Going forward, any React Context created will follow these rules:

1. All functionality will be written within a React Provider.
2. The React Context will expose any functionality to be exposed.
3. A corresponding React Hook will "forward" this functionality for consuming components to use.

This is the same abstraction pattern we used for session functionality, but related code is better centralized. Either approach works, and so does allowing components to directly access a React Context. The pattern established in this training is the author's preference.

Insert the `<AuthInterceptorProvider />` component between `<SessionProvider>` and `<IonReactRouter>` in `App.tsx`:

**`src/App.tsx`**

```JSX
...
<IonApp>
  <SessionProvider>
    <AuthInterceptorProvider>
    ...
    </AuthInterceptorProvider>
  </SessionProvider>
</IonApp>
...
```

## Tea Data Provider

The backend data service has two endpoints to be leveraged for the Tea feature:

- An endpoint that returns the entire list of teas
- An endpoint that returns data for a single tea item

Create two new files in `src/tea` named `TeaProvider.tsx` and `TeaProvider.test.tsx`.

Let's start by scaffolding `TeaProvider.tsx`:

**`src/tea/TeaProvider.tsx`**

```TypeScript
import { createContext, useContext, useState } from 'react';
import { useAuthInterceptor } from '../core/session';
import { Tea } from '../shared/models';

export const TeaContext = createContext<{
  teas: Tea[];
  getTeas: () => Promise<void>;
  getTeaById: (id: number) => Promise<Tea | undefined>;
}>({
  teas: [],
   getTeas: () => {
    throw new Error('Method not implemented');
  },
  getTeaById: () => {
    throw new Error('Method not implemented');
  },
});

export const TeaProvider: React.FC = ({ children }) => {
  const { api } = useAuthInterceptor();
  const [teas, setTeas] = useState<Tea[]>([]);

  const getTeas = async () => {};

  const getTeaById = async (id: number) => undefined;

  return <TeaContext.Provider value={{ teas, getTeaById }}>{children}</TeaContext.Provider>;
};

export const useTea = () => {
  const { teas, getTeas, getTeaById } = useContext(TeaContext);

  if (teas === undefined) {
    throw new Error('useTea must be used within a TeaProvider');
  }

  return { teas, getTeas, getTeaById };
};
```

Do the same for `TeaProvider.test.tsx`:

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
import axios from 'axios';
import { renderHook } from '@testing-library/react-hooks';
import { TeaProvider, useTea } from './TeaProvider';

jest.mock('axios');
var mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../core/session/AuthInterceptorProvider', () => ({
  useAuthInterceptor: () => ({ api: mockedAxios }),
}));

const wrapper = ({ children }: any) => <TeaProvider>{children}</TeaProvider>;

describe('useTea()', () => {
  describe('get all teas', () => {});

  describe('get a specific tea', () => {});

  afterEach(() => jest.restoreAllMocks());
});
```

### Setup the Test Data

We are going to need some test data that represents a successful response back from the endpoints. For our application, the data we get back looks like the test data we provided for the tea page, only it does not have an image associated with it.

Like we did for `src/core/session`, let's create a folder under `src/tea` named `__fixtures__`. Inside that folder create a file named `mockTeas.ts` and populate it with a list of `expectedTeas` - the data we expect returned back from our hook to components - and a function `resultTeas` which will return a list of teas in the format returned from the backend data service.

**`src/tea/__fixtures__/mockTeas.ts`**

```TypeScript
import { Tea } from '../../shared/models';

export const expectedTeas = [
  {
    id: 1,
    name: 'Green',
    image: require(`../../assets/images/green.jpg`),
    description: 'Green tea description.',
  },
  {
    id: 2,
    name: 'Black',
    image: require(`../../assets/images/black.jpg`),
    description: 'Black tea description.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: require(`../../assets/images/herbal.jpg`),
    description: 'Herbal Infusion description.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: require(`../../assets/images/oolong.jpg`),
    description: 'Oolong tea description.',
  },
  {
    id: 5,
    name: 'Dark',
    image: require(`../../assets/images/dark.jpg`),
    description: 'Dark tea description.',
  },
  {
    id: 6,
    name: 'Puer',
    image: require(`../../assets/images/puer.jpg`),
    description: 'Puer tea description.',
  },
  {
    id: 7,
    name: 'White',
    image: require(`../../assets/images/white.jpg`),
    description: 'White tea description.',
  },
  {
    id: 8,
    name: 'Yellow',
    image: require(`../../assets/images/yellow.jpg`),
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

Let's place some setup logic for our "get all teas" tests in `TeaProvider.test.tsx` and a test to make sure `useTea()` makes a network request to our endpoint:

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
...
describe('useTea()', () => {
describe('get all teas', () => {
  beforeEach(() => mockedAxios.get.mockResolvedValue({ data: resultTeas() }));

  it('GETs the teas from the backend', async () => {
    const { result } = renderHook(() => useTea(), { wrapper });
    await act(() => result.current.getTeas());
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/tea-categories');
  });
});
...
});
```

Let's make this test pass:

```TypeScript
const getTeas = async () => {
  const { data } = await api.get('/tea-categories');
  setTeas(data);
};
```

Now let's write a test to ensure that `getTeas()` will add images to each tea item:

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
...
describe('get all teas', () => {
  ...
  it('adds an image to each tea item', async () => {
    const { result } = renderHook(() => useTea(), { wrapper });
    await act(() => result.current.getTeas());
    expect(result.current.teas).toEqual(expectedTeas);
  });
});
...
```

Let's add images to each tea item. First, we need to add an array of image file names. Add the following to the top of `src/tea/TeaProvider.tsx`:

**`src/tea/TeaProvider.tsx`**

```TypeScript
import { ... } from 'react';
...

const images: string[] = ['green', 'black', 'herbal', 'oolong', 'dark', 'puer', 'white', 'yellow'];

export const TeaContext = createContext<{...}>({...});
...
```

Then, update `getTeas` like so:

```TypeScript
 const getTeas = async () => {
  const { data } = await api.get('/tea-categories');
  const teas = data.map((tea: Tea) => ({ ...tea, image: require(`../assets/images/${images[tea.id - 1]}.jpg`) }));
  setTeas(teas);
};
```

Our tests should now pass.

### Getting a Specific Tea

Start by filling out the describe block for "get a specific tea":

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
...
describe('get a specific tea', () => {
  beforeEach(() => mockedAxios.get.mockResolvedValue({ data: resultTeas()[0] }));

  it('GETs the specific tea from the backend', async () => {
    const { result } = renderHook(() => useTea(), { wrapper });
    await result.current.getTeaById(1);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/tea-categories/1');
  });

  it('returns the specific tea', async () => {
    const { result } = renderHook(() => useTea(), { wrapper });
    await result.current.getTeaById(1);
  });
});
```

**Challenge:** Your next challenge is to implement `getTeaById()` to make the test pass. The URL will be `/tea-categories/${id}`.

Let's refactor the common bits out:

**`src/tea/TeaProvider.test.tsx`**

```TypeScript
...
const getTeas = async () => {
  const { data } = await api.get('/tea-categories');
  const teas = data.map((tea: Tea) => fromJsonToTea(tea));
  setTeas(teas);
};

const getTeaById = async (id: number) => {
  const { data } = await api.get(`/tea-categories/${id}`);
  return fromJsonToTea(data);
};

const fromJsonToTea = (obj: any): Tea => ({ ...obj, image: require(`../assets/images/${images[obj.id - 1]}.jpg`) });
...
```

There's one final step we should take: wrapping the `getTeas()` and `getTeaById()` methods in a `useCallback` hook:

```TypeScript
const getTeas = useCallback(async () => {
  const { data } = await api.get('/tea-categories');
  const teas = data.map((tea: Tea) => fromJsonToTea(tea));
  setTeas(teas);
}, [api]);

const getTeaById = useCallback(async (id: number) => {
  const { data } = await api.get(`/tea-categories/${id}`);
  return fromJsonToTea(data);
}, [api]);
```

We will be running these methods within `useEffect` hooks, making them part of a dependency list. Before we wrapped these methods with the `useCallback` hook these methods are not referentially equal to themselves.

This would cause the following `useEffect` to run infinitely:

```TypeScript
useEffect(() => { getTeas(); }, [getTeas]);
```

`useCallback` allows React to memoize the functions, making `getTeas === getTeas`, and eliminating the problem.

### Supplying the Provider

Last but not least, we need to add the provider to `App.tsx`:

Insert the `<AuthInterceptorProvider />` component between `<SessionProvider>` and `<IonReactRouter>` in `App.tsx`:

**`src/App.tsx`**

```JSX
...
<IonApp>
  <SessionProvider>
    <AuthInterceptorProvider>
      <TeaProvider>
        ...
      </TeaProvider>
    </AuthInterceptorProvider>
  </SessionProvider>
</IonApp>
...
```

## Conclusion

You have created an HTTP interceptor, simplifying requests made to our back end services. You also created a provider and hook to fetch tea data from the back end. Next, we'll use the data our hook obtains within our tea page.
