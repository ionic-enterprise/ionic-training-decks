# Add Biometrics

We will implement a workflow where-by if a user can use biometrics to secure their login, Biometrics will be used. Otherwise a PIN will be used.

## `IdentityService` Modifications

### Modify the Configuration

Rather than specifying the auth mode on startup, we will determine the auth mode to use on login. We also want a couple of other options to be active now. Most notably, we need to tell Identlty Vault how long, in milliseconds, the application should be in the background before the token is locked. This is handled via the `lockAfter` property. We will also tell Identity Vault to protect our data by hiding the screen content with the app is in the background.

```TypeScript
  constructor(private browserAuthPlugin: BrowserAuthPlugin, private http: HttpClient, platform: Platform) {
    super(platform, { unlockOnAccess: true, hideScreenOnBackground: true, lockAfter: 5000 });
    this.changed = new Subject();
  }
```

### Add a Login Workflow

#### Use Biometrics

Our first requirement is to use biometrics if it is available. Let's repurpose one of our existing tests to prove out this requirement. Note that it will still also prove out the original requirement it was testing. There are multiple ways to handle that, depending on the level of tracking you need.

```diff
-    it('passes the user e-mail and the token', async () => {
+    it('uses biometrics if available', async () => {
+      spyOn(identity, 'isBiometricsAvailable').and.returnValue(Promise.resolve(true));
       spyOn(identity, 'login');
       await identity.set(user, 'IAmToken');
-      expect(identity.login).toHaveBeenCalledWith({ username: user.email, token: 'IAmToken' });
+      expect(identity.login).toHaveBeenCalledWith({ username: user.email, token: 'IAmToken' }, AuthMode.BiometricOnly);
     });
```

To get this to pass, we can cheat a little bit on the code (remember, this is _totally_ within the spirit of TDD which says to do the simplest thing possible and refactor as you go).

```diff
   async set(user: User, token: string): Promise<void> {
+    const mode = AuthMode.BiometricOnly;
     this.user = user;
-    await this.login({ username: user.email, token });
+    await this.login({ username: user.email, token }, mode);
     this.changed.next(this.user);
   }
```

#### Fallback to Passcode

Our second requirement is to fallback to passcode if biometrics are not available.

The test for this is a straight forward copy of our prior test with a couple of changes.

```TypeScript
    it('uses passcode if biometrics is not available', async () => {
      spyOn(identity, 'isBiometricsAvailable').and.returnValue(Promise.resolve(false));
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledWith({ username: user.email, token: 'IAmToken' }, AuthMode.PasscodeOnly);
    });
```

Making our prior code work with this requirement is also straight forward

```diff
   async set(user: User, token: string): Promise<void> {
-    const mode = AuthMode.BiometricOnly;
+    const mode = (await this.isBiometricsAvailable()) ? AuthMode.BiometricOnly : AuthMode.PasscodeOnly;
     this.user = user;
     await this.login({ username: user.email, token }, mode);
     this.changed.next(this.user);
  }
```

#### Try it on a Device

Build the application for your device and run it.

- Log in
- Enter a PIN if needed
- Put the app in the background for more than 5 seconds
- Come back to the app
- Click on a tea category to edit
- Note that the app asks for the vault to be unlocked, cancel it

There are a few issues:

1. The app is technically locked, but the user can still see the data
1. When the user cancels, the app does not redirect to the login screen
1. The "Edit Category" page has no data in it

### Implement the `onVaultLocked` Event Handler

When the app is locked it should redirect to a page where the user can either unlock the application or login in again. The `onVaultLoccked` event handler should be used to accomplish this task.

The test for that looks like this:

```TypeScript
  describe('onVaultLocked', () => {
    it('redirects to the login page', () => {
      const navController = TestBed.inject(NavController);
      identity.onVaultLocked();
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['login']);
    });
  });
```

The code to accomplish this is:

```TypeScript
  onVaultLocked() {
    this.navController.navigateRoot(['login']);
  }
```

That should fix all three of the errors mentioned above, though it does present one problem which we will now fix.

## `LoginPage` Modifications

The application now redirects to the login page as needed. However, the login page does not allow the token to be unlocked, forcing the user to log in again. In order to allow unlocking the token the `LoginPage` will have to interact with the `IdentityService`.

### Update the `IdentityService` Mock

We will have to add some methods from the base class to the `IdentityService` mock:

```diff
--- a/src/app/services/identity/identity.service.mock.ts
+++ b/src/app/services/identity/identity.service.mock.ts
@@ -5,6 +5,9 @@ export function createIdentityServiceMock() {
     get: of(null),
     set: Promise.resolve(),
     remove: Promise.resolve(),
-    getToken: Promise.resolve()
+    getToken: Promise.resolve(),
+    hasStoredSession: Promise.resolve(),
+    getAuthMode: Promise.resolve(),
+    restoreSession: Promise.resolve()
   });
 }
```

These methods are used by the `LoginPage` in managing the unlocking of the authentication token.

### Markup Changes

In cases where a locked session exists we want to display something that the user can clock to begin the unlock process.

```HTML
    <div class="unlock-app ion-text-center" *ngIf="displayVaultLogin" (click)="unlockClicked()">
      <ion-icon [name]="unlockIcon"></ion-icon>
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

When the login page is initialized, we need to determine if the user has a locked session or not. If they do, we need to display an unlock option with an appropriate icon to give the user a cue as to the type of unlocking mechasism that will be used.

```TypeScript
  describe('init', () => {
    describe('without a stored session', () => {
      let identity;
      beforeEach(() => {
        identity = TestBed.inject(IdentityService);
        (identity.hasStoredSession as any).and.returnValue(Promise.resolve(false));
      });

      it('sets unlockIcon to an empty string', async () => {
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('');
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

      it('sets displayVaultLogin to true', async () => {
        await component.ngOnInit();
        expect(component.displayVaultLogin).toEqual(true);
      });

      it('sets the unlockIcon to unlock when using passcode', async () => {
        identity.getAuthMode.and.returnValue(Promise.resolve(AuthMode.PasscodeOnly));
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('unlock');
      });

      it('sets the unlockIcon to finger-print when using biometrics', async () => {
        identity.getAuthMode.and.returnValue(Promise.resolve(AuthMode.BiometricOnly));
        await component.ngOnInit();
        expect(component.unlockIcon).toEqual('finger-print');
      });
    });
  });
```

The code to accomplish this looks like the following:

```TypeScript
  unlockIcon: string;
  displayVaultLogin: boolean

  ...

  ngOnInit(): Promise<void> {
    return this.initLoginType();
  }

  ...

  private async initLoginType(): Promise<void> {
    if (await this.identity.hasStoredSession()) {
      this.displayVaultLogin = true;
      const authMode = await this.identity.getAuthMode();
      switch (authMode) {
        case AuthMode.BiometricOnly:
          this.unlockIcon = 'finger-print';
          break;
        case AuthMode.PasscodeOnly:
          this.unlockIcon = 'unlock';
          break;
      }
    } else {
      this.displayVaultLogin = false;
      this.unlockIcon = '';
    }
  }
```

### Unlocking the Token

When the unlock button is clicked, we need to attempt to restore the session. If the session is restored then we will redirect the user to the `/tea-categories` page. In a real app, we might want to get fancier and redirect to the last visited page or something like that.

```TypeScript
  describe('clicking the "unlock" button', () => {
    it('restores the session', async () => {
      const identity = TestBed.inject(IdentityService);
      await component.unlockClicked();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
    });

    it('navigates to the tea-categories page if the session is restored ', async () => {
      const identity = TestBed.inject(IdentityService);
      (identity.restoreSession as any).and.returnValue(Promise.resolve({ username: 'test@test.com', token: 'IAmALittleToken' }));
      await component.unlockClicked();
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith('/tea-categories');
    });

    it('does not navigate if a session is not restored', async () => {
      const identity = TestBed.inject(IdentityService);
      await component.unlockClicked();
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });

    it('does not navigate if a session is restored but it does not have a token', async () => {
      const identity = TestBed.inject(IdentityService);
      (identity.restoreSession as any).and.returnValue(Promise.resolve({ username: 'test@test.com' }));
      await component.unlockClicked();
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });
  });
```

The code to accomplish this looks like the following:

```TypeScript
  async unlockClicked() {
    const session = await this.identity.restoreSession();
    if (session && session.token) {
      this.goToApp();
      return;
    }

    alert('Unable to authenticate. Please log in again');
  }

  private goToApp() {
    this.navController.navigateRoot('/tea-categories');
  }
```

## Conclusion

At this point, it is a good idea to run the application on actual devices. Try the application on devices with and without biometrics.
