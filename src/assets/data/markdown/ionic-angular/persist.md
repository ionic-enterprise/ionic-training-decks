# Lab: Persist the User Session

In this lab you will learn how to:

- Create an Angular service
- Use the Capacitor Storage API
- Add more actions to our store

## Create the Session Vault Service

It is now time to get down to the main subject here and create an Angular service that will store information about the currently authenticated user.

```bash
$ ionic generate service core/session-vault/session-vault
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

  async set(session: Session): Promise<void> {}

  async get(): Promise<Session> {
    return null;
  }

  async clear(): Promise<void> {}
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

  describe('set', () => {});

  describe('get', () => {});

  describe('clear', () => {});
});
```

### Craft the Service

As we start crafting the service, we will do so in a TDD fashion. First write a test that verifies a requirment, then create the code to make the test pass. Be sure to add each test within the appropriate `describe()` block.

#### Set

The `set()` method is used to store the session via the Capacitor Storage plugin.

```typescript
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
  await service.set(session);
  expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.set).toHaveBeenCalledWith({
    key: 'auth-session',
    value: JSON.stringify(session),
  });
});
```

The code for this then looks like the following:

```TypeScript
  async set(session: Session): Promise<void> {
    const { Storage } = Plugins;
    await Storage.set({ key: this.key, value: JSON.stringify(session) });
  }
```

Be sure to import `Plugins` from `@capacitor/core` at the top of your file.

#### Get

The `get()` method is used to get the session via the Capacitor Storage plugin.

```typescript
it('gets the session from storage', async () => {
  (Plugins.Storage.get as any).and.returnValue(
    Promise.resolve({ value: null }),
  );
  await service.get();
  expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.get).toHaveBeenCalledWith({
    key: 'auth-session',
  });
});

it('resolves the session', async () => {
  const session: Session = {
    user: {
      id: 42,
      firstName: 'Joe',
      lastName: 'Tester',
      email: 'test@test.org',
    },
    token: '19940059fkkf039',
  };
  (Plugins.Storage.get as any).and.returnValue(
    Promise.resolve({ value: JSON.stringify(session) }),
  );
  expect(await service.get()).toEqual(session);
});
```

**Challenge:** write the code for this method. Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

#### Clear

The clear() method is used to remove the session from storage.

```typescript
it('clears the storage', async () => {
  await service.clear();
  expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.remove).toHaveBeenCalledWith({ key: 'auth-session' });
});
```

**Challenge:** write the code for this method. Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

## Session Vault Service Mock Factory

Add a `src/app/core/session-vault/session-vault.service.mock.ts` file and inside of it create a factory used to build mock SessionVaultService objects for testing.

```typescript
export function createSessionVaultServiceMock() {
  return jasmine.createSpyObj('SessionVaultService', {
    set: Promise.resolve(),
    get: Promise.resolve(),
    clear: Promise.resolve(),
  });
}
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
- upon application init, get the session from storage

### Handle Login

Let's start with the easy one. We need to save the session when the login succeeds and do nothing when it fails. The first thing to do is create tests in `src/app/store/effects/auth/auth.effects.spec.ts` that express these requirements:

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
          expect(sessionVaultService.set).toHaveBeenCalledTimes(1);
          expect(sessionVaultService.set).toHaveBeenCalledWith({
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
    });
...
    describe('on login failure', () => {
...
      it('does not save the session', done => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.set).not.toHaveBeenCalled();
          done();
        });
      });
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
          tap(session => this.sessionVault.set(session)),
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

### Handle Initialization

We are now persisting the session on login, but we also need to read it on application startup. Let's do that now. We will need to add some actions, then update the reducer to handle them. Finally, we need an effect to perform our asynchronous loading action.

#### Actions

Remember that actions represent events in our application. In this case the events will be initialization of the application as well as completing the initialization with or without a session. Add the following to `src/app/store/actions.ts`

```TypeScript
...
  Initialize = '[Application] initialize auth',
  InitializedWithRestoredSession = '[Auth API] initialized with restored session',
  InitializedWithoutSession = '[Auth API] initialized without session',
...
export const initialize = createAction(ActionTypes.Initialize);
export const initializedWithRestoredSession = createAction(
  ActionTypes.InitializedWithRestoredSession,
  props<{ session: Session }>(),
);
export const initializedWithoutSession = createAction(
  ActionTypes.InitializedWithoutSession,
);
...
```

#### Reducer Update

The reducer needs to handle these actions in a very similar manner to how it handles the `Login` and `LoginSuccess` actions, so we will test that out in `src/app/store/reducers/auth/auth.reducer.spec.ts` (remember to import the two new actions):

```TypeScript
describe(ActionTypes.Initialize, () => {
  it('sets the loading flag and clears other data', () => {
    const action = initialize();
    expect(
      reducer(
        {
          loading: false,
          errorMessage: 'Invalid Email or Password',
        },
        action,
      ),
    ).toEqual({
      loading: true,
      errorMessage: '',
    });
  });
});

describe(ActionTypes.InitializedWithRestoredSession, () => {
  it('clears the loading flag and sets the session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      },
      token: 'Imalittletoken',
    };
    const action = initializedWithRestoredSession({ session });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      session,
      loading: false,
      errorMessage: '',
    });
  });
});

describe(ActionTypes.InitializedWithoutSession, () => {
  it('clears the loading flag', () => {
    const action = initializedWithoutSession();
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      loading: false,
      errorMessage: '',
    });
  });
});
```

The code to satisfy that is straight forward:

```TypeScript
  on(Actions.initialize, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.initializedWithRestoredSession, (state, { session }) => ({
    ...state,
    session,
    loading: false,
  })),
  on(Actions.initializedWithoutSession, state => ({
    ...state,
    loading: false,
  })),
```

#### Effects

The last pieces are the effects. The first one listens for the `Actions.Initialize` action, performs the required action, and dispatches the `InitializeSuccess` when it has completed it. The second listens for `InitializeSuccess` and navigates to the login page if we have no session.

##### The `initialize$` Effect

First we test (`src/app/store/effects/auth/auth.effects.spec.ts`). Be sure to update your import statements accordingly.

```TypeScript
  describe('initialize$', () => {
    [
      {
        desc: 'with a stored session',
        value: {
          user: {
            id: 73,
            firstName: 'Ken',
            lastName: 'Sodemann',
            email: 'test@test.com',
          },
          token: '314159',
        },
      },
      {
        desc: 'without a stored session',
        value: undefined,
      },
    ].forEach(test => {
      describe(test.desc, () => {
        beforeEach(() => {
          const sessionVaultService = TestBed.inject(SessionVaultService);
          (sessionVaultService.get as any).and.returnValue(
            Promise.resolve(test.value),
          );
        });

        it('gets the session from storage', done => {
          const sessionVaultService = TestBed.inject(SessionVaultService);
          actions$ = of(initialize());
          effects.initialize$.subscribe(() => {
            expect(sessionVaultService.get).toHaveBeenCalledTimes(1);
            done();
          });
        });

        it('dispatches the proper initialized event', done => {
          actions$ = of(initialize());
          effects.initialize$.subscribe(action => {
            if (test.value) {
              expect(action).toEqual({
                type: ActionTypes.InitializedWithRestoredSession,
                session: test.value,
              });
            } else {
              expect(action).toEqual({
                type: ActionTypes.InitializedWithoutSession,
              });
            }
            done();
          });
        });
      });
    });
  });
```

Notide the array of values and the `forEach`. Sometimes it is desirable to run the same test cases over multiple sets of data. This is one technique that can be used to accomplish this.

Then there is the code for this. Again it is up to use to update your import statements at the top of the file.

```TypeScript
  initialize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(initialize),
      exhaustMap(() =>
        from(this.sessionVault.get()).pipe(
          map(session =>
            session
              ? initializedWithRestoredSession({ session })
              : initializedWithoutSession(),
          ),
        ),
      ),
    ),
  );
```

##### The `initializedWithoutSession` Effect

When we initialize without a session, we should direct the user to the login screen. Again, we will first write the tests:

```TypeScript
  describe('initializedWithoutSession$', () => {
    it('navigats to the login page', done => {
      const navController = TestBed.inject(NavController);
      actions$ = of(initializedWithoutSession());
      effects.initializedWithoutSession$.subscribe(() => {
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
        done();
      });
    });
  });
```

**Challenge:** switch over to the auth effects code and write the code for this effect. Have a look at the `loginSuccess$` effect. This one will be very similar. Check at the end of this page if you get stuck, but try to finish this up without peeking.

#### APP_INITIALIZER

The `APP_INITIALIZER` defines functions that are injected at startup and executed during the application bootstrap process. We would like to have our auth state initialized during startup. Add the following to the `providers` list in `AppModule`.

```TypeScript
    {
      provide: APP_INITIALIZER,
      useFactory: (store: Store<State>) => () => store.dispatch(initialize()),
      deps: [Store],
      multi: true,
    },
```

You will have to update some of the imports to get this to compile:

```TypeScript
import { APP_INITIALIZER, NgModule } from '@angular/core';
...
import { Store, StoreModule } from '@ngrx/store';
...
import { reducers, metaReducers, State } from './store';
...
import { initialize } from './store/actions';
```

## A Note on Security

We should be careful about what we are storing in local storage and then trusting. The token isn't bad. If someone tampers with it, it is extrememly likely that it will be invalid. The bigger issue would be if we were, for example, storing authorization information with the session and then trusting that to be correct. A user could easily update local storage in that case to, for example, give themselves admin access.

Basically:

- do not rely on locally stored information, always get it from the backend
- the backend should _always_ assume the front end is compromised and not to be trusted

Here we are just storing the user's name, etc. and are not using anything other than the token for security puroses. As has already been noted, tampering with the key invalidates it, so it cannot be used to gain elevated access.

## Conclusion

You have created a service that will store the information about the currently logged in user, but we have not provided a way for the user to actually authenticate with the API. That is what we will talk about after a quick coding challenge.

In case you need to peek, here is the implementation of the `initializeSuccess$` effect:

```TypeScript
  initializedWithoutSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(initializedWithoutSession),
        tap(() => this.navController.navigateRoot(['/', 'login'])),
      ),
    { dispatch: false },
  );
```
