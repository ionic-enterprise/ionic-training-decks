# Lab: Add Biometrics

We will implement a workflow where-by if a user can use biometrics to secure their login, Biometrics will be used. Otherwise a PIN will be used. In order to accomplish this, we will need to modify the `IdentityService` to handle locking the vault, and we will need to modify the `LoginPage` to present the user with unlock options when the vault is locked.

## `IdentityService` Modifications

### Modify the Configuration

We need to add a couple of options to our configuration. Most notably, we need to tell Identlty Vault how long, in milliseconds, the application should be in the background before the token is locked. This is handled via the `lockAfter` property. We will also tell Identity Vault to protect our data by hiding the screen content with the app is in the background, and that the Identity Vault should automatically try to unlock a locked vault upon attempting to access it.

We will eventually remove the `authMode` option and specify it during the login, but we will leave it in place for now.

```TypeScript
  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    platform: Platform,
  ) {
    super(platform, {
      authMode: AuthMode.SecureStorage,
      unlockOnAccess: true,
      hideScreenOnBackground: true,
      lockAfter: 5000,
    });
    this._changed = new Subject();
  }
```

If you build and run on a device at this time, the one difference you should noticed is that when the application is put into the background, the contents of the sreen are no longer displayed. On Android, you will see a grey page instead, and on iOS you will see the contents of the splash screen for your appliction. This is due to the `hideScreenOnBackground` option.

### Add a Login Workflow

#### Use Biometrics

Our first requirement is to use biometrics if it is available. Let's repurpose the existing "calls the base class login" test of the `set()` method to prove out this requirement. Note that it will still also prove out the original requirement it was testing. There are multiple ways to handle that, depending on the level of tracking you need.

```diff
@@ -121,6 +122,7 @@ describe('IdentityService', () => {
     });

     it('calls the base class login', async () => {
+      spyOn(service, 'isBiometricsAvailable').and.returnValue(Promise.resolve(true));
       spyOn(service, 'login');
       await service.set(
         {
@@ -132,10 +134,34 @@ describe('IdentityService', () => {
         '19940059fkkf039',
       );
       expect(service.login).toHaveBeenCalledTimes(1);
-      expect(service.login).toHaveBeenCalledWith({
-        username: 'test@test.org',
-        token: '19940059fkkf039',
-      });
+      expect(service.login).toHaveBeenCalledWith(
+        {
+          username: 'test@test.org',
+          token: '19940059fkkf039',
+        },
+        AuthMode.BiometricOnly,
+      );
+    });
```

To get this to pass, we can cheat a little bit on the code (remember, this is _totally_ within the spirit of TDD which says to do the simplest thing possible and refactor as you go).

```diff
   async set(user: User, token: string): Promise<void> {
     const session = { username: user.email, token };
+    const mode = AuthMode.BiometricOnly;
-    await this.login(session);
+    await this.login(session, mode);
     this._changed.next(session);
   }
```

At this point it makes sense to remove the `AuthMode` option from the constructor since we are now setting the mode when the user logs in. The mode set at construction has no meaning any more.

#### Fallback to Passcode

Our second requirement is to fallback to passcode if biometrics are not available.

The test for this is a straight forward copy of our prior test with a couple of changes.

```TypeScript
    it('uses passcode if biometrics is not available', async () => {
      spyOn(service, 'isBiometricsAvailable').and.returnValue(Promise.resolve(false));
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
      expect(service.login).toHaveBeenCalledWith(
        {
          username: 'test@test.org',
          token: '19940059fkkf039',
        },
        AuthMode.PasscodeOnly,
      );
    });
```

**Note:** the "sets the user" test should also be modified to use `async/await` at this point.

Making our prior code work with this requirement is also straight forward

```diff
   async set(user: User, token: string): Promise<void> {
     const session = { username: user.email, token };
-    const mode = AuthMode.BiometricOnly;
+    const mode = (await this.isBiometricsAvailable())
+      ? AuthMode.BiometricOnly
+      : AuthMode.PasscodeOnly;
     await this.login(session, mode);
     this._changed.next(session);
  }
```

#### Update the `info.plist` File

On iOS, the user has to give permission to use FaceID. In order to do this, open the project in Xcode (`npx cap open ios`) and find the `info.plist` file under the `App` folder. Open it and add the following value:

- Key: NSFaceIDUsageDescription
- Value: Use Face ID to unlock the application

This is the prompt that will be used when asking for permission to use FaceID.

#### Try it on a Device

Build the application for your device and run it.

- Log in
- Enter a PIN if needed
- Put the app in the background for more than 5 seconds
- Come back to the app
- Click on a tea category to edit
- Note that the app either asks for a PIN or redirects to the login page

There are a few issues:

1. The app is technically locked, but the user can still see the data
1. Depending on your current biometrics configuration, you were either asked to unlock via PIN or simply redirected to the login page
1. If you were redirected to the login page, you had no way to unlock the vault

We will fix the workflow issue now. We will fix the issue on the login page later.

### Implement the `onVaultLocked` Event Handler

When the app is locked it should redirect to a page where the user can either unlock the application or login in again. The `onVaultLocked` event handler should be used to accomplish this task. The handler needs to be added to our `IdentityService`.

The test for the handleri looks like this:

```TypeScript
  describe('on vault locked', ( ) =>{
    it('emits an empty session', () => {
      let session: DefaultSession = {
        username: 'test@test.org',
        token: '19940059fkkf039',
      };
      service.changed.subscribe(s => (session = s));
      service.onVaultLocked(null);
      expect(session).toBeUndefined();
    });
  });
```

The code to accomplish this is:

```TypeScript
  onVaultLocked(evt: LockEvent) {
    this._changed.next();
  }
```

That should fix the issue where the user still is still in the app even thought it is locked. We will need the opposite logic to execute when the session is restored.

### Implement the `onSessionRestored` Event Handler

When the session is restored, the `onSessionRestored` event handler will be called with the session information passed to it. We need to emit that session on our `_changed` Subject.

The test for that looks like this:

```TypeScript
  describe('on session restored', ( ) =>{
    it('emits the session', () => {
      let session: DefaultSession;
      service.changed.subscribe(s => (session = s));
      service.onSessionRestored({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
      expect(session).toEqual({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
    });
  });
```

The code to accomplish this is:

```TypeScript
  onSessionRestored(session: DefaultSession) {
    this._changed.next(session);
  }
```

### Override the `restoreSession()` Method

It is possible, especially during development, to get the vault in a state where we try to perform a restore while the vault itself is locked and cannot be unlocked. In such cases, we will just clear the vault, forcing a new login. It is really hard to test this scenario so we will just provide the code without a test.

```typescript
  async restoreSession(): Promise<DefaultSession> {
    try {
      return await super.restoreSession();
    } catch (error) {
      if (error.code === VaultErrorCodes.VaultLocked) {
        const vault = await this.getVault();
        await vault.clear();
      } else {
        throw error;
      }
    }
  }
```

The login screen still does not present a way to unlock the app, which is something we will fix now.

## `LoginPage` Modifications

The application now redirects to the login page as needed. However, the login page does not allow the token to be unlocked, forcing the user to log in again. In order to allow unlocking the token the `LoginPage` will have to interact with the `IdentityService`.

### Update the `IdentityService` Mock

The `IdentityService` mock should have what we need from a previous update, but let's just make sure. It should look something like this:

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

Many of these methods are used by the `LoginPage` in managing the unlocking of the authentication token. Let's start making changes to the `LoginPage` now in order to support unlocking.

### New Properties

The `LoginPage` will use a couple of different properties to control when the unlock prompt is displayed and which icon is used. Create the following properties in the page's class and just assign default values for now:

```typescript
displayVaultLogin = true;
```

Before going any further, make sure you are serving the application and are logged out. This will allow us to see the changes to the login page as we make them.

### Markup Changes

In cases where a locked session exists we want to display something that the user can click to begin the unlock process.

```HTML
    <div class="unlock-app ion-text-center" *ngIf="displayVaultLogin" (click)="unlock()">
      <ion-icon name="lock-open-outline"></ion-icon>
      <div>Unlock</div>
    </div>
```

### Style Changes

We will also perform a little bit of styling to make the "unlock" part of the screen look better.

```SCSS
.unlock-app {
  margin-top: 3em;
  font-size: xx-large;
}
```

### Initialize the `LoginPage`

#### Tests

The `LoginPage` unit test will need to be modified to provide a mock `IdentityService`. We should also import the Identity Vault `AuthMode` definition.

```diff
--- a/src/app/login/login.page.spec.ts
+++ b/src/app/login/login.page.spec.ts
@@ -7,10 +7,14 @@ import {
 } from '@angular/core/testing';
 import { FormsModule } from '@angular/forms';
 import { IonicModule } from '@ionic/angular';
+import { AuthMode } from '@ionic-enterprise/identity-vault';

 import { LoginPage } from './login.page';
-import { AuthenticationService } from '@app/core';
-import { createAuthenticationServiceMock } from '@app/core/testing';
+import { AuthenticationService, IdentityService } from '@app/core';
+import {
+  createAuthenticationServiceMock,
+  createIdentityServiceMock,
+} from '@app/core/testing';
 import { of } from 'rxjs';

 describe('LoginPage', () => {
@@ -27,6 +31,7 @@ describe('LoginPage', () => {
             provide: AuthenticationService,
             useFactory: createAuthenticationServiceMock,
           },
+          { provide: IdentityService, useFactory: createIdentityServiceMock },
         ],
       }).compileComponents();

@@ -40,6 +45,59 @@ describe('LoginPage', () => {
     expect(component).toBeTruthy();
   });
```

When the login page is initialized, we need to determine if the user has a locked session or not. If they do, we need to display an unlock option with an appropriate icon to give the user a cue as to the type of unlocking mechasism that will be used.

```TypeScript
  describe('init', () => {
    describe('without a stored session', () => {
      let identity;
      beforeEach(() => {
        identity = TestBed.inject(IdentityService);
        (identity.hasStoredSession as any).and.returnValue(Promise.resolve(false));
      });

      it('sets displayVaultLogin to false', async () => {
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(false);
      });
    });

    describe('with a stored session', () => {
      let identity;
      beforeEach(() => {
        identity = TestBed.inject(IdentityService);
        (identity.hasStoredSession as any).and.returnValue(Promise.resolve(true));
      });

      it('sets displayVaultLogin to true for passcode', async () => {
        (identity.getAuthMode as any).and.returnValue(Promise.resolve(AuthMode.PasscodeOnly));
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(true);
      });

      it('sets displayVaultLogin to true for biometric and passcode', async () => {
        (identity.getAuthMode as any).and.returnValue(Promise.resolve(AuthMode.BiometricAndPasscode));
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(true);
      });

      it('sets displayVaultLogin to false for biometric when bio is not available', async () => {
        (identity.getAuthMode as any).and.returnValue(Promise.resolve(AuthMode.BiometricOnly));
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(false);
      });

      it('sets displayVaultLogin to true for biometric when bio is available', async () => {
        (identity.isBiometricsAvailable as any).and.returnValue(Promise.resolve(true));
        (identity.getAuthMode as any).and.returnValue(Promise.resolve(AuthMode.BiometricOnly));
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(true);
      });
    });
  });
```

The code to accomplish this looks like the following:

```TypeScript
  displayVaultLogin: boolean

  constructor(
    private auth: AuthenticationService,
    private identity: IdentityService,
  ) {}

  ...

  async ngOnInit(): Promise<void> {
    this.displayVaultLogin = await this.canUnlock();
  }

  ...

  private async canUnlock(): Promise<boolean> {
    if (!(await this.identity.hasStoredSession())) {
      return false;
    }

    const mode = await this.identity.getAuthMode();
    return (
      mode === AuthMode.PasscodeOnly ||
      mode === AuthMode.BiometricAndPasscode ||
      (mode === AuthMode.BiometricOnly &&
        (await this.identity.isBiometricsAvailable()))
    );
  }
```

Be sure to update the `import` statements at the top of the file accordingly.

### Unlocking the Token

When the unlock button is clicked, we need to attempt to restore the session. If the session is restored then we will redirect the user to the `/tea-categories` page. In a real app, we might want to get fancier and redirect to the last visited page or something like that.

```TypeScript
  describe('clicking the "unlock" button', () => {
    it('restores the session', () => {
      const identity = TestBed.inject(IdentityService);
      component.unlock();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
    });
  });
```

The code to accomplish this looks like the following:

```TypeScript
  unlockClicked() {
    this.identity.restoreSession();
  }
```

## Conclusion

At this point, it is a good idea to run the application on actual devices. Try the application on devices with and without biometrics.
