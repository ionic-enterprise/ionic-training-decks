# Install Identity Vault

The first thing we need to do is install Identity Vault. In order to do this, you will need to have an Ionic Enterprise key that includes access to Identity Vault. Since you are working through this particular tutorial, it is assumed that you have one. There are two ways you can associate this application with your Ionic Enterprise key:

- you can perform this <a href="https://ionic.io/docs/premier-plugins/setup" target="_blank">registration</a>
- or you can copy the `.npmrc` file from your production application if you have already performed the registration there

**Note:** your key is only for a single production application, but you can use it with as many training exercises as you would like. The same holds true for prototype applications. If you would like to whip up a prototype application in which to try a new authentication workflow that you may incorporate into your production application, please do. If you need to use Identity Vault in more production applications, however, please contact us about obtaining more keys.

Once the app is properly registered (or the `.npmrc` file is properly copied over), you should perform the following commands to install Identity Vault and update your native projects:

```bash
npm i @ionic-enterprise/identity-vault
npx cap update
```

## Add the Vault

In order to integrate Identity Vault into our application, we will create a vault object within our session service and modify the methods within the service to use it.

```TypeScript
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { Session } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private session: Session | undefined;
  private sessionKey = 'session';
  private vault: Vault | BrowserVault;

  constructor() {
    const config: IdentityVaultConfig = {
      key: 'io.ionic.trainglabng',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 5000,
      unlockVaultOnLoad: false,
    };

    this.vault = Capacitor.isNativePlatform()
      ? new Vault(config)
      : new BrowserVault(config);
  }

  async set(session: Session): Promise<void> {
    this.session = session;
    return this.vault.setValue(this.sessionKey, session);
  }

  async get(): Promise<Session | undefined> {
    if (!this.session) {
      this.session = await this.vault.getValue(this.sessionKey);
    }
    return this.session;
  }

  async clear(): Promise<void> {
    this.session = undefined;
    this.vault.clear();
  }
}
```

This is what our configuration means:

- `key`: This is just the way that Identity Vault identifies this entry in the key storage area on the device. This value needs to be different for each vault within the application. Most applications only have a single vault.
- `type`: The type of vault determines the mechanism used for locking the vault. In this case, we are using `VaultType.SecureStorage`, which securely stores the session data but never locks it. We will explore other vault types later.
- `deviceSecurityType`: The deviceSecurityType determines the exact type of device security (Biometrics or Passcode) to use when using device security to lock the vault. We aren't using device security (yet), so we just specify `None`. We could also leave this unspecified in this case if we wanted to.
- `lockAfterBackgrounded`: The number of milliseconds that the app is in the background before the vault will be locked. We are setting this to 5 seconds. This will matter when we start using a `VaultType` that locks the vault.
- `unlockVaultOnLoad`: If this is `true` we will try to unlock the vault when the application loads. With a value of `false`, attempting to unlock a locked vault is delayed until the data in the vault first needs to be accessed.

For a full explanation of all of the configuration options, please see <a href="https://ionic.io/docs/identity-vault/interfaces/identityvaultconfig" target="_blank">the IdentityVaultConfig documentation</a>.

If you build and run the application at this point, you should be able to log in and have your session persist after you close and restart the application.

## Supporting the Browser

Take note of the following line:

```TypeScript
    this.vault = Capacitor.isNativePlatform()
      ? new Vault(config)
      : new BrowserVault(config);
```

The `Vault` only works on iOS and Android since they have a secure storage mechanism, but not on the browser since it does not. As a result, we only instantiate a `Vault` if we are running on a native platform.

One of the biggest advantages of using Ionic, however, is the ability to develop our app using standard web based workflows, which includes running in the browser rather than on a device. In order to facilitate this, you can use the `BrowserVault`. The `BrowserVault` uses `localstorage` to store the session information, and it never locks since there is no lock/unlock mechanism that is available.

As such, using `BrowserVault` is intended _only_ for development purposes.

## Conclusion

We are now using Identity Vault to securely persist our session between application reloads. Next we will look at using various authentication modes in order to lock and unlock the vault.
