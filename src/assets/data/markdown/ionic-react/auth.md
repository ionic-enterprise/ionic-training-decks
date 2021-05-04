# Lab: Handling Authentication and Authorization

In this lab, you will learn how to:

- POST data to an API endpoint
- Create custom React hooks
- Guard routes from unauthorized users

## Overview

State management is in place to manage the identity of the application user. It's a bit useless without a way to actually sign in and out though. A custom React hook is a great place to implement this type of functionality for our application's components to consume.

We can also use the state created in the last lab to create a component that guards routes against unauthorized users, redirecting them to the login page should they not be authenticated.

## Prerequisites

In order to test React hooks we need to add additional dependencies to our project:

```bash
$ npm install @testing-library/react-hooks
$ npm install --save-dev react-test-renderer
```

Remember to terminate and restart any running processes for the new dependencies to be picked up.

## useAuthentication Hook

Add two additional files to `src/core/auth`: `useAuthentication.tsx` and `useAuthentication.test.tsx`. Update `src/core/auth/index.ts` accordingly.

Populate `useAuthentication.tsx` with the following "interface":

**`src/core/auth/useAuthentication.tsx`**

```TypeScript
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuthentication = () => {
  const { state, dispatch } = useContext(AuthContext);

  if (state === undefined) {
    throw new Error('useAuthentication must be used with an AuthProvider');
  }

  const login = async (): Promise<void> => { };
  const logout = async (): Promise<void> => { };

  return {
    session: state.session,
    loading: state.loading,
    error: state.error,
    login,
    logout
  };
};
```

Do the same for `useAuthentication.test.tsx`:

**`src/core/auth/useAuthentication.test.tsx`**

```TypeScript
import Axios from 'axios';
import { Plugins } from '@capacitor/core';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useAuthentication } from './useAuthentication';
import { AuthProvider } from './AuthContext';
import { mockSession } from './__mocks__/mockSession';

const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;

describe('useAuthentication', () => {
  beforeEach(() => {
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.get as any) = jest.fn(async () => ({ value: null }));
    (Plugins.Storage.set as any) = jest.fn(async () => ({}));
    (Axios.post as any) = jest.fn(async () => ({
      data: {
        success: true,
        token: mockSession.token,
        user: mockSession.user,
      },
    }));
  });

  describe('login', (username: string, password: string) => {

  });

  describe('logout', () => {});

  afterEach(() => jest.restoreAllMocks());
});
```

### Login

When a user attempts to sign into our application the following needs to happen:

1. Dispatch the `LOGIN` action
2. POST to the login endpoint to obtain the user's session information
3. On success, store the session token in the Capacitor Storage API and dispatch `LOGIN_SUCCESS`
4. On failure, dispatch `LOGIN_FAILURE`

The unit tests for these scenarios are found below. Add them inside the login `describe()` block in `useAuthentication.test.tsx` in addition to adding any required imports.

```TypeScript
it('POSTs the login request', async () => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
  const { result, waitForNextUpdate } = renderHook(
    () => useAuthentication(),
    { wrapper },
  );
  await waitForNextUpdate();
  await act(() => result.current.login('test@test.com', 'P@ssword!'));
  expect(Axios.post).toHaveBeenCalledTimes(1);
  expect(Axios.post).toHaveBeenCalledWith(url, {
    username: 'test@test.com',
    password: 'P@ssword!',
  });
});

describe('on success', () => {
  it('stores the token in storage', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.set).toHaveBeenCalledWith({
      key: 'auth-token',
      value: mockSession.token,
    });
  });

  it('sets the session', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(result.current.session).toEqual(mockSession);
  });
});

describe('on failure', () => {
  beforeEach(() => {
    (Axios.post as any) = jest.fn(async () => ({
      data: { success: false },
    }));
  });

  it('sets the error', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(result.current.error).toEqual('Failed to log in.');
  });
});
```

Now let's wire up the function. The `login()` function will be partially provided to you. Your **challenge** is to complete it's implementation and make the tests pass.

Consult the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Capacitor Storage API</a> documentation if you get stuck. If you need assistance, please let your instructor know.

**`src/core/auth/useAuthentication.tsx`**

```TypeScript
...
const login = async (username: string, password: string): Promise<void> => {
  // 1. Dispatch the LOGIN action
  try {
    const { Storage } = Plugins;
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await Axios.post(url, { username, password });

    if (!data.success) throw new Error('Failed to log in.');

    // 2. Store data.token in Capacitor Storage using 'auth-token' as the key
    const session = { token: data.token, user: data.user };
    // 3. Dispatch the LOGIN_SUCCESS action
  } catch (error) {
    // 4. Dispatch the LOGIN_FAILURE action. 'error.message' should be sent as the error parameter
  }
};
...
```

### Logout

When the user wants to sign out of the application the following must occur:

1. Dispatch the `LOGOUT` action
2. POST to the logout endpoint to sign the user out of the backend data service
3. On success, remove the session token from the Capacitor Storage API and dispatch `LOGOUT_SUCCESS`
4. On failure, dispatch `LOGOUT_FAILURE`

The process followed for `login()` will be used for the `logout()` method. You will first be given the unit tests for the logout `describe()` block then a partial implementation of the `logout()` method to complete.

Replace the existing logout `describe()` block in `useAuthentication.test.tsx` with the following:

```TypeScript
describe('logout', () => {
  beforeEach(() => {
    (Plugins.Storage.remove as any) = jest.fn(async () => ({}));
    (Plugins.Storage.get as any) = jest.fn(async () => ({
      value: mockSession.token,
    }));
    (Axios.get as any) = jest.fn(async () => ({ data: mockSession.user }));
  });

  it('POSTs the logout request', async () => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
    const headers = { Authorization: 'Bearer ' + mockSession.token };
    const { result, waitForNextUpdate } = renderHook(
      () => useAuthentication(),
      { wrapper },
    );
    await waitForNextUpdate();
    await act(() => result.current.logout());
    expect(Axios.post).toHaveBeenCalledTimes(1);
    expect(Axios.post).toHaveBeenCalledWith(url, null, { headers });
  });

  describe('on success', () => {
    it('removes the token from storage', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.logout());
      expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.remove).toHaveBeenCalledWith({
        key: 'auth-token',
      });
    });

    it('clears the session', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      expect(result.current.session).toEqual(mockSession);
      await act(() => result.current.logout());
      expect(result.current.session).toBeUndefined();
    });
  });

  describe('on failure', () => {
    it('sets the error', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAuthentication(),
        { wrapper },
      );
      await waitForNextUpdate();
      await act(() => result.current.login('test@test.com', 'P@ssword!'));
      expect(result.current.session).toEqual(mockSession);
      (Axios.post as any) = jest.fn(async () => {
        throw new Error('Failed to log out');
      });
      await act(() => result.current.logout());
      expect(result.current.error).toEqual('Failed to log out');
    });
  });
});
```

The partial `logout()` implementation for `useAuthentication.tsx` is below. Consult the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Capacitor Storage API</a> documentation if you get stuck. If you need assistance, please let your instructor know.

```TypeScript
const logout = async (): Promise<void> => {
    // 1. Dispatch the LOGOUT action
    try {
      const { Storage } = Plugins;
      const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
      const headers = { Authorization: 'Bearer ' + state.session!.token };

      await Axios.post(url, null, { headers });
      // 2. Remove 'auth-token' from Capacitor Storage
      // 3. Dispatch the LOGOUT_SUCCESS action
    } catch (error) {
      // 4. Dispatch the LOGOUT_FAILURE action. 'error.message' should be sent as the error parameter
    }
  };
```

## Updating the UI

Now that our hook is complete, it's start to let our pages consume it. We'll start off by wiring up the login page, then add the ability to sign out from the tea page.

### Wiring up Login

Open `src/login/LoginPage.tsx` and take a look at the button that handles submission. Currently, it only prints out the form data to the console - and the data isn't typed either!

Let's type our form data. Make the following modifications where we destructure `useForm()`:

**`src/login/LoginPage.tsx`**

```TypeScript
...
const LoginPage: React.FC = () => {
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<{
    email: string;
    password: string;
  }>({ mode: 'onChange' });
  ...
};
export default LoginPage;
```

Now we need to import our `useAuthentication()` hook so that we can call our login function:

```TypeScript
...
const LoginPage: React.FC = () => {
  const { login } = useAuthentication();
  const { handleSubmit, control, formState: {...}} = useForm<{...}>({...});

  const handleLogin = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
  };

  return (
    ...
    <IonButton
      expand="full"
      disabled={!isDirty || !isValid}
      onClick={handleSubmit(data => handleLogin(data))}
      data-testid="submit-button"
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
  const { login, session, error } = useAuthentication();
  const history = useHistory();
  ...

  useEffect(() => {
    session && history.replace('/tea');
  }, [session, history]);

  return (
    ...
    <div className="error-message">
      ...
      <div>
        {errors.password?.type === 'required' && 'Password is required'}
      </div>
      {error && <div>{error}</div>}
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

What if we "extended" the `Route` component and added in logic to check the user's current authentication status?

### `PrivateRoute` Component

Start by creating a new file in `src/core/auth` named `PrivateRoute.tsx`:

**`src/core/auth/PrivateRoute.tsx`**

```TypeScript
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router';
import { useAuthentication } from './useAuthentication';

export const PrivateRoute: React.FC = () => {
  const { session } = useAuthentication();

  return <Route render={() => <Redirect to="/login" />} />;
};
```

Here we are getting the current session of the user and using `render` to redirect them to the login page, satisfying the case where the user is unauthenticated.

The `Route` component can take in additional props; if we want to treat our `ProtectedRoute` component as if it extends `Route` we should accommodate those props too:

```TypeScript
...
export const PrivateRoute: React.FC<RouteProps> = ({ ...rest }) => {
  const { status } = useAuthentication();

  return <Route {...rest} render={() => <Redirect to="/login" />} />;
};
```

We'll use the spread operator to set the `rest` of props passed in to `PrivateRoute` on the inner `Route` component, which makes our component comparable to subclassing in OOP (i.e., `PrivateRoute extends Route`).

Now we just need a way to render pages when the user is authenticated. We should create a prop named `component`:

```TypeScript
...
interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { session } = useAuthentication();

  return (
    <Route
      {...rest}
      render={props => session ? <Component {...props} /> : <Redirect to="/login" /> }
    />
  );
};
```

Don't forget to update the barrel file for `src/core/auth` and let's start using the component.

### Using `PrivateRoute`

Using our `PrivateRoute` component is trivial, it's a drop-in replacement for `Route`.

Open `src/App.tsx` and add the import for `PrivateRoute` then replace the `Route` component for the `/tea` path with the following line:

```JSX
<PrivateRoute exact path="/tea" component={TeaPage} />
```

That's literally it. Head to Chrome, sign out of the application you have to and try to navigate to the tea page by modifying the URL bar. We'll always be taken to the login page unless we are logged in.

## Conclusion

We have added authentication and authorization to our application. Next we are going to swap our mock tea data with the real deal.
