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

  const login = async (): Promise<void> => {};
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

We are going to proxy each property of our authentication state so it is available through `useAuthentication()`. This is another technique to isolate our state management solution from components and other bits of code.

### Proxing State

Let's go ahead and proxy our state through the hook. Update `useAuthentication()` like so:

```TypeScript
import { useContext } from 'react';
import { AuthContext } from '.';
import { AuthService } from '../services';

export const useAuthentication = () => {
  const authService = AuthService.getInstance();
  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthentication must be used with an AuthProvider');
  }

  const login = async (): Promise<void> => {};
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

### Signing In

1. test
2. implement method
3. update login

### Signing Out

1. implement method
2. test
3. update tea page

## Protecting our Routes

### `ProtectedRoute` Component

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
