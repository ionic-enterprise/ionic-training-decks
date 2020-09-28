# Lab: Handle Authentication

In this lab, you will learn how to:

- POST data to an API endpoint
- Use React Context to provide data across components
- Create custom React hooks

## Overview

In the last lab, we created a service that stores information about the currently signed in user (including their authorization token). But how do we get that token in the first place? How do we relay the authentication status to our components?

## Authentication Service

Start out by adding two files to `src/core/services`: `AuthService.ts` and `AuthService.test.ts`.

### Interface Setup

`AuthService` needs two methods; `login` and `logout`. Add the following code to `AuthService.ts`:

**`src/core/services/AuthService.ts`**

```TypeScript
import Axios from 'axios';
import { IdentityService } from './IdentityService';
import { User } from '../models';

export class AuthService {
  private static instance: AuthService | undefined;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<boolean> {
    return false;
  }

  async logout(): Promise<void> {}
}
```

Note that we will be making use of our `IdentityService` to store or clear identity information after login/logout. We'll also be pulling in the default instance of `Axios` since we won't have an authorization token at this point.

Now let's scaffold the test file:

**`src/core/services/AuthService.test.ts`**

```TypeScript
import Axios from 'axios';
jest.mock('axios');
import { IdentityService } from './IdentityService';
import { User } from '../models';
import { AuthService } from './AuthService';

const mockUser: User = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  it('should use a single instance', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {});

  describe('logout', () => {});

  afterEach(() => jest.restoreAllMocks());
});
```

Alrighty, we are set to start implementing.

### Login

Our `login()` method needs to make a POST request that returns a token and a `User` object representing the signed in user. We should also make sure that we account for failed sign in attempts!

#### Test First

First let's ensure that our `login()` method makes a POST request to the correct URL. For that we will need to mock Axios's `post` method. Modify the test file with the following changes:

**`src/core/services/AuthService.test.ts`**

```TypeScript
...
describe('AuthService', () => {
  ...
  describe('login', () => {
    beforeEach(() => {
      (Axios.post as any) = jest.fn(() =>
        Promise.resolve({
          data: {
            token: '3884915llf950',
            user: mockUser,
            success: true,
          },
        }),
      );
      IdentityService.getInstance().set = jest.fn(() => Promise.resolve());
    });

    it('POSTs the login', async () => {
      const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
      const credentials = { username: 'test@test.com', password: 'P@assword' };
      await authService.login(credentials.username, credentials.password);
      expect(Axios.post).toHaveBeenCalledTimes(1);
      expect(Axios.post).toHaveBeenCalledWith(url, credentials);
    });
  });
  ...
});
```

Next, we need to create describe blocks for each branch: when a user is successful in signing in, and when a user is unsuccessful in signing in:

```TypeScript
  ...
    it('POSTs the login', async () => {
      ...
    });
    describe('on success', () => {
      it('sets the user and token in the identity service', async () => {
        await authService.login('test@test.com', 'P@assword');
        expect(IdentityService.getInstance().set).toHaveBeenCalledTimes(1);
        expect(IdentityService.getInstance().set).toHaveBeenCalledWith(
          mockUser,
          '3884915llf950',
        );
      });

      it('return true', async () => {
        const res = await authService.login('test@test.com', 'P@assword');
        expect(res).toBeTruthy();
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        (Axios.post as any) = jest.fn(() =>
          Promise.resolve({ data: { success: false } }),
        );
      });

      it('does not set the user and token in the identity service', async () => {
        await authService.login('test@test.com', 'P@assword');
        expect(IdentityService.getInstance().set).toHaveBeenCalledTimes(0);
      });

      it('returns false', async () => {
        const res = await authService.login('test@test.com', 'P@assword');
        expect(res).toBeFalsy();
      });
    });
  ...
```

#### Then Code

### Logout

#### Test First

#### Then Code

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
