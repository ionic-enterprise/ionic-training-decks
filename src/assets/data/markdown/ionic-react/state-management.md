# Lab: State Management

In this lab, you will learn how to:

- Use the React Context API to share global state between components
- Redirect unauthenticated users away from protected routes
- Mock and test React Contexts and conditional navigation

## Overview

Now that our application has a way to manage authentication, we need a way to relay this information to our components. We could directly call our business logic from our components but that presents a few problems:

1. Components become tightly coupled to business logic
2. Explicitly passing props down several levels of the component tree

React Context provides a way for us to <a href="https://reactjs.org/docs/context.html" target="_blank">share data across a component tree</a> without manually passing it through props. It also allows us to decouple our components from our business logic. It's a win-win!

We're going to create a React Context to manage our authentication state. With it, we'll force unauthenticated users to our login page, and only allow authenticated users access to our tea page. We'll also use it to integrate sign in and sign out functionality within our components.

### `!important;` About State Management

There are countless ways to incorporate state management into a React application. Using a third party library, such as <a href="https://redux.js.org/" target="_blank">Redux</a> and <a href="https://mobx.js.org/README.html" target="_blank">MobX</a>, is a very common way React applications incorporate state management. Additionally, you could create your own flavor of state management using capabilities React provides out-of-the-box.

This training uses a very light-weight state management mechanism (React Contexts only) by design. The topic of state management, and the various ways it can be achieved in a React application, is too broad of a topic to cover in this training. Instead, it is recommended to lift-and-shift the end product of this lab into your state management solution of choice.

## Defining the State

Before jumping into the Context API, we should first define what pieces of state we'll want to make globally available to our application. We'll want to know if the current user is authenticated, information about the user (provided they are signed in), and ways to sign a user in, and sign a user out.

Create a new file in our `src/models` folder named `AuthState.ts`:

```TypeScript
import { User } from './User';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

Note that while not _technically_ part of the authentication state, we need to add function definitions to our `AuthState` to share them across the application.

Add `AuthState` to the models barrel file before moving onto the next section.

## Creating the Context

Create a file `src/auth/AuthContext.tsx`:

```TypeScript
import React, { createContext, useState, useEffect } from 'react';
import AuthSingleton from './Authentication';
import IdentitySingleton from './Identity';
import { AuthState } from '../models';

const initialState: AuthState = {
  isAuthenticated: false,
  user: undefined,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
};

export const AuthContext = createContext<AuthState>(initialState);

export const AuthProvider: React.FC = ({ children }) => {
  const authentication = AuthSingleton.getInstance();
  const identity = IdentitySingleton.getInstance();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initializeIdentity = async () => { };
    initializeIdentity();
  }, [identity]);

  const login = async (username: string, password: string) => { };

  const logout = async () => {};

  const value: AuthState = {
    isAuthenticated,
    user: identity.user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

Let's break down what this file is doing before we write test cases and implement the missing functionality:

1. In order to create a context, we need to provide an initial value for the state
2. We create the context - `AuthContext` - which our components can use to access our state
3. We create a component `<AuthProvider />`; children of this component can access `AuthContext`
4. The `value` prop on `<AuthContext.Provider />` contains the state we wish to share across the application

### Initialization Code

Note the `useEffect` hook in `AuthProvider`. This will be where we place logic that attempts to automatically sign the user in, provided there is a stored authorization token.

#### Test First

Create a new file `src/auth/AuthContext.test.tsx` and scaffold it with the following code:

```TypeScript
import React, { useContext } from 'react';
import { render, waitForElement, cleanup, fireEvent, wait } from '@testing-library/react';
import AuthSingleton, { Authentication } from './Authentication';
import IdentitySingleton, { Identity } from './Identity';
import { AuthContext, AuthProvider } from './AuthContext';

const mockToken = '3884915llf950';
const mockUser = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

const MockAuthConsumer: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="auth">{isAuthenticated.toString()}</div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <button onClick={() => login('test@test.com', 'test')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const tree = (
  <AuthProvider>
    <MockAuthConsumer />
  </AuthProvider>
);

describe('<AuthProvider />', () => {
  let auth: Authentication;
  let identity: Identity;

  beforeEach(() => {
    auth = AuthSingleton.getInstance();
    identity = IdentitySingleton.getInstance();
    identity.initialize = jest.fn(() => Promise.resolve());
    auth.login = jest.fn(() => Promise.resolve({ token: mockToken, user: mockUser }));
  });

  describe('initialization', () => { });

  describe('login', () => { });

  describe('logout', () => { });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Note `MockAuthConsumer` and `tree`. Those are two React components we are creating in order to test `AuthProvider`. React Testing Library tests against the DOM, so we need a test component that reflects the state we want to test. In the `afterEach` block, we use `cleanup` to unmount the component tree created during each test, and make use of Jest's `restoreAllMocks` utility function to restore all our mocks before each test.

Inside the `initialization` describe block, add the following code:

```TypeScript
  ...
  describe('initialization', () => {
    it('initializes the identity singleton', async () => {
      const { getByTestId } = render(tree);
      await waitForElement(() => getByTestId('auth'));
      expect(identity.initialize).toHaveBeenCalledTimes(1);
    });

    describe('if a token is stored', () => {
      beforeEach(() => {
        jest.spyOn(identity, 'token', 'get').mockImplementation(() => mockToken);
        jest.spyOn(identity, 'user', 'get').mockImplementation(() => mockUser);
      });

      it('sets the user', async () => {
        const { getByTestId } = render(tree);
        const element = await waitForElement(() => getByTestId('user'));
        expect(element.textContent).toBe(JSON.stringify(mockUser));
      });

      it('sets isAuthenticated to true', async () => {
        const { getByTestId } = render(tree);
        const element = await waitForElement(() => getByTestId('auth'));
        expect(element.textContent).toBe('true');
      });
    });

    describe('if a token is not stored', () => {
      beforeEach(() => {
        jest.spyOn(identity, 'token', 'get').mockImplementation(() => undefined);
        jest.spyOn(identity, 'user', 'get').mockImplementation(() => undefined);
      });

      it('does not set the user', async () => {
        const { getByTestId } = render(tree);
        const element = await waitForElement(() => getByTestId('user'));
        expect(element.textContent).toBe('');
      });

      it('retains the initial isAuthenticated value', async () => {
        const { getByTestId } = render(tree);
        const element = await waitForElement(() => getByTestId('auth'));
        expect(element.textContent).toBe('false');
      });
    });
  });
  ...
```

Note how we're using elements rendered on `MockAuthConsumer` to check if initialization logic has run.

#### Then Code

**Challenge:** Implement the `initializeIdentity` function inside the `useEffect` of `AuthProvider`.

### Login

The `login` method we want to expose across the application should:

- Make a call to the authentication singleton and obtain the signed in user's token and user information
- Set the token and user information in our identity singleton
- Update the `isAuthenticated` boolean
- Throw an error if signing in was unsuccessful

#### Test First

Add the following code inside the `login` describe block:

```TypeScript
  ...
  describe('login', () => {
    it('calls the authentication singleton', async () => {
      const { getByText } = render(tree);
      const element = await waitForElement(() => getByText('Login'));
      fireEvent.click(element);
      await wait(() => expect(auth.login).toHaveBeenCalledTimes(1));
    });

    describe('on success', () => {
      it('sets the token and user information', async () => {
        const { getByText, getByTestId } = render(tree);
        const loginElement = await waitForElement(() => getByText('Login'));
        const userElement = await waitForElement(() => getByTestId('user'));
        fireEvent.click(loginElement);
        await wait(() => expect(userElement.textContent).toBe(JSON.stringify(mockUser)));
      });

      it('sets isAuthenticated to true', async () => {
        const { getByText, getByTestId } = render(tree);
        const loginElement = await waitForElement(() => getByText('Login'));
        const authElement = await waitForElement(() => getByTestId('auth'));
        fireEvent.click(loginElement);
        await wait(() => expect(authElement.textContent).toBe('true'));
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        jest.spyOn(auth, 'login').mockImplementation(() => {
          throw new Error('Failed to log in. Please try again.');
        });
      });

      it('throws an error', async () => {
        const { getByTestId } = render(tree);
        await waitForElement(() => getByTestId('user'));
        await wait(() => expect(auth.login).toThrowError('Failed to log in. Please try again.'));
      });
    });
  });
  ...
```

#### Then Code

**Challenge:** Implement the `login` method of `AuthProvider`.

### Logout

The `logout` method we want to expose across the application should:

- Make a call to the authentication singleton to sign the user out
- Clear the token and user information in our identity singleton
- Update the `isAuthenticated` boolean

#### Test First

Add the following code inside the `logout` describe block:

```TypeScript
  ...
  describe('logout', () => {
    beforeEach(() => {
      auth.logout = jest.fn(() => Promise.resolve());
      identity.clear = jest.fn(() => Promise.resolve());
    });

    it('calls the authentication singleton', async () => {
      const { getByText } = render(tree);
      const element = await waitForElement(() => getByText('Logout'));
      fireEvent.click(element);
      await wait(() => expect(auth.logout).toHaveBeenCalledTimes(1));
    });

    it('clears the token and user calling the identity singleton', async () => {
      const { getByText } = render(tree);
      const element = await waitForElement(() => getByText('Logout'));
      fireEvent.click(element);
      await wait(() => expect(identity.clear).toHaveBeenCalledTimes(1));
    });

    it('sets isAuthenticated to false', async () => {
      const { getByText, getByTestId } = render(tree);
      const loginElement = await waitForElement(() => getByText('Login'));
      const logoutElement = await waitForElement(() => getByText('Logout'));
      const authElement = await waitForElement(() => getByTestId('auth'));
      fireEvent.click(loginElement);
      await wait(() => expect(authElement.textContent).toBe('true'));
      fireEvent.click(logoutElement);
      await wait(() => expect(authElement.textContent).toBe('false'));
    });
  });
  ...
```

#### Then Code

**Challenge:** Implement the `logout` method of `AuthProvider`.

## Conditional Routing

Since we need access to our context in order to control routing, we need to wrap the contents of our `<App />` component with `<AuthProvider />`. Open `src/App.tsx` and update it like so:

```TypeScript
import React, { useEffect } from 'react';
...
import { AuthProvider } from './auth/AuthContext';
...
const App: React.FC = () => {
  ...

  return (
    <AuthProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/tea" component={TeaList} />
            <Route exact path="/" render={() => <Redirect to="/login" />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </AuthProvider>
  );
};

export default App;
```

Note that the routing has been updated so that when the application launches it loads the login page. That's the desired behavior if the current user of the application does not have an authorization token stored, but what if they do?

That scenario will be handled on the login page itself. We will listen for changes to our context's `isAuthenticated` value using a `useEffect`. Once the application determines the user is authenticated we'll replace the login page with our tea page.

Open `src/login/Login.tsx` and make the following modifications:

```TypeScript
import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router';
...

const Login: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const history = useHistory();
  ...
  useEffect(() => {
    if(isAuthenticated) history.replace('/tea');
  }, [isAuthenticated, history]);
  ...
  return (
    ...
  );
};
export default Login;
```

This is where I find the real power in React Hooks. It doesn't matter _what_ updates `isAuthenticated`, as long as the user is on the login page and `isAuthenticated` becomes `true` it will redirect. This covers both the already signed-in user and just signing-in user cases.

## Login Button

The next step is to wire up the sign in button in our `<Login />` component to call the `login` method made available through the authentication context.

### Test First

We needed to create a nested test component that asserted tests for our `AuthProvider` component. For components consuming a context, the inverse is also true; we'll need to create a test component that wraps `<Login />` in order to spy on the context.

Open `src/login/Login.test.tsx` and add the following code after the import block:

```TypeScript
import { AuthContext } from '../auth/AuthContext';

const loginSpy = jest.fn();
const tree = (
  <AuthContext.Provider
    value={{
      login: loginSpy,
      isAuthenticated: false,
      user: undefined,
      logout: jest.fn(),
    }}>
    <Login />
  </AuthContext.Provider>
);
```

Let's update the setup code for the `sign in button` describe block so that we render the `tree` instead of just the `<Login />` component:

```TypeScript
    ...
    beforeEach(() => {
      const { container } = render(tree);
      ...
    });
    ...
```

Our test component tree will let us spy on `login`, making sure that `<Login />` calls it. Add the following test to the `sign in button` describe block:

```TypeScript
    ...
    it('signs the user in', async () => {
      fireEvent.ionChange(email, 'test@test.com');
      fireEvent.ionChange(password, 'P@ssword123');
      fireEvent.click(button);
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });
    ...
```

### Then Code

**Challenge:** Modify the `signIn` method in `src/login/Login.tsx` so it calls the `login` method from our authentication context. Catch any errors and set it's `message` property to the login page's `error` property.

## Logout Button

Our application actually _doesn't_ have any visual cue to sign out, does it? But we know we'll want one, it'll be part of our tea page, and it will be a button. That's a good enough start!

### Test First

Open `src/tea/TeaList.test.tsx` and modify the file like so:

```TypeScript
...
import { AuthContext } from '../auth/AuthContext';
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useHistory: () => ({ replace: jest.fn() }),
  };
});

const logoutSpy = jest.fn();
const tree = (
  <AuthContext.Provider
    value={{
      login: jest.fn(),
      isAuthenticated: false,
      user: undefined,
      logout: logoutSpy,
    }}>
    <TeaList />
  </AuthContext.Provider>
);
...
describe('<TeaList />', () => {
  ...
  describe('sign out button', () => {
    it('signs the user out', async () => {
      let button: HTMLIonButtonElement;
      const { container } = render(tree);
      button = container.querySelector('ion-button')!;
      fireEvent.click(button);
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Then Code

**Challenge:** Have a look at the <a href="https://ionicframework.com/docs/api/toolbar" target="_blank">Ionic Toolbar</a> documentation and add a button in the `end` slot. Use the `logOutOutline` icon and wire the button up to the following method:

```TypeScript
const handleLogout = async () => {
  await logout();
  history.replace('/login');
};
```

## Conclusion

Our application now authenticates using a live data service and has protected routes! Take a minute to test out what you've accomplished so far. Next, we're going to replace our mock tea data with real data.
