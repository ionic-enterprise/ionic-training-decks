# Lab: Handle Authentication

In this lab, you will learn how to:

- POST data to an API endpoint
- Create custom React hooks

## Overview

Like our `IdentityService` we will build a singleton class for authentication which will contain login and logout functionality. Then we will use state management to make the authentication endpoints and identity information available across the application.

## Authentication Service

First, we need to create a service for authentication. Since we covered this in a previous last lab, this portion will simply be a copy-and-paste job.

Add two files to `src/core/services`: `AuthService.ts` and `AuthService.test.ts`.

### Test First

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
  });

  describe('logout', () => {
    beforeEach(() => {
      (Axios.post as any) = jest.fn(() => Promise.resolve());
      IdentityService.getInstance().clear = jest.fn(() => Promise.resolve());
    });

    it('POSTs the logout', async () => {
      const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
      await authService.logout();
      expect(Axios.post).toHaveBeenCalledTimes(1);
      expect(Axios.post).toHaveBeenCalledWith(url);
    });

    it('clears the identity', async () => {
      await authService.logout();
      expect(IdentityService.getInstance().clear).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

Note that we will be making use of our `IdentityService` to store or clear identity information after login/logout. We'll also be pulling in the default instance of `Axios` since we won't have an authorization token at this point.

### Then Code

**`src/core/services/AuthService.ts`**

```TypeScript
import Axios from 'axios';
import { IdentityService } from './IdentityService';

export class AuthService {
  private static instance: AuthService | undefined;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<boolean> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await Axios.post(url, { username, password });

    if (!data.success) return false;

    IdentityService.getInstance().set(data.user, data.token);
    return true;
  }

  async logout(): Promise<void> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
    await Axios.post(url);
    IdentityService.getInstance().clear();
  }
}
```

Finally, update the barrel file (`src/core/services/index.ts`).

## Conclusion

Now we have two singletons that connect to data services. Next, we're going to use them to derive application state and control routing.
