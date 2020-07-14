# Lab: Authentication Guard

In this lab you will learn how to protect your routes with an Authentication Guard

## Create the Guard

An authentication guard is just a service that matches a <a href="https://angular.io/api/router/CanActivate" target="_blank">specific interface</a>. Start by creating the service.

```bash
$ ionic g s services/auth-guard/auth-guard
```

Remember to update the `src/app/services/index.ts` file to export the new service.

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

  canActivate(): boolean {
    return false;
  }
}
```

## Test and Code

### Configure the Testing Module

We know that we are going to be checking to see if we have an identity and that we may have to navigate to the login page. So let's set up the module such that the `IdentityService` and `NavController` are both provided as mocks.

```typescript
import { TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { AuthGuardService } from './auth-guard.service';
import { IdentityService } from '../identity/identity.service';
import { createIdentityServiceMock } from '../identity/identity.service.mock';
import { createNavControllerMock } from '@test/mocks';

describe('AuthGuardService', () => {
  let service: AuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: IdentityService, useFactory: createIdentityServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    });
    service = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### Step 1 - when logged in

We will use the presence of a token to signify that a person is currently logged in.

When the user is logged in, the guard should not navigate and should return `true`.

```typescript
describe('when logged in', () => {
  beforeEach(() => {
    const identity = TestBed.inject(IdentityService);
    (identity as any).token = '294905993';
  });
  it('does not navigate', () => {
    const navController = TestBed.inject(NavController);
    service.canActivate();
    expect(navController.navigateRoot).not.toHaveBeenCalled();
  });

  it('returns true', () => {
    expect(service.canActivate()).toEqual(true);
  });
});
```

The cast to `any` on `identity` is required because in the real service this property is read-only. With the mock it is not, but `identity` is typed as the actual service, not the mock.

Add those tests within the `describe` and then write the code that satisfies them.

### Step 2 - when not logged in

When the user is not logged in, the guard should navigate to the login page and should return `false`.

```typescript
describe('when not logged in', () => {
  it('navigates to the login page', () => {
    const navController = TestBed.inject(NavController);
    service.canActivate();
    expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
    expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
  });

  it('returns false', () => {
    expect(service.canActivate()).toEqual(false);
  });
});
```

We do not need a `beforeEach` in this case because the default state of the mock is to not have a `token`.

Add those tests within the `describe` and then write the code that satisfies them.

## Hookup the Guard

Any route that requires the user to be logged in should have the guard. At this time, that is only the `tea` page, so let's hook up the guard in that page's routing module (`src/app/tea/tea-routing.module.ts`).

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeaPage } from './tea.page';
import { AuthGuardService } from '@app/services';

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

With the The authentication workflow within your application is now complete.
