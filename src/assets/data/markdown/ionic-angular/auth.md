# Lab: Authenticate the User

In this lab you will add learn how to:

- Use Angular's HttpClient service to POST data to an API
- Test code that relies on HTTP calls
- Use HTTP Interceptors to modify requests
- Use HTTP Interceptors to respond to handle errors with responses
- Perform up-front application intialization

## Authentication Service

In the last lab, we created a service that stores information about the currently logged in user as well as that user's current login token. But how do we get that token in the first place? That is where the authentication service comes in. Just like with any other service, the first thing we need to do is generate it:

```bash
$ ionic g s core/authentication/authentication
```

Be sure to add it to the `src/app/core/index.ts`.

### Interface Setup

Just like the last time, we will start the actual coding by figuring out the initial shape of our API. Update `src/app/core/authentication/authentication.service.ts` to contain the following methods:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';

import { IdentityService } from '../identity/identity.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient, private identity: IdentityService) {}

  login(email: string, password: string): Observable<boolean> {
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
import { IdentityService } from '../identity/identity.service';
import { createIdentityServiceMock } from '../identity/identity.service.mock';

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: IdentityService, useFactory: createIdentityServiceMock },
      ],
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
return this.http.post<boolean>(`${environment.dataService}/login`, {});
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
return this.http.post<boolean>(`${environment.dataService}/login`, {
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

The folloing `3.x` steps should then be nested within the `describe()` that was just created.

##### Step 3.1 - Emit True

```typescript
it('emits true', fakeAsync(() => {
  service
    .login('thank.you@forthefish.com', 'solongDude')
    .subscribe(r => expect(r).toEqual(true));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  tick();
  httpTestingController.verify();
}));
```

For this one, it would be best to create a local type definition. So create the following in `src/app/core/authentication/authentication.service.ts` right after the ES6 imports.

```typescript
interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
```

Then the body of the `login()` method is changed to map the respose as such:

```typescript
return this.http
  .post<LoginResponse>(`${environment.dataService}/login`, {
    username: email,
    password,
  })
  .pipe(map(res => res.success));
```

##### Step 3.2 - Set the Identity

```typescript
it('sets the identity', () => {
  const identity = TestBed.inject(IdentityService);
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  httpTestingController.verify();
  expect(identity.set).toHaveBeenCalledTimes(1);
  expect(identity.set).toHaveBeenCalledWith(
    {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'thank.you@forthefish.com',
    },
    '48499501093kf00399sg',
  );
});
```

This can be accomplished by using the `tap()` operator within the observable pipeline.

```typescript
.pipe(
  tap(res => this.identity.set(res.user, res.token)),
  map(res => res.success),
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

##### Step 4.1 - Emit False

```typescript
it('emits false', fakeAsync(() => {
  service
    .login('thank.you@forthefish.com', 'solongDude')
    .subscribe(r => expect(r).toEqual(false));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  tick();
  httpTestingController.verify();
}));
```

So, that works out of the box. Moving on...

##### Step 4.2 - Do Not Set the Identity

```typescript
it('does not set the identity', () => {
  const identity = TestBed.inject(IdentityService);
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/login`,
  );
  req.flush(response);
  httpTestingController.verify();
  expect(identity.set).not.toHaveBeenCalled();
});
```

That can be made to pass by updating the `tap()` a little:

```typescript
tap(res => {
  if (res.success) {
    this.identity.set(res.user, res.token);
  }
}),
```

In case you got lost at any step, here is the complete code so far:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { IdentityService } from '../identity/identity.service';
import { environment } from '@env/environment';
import { User } from '@app/models';

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient, private identity: IdentityService) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.dataService}/login`, {
        username: email,
        password,
      })
      .pipe(
        tap(res => {
          if (res.success) {
            this.identity.set(res.user, res.token);
          }
        }),
        map(res => res.success),
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

#### Step 2 - Clear the Identity

```typescript
it('clears the identity', fakeAsync(() => {
  const identity = TestBed.inject(IdentityService);
  service.logout().subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/logout`,
  );
  req.flush({});
  tick();
  expect(identity.clear).toHaveBeenCalledTimes(1);
}));
```

### Create a Mock Factory

We will eventually want to use the `AuthenticationService` and thus will need to mock it in tests. Create a factory for that now.

```typescript
import { EMPTY } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export function createAuthenticationServiceMock() {
  return jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    login: EMPTY,
    logout: EMPTY,
  });
}
```

Remember to add to `src/app/core/testing.ts`

## HTTP Interceptors

Outgoing requests needs to have the token added to the headers, and incoming responses needeed to be checked for 401 errors. It is best to handle these sorts of things in a centralized location. This is a perfect job for HTTP Interceptors.

```bash
$ ionic g s core/http-interceptors/auth-interceptor --skipTests
$ ionic g s core/http-interceptors/unauth-interceptor --skipTests
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

import { IdentityService } from '../identity/identity.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private identity: IdentityService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (this.requestRequiresToken(req) && this.identity.token) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.identity.token,
        },
      });
    }
    return next.handle(req);
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

import { IdentityService } from '../identity/identity.service';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor(private identity: IdentityService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.identity.clear();
          }
        },
      ),
    );
  }
}
```

### Hookup the Interceptors

Provide the interceptors in the `app.module.ts` file. This ensures that they are used by the whole application. The `HTTP_INTERCEPTORS` needs to be imported from `@angluar/common/http`.

```typescript
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthInterceptor, multi: true },
```

While we are in there, we should also add `HttpClientModule` (also from `@angular/common/http`) to our `AppModule`'s list of imports.

## APP_INITIALIZER

The `APP_INITIALIZER` defined functions that are injected at startup and executed during the application bootstrap process. We would like to have the `IdentityService` initialized during startup. Add the following to the `providers` list in `AppModule`. `APP_INITIALIZER` needs to be imported from `@angular/core`.

```TypeScript
{
  provide: APP_INITIALIZER,
  useFactory: (identity: IdentityService) => () => identity.init(),
  deps: [IdentityService],
  multi: true
},
```

## Login Page

We have the button hooked up to the `signIn()` method and we have a stub for it. It is now time to code that.

### Test Setup

First, we need to add the `AuthenticationService` to the testing module's `providers` list:

```typescript
providers: [
  {
    provide: AuthenticationService,
    useFactory: createAuthenticationServiceMock,
  },
],
```

We will also need a method that will perform a click event:

```typescript
function click(button: HTMLIonButtonElement) {
  const event = new Event('click');
  button.dispatchEvent(event);
  fixture.detectChanges();
}
```

Add the following tests within the `describe('signon button', ...)` section of the `login.page.spec.ts` test file.

### Step 1 - Call the Login Method on Click

```typescript
it('performs a login on clicked', () => {
  const authenticationService = TestBed.inject(AuthenticationService);
  setInputValue(email, 'test@test.com');
  setInputValue(password, 'password');
  click(button);
  expect(authenticationService.login).toHaveBeenCalledTimes(1);
  expect(authenticationService.login).toHaveBeenCalledWith(
    'test@test.com',
    'password',
  );
});
```

Now inject the `AuthenticationService` in the page's class and update the `signIn()` method to call the login method.

### Step 2 - Set Error Message if Login Fails

```typescript
it('sets an error message if the login failed', () => {
  const authenticationService = TestBed.inject(AuthenticationService);
  const errorDiv: HTMLDivElement = fixture.nativeElement.querySelector(
    '.error-message',
  );
  (authenticationService.login as any).and.returnValue(of(false));
  click(button);
  expect(errorDiv.textContent.trim()).toEqual(
    'Invalid e-mail address or password',
  );
});
```

Now write the code to make this pass.

**Hint:** Set an `errorMessage` property in the class, and display it within the `.error-messages` `div` in the HTML.

### The Code

The final code and markup should look like this:

```typescript
  signIn() {
    this.auth
      .login(this.email, this.password)
      .pipe(take(1))
      .subscribe(success => {
        if (!success) {
          this.errorMessage = 'Invalid e-mail address or password';
        }
      });
  }
```

```HTML
    <div class="error-message">

      <!-- (input related error messages are here) -->

      <div>{{ errorMessage }}</div>
    </div>
```

## Tea Page

This is a temporary change for testing. We will eventually move the logout and do more with it. We won't unit test it yet, but we will need to provide the mock to prevent our existing tests from failing.

```typescript
TestBed.configureTestingModule({
  declarations: [TeaPage],
  imports: [IonicModule],
  providers: [
    {
      provide: AuthenticationService,
      useFactory: createAuthenticationServiceMock,
    },
  ],
}).compileComponents();
```

Inject the authentication service and create a simple logout method.

```typescript
  constructor(private auth: AuthenticationService) {
    this.listToMatrix();
  }

  logout() {
    this.auth
      .logout()
      .pipe(take(1))
      .subscribe();
  }
```

Have a look at the <a href="https://ionicframework.com/docs/api/toolbar" target="_blank">Ionic Toolbar</a> documentation and add a button in the `end` slot of the toolbar. Use the `log-out-outline` icon in the `icon-only` slot of the button, and hook the button's click event up to the newly created `logout()` method.

## Conclusion

The login and logout workflow should now be completely implemented with all of the parts hooked up. We have one more thing to do though to really make the auth implementation complete. We need to guard the routes. We will do that in the next section.
