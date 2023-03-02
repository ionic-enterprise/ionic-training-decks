# Lab: Complete the Authentication Flow

In this lab you will learn how to:

- protect your routes with an Authentication Guard
- Use HTTP Interceptors to modify requests
- Use HTTP Interceptors to handle errors with responses
- Perform up-front application initialization
- Setup the authentication flow

## The Problems

Our authentication flow is working, but we currently have one major problem: the user can get to `http://localhost:8100/tea` is accessible even if the user is not logged in.

We have not hooked up the backend API other than the login and logout, but when we do we will have the following issues:

- We are not attaching the authentication token to any outbound requests to our API requests.
- If the authentication token is bad our backend will respond with a 401 error. We need to handle that by redirecting the user to the login page.

The first problem will be solved by adding a guard service. The other two problems will be solved by the addition of a couple of HTTP interceptors.

## Create the Guard

An authentication guard is just a service that matches a <a href="https://angular.io/api/router/CanActivate" target="_blank">specific interface</a>. Start by creating the service.

```bash
$ ionic g s core/auth-guard/auth-guard
```

Remember to update the `src/app/core/index.ts` file to export the new service.

## Create the Interface

The AuthGuard needs to implement the <a href="https://angular.io/api/router/CanActivate" target="_blank">CanActivate</a> interface. Let's set that up in the class.

```typescript
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor() {}

  async canActivate(): Promise<boolean> {
    return true;
  }
}
```

## Test and Code

### Configure the Testing Module

We know that we are going to be checking to see if we have an identity and that we may have to navigate to the login page. So let's set up the module such that the `SessionVaultService` and `NavController` are both provided as mocks by adding a `providers` array to the `TestBed.configureTestingModule()` call.

```typescript
...
import { NavController } from '@ionic/angular';
import { SessionVaultService } from '../session-vault/session-vault.service';
import { createNavControllerMock } from '@test/mocks';
import { createSessionVaultServiceMock } from '../session-vault/session-vault.service.mock';
...
      providers: [
        { provide: NavController, useFactory: createNavControllerMock },
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
      ],
```

As you go through the next steps, remember that you will need to expand your imports a bit from time to time.

### Step 1 - when a session exists in the vault

If a session is stored in the vault, then there is no need to redirect to the login page, and we can continue with the current navigation.

```typescript
describe('with a stored session', () => {
  beforeEach(() => {
    const sessionVault = TestBed.inject(SessionVaultService);
    (sessionVault.get as any).and.returnValue(
      Promise.resolve({
        user: {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        token: '19940059fkkf039',
      })
    );
  });

  it('does not navigate', async () => {
    const navController = TestBed.inject(NavController);
    await service.canActivate();
    expect(navController.navigateRoot).not.toHaveBeenCalled();
  });

  it('emits true', async () => {
    expect(await service.canActivate()).toBeTrue();
  });
});
```

These tests should work with the code we currently have.

### Step 2 - when a session does not exist in the vault

If a session does not exist in vault state, then we need to disallow the current navigation and redirect to the login page instead.

```typescript
describe('without a stored session', () => {
  it('navigates to the login page', async () => {
    const navController = TestBed.inject(NavController);
    await service.canActivate();
    expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
    expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
  });

  it('emits false', async () => {
    expect(await service.canActivate()).toBeFalse();
  });
});
```

Add those tests and then write the code that satisfies them. In the end, your code will look _something_ like this:

```typescript
export class AuthGuardService implements CanActivate {
  constructor() {} // inject the nav controller and session vault here as private

  async canActivate(): Promise<boolean> {
    const session = await this.sessionVault.get();
    if (session) {
      return true;
    }

    this.navController.navigateRoot(['/', 'login']);
    return false;
  }
}
```

Be sure to replace the comments with the actual logic. I had to leave _something_ as an exercise for you... 🤓

## Hookup the Guard

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard in that page's routing module (`src/app/tea/tea-routing.module.ts`).

**Note:** most of this code should exist already. Just add the `AuthGuardService` related bits.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '@app/core/auth-guard/auth-guard.service';

import { TeaPage } from './tea.page';

const routes: Routes = [
  {
    path: '',
    component: TeaPage,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaPageRoutingModule {}
```

## HTTP Interceptors

Outgoing requests needs to have the token added to the headers, and incoming responses needed to be checked for 401 errors. It is best to handle these sorts of things in a centralized location. This is a perfect job for HTTP Interceptors.

```bash
ionic g s core/http-interceptors/auth-interceptor --skipTests
ionic g s core/http-interceptors/unauth-interceptor --skipTests
```

Be sure to update the `src/core/index.ts` file.

### The Auth Interceptor - Append the Bearer Token

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.select(selectAuthToken).pipe(
      take(1),
      tap((session) => {
        if (session && this.requestRequiresToken(req)) {
          req = req.clone({
            setHeaders: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: 'Bearer ' + session.token,
            },
          });
        }
      }),
      mergeMap(() => next.handle(req))
    );
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
```

This interceptor modifies the pipeline such that the token is added to the `Authorization` header if a token exists and the request requires a token. Have a look at `requestRequiresToken()`. The regular expression that is evaluated essentially states that every request requires a token with the exception of the `login` request.

### The Unauth Interceptor - Handle 401 Errors

```typescript
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NavController } from '@ionic/angular';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor(private navController: NavController, private sessionVault: SessionVaultService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            // What should we do here?
          }
        }
      )
    );
  }
}
```

This interceptor applies its logic to the pipeline after the request has been made. That is, it applies to the response. It is looking for 401 errors. What should we do when we have a 401 error? We should:

- Clear the session vault.
- Navigate to the login page.

Doing this has been left as an exercise for the reader.

### Hookup the Interceptors

Now that we have the interceptors, we need to hook them up. We will do this in the `AppModule` (`src/app/app.module.ts`). To do this, add the interceptors to the `providers` array of the `AppModule`. This ensures that they are used by the whole application. The `HTTP_INTERCEPTORS` array needs to be imported from `@angluar/common/http`.

```typescript
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthInterceptor, multi: true },
```

## Conclusion

With the auth guard and interceptors in place, the authentication workflow within your application is now complete.
