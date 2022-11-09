# Lab: Application State

In this lab, we will begin to learn how to use NgRX to manage our application's state.

## Installation

The first thing that we need to do is install <a href="https://ngrx.io/">NgRX</a>.

```bash
npx ng add @ngrx/store@latest
```

**Note:** You may need to make sure the `eslint` related dependencies are up to date.

When asked what ESLint configuration to use, select "recommended".

## Boilerplate Setup

Create the following folders, either from the CLI or fromm your favorite IDE:

```bash
mkdir src/app/store src/app/store/effects src/app/store/reducers src/app/store/selectors
```

Create a `src/app/store/reducers/index.ts` file with an empty State definition. This is where we will slowly build up the definition of our application state as well as the reducers that act upon it. We _could_ do that directly in this file, but we will not. Rather we will use a very modular format as we go.

```TypeScript
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '@env/environment';

export interface State {}

export const reducers: ActionReducerMap<State> = {};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];
```

Create a barrel file for the store as a whole (`src/app/store/index.ts`). For now it just needs to export the reducers.

```TypeScript
export * from './reducers';
```

Finally, import the item from the store in the `AppModule` (`src/app/app.module.ts`). The `StoreModule` should already be listed within the imports for the NgModule, but it has none of the configuration filled in. We will fill it in with our (currently empty) reducers.

```TypeScript
...
import { reducers, metaReducers } from './store';

@NgModule({
  ..
  imports: [
    ...
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
  ],
...
```

## Models

Before we start shaping the state, we need to create some models in order to define the shape of our session data:

`src/app/models/user.ts`:

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

`src/app/models/session.ts`:

```TypeScript
import { User } from './user';

export interface Session {
  user: User;
  token: string;
}
```

Be sure to update the `src/models/index.ts` file.

## Actions

Let's think about the actions our application will take with regard to authentication, as well as which part of our application will take the action.

- Perform Login - Taken by the login screen upon user pressing the Sign In button
- Login Succeeded - Taken by the Authentication API (does not exist yet) when the login succeeds
- Login Failed - Taken by the Authentication API (does not exist yet) when the login fails

- Perform Logout - Taken by the tea page (for now) upon user pressing a logout button (does not exist yet)
- Login Succeeded - Taken by the Authentication API (does not exist yet) when the login succeeds
- Login Failed - Taken by the Authentication API (does not exist yet) when the login fails

Most of the actors do not exist yet, but we know what actions they will take once they do exist, so let's code that up in our store. This just defines the actions that other parts of our app can "dispatch". The actions do not, in themselves, actually _do_ anything.

Create a `src/app/store/actions.ts` file with the following contents:

```TypeScript
import { createAction, props } from '@ngrx/store';
import { Session } from '@app/models';

export const login = createAction(
  '[Login Page] login',
  props<{ email: string; password: string }>(),
);
export const loginSuccess = createAction(
  '[Auth API] login success',
  props<{ session: Session }>(),
);
export const loginFailure = createAction(
  '[Auth API] login failure',
  props<{ errorMessage: string }>(),
);

export const logout = createAction('[Tea Page] logout');
export const logoutSuccess = createAction('[Auth API] logout success');
export const logoutFailure = createAction(
  '[Auth API] logout failure',
  props<{ errorMessage: string }>(),
);
```

As you can see, this is just registering the actions as well as defining what their payload will be if for actions that have a payload (see the `login` action).

For now, we will have a single file that defines all of our actions. We may want to split that out at some point in the future, but for now a single file will be just fine. Remember that actions are based on events within our application, so if we do get to a point of breaking them in to multiple files, it makes more sense to define them around the various parts of our application, which may or may correspond to various slices of the state.

## Reducers

A reducer is a pure synchronous function that listens for actions to be dispatched and then modifies the state accordingly. A reducer should also be the only function that modifies its portion of the state. For this reason, I like to define the state and the reducer that acts upon it in the same file.

Being pure synchronous functions also make them easy to test.

Let's start with a boiler plate test in `src/app/store/reducers/auth.reducer.spec.ts`:

```TypeScript
import { initialState, reducer } from './auth.reducer';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutFailure,
  logoutSuccess,
} from '@app/store/actions';
import { Session } from '@app/models';

it('returns the default state', () => {
  expect(reducer(undefined, { type: 'NOOP' })).toEqual(initialState);
});
```

We can then define our state our states shape and initial contents in `src/app/store/reducers/auth.reducer.ts`

```TypeScript
import { createReducer, on } from '@ngrx/store';
import * as Actions from '@app/store/actions';
import { Session } from '@app/models';

export interface AuthState {
  session?: Session;
  loading: boolean;
  errorMessage: string;
}

export const initialState: AuthState = {
  loading: false,
  errorMessage: '',
};

export const reducer = createReducer(
  initialState,
);
```

The reducer listens for actions and then modifies the state accordingly. So let's start with our login action and figure out how it should affect the state. This action is taken by the login page, and it informs the store that we are initiating the login process. So all it needs to do is set the loading flag to true and clear any existing error message from a previous attempt (initiating the login process, which is asynchronous and thus not appropriate for a reducer, will be done by something called an `effect` and we will get to that later).

We first express that requirement in our test. Notice that the reducer takes arguments consisting of the current state and the action being performed.

```TypeScript
describe('Login', () => {
  it('sets the loading flag and clears other data', () => {
    const action = login({ email: 'test@testy.com', password: 'mysecret' });
    expect(
      reducer(
        {
          loading: false,
          errorMessage: 'Invalid Email or Password',
        },
        action
      )
    ).toEqual({
      loading: true,
      errorMessage: '',
    });
  });
});
```

Then we express it in our code by adding a listener for that action to the reducer in the `createReducer()` call.

```TypeScript
export const reducer = createReducer(
  initialState,
  on(Actions.login, (state): AuthState => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
);
```

So, on the `Actions.login` action, we take our current state and transform it such that the `loading` property is set to `true` and the `errorMessage` property is set to an empty string. All other properties in our state stay the way the are.

The `LoginSuccess` and `LoginFailure` actions will be dispatched by the `effect` that handles the login API call. Neither the `effect` nor the API service exist yet, but we can still add a handler for these actions to our reducer since we know how they should affect the state.

```TypeScript
describe('Login Success', () => {
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
    const action = loginSuccess({ session });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      session,
      loading: false,
      errorMessage: '',
    });
  });
});

describe('Login Failure', () => {
  it('clears the loading flag and sets the error', () => {
    const action = loginFailure({
      errorMessage: 'There was a failure, it was a mess',
    });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      loading: false,
      errorMessage: 'There was a failure, it was a mess',
    });
  });
});
```

Then the code to make this work (added to the `createReducer()`, just like the last time):

```TypeScript
  on(Actions.loginSuccess, (state, { session }): AuthState => ({
    ...state,
    session,
    loading: false,
  })),
  on(Actions.loginFailure, (state, { errorMessage }): AuthState => ({
    ...state,
    loading: false,
    errorMessage,
  })),
```

Notice that the payload of the action (if there is a payload) is also passed to the handler (`{ session }`, `{ errorMessage }`). The `login` action has a payload as well, but we didn't use it in the handler because the reducer doesn't need the payload. In the case of the login action, the `effect` will need to use the payload.

Finally, we have the logout actions. I will give you the tests and let you write the action hooks in the reducer. Note that I grouped these tests in their own `describe()`. This is just so I could define the session that is used once rather than in each test.

```TypeScript
describe('logout actions', () => {
  let session: Session;
  beforeEach(
    () =>
      (session = {
        user: {
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'solong@thanksforthefish.com',
        },
        token: 'Imalittletoken',
      }),
  );

  describe('Logout', () => {
    it('sets the loading flag and clears the error message', () => {
      const action = logout();
      expect(
        reducer(
          {
            session,
            loading: false,
            errorMessage: 'this is useless information',
          },
          action,
        ),
      ).toEqual({
        session,
        loading: true,
        errorMessage: '',
      });
    });
  });

  describe('Logout Success', () => {
    it('clears the loading flag and the session', () => {
      const action = logoutSuccess();
      expect(
        reducer({ session, loading: true, errorMessage: '' }, action),
      ).toEqual({
        loading: false,
        errorMessage: '',
      });
    });
  });

  describe('Logout Failure', () => {
    it('clears the loading flag and sets the error', () => {
      const action = logoutFailure({
        errorMessage: 'There was a failure, it was a mess',
      });
      expect(
        reducer({ session, loading: true, errorMessage: '' }, action),
      ).toEqual({
        session,
        loading: false,
        errorMessage: 'There was a failure, it was a mess',
      });
    });
  });
});
```

**Challenge:** add the hooks for these actions to the reducer, like we did for the login related actions. Refer to the login actions as a guide. If you really get stuck, example implementations are included at the end of this section.

**Hint:** for the `LogoutSuccess` we need to remove the session. That code looks like this:

```TypeScript
  on(Actions.logoutSuccess, (state): AuthState => {
    const { session, ...newState } = {
      ...state,
      loading: false,
    };
    return newState;
  }),
```

Once we are done, we need to update the main reducers file (`src/app/store/reducers/index.ts`) to include our `auth` state as well as the reducer for it:

```TypeScript
import { AuthState, reducer as authReducer } from './auth.reducer';

export interface State {
  auth: AuthState
}

export const reducers: ActionReducerMap<State> = {
  auth: authReducer
};
```

## Selectors

Selectors are used to get data from the state. These are generally straight forward enough that we will not bother with tests. Here are the selectors we will start with for the `auth` state. Put this in `src/app/store/selectors/auth.selectors.ts`

```TypeScript
import { createSelector } from '@ngrx/store';
import { State } from '@app/store';
import { AuthState } from '@app/store/reducers/auth.reducer';

export const selectAuth = (state: State) => state.auth;
export const selectAuthToken = createSelector(selectAuth, (state: AuthState) => state.session?.token);
export const selectAuthLoading = createSelector(selectAuth, (state: AuthState) => state.loading);
export const selectAuthErrorMessage = createSelector(selectAuth, (state: AuthState) => state.errorMessage);
```

We should also create a `src/app/store/selectors/index.ts` file and export the `auth` selectors from it:

```TypeScript
export * from './auth.selectors';
```

And then export the selectors from the `src/app/store/index.ts` file:

```TypeScript
export * from './reducers';
export * from './selectors';
```

The reducers and the selectors are the only things we will export from there.

## Effects

Effects listen for actions, and when those actions are dispatched, perform specific tasks. These tasks are usually asynchronous. The effect will typically dispatch other actions when the task(s) complete.

The most common use case for us will be to make HTTP requests to either fetch or save data.

### Install

Use `ng add` to install the NgRX Effects library. This will also update our `AppModule` for us, though we will still need to register our effects once we create them.

```bash
npx ng add @ngrx/effects@latest
```

### Create the Auth Effects

Under `src/app/store/effects` create the following files:

**`auth.effects.spec.ts`**

```TypeScript
import { TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';
import { provideMockActions } from '@ngrx/effects/testing';
import { createNavControllerMock } from '@test/mocks';
import { Observable } from 'rxjs';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
```

**`auth.effects.ts`**

```TypeScript
import { Injectable } from '@angular/core';
import { login, loginSuccess } from '@app/store/actions';
import { NavController } from '@ionic/angular';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(action => of(null)),
    ),
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      exhaustMap(action => of(null)),
    ),
  );

  constructor(private actions$: Actions, private navController: NavController) {}
}
```

Don't worry too much about the `injectable()` decorator. We can talk about that more when we talk about services. All you really have to know is that it provides some meta-data for Angular's dependency injection engine.

Have a look at the `$login` effect, though. This is the basic structure for an effect:

- call `createEffect()`
- the `Actions` service provides a stream of actions
- actions are filtered using the `ofType` operator
- the action is then flattened into another observable, which we will expand later

We'll create a fake login that will resolve a fake session whenever the password is "test", and will reject with a message otherwise. This will allow us to reasonably model a login for now with our tests. Here is the fake login to add to the effects class:

```TypeScript
...
import { Session } from '@app/models';
...

  private fakeLogin(email: string, password: string): Promise<Session> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (password === 'test') {
          resolve({
            user: { id: 73, firstName: 'Ken', lastName: 'Sodemann', email },
            token: '314159',
          });
        } else {
          reject(new Error('Invalid Username or Password'));
        }
      }),
    );
  }
```

#### The `login$` Effect

These tests define how the effect itself should work. Basically, the effect should do something and then return an Observable with a payload that is the resulting action to be dispatched to the store.

```TypeScript
...
import { Observable, of } from 'rxjs';

import { login } from '@app/store/actions';
...

  describe('login$', () => {
    describe('on login success', () => {
      it('dispatches login success', done => {
        actions$ = of(login({ email: 'test@test.com', password: 'test' }));
        effects.login$.subscribe(action => {
          expect(action).toEqual({
            type: '[Auth API] login success',
            session: {
              user: {
                id: 73,
                firstName: 'Ken',
                lastName: 'Sodemann',
                email: 'test@test.com',
              },
              token: '314159',
            },
          });
          done();
        });
      });
    });

    describe('on login failure', () => {
      it('dispatches login error', done => {
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(action => {
          expect(action).toEqual({
            type: '[Auth API] login failure',
            errorMessage: 'Invalid Username or Password',
          });
          done();
        });
      });
    });
  });
```

If the login action is performed with a good password, the effect should emit a LoginSuccess action with the session as a payload. If the login action is performed with a bad password, the effect should emit a LoginFailure action with the error message as a payload. Let's see how we do this in the effect.

First we will need to update the imports a tad, adding a few more objects to some already existing imports:

```TypeScript
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';

import {
  login,
  loginFailure,
  loginSuccess,
} from '@app/store/actions';
```

Then the `exhaustMap` part of our `login$` effect goes from this:

```TypeScript
      exhaustMap(action => of(null)),
```

To this:

```TypeScript
      exhaustMap(action =>
        from(this.fakeLogin(action.email, action.password)).pipe(
          map(session => loginSuccess({ session })),
          catchError(error => of(loginFailure({ errorMessage: error.message }))),
        ),
      ),
```

This performs our fake login, creating an Observable out of the Promise. When that is emitted, it is mapped into a `loginSuccess()` action with the session as the payload. If an error occurs, we instead emit a `loginFailure()` action with the error message. Those are the actions that will then be dispatched to the store by `@ngrx/effects`.

#### The `loginSuccess$` Effect

Whenever we have a `loginSuccess`, we want to navigate to the root route. First the test.

```TypeScript
import {
  login,
  loginSuccess,
} from '@app/store/actions';
...
  describe('loginSuccess$', () => {
    it('navigates to the root path', done => {
      const navController = TestBed.inject(NavController);
      actions$ = of(
        loginSuccess({
          session: {
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
            token: '314159',
          },
        }),
      );
      effects.loginSuccess$.subscribe(() => {
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });
```

Then in the code:

```TypeScript
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
...
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => this.navController.navigateRoot(['/'])),
      ),
    { dispatch: false },
  );
```

Notice the `{ dispatch: false }`. This tells NgRX to not bother dispatching anything after this effect runs. Without this we would either dispatch the action we just handled, causing an infinite loop, or would have to create some kind of action that didn't really do anything, which is just extra work.

#### Linting

If you run `npm run lint` at this point, you will get a warning in this file:

```
> tea-taster@0.0.1 lint
> ng lint


Linting "app"...

/home/kensodemann/Projects/Training/tea-taster/src/app/store/effects/auth.effects.ts
  12:5  warning  The callback of `Effect` should be wrapped in a block statement  ngrx/prefer-effect-callback-in-block-statement
  25:7  warning  The callback of `Effect` should be wrapped in a block statement  ngrx/prefer-effect-callback-in-block-statement
```

If you fix that in the code, you will get a lint error about the block statement being unnecessary. We need to disable one or other other. I have chosen to disable the `ngrx/prefer-effect-callback-in-block-statement` rule globally by turning it off in the `.eslintrc.json` file where `plugin:ngrx/recommended` is brought in:

```json
{
  "files": ["*.ts"],
  "extends": ["plugin:ngrx/recommended"],
  "rules": {
    "ngrx/prefer-effect-callback-in-block-statement": "off"
  }
}
```

### Register the Effects

In order for the application to know about the effects, we first need to register them. As we add various modules to our store, we will want a barrel file to bring them all together, so add a `src/app/store/effects/index.ts` file with the following contents:

```TypeScript
export * from './auth.effects';
```

We will then import the `AuthEffects` in `src/app/app.module.ts` and register them with the `EffectsModule`:

```TypeScript
import { AuthEffects } from './store/effects';
...
    EffectsModule.forRoot([AuthEffects]),
```

## Hook it Up

### Login Page

In the login page, we want to do two things:

- dispatch the login
- display the error message when it is set

In a production app, we may also want to observe the loading value and a provide a loading indicator when that is `true`, but we will ignore that for now.

First we will update the test setup so we are able to inject the store into our page. To do this, we will use NgRX's testing utilities to construct a mock store.

```diff
--- a/src/app/login/login.page.spec.ts
+++ b/src/app/login/login.page.spec.ts
@@ -8,6 +8,8 @@ import {
 import { FormsModule } from '@angular/forms';
 import { By } from '@angular/platform-browser';
 import { IonicModule } from '@ionic/angular';
+import { provideMockStore } from '@ngrx/store/testing';
+import { AuthState, initialState } from '@app/store/reducers/auth.reducer';

 import { LoginPage } from './login.page';

@@ -20,6 +22,11 @@ describe('LoginPage', () => {
       TestBed.configureTestingModule({
         declarations: [LoginPage],
         imports: [FormsModule, IonicModule],
+        providers: [
+          provideMockStore<{ auth: AuthState }>({
+            initialState: { auth: initialState },
+          }),
+        ],
       }).compileComponents();

       fixture = TestBed.createComponent(LoginPage);
```

We can then inject the store into the page:

```diff
--- a/src/app/login/login.page.ts
+++ b/src/app/login/login.page.ts
@@ -1,4 +1,7 @@
 import { Component } from '@angular/core';
+import { Store } from '@ngrx/store';

 @Component({
   selector: 'app-login',
@@ -9,7 +12,7 @@ export class LoginPage {
   email: string;
   password: string;

-  constructor() {}
+  constructor(private store: Store) {}

   signIn() {
     console.log('signin', this.email, this.password);
```

#### Dispatch the Login

In order to test that the proper action is dispatched, we will need to:

- grab the store instance that the `TestBed` injected
- spy on the dispatch method in the store
- enter a username and password in the inputs
- click the sign on button
- verify the dispatch was called with the login action

First, we will need a couple of imports to our `src/app/login/login.page.spec.ts` file. `Store` so we can query the `TestBed` for our mock store, and `login` so we can verify that the `login` action was taken.

```TypeScript
import { Store } from '@ngrx/store';
import { login } from '@app/store/actions';
```

The testing steps outlined above state that we need to click the sign on button. We don't have a function for that, so let's create one down by the `setInput()` function we already have:

```TypeScript
const click = (button: HTMLElement) => {
  const event = new Event('click');
  button.dispatchEvent(event);
  fixture.detectChanges();
}
```

Finally, we can create the test that verifies everything. This test belongs within the `describe()` for the sign on button.

```TypeScript
    it('dispatches login on click', () => {
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'MyPassW0rd');
      click(button);
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        login({ email: 'test@test.com', password: 'MyPassW0rd' }),
      );
    });
```

The changes to the login page's class are straight forward:

```diff
...
+import { login } from '@app/store/actions';
...
   signIn() {
-    console.log('signin', this.email, this.password);
+    this.store.dispatch(login({ email: this.email, password: this.password }));
   }
```

#### Display the Error Message

So far, we have let the store know that a login action has occurred. But how will the page know the results of that login? It will know that information by observing specific portions of the overall application state that it is interested in. We will start by observing the authentication related error messages.

The following test uses some NgRX utilities to mock the selector, sets its value, and verifies that our page reacts correctly. This test belongs inside of the "error messages" describe block in `src/app/login/login.page.spec.ts`.

```TypeScript
...
import { MockStore, provideMockStore } from '@ngrx/store/testing';
...
import { selectAuthErrorMessage } from '@app/store';
...
    it('displays the auth state error message if there is one', () => {
      const store = TestBed.inject(Store) as MockStore;
      const mockErrorMessageSelector = store.overrideSelector(
        selectAuthErrorMessage,
        '',
      );
      store.refreshState();
      fixture.detectChanges();
      expect(errorDiv.textContent.trim()).toEqual('');
      mockErrorMessageSelector.setResult('Invalid Email or Password');
      store.refreshState();
      fixture.detectChanges();
      expect(errorDiv.textContent.trim()).toEqual('Invalid Email or Password');
      mockErrorMessageSelector.setResult('');
      store.refreshState();
      fixture.detectChanges();
      expect(errorDiv.textContent.trim()).toEqual('');
    });
```

In the code, we then need to observe the selector:

```TypeScript
--- a/src/app/login/login.page.ts
+++ b/src/app/login/login.page.ts
@@ -1,7 +1,8 @@
-import { Component } from '@angular/core';
+import { Component, OnInit } from '@angular/core';
 import { Store } from '@ngrx/store';
+import { Observable } from 'rxjs';

-import { State } from '@app/store';
+import { selectAuthErrorMessage, State } from '@app/store';
 import { login } from '@app/store/actions';

 @Component({
@@ -9,12 +10,18 @@ import { login } from '@app/store/actions';
   templateUrl: './login.page.html',
   styleUrls: ['./login.page.scss'],
 })
-export class LoginPage {
+export class LoginPage implements OnInit {
   email: string;
   password: string;

+  errorMessage$: Observable<string>;
+
   constructor(private store: Store<State>) {}

+  ngOnInit() {
+    this.errorMessage$ = this.store.select(selectAuthErrorMessage);
+  }
+
   signIn() {
     this.store.dispatch(login({ email: this.email, password: this.password }));
   }
```

The following is added to the page's template within the `.error-message` div:

```HTML
<div>{{ errorMessage$ | async }}</div>
```

We have not learned about the `async` pipe yet. It will subscribe to the observable and also handle the unsubscription when the element is removed from the DOM. Also, the `$` at the end of `errorMessage$` is a common convention for class properties that are Observables, but it is not required.

At this point have a look at the login page and notice that this only logic in the page directly pertains to the user interaction with the page itself. There is no logic surrounding the mechanics of how the login works or anything like that. All of that business logic will eventually be the concern of the store and the service layer. It should never be the concern of any page or component. The proper separation of concerns is a very important best-practice to follow as you architect your application.

## Debugging Tools (Optional)

You can use <a href="https://ngrx.io/guide/store-devtools" target="_blank">@ngrx/store-devtools</a> in conjunction with the <a href="https://github.com/zalmoxisus/redux-devtools-extension/" target="_blank">Redux Devtools Extension</a> to help debug your application as you develop the store. Have a look at the installation instructions if you are interested.

Installing these tools is not a requirement. However, they are very useful for debugging the application state.

## Conclusion

Test this out in the app. If you "log in" with any e-mail and a password of "test", you will be redirected to the main page. We are not really persisting the session, though, so you will lose it in the state when you refresh the page. We aren't using it yet so it isn't causing us an issue but long term it will be one.

Persisting the session information will be an item we tackle in the next lab.

Here are the logout reducers that you had to write, just in case you ran into any issues:

```TypeScript
  on(Actions.logout, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.logoutSuccess, state => {
    const newState = {...state, loading: false};
    delete newState.session;
    return newState;
  }),
  on(Actions.logoutFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
```
