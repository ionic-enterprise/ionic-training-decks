# Lab: Handle Authentication

In this lab, you will learn how to:

- POST data to an API endpoint
- Build state management for authentication
- Share data across the application
- Create custom React hooks

## Overview

In the last lab, we created a service that stores information about the currently signed in user, but we are missing a way to obtain this information in the first place.

Like our `IdentityService` we will build a singleton class for authentication which will contain login and logout functionality. Then we will use state management to make the authentication endpoints and identity information available across the application.

### State Management

React provides the tools to implement state management out-of-the-box. However, this is not the only way to achieve state management in React. Several battle-tested and hardened libraries exist for state management, such as <a href="https://redux.js.org/" target="_blank">Redux</a> or <a href="https://mobx.js.org/README.html" target="_blank">MobX</a>.

We'll isolate our state management in such a way that it can be easily replaced by another state management solution, if you so wish to use a third-party library to manage state. No hard feelings!

To best accomodate this, we will <a href="https://reactjs.org/docs/hooks-custom.html" target="_blank">build our own React hook</a> that will invoke our state management solution. This way calls to state management are abstracted away from components.

## Authentication Service

First, we need to create a service for authentication. Since we covered this in the last lab, this portion will simply be a copy-and-paste job.

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

## Building State Management

At a high level, building state management in React consists of the following pieces:

- The <a href="https://reactjs.org/docs/context.html" target="_blank">React Context API</a>
- The <a href="https://reactjs.org/docs/hooks-reference.html#usereducer" target="_blank">`useReducer` hook</a>

Create a new folder `src/core/auth`. Inside this folder, create three files: `AuthContext.tsx`, `AuthContext.test.tsx` and `index.ts`.

**Note:** We're going to place a lot of functionality into these files. It would be best practice to split them up into smaller, more manageable files. In order to keep our state management portable to other state management solutions, we'll break the rules this once.

### Auth State

A good place to start is to define the authentication state that we want to share across the application. We'll want to track the authentication status of the current user, and if available, their user profile information. Open `AuthContext.tsx` and define the state like so:

**`src/core/auth/AuthContext.tsx`**

```TypeScript
import React from 'react';
import { User } from '../models';

type AuthStatus = 'pending' | 'authenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | undefined;
  error: any | undefined;
}

const initialState: AuthState = {
  status: 'pending',
  user: undefined,
  error: undefined,
};
```

Our application users can be in one of three states, signed in (authenticated), signed out (unauthenticated), or undetermined while we see if they have a token stored on device (pending). It's always good form to provide a property for errors as part of state, in the unforeseen circumstance that something goes wrong we can handle it.

### Actions

Next we'll define actions that can be dispatched as part of authentication state. We'll need one for logging out, logging in successfully, and logging in unsuccessfully. Add the following code to `AuthContext.tsx`:

```TypeScript
export type AuthAction =
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE'; error: any };
```

Any properties after `type` are known as an action's payload.

### Reducer

With our state and actions defined, we can now create a reducer function that will update our authentication state. Add the following function to `AuthContext.tsx`:

```TypeScript
export const authReducer = (state: AuthState = initialState, action: AuthAction) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, status: 'authenticated', user: action.user };
    case 'LOGIN_FAILURE':
      return { ...state, status: 'unauthenticated', error: action.error };
    case 'LOGOUT':
      return { ...state, status: 'unauthenticated', user: undefined, error: undefined };
    default:
      return state;
  }
};
```

With that we have our building blocks of state management, but we don't have a way to access it across our application's components. Let's go ahead and build a context that will do just that.

### Context

---

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
