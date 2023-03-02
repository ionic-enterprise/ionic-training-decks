# Lab: Persist the User Session

In this lab you will learn how to:

- Create an Angular service
- Use the Capacitor Preferences API
- Add more actions to the store

## The User and Session Models

The first thing we will need to do is model the Session data for our system. The session will consist of some user data along with the authentication token for that user's session.

First let's define the user data. Create a `src/app/models/user.ts` file with the following contents:

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

Next we will model the current session. Create a `src/app/models/session.ts` file with the following contents:

```TypeScript
import { User } from './user';

export interface Session {
  user: User;
  token: string;
}
```

Be sure to update `src/app/models/index.ts`

## Create the Session Vault Service

It is now time to get down to the main subject here and create an Angular service that will store information about the currently authenticated user.

```bash
ionic generate service core/session-vault/session-vault
```

Create `src/app/core/index.ts`. This is the barrel file for all of our `core` services.

```typescript
export * from './session-vault/session-vault.service';
```

## Install the Preferences Plugin

We are going to use `@capacitor/preferences` to persist the session data between invocations of the application.

```bash
npm i @capacitor/preferences
```

### Interface Setup

The first thing we will do is define what we want the shape of our service to be. Modify the generated service to include the following properties and methods.

```typescript
import { Injectable } from '@angular/core';

import { Session } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private key = 'auth-session';

  constructor() {}

  async set(session: Session): Promise<void> {}

  async get(): Promise<Session | null> {
    return null;
  }

  async clear(): Promise<void> {}
}
```

### Test Setup

Now that we have the interface for the service worked out, we can fill out a skeleton of the test. First, we need to set create some "global mocks" for the our `@capacitor` plugins. <a href="https://capacitorjs.com/docs/guides/mocking-plugins" target="_blank">This will make it easier to mock the plugins</a>. However, the concept of global mocks doesn't actually exist in Jasmine so we will have to perform a simple TypeScript configuration trick to fake it.

Edit the `tsconfig.spec.json` file and add a `paths` parameter to the `compilerOptions` as such:

```JSON
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"],
      "@test/*": ["test/*"],
      "@capacitor/*": ["__mocks__/@capacitor/*"]
    }
```

Note that this is exactly like the `paths` we added to the base `tsconfig.json` file in order to avoid relative routes in the imports. The change here is the addition of the `@capacitor/*` value. This change tells the build system that when it sees a statement like `import { Foo } from @capacitor/foo`, it should look in the `__mocks__/@capacitor` directory for `foo.ts` rather than under `node_modules`. Since it is in `tsconfig.spec.ts`, it will only do this when building for unit testing.

Next, create a `__mocks__/@capacitor` folder in the project's root and add a `preferences.ts` file with the following contents:

```TypeScript
class MockPreferences {
  async remove(opt: { key: string }): Promise<void> {}
  async set(opt: { key: string; value: string | undefined }): Promise<void> {}
  async get(opt: { key: string }): Promise<{ value: string | null }> {
    return { value: 'test' };
  }
}

const Preferences = new MockPreferences();

export { Preferences };
```

Now we can begin creating the test for our new `SessionVaultService` in `src/app/core/session-vault/session-vault.service.spec.ts`. Start by importing `Preferences` and `Session` as shown and by adding `describe` blocks for each of our public methods:

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { Session } from '@app/models';
import { SessionVaultService } from './session-vault.service';

describe('SessionVaultService', () => {
  let service: SessionVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // describe('set', () => {});

  // describe('get', () => {});

  // describe('clear', () => {});
});
```

**Note:** the `describe()` calls start commented out because you cannot have empty `describe()` calls. Be sure to uncomment them as you create tests within them.

### Craft the Service

As we start crafting the service, we will do so in a TDD fashion. First write a test that verifies a requirement, then create the code to make the test pass. Be sure to add each test within the appropriate `describe()` block. As we do this, we will be working primarily in `src/app/core/session-vault/session-vault.service.spec.ts` and `src/app/core/session-vault/session-vault.service.ts`, so be sure to have those open in your editor.

#### Set

The `set()` method is called at login and stores the session via the Capacitor Preferences plugin.

```typescript
describe('set', () => {
  it('saves the session in preferences', async () => {
    spyOn(Preferences, 'set');
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.org',
      },
      token: '19940059fkkf039',
    };
    await service.set(session);
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'auth-session',
      value: JSON.stringify(session),
    });
  });
});
```

The code for this in the service class then looks like the following:

```TypeScript
  async set(session: Session): Promise<void> {
    await Preferences.set({ key: this.key, value: JSON.stringify(session) });
  }
```

Be sure to import `Preferences` from `@capacitor/preferences` at the top of your file.

#### Get Session

The `get()` method is used to get the session via the Capacitor Preferences plugin.

```typescript
describe('get session', () => {
  it('gets the session from preferences', async () => {
    spyOn(Preferences, 'get').and.returnValue(Promise.resolve({ value: null }));
    await service.get();
    expect(Preferences.get).toHaveBeenCalledTimes(1);
    expect(Preferences.get).toHaveBeenCalledWith({
      key: 'auth-session',
    });
  });

  describe('with a session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.org',
      },
      token: '19940059fkkf039',
    };
    beforeEach(() => {
      spyOn(Preferences, 'get').and.returnValue(Promise.resolve({ value: JSON.stringify(session) }));
    });

    it('resolves the session', async () => {
      expect(await service.get()).toEqual(session);
    });
  });

  describe('without a session', () => {
    beforeEach(() => {
      spyOn(Preferences, 'get').and.returnValue(Promise.resolve({ value: null }));
    });

    it('resolves null', async () => {
      expect(await service.get()).toEqual(null);
    });
  });
});
```

**Challenge:** write the code for this method based on the requirements that are defined by this set of tests. Check with the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Preferences Plugin</a> docs if you get stuck.

#### Clear

The `clear()` method is called at logout and removes the session from preferences.

```typescript
describe('clear', () => {
  it('clears the preferences', async () => {
    spyOn(Preferences, 'remove');
    await service.clear();
    expect(Preferences.remove).toHaveBeenCalledTimes(1);
    expect(Preferences.remove).toHaveBeenCalledWith({
      key: 'auth-session',
    });
  });
});
```

**Challenge:** write the code for this method. Check with the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Preferences API</a> docs if you get stuck.

## Session Vault Service Mock Factory

Eventually, we will want to use this service in other modules. In order to maintain isolation in those other modules, this also means that we will need to be able to easily mock this service. One easy to use method to do this is to create a mock factory side-by-side with the service.

Add a `src/app/core/session-vault/session-vault.service.mock.ts` file and inside of it create a factory used to build mock `SessionVaultService` objects for testing.

```typescript
export const createSessionVaultServiceMock = () =>
  jasmine.createSpyObj('SessionVaultService', {
    set: Promise.resolve(),
    get: Promise.resolve(),
    clear: Promise.resolve(),
  });
```

Also create a `testing` barrel file called `src/app/core/testing.ts` that will eventually contain all of the `core` mock factories.

```typescript
export * from './session-vault/session-vault.service.mock';
```

## A Note on Security

We should be careful about what we are storing in local storage and then trusting. The token isn't too bad. If someone tampers with it, it is extremely likely that it will be invalid. The bigger issue would be if we were, for example, storing authorization information with the session and then trusting that to be correct. A user could easily update local storage in that case to, for example, give themselves admin access.

Basically:

- do not rely on locally stored key information, always get it from the backend
- the backend should _always_ assume the front end is compromised and not to be trusted

Here we are just storing the user's name, etc. and are not using anything other than the token for security purposes. As has already been noted, tampering with the key invalidates it, so it cannot be used to gain elevated access.

Our implementation still has an issue where someone _could_ gain access to the device and steal the authentication token. Protecting yourself from that scenario is where using a product like <a href="https://ionic.io/docs/identity-vault" _target="blank">Identity Vault</a> comes in to play. We are not ready for that yet, but we _have_ architected our application such that we can easily replace `@capacitor/preferences` with something else in the future if we decide to. This is why we are so careful to separate our concerns and make sure every module within our system has a single responsibility.

## Conclusion

You have created a service that will store the information about the currently logged in user, but we have not provided a way for the user to actually authenticate with the API. That is what we will talk about next.
