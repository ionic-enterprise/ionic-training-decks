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

## Code

We do not want our guard to just return `true` so we will need to fill in some logic. Below we have provided the basic skeleton. Notice that the signature has been updated to be `async` and to provide proper typing. Your job is to fill in the logic. Be sure to replace the comments with the actual logic. I had to leave _something_ as an exercise for you... 🤓

**`src/app/core/guards/auth.guard.ts`**

```typescript
// all imports up here...

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
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

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard on that page's route in `src/app/app.route.ts`.

**Note:** most of this code should exist already. Just add the `authGuard` related bits.

**`src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@app/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tea',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((c) => c.LoginPage),
  },
  {
    path: 'tea',
    loadComponent: () => import('./tea/tea.page').then((c) => c.TeaPage),
    canActivate: [authGuard],
  },
];
```

## HTTP Interceptors

Outgoing requests need to have the token added to the headers, and incoming responses need to be checked for 401 errors. It is best to handle these sorts of things in a centralized location. This is a perfect job for HTTP Interceptors.

```bash
npx ng g interceptor core/interceptors/auth --functional --skip-tests
npx ng g interceptor core/interceptors/unauth --functional --skip-tests
```

Be sure to update the `src/core/index.ts` file.

### The Auth Interceptor - Append the Bearer Token

**`src/app/core/interceptors/auth.interceptor.ts`**

```typescript
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionVaultService } from '../session-vault/session-vault.service';
import { tap, from, mergeMap } from 'rxjs';

const requestRequiresToken = (req: HttpRequest<any>): boolean => {
  return !/\/login$/.test(req.url);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionVault = inject(SessionVaultService);

  return from(sessionVault.get()).pipe(
    tap({
      next: (session) => {
        if (session && requestRequiresToken(req)) {
          req = req.clone({
            setHeaders: {
              Authorization: 'Bearer ' + session.token,
            },
          });
        }
      },
    }),
    mergeMap(() => next(req)),
  );
};
```

This interceptor modifies the pipeline such that the token is added to the `Authorization` header if a token exists and the request requires a token. Have a look at `requestRequiresToken()`. The regular expression that is evaluated essentially states that every request requires a token with the exception of the `login` request.

### The Unauth Interceptor - Handle 401 Errors

**`src/app/core/interceptors/unauth.interceptor.ts`**

```typescript
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { SessionVaultService } from '../session-vault/session-vault.service';
import { NavController } from '@ionic/angular/standalone';

export const unauthInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionVault = inject(SessionVaultService);
  const navController = inject(NavController);

  return next(req).pipe(
    tap({
      error: async (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          You will need to fill this in...
        }
      },
    }),
  );
};
```

This interceptor applies its logic to the pipeline after the request has been made. That is, it applies to the response. It is looking for 401 errors. What should we do when we have a 401 error? We should:

- Clear the session vault.
- Navigate to the login page.

Doing this has been left as an exercise for the reader.

### Hookup the Interceptors

Now that we have the interceptors, we need to hook them up. We will modify the bootstrap configuration in `src/main.ts` by modifying the `provideHttpClient()` call to provide the HTTP client `withInterceptors()`.

```typescript
    provideHttpClient(withInterceptors([authInterceptor, unauthInterceptor])),
```

## Conclusion

With the auth guard and interceptors in place, the authentication workflow within your application is now complete.
