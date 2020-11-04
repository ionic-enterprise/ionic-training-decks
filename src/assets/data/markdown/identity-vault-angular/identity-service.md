# Lab: Identity Service

In this lab, we will concentrate on refactoring the `IdentityService` to use the Identity Vault to store the token instead of storing it using the Capacitor Storage API. When we are done with this lab, the application will be storing the token in the vault, but from the user's perspective it will behave exactly as before.

## Getting Started

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin. By the end of this section, we will have updated our `IdentityService` to be a subclass of the `IonicIdentityVaultUser` class, giving us the access we need to the Identity Vault functionallity.

We will walk through adding the parent class one step at a time. As we do this, you should have two files open in your editor of choice:

- `src/app/core/identity/identity.service.spec.ts`
- `src/app/core/identity/identity.service.ts`

We will touch a few other files, but the bulk of the changes will be in the `IdentityService` and its test.

## Add the Platform Service

The `IonicIdentityVaultUser` takes the `Platform` service as the first parameter of its constructor (actually, it takes any object with a `ready()` method). As a result, the `IdentityService` will have the `Platform` service injected into it. We need to set that up in our test. We will just use a mock `Platform` service. When we are done, the `TestBed` configuration should look like this:

```typescript
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
  providers: [{ provide: Platform, useFactory: createPlatformMock }],
});
```

Inject the `Platform` and `BrowserVaultPlugin` services via the constructor in the `IdentityService` constructor:

```typescript
  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    private http: HttpClient,
    platform: Platform,
  ) {
    this._changed = new Subject();
  }
```

## Inherit from `IonicIdentityVaultUser`

We want the `IdentityService` to be the service through which we access the Identity Vault functionallity. To achieve this, we need to have the `IdentityService` inherit and extend the `IonicIdentityVaultUser` class.

This process will essentially make all of our `IdentityService` tests fail. For this reason, we will first perform the initial inheritance tasks. Then we will concentrate on updating the service, method by method, to fix both the code and the tests. To start with:

- import several key items from `@ionic-enterprise/identity-vault`
- extend the `IonicIdentityVaultUser` using the `DefaultSession` type
- in the constructor, call `super(...)`
- add the `getPlugin()` method
- remove the `token` getter (the base class already has one)

```typescript
...
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
...

@Injectable({
  providedIn: 'root',
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
...

  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    private http: HttpClient,
    platform: Platform,
  ) {
    super(platform, { authMode: AuthMode.SecureStorage });
    this._changed = new Subject();
  }

...

  getPlugin(): IonicNativeAuthPlugin {
    if ((this.platform as Platform).is('hybrid')) {
      return super.getPlugin();
    }
    return this.browserVaultPlugin;
  }
```

A further explanation of some of theses change are in order.

### The `DefaultSession` Type

When we extended the base class, we need to provide a type for our session. Identity Vault is very flexible as to what session information can be stored. The `DefaultSession` includes `username` and `token`, which is adaquate for our application given that we are currently only storing a token. The `DefaultSession` can be extended if desired in order to store other information with your session data.

### The `super()` Call

Because of JavaScript's inheritance rules, the first thing we need to do in our contructor is call `super()`. The base class takes an instatiation of the `Platform` service as well as a configuration object. For our initial version of the application, the only configuration we will do is to set the `authMode` to `SecureStorage`. This will configure the vault to securely store the session information, but will not configure any other advanced features, such as locking the vault or using biometrics to unlock the vault.

### The `getPlugin()` Method

The base class' `getPlugin()` method returns an interface to the native plugin for Identity Vault. We also want this application to run in a web based context for testing and development. By overriding this method, we can have Identity Vault use the plugin when running in a hybrid mobild context and use our previously created web based service when running in any other context.

One item of note here is that we cast the platform service (`this.platform as Platform`). This is required by TypeScript
because Identity Vault is not tightly coupled with `@ionic/angular`'s Platform service and we are calling a method here that Identity Vault does not know about.

## Switch `changed` to Emit DefaultSession

The `changed` Observable must be modified to emit the session rather than the user, since the session is now the main thing that the `IdentityService` is tracking.

### `src/app/core/identity/identity.service.spec.ts`

For the `IdentityService` test, modify the value that we expect to be emitted from the `changed` Observable.

```diff
--- a/src/app/core/identity/identity.service.spec.ts
+++ b/src/app/core/identity/identity.service.spec.ts
@@ -9,6 +9,7 @@ import { IdentityService } from './identity.service';
 import { environment } from '@env/environment';
 import { User } from '@app/models';
 import { createPlatformMock } from '@test/mocks';
+import { DefaultSession } from '@ionic-enterprise/identity-vault';

 describe('IdentityService', () => {
   let service: IdentityService;
@@ -139,8 +140,8 @@ describe('IdentityService', () => {
     });

     it('emits the change', async () => {
-      let user: User;
-      service.changed.subscribe(u => (user = u));
+      let session: DefaultSession;
+      service.changed.subscribe(s => (session = s));
       await service.set(
         {
           id: 42,
@@ -150,11 +151,9 @@ describe('IdentityService', () => {
         },
         '19940059fkkf039',
       );
-      expect(user).toEqual({
-        id: 42,
-        firstName: 'Joe',
-        lastName: 'Tester',
-        email: 'test@test.org',
+      expect(session).toEqual({
+        username: 'test@test.org',
+        token: '19940059fkkf039',
       });
     });
   });
@@ -184,10 +183,13 @@ describe('IdentityService', () => {
     });

     it('emits empty', async () => {
-      let user: User = { ...service.user };
-      service.changed.subscribe(u => (user = u));
+      let session: DefaultSession = {
+        username: 'test@test.com',
+        token: 'IAmAToken',
+      };
+      service.changed.subscribe(s => (session = s));
       await service.clear();
-      expect(user).toBeUndefined();
+      expect(session).toBeUndefined();
     });
   });
 });
```

### `src/app/core/identity/identity.service.mock.ts`

A change in type is also required in the service mock

```diff
--- a/src/app/core/identity/identity.service.mock.ts
+++ b/src/app/core/identity/identity.service.mock.ts
@@ -1,5 +1,5 @@
 import { Subject } from 'rxjs';
-import { User } from '@app/models';
+import { DefaultSession } from '@ionic-enterprise/identity-vault';
 import { IdentityService } from './identity.service';

 export function createIdentityServiceMock() {
@@ -8,6 +8,6 @@ export function createIdentityServiceMock() {
     set: Promise.resolve(),
     clear: Promise.resolve(),
   });
-  (mock as any).changed = new Subject<User>();
+  (mock as any).changed = new Subject<DefaultSession>();
   return mock;
 }
```

### `src/app/app.component.spec.ts`

The AppComponent test needs a type change:

```diff
--- a/src/app/app.component.spec.ts
+++ b/src/app/app.component.spec.ts
@@ -10,6 +10,7 @@ import { IdentityService } from './core';
 import { createIdentityServiceMock } from './core/testing';
 import { createPlatformMock, createNavControllerMock } from '@test/mocks';
 import { User } from './models';
+import { DefaultSession } from '@ionic-enterprise/identity-vault';

 describe('AppComponent', () => {
   let originalSplashScreen: any;
@@ -85,18 +86,16 @@ describe('AppComponent', () => {

     it('routes to login if no user', () => {
       const identity = TestBed.inject(IdentityService);
-      (identity.changed as Subject<User>).next();
+      (identity.changed as Subject<DefaultSession>).next();
       expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
       expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
     });

     it('routes to root if user', () => {
       const identity = TestBed.inject(IdentityService);
-      (identity.changed as Subject<User>).next({
-        id: 33,
-        firstName: 'Fred',
-        lastName: 'Rogers',
-        email: 'beautiful.day@neighborhood.com',
+      (identity.changed as Subject<DefaultSession>).next({
+        username: 'beautiful.day@neighborhood.com',
+        token: 'TheLandOfMakeBelieve',
       });
       expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
       expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
```

### `src/app/core/identity/identity.service.ts`

Finally, update the service to emit the session instead of the user.

```diff
--- a/src/app/core/identity/identity.service.ts
+++ b/src/app/core/identity/identity.service.ts
@@ -19,11 +19,11 @@ import { BrowserVaultPlugin } from '../browser-vault/browser-vault.plugin';
 })
 export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
   /* tslint:disable:variable-name */
-  private _changed: Subject<User>;
+  private _changed: Subject<DefaultSession>;
   /* tslint:enable:variable-name */

-  get changed(): Observable<User> {
+  get changed(): Observable<DefaultSession> {
     return this._changed.asObservable();
   }

@@ -51,9 +51,10 @@ export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
   }

   async set(user: User, token: string): Promise<void> {
+    const session = { username: user.email, token };
     this._user = user;
     this._token = token;
     const { Storage } = Plugins;
     await Storage.set({ key: this.key, value: token });
+    this._changed.next(session);
   }
```

## Remove the `init()` Method and the `user` Property

The `init()` method grabs the token from storage and uses it to get the user information. With Identity Vault, it is better to store all of the user information that we require along with the session. With that in mind, we will simply remove the `init()` method and the `user` property.

To do this:

- remove the `APP_INITIALIZER` from the `AppModule`
- remove the `IdentityService` tests for the `init()` method
- remove any other `IdentityService` tests that reference the `user` property
- remove the `init()` method as well as the `user` getter and the private `_user` variable from the `IdentityService`
- remove the `init()` method from the `IdentityService` mock

## Convert the Remaining Methods

At this point our `IdentityService` isn't really using the vault. As a result we currently have a failing test and our app does not work because it cannot access the token that came back from the login. As a result, our login goes nowhere. Let's fix this situation one method at a time.

#### The `set()` Method

Instead of saving the token using Capacitor Storage, the code will need to register the session information with a call to the base class' `login()` method.

Remove the "sets the token" and "saves the token in storage" test cases. Replace it with a test case that verifies that we call the base class' `login()` method with the correct information.

```typescript
it('calls the base class login', async () => {
  spyOn(service, 'login');
  await service.set(
    {
      id: 42,
      firstName: 'Joe',
      lastName: 'Tester',
      email: 'test@test.org',
    },
    '19940059fkkf039',
  );
  expect(service.login).toHaveBeenCalledTimes(1);
  expect(service.login).toHaveBeenCalledWith({
    username: 'test@test.org',
    token: '19940059fkkf039',
  });
});
```

Update the code accordingly:

```diff
   async set(user: User, token: string): Promise<void> {
     const session = { username: user.email, token };
-    this._token = token;
-    const { Storage } = Plugins;
-    await Storage.set({ key: this.key, value: token });
+    await this.login(session);
     this._changed.next(user);
   }
```

#### The `clear()` Method

Instead of removing the token from Capacitor Storage, the `clear()` method will clear the session with a call to the base class' `logout()` method.

Remove the "clears the token" and "clears the storage" test cases. Replace it with a test case that verifies that we call the base class' `logout()` method.

```typescript
it('calls the logout method', async () => {
  spyOn(service, 'logout');
  await service.clear();
  expect(service.logout).toHaveBeenCalledTimes(1);
});
```

At this point, we are no longer querying the mocked Storage API, so remove the mocking of it:

```diff
 describe('IdentityService', () => {
   let service: IdentityService;
   let httpTestController: HttpTestingController;
-  let originalStorage: any;

   beforeEach(() => {
-    originalStorage = Plugins.Storage;
-    Plugins.Storage = jasmine.createSpyObj('Storage', {
-      get: Promise.resolve(),
-      set: Promise.resolve(),
-      remove: Promise.resolve(),
-    });
     TestBed.configureTestingModule({
```

Now update the code accordingly:

```diff
   async clear(): Promise<void> {
-    this._token = undefined;
-    const { Storage } = Plugins;
-    await Storage.remove({ key: this.key });
+    await this.logout( );
     this._changed.next();
   }
```

### Update the `IdentityService` Mock

Several of our upcoming tests will require calls to methods that we have inherited from the base class. We could update the mock as we know what we need, but let's populate it with some of the commonly used methods right up front.

```typescript
import { Subject } from 'rxjs';
import { DefaultSession } from '@ionic-enterprise/identity-vault';
import { AuthMode } from '@ionic-enterprise/identity-vault';
import { IdentityService } from './identity.service';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj<IdentityService>('IdentityService', {
    set: Promise.resolve(),
    clear: Promise.resolve(),
    hasStoredSession: Promise.resolve(false),
    isBiometricsAvailable: Promise.resolve(false),
    getAuthMode: Promise.resolve(AuthMode.InMemoryOnly),
    restoreSession: Promise.resolve(null),
  });
  (mock as any).changed = new Subject<DefaultSession>();
  return mock;
}
```

## Restore the Session Before Accessing the Token

Now that we have refactored the `IdentityService` to use Identity Vault to store our session information, we have one last little bit of clean up to do that is outside of that service. Our Auth Interceptor and our Auth Guard both access the token. In each case, if the token is not currently set it could be because the session is currently locked, so if we do not immediately have a token available we should attempt to restore the session and then check the token again.

## The Auth Guard

Our Auth Guard will now be asynchronous since it may need to restore the session. The first thing to do is to make the existing tests for the `AuthGuard` service all use async/await.

Once we have that in place, we can modify the tests for our new requirement, which is to attempt to restore the session if we do not have a token. All of our remaining changes, then, will apply to the "when not logged in" section of the test.

```typescript
  describe('when not logged in', () => {
    it('attempts to restore the session', async () => {
      const identity = TestBed.inject(IdentityService);
      await service.canActivate();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
    });
    ...
  });
```

The call to `restoreSession()` will either result in us having a token again or it will not. If a session (and thus a token) is restored, we need to return true without navigating.

```typescript
  describe('when not logged in', () => {
    ...

    describe('if a session is restored', () => {
      beforeEach(() => {
        const identity = TestBed.inject(IdentityService);
        (identity.restoreSession as any).and.callFake(() => {
          (identity as any).token = '294905993';
        });
      });

      it('does not navigate', async () => {
        const navController = TestBed.inject(NavController);
        await service.canActivate();
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });

      it('returns true', async () => {
        expect(await service.canActivate()).toEqual(true);
      });
    });

    ...
  });
```

If a session is not restored, then we need to navigate to the login page and return false.

```typescript
  describe('when not logged in', () => {
    ...

    describe('if a session is not restored', () => {
      it('navigates to the login page', async () => {
        const navController = TestBed.inject(NavController);
        await service.canActivate();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      });

      it('returns false', async () => {
        expect(await service.canActivate()).toEqual(false);
      });
    });
  });
```

From here, we have the tests we need in place in order to properly change the code:

```typescript
  async canActivate(): Promise<boolean> {
    if (!this.identity.token) {
      try {
        await this.identity.restoreSession();
      } catch (e) {}
    }


    if (this.identity.token) {
      return true;
    }
    this.navController.navigateRoot(['/', 'login']);
    return false;
  }
```

Note the `try ... catch` block. If there is some sort of exception trying to unlock the vault, we will end up with no token set and will redirect to the login screen. This is what we want rather than never returning and leaving the user in limbo.

## The Auth Interceptor

The HTTP interceptors work on an Observable pipeline, but the vault does everything asynchronously with promises. To make our code easier to understand, we will break each step up into its own private method. It then becomes a fairly easy task to contruct an Observable pipeline that meets our needs.

```typescript
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
    return from(this.updateRequestHeaders(req)).pipe(
      mergeMap(r => next.handle(r)),
    );
  }

  private async updateRequestHeaders(
    req: HttpRequest<any>,
  ): Promise<HttpRequest<any>> {
    if (!this.requestRequiresToken(req)) {
      return req;
    }

    if (!this.identity.token) {
      try {
        await this.identity.restoreSession();
      } catch (e) {}
    }
    return this.setBearerToken(req);
  }

  private setBearerToken(req: HttpRequest<any>): HttpRequest<any> {
    if (this.identity.token) {
      return req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.identity.token,
        },
      });
    }
    return req;
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
```

## Final Cleanup

At this point, there should be some dead code and unused parameters. If you are using VSCode these will show with a lighter font. Remove all of the dead code and unused parameters and/or imports from any file that has been modified.

## Conclusion

At this point, the application should work just like it did before, only now the auth token will be stored securely when running on a device. Next we will look at locking the vaults and allowing it to be unlocked via PIN or biometrics.
