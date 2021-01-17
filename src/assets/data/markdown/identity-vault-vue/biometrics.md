# Lab: Add Biometrics

We will implement a workflow where-by if a user can use biometrics to secure their login, Biometrics will be used. Otherwise a PIN will be used. In order to accomplish this, we will need to modify the `IdentityService` to handle locking the vault, and we will need to modify the `LoginPage` to present the user with unlock options when the vault is locked.

## `SessionVaultService` Modifications

### Modify the Configuration

We need to add a couple of options to our configuration. Most notably, we need to tell Identity Vault how long, in milliseconds, the application should be in the background before the token is locked. This is handled via the `lockAfter` property. We will also tell Identity Vault to protect our data by hiding the screen content with the app is in the background, and that the Identity Vault should automatically try to unlock a locked vault upon attempting to access it.

We will eventually remove the `authMode` option and specify it during the login, but we will leave it in place for now.

```TypeScript
  constructor() {
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

Our store should be cleared when the vault is locked. We have an action for that. The `clear` action. We will dispatch that and navigate to the login page.

```TypeScript
  onVaultLocked(): void {
    store.dispatch('clear');
    router.replace('/login');
  }
```

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

If you shut down the app and restart it, the vault will also be locked. However, since you are trying to restore the session as part of the startup logic, you will be asked for your PIN, finger print, face, etc (depending on your device capabilities). Providing the appropriate response will then unlock the app. Excellent!!

## `LoginPage` Modifications

The login screen still does not present a way to unlock the app, which is something we will fix now.

### New Property

The `LoginPage` will use a property to control when the unlock prompt is displayed and which icon is used. Create the following reactive property in the page's `setup()`. Be sure to include it in the fuction's return object.'

```typescript
const canUnlock = ref(false);
```

Before going any further, make sure you are serving the application and are logged out. This will allow us to see the changes to the login page as we make them.

### Markup Changes

In cases where a locked session exists we want to display something that the user can click to begin the unlock process.

```HTML
    <div class="unlock-app ion-text-center" v-if="canUnlock" @click=unlock" data-testid="unlock-button">
      <ion-icon :icon="lockOpenOutline"></ion-icon>
      <div>Unlock</div>
    </div>
```

**Note:** be sure to import `lockOpenOutline` and return it from the `setup()` function (see `logInOutline` as a guide).

### Style Changes

We will also perform a little bit of styling to make the "unlock" part of the screen look better.

```CSS
<style scoped>
  .unlock-app {
    margin-top: 3em;
    font-size: xx-large;
  }
</style>
```

### Determine if we can Unlock

Add a method to `src/services/SessionVaultService.ts` that determines if we have a locked session that we are capable of unlocking:

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

We can then add the following to the `setup()` in the Login page to set the `canUnlock` value.

```TypeScript
sessionVaultService.canUnlock().then(x => (canUnlock.value = x));
```

### Unlock the Session

When unlocking, we need to dispatch the "restore" acction to the store. This will attempt the restore and reload the vault if it is successful. If a session is returned, we should navigate from the login page to the main route.

Add the following code to the `setup()` in the login page. Be sure to include the method in the return object.

```TypeScript
    async function unlock() {
      if (await store.dispatch('restore')) {
        router.replace('/');
      }
    }
```

In order for this to work, however, we are going to have to tweak the restore action to return the restored session.

```diff
--- a/src/store/actions.ts
+++ b/src/store/actions.ts
@@ -36,12 +36,13 @@ export const actions = {
   async restore({
     commit,
     dispatch,
-  }: ActionContext<State, State>): Promise<void> {
+  }: ActionContext<State, State>): Promise<Session | undefined> {
     const session = await sessionVaultService.restoreSession();
     if (session) {
       commit('SET_SESSION', session);
       dispatch('load');
     }
+    return session;
   },
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

If you do something like remove your fingerprint from the device, you can also brick the app, but a restart will not fix that. You are stuck.

This is pretty easy to fix:

```diff
--- a/src/store/actions.ts
+++ b/src/store/actions.ts
@@ -6,6 +6,14 @@ import { sessionVaultService } from '@/services/SessionVaultService';
 import { State } from './state';
 import { Session } from '@/models';

+async function restoreSession(): Promise<Session | undefined> {
+  try {
+    return await sessionVaultService.restoreSession();
+  } catch(err) {
+    return undefined;
+  }
+}
+
 export const actions = {
   async login(
     { commit, dispatch }: ActionContext<State, State>,
@@ -37,7 +45,7 @@ export const actions = {
     commit,
     dispatch,
   }: ActionContext<State, State>): Promise<Session | undefined> {
-    const session = await sessionVaultService.restoreSession();
+    const session = await restoreSession();
     if (session) {
       commit('SET_SESSION', session);
       dispatch('load');
```

If an exception occurs while trying to restore the session, we will just assume a bad session or bad vault, so no session. If there is no session, the auth guard will redirect to the login page where the user can either try the unlock again or perform a fresh login.

## Conclusion

At this point, it is a good idea to run the application on actual devices. Try the application on devices with and without biometrics.
