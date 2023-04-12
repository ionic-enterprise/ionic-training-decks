# Lab: Create the Authentication Workflow

So far, we have a utility function module API that manages the session. It is now time to put all of theses pieces together to create an authentication workflow.

In this lab you will add the following capabilities:

- Share state and functionality throughout the app
- Handle logging in and logging out
- Guard routes that require a session
- Attaching a token to HTTP requests

## Create the `AuthProvider`

It would be nice to be able to share the user's authentication status with the rest of our application, so we can do things like redirect the user to the login page if they are not signed in. It would be even nicer if we had startup logic that checked our session storage to see if the user is currently signed in or not, and held off on running any additional application logic until that check has been completed.

Recall that we added some startup logic in `SplashContainer`. We'll want to do something similar:

- While we are getting the session from storage, prevent children components from rendering.
- While we are getting the session from storage, show a loading indicator.
- Once the session has been fetched, render child components.

Let's use <a href="https://react.dev/learn/passing-data-deeply-with-context" target="_blank">React Context</a> to accomplish this.

Start by creating a new folder: `src/auth`. Add the following files to it:

`src/auth/AuthProvider.test.tsx`

```tsx
import { vi, Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import AuthProvider from './AuthProvider';

vi.mock('../api/session-api');

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('when rendered', () => {
    it('shows a spinner when checking for a session', async () => {
      const { container } = render(<AuthProvider />);
      await waitFor(() => expect(container.querySelectorAll('ion-spinner')).toHaveLength(1));
    });
  });
});
```

`src/auth/AuthProvider.tsx`

```tsx
import { ReactNode, createContext, useContext, useState } from 'react';
import { IonSpinner } from '@ionic/react';

type Props = { children?: ReactNode };
type Context = { isAuthenticated?: boolean };

const AuthContext = createContext<Context | undefined>(undefined);
const AuthProvider = ({ children }: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
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

Our first iteration of these files hit 2/3 of our visual requirements. We'll work on completing the rest of our requirements in a bit.

Let's break down `AuthProvider.tsx` for a moment:

1. We provide types for the Context provider component and it's Context. We'll add more to `Context` after this section.
2. The context object and provider component are created. Right now, it will only show a loading indicator.
3. `useAuth` is a hook that will allow child components to access the contents of `AuthContext`.

Head over to `src/App.tsx` for a minute and place `<AuthProvider />` in between `<IonApp>` and `<SplashContainer>`.

```tsx
const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <SplashContainer>
        <IonReactRouter>...</IonReactRouter>
      </SplashContainer>
    </AuthProvider>
  </IonApp>
);
```

Refresh the browser, and you should see a spinner. Let's finish implementing our requirements.

To test that our provider will render child components once startup logic completes, let's create a mock child component that prints out "true" or "false" depending on the value of `isAuthenticated` in the context.

Add this constant after the `vi.mock()` calls in `src/auth/AuthProvider.test.tsx`:

```tsx
const MockChildComponent = () => {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? 'true' : 'false'}</div>;
};
```

However, we need `MockChildComponent` to be a child of `<AuthProvider />` in order to access the content. Add the following constant after `MockChildComponent`:

```tsx
const mockComponent = (
  <AuthProvider>
    <MockChildComponent />
  </AuthProvider>
);
```

We will render this component in new tests we create in this file. With all that done, add the following describe blocks within `describe('when rendered'):

```tsx
describe('if a session exists', () => {
  beforeEach(() => (getSession as Mock).mockResolvedValue({}));

  it('sets isAuthenticated to true', async () => {
    render(mockComponent);
    await waitFor(() => expect(screen.getByText('true')).toBeInTheDocument());
  });
});

describe('if a session does not exists', () => {
  beforeEach(() => (getSession as Mock).mockResolvedValue(undefined));

  it('sets isAuthenticated to false', async () => {
    render(mockComponent);
    await waitFor(() => expect(screen.getByText('false')).toBeInTheDocument());
  });
});
```

Don't forget to import `getSession` from `../api/session-api.ts`!

Let's make these tests pass. Add the following `useEffect` within the `AuthProvider` component definition in `src/auth/AuthProvider.tsx`:

```tsx
useEffect(() => {
  getSession().then((res) => setIsAuthenticated(!!res));
}, []);
```

This `useEffect` will check to see if a session already exists in Capacitor Preferences and set `isAuthenticated` to either `true` or `false`. This provider doesn't really care if the user is authenticated or not, it just needs to know we've finished the attempt so we can render child components.

Update the component's template to do just that:

```tsx
return (
  <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
    {isAuthenticated === undefined ? <IonSpinner /> : children}
  </AuthContext.Provider>
);
```

Refresh the browser again. You should see the spinner flicker, and then our login page is rendered. If you run the app on a mobile device, the splash screen will not be hidden until we've determined if the user has a session or not (due to `SplashContainer`), which is a really nice user experience.

We'll need to update `isAuthenticate` when the user signs in and signs out. It would be wise for us to keep that logic within the provider so we don't expose the ability to update `isAuthenticated` anywhere else in our code base.

Update the `Context` type to include methods for login and logout:

```diff
type Context = {
  isAuthenticated?: boolean;
+ login: (email: string, password: string) => Promise<boolean>;
+ logout: () => Promise<void>;
};
```

Next, we need to import the methods from our Auth API:

```typescript
import * as auth from '../api/auth-api';
```

Add the following methods within `AuthProvider`:

```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  const isAuthenticated = await auth.login(email, password);
  setIsAuthenticated(isAuthenticated);
  return isAuthenticated;
};

const logout = async () => {
  await auth.logout();
  setIsAuthenticated(false);
};
```

Finally, update the component template:

```tsx
return (
  <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
    {isAuthenticated === undefined ? <IonSpinner /> : children}
  </AuthContext.Provider>
);
```

Before we proceed, we'll need a mock for our `useAuth()` hook. Create a file `src/auth/__mocks__/AuthProvider.tsx` exporting the following mock:

```typescript
import { vi } from 'vitest';

import { vi } from 'vitest';

const login = vi.fn().mockResolvedValue(undefined);
const logout = vi.fn().mockResolvedValue(undefined);

export const useAuth = () => ({ login, logout });
```

## Handle the Login

When the user clicks the "Sign In" button on the login page, we need to satisfy the following requirements:

- Perform the login.
- If the login fails, we need to display an error message.
- If the login succeeds, we need to navigate to the root page of the application.

Now we are ready to define the requirements via a set of tests in `src/login/LoginPage.test.tsx`. Make sure you place the tests after the `describe('sign in button')` block.

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
    const { login } = useAuth();
    const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
    fireEvent.click(button);
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledWith('test@test.com', 'password');
  });

  describe('if the login succeeds', () => {
    beforeEach(() => (useAuth().login as Mock).mockResolvedValue(true));

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
    beforeEach(() => (useAuth().login as Mock).mockResolvedValue(false));

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

You'll need a mock for `react-router`. Create a file `__mocks__/react-router.ts`:

```typescript
import { vi } from 'vitest';

const replace = vi.fn();
const useHistory = vi.fn().mockReturnValue({ replace });

export { useHistory };
```

This mock needs to be added alongside the mock for `AuthProvider` in `src/login/LoginPage.test.tsx`:

```diff
  vi.mock('../auth/AuthProvider.tsx');
+ vi.mock('react-router');
```

For the implementation code, here are the pieces. It's up to you to find the correct spot in `src/login/LoginPage.tsx` to place each of these pieces.

First the one-liners:

- Add a `showError` boolean state variable. You will need to import `useState` from `react`. It should have an initial value of false.
- Update the template to display the error message if login fails. Here is the markup: `{showError && <div>Invalid email and/or password</div>}`
- Destructure `history` from `useHistory`: `const history = useHistory();`
- Destructure `login` from `useAuth`: `const { login } = useAuth()`;
- Import `useAuth` from `../auth/AuthProvider` and import `useHistory` from `react-router`.
- Update the button's click handler: `onClick={handleSubmit((data) => handleLogin(data))}`

For the code, here are the pieces. It is up to you to find the correct spot in `src/views/LoginPage.vue` to place each of these pieces.

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

We can log in, but what about logging out? For now, we will add that to the Tea page.

Let's add the actual button first. In `src/views/TeaList.vue` add the following markup within the `ion-toolbar` that is in the header:

```html
<ion-buttons slot="end">
  <ion-button data-testid="logout-button" @click="logoutClicked">
    <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
  </ion-button>
</ion-buttons>
```

Now we will need to go to the `script` tag and make some adjustments. Where we are doing the imports, add the following:

- add `IonButton`, `IonButtons`, and `IonIcon` to the list of components being imported
- add `import { logOutOutline } from 'ionicons/icons';`
- add a shell `loginClicked()` function

```typescript
const logoutClicked = async (): Promise<void> => {};
```

Now let's make that button actually do something. Specifically, let's make it log us out. First we will update the `TeaListPage` test to use a `mountView` function similar to the one we created in the `LoginPage` test. Be sure to also import and mock `@/composables/auth`.

With those modifications in place, we can add the tests that express our current requirements:

```typescript
it('performs a logout when the logout button is clicked', async () => {
  const { logout } = useAuth();
  const wrapper = await mountView();
  const button = wrapper.find('[data-testid="logout-button"]');
  router.replace = jest.fn();
  await button.trigger('click');
  expect(logout).toHaveBeenCalledTimes(1);
});

it('navigates to the login after the logout action is complete', async () => {
  const wrapper = await mountView();
  const button = wrapper.find('[data-testid="logout-button"]');
  router.replace = jest.fn();
  await button.trigger('click');
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/login');
});
```

Back in the view's code, fill out the logic for the `logoutClicked()` function that was created within the `script` section. **Hint:** you will need to import `useAuth` and use the `logout` function from it. You will also need to use `useRouter`. See the `LoginPage` page for examples.

Test that out in the browser. The full flow should now work.

## Guard the Routes

There are some routes within our app where we do not want to allow users to go unless they are logged in. Let's create a guard for that. All of this work will be done within `src/router/index.js`

First, let's write the guard itself. Add a `checkAuthStatus()` function to the top of the file, after the imports.

```typescript
const { getSession } = useSession();

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const session = await getSession();
  if (!session && to.matched.some((r) => r.meta.requiresAuth)) {
    return next('/login');
  }
  next();
};
```

You will need to add a couple of imports for this to compile:

- Add: `import { useSession } from '@/composables/session';`
- Add `RouteLocationNormalized` and `NavigationGuardNext` to the existing import from `vue-router`

The guts of the `checkAuthStatus()` function are:

- If we do not have a session, use `to.matched` to check each segment of the target route. If at least one segment in the route requires authentication redirect to the LoginPage page.
- Otherwise (either we have a session, or no segments required authentication), continue to the next hook in the pipeline.

Next, after we create the router, call the guard for each route change (code given in context, only add the appropriate line in your own code).

```typescript
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
```

Finally, mark the teas route as requiring authentication:

```typescript
  {
    path: '/teas',
    name: 'Teas',
    component: TeaList,
    meta: { requiresAuth: true },
  },
```

At this point, if you logout and the try to manually go to either `http://localhost:8100/` or `http://localhost:8100/teas`, you should be redirected to the login page.

## Add Interceptors

We need to intercept outgoing requests and add the token if we have one. We also need to take a look at responses coming back from the server, and if we get a 401 we need to clear our store state as it is invalid. Make the appropriate modifications to `src/composables/backend-api.ts`.

You will need to update the imports.

```typescript
import axios, { InternalAxiosRequestConfig } from 'axios';

import router from '@/router';
import { useSession } from '@/composables/session';

const { clearSession, getSession } = useSession();
```

After the client is created, but before the module is exported, you will need to add the interceptors.

```typescript
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session && session.token && config.headers) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      clearSession().then(() => router.replace('/login'));
    }
    return Promise.reject(error);
  }
);
```

## Linting

We have been developing for a bit now, but have not run `lint` at all (though to be fair, Vue's build process does this for us). I suggest running lint early and often. At the very least, before any commit to `main` (or `master`) we should run `lint` and clean up any issues in our code. Let's do that now:

```bash
npm run lint
```

You may or may not have any issues, depending on how you have followed along in the labs. Fix any linting issues that you have now. If you have any questions about how to fix anything, let's discuss them.

## Conclusion

We now have a fully operational authentication workflow within our application.
