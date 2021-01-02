# Lab: Add Biometrics

We will implement a workflow where-by if a user can use biometrics to secure their login, Biometrics will be used. Otherwise a PIN will be used. In order to accomplish this, we will need to modify the `IdentityService` to handle locking the vault, and we will need to modify the `LoginPage` to present the user with unlock options when the vault is locked.

## `SessionVaultService` Modifications

### Modify the Configuration

We need to add a couple of options to our configuration. Most notably, we need to tell Identity Vault how long, in milliseconds, the application should be in the background before the token is locked. This is handled via the `lockAfter` property. We will also tell Identity Vault to protect our data by hiding the screen content with the app is in the background, and that the Identity Vault should automatically try to unlock a locked vault upon attempting to access it.

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
  }
```

If you build and run on a device at this time, the one difference you should noticed is that when the application is put into the background, the contents of the sreen are no longer displayed. On Android, you will see a grey page instead, and on iOS you will see the contents of the splash screen for your appliction. This is due to the `hideScreenOnBackground` option.

### Add a Login Workflow

#### Use Biometrics

Our first requirement is to use biometrics if it is available. We will determine this at login time, which means that we will need to add a login method to our `SessionVaultService` class that determines the appropriate mode and then calls the login on the base class.

```TypeScript
async login(session: Session): Promise<void> {
  const mode = (await this.isBiometricsAvailable())
    ? AuthMode.BiometricOnly
    : AuthMode.PasscodeOnly;
  await super.login(session, mode);
}
```

At this point, we can remove the `authMode` configuration from the constructor code.

#### Update the `info.plist` File

On iOS, the user has to give permission to use FaceID. In order to do this, open the project in Xcode (`npx cap open ios`) and find the `info.plist` file under the `App` folder. Open it and add the following value:

- Key: NSFaceIDUsageDescription
- Value: Use Face ID to unlock the application

This is the prompt that will be used when asking for permission to use FaceID.

#### Implement the `onVaultLocked` Event Handler

Our service should dispatch an action to the store when the vault is locked. So let's first create an action for that and update the service to dispatch it.

```diff
--- a/src/app/store/actions.ts
+++ b/src/app/store/actions.ts
@@ -16,6 +16,7 @@ export enum ActionTypes {

   UnauthError = '[Auth API] unauthenticated error',

+  SessionLocked = '[Vault API] session locked',
   SessionRestored = '[Vault API] session restored',

   TeaDetailsChangeRating = '[Tea Details Page] change rating',
@@ -66,6 +67,7 @@ export const logoutFailure = createAction(

 export const unauthError = createAction(ActionTypes.UnauthError);

+export const sessionLocked = createAction(ActionTypes.SessionLocked)
 export const sessionRestored = createAction(
   ActionTypes.SessionRestored,
   props<{ session: Session }>(),
```

```diff
--- a/src/app/core/session-vault/session-vault.service.ts
+++ b/src/app/core/session-vault/session-vault.service.ts
@@ -4,11 +4,12 @@ import {
   AuthMode,
   IonicIdentityVaultUser,
   IonicNativeAuthPlugin,
+  LockEvent,
 } from '@ionic-enterprise/identity-vault';
 import { Platform } from '@ionic/angular';

 import { Session } from '@app/models';
-import { sessionRestored } from '@app/store/actions';
+import { sessionLocked, sessionRestored } from '@app/store/actions';
 import { State } from '@app/store';
 import { BrowserVaultPlugin } from '../browser-vault/browser-vault.plugin';

@@ -46,6 +47,10 @@ export class SessionVaultService extends IonicIdentityVaultUser<Session> {
     return session;
   }

+  onVaultLocked(event: LockEvent) {
+    this.store.dispatch(sessionLocked());
+  }
+
```

That let's our store know that the session is locked, but how should the store react? How should this affect the state of our application? Here is what should happen:

- the session should be cleared in the state (reducer)
- the application should navigate to the login page (effect)

Notice that we are not storing the locked state in the store. If we did that, we would need to worry about stuff like:

- Resetting the lock state on restart if appropriate.
- Handling issues with users removing fingerprints while we are locked out.

Basically, the locked state can change on us due to external influences, making it a poor choice for putting in the store. It is better if we query the vault for the state when we need it. We will do that later.

The reducer code is pretty straight forward:

```diff
--- a/src/app/store/reducers/auth/auth.reducer.ts
+++ b/src/app/store/reducers/auth/auth.reducer.ts
@@ -50,6 +50,11 @@ const authReducer = createReducer(
     delete newState.session;
     return newState;
   }),
+  on(Actions.sessionLocked, state => {
+    const newState = { ...state };
+    delete newState.session;
+    return newState;
+  }),
   on(Actions.sessionRestored, (state, { session }) => ({
     ...state,
```

The effect is a little more involved, but only because we have some design decisions to make. We already have an effect that does exactly the thing we need to do. It is called `logoutSuccess$` since that is the only action it was concerned with before. That gives us two choices:

1. rename `loginSuccess$` to something more generic, and reuse it
1. create a new effect that does exactly the same thing

I believe the first solution makes the most sense in this case, so let's do that:

```diff
--- a/src/app/store/effects/auth/auth.effects.ts
+++ b/src/app/store/effects/auth/auth.effects.ts
@@ -11,6 +11,7 @@ import {
   logout,
   logoutFailure,
   logoutSuccess,
+  sessionLocked,
   unauthError,
 } from '@app/store/actions';
 import { AuthenticationService, SessionVaultService } from '@app/core';
@@ -64,10 +65,10 @@ export class AuthEffects {
     ),
   );

-  logoutSuccess$ = createEffect(
+  navigateToLogin$ = createEffect(
     () =>
       this.actions$.pipe(
-        ofType(logoutSuccess),
+        ofType(logoutSuccess, sessionLocked),
         tap(() => this.navController.navigateRoot(['/', 'login'])),
       ),
```

### Implement the `onSessionRestored` Event Handler

Currently, we are dispatching the `sessionRestored` action from the `restoreSession()` method, but Identity Vault has an event handler that makes for a more logical and "future proof" place to dispatch this action, so let's use that.

```diff
--- a/src/app/core/session-vault/session-vault.service.ts
+++ b/src/app/core/session-vault/session-vault.service.ts
@@ -39,11 +39,6 @@ export class SessionVaultService extends IonicIdentityVaultUser<Session> {

   async restoreSession(): Promise<Session> {
     const session = await super.restoreSession();
-
-    if (session) {
-      this.store.dispatch(sessionRestored({ session }));
-    }
-
     return session;
   }

@@ -51,6 +46,10 @@ export class SessionVaultService extends IonicIdentityVaultUser<Session> {
     this.store.dispatch(sessionLocked());
   }

+  onSessionRestored(session: Session) {
+    this.store.dispatch(sessionRestored({ session }));
+  }
+
```

That makes our `restoreSession()` code kinda pointless. We could just remove it and use the base class code, but don't. We are going to beef that up a bit right now.

### Override the `restoreSession()` Method

It is possible, especially during development, to get the vault in a state where we try to perform a restore while the vault itself is locked and cannot be unlocked. In such cases, we will just clear the vault, forcing a new login. It is really hard to test this scenario so we will just provide the code without a test.

Replace our currently pointless `restoreSession()` implementation with the following:

```TypeScript
  async restoreSession(): Promise<Session> {
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

You will need to import `VaultErrorCodes` from `@ionic-enterprise/identity-vault`.

If you build the app and run it on a device at this point, the app will lock after 5 seconds in the background, which will force you over to the login page. You don't currently have a way to unlock the app, but you can lock it. So far so good.

If you shut down the app and restart it, the vault will also be locked. However, since you are trying to restore the session as part of the vault logic, you will be asked for your PIN, finger print, face, etc (depending on your device capabilities). Providing the appropriate response will then unlock the app. Excellent!!

## `LoginPage` Modifications

The login screen still does not present a way to unlock the app, which is something we will fix now.

### New Property

The `LoginPage` will use a property to control when the unlock prompt is displayed and which icon is used. Create the following in the page's class and just assign default values for now:

```typescript
canUnlock: boolean = true;
```

Before going any further, make sure you are serving the application and are logged out. This will allow us to see the changes to the login page as we make them.

### Markup Changes

In cases where a locked session exists we want to display something that the user can click to begin the unlock process.

```HTML
    <div class="unlock-app ion-text-center" *ngIf="canUnlock" (click)="unlock()">
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

### Determine if we can Unlock

Add a method to `src/app/core/session-vault/session-vault.service.ts` that determines if we have a locked session that we are capable of unlocking:

```TypeScript
  async canUnlock(): Promise<boolean> {
    if (!(await this.hasStoredSession())) {
      return false;
    }
    const vault = await this.getVault();
    if (!(await vault.isLocked())) {
      return false;
    }

    const mode = await this.getAuthMode();
    return (
      mode === AuthMode.PasscodeOnly ||
      mode === AuthMode.BiometricAndPasscode ||
      (mode === AuthMode.BiometricOnly && (await this.isBiometricsAvailable()))
    );
  }
```

We can then update the page the check that value on init:

```diff
--- a/src/app/login/login.page.ts
+++ b/src/app/login/login.page.ts
@@ -4,6 +4,7 @@ import { Observable } from 'rxjs';

 import { selectAuthErrorMessage, State } from '@app/store';
 import { login, unlockSession } from '@app/store/actions';
+import { SessionVaultService } from '@app/core';

 @Component({
   selector: 'app-login',
@@ -17,10 +18,14 @@ export class LoginPage implements OnInit {

   errorMessage$: Observable<string>;

-  constructor(private store: Store<State>) {}
+  constructor(
+    private sessionVault: SessionVaultService,
+    private store: Store<State>,
+  ) {}

-  ngOnInit() {
+  async ngOnInit(): Promise<void> {
     this.errorMessage$ = this.store.select(selectAuthErrorMessage);
+    this.canUnlock = await this.sessionVault.canUnlock();
   }

   signIn() {
```

### Unlock the Session

We will need some actions to represent that the user clicked on the unlock item:

```diff
--- a/src/app/store/actions.ts
+++ b/src/app/store/actions.ts
@@ -14,6 +14,10 @@ export enum ActionTypes {
   LogoutSuccess = '[Auth API] logout success',
   LogoutFailure = '[Auth API] logout failure',

+  UnlockSession = '[Login Page] unlock session',
+  UnlockSessionSuccess = '[Vault API] unlock session success',
+  UnlockSessionFailure = '[Login Page] unlock session failure',
+
   UnauthError = '[Auth API] unauthenticated error',

   SessionLocked = '[Vault API] session locked',
@@ -73,6 +77,10 @@ export const sessionRestored = createAction(
   props<{ session: Session }>(),
 );

+export const unlockSession = createAction(ActionTypes.UnlockSession);
+export const unlockSessionSuccess = createAction(ActionTypes.UnlockSessionSuccess);
+export const unlockSessionFailure = createAction(ActionTypes.UnlockSessionFailure);
+
```

The `UnlockSession` needs to be dispatched from the `LoginPage`:

```TypeScript
  unlock() {
    this.store.dispatch(unlockSession())
  }
```

These actions do not directly change the state, so we do not need to update the reducers at all. Rather, if the unlock is successful, the state will be updated appropriately due to the session restore event handling we implemented earlier.

However, we will need some effects:

- for the UnlockSession, we need to attempt to restore the session
- for the UnlockSessionSuccess, we need to navigate away from the login page

Add the foollowing effect to `src/app/store/effects/auth/auth.effects.ts`. When the `unlockSession` action is dispatched, it will attempt to restore the session, dispatching a success or failure depending on the outcome.

```TypeScript
  unlockSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unlockSession),
      exhaustMap(() =>
        from(this.sessionVault.restoreSession()).pipe(
          map(session =>
            session ? unlockSessionSuccess() : unlockSessionFailure(),
          ),
          catchError(() => of(unlockSessionFailure())),
        ),
      ),
    ),
  );
```

Be sure to add the required `import` statements as well.

We do not need to do anything yet for the `UnlockSessionFailure` action. We will just stay where we are.

For the `UnlockSessionSuccess` action we need to navigate the same way we need to for the `LoginSuccess`. We will re-use that same effect after renaming it to `navigateToRoot$` similar to what we did for `navigateToLogin$`

Find the `loginSuccess$` effect in `src/app/store/effects/auth/auth.effects.ts` and tweak it slightly.

```diff
--- a/src/app/store/effects/auth/auth.effects.ts
+++ b/src/app/store/effects/auth/auth.effects.ts
@@ -73,10 +73,10 @@ export class AuthEffects {
     ),
   );

-  loginSuccess$ = createEffect(
+  navigateToRoot$ = createEffect(
     () =>
       this.actions$.pipe(
-        ofType(loginSuccess),
+        ofType(loginSuccess, unlockSessionSuccess),
         tap(() => this.navController.navigateRoot(['/'])),
       ),
     { dispatch: false },
```

## Problem: Exceptions on Restore

Run the application on a device. You should notice that the "happy path" works well. Try this:

1. Make sure biometric security is properly set up on your device.
1. Start the app and log in.
1. Put the app in the background (switch to a different app).
1. Wait 5 seconds.
1. Go back to the tea app, you will be at the login page and can unlock the session.
1. Unlock the session.
1. Close the app.
1. Restart the app.
1. At this point, it should ask for biometric credentials again, and if you supply them you are back in the app.

But now try this:

1. Close the app.
1. Restart the app.
1. Fail the biometric credentials.

At this point the app is bricked and you have to close it and restart to recover.

If you do something like remove your fingerprint from the device, you can also brick the app, but a restart will not fix that. You are stuck.o

If you were to hook them up to the Chrome or Safari dev tools and do a little debugging, it would not take long to narrow the issue down to an exception being thrown when you try to restore the session. The restore in question is the one we are doing in the auth guard.

This is pretty easy to fix:

```diff
--- a/src/app/core/auth-guard/auth-guard.service.ts
+++ b/src/app/core/auth-guard/auth-guard.service.ts
@@ -7,6 +7,7 @@ import { NavController } from '@ionic/angular';
 import { selectAuthToken, State } from '@app/store';
 import { SessionVaultService } from '../session-vault/session-vault.service';
 import { map, mergeMap, take, tap } from 'rxjs/operators';
+import { Session } from '@app/models';

 @Injectable({
   providedIn: 'root',
@@ -22,7 +23,7 @@ export class AuthGuardService implements CanActivate {
     return this.store.pipe(
       select(selectAuthToken),
       take(1),
-      mergeMap(token => (token ? of(token) : this.vault.restoreSession())),
+      mergeMap(token => (token ? of(token) : this.tryRestoreSession())),
       map(value => !!value),
       tap(sessionExists => {
         if (!sessionExists) {
@@ -31,4 +32,12 @@ export class AuthGuardService implements CanActivate {
       }),
     );
   }
+
+  private async tryRestoreSession(): Promise<Session | undefined> {
+    try {
+      return await this.vault.restoreSession();
+    } catch (err) {
+      return undefined;
+    }
+  }
```

If an exception occurs while trying to restore the session, we will just assume a bad session or bad vault resulting in going to the login page.

## Conclusion

At this point, it is a good idea to run the application on actual devices. Try the application on devices with and without biometrics.
