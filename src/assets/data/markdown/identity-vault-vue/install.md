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

## A Simple Vault Service

In order to ingegrate Identity Vault into our application, we will extend the `IonicIdentityVaultUser` class that is provided by Identity Vault. Using this class, we will configure the vault and interact with it.

When integrating Identity Vault into an existing application, there is quite often a service that is a natural choice to convert. We already have a `VaultService` and we will convert it to use Identity Vault. Most other applications have a service that manages the the current session. Other common names for these services are `IdentityService` or `SessionService`. Whatever this service is in your existing system is a good candidate. In many cases, you can modify this service to extend Identity Vault. This has the advantage of needing to make few changes throughout the rest of the appliction as the workflow for how the current session information is obtained is already defined.

In our tutorial application, we will convert the `VaultService` to extend `IonicIdentityVaultUser`. We had intentionally created this service to match the calling conventions of Identity Vault. In a real world app, you may need to perform a bit more adaptation at this point in order to avoid too much refactoring.

```TypeScript
import {
  AuthMode,
  IonicIdentityVaultUser,
} from '@ionic-enterprise/identity-vault';
import { Session } from '@/models';

class VaultService extends IonicIdentityVaultUser<Session> {
  constructor() {
    super(
      { ready: () => Promise.resolve() },
      {
        unlockOnAccess: true,
        hideScreenOnBackground: true,
        lockAfter: 5000,
        authMode: AuthMode.SecureStorage,
      }
    );
  }
}

export const vault = new VaultService();
```

Note the first parameter: `{ ready: () => Promise.resolve() }`. Identity Vault expects an object with a `ready()` method. This is for use with Cordova where we have to await the "device ready" event. With `@ionic/vue` we are using Capacitor for the native layer, so there is no need for this, thus we pass a stub instead.

This is what our configuration means:

- `unlockOnAccess`: if the vault is locked, unlock the vault when the application attempts to access the session. If this value is false, the application will need to call `unlock()` itself. This value is typically `true` unless you want fine-grained control over the unlock workflow.
- `hideScreenOnBackground`: setting this option `true` results in a privacy screen being displayed rather than a snaphot of the application when it is in the background.
- `lockAfter`: the number of milliseconds to wait before locking the vault when the application is in the background.
- `authMode`: the method to use to unlock the vault. In the case of `SecureStorage`, the session will be stored in a secure location, but the vault will never lock.

For a full explanation of all of the configuration options, please see <a href="https://ionic.io/docs/identity-vault/api#vaultoptions" target="_blank">the VaultOptions documentation</a>.

If you build and run the application on a device at this point, you should be able to log in and have your session persist after you close and restart the application.

## Supporting the Browser

Since Identity Vault is used to store the authentication tokens in a secure location on mobile devices and since there is no such thing as a secure storage mechanism in the browser, Identity Vault does not, by default, work in the browser. However, we would still like to be able to use the browser as our primary platform when doing development. In order to do this, we will need to create a fake "browser vault" plugin and service. The reason it is fake is that the web does not actually have a secure vault location where data like this can be stored. Instead, we will create services that use the same interface as the Vault users. This fake plugin will then use `@capacitor/storage` as its storage mechanism.

The classes themselves are boiler-plate, so let's just download them rather than going through writing it:

- <a download href="/assets/packages/ionic-vue/browser-vault.zip">Download the zip file</a>
- unzip the file somewhere
- copy the `BrowserVaultService.ts` and `BrowserVaultPlugin.ts` files from where you unpacked them to `src/services`

Finally, in the `VaultService` class, import the `browserVaultPlugin` service and override the `getPlugin()` method to use the real plugin if the application is run in a hybrid mobile context, and the fake "browser vault" otherwise.

When completed, the service will look like this:

```TypeScript
import { Session } from '@/models';
import {
  AuthMode,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';
import { browserVaultPlugin } from './BrowserVaultPlugin';

class VaultService extends IonicIdentityVaultUser<Session> {
  constructor() {
    super(
      { ready: () => Promise.resolve() },
      {
        unlockOnAccess: true,
        hideScreenOnBackground: true,
        lockAfter: 5000,
        authMode: AuthMode.SecureStorage,
      },
    );
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (isPlatform('hybrid')) {
      return super.getPlugin();
    }
    return browserVaultPlugin;
  }
}

export const vault = new VaultService();
```

Now when you run in the browser, the application will use the `BrowserVaultPlugin` and `BrowserVaultService` classes to store the keys in a way that the browser can consume them.

## Conclusion

We are now using Identity Vault to securely persist our session between application reloads. Next we will look at using various authentication modes in order to lock and unlock the vault.
