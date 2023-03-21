# Lab: Route Guards and HTTP Interceptors

In this lab you will learn how to:

- Protect your routes with an Authentication Guard
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
$ npx ng g guard core/guards/auth --skip-tests
```

Select `CanActivate` as the type of guard to create when prompted.

Remember to update the `src/app/core/index.ts` file to export the guard.

## Switch to a Functional Guard

The Angular CLI (which the Ionic CLI is wrapping) currently generates a class-based guard, but these are deprecated. Let's quickly change that to a functional guard.

**Note:** skip this step if the CLI starts to generate a `CanActivateFn` rather than a class-based guard.

```typescript
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  return true;
};
```

## Code

We do not want our guard to just return `true`, however, so we will need to fill in some logic. Below we have provided the basic skeleton here. Your job is to fill in the logic. Be sure to replace the comments with the actual logic. I had to leave _something_ as an exercise for you... 🤓

```typescript
// all imports up here...

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  const sessionVault = inject(SessionVaultService);
  const navController = inject(NavController);

  // get the session
  // if a session exists, return true

  // Otherwise, navigate to the login page and return false
};
```

**Note:** `route` and `state` are part of the `CanActivateFn` signature, but you will not need to use them.

## Hookup the Guard

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard in that page's routing module (`src/app/tea/tea-routing.module.ts`).

**Note:** most of this code should exist already. Just add the `authGuard` related bits.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/core';

import { TeaPage } from './tea.page';

const routes: Routes = [
  {
    path: '',
    component: TeaPage,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaPageRoutingModule {}
```

## HTTP Interceptors

Outgoing requests need to have the token added to the headers, and incoming responses need to be checked for 401 errors. It is best to handle these sorts of things in a centralized location. This is a perfect job for HTTP Interceptors.

```bash
npx ng g interceptor core/interceptors/auth --skip-tests
npx ng g interceptor core/interceptors/unauth --skip-tests
```

Be sure to update the `src/core/index.ts` file.

### The Auth Interceptor - Append the Bearer Token

```typescript
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, mergeMap, Observable, tap } from 'rxjs';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private sessionVault: SessionVaultService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.sessionVault.get()).pipe(
      tap((session) => {
        if (session && this.requestRequiresToken(request)) {
          request = request.clone({
            setHeaders: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: 'Bearer ' + session.token,
            },
          });
        }
      }),
      mergeMap(() => next.handle(request))
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

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<unknown>) => {},
        async (err: unknown) => {
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
