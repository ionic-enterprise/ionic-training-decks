# Lab: Implement the Authentication Logic

Before we get too far in to authentication, we need to do some data modeling and define some utility function modules that will allow us to abstract out some fundamental tasks. In this lab you will learn how to:

- Create utility function modules
- Use Capacitor API plugins
- Perform basic HTTP operations

If you got stuck on any of the coding challenges in this lab, you can have a look at the <a href="https://github.com/ionic-team/tea-taster-react" target="_blank">completed code</a>, but try not to peek.

## The User and Session Models

The first thing we will need to do is model the User data for our system. Create a `src/models/User.ts` file with the following contents:

```typescript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

Next we will model the current session. The session will consist of a User and the authentication token for that user's session. Create a `src/models/Session.ts` file with the following contents:

```typescript
import { User } from './User';

export interface Session {
  user: User;
  token: string;
}
```

Be sure to update `src/models/index.ts`

## The `session` utility function module

When the user logs in, they establish a session. The session contains information about the user as well as the user's current authentication token. We will use a React hook to hold functionality that manages this session. The `@capacitor/preferences` plugin will be used to persist the information.

### Test and Function Shells

First create two files that will serve as the shells for our test and hook. You will also need to create the proper directories for them as they do not exist yet.

`src/api/session-api.test.ts`

```typescript
import { Mock, vi } from 'vitest';
import { Session } from '../models';
import { clearSession, getSession, setSession } from './session-api';

describe('Session API', () => {
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

  it('starts with an undefined session', async () => {
    expect(await getSession()).toBeUndefined();
  });
});
```

`src/api/session-api.ts`

```typescript
const key = 'session';
let session: Session | undefined;

const clearSession = async (): Promise<void> => {
  // TODO:
  // clear the `session` value
  // call Preferences.remove()
};

const getSession = async (): Promise<Session | undefined> => {
  // TODO:
  // check if we have a `session`, if not, get it and set it
  return session;
};

const setSession = async (s: Session): Promise<void> => {
  // TODO:
  // set the `session` value to the passed `s`
  // call Preferences.set() (be sure to import above)
};

export { clearSession, getSession, setSession };
```

`src/api/__mocks__/session-api.ts`

```typescript
import { vi } from 'vitest';

const clearSession = vi.fn().mockResolvedValue(undefined);
const getSession = vi.fn().mockResolvedValue(undefined);
const setSession = vi.fn().mockResolvedValue(undefined);

export { clearSession, getSession, setSession };
```

**Note:** The `src/api/__mocks__/session-api.ts` file will be used to facilitate mocking this hook effectively in other unit tests.

### Install `@capacitor/preferences`

We will use <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">`@capacitor/preferences`</a> to persist the session information, so let's install it:

```bash
npm i @capacitor/preferences
```

Also create a <a href="https://jestjs.io/docs/manual-mocks" target="_blank">manual mock</a> for it. This will make the testing easier:

```typescript
import { vi } from 'vitest';

export const Preferences = {
  get: vi.fn().mockResolvedValue({ value: undefined }),
  set: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
};
```

The manual mock should be created as `__mocks__/@capacitor/preferences.ts` under the application's root directory.

Add the following import to `session-api.test.tsx`:

```typescript
import { Preferences } from '@capacitor/preferences';
```

Then mock it (make sure this line of code lives above `describe('Session API')`):

```typescript
vi.mock('@capacitor/preferences');
```

### Setting the Session

When we set the session, we have two requirements:

- We should be able to retrieve the session again.
- The session should be stored using `@capacitor/preferences`.

Let's express those requirements as tests. Note that the value stored <a href="https://capacitorjs.com/docs/apis/preferences#setoptions" target="_blank">must be a string</a>. As such we need to stringify the session object.

Add the following describe block below the `starts with an undefined session` test:

```typescript
describe('setSession', () => {
  it('sets the session', async () => {
    await setSession(testSession);
    expect(await getSession()).toEqual(testSession);
  });

  it('stores the session', async () => {
    await setSession(testSession);
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'session',
      value: JSON.stringify(testSession),
    });
  });
});
```

The code required to satisfy these tests is left as an exercise for the reader. Here is a synopsis if what you need to do:

- The file global `session` needs to be set to the passed value.
- The `setSession` function needs to return the result of called `Preferences.set()`.

The signature for `Preferences.set()` is `set({ key: string, value: string})`, so the passed session will need to be converted from an object to a string via `JSON.stringify()`.

### Clearing the Session

The requirements for clearing the session are just the opposite:

- We should not be able to retrieve the session after it is cleared.
- The session should be removed from `@capacitor/preferences`.

The describe block below should be a sibling of `describe('setSession')`.

```typescript
describe('clearSession', () => {
  beforeEach(async () => await setSession(testSession));

  it('clears the session', async () => {
    await clearSession();
    expect(await getSession()).toBeUndefined();
  });

  it('removes the session from preferences', async () => {
    await clearSession();
    expect(Preferences.remove).toHaveBeenCalledTimes(1);
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'session' });
  });
});
```

**Coding Challenge:** write the code to satisfy these requirements.

### Getting the Session

We already have tests showing that `session` contains the proper value with and without a session. What we need to show in addition is:

- We retrieve the session from preferences if it is not currently cached (through `session`).
- We used the cached version if it has been cached via a prior "get".
- We used the cached version if it has been cached via a prior "set".

```typescript
describe('getSession', () => {
  beforeEach(async () => await clearSession());

  it('gets the session from preferences', async () => {
    (Preferences.get as Mock).mockResolvedValue({ value: JSON.stringify(testSession) });
    expect(await getSession()).toEqual(testSession);
    expect(Preferences.get).toHaveBeenCalledTimes(1);
    expect(Preferences.get).toHaveBeenCalledWith({ key: 'session' });
  });

  it('caches the retrieved session', async () => {
    (Preferences.get as Mock).mockResolvedValue({ value: JSON.stringify(testSession) });
    await getSession();
    await getSession();
    expect(Preferences.get).toHaveBeenCalledTimes(1);
  });

  it('caches the session set via setSession', async () => {
    await setSession(testSession);
    expect(await getSession()).toEqual(testSession);
    expect(Preferences.get).not.toHaveBeenCalled();
  });
});
```

**Coding Challenge:** write the code to satisfy these requirements. Remember that the value was processed with `JSON.stringify` on the way in to preferences, so it will need to be parsed on the way back out.

## Using Axios for HTTP Calls

We will be using <a href="https://www.npmjs.com/package/axios" target="_blank">Axios</a> to make our HTTP calls. As such, we will need to install it.

```bash
npm i axios
```

We will also create a single Axios instance for our backend API. Create a `src/api/backend-api.ts` file with the following contents:

```typescript
import axios from 'axios';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export { client };
```

Similar to what we did with the 'session' composition function, we will create a mock in `src/api/__mocks__/backend-api.ts` with the following contents to make our other tests more clean:

```typescript
import { vi } from 'vitest';

const client = {
  get: vi.fn().mockResolvedValue({ data: null }),
  post: vi.fn().mockResolvedValue({ data: null }),
};

export { client };
```

In the case of our application, the `baseURL` is the same in production and development. This is not very typical. Often a different backend is used. In cases like that, we can let the build environment help us out. For example:

```typescript
const baseURL: process.env.NODE_ENV === 'production' ?
  'https://api.mydomain.com' :
  'https://devapi.mydomain.com';
```

This can be expanded based on how many different environments you may be building for. However, it is you specifically control the environment for your build.

## The `auth` utility function module

We have logic in place to store the session and an HTTP client to call the backend. Now it's time to write logic to handle login and logout.

### Test and Function Shells

First create two files that will serve as the shells for our test and hook.

`src/api/auth-api.test.tsx`

```typescript
import { vi, Mock } from 'vitest';
import { User } from '../models';
import { client } from './backend-api';
import { clearSession, setSession } from './session-api';

vi.mock('./backend-api');
vi.mock('./session-api');

describe('Auth API', () => {
  beforeEach(() => vi.clearAllMocks());
});
```

`src/api/auth-api.ts`

```typescript
import { client } from './backend-api';
import { clearSession, setSession } from './session-api';

const login = async (email: string, password: string): Promise<boolean> => {
  return false;
};

const logout = async (): Promise<void> => {};

export { login, logout };
```

### Perform the Login

For the login, we need to:

- Ensure the proper endpoint is posted to with the username and password in the payload.
- In the case where the login succeeds:
  - Set the session.
  - Resolve `true`.
- In the case where the login does not succeed, just resolve `false`.

The tests that verify those requirements look like this:

```typescript
describe('login', () => {
  beforeEach(() => (client.post as Mock).mockResolvedValue({ data: { success: false } }));

  it('posts to the login endpoint', async () => {
    await login('test@test.com', 'password');
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith('/login', {
      username: 'test@test.com',
      password: 'password',
    });
  });

  describe('when the login fails', () => {
    it('resolves false', async () => {
      expect(await login('test@test.com', 'password')).toBeFalsy();
    });
  });

  describe('when the login succeeds', () => {
    const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@test.com' };
    const token = '123456789';

    beforeEach(() => (client.post as Mock).mockResolvedValue({ data: { success: true, user, token } }));

    it('resolves true', async () => {
      expect(await login('test@test.com', 'password')).toBeTruthy();
    });

    it('sets the session', async () => {
      await login('test@test.com', 'password');
      expect(setSession).toHaveBeenCalledTimes(1);
      expect(setSession).toHaveBeenCalledWith({ user, token });
    });
  });
});
```

One way to translate that into code is to update our `login()` function as such:

```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  const { data } = await client.post('/login', { username: email, password });
  if (data.success) {
    const { user, token } = data;
    await setSession({ user, token });
    return true;
  }
  return false;
};
```

### Perform the Logout

For the logout operation, we have the following requirements:

- POST to the `/logout` endpoint (there is no payload).
- Clear the session.

Here is a shell for the test section:

```typescript
describe('logout', () => {
  it('posts to the logout endpoint', async () => {
    // TODO: Write the test
    //   - base it on the very similar "posts to the login endpoint" test above
    //   - endpoint is "/logout"
    //   - the POST to that endpoint does not have a payload
  });

  it('clears the session', async () => {
    // TODO: Write the test
  });
});
```

**Coding Challenge:** This is a two part challenge:

1. Write the code for both of the test cases above.
1. Write the code that satisfies the tests.

### Create an Auth Mock

We are going to be calling the `login()` and `logout()` methods from our components. As a result, it would be nice to have a nice consistent mock set up for them. Remember the `src/api/__mocks__/session-api.ts` file we created at the start of this lab? Create a very similar one called `src/api/__mocks__/auth-api.ts` with the `login` and `logout` mocks properly defined.

## Conclusion

We have created utility function modules to manage our session state and handle the authentication logic. In the next section we will begin to assemble the pieces created here to develop our authentication flow.

Remember, if you got stuck on any of the coding challenges, you can have a look at the <a href="https://github.com/ionic-team/tea-taster-react" target="_blank">completed code</a>, but try not to peek.
