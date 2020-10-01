# Lab: Handle Authentication

In this lab, you will learn how to:

- POST data to an API endpoint
- Create custom React hooks
- Guard routes from unauthorized users

## Overview

The final piece of our user journey is authentication. We need to provide a mechanism for users to sign in and out of our application. To do so, we'll create a new singleton class for authentication (containing login/logout functionality) then expose it to our components through our own custom hook. The hook will also interact with the authentication state created in the previous lab.

At the end of this lab, you will have your own application specific hook that wraps up all the functionality we've built out for identity and authentication in a nice tidy package. It's pretty cool, so let's get started!

## Authentication Service

First, we need to create a service for authentication. Since we covered this in a previous lab, this portion will simply be a copy-and-paste job.

Add two files to `src/core/services`: `AuthService.ts` and `AuthService.test.ts`.

### Test First

**`src/core/services/AuthService.test.ts`**

```TypeScript
import Axios from 'axios';
jest.mock('axios');
import { IdentityService } from './IdentityService';
import { User } from '../models';
import { AuthService } from './AuthService';

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  it('should use a single instance', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    beforeEach(() => {
      (Axios.post as any) = jest.fn(() =>
        Promise.resolve({
          data: {
            token: '3884915llf950',
            user: mockUser,
            success: true,
          },
        }),
      );
      IdentityService.getInstance().set = jest.fn(() => Promise.resolve());
    });

    it('POSTs the login', async () => {
      const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
      const credentials = { username: 'test@test.com', password: 'P@assword' };
      await authService.login(credentials.username, credentials.password);
      expect(Axios.post).toHaveBeenCalledTimes(1);
      expect(Axios.post).toHaveBeenCalledWith(url, credentials);
    });

    describe('on success', () => {
      it('sets the user and token in the identity service', async () => {
        await authService.login('test@test.com', 'P@assword');
        expect(IdentityService.getInstance().set).toHaveBeenCalledTimes(1);
        expect(IdentityService.getInstance().set).toHaveBeenCalledWith(
          mockUser,
          '3884915llf950',
        );
      });

      it('return true', async () => {
        const res = await authService.login('test@test.com', 'P@assword');
        expect(res).toBeTruthy();
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        (Axios.post as any) = jest.fn(() =>
          Promise.resolve({ data: { success: false } }),
        );
      });

      it('does not set the user and token in the identity service', async () => {
        await authService.login('test@test.com', 'P@assword');
        expect(IdentityService.getInstance().set).toHaveBeenCalledTimes(0);
      });

      it('returns false', async () => {
        const res = await authService.login('test@test.com', 'P@assword');
        expect(res).toBeFalsy();
      });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      (Axios.post as any) = jest.fn(() => Promise.resolve());
      IdentityService.getInstance().clear = jest.fn(() => Promise.resolve());
    });

    it('POSTs the logout', async () => {
      const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
      await authService.logout();
      expect(Axios.post).toHaveBeenCalledTimes(1);
      expect(Axios.post).toHaveBeenCalledWith(url);
    });

    it('clears the identity', async () => {
      await authService.logout();
      expect(IdentityService.getInstance().clear).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

Note that we will be making use of our `IdentityService` to store or clear identity information after login/logout. We'll also be pulling in the default instance of `Axios` since we won't have an authorization token at this point.

### Then Code

**`src/core/services/AuthService.ts`**

```TypeScript
import Axios from 'axios';
import { IdentityService } from './IdentityService';

export class AuthService {
  private static instance: AuthService | undefined;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<boolean> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await Axios.post(url, { username, password });

    if (!data.success) return false;

    IdentityService.getInstance().set(data.user, data.token);
    return true;
  }

  async logout(): Promise<void> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
    await Axios.post(url);
    IdentityService.getInstance().clear();
  }
}
```

Finally, update the barrel file (`src/core/services/index.ts`).

## `useAuthentication` Hook

Before we get into building the hook, we need to add an additional dependencies to our project. Terminate `ionic serve` and `npm test` and add the following dependencies:

```bash
$ npm install @testing-library/react-hooks
$ npm install --save-dev react-test-renderer
```

This is a set of additional tools that will help us test React hooks. Once complete, restart `ionic serve` and `npm test`.

### Interface Setup

Add two additional files to `src/core/auth`: `useAuthentication.tsx` and `useAuthentication.test.tsx`. Update the folder's `index.ts` to `export * from './useAuthentication.tsx`.

Place the following scaffolding code in `useAuthentication.tsx`:

**`src/core/auth/useAuthentication.tsx`**

```TypeScript
import { AuthService } from '../services';

export const useAuthentication = () => {
  const authService = AuthService.getInstance();
  const identityService = IdentityService.getInstance();

  const login = async (username: string, password: string): Promise<void> => {};
  const logout = async (): Promise<void> => {};

  return {
    status: undefined,
    user: undefined,
    error: undefined,
    login,
    logout,
  };
};
```

Let's scaffold the test file as well:

**`src/core/auth/useAuthentication.test.tsx`**

```TypeScript
import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useAuthentication } from './useAuthentication';
import { AuthProvider } from './AuthContext';
import { AuthService, IdentityService } from '../services';
import { User } from '../models';

const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('useAuthentication', () => {
  let authService: AuthService;
  let identityService: IdentityService;

  beforeEach(() => {
    authService = AuthService.getInstance();
    identityService = IdentityService.getInstance();
    identityService.init = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Make note of `wrapper`. We need a way to gain access to `AuthContext`, so we create a component wherein the children are wrapped by `<AuthProvider />`.

### Proxing State

We are going to proxy each property of our authentication state so it is available through `useAuthentication()`. This is another technique to isolate our state management solution from components and other bits of code.

**`src/core/auth/useAuthentication.tsx`**

```TypeScript
import { useContext } from 'react';
import { AuthContext } from '.';
import { AuthService, IdentityService } from '../services';

export const useAuthentication = () => {
  const authService = AuthService.getInstance();
  const identityService = IdentityService.getInstance();

  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthentication must be used with an AuthProvider');
  }

  const login = async (username: string, password: string): Promise<void> => {};
  const logout = async (): Promise<void> => {};

  return {
    status: state.status,
    user: state.user,
    error: state.error,
    login,
    logout,
  };
};
```

We make use of the `useContext()` hook in order to get a reference of `AuthContext`. There's also a check in place to make sure no one calls this hook if they are not a child component of `AuthProvider`, which is good form.

### Login

Our `login()` function needs to do the following:

- Call `AuthService.login()` with a username and password
- Dispatch `LOGIN_SUCCESS` if the user successfully signed in, or `LOGIN_FAILURE` if the user was unsuccessful

#### Test First

Let's start by writing our test cases. Add a describe block for login:

**`src/core/auth/useAuthentication.test.tsx`**

```TypeScript
...
describe('useAuthentication', () => {
  ...
  describe('login', () => {
    beforeEach(() => {
      authService.login = jest.fn(() => {
        identityService['_user'] = mockUser;
        return Promise.resolve(true);
      });
      identityService['_user'] = undefined;
      identityService['_token'] = undefined;
    });

    describe('on success', () => {
      it('sets the status to authenticated', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.status).toEqual('authenticated');
      });

      it('sets the user on successful login', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        identityService['_user'] = mockUser;
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.user).toEqual(mockUser);
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        authService.login = jest.fn(() => Promise.resolve(false));
      });

      it('sets the error', async () => {
        const { result, waitForNextUpdate } = renderHook(
          () => useAuthentication(),
          { wrapper },
        );
        await waitForNextUpdate();
        await act(() => result.current.login('test@test.com', 'P@ssword'));
        expect(result.current.error).toBeDefined();
      });
    });
  });
  ...
});
```

#### Then Code

First we need to check and see if `AuthService.login()` returns true or false, then we can dispatch the appropriate action accordingly:

**`src/core/auth/useAuthentication.tsx`**

```TypeScript
...
export const useAuthentication = () => {
  ...
  const login = async (username: string, password: string): Promise<void> => {
    const isSuccessful = await authService.login(username, password);
    if (isSuccessful)
      return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
    return dispatch({
      type: 'LOGIN_FAILURE',
      error: new Error('Unable to log in, please try again'),
    });
  };
  ...
};

```

### Signing Out

`logout()` is much simpler to test and implement - all it needs to do is call `AuthService.logout()` and dispatch the `LOGOUT` action.

#### Test First

Place the following describe block in the test file:

**`src/core/auth/useAuthentication.test.tsx`**

```TypeScript
describe('logout', () => {
  beforeEach(() => {
    identityService['_user'] = mockUser;
    authService.logout = jest.fn(() => {
      identityService['_user'] = undefined;
      return Promise.resolve();
    });
  });

  it('sets the status to unauthenticated', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword'));
    await act(() => result.current.logout());
    expect(result.current.status).toEqual('unauthenticated');
  });

  it('sets the user to undefined', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword'));
    await act(() => result.current.logout());
    expect(result.current.user).not.toBeDefined();
  });
});
```

In order to properly test `logout()` our tests first need to be in a state where the user has signed in.

#### Then Code

**Challenge:** Implement `logout()` such that the tests pass.

## Updating the UI

## Protecting our Routes

### `ProtectedRoute` Component

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
