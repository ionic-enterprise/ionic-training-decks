# Lab: Authenticate the User

In this lab you will add learn how to:

- Use Angular's HttpClient service to POST data to an API
- Test code that relies on HTTP calls
- Use HTTP Interceptors to modify requests
- Use HTTP Interceptors to handle errors with responses
- Perform up-front application intialization

## Set up the Environment

Update both of the files under `src/environments` to include the following property in the JSON:

```TypeScript
dataService: 'https://cs-demo-api.herokuapp.com'
```

These files define the `dev` and `prod` environments. Typically they would have different values for something like the data service, but for our app we only have a single API server. Also, you can create more environments (QA, Testing, etc), but doing so is beyond the scope of this class.

## Authentication Service

In the last lab, we created a service that stores session. But how do we get that session in the first place? That is where the authentication service comes in. Just like with any other service, the first thing we need to do is generate it:

```bash
ionic g s core/authentication/authentication
```

Be sure to add it to the `src/app/core/index.ts`.

### Interface Setup

Just like the last time, we will start the actual coding by figuring out the initial shape of our API. Update `src/app/core/authentication/authentication.service.ts` to contain the following methods:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';

import { Session } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<Session | undefined> {
    return EMPTY;
  }

  logout(): Observable<any> {
    return EMPTY;
  }
}
```

### Test Setup

With the initial shape of our API in place, we are better informed in how to set up our unit test. Let's do that now. Update `src/app/core/authentication/authentication.service.spec.ts` as follows:

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {});

  describe('logout', () => {});
});
```

**Note:** This is just a template to get you started. As you go through this, you will need to do some things on your own, such as importing various objects and operators from the appropriate libraries (often `@angular/core/testing` or `rxjs/operators`). You can use your editor's automatic import feature or you can manually add the import. You will not be told by the labs when you need them, but your editor will let you know. This is an item that you will have to start figuring out as if you were working on your own application at this time.

### login

Let's build up the login on step at a time following TDD. With each code pair, add the first set of code within the `describe('login', ...)` and add the second set of code within the `login()` method in the newly generated service.

#### Step 1 - POST the Login

```typescript
it('POSTs the login', () => {
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  expect(req.request.method).toEqual('POST');
  req.flush({});
  httpTestingController.verify();
});
```

```typescript
return this.http.post<Session>(`${environment.dataService}/login`, {});
```

#### Step 2 - Pass the Credentials

```typescript
it('passes the credentials in the body', () => {
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  expect(req.request.body).toEqual({
    username: 'thank.you@forthefish.com',
    password: 'solongDude',
  });
  req.flush({});
  httpTestingController.verify();
});
```

```typescript
return this.http.post<Session>(`${environment.dataService}/login`, {
  username: email,
  password,
});
```

#### Step 3 - Handle a Successful Login

Remember that it is very common to nest `describe()` calls. In this case we want to test functionality that will only apply when the login is a success. The following `describe()` should thus be nested within the `describe('login', ...)`.

```typescript
describe('on success', () => {
  let response: any;
  beforeEach(() => {
    response = {
      success: true,
      token: '48499501093kf00399sg',
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'thank.you@forthefish.com',
      },
    };
  });
});
```

The folloing `3.1` step should then be nested within the `describe()` that was just created.

##### Step 3.1 - Emit the Session

```typescript
it('emits the session', fakeAsync(() => {
  let session: Session;
  service
    .login('thank.you@forthefish.com', 'solongDude')
    .subscribe(r => (session = r));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  tick();
  httpTestingController.verify();
  expect(session).toEqual({
    token: '48499501093kf00399sg',
    user: {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'thank.you@forthefish.com',
    },
  });
}));
```

For this one, it would be best to create a local type definition. So create the following in `src/app/core/authentication/authentication.service.ts` right after the ES6 imports.

```typescript
interface LoginResponse extends Session {
  success: boolean;
}
```

Then the body of the `login()` method is changed to map the respose as such:

```typescript
return this.http
  .post<LoginResponse>(`${environment.dataService}/login`, {
    username: email,
    password,
  })
  .pipe(
    map(res => {
      delete res.success;
      return res;
    }),
  );
```

#### Step 4 - Handle a Login Failure

Testing a login failure will be similar. We will nest a `describe()` within the `describe('login', ...)` and then nest the test cases within it.

```typescript
describe('on failure', () => {
  let response: any;
  beforeEach(() => {
    response = { success: false };
  });
});
```

##### Step 4.1 - Emit Undefined

```typescript
it('emits undefined', fakeAsync(() => {
  service
    .login('thank.you@forthefish.com', 'solongDude')
    .subscribe(r => expect(r).toEqual(undefined));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  tick();
  httpTestingController.verify();
}));
```

That just takes one minor tweak in the `map()`:

```TypeScript
        map(res => {
          if (res.success) {
            delete res.success;
            return res;
          }
        }),
```

In case you got lost at any step, here is the complete code so far:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';

import { Session } from '@app/models';
import { environment } from '@env/environment';

interface LoginResponse extends Session {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<Session | undefined> {
    return this.http
      .post<LoginResponse>(`${environment.dataService}/login`, {
        username: email,
        password,
      })
      .pipe(
        map(res => {
          if (res.success) {
            delete res.success;
            return res;
          }
        }),
      );
  }

  logout(): Observable<any> {
    return EMPTY;
  }
}
```

### logout

The logout is easier, and now you have a model for the code. So I will provide the tests that should be nested within the `describe('logout'...)`. I leave the coding to you.

#### Step 1 - POST the Logout

```typescript
it('POSTs the logout', () => {
  service.logout().subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/logout`,
  );
  req.flush({});
  httpTestingController.verify();
  expect(true).toBe(true); // Prevents Jasmine warning
});
```

Well, that's really the only step...

**Challenge:** go write the code for that requirement. When you are done making this test pass, `EMPTY` should be marked as unused in your imports section. Be sure to remove it.

### Create a Mock Factory

We will want to use the `AuthenticationService` when we update the store logic and thus will need to mock it in tests. Create a factory for that now.

```typescript
import { EMPTY } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    login: EMPTY,
    logout: EMPTY,
  });
```

Remember to add to `src/app/core/testing.ts`

## HTTP Interceptors

Outgoing requests needs to have the token added to the headers, and incoming responses needeed to be checked for 401 errors. It is best to handle these sorts of things in a centralized location. This is a perfect job for HTTP Interceptors.

```bash
ionic g s core/http-interceptors/auth-interceptor --skipTests
ionic g s core/http-interceptors/unauth-interceptor --skipTests
```

Be sure to update the `src/core/index.ts` file.

### The Auth Interceptor - Append the Bearer Token

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { selectAuthToken, State } from '@app/store';
import { mergeMap, take, tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<State>) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.store.pipe(
      select(selectAuthToken),
      take(1),
      tap(token => {
        if (token && this.requestRequiresToken(req)) {
          req = req.clone({
            setHeaders: {
              Authorization: 'Bearer ' + token,
            },
          });
        }
      }),
      mergeMap(() => next.handle(req)),
    );
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
```

### The Unauth Interceptor - Handle 401 Errors

```typescript
import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { State } from '@app/store';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor(private store: Store<State>) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            // What should we do here?
          }
        },
      ),
    );
  }
}
```

**Note:** What should we do when we have a 401 error? Well, we really should inform the store, but we don't really have a an action for that, so let's add one really quick:

```TypeScript
export const unauthError = createAction('[Auth API] unauthenticated error');
```

We will also need a reducer to modify the state. All it needs to do is remove the session from the state since the session is not valid.

```TypeScript
  describe('Unauth Error', () => {
    it('clears the session', () => {
      const action = unauthError();
      expect(
        reducer(
          {
            session: {
              user: {
                id: 42,
                firstName: 'Douglas',
                lastName: 'Adams',
                email: 'solong@thanksforthefish.com',
              },
              token: 'Imalittletoken',
            },
            loading: false,
            errorMessage: '',
          },
          action,
        ),
      ).toEqual({ loading: false, errorMessage: '' });
    });
  });
```

```TypeScript
  on(Actions.unauthError, state => {
    const newState = { ...state };
    delete newState.session;
    return newState;
  }),
```

Finally, we need a `unauthError$` effect. It needs to clear the storage and dispatch the fact that we are in a logged out state (LogoutSuccess).

```TypeScript
  describe('unauthError$', () => {
    it('clears the session from storage', done => {
      const sessionVaultService = TestBed.inject(SessionVaultService);
      actions$ = of(unauthError());
      effects.unauthError$.subscribe(() => {
        expect(sessionVaultService.logout).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches the logout success event', done => {
      actions$ = of(unauthError());
      effects.unauthError$.subscribe(action => {
        expect(action).toEqual({
          type: '[Auth API] logout success',
        });
        done();
      });
    });
  });
```

```TypeScript
  unauthError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unauthError),
      tap(() => {
        this.sessionVault.logout();
      }),
      map(() => logoutSuccess()),
    ),
  );
```

The end result being that once the `UnauthError` action is dispatched, the session will be cleared from memory and the user will be redirected to the login screen. This means we can replace the comment in the unauth interceptor with this:

```TypeScript
this.store.dispatch(unauthError());
```

### Hookup the Interceptors

Provide the interceptors to the `providers` array in the `app.module.ts` file. This ensures that they are used by the whole application. The `HTTP_INTERCEPTORS` array needs to be imported from `@angluar/common/http`.

```typescript
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthInterceptor, multi: true },
```

While we are in there, we should also add `HttpClientModule` (also from `@angular/common/http`) to our `AppModule`'s list of imports.

## Update the Store

There is one part of our store that performs asynchronous data actions, and that is the `effects`. Assuming we laid out the rest of our application properly, the only part of our authentication flow that should need to change is the operation of the effects.

### The Auth Effects Tests

Update the `TestBed` to provide a mock authentication service:

```TypeScript
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
```

Then we need to update the `login$` tests. We need to:

- add a test that verifies we call the `AuthenticationService`
- redifine how success and failure are detected by making it dependent on the outcome of the `login()` call (we reflect this in the tests by adding the `beforeEach()` setup methods to the 'on login success' and 'on login failure' tests, representing success and failure responses from our backend)
- add a set of tests for when a hard error occurs with the login (for example, a 500 error from the server)

```TypeScript
  describe('login$', () => {
    it('performs a login operation', done => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.login as any).and.returnValue(of(undefined));
      actions$ = of(login({ email: 'test@test.com', password: 'test' }));
      effects.login$.subscribe(() => {
        expect(auth.login).toHaveBeenCalledTimes(1);
        expect(auth.login).toHaveBeenCalledWith('test@test.com', 'test');
        done();
      });
    });

    describe('on login success', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.login as any).and.returnValue(
          of({
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
            token: '314159',
          }),
        );
      });
      ...
    });

    describe('on login failure', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.login as any).and.returnValue(of(undefined));
      });
      ...
    });

    describe('on a hard error', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.login as any).and.returnValue(
          throwError(new Error('the server is blowing chunks')),
        );
      });

      it('does not save the session', done => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.login).not.toHaveBeenCalled();
          done();
        });
      });

      it('dispatches the login failure event', done => {
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(action => {
          expect(action).toEqual({
            type: '[Auth API] login failure',
            errorMessage: 'Unknown error in login',
          });
          done();
        });
      });
    });
  });
```

For the `logout$` effect, we need to add a test verifying we are performing the logout. We also need to test that on a hard error we trigger a logout failure with a generic message. This is for cases where the API call errors out.

```TypeScript
  describe('logout$', () => {
    beforeEach(() => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.logout as any).and.returnValue(of(undefined));
    });

    it('performs a logout operation', done => {
      const auth = TestBed.inject(AuthenticationService);
      actions$ = of(logout());
      effects.logout$.subscribe(() => {
        expect(auth.logout).toHaveBeenCalledTimes(1);
        done();
      });
    });
    ...

    describe('on a hard error', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.logout as any).and.returnValue(
          throwError(new Error('the server is blowing chunks')),
        );
      });

      it('does not clear the session from storage', done => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(logout());
        effects.logout$.subscribe(() => {
          expect(sessionVaultService.logout).not.toHaveBeenCalled();
          done();
        });
      });

      it('dispatches the logout failure event', done => {
        actions$ = of(logout());
        effects.logout$.subscribe(action => {
          expect(action).toEqual({
            type: '[Auth API] logout failure',
            errorMessage: 'Unknown error in logout',
          });
          done();
        });
      });
    });
  });
```

### The Auth Effects Code

Turning our attention to the code, the first thing we need to do is inject the `AuthenticationService`

```TypeScript
  constructor(
    private actions$: Actions,
    private auth: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService,
  ) {}
```

Then we can modify the logic in the `login$` effect:

```diff
     this.actions$.pipe(
       ofType(login),
       exhaustMap(action =>
-        from(this.fakeLogin(action.email, action.password)).pipe(
-          tap(session => this.sessionVault.login(session)),
-          map(session => loginSuccess({ session })),
-          catchError(error =>
-            of(loginFailure({ errorMessage: error.message })),
+        this.auth.login(action.email, action.password).pipe(
+          tap(session => {
+            if (session) {
+              this.sessionVault.login(session);
+            }
+          }),
+          map(session =>
+            session
+              ? loginSuccess({ session })
+              : loginFailure({ errorMessage: 'Invalid Username or Password' }),
+          ),
+          catchError(() =>
+            of(loginFailure({ errorMessage: 'Unknown error in login' })),
           ),
         ),
       ),
```

You can completely remove the private `fakeLogin()` method at this point.

We can also modify the logic in the `logout$` effect:

```diff
     this.actions$.pipe(
       ofType(logout),
       exhaustMap(() =>
-        from(this.sessionVault.logout()).pipe(map(() => logoutSuccess())),
+        this.auth.logout().pipe(
+          tap(() => this.sessionVault.logout()),
+          map(() => logoutSuccess()),
+          catchError(() =>
+            of(logoutFailure({ errorMessage: 'Unknown error in logout' })),
+          ),
+        ),
       ),
     ),
   );
```

Test this out in the application. Note from the "network" tab in the devtools that you are now using actual calls to the backend for the login and the logout.

Also note that you were able to use the store to fake the login for a period of time, and then when the time was right you were able to switch over to using the backend API but only had to change the effects that handle them, the rest of your application was able to continue functioning as-is. This is an important tool that you can utilize in your own development.

At this point, it would be a good idea to look for unused imports, etc. and clean any of that up.

## Conclusion

The login and logout workflow should now be completely implemented with all of the parts hooked up. We have one more thing to do though to really make the auth implementation complete. We need to guard the routes. We will do that in the next section.
