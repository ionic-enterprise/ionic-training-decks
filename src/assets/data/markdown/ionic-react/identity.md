# Lab: Store the User Identity

In this lab, you will learn how to:

- Use environment variables to configure dynamic values
- Use the Capacitor Storage API
- Implement the singleton pattern to create shared class instances
- Intercept outgoing HTTP requests with Axios

## Overview

Our application has a login page but it doesn't do much. We don't have a way to allow users to sign in or sign out, and we don't have a way to retrieve identity information. Let's fix that.

## Create the User Model

The first thing we will need is the model of the user. Create a folder inside `src/core` named `models`. Inside `src/core/models` create two files: `index.ts` and `User.ts`. Populate `User.ts` with the following contents:

**`src/core/models/User.ts`**

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

**Challenge:** Populate `src/core/models/index.ts` so that it exports our `User` model.

## Set Up the Environment

Create a new file at the root of the project and name it `.env`:

**`.env`**

```bash
REACT_APP_DATA_SERVICE=https://cs-demo-api.herokuapp.com
```

Stop your running instances of `ionic serve` and `npm test` and re-start them. Now our environment variables are available to our scripts.

**Pro-tip:** If you notice that new/modified environment variables aren't working, the first step in troubleshooting is to terminate and restart any running scripts. This allows any node processes to use the latest updated version of your environment variables, and solves issues more times than not.

## Identity Singleton

Now it's time to get down to the main subject here and create a data service that will store information about the currently authenticated user.

**Note:** The terms "service" and "singleton" are interchangable for this training. Front-end frameworks have a concept of "services": shared class instances used across an application. React does not provide any opinionated way to create these, so we will implement the singleton pattern to ensure that no actor can create multiple instances of the business logic classes we create.

Create a new folder `src/core/services`and create `IdentityService.ts`, `IdentityService.test.ts`, and `index.ts` inside the newly created folder.

### Interface Setup

The first thing we will do is define what we want the shape of our service to be:

**`src/core/services/IdentityService.ts`**

```TypeScript
import { User } from '../models';

export class IdentityService {
  private static instance: IdentityService | undefined = undefined;
  private _key = 'auth-token';
  private _token: string | undefined = undefined;
  private _user: User | undefined = undefined;

  get token(): string | undefined {
    return this._token;
  }

  get user(): User | undefined {
    return this._user;
  }

  private constructor() {}

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }
    return IdentityService.instance;
  }

  async init(): Promise<void> {}

  async set(user: User, token: string): Promise<void> {}

  async clear(): Promise<void> {}
}
```

Update `src/core/services/index.ts` to export `IdentityService`.

Finally, let's fill out a skeleton of our test file:

**`src/core/services/IdentityService.test.ts`**

```TypeScript
import { IdentityService } from './IdentityService';

describe('IdentityService', () => {
  let identityService: IdentityService;

  beforeEach(() => {
    identityService = IdentityService.getInstance();
    identityService['_token'] = undefined;
    identityService['_user'] = undefined;
  });

  it('should use a single instance', () => {
    expect(identityService).toBeDefined();
  });

  describe('init', () => { });

  describe('set', () => { });

  describe('clear', () => { });

  afterEach(() => jest.restoreAllMocks());
});
```

Notice that we are also adding some setup code to reset the token and user properties before each test. In the teardown logic, we are calling `jest.restoreAllMocks()`. This is a utility function Jest provides that, well, restores all mocks. Going forward we'll take advantage of this so that all of our mocks are restored to their actual implementations after each test executes.

### Initializing the User

The following tests will all go within the `init` describe block of `IdentityService.test.ts`. In the spirit of test-driven-development, we will write the code to satisfy each test as we go.

The first task we have is to check storage to see if there is already a stored token on device:

**`src/core/services/IdentityService.test.ts`**

```TypeScript
  ...
  describe('init', () => {
    beforeEach(() => {
      (Plugins.Storage as any) = jest.fn();
      (Plugins.Storage.get as any) = jest.fn(() =>
        Promise.resolve({ value: '3884915llf950' }),
      );
    });

    it('gets the stored token', async () => {
      await identityService.init();
      expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
    });
  });
  ...
```

Make sure to add imports as needed.

**Challenge:** Make this test pass. Check the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API documentation</a> if you get stuck.

#### If a Token Exists

When the token is obtained, there are two potential outcomes: either a token exists or it does not. Let's first define the behavior for when a token does not exists.

Nest the following describe block inside of `describe('init', ...)`:

```TypeScript
  ...
    describe('if there is a token', () => { });
  ...
```

If a token exists, it should be assigned to the property. Here is the test, place it into the `describe()` block you just added, after the `beforeEach()` block:

```TypeScript
it('assigns the token', async () => {
  await identityService.init();
  expect(identityService.token).toEqual('3884915llf950');
});
```

**Challenge:** Make the test case pass.

Next, if we have a token, we should query the back end API and get the user associated with that token. We don't know how to do this yet, so let's just add two stub tests that we can revisit later. Place the following tests after the "assigns the token" test:

```TypeScript
it('gets the current user', async () => { });

it('assigns the user', async () => { });
```

#### If a Token Does Not Exist

The tests for the case where a token is not defined are super simple. Nest the following `describe()` block inside of `describe('init', ...)`:

```TypeScript
describe('if there is not a token', () => {
  beforeEach(() => {
    (Plugins.Storage.get as any) = jest.fn(() =>
      Promise.resolve({ value: null }),
    );
  });

  it('does not assign a token', async () => {
    await identityService.init();
    expect(identityService.token).toBeUndefined();
  });

  it('does not get the current user', async () => {
    await identityService.init();
    expect(identityService.user).toBeUndefined();
  });
});
```

Now let's shift our focus to making HTTP requests.

### HTTP Requests with Axios

There are several libraries that can be used for HTTP networking with an Ionic Framework + React project.

The most obvious of which is the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" target="_blank">Fetch API</a> which is bundled with browsers. The Fetch API is not very feature rich when compared to other libraries. <a href="https://github.com/axios/axios" target="_blank">Axios</a> is a very popular library within the JavaScript and React communities. It also has the ability to create HTTP interceptors, which we are very interested in.

Terminate `ionic serve` and `npm test` and add Axios to your application:

```bash
$ npm install axios
```

Start `ionic serve` and `npm test` again. Return to `IdentityService.test.ts` so we can start filling out the remaining tests for the `init` function. Update your test file to make the changes below:

**`src/core/services/IdentityService.test.ts`**

```TypeScript
import { Plugins } from '@capacitor/core';
import Axios from 'axios';
jest.mock('axios');
import { User } from '../models';
import { IdentityService } from './IdentityService';

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('IdentityService', () => {
  let identityService: IdentityService;

  beforeEach(() => {
    ...
  });

  it('should use a single instance', () => {
    ...
  });

  describe('init', () => {
    beforeEach(() => {
      ...
      (Axios.get as any) = jest.fn(() => Promise.resolve({ data: mockUser }));
    });

    ...

    describe('if there is a token', () => {
      ...

      it('gets the current user', async () => {
        await identityService.init();
        const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
        const headers = { Authorization: 'Bearer ' + '3884915llf950' };
        expect(Axios.get).toHaveBeenCalledWith(url, { headers });
      });

      it('assigns the user', async () => {
        await identityService.init();
        expect(identityService.user).toEqual(mockUser);
      });
    });

    describe('if there is not a token', () => {
      ...
    });
  });

  describe('set', () => {});

  describe('clear', () => {});

  afterEach(() => jest.restoreAllMocks());
});

```

Now let's update `IdentityService` itself so that the tests pass:

**`src/core/services/IdentityService.ts`**

```TypeScript
import Axios from 'axios';
import { Plugins } from '@capacitor/core';
import { User } from '../models';

export class IdentityService {
  ...

  private constructor() {}

  public static getInstance(): IdentityService {
    ...
  }

  async init(): Promise<void> {
    const { Storage } = Plugins;
    const { value } = await Storage.get({ key: this._key });

    if (!value) return;

    this._token = value;
    this._user = await this.fetchUser(this._token);
  }

  async set(user: User, token: string): Promise<void> {}

  async clear(): Promise<void> {}

  private async fetchUser(token: string): Promise<User> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
    const { data } = await Axios.get(url, { headers });
    return data;
  }
}
```

Make note of the `fetchUser` method. This method stands up and makes the network request to obtain the current user's information.

### Setting the User and Storing the Token

The `set()` method is called whenever a newly signed in user needs to be registered as the current user. Therefore, it has the following requirements:

- Set the user
- Set the token
- Store the token in storage

I will provide the tests. In each case, add them within the `describe('set', ...)` section of `src/core/services/IdentityService.test.ts`. Once you have added one test, save the file and observe the failing test. At that point, add the code required to get the test to pass.

#### Set the User

Here is the test that ensures that the user gets set:

```TypeScript
it('sets the user', async () => {
  await identityService.set(mockUser, '19940059fkkf039');
  expect(identityService.user).toEqual(mockUser);
});
```

The code to make this pass should be pretty straight forward. Add it to the `set()` method in the code.

#### Set the Token

Once again, I will provide the test:

```TypeScript
it('sets the token', async () => {
  await identityService.set(mockUser, '19940059fkkf039');
  expect(identityService.token).toEqual('19940059fkkf039');
});
```

Go ahead and provide the code to satisfy the test.

#### Save the Token

For this test, we will need to introduce setup code to our `set` tests. Below is the modified `set` describe block with the setup code and the test to save the token.

```TypeScript
describe('set', () => {
  beforeEach(() => {
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.set as any) = jest.fn(() => Promise.resolve());
  });

  ...

  it('saves the token in storage', async () => {
    await identityService.set(mockUser, '19940059fkkf039');
    expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.set).toHaveBeenCalledWith({
      key: 'auth-token',
      value: '19940059fkkf039',
    });
  });
});
```

Check the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API documentation</a> if you get stuck.

### Clearing the User

The `clear()` method is called whenever a user logs out. Its requirements are the opposite of those for the `set()` method:

- Clear the user
- Clear the token
- Remove the token from storage

Like we did for `set()`, I will provide the tests. In each case, add them within the `describe('clear', ...)` section of the test file. Once one test has been added, save, let the test fail, and then write the code to make the test pass.

First though, we're going to need some setup code for the tests. Since this method is called when a user signs out, it makes sense for us to start in the state the system would be in with a logged in user:

**`src/core/services/IdentityService.test.ts`**

```TypeScript
  ...
  describe('clear', () => {
    beforeEach(() => {
      identityService['_user'] = mockUser;
      identityService['_token'] = '19940059fkkf039';
      (Plugins.Storage as any) = jest.fn();
      (Plugins.Storage.remove as any) = jest.fn(() => Promise.resolve());
    });
  });
  ...
```

#### Clear the User

```TypeScript
it('clears the user', async () => {
  await identityService.clear();
  expect(identityService.user).toBeUndefined();
});
```

#### Clear the Token

```TypeScript
it('clears the token', async () => {
  await identityService.clear();
  expect(identityService.token).toBeUndefined();
});
```

#### Clear the Storage

```TypeScript
it('clears the storage', async () => {
  await identityService.clear();
  expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.remove).toHaveBeenCalledWith({
    key: 'auth-token',
  });
});
```

## HTTP Interceptor

Remember the amount of code we had to write in order to make the network request for the current application user? If not, here's a reminder:

```TypeScript
private async fetchUser(token: string): Promise<User> {
  const headers = { Authorization: 'Bearer ' + token };
  const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
  const { data } = await Axios.get(url, { headers });
  return data;
}
```

If we had to write this once or twice it wouldn't be so bad, but we have a back end data service that requires authorization for most of it's API endpoints.

Axios allows us to intercept outgoing and incoming network calls and make modifications to them. That is extremely helpful when making multiple API calls to the same back end.

### Axios Instance

Axios allows the ability to create instances of the main `Axios` class. We will do this to create an instance that works for our back end service API. It will do the following:

- Set the base URL of relative paths
- Inject the authorization header into outgoing requests
- Throw an error if no token is found
- Trim the response object to just return the data portion

Create a new file `src/core/apiInstance.ts` and write the following code:

**`src/core/apiInstance.ts`**

```TypeScript
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IdentityService } from './services/IdentityService';

const apiInstance = Axios.create({
  baseURL: process.env.REACT_APP_DATA_SERVICE,
});

apiInstance.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = IdentityService.getInstance().token;
  if (!token)
    throw new Error('This operation requires authorization, please sign in.');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
);

export default apiInstance;
```

We won't make use of this HTTP interceptor for `IdentityService` but it will be handy once we start fetching real tea data in future labs.

## Conclusion

Our app can now handle identity and authorization! In the next lab we will work on making this information available using state management.
