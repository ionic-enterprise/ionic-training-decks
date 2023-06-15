# Lab: Create the Authentication Workflow

So far, we have a utility module that manages the session. It is now time to put all of theses pieces together to create an authentication workflow.

In this lab you will add the following capabilities:

- Handle logging in and logging out
- Guard routes that require a session
- Intercepting HTTP requests and responses

## A Note About React

React itself is primarily concerned with managing the UI and rendering components based on state and props. It provides a declarative way to build UIs and handles updates efficiently. However, React doesn't prescribe a specific architecture or dictate where business logic should be placed.

To handle business logic, React developers commonly use patterns like Flux, Redux, or the newer Context API introduced in React. These patterns emphasize separating state management and business logic from the component tree. By doing so, it becomes easier to test, reason about, and maintain the application.

In this training, we will build out a simple subscription-based mechanism to share state between our business logic and React components intended to be easily swappable with Redux, Recoil, or whichever state management solution you prefer.Ultimately, React is just a UI library, and it's up to developers to decide how they structure and organize state management and their application's non-UI logic.

## Session Subscriptions

Our application manages the user session in our utilities folder, which means that React will not be aware of any changes to the session when the user signs in, when they sign out, etc. React is only aware of changes made to state within the component tree -- we need a mechanism that allows us to communicate these changes to React.

As mentioned above, we will build our own mechanism; a simplified implementation of the pub/sub pattern suited for this training. You will want to use a more robust state management library, such as Redux or Recoil in production applications.

Start by adding a variable to `src/utils/session.ts`:

```diff
  ...
  const key = 'session';
  let session: Session | undefined;
+ let onSessionChange = ((session: Session | undefined) => void) | undefined;
  ...
```

Then add the following functions:

```typescript
const registerSessionChangeCallback = (callback: (session: Session | undefined) => void) => {
  onSessionChange = callback;
}:

const unregisterSessionChangeCallback = () => (onSessionChange = undefined);
```

Make sure to export those functions along with the others, and mock the functions in `src/utils/__mocks__/session.ts`.

```diff
  import { vi } from 'vitest';

  const clearSession = vi.fn().mockResolvedValue(undefined);
  const getSession = vi.fn().mockResolvedValue(undefined);
  const setSession = vi.fn().mockResolvedValue(undefined);
+ const registerSessionChangeCallback = vi.fn().mockReturnValue(undefined);
+ const unregisterSessionChangeCallback = vi.fn().mockReturnValue(undefined);

+ export { clearSession, getSession, setSession, registerSessionChangeCallback, unregisterSessionChangeCallback };
```

Add the following unit test `describe()` block within `describe('setSession')`, in `session.test.ts`:

```typescript
describe('session change callback', () => {
  let mockCallback: any;

  beforeEach(() => {
    mockCallback = vi.fn();
    unregisterSessionChangeCallback();
  });

  it('passes the session to the callback if a callback is defined', async () => {
    registerSessionChangeCallback(mockCallback);
    await setSession(testSession);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(testSession);
  });

  it('does not call the callback if it is undefined', async () => {
    await setSession(testSession);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
```

The modification to the `setSession()` method in `session.ts` is relatively simple:

```diff
const setSession = async (s: Session): Promise<void> => {
  session = s;
  await Preferences.set({ key, value: JSON.stringify(s) });
+ if (onSessionChange) onSessionChange(session);
};
```

Similarly, add the following `describe()` block within `describe('clearSession')`:

```typescript
describe('session change callback', () => {
  let mockCallback: any;

  beforeEach(() => {
    mockCallback = vi.fn();
    unregisterSessionChangeCallback();
  });

  it('passes the session to the callback if a callback is defined', async () => {
    registerSessionChangeCallback(mockCallback);
    await clearSession();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(undefined);
  });

  it('does not call the callback if it is undefined', async () => {
    await clearSession();
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
```

I leave it up to you to modify `clearSession()` in `src/utils/session.ts`.

We just built a _very simplistic_ implementation of the pub/sub pattern allowing us to register a single function that executes within the context of React when the session changes in our business logic.

## Create the `AuthProvider`

We'll need a way to communicate the user's authentication status with the rest of the application so we can do things like redirect the user to the login page if they are not signed in. Let's use <a href="https://react.dev/learn/passing-data-deeply-with-context" target="_blank">React Context</a> to accomplish this.

Create a new folder `src/providers`. Add the following files to it:

`src/providers/AuthProvider.test.tsx`

```tsx
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import AuthProvider from './AuthProvider';

vi.mock('../utils/session');

describe('<AuthProvider />', () => {
  const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
  const testSession: Session = {
    user: {
      id: 314159,
      firstName: 'Testy',
      lastName: 'McTest',
      email: 'test@test.com',
    },
    token: '123456789',
  };

  beforeEach(() => vi.clearAllMocks());

  describe('when rendered', () => {
    it('shows a spinner when checking for a session', async () => {
      const { container } = render(<AuthProvider />);
      await waitFor(() => expect(container.querySelectorAll('ion-spinner')).toHaveLength(1));
    });
  });
});
```

`src/providers/AuthProvider.tsx`

```tsx
import { ReactNode, createContext, useContext, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { Session } from '../models';

type Props = { children?: ReactNode };
type Context = { session?: Session };

const AuthContext = createContext<Context | undefined>(undefined);
const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isSetup, setIsSetup] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ session }}>
      <IonSpinner />
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
export default AuthProvider;
```

An explanation for the `AuthProvider` is in order:

1. At the top of the file, type definitions are defined for the data we want this Context to share, and the props it's Provider component should receive.
2. Below that, we define the React Context, and write a component that returns the Context's Provider.
3. Then, the `useAuth()` React hook is defined that will forward the Context to child components.
4. Finally, we export `AuthProvider` as the file's default export.

At the moment, `AuthProvider` will display an `<IonSpinner />`. As we progress, we will add logic to display the `children` prop, but first, we need a way to grab the session (if it exists).

Before we move any further, head over to `src/App.tsx` and place `<AuthProvider />` in between `<IonApp>` and `<SplashContainer>`.

```diff
const App: React.FC = () => (
  <IonApp>
+   <AuthProvider>
      <SplashContainer>
        <IonReactRouter>...</IonReactRouter>
      </SplashContainer>
+   </AuthProvider>
  </IonApp>
);
```

Let's head back to `src/providers/AuthProvider.test.tsx`. Add the following `describe` blocks within the `describe('when rendered')` block:

```tsx
describe('if a session is found', () => {
  beforeEach(() => (getSession as Mock).mockResolvedValue(testSession));

  it('hides the spinner', async () => {
    const { container } = render(<AuthProvider />);
    await waitFor(() => expect(container.querySelectorAll('ion-spinner')).toHaveLength(0));
  });

  it('sets the session state', async () => {
    const { result } = await waitFor(() => renderHook(() => useAuth(), { wrapper }));
    expect(result.current.session).toEqual(testSession);
  });
});

describe('if a session is not found', () => {
  beforeEach(() => (getSession as Mock).mockResolvedValue(undefined));

  it('hides the spinner', async () => {
    const { container } = render(<AuthProvider />);
    await waitFor(() => expect(container.querySelectorAll('ion-spinner')).toHaveLength(0));
  });

  it('sets the session state to undefined', async () => {
    const { result } = await waitFor(() => renderHook(() => useAuth(), { wrapper }));
    expect(result.current.session).toEqual(undefined);
  });
});
```

Make the following modifications to `src/providers/AuthProvider.tsx` to make the tests pass:

```diff
const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isSetup, setIsSetup] = useState<boolean>(false);

+ useEffect(() => {
+   getSession().then((s) => {
+     setSession(s);
+     setIsSetup(true);
+   });
+ }, []);

+ return <AuthContext.Provider value={{ session }}>{isSetup ? children : <IonSpinner />}</AuthContext.Provider>;
};
```

When the session changes, either by calling `setSession` or `clearSession`, the Provider's `session` variable needs to be updated.

First add this unit test to `src/providers/AuthProvider.test.tsx`:

```typescript
describe('when the session changes ', () => {
  const registerCallbackMock = vi.fn();
  beforeEach(() => (registerSessionChangeCallback as Mock).mockImplementation(registerCallbackMock));

  it('updates the session state', async () => {
    const { result } = await waitFor(() => renderHook(() => useAuth(), { wrapper }));
    expect(result.current.session).toBeUndefined();
    act(() => registerCallbackMock.mock.calls[0][0](testSession));
    expect(result.current.session).toEqual(testSession);
    act(() => registerCallbackMock.mock.calls[0][0](undefined));
    expect(result.current.session).toEqual(undefined);
  });
});
```

Then make it pass by adding another `useEffect()` to `src/providers/AuthProvider.tsx`:

```tsx
useEffect(() => {
  registerSessionChangeCallback((s: Session | undefined) => setSession(s));
  return () => unregisterSessionChangeCallback();
}, []);
```

Now we can share the user's authentication status throughout the React component tree. Huzzah!

## Handle the Login

When the user clicks the "Sign In" button on the login page, we need to satisfy the following requirements:

- Perform the login.
- If the login fails, we need to display an error message.
- If the login succeeds, we need to navigate to the root page of the application.

Now we are ready to define the requirements via a set of tests in `src/pages/login/LoginPage.test.tsx`. Make sure you place the tests within the `describe('sign in button')` block.

```typescript
describe('clicking the sign in button', () => {
  const errorMessage = 'Invalid email and/or password';

  beforeEach(async () => {
    render(<LoginPage />);
    const email = await waitFor(() => screen.getByLabelText('Email Address'));
    const password = await waitFor(() => screen.getByLabelText('Password'));
    await waitFor(() => fireEvent.input(email, { target: { value: 'test@test.com' } }));
    await waitFor(() => fireEvent.input(password, { target: { value: 'password' } }));
  });

  it('performs the login', async () => {
    const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
    fireEvent.click(button);
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledWith('test@test.com', 'password');
  });

  describe('if the login succeeds', () => {
    beforeEach(() => (login as Mock).mockResolvedValue(true));

    it('does not show an error', async () => {
      const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
      fireEvent.click(button);
      await waitFor(() => expect(screen.queryByText(errorMessage)).not.toBeInTheDocument());
    });

    it('navigates to the root page', async () => {
      const history = useHistory();
      const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
      fireEvent.click(button);
      await waitFor(() => expect(history.replace).toBeCalledTimes(1));
      expect(history.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('if the login fails', () => {
    beforeEach(() => (login as Mock).mockResolvedValue(false));

    it('shows an error', async () => {
      const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
      fireEvent.click(button);
      await waitFor(() => expect(screen.queryByText(errorMessage)).toBeInTheDocument());
    });

    it('does not navigate', async () => {
      const history = useHistory();
      const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
      fireEvent.click(button);
      await waitFor(() => expect(history.replace).not.toHaveBeenCalled());
    });
  });
});
```

You'll need a mock for `react-router-dom`. Create a file `__mocks__/react-router-dom.ts`:

```typescript
import { vi } from 'vitest';

const replace = vi.fn();
const useHistory = vi.fn().mockReturnValue({ replace });

export { useHistory };
```

We need to add this mock, as well as a mock for `src/utils/auth.ts`, in `src/pages/login/LoginPage.test.tsx`:

```typescript
vi.mock('react-router-dom');
vi.mock('../../utils/auth.ts');
```

For the implementation code, here are the pieces. It's up to you to find the correct spot in `src/login/LoginPage.tsx` to place each of these pieces.

First the one-liners:

- Add a `showError` boolean state variable. You will need to import `useState` from `react`. It should have an initial value of false.
- Update the template to display the error message if login fails. Here is the markup: `{showError && <div>Invalid email and/or password</div>}`
- Destructure `history` from `useHistory`: `const history = useHistory();`
- Import `login` from `../../utils/auth.ts` and import `useHistory` from `react-router-dom`.
- Update the button's click handler: `onClick={handleSubmit((data) => handleLogin(data))}`

Now we can define our click handler.

```typescript
const handleLogin = async (data: LoginInputs) => {
  const success = await login(data.email, data.password);
  setShowError(!success);
  success && history.replace('/');
};
```

Try running the app. You should see an error message when invalid credentials are used, and navigation to the tea list page when valid credentials are used. Here are some valid credentials:

- **email:** test@ionic.io
- **password:** Ion54321

I leave it to you to pretty up the invalid error message styling. You can have a look at the <a href="https://github.com/ionic-team/tea-taster-react" target="_blank">completed code</a> to see what we put in place.

## Handle the Logout

We can log in, but what about logging out? For now, we will add that to the tea listing page.

Let's add the actual button first. In `src/pages/tea/TeaListingPage.tsx` add the following markup within the `IonToolbar` that is in the header:

```tsx
<IonButtons slot="end">
  <IonButton data-testid="logout-button" onClick={() => handleLogout()}>
    <IonIcon slot="icon-only" icon={logOutOutline} />
  </IonButton>
</IonButtons>
```

We need a shell `handleLogout()` function within the component definition:

```typescript
const handleLogout = async (): Promise<void> => {};
```

The sign out button should do the "inverse" of the sign in button:

- It should call `logout` from the `auth` utility module
- It should navigate the user to the login page

Like the test suite for the sign in button, we will need to state that we want to mock `logout` and `react-router-dom` in `TeaListPage.test.tsx`:

```typescript
vi.mock('react-router-dom');
vi.mock('../../utils/auth');
```

Add the following describe block within the main `describe('<TeaListPage />')` block:

```tsx
describe('sign out button', () => {
  it('performs a logout when clicked', async () => {
    const { logout } = useAuth();
    render(<TeaListPage />);
    const button = screen.getByTestId('logout-button');
    fireEvent.click(button);
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('navigates to the login page', async () => {
    const history = useHistory();
    render(<TeaListPage />);
    const button = screen.getByTestId('logout-button');
    fireEvent.click(button);
    await waitFor(() => expect(history.replace).toHaveBeenCalledTimes(1));
    expect(history.replace).toHaveBeenCalledWith('/login');
  });
});
```

Fill out the logic for the `handleLogout()` function in `src/pages/tea/TeaListPage.tsx`. If you get stuck, refer back to the "Handle the Login" section for examples.

Test that out in the browser. The full flow should now work.

## Guard the Routes

There are some routes within our app where we do not want to allow users to go unless they are logged in.

Let's create a guard for that. Create a file `src/routes/PrivateRoute.tsx` and populate it with the code below.

```tsx
import { ReactNode } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

type Props = { children?: ReactNode };

export const PrivateRoute = ({ children }: Props) => {
  const { session } = useAuth();

  // If there is no session, redirect the user to the login page.
  if (!session) return <Redirect to="/login" />;

  // Otherwise, return the route
  return <>{children}</>;
};
```

To apply the guard, we need to modify the way we declare the tea listing route in `App.tsx`:

```diff
<Route exact path="/tea">
+ <PrivateRoute>
    <TeaListPage />
+ </PrivateRoute>
</Route>
```

At this point, if you logout and the try to manually go to either `http://localhost:8100/` or `http://localhost:8100/tea`, you should be redirected to the login page.

## Add Interceptors

We need to intercept outgoing requests and add the token if we have one. We also need to take a look at responses coming back from the server, and if we get a 401, we need to clear the stored session as it is invalid. Make the appropriate modification to `src/utils/backend-api.ts`:

You will need to update the imports.

```typescript
import axios, { InternalAxiosRequestConfig } from 'axios';
import { clearSession, getSession } from './session';
```

After the client is created, but before the module is exported, you will need to add the interceptor:

```typescript
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session && session.token && config.headers) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

client.interceptors.request.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) await clearSession();
    return Promise.reject(error);
  }
);
```

## Linting

We have been developing for a bit now, but have not run `lint` at all (though to be fair, Vite's build process does this for us). I suggest running lint early and often. At the very least, before any commit to `main` (or `master`) we should run `lint` and clean up any issues in our code. Let's do that now:

```bash
npm run lint
```

You may or may not have any issues, depending on how you have followed along in the labs. Fix any linting issues that you have now. If you have any questions about how to fix anything, let's discuss them.

## Conclusion

We now have a fully operational authentication workflow within our application.
