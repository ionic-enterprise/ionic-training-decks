# Lab: State Management

In this lab, you will learn how to:

- Build state management for authentication
- Share data across the application

## Overview

In the last lab, we created a service that stores information about the currently signed in user, but we are missing a way to share this information with the application.

Not only do we need to share the information, but we also manage the state of it so that the application know when a user signs in, signs out, etc.

### State Management

React provides the tools to implement state management out-of-the-box. However, this is not the only way to achieve state management in React. Several battle-tested and hardened libraries exist for state management, such as <a href="https://redux.js.org/" target="_blank">Redux</a> or <a href="https://mobx.js.org/README.html" target="_blank">MobX</a>.

We will use React's built-in mechanisms to achieve state management. This paradigm lends itself nicely to building state management at the feature level without having to maintain one giant state tree.

As we implement state management we will be sure to build it in such a way that it can be easily ported to another state management library.

## Building State Management

At a high level, building state management in React consists of these two pieces:

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
export const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
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

The last piece to build out for our authentication state management is a Context. A <a href="https://reactjs.org/docs/context.html" target="_blank">React Context</a> is a set of values that can be shared across components and other pieces of functionality, such as custom hooks. Context consists of two pieces:

- The Context object; when React renders a component that subscribes to this Context object it will read the current value from the closest `Provider` above it in the component tree
- Every Context object comes with a Provider React component that allows consuming components to subscribe to context changes via a `value` prop

Let's get started by scaffolding out the context. At the end of your `AuthContext.tsx` file, add the following code:

```TypeScript
export const AuthContext = createContext<{
  state: typeof initialState;
  dispatch: (action: AuthAction) => void;
}>({
  state: initialState,
  dispatch: () => {},
});

export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {state.status === 'pending' ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
```

And with that, we've put a system in place that is capable of sharing authentication state across the application! Now we need to wire it in.

## Wiring Up the Auth Context

### Wrapping `<App />`

We want our authentication state to be shared across the entire application. In order to do so, we need to wrap our `<App />` component with our `<AuthProvider />`.

Add a new file `src/ProvidedApp.tsx` and fill it with the following:

**`src/ProvidedApp.tsx`**

```TypeScript
import React from 'react';
import App from './App';
import { AuthProvider } from './core/auth';

const ProvidedApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
export default ProvidedApp;
```

We're wrapping our main application component with `<AuthProvider>` in order to share the state with the entire application. Having a file like this is helpful, as it's common for React apps to have several Contexts each with their own Providers. We _won't_ adding additional "slices" of state in this application, but you may encounter something like this in the wild:

```JSX
<DatabaseProvider value={{connectionString: process.env.REACT_APP_DB_STRING}}>
  <AuthProvider>
    <AnalyticsProvider>
      <App />
    </AnalyticsProvider>
  </AuthProvider>
</DatabaseProvider>
```

Now there's one last place we need to adjust before we can see the fruits of our labor: `src/index.tsx`. What this file does is a bit out-of-scope for this course, but essentially it grabs a DOM element and inserts whatever you consider the root component of your application into it. Now that we want `<ProvidedApp />` to be our root component, we need to make that intent clear:

**`src/index.tsx`**

```TypeScript
import React from 'react';
import ReactDOM from 'react-dom';
import ProvidedApp from './ProvidedApp';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<ProvidedApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```

Head over to Chrome and take a look at your application. You should see an empty screen with the text _Loading..._ which means our authentication state's `status` is pending (which is what we wanted). It's working!

### Getting the Authentication Status

Let's turn our attention to writing logic that will determine the authentication status of the current application user. In order to test our state, we'll need to provide a mock component that can reflect changes made to the Context. Open up `AuthContext.test.tsx` and add the following code:

**`src/core/auth/AuthContext.test.tsx`**

```TypeScript
import React, { useContext } from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';

const MockConsumer: React.FC = () => {
  const { state } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="status">{state.status}</div>
      <div data-testid="error">{state.error}</div>
      <div data-testid="user">{JSON.stringify(state.user)}</div>
    </div>
  );
};

const ComponentTree = (
  <AuthProvider>
    <MockConsumer />
  </AuthProvider>
);
```

Our test cases will use `<MockConsumer />` to validate against. We'll be rendering `<ComponentTree />` in our tests though, otherwise we won't get access to `AuthProvider`.

Let's start by writing a test case asserting that we should see the loading text, and eventually it should go away:

```TypeScript
...
describe('<AuthProvider />', () => {
  it('displays the loader when initializing', async () => {
    const { container } = render(ComponentTree);
    expect(container).toHaveTextContent(/Loading.../);
    await wait(() => expect(container).not.toHaveTextContent(/Loading.../));
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

We want `AuthProvider` to run initialization logic that calls `IdentityService.init()` and updates the state accordingly. If there is a token stored on device, we want to set the authentication status to `authenticated` and set the user's profile in state. Conversely, if we don't find a token on device we want to set the status to `unauthenticated`.

Start by writing test cases for the branch where a token is available:

```TypeScript
import React, { useContext } from 'react';
...

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('<AuthProvider />', () => {
  let identityService: IdentityService;

  beforeEach(() => {
    identityService = IdentityService.getInstance();
    identityService.init = jest.fn(() => Promise.resolve());
  });
  ...
  describe('when a token is stored', () => {
    beforeEach(() => {
      identityService['_user'] = mockUser;
      identityService['_token'] = '3884915llf950';
    });

    it('sets the status to authenticated', async () => {
      const { getByTestId } = render(ComponentTree);
      const status = await waitForElement(() => getByTestId('status'));
      expect(status.textContent).toEqual('authenticated');
    });

    it('sets the user profile', async () => {
      const { getByTestId } = render(ComponentTree);
      const user = await waitForElement(() => getByTestId('user'));
      expect(user.textContent).toEqual(JSON.stringify(mockUser));
    });
  });
  ...
});
```

Let's make our tests pass. Open `AuthContext.tsx` and make the following changes:

**`src/core/auth/AuthContext.tsx`**

```TypeScript
import React, { createContext, useEffect, useReducer } from 'react';
...
export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const identityService = IdentityService.getInstance();

  useEffect(() => {
    const init = async () => {
      await identityService.init();
      if (identityService.token)
        return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
    };
    init();
  }, [identityService]);

  return (
    ...
  );
};
```

Our test "displays a loader when initializing" fails. This is because we don't have a condition for unauthenticated users. Let's fix that.

Head back to `AuthContext.test.tsx` and let's add the branch where a token is not available:

**`src/core/auth/AuthContext.test.tsx`**

```TypeScript
...
describe('<AuthProvider />', () => {
  ...
  describe('when a token is not stored', () => {
    beforeEach(() => {
      identityService['_user'] = undefined;
      identityService['_token'] = undefined;
    });

    it('sets the status to unauthenticated', async () => {
      const { getByTestId } = render(ComponentTree);
      const status = await waitForElement(() => getByTestId('status'));
      expect(status.textContent).toEqual('unauthenticated');
    });

    it('does not set the user profile', async () => {
      const { getByTestId } = render(ComponentTree);
      const user = await waitForElement(() => getByTestId('user'));
      expect(user.textContent).toEqual('');
    });
  });
  ...
});
```

Now all we need to do is add an `else` clause to the `useEffect` created in `AuthContext.tsx`:

**`src/core/auth/AuthContext.tsx`**

```TypeScript
  ...
  useEffect(() => {
    const init = async () => {
      await identityService.init();
      if (identityService.token)
        return dispatch({ type: 'LOGIN_SUCCESS', user: identityService.user! });
      else return dispatch({ type: 'LOGOUT' });
    };
    init();
  }, [identityService]);
  ...
```

All our tests now pass! Reload the application on Chrome and you'll this this logic come to life. It's quick, but you'll notice that _Loading..._ displays before transitioning to our tea page.

Now open the app on a device. You'll notice that _Loading..._ isn't shown, instead we go straight to the tea page once the splash screen hides. Tying back to our lab on native APIs, we are only hiding the splash screen when the `<App />` component is rendered; therefore mobile users will not see the _Loading..._ text. That's pretty cool!

## Reference Articles

State management is a massive topic to cover, it could honestly be it's own training! The way we implemented it using just React was derived from articles written by <a href="https://kentcdodds.com/blog/" target="_blank">Kent C. Dodds</a>, a thought leader in the React framework space:

- <a href="https://kentcdodds.com/blog/application-state-management-with-react" target="_blank">Application State Management with React</a>
- <a href="https://kentcdodds.com/blog/how-to-use-react-context-effectively" target="_blank">How to use React Context Effectively</a>
- <a href="https://kentcdodds.com/blog/authentication-in-react-applications" target="_blank">Authentication in React Applications</a>

I strongly urge you to read these articles to gain a deeper understanding of the concepts covered in this lab.

## Conclusion

Congratulations, you've built out state management! Next, we'll further utilize this state to implement sign in/sign out functionality and protect routes from unauthorized users.
