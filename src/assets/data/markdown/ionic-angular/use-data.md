# Lab: Use the Data

In this lab you will:

- Expand your store to include a `data` module
- Update the tea page to use data from the store rather than the fake data it is currently using

## Load Data Up Front

The first thing we should think about with the teas is how we intend to use them. We know we will use them on the one and only non-login page we currently have, but we also know from other items on our backlog that this tea data will be an important part of several pages in our application. For this reason it makes sense to load this data whenever we establish a session in our application.

### Actions

We already have the actions in place that mean we have established a session and need to load some data. These are the `SessionRestored` and `LoginSuccess` actions. When these actions are dispatched, we will begin an initial load of data (at this time, it is only the tea data, but it could expand in the future). So we have two new events in our application that we will need to express as actions:

```TypeScript
import { Session, Tea } from '@app/models';
...
export const initialLoadSuccess = createAction(
  '[Data API] initial data load success',
  props<{teas: Array<Tea>}>()
)
export const initialLoadFailure = createAction(
  '[Data API] initial data load failure',
  props<{ errorMessage: string }>(),
);
```

### A New State Slice for the Data

We already have a slice of state for the authentication system. Let's aslo create one for the data. For our small app we will just have those two slices, one for `auth` and one for the rest of the `data`.

We have been defining the state slices along with the reducers, so create a file called `src/app/store/reducers/data.reducer.ts` with the following initial contents:

```TypeScript
import { createReducer, on } from '@ngrx/store';

import { Tea } from '@app/models';
import * as Actions from '@app/store/actions';

export interface DataState {
  teas: Array<Tea>;
  loading: boolean;
  errorMessage: string;
}

export const initialState: DataState = {
  teas: [],
  loading: false,
  errorMessage: '',
};

export const reducer = createReducer(initialState);
```

As well as a starting test file for it (`src/app/store/reducers/data.reducer.spec.ts`)

```TypeScript
import { initialState, reducer } from './data.reducer';

it('returns the default state', () => {
  expect(reducer(undefined, { type: 'NOOP' })).toEqual(initialState);
});
```

At this point we can update the `src/app/store/reducers/index.ts` file so this slice of state and its reducer are included in the store.

```diff
--- a/src/app/store/reducers/index.ts
+++ b/src/app/store/reducers/index.ts
@@ -2,13 +2,16 @@ import { ActionReducerMap, MetaReducer } from '@ngrx/store';
 import { environment } from '@env/environment';

 import { AuthState, reducer as authReducer } from './auth.reducer';
+import { DataState, reducer as dataReducer } from './data.reducer';

 export interface State {
   auth: AuthState;
+  data: DataState;
 }

 export const reducers: ActionReducerMap<State> = {
   auth: authReducer,
+  data: dataReducer,
 };

 export const metaReducers: MetaReducer<State>[] = !environment.production
```

### Reducers

For this sllice, we will need the reducer to handle the following actions:

- `LoginSuccess` - set the loading flag, clear any old error message
- `SessionRestored` - set the loading flag, clear any old error message
- `InitialLoadFailure` - clear the loading flag, set the error message
- `InitialLoadSuccess` - clear the loading flag, set the tea data

For the test, we will need some data to work with:

```TypeScript
const session: Session = {
  user: {
    id: 314,
    firstName: 'Kevin',
    lastName: 'Minion',
    email: 'goodtobebad@gru.org',
  },
  token: '39948503',
};

const teas: Array<Tea> = [
  {
    id: 1,
    name: 'Green',
    image: 'assets/img/green.jpg',
    description: 'Green teas are green',
  },
  {
    id: 2,
    name: 'Black',
    image: 'assets/img/black.jpg',
    description: 'Black teas are not green',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'assets/img/herbal.jpg',
    description: 'Herbal teas are not even tea',
  },
];
```

With the data in place, and using what we did for the `auth` slice as a guide we _could_ write some tests (**Do not write these tests**):

```TypeScript
describe('Login Success', () => {
  it('sets the loading flag and clears any error message', () => {
    const action = loginSuccess({ session });
    expect(
      reducer(
        {
          teas:[],
          loading: false,
          errorMessage: 'Unknown error with data load',
        },
        action,
      ),
    ).toEqual({
      teas:[],
      loading: true,
      errorMessage: '',
    });
  });
});

describe('Session Restored', () => {
  it('sets the loading flag and clears any error message', () => {
    const action = sessionRestored({ session });
    expect(
      reducer(
        {
          teas:[],
          loading: false,
          errorMessage: 'Unknown error with data load',
        },
        action,
      ),
    ).toEqual({
      teas:[],
      loading: true,
      errorMessage: '',
    });
  });
});

describe('Initial Load Failure',  () => {
  it('clears the loading flag and sets the error message', () => {
    const action = initialLoadFailure({errorMessage: 'The load blew some chunks'});
    expect(
      reducer(
        {
          teas:[],
          loading: true,
          errorMessage: '',
        },
        action,
      ),
    ).toEqual({
      teas:[],
      loading: false,
      errorMessage: 'The load blew some chunks',
    });
  });
});

describe('Initial Load Success', () => {
  it('clears the loading flag and sets the teas', () => {
    const action = initialLoadSuccess({teas});
    expect(
      reducer(
        {
          teas:[],
          loading: true,
          errorMessage: '',
        },
        action,
      ),
    ).toEqual({
      teas,
      loading: false,
      errorMessage: '',
    });
  });
});
```

But notice how repetative those tests are. Let's see if we can do better. Looking at the tests, they all:

- have a description
- create an action,
- start with a specific state
- end with a specific state

So, we could abstract that out in to some data for each test and have a single test function that does the work. Further, since it would be nice to only have to specify the parts of state that differ from the initial state. That way, if we add to the state, our tests don't need to change. Let's do that now:

```TypeScript
const createState = (stateChanges: {
  teas?: Array<Tea>;
  loading?: boolean;
  errorMessage?: string;
}): DataState => ({ ...initialState, ...stateChanges });

it('returns the default state', () => {
  expect(reducer(undefined, { type: 'NOOP' })).toEqual(initialState);
});

[
  {
    description: 'Login Success: sets the loading flag and clears any error message',
    action: loginSuccess({ session }),
    begin: { errorMessage: 'Unknown error with data load' },
    end: { loading: true },
  },
  {
    description: 'Session Restored: sets the loading flag and clears any error message',
    action: sessionRestored({ session }),
    begin: { errorMessage: 'Unknown error with data load' },
    end: { loading: true },
  },
  {
    description: 'Initial Load Failure: clears the loading flag and sets the error message',
    action: initialLoadFailure({ errorMessage: 'The load blew some chunks' }),
    begin: { loading: true },
    end: { errorMessage: 'The load blew some chunks' },
  },
  {
    description: 'Initial Load Success: clears the loading flag and sets the teas',
    action: initialLoadSuccess({ teas }),
    begin: { loading: true },
    end: { teas },
  },
].forEach(test =>
  it(test.description, () => {
    expect(reducer(createState(test.begin), test.action)).toEqual(
      createState(test.end),
    );
  }),
);
```

That is a lot less repetative code, and will be a lot easier to maintain as our state grows.

With the tests in place, we are ready to update the `dataReducer` in `src/app/store/reducers/data.reducer.ts`. I will provide one of the action handlers, and let you fill in the others.

```TypeScript
  on(Actions.initialLoadSuccess, (state, {teas}) => ({
    ...state,
    loading: false,
    teas: [...teas]
  })),
```

Have a peek at the auth reducer if you get stuck. If you get _realy_ stuck the code will be provided in the conclusion section of this lab.

### Effects

Right now, the only effect we need for the data slice is to load the tea data whenever we have a new session. The first task will be to create the required files and get the effects hooked up:

**`src/app/store/effects/data.effects.spec.ts`**

```TypeScript
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { TeaService } from '@app/core';
import { createTeaServiceMock } from '@app/core/testing';
import { DataEffects } from './data.effects';

describe('DataEffects', () => {
  let actions$: Observable<any>;
  let effects: DataEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataEffects,
        provideMockActions(() => actions$),
        {
          provide: TeaService,
          useFactory: createTeaServiceMock,
        },
      ],
    });
    effects = TestBed.inject(DataEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
```

**`src/app/store/effects/data.effects.ts`**

```TypeScript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import {
  sessionRestored,
  loginSuccess,
} from '@app/store/actions';

@Injectable()
export class DataEffects {
  sessionLoaded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, sessionRestored),
        tap(() => {
          console.log('An auth session had been loaded');
        }),
      ),
    { dispatch: false },
  );
  constructor(private actions$: Actions) {}
}
```

Be sure to update `src/app/store/effects/index.ts`.

**`src/app/app.module.ts`**

```diff
--- a/src/app/app.module.ts
+++ b/src/app/app.module.ts
@@ -10,7 +10,7 @@ import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
 import { AppComponent } from './app.component';
 import { AppRoutingModule } from './app-routing.module';
 import { reducers, metaReducers, State } from './store';
-import { AuthEffects } from './store/effects';
+import { AuthEffects, DataEffects } from './store/effects';
 import { initialize } from './store/actions';
 import { AuthInterceptor, UnauthInterceptor } from './core';
 import { StoreDevtoolsModule } from '@ngrx/store-devtools';
@@ -31,7 +31,7 @@ import { environment } from '../environments/environment';
         strictActionImmutability: true,
       },
     }),
-    EffectsModule.forRoot([AuthEffects]),
+    EffectsModule.forRoot([AuthEffects, DataEffects]),
     StoreDevtoolsModule.instrument({
       maxAge: 25,
       logOnly: environment.production,

```

Now that we are set up, we need an effect that gets the teas when we have a new session that was loaded, either via login or via session restore due to application reload. We already have a shell for this effect, so let's work out the tests. Remember that you will need to adjust your `import` statements as new objects are referenced.

First, we will copy the test data from our data reducer tests. We will need similar data here, so we may as well just use the same data. Since we won't have a need to change these we can just declare them right after the `import` statements and don't have to worry about re-initializing them with each test.

```TypeScript
const session: Session = {
  user: {
    id: 314,
    firstName: 'Kevin',
    lastName: 'Minion',
    email: 'goodtobebad@gru.org',
  },
  token: '39948503',
};

const teas: Array<Tea> = [
  {
    id: 1,
    name: 'Green',
    image: 'assets/img/green.jpg',
    description: 'Green teas are green',
  },
  {
    id: 2,
    name: 'Black',
    image: 'assets/img/black.jpg',
    description: 'Black teas are not green',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'assets/img/herbal.jpg',
    description: 'Herbal teas are not even tea',
  },
];
```

We can then add our first test:

```TypeScript
  [
    loginSuccess({ session }),
    sessionRestored({ session }),
  ].forEach(action =>
    describe(`sessionLoaded$ with ${action.type}`, () => {
      it('fetches the teas', done => {
        const teaService = TestBed.inject(TeaService);
        (teaService.getAll as any).and.returnValue(of(undefined));
        actions$ = of(action);
        effects.sessionLoaded$.subscribe(() => {
          expect(teaService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });
    }),
  );
```

Notice that we are using the "Array" trick again, this time to test this over a couple of different actions.

In the effect code, we can remove our `tap()`:

```TypeScript
        tap(() => {
          console.log('An auth session had been loaded');
        }),
```

And replace it with a `mergeMap()` within which we make our API call:

```TypeScript
        mergeMap(() => this.teaService.getAll()),
```

At this point, we have two possible outcomes: we either succeed in our quest to get teas, or the backend fails and we get an exception. Let's handle the first scenario first. Place this `describe()` inside the previous `describe()` that we added above.

```TypeScript
      describe('on success', () => {
        beforeEach(() => {
          const teaService = TestBed.inject(TeaService);
          (teaService.getAll as any).and.returnValue(of(teas));
        });

        it('dispatches initial load success', done => {
          actions$ = of(action);
          effects.sessionLoaded$.subscribe(mappedAction => {
            expect(mappedAction).toEqual({
              type: '[Data API] initial data load success',
              teas,
            });
            done();
          });
        });
      });
```

In the code, we can modify our `mergeMap()` related code a bit:

```TypeScript
        mergeMap(() =>
          this.teaService
            .getAll()
            .pipe(map(teas => initialLoadSuccess({ teas }))),
        ),
```

Finally, the error case. First the test:

```TypeScript
      describe('on an exception', () => {
        beforeEach(() => {
          const teaService = TestBed.inject(TeaService);
          (teaService.getAll as any).and.returnValue(
            throwError(new Error('the server is blowing chunks')),
          );
        });

        it('dispatches initial load failure', done => {
          actions$ = of(action);
          effects.sessionLoaded$.subscribe(newAction => {
            expect(newAction).toEqual({
              type: '[Data API] initial data load failure',
              errorMessage: 'Error in data load, check server logs',
            });
            done();
          });
        });
      });
```

Then the code:

```TypeScript
        mergeMap(() =>
          this.teaService.getAll().pipe(
            map(teas => initialLoadSuccess({ teas })),
            catchError(() =>
              of(
                initialLoadFailure({
                  errorMessage: 'Error in data load, check server logs',
                }),
              ),
            ),
          ),
```

At this point, our effect is getting the data and is then returning the proper action to dispatch. Thus remove the `{ dispatch: false },` from the effect. That was just there to avoid an infinite loop when all we were doing was the `tap`. Speaking of which, the `tap` opeator should no longer be used, so go clean up your imports and you can then call the store mods done.

## The Tea Page

If you run the application in the browser and have a look at the network tab, you will see we are loading our teas (or tea-categories, as the endpoint is called) from the backend. If you have a look with the Redux DevTools, you should also see that the "teas" are populated in the "data" slice of our state. So, now we just need to use those teas.

### Create Selectors

First we will need a selector. Use the existing `src/app/store/selectors/auth.selectors.ts` as a model and create a `src/app/store/selectors/data.selectors.ts` file with two selectors:

- `selectData` - the whole data slice
- `selectTeas` - the teas on the data slice

If you get stuck, check the code in the Conclusion section. Remember to update the `src/app/selectors/index.ts` file.

### Update the Test

A lot of what we need for the test is already there. We just need to modify the setup to include the data slice in the state and then overridde the teas selector to return the test tea data.

```diff
--- a/src/app/tea/tea.page.spec.ts
+++ b/src/app/tea/tea.page.spec.ts
@@ -3,12 +3,14 @@ import { DebugElement } from '@angular/core';
 import { By } from '@angular/platform-browser';
 import { IonicModule } from '@ionic/angular';
 import { Store } from '@ngrx/store';
-import { provideMockStore } from '@ngrx/store/testing';
+import { MockStore, provideMockStore } from '@ngrx/store/testing';

-import { AuthState, initialState } from '@app/store/reducers/auth.reducer';
+import { AuthState, initialState as initialAuthState } from '@app/store/reducers/auth.reducer';
+import { DataState, initialState as initialDataState } from '@app/store/reducers/data.reducer';
 import { TeaPage } from './tea.page';
 import { Tea } from '@app/models';
 import { logout } from '@app/store/actions';
+import { selectTeas } from '@app/store/selectors';

 describe('TeaPage', () => {
   let component: TeaPage;
@@ -22,12 +24,15 @@ describe('TeaPage', () => {
         declarations: [TeaPage],
         imports: [IonicModule],
         providers: [
-          provideMockStore<{ auth: AuthState }>({
-            initialState: { auth: initialState },
+          provideMockStore<{ auth: AuthState, data: DataState }>({
+            initialState: { auth: initialAuthState, data: initialDataState },
           }),
         ],
       }).compileComponents();

+      const store = TestBed.inject(Store) as MockStore;
+      store.overrideSelector(selectTeas, teas);
+
       fixture = TestBed.createComponent(TeaPage);
       component = fixture.componentInstance;
       fixture.detectChanges();
```

### Update the Tea Page

For the page itself, let's take this one step at a time. Right now, the HTML is directly consuming the hard coded data after we turn it into a matrix. We want to get to a point where the page is consuming the tea data from the store translated into a matrix. For that, we will need an Observable.

For the first step, let's create an Observable that just uses the hard coded teas:

```TypeScript
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
...
export class TeaPage implements OnInit {
  teas$: Observable<Array<Array<Tea>>>;
...
  ngOnInit() {
    this.teas$ = of(this.teaData).pipe(map(teas => this.toMatrix(teas)));
  }
...
```

In the HTML, change the binding to use the observable and `async` pipe

```html
<ion-row
  *ngFor="let teaRow of teas$ | async"
  class="ion-align-items-stretch"
></ion-row>
```

After making those changes, all of your tests should still pass.

You can now replace the manufactured Observable with the observable select from the store:

```diff
--- a/src/app/tea/tea.page.ts
+++ b/src/app/tea/tea.page.ts
 import { Tea } from '@app/models';
 import { State } from '@app/store';
 import { logout } from '@app/store/actions';
-import { Observable, of } from 'rxjs';
+import { Observable } from 'rxjs';
 import { map } from 'rxjs/operators';
+import { selectTeas } from '@app/store/selectors';

 @Component({
   selector: 'app-tea',
@@ -99,6 +100,9 @@ export class TeaPage implements OnInit {
   }

   ngOnInit() {
-    this.teas$ = of(this.teaData).pipe(map(teas => this.teaMatrix(teas)));
+    this.teas$ = this.store
+      .select(selectTeas)
+      .pipe(map(teas => this.teaMatrix(teas)));
   }
 }
```

After making those changes, all of your tests should still pass, and you are now using the actual data and should see 8 teas instead of 7.

You can now remove the fake data from the Tea Page and clean up your imports if need be. The full code for the tea page class is included in the conclusion in case you got lost.

## The Tea Clearing Challenge

Testing this out in the browser everything _appears_ to run fine, but run it with Redux DevTools open and have a look at the state after logging off. The data is left over. For this app, that probalby is not a big deal, but in something like a banking app you don't want user A to log out and then have user B log in with user A's data still hanging out, even if for a short while.

**Code Challenge:** update the data reducer to clear the tea data upon `LogoutSuccess`. Start with a test, and then write the code. Both are included at the end of this page.

## Conclusion

In the last two labs, we have learned how to to get data via a service and then how to use that service within our pages. Be sure to commit your changes.

Here is the code for the data recuder:

```TypeScript
const dataReducer = createReducer(
  initialState,
  on(Actions.loginSuccess, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.sessionRestored, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.initialLoadFailure, (state, {errorMessage}) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
  on(Actions.initialLoadSuccess, (state, {teas}) => ({
    ...state,
    loading: false,
    teas: [...teas]
  })),
);
```

The following is the data selectors:

```TypeScript
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DataState } from '@app/store/reducers/data.reducer';

export const selectData = createFeatureSelector('data');
export const selectTeas = createSelector(
  selectData,
  (state: DataState) => state.teas,
);
```

The final TeaPage code:

```TypeScript
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Tea } from '@app/models';
import { State } from '@app/store';
import { logout } from '@app/store/actions';
import { selectTeas } from '@app/store/selectors';

@Component({
  selector: 'app-tea',
  templateUrl: './tea.page.html',
  styleUrls: ['./tea.page.scss'],
})
export class TeaPage implements OnInit {
  teas$: Observable<Array<Array<Tea>>>;

  private teaMatrix(teas: Array<Tea>): Array<Array<Tea>> {
    const matrix: Array<Array<Tea>> = [];
    let row = [];
    teas.forEach(t => {
      row.push(t);
      if (row.length === 4) {
        matrix.push(row);
        row = [];
      }
    });

    if (row.length) {
      matrix.push(row);
    }

    return matrix;
  }

  constructor(private store: Store<State>) {}

  logout() {
    this.store.dispatch(logout());
  }

  ngOnInit() {
    this.teas$ = this.store.pipe(
      select(selectTeas),
      map(teas => this.teaMatrix(teas || [])),
    );
  }
}
```

For the tea clearing challenge, first add the following case to the array of tests we process

```TypeScript
  {
    description: 'Logout Success: clears the tea data',
    action: logoutSuccess(),
    begin: { teas },
    end: {},
  },
```

Then add the code that modifies the state:

```TypeScript
  on(Actions.logoutSuccess, state => ({
    ...state,
    teas: [],
  })),
```
