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
$ npm install --save-dev react-test-renderer@^17.0.0
```

Remember to terminate and restart any running processes for the new dependencies to be picked up.

## useSession Hook

Add two additional files to `src/core/session`: `useSession.tsx` and `useSession.test.tsx`. Update `src/core/session/index.ts` accordingly.

Populate `useSession.tsx` with the following "interface":

**`src/core/session/useSession.tsx`**

```TypeScript
import { useContext } from "react";
import { SessionContext } from "./SessionProvider";

export const useSession = () => {
  const { state, dispatch } = useContext(SessionContext);

  if (state === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
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

Do the same for `useSession.test.tsx`:

**`src/core/session/useSession.test.tsx`**

```TypeScript
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useSession } from './useSession';
import { SessionProvider } from './SessionProvider';
import { mockSession } from './__fixtures__/mockSession';

jest.mock('@capacitor/preferences');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const wrapper = ({ children }: any) => <SessionProvider>{children}</SessionProvider>;

describe('useSession()', () => {
  beforeEach(() => {
    Preferences.get = jest.fn(async () => ({ value: null }));
    Preferences.set = jest.fn(async () => void 0);
    const { token, user } = mockSession;
    mockedAxios.post.mockResolvedValue({ data: { success: true, token, user } });
  });

  describe('login', () => { });

  describe('logout', () => { })

  afterEach(() => jest.restoreAllMocks());
});
```

### Login

When a user attempts to sign into our application the following needs to happen:

1. Dispatch the `LOGIN` action
2. POST to the login endpoint to obtain the user's session information
3. On success, store the session token in the Capacitor Storage API and dispatch `LOGIN_SUCCESS`
4. On failure, dispatch `LOGIN_FAILURE`

The unit tests for these scenarios are found below. Add them inside the login `describe()` block in `useSession.test.tsx` in addition to adding any required imports.

```TypeScript
it('POSTs the login request', async () => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
  const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
  await waitForNextUpdate();
  await act(() => result.current.login('test@test.com', 'P@ssword!'));
  expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  const [username, password] = ['test@test.com', 'P@ssword!'];
  expect(mockedAxios.post).toHaveBeenCalledWith(url, { username, password });
});

describe('on success', () => {
  it('stores the token in storage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'auth-token', value: mockSession.token });
  });

  it('sets the session', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(result.current.session).toEqual(mockSession);
  });
});

describe('on failure', () => {
  beforeEach(() => mockedAxios.post.mockResolvedValue({ data: { success: false } }));

  it('sets an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.login('test@test.com', 'P@ssword!'));
    expect(result.current.error).toEqual('Failed to log in.');
  });
});
```

Now let's wire up the function. The `login()` function will be partially provided to you. Your **challenge** is to complete it's implementation and make the tests pass.

Consult the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Capacitor Preferences API</a> documentation if you get stuck. If you need assistance, please let your instructor know.

**`src/core/session/useSession.tsx`**

```TypeScript
...
const login = async (username: string, password: string): Promise<void> => {
  // 1. Dispatch the LOGIN action
  try {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await axios.post(url, { username, password });

    if (!data.success) throw new Error('Failed to log in.');

    // 2. Store data.token in Capacitor Preferences using 'auth-token' as the key
    const session = { token: data.token, user: data.user };
    // 3. Dispatch the LOGIN_SUCCESS action
  } catch (error: any) {
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

Replace the existing logout `describe()` block in `useSession.test.tsx` with the following:

```TypeScript
describe('logout', () => {
  beforeEach(() => {
    Preferences.remove = jest.fn(async () => void 0);
    Preferences.get = jest.fn(async () => ({ value: mockSession.token }));
    mockedAxios.get.mockResolvedValue({ data: mockSession.user });
  });

  it('POSTs the logout request', async () => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
    const headers = { Authorization: 'Bearer ' + mockSession.token };
    const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
    await waitForNextUpdate();
    await act(() => result.current.logout());
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(url, null, { headers });
  });

  describe('on success', () => {
    it('removes the token from storage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
      await waitForNextUpdate();
      await act(() => result.current.logout());
      expect(Preferences.remove).toHaveBeenCalledTimes(1);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth-token' });
    });

    it('clears the session', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
      await waitForNextUpdate();
      await act(() => result.current.logout());
      expect(result.current.session).toBeUndefined();
    });
  });

  describe('on failure', () => {
    it('sets an error', async () => {
      mockedAxios.post.mockImplementationOnce(() => {
        throw new Error('Failed to log out');
      });
      const { result, waitForNextUpdate } = renderHook(() => useSession(), { wrapper });
      await waitForNextUpdate();
      await act(() => result.current.logout());
      expect(result.current.error).toEqual('Failed to log out');
    });
  });
});
```

The partial `logout()` implementation for `useSession.tsx` is below. Consult the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Capacitor Preferences API</a> documentation if you get stuck. If you need assistance, please let your instructor know.

```TypeScript
const logout = async (): Promise<void> => {
    // 1. Dispatch the LOGOUT action
    try {
      const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
      const headers = { Authorization: 'Bearer ' + state.session!.token };

      await axios.post(url, null, { headers });
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

Open `src/login/LoginPage.tsx` and take a look at the button that handles submission. Currently, it only prints out the form data to the console.

Let's import our `useSession()` hook so that we can call our login function:

```TypeScript
...
const LoginPage: React.FC = () => {
  const { login } = useSession();
  const history = useHistory();
  const { handleSubmit, control, formState: {...}} = useForm<{...}>({...});

  const handleLogin = async (data: LoginInputs) => {
    await login(data.email, data.password);
    session && history.replace('/tea');
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

If the sign in failed, we should print the `error` from `useSession()`. In order to programmatically redirect a signed-in user who navigates to `http://localhost:8100/login` we will need to add a `useEffect`.

Make the following changes:

```TypeScript
...
const LoginPage: React.FC = () => {
  const { login, session, error } = useSession();
  const history = useHistory();
  ...

  useEffect(() => session && history.replace('/tea'), [history, session]);

  return (
    ...
    <div className="error-message" data-testid="errors">
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
import { useSession } from '../core/auth';
...

const TeaPage: React.FC = () => {
  const { logout } = useSession();
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

There's a few ways we could approach this. We could use `useSession()` to check the authentication `status` on the tea page, and navigate the user to the login page if they aren't signed in - but that won't scale as we add more pages to our application. We could check the status on the main `<App />` component and redirect the user to the login page there - but that would cause unneccesary component re-renders.

What if we "extended" the `Route` component and added in logic to check the user's current authentication status?

### `PrivateRoute` Component

Start by creating a new file in `src/core/session` named `PrivateRoute.tsx`:

**`src/core/session/PrivateRoute.tsx`**

```TypeScript
import { Redirect } from 'react-router';
import { useSession } from './useSession';

export const PrivateRoute = ({ children }: any) => {
  const { session } = useSession();

  if (!session) {
    return <Redirect to="/login" />;
  }

  return children;
};
```

Don't forget to update the barrel file for `src/core/session` and let's start using the component.

### Using `PrivateRoute`

Using our `PrivateRoute` component is trivial, it's a drop-in replacement for `Route`.

Open `src/App.tsx` and add wrap `<TeaPage />` with our `<PrivateRoute />` component:

```JSX
<Route exact path="/tea">
  <PrivateRoute>
    <TeaPage />
  </PrivateRoute>
</Route>
```

That's it. Head to Chrome, sign out of the application you have to and try to navigate to the tea page by modifying the URL bar. We'll always be taken to the login page unless we are logged in.

## Conclusion

We have added authentication and authorization to our application. Next we are going to swap our mock tea data with the real deal.
