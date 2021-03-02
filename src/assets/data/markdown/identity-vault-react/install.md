# Lab: Installation and Basic Setup

## Install Identity Vault

Before we can use Identity Vault, we need to install it and update the native projects.

```Bash
ionic enterprise register --key=YOURPRODUCTKEY
npm i @ionic-enterprise/identity-vault
npx cap update
```

**Note:** if you have already registered your product key using a different app, you can just copy the `.npmrc` file from the other application to this training application. Since this is just a training app, we do not care that you are using your key here and in your production application at the same time.

## Browser Auth Plugin and Classes

Identity Vault uses hardware and APIs that are only available when we are running on a device as a hybrid mobile application. That limits our application to only being run on a device or emulator. That is less than ideal. We would like to be able to also run our application in a web context in order to support the following scenarios:

- Unit testing
- Running in the development server as we build out our application
- Deploying the application to the web for use as a PWA

In order to support these scenarios, we need to add a singleton class that will perform the "Identity Vault" related tasks but store the token using the Capacitor Storage API, similar to what our app is currently doing.

### The Classes

Two classes need to be created. They both will reside in the `src/app/core/vault` folder, so create that folder now.

#### BrowserVault

The `BrowserVault` is based on the JavaScript interface for the Identity Vault itself. It contains all of the same methods that the actual Vault does. Many of these methods are just stubs. A few need to perform actions, however. For the most part, these actions involve storing and retrieving the authentication token using the Capacitor Storage API. A common implementation looks like this:

```TypeScript
import { Plugins } from '@capacitor/core';
import {
  IdentityVault,
  PluginConfiguration,
  AuthMode,
  SupportedBiometricType,
  BiometricType,
} from '@ionic-enterprise/identity-vault';

export class BrowserVault implements IdentityVault {
  private static instance: BrowserVault | undefined = undefined;

  config = {
    authMode: AuthMode.SecureStorage,
    descriptor: {
      username: '',
      vaultId: '',
    },
    isBiometricsEnabled: false,
    isPasscodeEnabled: false,
    isPasscodeSetupNeeded: false,
    isSecureStorageModeEnabled: true,
    hideScreenOnBackground: false,
    lockAfter: 50000,
  };

  private constructor() {}

  public static getInstance(): BrowserVault {
    if (!BrowserVault.instance) {
      BrowserVault.instance = new BrowserVault();
    }
    return BrowserVault.instance;
  }

  async unsubscribe(): Promise<void> {}

  async clear(): Promise<void> {
    const { Storage } = Plugins;
    await Storage.clear();
  }

  async lock(): Promise<void> {}

  async isLocked(): Promise<boolean> {
    return false;
  }

  async isInUse(): Promise<boolean> {
    const { Storage } = Plugins;
    return !!(await Storage.get({ key: 'session' }));
  }

  async getConfig(): Promise<PluginConfiguration> {
    return this.config;
  }

  async remainingAttempts(): Promise<number> {
    return 5;
  }

  async getUsername(): Promise<string> {
    return 'MyUsername';
  }

  async storeToken(token: any): Promise<void> {}

  async getToken(): Promise<any> {
    return 'MyToken';
  }

  async storeValue(key: string, value: any): Promise<void> {
    const { Storage } = Plugins;
    await Storage.set({ key, value: JSON.stringify(value) });
  }

  async getValue(key: string): Promise<any> {
    const { Storage } = Plugins;
    const { value } = await Storage.get({ key });
    return JSON.parse(value!);
  }

  async removeValue(key: string): Promise<void> {
    const { Storage } = Plugins;
    await Storage.remove({ key });
  }

  async getKeys(): Promise<Array<string>> {
    const { Storage } = Plugins;
    const { keys } = await Storage.keys();
    return keys;
  }

  // tslint:disable-next-line
  async getBiometricType(): Promise<BiometricType> {
    return 'none';
  }

  async getAvailableHardware(): Promise<Array<SupportedBiometricType>> {
    return [];
  }

  async setBiometricsEnabled(isBiometricsEnabled: boolean): Promise<void> {}

  async isBiometricsEnabled(): Promise<boolean> {
    return false;
  }

  async isBiometricsAvailable(): Promise<boolean> {
    return false;
  }

  async isBiometricsSupported(): Promise<boolean> {
    return false;
  }

  async isLockedOutOfBiometrics(): Promise<boolean> {
    return false;
  }

  async isPasscodeSetupNeeded(): Promise<boolean> {
    return false;
  }

  async setPasscode(passcode?: string): Promise<void> {}

  async isPasscodeEnabled(): Promise<boolean> {
    return false;
  }

  async isSecureStorageModeEnabled(): Promise<boolean> {
    return true;
  }

  async setPasscodeEnabled(isPasscodeEnabled: boolean): Promise<void> {}

  async setSecureStorageModeEnabled(enabled: boolean): Promise<void> {}

  async unlock(usingPasscode?: boolean, passcode?: string): Promise<void> {}
}Brows
```

Create a `src/app/core/vault/BrowserVault.ts` file with the above contents.

#### BrowserVaultPlugin

The `BrowserVaultPlugin` classes mimics the Indentity Vault plugin's JavaScript interface that gets us access to the vault. Rather than returning an object that accesses the Vault plugin, the `BrowserVaultPlugin` service returns the singleton instance of `BrowserVault`, which is our browser-based service that implements the same API as the plugin. This code is very simple:

```TypeScript
import {
  IdentityVault,
  IonicNativeAuthPlugin,
  PluginOptions,
} from '@ionic-enterprise/identity-vault';
import { BrowserVault } from './BrowserVault';

export class BrowserVaultPlugin implements IonicNativeAuthPlugin {
  private static instance: BrowserVaultPlugin | undefined = undefined;

  private constructor() {}

  public static getInstance(): BrowserVaultPlugin {
    if (!BrowserVaultPlugin.instance) {
      BrowserVaultPlugin.instance = new BrowserVaultPlugin();
    }
    return BrowserVaultPlugin.instance;
  }

  getVault(config: PluginOptions): IdentityVault {
    config.onReady!(BrowserVault.getInstance());
    return BrowserVault.getInstance();
  }
}
```

Create a `src/app/core/vault/BrowserVaultPlugin.ts` file with the above contents.

## Conclusion

Now that Identity Vault has been installed, it is time to modify the application to use Identity Vault. We will do this in baby steps. Our first step will just be to get the application working essetially as it is today, except using Idenity Vault for the storage of the session information.
