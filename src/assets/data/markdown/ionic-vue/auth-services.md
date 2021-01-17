# Lab: Create Authentication Services

Before we get too far in to authentication, we need to do some data modeling and define some services that will allow us to abstract out some fundamental tasks. In this lab you will learn how to:

- Create Services
- Use the Capacitor Storage API

## The User and AuthUser Models

The first thing we will need to do is model the User data for our system. Create a `src/models/User.ts` file with the following contents:

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

Next we will model the current session. The session will consist of a User and the authentication token for that user's session. Create a `src/models/Session.ts` file with the following contents:

```TypeScript
import { User } from './User';

export interface Session {
  user: User;
  token: string;
}
```

Be sure to update `src/models/index.ts`

## The `SessionVaultService` Service

When the user logs in, the establish a session. This session is defined by the user and the authentication token that was returned by our backend API during the login. We will need a place to store this information. We will create a service to do this. The single responsibility of this service will be to manage the storage of the current session information. Thus, we will call it the `SessionVaultService`.

### Test and Service Shells

First create two files that will serve as the shells for our test and service. You will also need to create the proper directories for them as they do not exist yet.

`tests/unit/services/SessionVaultService.spec.ts`

```typescript
import { Plugins } from '@capacitor/core';
import SessionVaultService from '@/services/SessionVaultService';
import { Session } from '@/models';

jest.mock('@capacitor/core');

describe('SessionVaultService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
```

`src/services/SessionVaultService.ts`

```typescript
import { Plugins } from '@capacitor/core';
import { Session } from '@/models';

const key = 'session';

export default {};
```

Our session storage API is going to be very simple. We will have three operations: set, get, and clear. We will use the Capacitor <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage Plugin</a> to store the information.

For the following methods, add the test code to the test file that you just created and the code to satisfy the tests to the service file you just created. Make sure that the `npm run test:dev` process is running so you can see the results of the tests as you make your changes.

### Set

For the `set()` call, we want to ensure that that user data and token are combined into a single object and stored using the `session` key.

```TypeScript
describe('set', () => {
  it('sets the auth data using the user and token', async () => {
    const { Storage } = Plugins;
    (Storage.set as any).mockResolvedValue();
    const session: Session = {
      user: {
        id: 73,
        firstName: 'Sheldon',
        lastName: 'Cooper',
        email: 'physics@caltech.edu',
      },
      token: '98761243',
    };
    await SessionVaultService.set(user, token);
    expect(Storage.set).toHaveBeenCalledTimes(1);
    expect(Storage.set).toHaveBeenCalledWith({
      value: JSON.stringify(session),
    });
  });
});
```

The code to satisfy this requirement looks like this:

```typscript
import { Plugins } from '@capacitor/core';
import { Session } from '@/models';

const key = 'session';

export default {
  async set(session: Session): Promise<void> {
    const { Storage } = Plugins;
    const value = JSON.stringify(session);
    await Storage.set({ key, value });
  },
}
```

### Get

The `get()` method is a little more involved. We need to call the Storage API's `get()` method with the `session` key and unpack the results. We also will return undefined if no value is returned from the Storage API.

```typescript
describe('get', () => {
  beforeEach(() => {
    const { Storage } = Plugins;
    (Storage.get as any).mockResolvedValue({
      value: JSON.stringify({
        user: {
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'thanksfor@thefish.com',
        },
        token: '12349876',
      } as Session),
    });
  });

  it('gets the value from storage', async () => {
    const { Storage } = Plugins;
    await SessionVaultService.get();
    expect(Storage.get).toHaveBeenCalledTimes(1);
    expect(Storage.get).toHaveBeenCalledWith({ key: 'session' });
  });

  it('returns the value', async () => {
    const session = await SessionVaultService.get();
    expect(session).toEqual({
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thanksfor@thefish.com',
      },
      token: '12349876',
    });
  });

  it('returns undefined if a value has not been set', async () => {
    const { Storage } = Plugins;
    (Storage.get as any).mockResolvedValue({ value: null });
    expect(await SessionVaultService.get()).toBeUndefined();
  });
});
```

The code that satisfies these requirements looks like this:

```typescript
  async get(): Promise<Session | undefined> {
    const { Storage } = Plugins;
    const { value } = await Storage.get({ key });
    if (value) {
      return JSON.parse(value);
    }
  },
```

### Clear

To clear the session, we need to call `remove()` with the `session` key. The following test defines the requirement:

```typescript
describe('clear', () => {
  it('removes the data from storage', async () => {
    const { Storage } = Plugins;
    (Storage.remove as any).mockResolvedValue();
    await SessionVaultService.clear();
    expect(Storage.remove).toHaveBeenCalledTimes(1);
    expect(Storage.remove).toHaveBeenCalledWith({ key: 'session' });
  });
});
```

**Challenge:** using that test as a guide, add the code to implement the `clear()` method in the service.

## The `AuthenticationService` Service

The `AuthenticationService`'s single responsibility is to make the HTTP API calls that we need in order to perform any authentication related process. For our application, that is just logging in and logging out.

### Preliminary Setup

We will be using <a href="https://www.npmjs.com/package/axios" target="_blank">Axios</a> to make our HTTP calls. As such, we will need to install it.

```bash
$ npm i axios
```

We will also create a single Axios instance for our backend API. Create a `src/services/api.ts` file with the following contents:

```typescript
import axios from 'axios';

const baseURL = 'https://cs-demo-api.herokuapp.com';

export const client = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
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

### Test and Service Shells

Similar to when we created the `SessionVaultService`, we need to create shells for the unit test and the service.

- `tests/unit/services/AuthenticationService.spec.ts`
- `src/services/AuthenticationService.ts`

```typescript
import { client } from '@/services/api';
import AuthenticationService from '@/services/AuthenticationService';
import { User } from '@/models';

describe('AuthenticationService', () => {}
```

```typescript
import { client } from './api';
import { User } from '@/models';

export default {};
```

#### `login()`

For the login, we need to ensure the proper endpoint is posted to with the username and password in the payload. There are then two potential non-error reponsponses: one where the login fails, and one where the login succeeds. The tests that verify those requirements look like this:

```typescript
describe('login', () => {
  beforeEach(() => {
    client.post = jest.fn().mockResolvedValue({
      data: { success: false },
    });
  });

  it('posts to the login endpoint', () => {
    AuthenticationService.login('test@test.com', 'testpassword');
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith('/login', {
      username: 'test@test.com',
      password: 'testpassword',
    });
  });

  it('unpacks an unsuccessful login', async () => {
    expect(
      await AuthenticationService.login('test@test.com', 'password'),
    ).toEqual({ success: false });
  });

  it('unpacks a successful login', async () => {
    const user: User = {
      id: 314159,
      firstName: 'Testy',
      lastName: 'McTest',
      email: 'test@test.com',
    };
    (client.post as any).mockResolvedValue({
      data: {
        success: true,
        user,
        token: '123456789',
      },
    });
    expect(
      await AuthenticationService.login('test@test.com', 'password'),
    ).toEqual({ success: true, user, token: '123456789' });
  });
});
```

The code for the `login()` method is then:

```typescript
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    token?: string;
  }> {
    const response = await client.post('/login', { username: email, password });
    return {
      success: response.data.success,
      user: response.data.user,
      token: response.data.token,
    };
  },
```

Notice that we _could_ just return `reponse.data`. However, the backend API is an external dependency and we would like to insulate ourselves from changes to the external dependency.

#### `logout()`

For the logout method, we need to verify that the proper endpoint is posted to, but we don't have any response data to process. The tests for this look like:

```typescript
describe('logout', () => {
  it('posts to the logout endpoint', () => {
    client.post = jest.fn().mockResolvedValue({ data: null });
    AuthenticationService.logout();
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith('/logout');
  });
});
```

**Challenge:** write the code to satisfy that requirement. Here is the signature: `async logout(): Promise<void>`

## Conclusion

We have created two services. One that persists our session information, the other that performs the actual HTTP requests required in order to perform the login and logout. We are not actually doing anything with these services, however. They are just building blocks.

In the next lab we will begin to see how to assemble these pieces.
