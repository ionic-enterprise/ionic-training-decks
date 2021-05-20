# Integrate Ionic's Identity Vault

Ionic Auth Connect provides three different choices for the storage of the authentication tokens.

- Default
  - uses local storage
  - not a good option for on device storage
  - meant to facilitate development
  - **do not use in production**
- Create your own `TokenStorageProvider`
  - create a service that implements `TokenStorageProvider`
  - you have to do the heavy lifting yourself
  - ultimate flexibility
- Use Ionic's Identity Vault
  - most secure option
  - minimal amount of work
  - **this is the preferred option**

Our application is currently using the `Default` option, which is not suitable for production. The preferred option for a secure project application is to use Ionic's Identity Vault to store the token. As such we will look at that integration now.

**Note:** this tutorial will not get in to all of the different options available via Ionic's Identity Vault. Instead, it focuses on the integration between Identity Vault and Auth Connect. Please refer to the Identity Vault training and documentation if you would like more information about Identity Vault.

If you only have access to Auth Connect and not to Identity Vault, let us know and we can provide you with a trial for Identity Vault. If you do not want to consider using Identity Vault, you should strongly consider the second option above and create your own `TokenStorageProvider` service. Doing so is not covered by this training. If you need assistance doing that, however, we would be happy to offer that assistance on an advisory basis.

## Installing Identity Vault

The first thing we need to do in order to use Ionic's Identity Vault is install it. Since we already have a key and have this project set up to use our key, we do not have to worry about performing the registration step. So let's install it and update our native projects:

```bash
npm i @ionic-enterprise/identity-vault
npx cap update
```

## The Vault Service

Similar to how we implemented Auth Connect, we will implement Identity Vault by creating a service within our application that extends a base Identity Vault class.

We will start with very basic Identity Vault configuration in `src/services/VaultService.ts`:

```TypeScript
import { IonicIdentityVaultUser, AuthMode } from '@ionic-enterprise/identity-vault';

export class VaultService extends IonicIdentityVaultUser<any> {
  constructor() {
    super(
      { ready: () => Promise.resolve() },
      {
        unlockOnAccess: true,
        hideScreenOnBackground: true,
        authMode: AuthMode.SecureStorage
      }
    );
  }
}

export const vaultService = new VaultService();
```

We will then import the `vaultService` into the `AuthenticationService` and set the `tokenStorageProvider` in `src/services/AuthenticationService.ts`:

```TypeScript
  constructor() {
    const config = getAuthConfig();
    config.tokenStorageProvider = vaultService;
    super(config);
  }
```

## Fix the Browser Support

That is really all we need to do in order to combine Auth Connect and Identity Vault but there is _one_ problem. This no longer works in the browser, and we realy would like to use the browser for almost all of our development efforts. The problem is that Identity Vault uses hardware APIs in order to encrypt and store the data. That hardware and the associated APIs do not exist within the browser. To get around this, we will create a substitue vault service that uses Capacitor's Storage plugin to store the keys.

The services that are required are boiler-plate, so let's just download them rather than going through writing them:

- `npm i @capacitor/storage`
- <a download href="/assets/packages/ionic-vue/browser-vault.zip">Download the zip file</a>
- unzip the file somewhere
- copy the `BrowserVaultPlugin.ts` and `BrowserVaultService.ts` files from where you unpacked them to `src/services`

The final change required is to import the `browserVaultPlugin` into our `VaultService` and override the `getPlugin()` method to return either the standard Identity Vault plugin or the "Browser Vault" plugin depending upon the context in which the application is being run.

Here is what the Vault Service looks like when we are done:

```TypeScript
import { IonicIdentityVaultUser, AuthMode, IonicNativeAuthPlugin } from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';
import { browserVaultPlugin } from './BrowserVaultPlugin';

export class VaultService extends IonicIdentityVaultUser<any> {
  constructor() {
    super(
      { ready: () => Promise.resolve() },
      {
        unlockOnAccess: true,
        hideScreenOnBackground: true,
        authMode: AuthMode.SecureStorage
      }
    );
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (isPlatform('hybrid')) {
      return super.getPlugin();
    }
    return browserVaultPlugin;
  }
}
```

Now when you run in the browser, the application will use the `BrowserVault` plugin and service to store the keys in a way that the browser can consume them.

## Conclusion

Congratulations. You now have a fully functional application that is utilizing Auth Connect and Identity Vault. However, this is just a starting point. For example, we are not currently using any of the more advanced storage modes that Identity Vault offers us (such as locking the keys behind a Biometric lock).

- For more information on different options that you can explore with Identity Vault, please see our [Identity Vault training](course/identity-vault/tabs/vue/page/0).
- We also have a <a href="https://github.com/ionic-team/tea-taster-vue/tree/feature/auth-connect" target="_blank">sample application</a> that demonstrates one way to integrate Auth Connect and Identity Vault into a real-world application.

If you have any question, please let us know. We are here to help.

Happy Coding!!
