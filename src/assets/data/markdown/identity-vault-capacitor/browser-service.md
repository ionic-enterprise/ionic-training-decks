# Lab: Add Browser Support

The Identity Vault uses hardware and APIs that are only available when we are running on a device. That limits our application to only being run on a device or emulator. That is less than ideal. We would like to be able to also run our application in a web context in order to support the following scenarios:

- Unit testing
- Running in the development server as we build out our application
- Deploying the application to the web for use as a PWA

In order to support this, we need to add a service that will perform the "Identity Vault" related tasks but store the token using `@ionic/storage` in order to save the token using a mechanism that is available to us in the browser.

## The Services

Two services need to be created. They both will reside in the `src/app/services/browser-auth` folder, so create that folder now.

### BrowserAuthService

The `BrowserAuthService` is based on the JavaScript interface for the Identity Vault itself. It contains all of the same methods that the actual Vault does. Many of these methods are just stubs. A few need to perform actions, however. For the most part, these actions involve storing and retrieving the authentication token using `@ionic/storage`. A common implementation looks like this:

```TypeScript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {
  BiometricType,
  IdentityVault,
  PluginConfiguration,
  AuthMode
} from '@ionic-enterprise/identity-vault';

@Injectable({
  providedIn: 'root'
})
export class BrowserAuthService implements IdentityVault {
  constructor(private storage: Storage) {}

  config = {
    authMode: AuthMode.SecureStorage,
    descriptor: {
      username: '',
      vaultId: ''
    },
    isBiometricsEnabled: false,
    isPasscodeEnabled: false,
    isPasscodeSetupNeeded: false,
    isSecureStorageModeEnabled: true,
    hideScreenOnBackground: false,
    lockAfter: 50000
  };

  unsubscribe(): Promise<void> {
    return Promise.resolve();
  }

  clear(): Promise<void> {
    return this.storage.clear();
  }

  lock(): Promise<void> {
    return Promise.resolve();
  }

  isLocked(): Promise<boolean> {
    return Promise.resolve(false);
  }

  async isInUse(): Promise<boolean> {
    return !!(await this.storage.get('session'));
  }

  getConfig(): Promise<PluginConfiguration> {
    return Promise.resolve(this.config);
  }

  remainingAttempts(): Promise<number> {
    return Promise.resolve(5);
  }

  getUsername(): Promise<string> {
    return Promise.resolve('MyUsername');
  }

  storeToken(token: any): Promise<void> {
    return Promise.resolve();
  }

  getToken(): Promise<any> {
    return Promise.resolve('MyToken');
  }

  async storeValue(key: string, value: any): Promise<void> {
    await this.storage.set(key, value);
  }

  getValue(key: string): Promise<any> {
    return this.storage.get(key);
  }

  getBiometricType(): Promise<BiometricType> {
    const none: BiometricType = 'none';
    return Promise.resolve(none);
  }

  setBiometricsEnabled(isBiometricsEnabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  isBiometricsEnabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isBiometricsAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isPasscodeSetupNeeded(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setPasscode(passcode?: string): Promise<void> {
    return Promise.resolve();
  }

  isPasscodeEnabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isSecureStorageModeEnabled(): Promise<boolean> {
    return Promise.resolve(true);
  }

  setPasscodeEnabled(isPasscodeEnabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  setSecureStorageModeEnabled(enabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  unlock(usingPasscode?: boolean, passcode?: string): Promise<void> {
    return Promise.resolve();
  }
}
```

### BrowserAuthPlugin

The `BrowserAuthPlugin` service mimics the Indentity Vault plugin's JavaScript interface that gets us access to the vault. Rather than returning an object that accesses the Vault plugin, the `BrowserAuthPlugin` service returns an instance of the `BrowserAuthService`, which is our browser-based service the implements the same API as the plugin. This code is very simple:

```TypeScript
import { Injectable } from '@angular/core';
import {
  IdentityVault,
  PluginOptions,
  IonicNativeAuthPlugin
} from '@ionic-enterprise/identity-vault';
import { BrowserAuthService } from './browser-auth.service';

@Injectable({ providedIn: 'root' })
export class BrowserAuthPlugin implements IonicNativeAuthPlugin {
  constructor(private browserAuthService: BrowserAuthService) {}

  getVault(config: PluginOptions): IdentityVault {
    config.onReady(this.browserAuthService);
    return this.browserAuthService;
  }
}
```

## Hooking it Up

### In the `IdentityService`

Inject an instantance of the `BrowserAuthPlugin` service.

```TypeScript
  constructor(
    private browserAuthPlugin: BrowserAuthPlugin,
    private http: HttpClient,
    platform: Platform
  ) {
    super(platform, { authMode: AuthMode.SecureStorage });
    this.changed = new Subject();
  }
```

The `getPlugin()` method from the base class needs to be overridden to return the injected instance of the `BrowserAuthPlugin`.

```TypeScript
  getPlugin(): IonicNativeAuthPlugin {
    if ((this.platform as Platform).is('cordova')) {
      return super.getPlugin();
    }
    return this.browserAuthPlugin;
  }
```

Note the casting of `this.platform` to `Platform`. The base class is minimal about the interface it expects for the `platform`. It is `{ ready: () => Promise<any> }`. This is in order to allow Identity Vault to be as framework independent as possible, not even depending on Ionic. We know we have a full `Platform` object, so we can safely cast it

### In the `IdentityServiceTest`

#### Test Setup

Now that we have the `BrowserAuthPlugin` being used by the service we can either mock it in the test or we can use it and mock the `Storage` service again. I suggest the latter.

```TypeScript
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IdentityService,
        { provide: Platform, useFactory: createPlatformMock },
        { provide: Storage, useFactory: createStorageMock }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });
```

If we stop excluding the tests (remove the `x` in the `xdescribe()`) they should all pass now.

#### The `set()` and `remove()` Methods

At this point, we have some untested functionallity from our previous lab. Let's add some tests that prove out that functionallity. For example, we changed our `set()` method as such:

```diff
   async set(user: User, token: string): Promise<void> {
     this.user = user;
-    await this.setToken(token);
+    await this.login({ username: user.email, token });
     this.changed.next(this.user);
   }
```

So we should add tests like the following to our `describe('set', ...` section to test out the `login` calls:

```TypeScript
    it('calls the base login method', async () => {
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledTimes(1);
    });

    it('passes the user e-mail and the token', async () => {
      spyOn(identity, 'login');
      await identity.set(user, 'IAmToken');
      expect(identity.login).toHaveBeenCalledWith({ username: user.email, token: 'IAmToken' });
    });
```

Add similar tests for the changes we made for `remove()`.

#### The `getToken()` Method

The tests for `getToken()` are a little more involved. We need to control the `token` value (which is a getter) using an underlying private property.

```TypeScript
  describe('getToken', () => {
    beforeEach(() => {
      spyOn(identity, 'restoreSession').and.callFake(async () => {
        (identity as any).session = { username: 'meh', token: 'dude' };
        return (identity as any).session;
      });
    });

    it('it restores the session and returns the restored token if there is no token', async () => {
      const token = await identity.getToken();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
      expect(token).toEqual('dude');
    });

    it('it returns the token from the current session if there is one', async () => {
      (identity as any).session = { username: 'blah', token: 'fubbily-doo-dah' };
      const token = await identity.getToken();
      expect(identity.restoreSession).not.toHaveBeenCalled();
      expect(token).toEqual('fubbily-doo-dah');
    });
  });
```

We are now covering a lot more of the logic in this service. Adding any other missing coverage is left as an exercise for the reader.
