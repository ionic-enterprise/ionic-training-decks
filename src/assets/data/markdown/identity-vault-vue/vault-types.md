# Other Auth Modes

In the last section, we implemented Identity Vault using the `SecureStorage` auth mode. This auth mode simply stores the information in a secure location without ever locking it. In this section we will explore the other auth modes that are available to us.

## Auth Modes

Identity Vault supports multiple different authentication of modes. The most commonly used modes are:

- **`SecureStorage`**: data is stored in a secure location on the device, but the vault is never locked. With this vault, the data stored in the vault is always accessible so long as the user has unlocked the device via a secure method.
- **`PasscodeOnly`**: the vault is locked after the application has been in the background for a specified period of time or when the application is closed. With this mode, the user will be prompted to supply a custom PIN for the session. This data stored in the vault will only be accessible after the user unlocks the vault via the supplied PIN.
- **`BiometricOnly`**: the vault is locked after the application has been in the background for a specified period of time or when the application is closed. With this mode, the data stored in the vault is only accessible after the user unlocks the vault with a the biometric authentication mechanism supported by the device.
- **`BiometricAndPasscode`**: the vault is locked after the application has been in the background for a specified period of time or when the application is closed. With this mode, the data stored in the vault is only accessible after the user unlocks the vault with a the biometric authentication mechanism supported by the device. A session PIN is established at the time the session is stored, and is used as a backup for cases where biometric authentication fails or is not available.
- **`InMemoryOnly`**: the session is never stored in the vault. It is simply cleared whenever the application is closed or has been in the background `lockAfter` number of millisecond.

## Specifying the Authentication Mode

Currently, we are setting the authentication mode when we instantiate the vault. This is a poor time to do this, so let's remove that line of code:

```diff
--- a/src/services/VaultService.ts
+++ b/src/services/VaultService.ts
@@ -15,7 +15,6 @@ class VaultService extends IonicIdentityVaultUser<Session> {
         unlockOnAccess: true,
         hideScreenOnBackground: true,
         lockAfter: 5000,
-        authMode: AuthMode.SecureStorage,
       },
     );
   }
```

Have a look at the login page, and you will see that we are calling `vault.login();` only passing the session information. This will register our session with the vault using the current auth mode. This method can take a second parameter, which is the authentication mode to use. Let's modify the login page to pass that value.

First, modify the `template` to present the user with some options for the authentication mode. Add the following markup within the `ion-list`

```html
<ion-item v-if="displayAuthMode">
  <ion-label>Session Locking</ion-label>
  <ion-select v-model="authMode" data-testid="auth-mode-select">
    <ion-select-option
      v-for="authMode of authModes"
      :value="authMode.mode"
      :key="authMode.mode"
      >{{ authMode.label }}</ion-select-option
    >
  </ion-select>
</ion-item>
```

**Note:** remember to add `IonSelect` and `IonSelectOption` to the list of `components`.

Next, modify the `code` to populate the data we need for the `ion-select` we just added. The following will need to be added to the `setup()`:

```TypeScript
    const authMode = ref<number>();
    const authModes = ref<Array<{ mode: AuthMode; label: string }>>([
      {
        mode: AuthMode.PasscodeOnly,
        label: 'Session PIN Unlock',
      },
      {
        mode: AuthMode.SecureStorage,
        label: 'Never Lock Session',
      },
      {
        mode: AuthMode.InMemoryOnly,
        label: 'Force Login',
      },
    ]);
    vault.isBiometricsAvailable().then(available => {
      if (available) {
        authModes.value = [
          {
            mode: AuthMode.BiometricOnly,
            label: 'Biometric Unlock',
          },
          ...authModes.value,
        ];
      }
      authMode.value = authModes.value[0].mode;
    });
    const displayAuthMode = computed(() => isPlatform('hybrid'));
```

Please be sure to do the following as well:

- add `import { AuthMode } from '@ionic-enterprise/identity-vault';`
- add `computed` to the import from `vue`
- add `isPlatform` to the import from `@ionic/vue`
- return the newly defined `authMode`, `authModes`, and `displayAuthMode` at the end of the `setup()` function

Finally, we will pass the chosen authentication mode to the vault when we register the current session:

```TypeScript
        vault.login(
          {
            user,
            token,
          },
          authMode.value,
        );
```

Putting all of the code together, the `setup()` for this page should look something like this:

```TypeScript
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const authMode = ref<number>();
    const authModes = ref<Array<{ mode: AuthMode; label: string }>>([
      {
        mode: AuthMode.PasscodeOnly,
        label: 'Session PIN Unlock',
      },
      {
        mode: AuthMode.SecureStorage,
        label: 'Never Lock Session',
      },
      {
        mode: AuthMode.InMemoryOnly,
        label: 'Force Login',
      },
    ]);
    vault.isBiometricsAvailable().then(available => {
      if (available) {
        authModes.value = [
          {
            mode: AuthMode.BiometricOnly,
            label: 'Biometric Unlock',
          },
          ...authModes.value,
        ];
      }
      authMode.value = authModes.value[0].mode;
    });
    const displayAuthMode = computed(() => isPlatform('hybrid'));

    async function signInClicked() {
      const { success, user, token } = await AuthenticationService.login(
        email.value,
        password.value,
      );
      if (success && user && token) {
        vault.login(
          {
            user,
            token,
          },
          authMode.value,
        );
        router.replace('/');
      }
    }

    return {
      authMode,
      authModes,
      displayAuthMode,
      email,
      password,
      logInOutline,
      signInClicked,
    };
  },
```

## Native Modifications

In order to build this for an iOS device, you will need to supply a value for `NSFaceIDUsageDescription` with a message explaining why you want to use Face ID when getting the user's permissions. Thest easiest way to do this is:

- `npx cap open ios`
- open the `Info.plst` file in `Xcode`
- add and entry for `NSFaceIDUsageDescription` with a value like "Use Face ID to unlock the application"

Build the application and deploy it to a device.

The user can now choose which authentication mode to use. Play around with some of the authentication modes and see how the app behaves as you go to pages that require a valid session, namely tabs one and two.

## Responding to Vault Events

Try the following test:

1. log in using any mode other than "Never Lock Session" (SecureStorage)
1. navigate to tab two
1. put the app in the background for 5 or more seconds
1. come back to the app

Notice at this point that we can still see the data on page 2 even though the app is locked. This page requires us to be logged in with an unlocked session in order to navigate to it, but since we are already there we aren't blocked. However, if you then navigate to tab 3 and back to tab 2 you _will_ need to unlock the vault.

Let's fix this by navigating to tab number three (which does not require authentication) when the session locks. Then we will have to unlock the session in order to go back to page two. Add the following code to `VaultService.ts`:

```TypeScript
  onVaultLocked() {
    router.replace('/tabs/tab3');
  }
```

Remember to import the router (`import router from '@/router';`).

While we are responding to events like this, let's also cache the session in our service so we don't always have to go to the vault to get it. To do this, we will need to:

1. define a private property to cache the session as such: `private currentSession: Session | undefined;`
1. override the `login()` method to set the `currentSession` in addition to performing the base class functionallity
1. override the `restoreSession()` method return the `currentSession` if it is set, and otherwise check with the vault
1. clear `currentSession` when the vault is locked
1. set `currentSession` when the session is restored

The code for that in `VaultService.ts` looks like this:

```TypeScript
  login(session: Session, mode?: AuthMode): Promise<void> {
    this.currentSession = session;
    return super.login(session, mode);
  }

  async restoreSession(): Promise<Session | undefined> {
    return this.currentSession || super.restoreSession();
  }

  onVaultLocked() {
    this.currentSession = undefined;
    router.replace('/tabs/tab3');
  }

  onSessionRestored(session: Session) {
    this.currentSession = session;
  }
```

Build the application an test it out on a device.

## Conclusion

We now have an application that allows the user to pick whichever authentication mode works best for them. Try the "Session PIN Unlock" option, though. Notice how the PIN experiance is not very ideal. We can customize that, which is exactly what we will do in the next section.
