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

We know that we are going to be checking to see if we have an identity and that we may have to navigate to the login page. So let's set up the module such that the `Store` and `NavController` are both provided as mocks by adding a `providers` array to the `TestBed.configureTestingModule()` call.

```typescript
import { provideMockStore } from '@ngrx/store/testing';
...
import { AuthState, initialState } from '@app/store/reducers/auth/auth.reducer';
import { createNavControllerMock } from '@test/mocks';
import { AuthGuardService } from './auth-guard.service';
...
      providers: [
        provideMockStore<{ auth: AuthState }>({
          initialState: { auth: initialState },
        }),
        { provide: NavController, useFactory: createNavControllerMock },
      ],
```

As you go through the next steps, remember that you will need to expand your imports a bit from time to time.

### Step 1 - when logged in

We will use the presence of a token to signify that a person is currently logged in.

When the user is logged in, the guard should not navigate and should return `true`.

```typescript
describe('when logged in', () => {
  beforeEach(() => {
    const store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectAuthToken, '294905993');
  });

  it('does not navigate', done => {
    const navController = TestBed.inject(NavController);
    service.canActivate().subscribe(() => {
      expect(navController.navigateRoot).not.toHaveBeenCalled();
      done();
    });
  });

  it('returns true', () => {
    let response: boolean;
    service.canActivate().subscribe((r: boolean) => (response = r));
    expect(response).toBe(true);
  });
});
```

Add those tests within the main `describe` and then write the code that satisfies them. In this case, you just have to flip the return value from `false` to `true` in `src/app/core/auth-guard/auth-guard.service.ts`.

### Step 2 - when not logged in

When the user is not logged in, the guard should navigate to the login page and should return `false`.

```typescript
describe('when not logged in', () => {
  beforeEach(() => {
    const store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectAuthToken, '');
  });

  it('navigates to the login page', done => {
    const navController = TestBed.inject(NavController);
    service.canActivate().subscribe(() => {
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      done();
    });
  });

  it('returns false', () => {
    let response: boolean;
    service.canActivate().subscribe((r: boolean) => (response = r));
    expect(response).toBe(false);
  });
});
```

Add those tests within the `describe` and then write the code that satisfies them. In the end, your code will look _something_ like this:

```typescript
export class AuthGuardService implements CanActivate {
  constructor(
    // inject the store and nav controller here as private
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(
      select(selectAuthToken),
      take(1),
      tap(token => {
        // Logic to navigate to login page when appropriate goes here
      }),
      map(token => /* logic to map the result to "true" or "false" goes here */ ),
    );
  }
}
```

Be sure to replace the comments with the actual logic... 🤓

## Hookup the Guard

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard in that page's routing module (`src/app/tea/tea-routing.module.ts`).

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeaPage } from './tea.page';
import { AuthGuardService } from '@app/core';

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

## Conclusion

With the auth guard in place, the authentication workflow within your application is now complete.
