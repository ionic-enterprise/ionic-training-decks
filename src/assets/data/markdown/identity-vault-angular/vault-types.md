# Other Auth Modes

In the last section, we implemented Identity Vault using the `SecureStorage` vault type. This type of vault simply stores the information in a secure location without ever locking it. In this section we will explore the other types of vaults that are available to us.

## Vault Types

Identity Vault supports multiple different types of vaults:

- **`VaultType.SecureStorage`**: Securely store the data in the key chain, but do not lock it.
- **`VaultType.DeviceSecurity`**: When the vault is locked, it needs to be unlocked via a mechanism provided by the device.
- **`VaultType.CustomPasscode`**: When the vault is locked, it needs to be unlocked via a custom method provided by the application. This is typically done in the form of a custom PIN dialog.
- **`VaultType.InMemory`**: The data is never persisted. As a result, if the application is locked or restarted, the data is gone.

In addition to the vault types, if `DeviceSecurity` is used, it is further refined by the `deviceSecurityType`, which can be any of the following values:

- **`DeviceSecurityType.Biometrics`**: Use the biometric authentication type specified by the device.
- **`DeviceSecurityType.SystemPasscode`**: Use the system passcode entry screen.
- **`DeviceSecurityType.Both`**: Use `Biometrics` with the `SystemPasscode` as a backup when `Biometrics` fails.

## Changing the Vault Type

When we create the vault, we create it as a `VaultType.SecureStorage` vault, which is a solid choice as a starting point since it will securely store the token without locking it.

```TypeScript
    const config: IdentityVaultConfig = {
      key: 'io.ionic.trainglabng',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 5000,
      unlockVaultOnLoad: false,
    };
```

We can change the Vault Type at runtime. However the `VaultType` values do not really mean anything to the user, so what we will do is first figure out terms that make sense in the user's space and then translate that to specific types of vaults.

From a user's perspective, they may want to use any of the following behaviors:

- Never lock the application. There is no timeout.
- Force the user to log in again after a timeout.
- Allow the application to be unlocked via the system passcode after a timeout.
- Allow the application to be unlocked via biometrics after a timeout, but use the system passcode as a backup.

Let's define these types in `src/app/core/session.service.ts`:

```TypeScript
export type LockMode = 'NeverLock' | 'ForceLogin' | 'Biometrics' | 'SystemPasscode';
```

We will allow the user to specify the locking mode when they log in. There are multiple ways that this can be done, but for simplicity we will use a simple `ion-select` under the password entry in `src/app/login/login.page.html`.

```html
<ion-item>
  <ion-label>Session Locking</ion-label>
  <ion-select id="lock-mode-select" name="lock-mode" [(ngModel)]="lockMode">
    <ion-select-option
      *ngFor="let lockMode of lockModes"
      [value]="lockMode.mode"
      >{{lockMode.label}}</ion-select-option
    >
  </ion-select>
</ion-item>
```

Let's add the code to support that in the TypeScript file:

```TypeScript
  lockMode: LockMode;
  lockModes: Array<{ mode: LockMode; label: string }> = [
    {
      mode: 'NeverLock',
      label: 'Never Lock the App',
    },
    {
      mode: 'ForceLogin',
      label: 'Force a New Login',
    },
  ];
```

## The `Device` API

We only included the first two lock modes because they are supported on all devices. The user, however, may not have their system passcode set up. Further they may either be running on a device that does not support biometrics or it may not currently be available (perhaps they have not set it up yet).

We can use the device API to determine if these lock modes can be used and conditionally add them to the `lockModes` array:

```TypeScript
import { Device } from '@ionic-enterprise/identity-vault';
...
  async ngOnInit() {
    if (await Device.isBiometricsEnabled()) {
      this.lockModes.push({
        mode: 'Biometrics',
        label: 'Use Biometrics',
      });
    }
    if (await Device.isBiometricsEnabled()) {
      this.lockModes.push({
        mode: 'Biometrics',
        label: 'Use Biometrics',
      });
    }
  }
```

## Native Modifications

In order to build this for an iOS device, you will need to supply a value for `NSFaceIDUsageDescription` with a message explaining why you want to use Face ID when getting the user's permissions. The easiest way to do this is:

- `npx cap open ios`
- open the `Info.plist` file in `Xcode`
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

Let's fix this by navigating to tab number three (which does not require authentication) when the session locks. Then we will have to unlock the session in order to go back to page two. Add the following code to `vault.service.ts`:

```TypeScript
  onVaultLocked() {
    this.navController.navigateRoot(['/', 'tabs', 'tab3']);
  }
```

**Note:** you will need to inject the `NavController`.

While we are responding to events like this, let's also cache the session in our service so we don't always have to go to the vault to get it. To do this, we will need to:

1. define a private property to cache the session as such: `private currentSession: Session | undefined;`
1. override the `login()` method to set the `currentSession` in addition to performing the base class functionality
1. override the `restoreSession()` method return the `currentSession` if it is set, and otherwise check with the vault
1. clear `currentSession` when the vault is locked
1. set `currentSession` when the session is restored

The code for that in `vault.service.ts` looks like this:

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
    this.navController.navigateRoot(['/', 'tabs', 'tab3']);
  }

  onSessionRestored(session: Session) {
    this.currentSession = session;
  }
```

Build the application an test it out on a device.

## Conclusion

We now have an application that allows the user to pick whichever authentication mode works best for them. Try the "Session PIN Unlock" option, though. Notice how the PIN experience is not very ideal. We can customize that, which is exactly what we will do in the next section.
