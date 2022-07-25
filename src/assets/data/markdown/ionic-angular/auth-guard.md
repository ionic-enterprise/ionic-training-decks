# Lab: Guard the Routes

In this lab you will learn how to protect your routes with an Authentication Guard

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
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor() {}

  canActivate(): Observable<boolean> {
    return of(false);
  }
}
```

## Test and Code

### Configure the Testing Module

We know that we are going to be checking to see if we have an identity and that we may have to navigate to the login page. So let's set up the module such that the `Store`, `SessionVaultService`, and `NavController` are all provided as mocks by adding a `providers` array to the `TestBed.configureTestingModule()` call.

```typescript
...
import { NavController } from '@ionic/angular';
import { provideMockStore } from '@ngrx/store/testing';

import { SessionVaultService } from '../session-vault/session-vault.service';
import { createNavControllerMock } from '@test/mocks';
import { createSessionVaultServiceMock } from '../session-vault/session-vault.service.mock';
...
      providers: [
        provideMockStore(),
        { provide: NavController, useFactory: createNavControllerMock },
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
      ],
```

As you go through the next steps, remember that you will need to expand your imports a bit from time to time.

### Step 1 - when a token exists in the state

We will use the presence of a token to signify that a person is currently logged in.

When the user is logged in, the guard should not navigate and should return `true`.

```typescript
describe('when a token exists in the state', () => {
  beforeEach(() => {
    const store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectAuthToken, '294905993');
  });

  it('does not navigate', (done) => {
    const navController = TestBed.inject(NavController);
    service.canActivate().subscribe(() => {
      expect(navController.navigateRoot).not.toHaveBeenCalled();
      done();
    });
  });

  it('emits true', (done) => {
    service.canActivate().subscribe((response) => {
      expect(response).toBe(true);
      done();
    });
  });
});
```

Add those tests within the main `describe` and then write the code that satisfies them. In this case, you just have to flip the return value from `false` to `true` in `src/app/core/auth-guard/auth-guard.service.ts`.

### Step 2 - when a token does not exist in the state

If a token does not exist in the state, we are in one of two situations:

- the user _is_ actually logged in and the session needs to be restored from preferences
- the user is not logged in

So, we need to try and restore the session and then do whatever is appropriate.

```typescript
describe('when a token does not exist in the state', () => {
  beforeEach(() => {
    const store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectAuthToken, '');
  });

  describe('with a stored session', () => {
    beforeEach(() => {
      const sessionVault = TestBed.inject(SessionVaultService);
      (sessionVault.restoreSession as any).and.returnValue(
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

    // The tests are are identical to the "when a token exists in the state" tests.
    // Copy them here.
  });

  describe('without a stored session', () => {
    it('navigates to the login page', (done) => {
      const navController = TestBed.inject(NavController);
      service.canActivate().subscribe(() => {
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
        done();
      });
    });

    it('emits false', (done) => {
      service.canActivate().subscribe((response) => {
        expect(response).toBe(false);
        done();
      });
    });
  });
});
```

Add those tests within the `describe` and then write the code that satisfies them. In the end, your code will look _something_ like this:

```typescript
export class AuthGuardService implements CanActivate {
  constructor() {} // inject the store, nav controller, and session vault here as private

  canActivate(): Observable<boolean> {
    return this.store.select(selectAuthToken).pipe(
      take(1),
      mergeMap((token) => (token ? of(token) : this.sessionVault.restoreSession())),
      // eslint-disable-next-line ngrx/avoid-mapping-selectors
      map((value) => !!value),
      tap((sessionExists) => {
        // navigation logic goes here...
      })
    );
  }
}
```

Be sure to replace the comments with the actual logic. I had to leave _something_ as an exercise for you... 🤓

## Hookup the Guard

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard in that page's routing module (`src/app/tea/tea-routing.module.ts`).

**Note:** most of this code should exist already. Just add the `AuthGuardService` related bits. If yours routing module is slightly different, have a look and determine if you would like to change any of it.

```typescript
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tea',
    pathMatch: 'full',
  },
  {
    path: 'tea',
    loadChildren: () => import('./tea/tea.module').then((m) => m.TeaPageModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

## Conclusion

With the auth guard in place, the authentication workflow within your application is now complete.
