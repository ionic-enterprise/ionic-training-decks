# Lab: Getting Data

In this lab, you will learn how to:

- Intercept outgoing HTTP requests with Axios
- Tranform the data for consumption by your application

## Overview

Now that we've implemented authentication for our application users, we can start building out functionality that returns data from portions of our back end service that requires authorization.

## HTTP Interceptor

Remember the amount of code we had to write in order to make the network request for the current application user? If not, here's a reminder:

```TypeScript
private async fetchUser(token: string): Promise<User> {
  const headers = { Authorization: 'Bearer ' + token };
  const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
  const { data } = await Axios.get(url, { headers });
  return data;
}
```

If we had to write this once or twice it wouldn't be so bad, but we have a back end data service that requires authorization for most of it's API endpoints.

Axios allows us to intercept outgoing and incoming network calls and make modifications to them. That is extremely helpful when making multiple API calls to the same back end.

### Axios Instance

Axios allows the ability to create instances of the main `Axios` class. We will do this to create an instance that works for our back end service API. It will do the following:

- Set the base URL of relative paths
- Inject the authorization header into outgoing requests
- Throw an error if no token is found

Create a new file `src/core/apiInstance.ts` and write the following code:

**`src/core/apiInstance.ts`**

```TypeScript
import Axios, { AxiosRequestConfig } from 'axios';
import { IdentityService } from './services/IdentityService';

const apiInstance = Axios.create({
  baseURL: process.env.REACT_APP_DATA_SERVICE,
});

apiInstance.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = IdentityService.getInstance().token;
  if (!token)
    throw new Error('This operation requires authorization, please sign in.');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiInstance;
```

Now let's go ahead and use this interceptor to fetch tea data from the back end.

## Hooks and Business Logic

A common pattern within the React ecosystem is to directly implement business logic within custom React hooks. You'll see this pattern used in projects, blog posts, Q&As, and tutorials around the internet.

Up until this point, we've placed all business logic within services. Both methods are valid, and I think a good rule of thumb is to use complexity to determine whether to place business logic within a hook, or isolate it to it's own service. The more complex the business logic, the more stands to be gained by separating out that code and vice versa.

For the remainder of the project we're just fetching and transforming data from existing APIs, so we'll just place any business logic within our hooks.

## Tea Hook

Our data service has two tea endpoints we will want to use for the application:

- An endpoint that returns the entire list of teas
- An endpoint that returns data for a singular tea item

### Interface Setup

Create two new files in `src/tea` named `useTea.tsx` and `useTea.test.tsx`.

Let's start by scaffolding `useTea.tsx`:

**`src/tea/useTea.tsx`**

```TypeScript
import { Tea } from '../shared/models';

export const useTea = () => {
  const getTeas = async (): Promise<Array<Tea>> => {
    return [];
  };

  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    return undefined;
  };

  return { getTeas, getTeaById };
};
```

Then let's shell out the test file:

**`src/tea/useTea.test.tsx`**

```TypeScript
import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import apiInstance from '../core/apiInstance';
import { Tea } from '../shared/models';

describe('useTea', () => {
  describe('get all teas', () => { });

  describe('get a specific tea', () => { });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

### Setup the Test Data

We are going to need some test data that represents a successful response back from the endpoints. For our application, the data we get back looks like the test data we provided for the tea page, only it does not have an image associated with it. Let's initialize an array of `Tea` called `expectedTeas` using that data. Then, we can use `expectedTeas` to manufacture a set of `resultTeas` by deleting the `image` property. `resultTeas` will be the result of our API call. Place this code above `describe('useTea', () => { ...})`:

```TypeScript
const expectedTeas = [
  {
    id: 1,
    name: 'Green',
    image: 'green.jpg',
    description: 'Green tea description.',
  },
  {
    id: 2,
    name: 'Black',
    image: 'black.jpg',
    description: 'Black tea description.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'herbal.jpg',
    description: 'Herbal Infusion description.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: 'oolong.jpg',
    description: 'Oolong tea description.',
  },
  {
    id: 5,
    name: 'Dark',
    image: 'dark.jpg',
    description: 'Dark tea description.',
  },
  {
    id: 6,
    name: 'Puer',
    image: 'puer.jpg',
    description: 'Puer tea description.',
  },
  {
    id: 7,
    name: 'White',
    image: 'white.jpg',
    description: 'White tea description.',
  },
  {
    id: 8,
    name: 'Yellow',
    image: 'yellow.jpg',
    description: 'Yellow tea description.',
  },
];

const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    delete tea.image;
    return tea;
  });
};
```

### Getting all the Teas

Let's place some setup logic for our "get all teas" tests in `useTea.test.tsx`:

**`src/tea/useTea.test.tsx`**

```TypeScript
  ...
  describe('useTea', () => {
    describe('get all teas', () => {
      beforeEach(() => {
        (apiInstance.get as any) = jest.fn(() =>
          Promise.resolve({ data: resultTeas() }),
        );
      });
      expect(apiInstance.get).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

Next we'll write a test case making sure that `getTeas` makes a network request to our endpoint:

```TypeScript
  ...
  describe('get all teas', () => {
    beforeEach(() => {
      ...
    });

    it('gets the teas', async () => {
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.getTeas();
      });
      expect(apiInstance.get).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

Let's make this test pass. First, we need to pull in a reference to our HTTP interceptor and use it to make a GET request:

**`src/tea/useTea.tsx`**

```TypeScript
import apiInstance from '../core/apiInstance';
import { Tea } from '../shared/models';

export const useTea = () => {

  const getTeas = async (): Promise<Array<Tea>> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const { data } =  await apiInstance.get(url);
  };
  ...
});
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
import apiInstance from '../core/apiInstance';
...

const images: Array<string> = [
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
  const getTeas = async (): Promise<Array<Tea>> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const { data } = await apiInstance.get(url);
    return data.map((tea: Tea) => ({
      ...tea,
      image: require(`../assets/images/${images[tea.id - 1]}.jpg`),
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
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
  const { data } = await apiInstance.get(url);
  return data.map((tea: Tea) => ({
    ...tea,
    image: require(`../assets/images/${images[tea.id - 1]}.jpg`),
  }));
}, []);
```

This will prevent the function from being run multiple times if it's used as part of the dependencies of a `useEffect()`, i.e. `useEffect(() => { getTeas(); }, [getTeas])`.

### Getting a Specific Tea

Start by filling out the describe block for "get a specific tea":

**`src/tea/useTeas.test.tsx`**

```TypeScript
...
describe('useTea', () => {
  ...
  describe('get a specific tea', () => {
     beforeEach(() => {
      (apiInstance.get as any) = jest.fn(() =>
        Promise.resolve({ data: resultTeas()[0] }),
      );
    });

    it('gets the specific tea', async () => {
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.getTeaById(4);
      });
      expect(apiInstance.get).toHaveBeenCalledTimes(1);
    });

    it('adds an image to the Tea object', async () => {
      let tea: Tea | undefined = undefined;
      const { result } = renderHook(() => useTea());
      await act(async () => {
        tea = await result.current.getTeaById(4);
      });
      expect(tea).toEqual(expectedTeas[0]);
    });
  });
  ...
});
```

**Challenge:** Your next challenge is to implement `getTeaById()` to make the tests pass:

1. The URL will be `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`
2. Wrap the function in a `useCallback()`.

Implementing `getTeaById` **does not** require a `useEffect`:

**`src/tea/useTea.tsx`**

```TypeScript
const getTeas = useCallback(async (): Promise<Tea[]> => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
  const { data } = await apiInstance.get(url);
  return data.map((tea: Tea) => ({
    ...tea,
    image: require(`../assets/images/${images[tea.id - 1]}.jpg`),
  }));
}, []);

const getTeaById = useCallback(async (id: number): Promise<Tea> => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
  const { data } = await apiInstance.get(url);
  return {
    ...data,
    image: require(`../assets/images/${images[data.id - 1]}.jpg`),
  };
}, []);
```

Let's refactor the common bits out:

**`src/tea/useTea.tsx`**

```TypeScript
...
export const useTea = () => {
  const getTeas = useCallback(async (): Promise<Tea[]> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const { data } = await apiInstance.get(url);
    return data.map((item: any) => fromJsonToTea(item));
  }, []);

  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
    const { data } = await apiInstance.get(url);
    return fromJsonToTea(data);
  };

  const fromJsonToTea = (obj: any): Tea => {
    return {
      ...obj,
      image: require(`../assets/images/${images[obj.id - 1]}.jpg`),
    };
  };

  return { getTeas, getTeaById };
};
```

## Conclusion

You have created an HTTP interceptor, simplifying requests made to our back end services. You also created another hook to fetch tea data from the back end. Next, we'll use the data our hook obtains within our tea page.
