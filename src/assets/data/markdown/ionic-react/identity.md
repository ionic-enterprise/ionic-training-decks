# Lab: Manage the User Identity

In this lab, you will learn how to:

- Use environment variables to configure dynamic values
- Use the Preferences Capacitor API plugin
- Use state management to share data across the application
- Make network requests using Axios

## Overview

In the last lab we created a login page but it doesn't do much. Our application is missing a way to store, retrieve, and share user identity information across the application.

In this lab we will use the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Preferences Capacitor API plugin</a> to store and retrieve information about the user using the application and manage the state of the user identity so the application knows when a user is signed in, signed out, etc.

### Side-Note: State Management Options

React provides the tools to implement state management out-of-the-box. It is important to note that this is **not** the only way to achieve state management in React. Several libraries exist for state management. It is up to you and your team to evaluate the options available and determine the best state management approach for your application.

## Prerequisites

Before we get started with this lab there are a few additions we need to make to the project. If you have any processes running (`ionic serve` and/or `npm test`) terminate them.

### Install the Preferences Capacitor API Plugin

Install the Preferences Capacitor API plugin to your application:

```bash
$ npm install @capacitor/preferences
$ npx cap sync
```

### Set up Environment Variables

This application will be communicating with a backend data service. As a best practice, values such as the service's URL should be stored as an environment variable. This is achieved by creating a new file at the root of the project named `.env`.

Go ahead and create this file:

**`.env`**

```bash
REACT_APP_DATA_SERVICE=https://cs-demo-api.herokuapp.com
```

### HTTP Networking with Axios

Like state management, there are several libraries available to facilitate HTTP networking. This training uses <a href="https://github.com/axios/axios" target="_blank">Axios</a> which is very popular in the React community.

Install the Axios dependency to your application:

```bash
$ npm install axios
```

At this point, you may restart the processes terminated at the beginning of this section. Please note, any time environment variables or npm packages are added/modified, you must restart the processes for updates to take effect.

## User and Session Models

We need to define the shape of the data we want to store as state. Create a folder inside `src/core` named `models`. Inside this folder, create an `index.ts` file along with the following model files:

**`src/core/models/User.ts`**

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

**`src/core/models/Session.ts`**

```TypeScript
import { User } from './User';

export interface Session {
  user: User;
  token: string;
}
```

**Challenge:** Populate `src/core/models/index.ts` to export `User.ts` and `Session.ts`.

## Building State

Start by creating a new folder under `src/core` named `session`. It needs two files, `SessionProvider.tsx` and `index.ts`. We will first focus on `SessionProvider.tsx`.

### State Definition

What information would be useful for components in our application to know about the user's identity? The user's `Session` for sure, but it would also be nice if a component knew if any of our actions in managing this piece of state were in the process of `loading` or if any of our actions caused an `error`.

Define an interface for `SessionState` within `SessionProvider.tsx`:

**`src/core/session/SessionProvider.tsx`**

```TypeScript
import { Session } from '../models';

interface SessionState {
  session?: Session;
  loading: boolean;
  error: string;
}
```

There needs to be an initial value for this state. Define it under the `SessionState` interface:

```TypeScript
const initialState: SessionState = {
  session: undefined,
  loading: false,
  error: '',
};
```

### State Actions

What actions can happen to the application that would cause the state to change? A few are obvious -- sign in, sign out -- but there should also be a way to restore the state if the user closes the app without signing out and a way to clear out the session if it is expired.

Under `initialState`, add the `SessionAction` type:

```TypeScript
export type SessionAction =
  | { type: 'CLEAR_SESSION' }
  | { type: 'RESTORE_SESSION'; session: Session }
  | { type: 'LOGIN' }
  | { type: 'LOGIN_SUCCESS'; session: Session }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; error: string };
```

### State Reducer

With our state and actions defined we can now write a reducer function that updates the state upon the _dispatch_ of an action.

Under the `SessionAction` type, add the following function:

```TypeScript
const reducer = (state: SessionState = initialState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'CLEAR_SESSION':
      return { ...state, session: undefined };
    case 'RESTORE_SESSION':
      return { ...state, session: action.session };
    case 'LOGIN':
      return { ...state, loading: true, error: '' };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, session: action.session };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.error };
    case 'LOGOUT':
      return { ...state, loading: true, error: '' };
    case 'LOGOUT_SUCCESS':
      return { ...state, loading: false, session: undefined };
    case 'LOGOUT_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};
```

## Sharing State

The pieces to setup state management are in place but there is no way to share it between components. The <a href="https://reactjs.org/docs/context.html" target="_blank">React Context API</a> provides a way to share a set of values across components and other pieces of functionality, such as custom hooks.

A React Context consists of two pieces:

- The Context object. When React renders a component that subscribes to this Context object it will read the value from the closest matching `Provider` above it in the component tree.
- Every Context object has a provider React component that allows child components to subscribe to context changes via the `value` prop.

### Context

First we should define the Context we want to be accessible by child components. At the end of `SessionProvider.tsx`, add the following code:

**`src/core/session/SessionProvider.tsx`**

```TypeScript
export const SessionContext = createContext<{
  state: typeof initialState;
  dispatch: (action: SessionAction) => void;
}>({
  state: initialState,
  dispatch: () => {},
});
```

The code above declares that we want to share both the `state` (of type `SessionState`) as well as a way to `dispatch` the actions created (of type `SessionAction`).

### Provider

The Context's Provider returns a React component that allows any child components within it access to the Context created above. This can be a confusing concept at first, so let's write it out and use it in our application to gain a better understanding of this concept.

Add the following code after `SessionContext`, importing any modules along the way:

```TypeScript
export const SessionProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // This is where we will attempt to restore the user's session.
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {initializing ? <IonSpinner name="dots" data-testid="initializing" /> : children}
    </SessionContext.Provider>
  );
};
```

We will go back and implement the `useEffect` shortly. Let's go ahead and use the `<SessionProvider />` component in our application:

1. Export all from `./SessionProvider` in `src/core/session/index.ts`
2. Modify `src/App.tsx` to match the changes below

**`src/App.tsx`**

```TypeScript
...
import { SessionProvider } from './core/session';
...
const App: React.FC = () => {
  useEffect( ... );

  return (
    <IonApp>
      <SessionProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/tea">
              <TeaPage />
            </Route>
            <Route exact path="/login">
              <LoginPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/tea" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </SessionProvider>
    </IonApp>
  );
};
...
```

Inserting the `<SessionProvider />` into our component tree impacts the tests we wrote for the `<App />` component. Ideally, we would like to test `<App />` in isolation, ensuring that only the Splash Screen behavior is tested; not additional functionality such as user authentication or routing. We can create a manual mock for `<SessionProvider />` to use in `App.test.tsx`.

Create a new file `src/core/session/__mocks__/SessionProvider.tsx` and populate it with the following code:

```TypeScript
export const SessionProvider: React.FC = () => <div></div>;
```

Then add the following line of code to `App.test.tsx`, after the mock for `@ionic/react`:

```TypeScript
jest.mock('./core/session/SessionProvider');
```

Tests within `App.test.tsx` will swap out the actual implementation of `<SessionProvider />` for the mock.

Take a look at your app running on `https://localhost:8100`. We make use of the Ionic Framework's `<IonSpinner />` component to indicate to application users that we are initializing their user identity. There is no logic being processed at this point to switch the UI from the animation to the actual application. We will implement that logic now.

## Restoring the User Identity

In order for our application to be able to restore the user's identity session the following conditions must be met:

1. There must be an existing token stored
2. We must fetch the user's information from the backend data service

If neither of these conditions are met we should clear the session (which, eventually, will prompt the user to sign in).

Regardless of the outcome, we should display the application once this operation completes.

### Switching from the Initialization State

Start by testing `<SessionProvider />` to verify that the loader is displayed while initializing:

**`src/core/session/SessionProvider.test.tsx`**

```TypeScript
import { useContext } from 'react';
import { render, waitFor } from '@testing-library/react';
import { SessionContext, SessionProvider } from './SessionProvider';

const MockConsumer: React.FC = () => {
  const { state } = useContext(SessionContext);
  return <div data-testid="session">{JSON.stringify(state.session)}</div>;
};

const ComponentTree = (
  <SessionProvider>
    <MockConsumer />
  </SessionProvider>
);

describe('<SessionProvider />', () => {
  it('displays the loader when initializing', async () => {
    render(ComponentTree);
    expect(screen.getByTestId(/initializing/)).toBeInTheDocument();
    expect(await screen.findByTestId(/session/)).toBeInTheDocument();
  });
});
```

Make the test pass by adding a timeout that sets initializing to false inside the `useEffect` statement in `SessionProvider.tsx`, replacing the comment there.

**`src/core/session/SessionProvider.tsx`**

```TypeScript
useEffect(() => {
  setTimeout(() => setInitializing(false), 500);
}, []);
```

If you go back to the served application and refresh the page, you should see our loading prompt for half-a-second, then we are redirected to the list of teas.

### When a Token is Stored

If a user's session can be restored `<SessionProvider />` should do the following:

1. Obtain the token from the Capacitor Preferences API
2. Make a GET request to fetch the user's information
3. Dispatch the `RESTORE_SESSION` action

Before we start writing unit tests for this scenario, let's create a fixture we can use in our tests. Create a new folder under `src/core/session` named `__fixtures__`. This will prevent the folder from being included in production builds of the application. Inside it, create a file named `mockSession.ts`.

**`src/core/session/__fixtures__/mockSession.ts`**

```TypeScript
import { Session } from '../../models';

export const mockSession: Session = {
  token: '3884915llf950',
  user: {
    id: 42,
    firstName: 'Joe',
    lastName: 'Tester',
    email: 'test@test.org',
  },
};

```

Now, write unit tests for this scenario:

**`src/core/session/SessionProvider.test.tsx`**

```TypeScript
...
import { Preferences } from '@capacitor/preferences';
import Axios from 'axios';
import { mockSession } from './__fixtures__/mockSession';

jest.mock('@capacitor/preferences');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
...
describe('<SessionProvider />', () => {
  beforeEach(() => (Preferences.get = jest.fn(async () => ({ value: null }))));

  it('displays the loader when initializing', async () => {
    ...
  });

  describe('when a token is stored', () => {
    beforeEach(() => {
      Preferences.get = jest.fn(async () => ({ value: mockSession.token }));
      mockedAxios.get.mockResolvedValue({data: mockSession.user })
    });

    it('obtains the token from storage', async () => {
      render(ComponentTree);
      await waitFor(() => expect(Preferences.get).toHaveBeenCalledTimes(1));
      expect(Preferences.get).toHaveBeenCalledWith({ key: 'auth-token' });
    });

    it('GETs the user profile', async () => {
      render(ComponentTree);
      const headers = { Authorization: 'Bearer ' + mockSession.token };
      const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));
      expect(mockedAxios.get).toHaveBeenCalledWith(url, { headers });
    });

    it('sets the session', async () => {
      render(ComponentTree);
      const session = await screen.findByTestId(/session/);
      expect(session.textContent).toEqual(JSON.stringify(mockSession));
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

### When a Token is Not Stored

If a token is not available or is unable to be restored we should simply dispatch the `CLEAR_SESSION` action. The `describe()` block for this can be found below. Add it to `SessionProvider.test.tsx`.

```TypeScript
describe('when a token is not stored', () => {
  it('does not set the session', async () => {
    render(ComponentTree);
    const session = await screen.findByTestId(/session/);
    expect(session.textContent).toEqual('');
  });
});
```

### Implementation

The tests are all in place, let's finish implementing the `useEffect` in `SessionProvider.tsx`:

**`src/core/session/SessionProvider.tsx`**

```TypeScript
...
useEffect(() => {
    attemptSessionRestore().finally(() => setInitializing(false));
}, []);

const attemptSessionRestore = async () => {
  try {
    const { value: token } = await Preferences.get({ key: 'auth-token' });
    if (!token) throw new Error('Token not found.');

    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
    const { data: user } = await axios.get(url, { headers });
    dispatch({ type: 'RESTORE_SESSION', session: { token, user } });
  } catch (error) {
    dispatch({ type: 'CLEAR_SESSION' });
  }
};
...
```

**Note:** `useEffect` can only run synchronous code. In order to take advantage of the `try/catch` syntax, we abstract the logic to attempt to restore the user's session into a separate method.

Your tests should now pass. However, now the Splash Screen tests in `App.test.tsx` fail! We can fix this by appending `await waitFor()` to the first `expect` statement, like so:

```TypeScript
await waitFor(() => expect(container).toBeDefined());
```

**Challenge:** Go ahead and update the failing tests in `App.test.tsx` such that they pass.

## Conclusion

Congratulations! Our application now manages user identity and built out our own state management implementation in the process! This is a pretty big achievement - give yourself a pat on the back. In the next lab we will handle authentication and protect routes against unauthorized users.
