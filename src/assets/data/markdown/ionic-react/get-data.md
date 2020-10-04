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
- Trim the response object to just return the data portion

Create a new file `src/core/apiInstance.ts` and write the following code:

**`src/core/apiInstance.ts`**

```TypeScript
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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

apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
);

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

const mockTeaData = // TODO: Copy the contents of teaData from TeaPage.tsx into this variable

describe('useTea', () => {
  beforeEach(() => {
    apiInstance.get = jest.fn();
  });

  describe('get all teas', () => { });

  describe('get a specific tea', () => { });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Once you've finished copying over the contents of `teaData` from `TeaPage.tsx` move onto the next section.

### Getting all the Teas

Our `getTeas` function needs to make a request to our back end service to retrieve all the teas. Let's go ahead and write our test case for this function:

**`src/tea/useTea.test.tsx`**

```TypeScript
...
  describe('useTea', () => {
    ...
    describe('get all teas', () => {
      beforeEach(() => {
        (apiInstance.get as any) = jest.fn(() => Promise.resolve(mockTeaData));
      });

      it('returns an array of Tea', async () => {
        let teas: Array<Tea> = [];
        const { result } = renderHook(() => useTea());
        await act(async () => {
          teas = await result.current.getTeas();
        });
        expect(teas).toEqual(mockTeaData);
      });
    });
  });
...
```

Now let's move to the hook file and implement the function.

First, we need to pull in a reference to our HTTP interceptor and use it to make a GET request:

**`src/tea/useTea.tsx`**

```TypeScript
import apiInstance from '../core/apiInstance';
import { Tea } from '../shared/models';

export const useTea = () => {

  const getTeas = async (): Promise<Array<Tea>> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    return await apiInstance.get(url);
  };
  ...
});
```

The interceptor does a lot of the heavy lifting here! This is a perfectly valid function, however, since we want to run this function on initialization of our tea page, we'll notice one of two things:

1. If we do not make `getTeas` a dependency of the tea page's `useEffect`, React will throw a warning
2. If we do make `getTeas` a dependency of the tea page's `useEffect`, `getTeas` will run within an infinite loop

The proper way to approach these things is to wrap the function within the `useCallback()` hook. `useCallback()` will memoize the function so that it is only run if any of it's dependencies change:

```TypeScript
const [query, query] = useState('react');
const getByQyery = useCallback(() => { return getDataByQuery(query); }, [query]);
```

The block above will only invoke `getByQuery` whenever it's dependency `query` changes. For our case, we don't have any dependencies, so we can use an empty bracket. Update `getTeas` to match the following:

**`src/tea/useTea.tsx`**

```TypeScript
import { useCallback } from 'react';
...
export const useTea = () => {
  const getTeas = useCallback(async (): Promise<Tea[]> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    return await apiInstance.get(url);
  }, []);
  ...
};
```

The use of `useCallback` will ensure that we don't run into either scenario above. Save and our test case passes!

#### Side-note: Reference Material

I strongly urge you to bookmark <a href="https://overreacted.io/a-complete-guide-to-useeffect/" target="_blank">A Complete Guide to useEffect</a> by Dan Abramov to read at a later time. It's a comprehensive guide to the `useEffect()` hook and answers several questions, including "How do I correctly fetch data inside useEffect?".

### Getting a Specific Tea

Like `getTeas`, we only have one test case to write for `getTeaById`. Fill in the "get a specific tea" describe block with the following:

**`src/tea/useTeas.test.tsx`**

```TypeScript
...
describe('get a specific tea', () => {
  beforeEach(() => {
    (apiInstance.get as any) = jest.fn(() => Promise.resolve(mockTeaData[3]));
  });

  it('returns a Tea object', async () => {
    let tea: Tea | undefined = undefined;
    const { result } = renderHook(() => useTea());
    await act(async () => {
      tea = await result.current.getTeaById(4);
    });
    expect(tea).toEqual(mockTeaData[3]);
  });
});
...
```

Implementing `getTeaById` **does not** require a `useEffect`:

**`src/tea/useTea.tsx`**

```TypeScript
...
export const useTea = () => {
  ...
  const getTeaById = async (id: number): Promise<Tea | undefined> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
    // TODO: Make a GET request to the endpoint using the interceptor
  };
  ...
};
```

**Challenge:** Finish the `getTeaById` implementation and make the test pass.

You may be wondering why we don't wrap this function in a `useCallback()` hook. This function has a dependency on `id`, so shouldn't we be implementing the function like this?

```TypeScript
const getTeaById = useCallback(async (id: number) => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
  return await apiInstance.get(url);
}, [id]);
```

This doesn't work because `useTea()` doesn't maintain the state of `id`. We expect some other actor to manage that value for us. It falls on the responsiblity of that actor take this function and memoize it, if they so wish. With `getTeas`, we used `useCallback()` as a way for React to know that this function's dependencies will not change, therefore it should not be invoked upon component re-renders. Since `id` _can_ change, it would be up to the caller to determine when to let React know when it's OK to invoke the method.

## Conclusion

You have created an HTTP interceptor, simplifying requests made to our back end services. You also created another hook to fetch tea data from the back end. Next, we'll use the data our hook obtains within our tea page.
