# Lab: Persist the User Session

In this lab you will learn how to:

- Create an Angular service
- Use the Capacitor Storage API
- Add more actions to our store

## Create the Session Vault Service

It is now time to get down to the main subject here and create an Angular service that will store information about the currently authenticated user.

```bash
ionic generate service core/session-vault/session-vault
```

Create `src/app/core/index.ts`. This is the barrel file for all of our `core` services.

```typescript
export * from './session-vault/session-vault.service';
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

  async login(session: Session): Promise<void> {}

  async restoreSession(): Promise<Session> {
    return null;
  }

  async logout(): Promise<void> {}
}
```

### Test Setup

Now that we have the interface for the service worked out, we can fill out a skeleton of the test.

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';

import { Session } from '@app/models';
import { SessionVaultService } from './session-vault.service';

describe('SessionVaultService', () => {
  let service: SessionVaultService;
  let originalStorage: any;

  beforeEach(() => {
    originalStorage = Plugins.Storage;
    Plugins.Storage = jasmine.createSpyObj('Storage', {
      get: Promise.resolve(),
      set: Promise.resolve(),
      remove: Promise.resolve()
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionVaultService);
  });

  afterEach(() => {
    Plugins.Storage = originalStorage;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {});

  describe('restoreSession', () => {});

  describe('logout', () => {});
});
```

### Craft the Service

As we start crafting the service, we will do so in a TDD fashion. First write a test that verifies a requirment, then create the code to make the test pass. Be sure to add each test within the appropriate `describe()` block.

#### Login

The `login()` method is called at login and stores the session via the Capacitor Storage plugin.

```typescript
describe('login', () => {
  it('saves the session in storage', async () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.org',
      },
      token: '19940059fkkf039',
    };
    await service.login(session);
    expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.set).toHaveBeenCalledWith({
      key: 'auth-session',
      value: JSON.stringify(session),
    });
  });
});
```

The code for this then looks like the following:

```TypeScript
  async login(session: Session): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Storage } = Plugins;
    await Storage.set({ key: this.key, value: JSON.stringify(session) });
  }
```

Be sure to import `Plugins` from `@capacitor/core` at the top of your file.

#### Restore Session

The `restoreSession()` method is used to get the session via the Capacitor Storage plugin.

```typescript
describe('restore session', () => {
  it('gets the session from storage', async () => {
    (Plugins.Storage.get as any).and.returnValue(
      Promise.resolve({ value: null }),
    );
    await service.restoreSession();
    expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.get).toHaveBeenCalledWith({
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
      (Plugins.Storage.get as any).and.returnValue(
        Promise.resolve({ value: JSON.stringify(session) }),
      );
    });

    it('resolves the session', async () => {
      expect(await service.restoreSession()).toEqual(session);
    });
  });

  describe('without a session', () => {
    beforeEach(() => {
      (Plugins.Storage.get as any).and.returnValue(
        Promise.resolve({ value: null }),
      );
    });

    it('resolves without a session', async () => {
      expect(await service.restoreSession()).toEqual(null);
    });
  });
});
```

**Challenge:** write the code for this method. Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

#### Logout

The Logout() method is called at logout and removes the session from storage.

```typescript
describe('logout', () => {
  it('clears the storage', async () => {
    await service.logout();
    expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.remove).toHaveBeenCalledWith({
      key: 'auth-session',
    });
  });
});
```

**Challenge:** write the code for this method. Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

## Session Vault Service Mock Factory

Add a `src/app/core/session-vault/session-vault.service.mock.ts` file and inside of it create a factory used to build mock `SessionVaultService` objects for testing.

```typescript
export const createSessionVaultServiceMock = () =>
  jasmine.createSpyObj('SessionVaultService', {
    login: Promise.resolve(),
    restoreSession: Promise.resolve(),
    logout: Promise.resolve(),
  });
```

Also create a `testing` barrel file called `src/app/core/testing.ts` that will eventually contain all of the `core` mock factories.

```typescript
export * from './session-vault/session-vault.service.mock';
```

Try an `npm run build` and notice that it fails because it is trying to bring the mock in and cannot fine Jasmine. The build should not bring in any of our testing stuff. The `tsconfig.app.json` will need to be updated to ignore the mocks and the testing barrel file in the app builds.

```typescript
  "exclude": [
    "src/**/environment.prod.ts",
    "src/**/*.mock.ts",
    "src/**/*.spec.ts",
    "src/**/testing.ts",
    "src/**/test.ts"
  ]
```

## Integrate with the Store

There are two tasks we currently need to perform within the store:

- upon login, save the session
- when the session is restored, dispatch an action to update the state

### Handle Login

Let's start with the easy one. We need to save the session when the login succeeds and do nothing when it fails. The first thing to do is create tests in `src/app/store/effects/auth.effects.spec.ts` that express these requirements:

```TypeScript
...
import { Session } from '@app/models';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
...
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: NavController, useFactory: createNavControllerMock },
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });
...
  describe('login$', () => {
    describe('on login success', () => {
...
      it('saves the session', done => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'test' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.login).toHaveBeenCalledTimes(1);
          expect(sessionVaultService.login).toHaveBeenCalledWith({
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
            token: '314159',
          });
          done();
        });
      });
...
    describe('on login failure', () => {
...
      it('does not save the session', done => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.login).not.toHaveBeenCalled();
          done();
        });
      });
...
```

In the code, we can add a `tap()` to our observable pipeline that will fulfill these requirements:

```TypeScript
...
import { SessionVaultService } from '@app/core';
...
        from(this.fakeLogin(action.email, action.password)).pipe(
          tap(session => this.sessionVault.login(session)),
          map(session => loginSuccess({ session })),
          catchError(error =>
            of(loginFailure({ errorMessage: error.message })),
          ),
        ),
...
  constructor(
    private actions$: Actions,
    private navController: NavController,
    private sessionVault: SessionVaultService,
  ) {}
...
```

### Handle Session Restore

When the session is restored, we need to dispatch an action to the store in order to update the state with the session. First add the action in `src/app/store/actions.js`:

```TypeScript
export const sessionRestored = createAction(
  '[Vault API] session restored',
  props<{ session: Session }>(),
);
```

The reducer (`src/app/store/reducers/auth.reducer.*`) should handle this action by setting the session in the state.

```TypeScript
describe('Session Restored', () => {
  it('sets the session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      },
      token: 'Imalittletoken',
    };
    const action = sessionRestored({ session });
    expect(reducer({ loading: false, errorMessage: '' }, action)).toEqual({
      session,
      loading: false,
      errorMessage: '',
    });
  });
});
```

```TypeScript
  on(Actions.sessionRestored, (state, { session }) => ({
    ...state,
    session,
  })),
```

Finally, modify the `SessionVaultService` to dispatch this action whenever a session is restored.

```TypeScript
...
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
...
import { sessionRestored } from '@app/store/actions';

...
    TestBed.configureTestingModule({
      providers: [provideMockStore()],
    });
...

  describe('restore session', () => {
    ...

    describe('with a session', () => {
      ...
      it('dispatches session restored', async () => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        await service.restoreSession();
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(
          sessionRestored({ session }),
        );
      });

...

    describe('without a session', () => {
      ...
      it('does not dispatch session restored', async () => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        await service.restoreSession();
        expect(store.dispatch).not.toHaveBeenCalled();
      });
...
```

The code to accomplish this while still satisfying the other tests looks like this:

```TypeScript
...
import { Store } from '@ngrx/store';
import { sessionRestored } from '@app/store/actions';
...
import { State } from '@app/store';
...

  constructor(private store: Store<State>) {}

...

  async restoreSession(): Promise<Session> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Storage } = Plugins;
    const { value } = await Storage.get({ key: this.key });
    const session = JSON.parse(value);

    if (session) {
      this.store.dispatch(sessionRestored({ session }));
    }

    return session;
  }

...
```

## A Note on Security

We should be careful about what we are storing in local storage and then trusting. The token isn't bad. If someone tampers with it, it is extrememly likely that it will be invalid. The bigger issue would be if we were, for example, storing authorization information with the session and then trusting that to be correct. A user could easily update local storage in that case to, for example, give themselves admin access.

Basically:

- do not rely on locally stored information, always get it from the backend
- the backend should _always_ assume the front end is compromised and not to be trusted

Here we are just storing the user's name, etc. and are not using anything other than the token for security puroses. As has already been noted, tampering with the key invalidates it, so it cannot be used to gain elevated access.

## Conclusion

You have created a service that will store the information about the currently logged in user, but we have not provided a way for the user to actually authenticate with the API. That is what we will talk about after a quick coding challenge.
