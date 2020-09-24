# Lab: Handle Authentication

In this lab, you will learn how to:

- Use environment variables to configure dynamic values
- Interact with HTTP-based data services
- Implement the singleton pattern to create shared class instances

## Overview

Our application has a login page but it doesn't do much; we don't have a way to allow users to sign in or sign out, nor do we have a way to retrieve information on the user currently interacting with the application. Luckily, we have a data service we can plug into that provides these pieces of functionality.

There are two conceptual pieces to authentication:

1. Managing the authentication and unauthentication of all application users
2. Managing the status and state of the current application user

Following the Single Responsibility Principle, we should have one class that implements functionality that is applicable to all users (Authentication) and one class that implements functionality that is only applicable to the current user (Identity).

### Side Note: Singleton Pattern

It's incredibly common for web and mobile applications to use a shared single instance of classes that provides functionality with data services or other APIs. This is known as the singleton pattern, and it works really well!

Some frameworks provide a mechanism that will provision singleton instances of classes for you. React does not. I've seen React projects export a new instance of a class to share a single class instance like this `export default new MyClass();`, or mix "business logic" with components or React hooks.

I prefer explicitly implementing the singleton pattern the way it would be written in other languages. I find that it makes the intent of the code clearer to other developers.

## Create the User Model

It would be practical to begin by modeling the shape of what a signed in user should look like in our application.

Add a new file `src/models/User.ts`:

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

**Challenge:** Add our `User` interface to the `models` barrel file.

## Set Up the Environment

Many applications have the need to modify values that effect the way the application behaves at runtime. Such values are known as environment variables, and are typically different values based on which environment context is running.

Our application will make use of environment variables to store the URL of our data service.

Create a new file at the root of the project and name it `.env`:

```bash
REACT_APP_DATA_SERVICE=https://cs-demo-api.herokuapp.com
```

Our application will only have one environment context to run in but if we had dedicated development and production environments, we would add additional files `.env.production` and `.env.development` to the root of our application.

## Identity Singleton

Start by creating a new folder named `auth` within our `src` folder. We'll keep all authentication-based files here. Inside `src/auth`, create `Identity.ts` and `Identity.test.ts`.

Our identity data service will be responsible for the following functionality:

- Storing the current user's authorization token using <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Capacitor's Storage API</a>.
- Getting/setting the current user's authorization token and user object.
- Attempt to automatically sign the user in using the stored authorization token.
- Clearing the current user's in-memory authorization token and user object, and removing the current user's stored authorization token.

Open `Identity.ts` so we can scaffold the identity class and complete the singleton implementation:

```TypeScript
import { Plugins } from '@capacitor/core';
import { User } from '../models';

export class Identity {
  private _key = 'auth-token';
  private _token: string | undefined = undefined;
  private _user: User | undefined = undefined;

    get token(): string | undefined {
    return this._token;
  }

  get user(): User | undefined {
    return this._user;
  }

  async initialize(): Promise<void> {
    // TODO: Implement
  }

  async set(user: User, token: string): Promise<void> {
    // TODO: Implement
  }

  async clear(): Promise<void> {
    // TODO: Implement
  }

}

export default class IdentitySingleton {
  private static instance: Identity | undefined = undefined;

  static getInstance(): Identity {
    if(this.instance === undefined) this.instance = new Identity();
    return this.instance;
  }
}

```

### Initializing the User

To provide our application's users with a great user experience, our application will attempt to automatically log users in if an authorization token is found on device. If an authorization token can be found, we'll make a call out to an API endpoint `/users/current` to retrieve the current user's information. Once that data is obtained, we'll set our `token` and `user` properties.

#### Test First

Open up `Identity.test.ts`. We're going to do some test setup first; defining mocks, writing setup/teardown code and making sure that our singleton implementation works:

```TypeScript
import { Plugins } from '@capacitor/core';
import IdentitySingleton, { Identity } from './Identity';

const mockToken = '3884915llf950';
const mockUser = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('Identity', () => {
  let identity: Identity;

  beforeEach(() => {
    identity = IdentitySingleton.getInstance();
    identity['_token'] = undefined;
    identity['_user'] = undefined;
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.get as any) = jest.fn();
    (Plugins.Storage.set as any) = jest.fn();
    (Plugins.Storage.remove as any) = jest.fn();
  });

  it('should use the singleton instance', () => {
    expect(identity).toBeDefined();
  });

  afterEach(() => {
    (Plugins.Storage as any).mockRestore();
    (Plugins.Storage.get as any).mockRestore();
    (Plugins.Storage.set as any).mockRestore();
    (Plugins.Storage.remove as any).mockRestore();
  });
});
```

Ensure that this test passes. Once verified, add a new `describe` block after the singleton test for the `initialize` function:

```TypeScript
  ...
  describe('initialize', () => {
     beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(mockUser)
        });
      });
    });

    afterEach(() => {
      (window.fetch as any).mockRestore();
    });
  });
  ...
```

Our `initialize` function needs to make a network request to fetch the current user's information. There's a million different HTTP networking libraries available but we'll make use of `window.fetch` since it's available out-of-the-box with JavaScript.

First, we need to ensure that we can are looking in the proper place for our token. Place this test in between the setup and teardown code written for the `initialize` describe block:

```TypeScript
    ...
    it('gets the stored token', async () => {
      (Plugins.Storage.get as any).mockImplementation(() =>
        Promise.resolve({ value: mockToken })
      );
      await identity.initialize();
      expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
    });
    ...
```

Next, we'll write tests covering the path where an authorization token is available in device storage. These tests should be placed under the test we just added:

```TypeScript
    ...
    describe('if a token exists', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any).mockImplementation(() =>
          Promise.resolve({ value: mockToken }),
        );
      });

      it('assigns the token', async () => {
        await identity.initialize();
        expect(identity.token).toEqual(mockToken);
      });

      it('gets the current user', async () => {
        await identity.initialize();
        expect(window.fetch).toHaveBeenCalledTimes(1);
        expect(identity.user).toEqual(mockUser);
      });

      it('assigns the current user', async () => {
        await identity.initialize();
        expect(identity.user).toEqual(mockUser);
      });
    });
    ...
```

Note how we're mocking the `Storage` API before each test to return our desired value. We're also mocking our network connection in the second test to simulate the response we'd expect the network to return.

Finally, we'll move onto the path where an authorization token is not available on device:

```TypeScript
    ...
    describe('if there is not a token', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any).mockImplementation(() =>
          Promise.resolve({ value: null }),
        );
      });

      it('does not get the current user', async () => {
        await identity.initialize();
        expect(identity.token).toBeUndefined();
        expect(identity.user).toBeUndefined();
      });
    });
    ...
```

It's important to keep the two paths in separate describe blocks as they each require different setup code. Now we have all the tests we need for `initialize`, and they're all failing, so it's time to code!

#### Then Code

Head over to `Identity.ts` and let's implement `initialize`:

```TypeScript
...
export class Identity {
  private _key = 'auth-token';
  private _token: string | undefined = undefined;
  private _user: User | undefined = undefined;

    get token(): string | undefined {
    return this._token;
  }

  get user(): User | undefined {
    return this._user;
  }

  async initialize(): Promise<void> {
   const { Storage } = Plugins;
   const { value } = await Storage.get({ key: this._key });

   if (!value) return;

   this._token = value;
   this._user = await this.fetchUser(this._token);
  }

  async set(user: User, token: string): Promise<void> {
    // TODO: Implement
  }

  async clear(): Promise<void> {
    // TODO: Implement
  }

  /**
   * This fetches user information and parses it into a User object.
   * @param token Authorization token
   * @returns {Promise<User>} The authenticated user's information.
   */
  private async fetchUser(token: string): Promise<User> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
    const response = await fetch(url, { headers });
    const { id, firstName, lastName, email } = await response.json();
    return { id, firstName, lastName, email };
  }

}
...
```

There's quite a bit that goes on in making the network request and casting the response into a `User` object. This makes it a good candidate for a private method. Let's break down what it's doing:

1. The authorization header is generated which is needed to obtain the user's information
2. The API endpoint to retrieve the user's information is constructed using our environment variable
3. A GET request is made to the constructed URL with headers provided in the `options` parameter
4. The JSON response body is deconstructed to obtain the values we need for a `User` object
5. TypeScript asserts that we are returning a `User` object based on the object being returned

### Setting the User and Storing the Token

The `initialize` function takes care of the case when the user has already established their identity within our application. We need a way to set the identity after the user has signed in using the login page.

#### Test First

Open `Identity.test.ts` and add the following test cases under the `initialize` describe block:

```TypeScript
    ...
    describe('set', () => {
      beforeEach(() => {
        (Plugins.Storage.set as any).mockImplementation(() => Promise.resolve());
      });

      it('sets the user', async () => {
        await identity.set(mockUser, mockToken);
        expect(identity.user).toEqual(mockUser);
      });

      it('sets the token', async () => {
        await identity.set(mockUser, mockToken);
        expect(identity.token).toEqual(mockToken);
      });

      it('saves the token in storage', async () => {
        await identity.set(mockUser, mockToken);
        expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
        expect(Plugins.Storage.set).toHaveBeenCalledWith({
          key: 'auth-token',
          value: mockToken,
        });
      });
    });
    ...
```

That's all we need to cover for the `set` method, so let's go ahead and implement this method.

#### Then Code

**Challenge:** Implement the `set` method of `Identity`.

### Clearing the User

The last piece to the identity data service class is to provide the ability to clear the application user's data, both in-memory and on device.

#### Test First

After the describe block for the `set` method, add the following:

```TypeScript
  ...
  describe('clear', () => {
    beforeEach(async () => {
      await identity.set(mockUser, mockToken);
      (Plugins.Storage.remove as any).mockImplementation(() =>
        Promise.resolve(),
      );
    });

    it('clears the user', async () => {
      await identity.clear();
      expect(identity.user).toBeUndefined();
    });

    it('clears the token', async () => {
      await identity.clear();
      expect(identity.token).toBeUndefined();
    });

    it('clears the token in storage', async () => {
      await identity.clear();
      expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.remove).toHaveBeenCalledWith({
        key: 'auth-token',
      });
    });
  });
  ...
```

You know the drill, failing tests means it's time to code.

#### Then Code

**Challenge:** Implement the `clear` method of the `Identity` class.

## Authentication Singleton

Inside of `src/auth` create two new files, `Authentication.ts` and `Authentication.test.ts`.

Our authentication data service will be responsible for communicating with the data service's login and logout endpoints.

Open `Authentication.ts` so we can scaffold the authentication class:

**Challenge:** Implement the Singleton pattern, exporting a class named `AuthSingleton`.

### Login

The `login` method will submit the user's inputted e-mail address and password to the authentication data service by making a `POST` request to the `/login` endpoint.

#### Test First

We'll begin by scaffolding out our test file and adding our singleton assertion test:

```TypeScript
import AuthSingleton, { Authentication } from './Authentication';

describe('Authentication', () => {
  let auth: Authentication;

  beforeEach(() => {
    auth = AuthSingleton.getInstance();
    (window.fetch as any) = jest.fn();
  });

  it('should use the singleton instance', () => {
    expect(auth).toBeDefined();
  });

  afterEach(() => {
    (window.fetch as any).mockRestore();
  });
});
```

Next, add a describe block after the singleton test for the `login` method and assert that it will make a network request:

```TypeScript
  ...
  describe('login', () => {
    const mockSuccessResponse = {
      token: '3884915llf950',
      user: {
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.com',
      },
      success: true,
    };

    beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(mockSuccessResponse),
        });
      });
    });

    it('POSTs the login', async () => {
      await auth.login('test@test.com', 'password');
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

Note that a mock object has been created that represents what a successful sign in response looks like. We'll use it to test the success path. Add the following describe block and accompanying tests after `it('POSTs the login')`:

```TypeScript
    ...
    describe('on success', () => {
      it('returns the token and user object', async () => {
        const result = await auth.login('test@test.com', 'password');
        expect(result).toEqual({ token: result.token, user: result.user });
      });
    });
    ...
```

Our last set of tests will test the path of a failed response. We'll create a describe block for this path after the success describe block and establish setup code that will create a mock representation of a failed sign in attempt:

```TypeScript
    ...
    describe('on failure', () => {
      beforeEach(() => {
        (window.fetch as any) = jest.fn(() => {
          return Promise.resolve({
            json: () => Promise.resolve({ success: false }),
          });
        });
      });

      it('throws an error', async () => {
        const expectedErrorMsg = 'Failed to log in. Please try again.';
        try {
          await auth.login('test@test.com', 'password');
          expect(true).toBeFalsy();
        } catch (error) {
          expect(error.message).toBe(expectedErrorMsg);
        }
      });
    });
    ...
```

With our tests failing let's implement this method.

#### Then Code

Notice that the authentication service will still return a successful response in the event the e-mail address/password combination does not sign a user in. Instead, it will return `{success: false}`. We should use this to our advantage while implementing the `login` method:

```TypeScript
  ...
  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const options = {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ username, password }),
    };
    const response = await fetch(url, options);
    const body = await response.json();

    if (!body.success) {
      throw Error('Failed to log in. Please try again.');
    }

    const token = body.token;
    const { id, firstName, lastName, email } = body.user;
    return { token, user: { id, firstName, lastName, email } };
  }
  ...
```

### Logout

The `logout` method will also make a `POST` request, this time to the `/logout` endpoint.

#### Test First

Under the `login` describe block, create one for `logout`. We'll mock the expected sign out response object and write a test to ensure that we are posting to the sign out endpoint.

```TypeScript
  ...
  describe('logout', () => {
    beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      });
    });

    it('POSTs the logout', async () => {
      await auth.logout();
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

#### Then Code

**Challenge:** Implement the `logout` method.

Take note that the only option required in the `fetch` request is `{ method: 'POST' }`.

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
