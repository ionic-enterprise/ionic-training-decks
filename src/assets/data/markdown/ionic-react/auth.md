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

Now that our hook is complete, it's start to let our pages consume it. We'll start off by wiring up the login page, then add the ability to sign out from the tea page.

### Wiring up Login

Open `src/login/LoginPage.tsx` and take a look at the button that handles submission. Currently, it only prints out the form data to the console - and the data isn't typed either!

Let's type our form data. Make the following modifications where we destructure `useForm()`:

**`src/login/LoginPage.tsx`**

```TypeScript
...
const LoginPage: React.FC = () => {
  const { handleSubmit, control, formState, errors } = useForm<{
    email: string;
    password: string;
  }>({
    mode: 'onChange',
  });
  ...
};
export default LoginPage;
```

Now we need to import our `useAuthentication()` hook so that we can call our login function:

```TypeScript
...
const LoginPage: React.FC = () => {
  const { login } = useAuthentication();
  const { handleSubmit, control, formState, errors } = useForm<{...}>({...});

  const handleLogin = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
  };

  return (
    ...
    <IonButton
      expand="full"
      disabled={!formState.isValid}
      onClick={handleSubmit(data => handleLogin(data))}
    >
      Sign In
      <IonIcon slot="end" icon={logInOutline} />
    </IonButton>
    ...
  );
};
export default LoginPage;
```

Finally, we want to redirect the user to the tea page after they have signed in. However, if the sign in failed, we should also print the `error` from `useAuthentication()`. To programmatically redirect the user, we will need to pull in the `useHistory()` hook provided by React Router.

Make the following changes:

```TypeScript
...
import { useHistory } from 'react-router';

const LoginPage: React.FC = () => {
  const { login, status, error } = useAuthentication();
  const history = useHistory();
  ...

  useEffect(() => {
    status === 'authenticated' && history.replace('/tea');
  }, [status, history]);

  return (
    ...
    <div className="error-message">
      ...
      <div>
        {errors.password?.type === 'required' && 'Password is required'}
      </div>
      {error && <div>{error.message}</div>}
    </div>
    ...
  );
};
export default LoginPage;
```

Go ahead and change your browser's URL to http://localhost:8100/login and test this out!

### Adding Logout

Our application doesn't have a visual cue to sign out, but we know we'll want one. For now, we'll add it to the header of the tea page.

Let's go ahead and write the logic to handle signing out:

**`src/tea/TeaPage.tsx`**

```TypeScript
...
import { useHistory } from 'react-router';
import { useAuthentication } from '../core/auth';
...

const TeaPage: React.FC = () => {
  const { logout } = useAuthentication();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  return (...);
};
export default TeaPage;
```

**Challenge:** Have a look at the <a href="https://ionicframework.com/docs/api/toolbar" target="_blank">IonToolbar</a> documentation and add a button in the end slot. Use the `logOutOutline` icon and wire the button up to `handleLogout`.

## Protecting our Routes

Now we can sign in and out of our application, but there is one problem left. Unauthenticated users can still view the tea page. Ideally, they should be redirected to the login page to login first.

There's a few ways we could approach this. We could use `useAuthentication()` to check the authentication `status` on the tea page, and navigate the user to the login page if they aren't signed in - but that won't scale as we add more pages to our application. We could check the status on the main `<App />` component and redirect the user to the login page there - but that would cause unneccesary component re-renders.

Take a look at this route we have in place in `App.tsx`:

```JSX
<Route exact path="/" render={() => <Redirect to="/tea" />} />
```

What if we "extended" the `Route` component and added in logic to check the user's current authentication status?

### `ProtectedRoute` Component

Start by creating a new file in `src/core/auth` named `ProtectedRoute.tsx`:

**`src/core/auth/ProtectedRoute.tsx`**

```TypeScript
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router';
import { useAuthentication } from './useAuthentication';

export const ProtectedRoute: React.FC = () => {
  const { status } = useAuthentication();

  return <Route render={() => <Redirect to="/login" />} />;
};
```

Here we are getting the current authentication `status` of the user and using `render` to redirect them to the login page, satisfying the case where the user is unauthenticated.

The `Route` component can take in additional props; if we want to treat our `ProtectedRoute` component as if it extends `Route` we should accomodate those props too:

```TypeScript
...
export const ProtectedRoute: React.FC<RouteProps> = ({ ...rest }) => {
  const { status } = useAuthentication();

  return <Route {...rest} render={() => <Redirect to="/login" />} />;
};
```

We'll use the spread operator to set the `rest` of props passed in to `ProtectedRoute` on the inner `Route` component, which makes our component comparable to subclassing in OOP (i.e., `ProtectedRoute extends Route`).

Now we just need a way to render pages when the user is authenticated. We should create a prop named `component`:

```TypeScript
...
interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { status } = useAuthentication();

  return <Route {...rest} render={(props) =>
    status === 'authenticated' ? <Component {...props} /> : <Redirect to="/login" />
  } />;
};
```

Don't forget to update the barrel file for `src/core/auth` and let's start using the component.

### Using `ProtectedRoute`

Using our `ProtectedRoute` component is trivial, it's a drop-in replacement for `Route`.

Open `src/App.tsx` and add the import for `ProtectedRoute` then replace the `Route` component for the `/tea` path with the following line:

```JSX
<ProtectedRoute path="/tea" component={TeaPage} exact={true} />
```

Your `App` template should look like this once complete:

**`src/App.tsx`**

```TypeScript
const App: React.FC = () => {
 ...
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={LoginPage} exact={true} />
          <ProtectedRoute path="/tea" component={TeaPage} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

That's literally it. Head to Chrome, sign out of the application you have to and try to navigate to the tea page by modifying the URL bar. We'll always be taken to the login page unless we are logged in.

## Conclusion

Congratulations, your application has been hooked up for authentication! Along the way you've learned about state management, singletons, custom React hooks, the React Context API and a little bit about reusable components. Next we will swap our mock tea data with real data from the back end.
