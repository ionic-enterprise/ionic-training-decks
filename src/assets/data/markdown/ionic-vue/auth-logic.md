# Lab: Implement the Authentication Logic

Before we get too far in to authentication, we need to do some data modeling and define some composition functions that will allow us to abstract out some fundamental tasks. In this lab you will learn how to:

- Create composition functions
- Perform basic HTTP operations
- Use Capacitor API plugins

If you got stuck on any of the coding challenges in this lab, you can have a look at the <a href="https://github.com/ionic-team/tea-taster-vue" target="_blank">completed code</a>, but try not to peek.

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

## The `useSession` Composition Function

When the user logs in, they establish a session. The session contains information about the user as well as the user's current authentication token. We will use a composable function to manage this session. Further, we will use the `@capacitor/preferences` plugin to persist the information.

### Test and Function Shells

First create two files that will serve as the shells for our test and composable function. You will also need to create the proper directories for them as they do not exist yet.

`tests/unit/composables/session.spec.ts`

```typescript
import { useSession } from '@/composables/session';
import { Session } from '@/models';

describe('useSession', () => {
  const testSession: Session = {
    user: {
      id: 314159,
      firstName: 'Testy',
      lastName: 'McTest',
      email: 'test@test.com',
    },
    token: '123456789',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with an undefined session', async () => {
    const { getSession } = useSession();
    expect(await getSession()).toBeUndefined();
  });
});
```

`src/composables/session.ts`

```typescript
import { Session } from '@/models';

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

export const useSession = () => {
  return {
    clearSession,
    getSession,
    setSession,
  };
};
```

`src/composables/__mocks__/session.ts`

```typescript
export const useSession = jest.fn().mockReturnValue({
  clearSession: jest.fn().mockResolvedValue(undefined),
  setSession: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockResolvedValue(undefined),
});
```

**Note:** The `src/composables/__mocks__/session.ts` file will be used to facilitate mocking this composable function effectively in other unit tests.

### Install `@capacitor/preferences`

We will use <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">`@capacitor/preferences`</a> to persist the session information, so let's install it:

```bash
npm i @capacitor/preferences
```

Also create a <a href="https://jestjs.io/docs/manual-mocks" target="_blank">manual mock</a> for it. This will make the testing easier:

```typescript
export const Preferences = {
  get: jest.fn().mockResolvedValue({ value: undefined }),
  set: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
};
```

The manual mock should be created as `__mocks__/@capacitor/preferences.ts` under the application's root directory.

### Setting the Session

When we set the session, we have two requirements:

- We should be able to retrieve the session again.
- The session should be stored using `@capacitor/preferences`.

Let's express those requirements as tests. Note that the value stored <a href="https://capacitorjs.com/docs/apis/preferences#setoptions" target="_blank">must be a string</a>. As such we need to stringify the session object. Make sure that you `import { Preferences } from '@capacitor/preferences';` at the top of the file.

```typescript
describe('useSession', () => {
...
  describe('setSession', () => {
    it('sets the session', async () => {
      const { getSession, setSession } = useSession();
      await setSession(testSession);
      expect(await getSession()).toEqual(testSession);
    });

    it('stores the session', async () => {
      const { setSession } = useSession();
      await setSession(testSession);
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'session',
        value: JSON.stringify(testSession),
      });
    });
  });
...
});
```

The code required to satisfy these tests is left as an exercise for the reader. Here is a synopsis if what you need to do:

- The signature of `setSession` needs to be updated to take a parameter of type `Session`.
- The file global `session` needs to be set to the passed value.
- The `setSession` function needs to return the result of calling `Preferences.set()` (be sure to import `Preferences`). The signature for `Preferences.set()` is `set({ key: string, value: string }), so the passed session will need to be converted from an object to a string via `JSON.stringify()`.

### Clearing the Session

The requirements for clearing the session are just the opposite:

- We should not be able to retrieve the session after it is cleared.
- The session should be removed from `@capacitor/preferences`.

```typescript
describe('useSession', () => {
...
  describe('clearSession', () => {
    beforeEach(async () => {
      const { setSession } = useSession();
      await setSession(testSession);
    });

    it('clears the session', async () => {
      const { getSession, clearSession } = useSession();
      await clearSession();
      expect(await getSession()).toBeUndefined();
    });

    it('removes the session fromm preferences', async () => {
      const { clearSession } = useSession();
      await clearSession();
      expect(Preferences.remove).toHaveBeenCalledTimes(1);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'session' });
    });
  });
...
});
```

**Coding Challenge:** write the code to satisfy these requirements.

### Getting the Session

We already have tests showing that `getSession()` behaves properly with and without a session. What we need to show in addition is:

- We retrieve the session from preferences if it is not currently cached.
- We used the cached version if it has been cached via a prior "get".
- We used the cached version if it has been cached via a prior "set".

```typescript
describe('useSession', () => {
...
  describe('getSession', () => {
    beforeEach(async () => {
      const { clearSession } = useSession();
      await clearSession();
    });

    it('gets the session from preferences', async () => {
      const { getSession } = useSession();
      (Preferences.get as jest.Mock).mockResolvedValue({
        value: JSON.stringify(testSession),
      });
      expect(await getSession()).toEqual(testSession);
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({ key: 'session' });
    });

    it('caches the retrieved session', async () => {
      const { getSession } = useSession();
      (Preferences.get as jest.Mock).mockResolvedValue({
        value: JSON.stringify(testSession),
      });
      await getSession();
      await getSession();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it('caches the session set via setSession', async () => {
      const { getSession, setSession } = useSession();
      await setSession(testSession);
      expect(await getSession()).toEqual(testSession);
      expect(Preferences.get).not.toHaveBeenCalled();
    });
  });
...
});
```

**Coding Challenge:** write the code to satisfy these requirements. Remember that the value was processed with `JSON.stringify` on the way in to preferences, so it will need to be parsed on the way back out.

## Using Axios for HTTP Calls

We will be using <a href="https://www.npmjs.com/package/axios" target="_blank">Axios</a> to make our HTTP calls. As such, we will need to install it.

```bash
npm i axios
```

After installing this, the `transformIgnorePatterns` in `jest.config.js` need to be updated for Axios:

```javascript
module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transformIgnorePatterns: ['/node_modules/(?!@ionic/vue|@ionic/vue-router|@ionic/core|@stencil/core|ionicons|axios)'],
};
```

We will also create a single Axios instance for our backend API. Create a `src/composables/backend-api.ts` file with the following contents:

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

export const useBackendAPI = () => {
  return {
    client,
  };
};
```

Similar to what we did with the 'useSession' composition function, we will create a mock in `src/composables/__mocks__/backend-api.ts` with the following contents to make our other tests more clean:

```typescript
export const useBackendAPI = jest.fn().mockReturnValue({
  client: {
    post: jest.fn().mockResolvedValue({ data: null }),
    get: jest.fn().mockResolvedValue({ data: null }),
  },
});
```

In the case of our application, the `baseURL` is the same in production and development. This is not very typical. Often a different backend is used. In cases like that, we can let the build environment help us out. For example:

```typescript
const baseURL: process.env.NODE_ENV === 'production' ?
  'https://api.mydomain.com' :
  'https://devapi.mydomain.com';
```

This can be expanded based on how many different environments you may be building for. However, it is you specifically control the environment for your build.

## The `useAuth` Composition Function

We have logic in place to store the session. It is now time to create the logic that will handle the login and logout from our backend.

### Test and Function Shells

First create two files that will serve as the shells for our test and compsable function.

`tests/unit/composables/auth.spec.ts`

```typescript
import { User } from '@/models';
import { useBackendAPI } from '@/composables/backend-api';
import { useAuth } from '@/composables/auth';
import { useSession } from '@/composables/session';

jest.mock('@/composables/backend-api');
jest.mock('@/composables/session');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
```

`src/composables/auth.ts`

```typescript
import { useBackendAPI } from './backend-api';
import { useSession } from './session';

const { client } = useBackendAPI();
const { clearSession, setSession } = useSession();

const login = async (email: string, password: string): Promise<boolean> => {
  return false;
};

const logout = async (): Promise<void> => {};

export const useAuth = () => {
  return {
    login,
    logout,
  };
};
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
  const { login } = useAuth();
  const { client } = useBackendAPI();
  beforeEach(() => {
    (client.post as jest.Mock).mockResolvedValue({
      data: { success: false },
    });
  });

  it('posts to the login endpoint', async () => {
    await login('test@test.com', 'testpassword');
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith('/login', {
      username: 'test@test.com',
      password: 'testpassword',
    });
  });

  describe('when the login fails', () => {
    it('resolves false', async () => {
      expect(await login('test@test.com', 'password')).toEqual(false);
    });
  });

  describe('when the login succeeds', () => {
    let user: User;
    beforeEach(() => {
      user = {
        id: 314159,
        firstName: 'Testy',
        lastName: 'McTest',
        email: 'test@test.com',
      };
      (client.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          user,
          token: '123456789',
        },
      });
    });

    it('resolves true', async () => {
      expect(await login('test@test.com', 'password')).toEqual(true);
    });

    it('sets the session', async () => {
      await login('test@test.com', 'password');
      expect(useSession().setSession).toHaveBeenCalledTimes(1);
      expect(useSession().setSession).toHaveBeenCalledWith({
        user,
        token: '123456789',
      });
    });
  });
});
```

One way to translate that into code is to update our `login()` function as such:

```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  const response = await client.post('/login', { username: email, password });
  if (response.data.success) {
    setSession({
      user: response.data.user,
      token: response.data.token,
    });
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
  const { logout } = useAuth();
  const { client } = useBackendAPI();

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

We are going to be calling the `login()` and `logout()` methods from our views. As a result, it would be nice to have a nice consistent mock set up for them. Remember the `src/composables/__mocks__/session.ts` file we created at the start of this lab? Create a very similar one called `src/composables/__mocks__/auth.ts` with the `login` and `logout` mocks properly defined.

## Conclusion

We have created composable functions to manage our session state and handle the authentication logic. In the next section we will begin to assemble the pieces created here to develop our authentication flow.

Remember, if you got stuck on any of the coding challenges, you can have a look at the <a href="https://github.com/ionic-team/tea-taster-vue" target="_blank">completed code</a>, but try not to peek.
