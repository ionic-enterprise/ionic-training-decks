# Lab: Identity Service

## Install Identity Vault

Before we can use Identity Vault, we need to install it. In order to install it, we need to be using the `@ionic-enterprise/cordova` version of the CLI. If you have not already set this up on your development machine, run the following commands:

```Bash
$ npm uninstall -g cordova
$ npm install -g @ionic-enterprise/cordova
```

Once that is set up properly, make sure you are in your `iv-training-starter` working directory and run the following commands:

```Bash
$ ionic enterprise register --key=YOURPRODUCTKEY
$ npm i @ionic-enterprise/identity-vault
```

_Note:_ Two different commands exist for installing Identity Vault in your project depending on whether you are using Capacitor or Cordova:

- _Capacitor_: `npm i @ionic-enterprise/identity-vault`
- _Cordova_: `ionic cordova plugin add @ionic-enterprise/identity-vault`

Be sure to use the correct command based on your application's stack. Since we are using Capacitor, we need to use the `npm install` based command. We also need to make sure the native projects get updated with the newly installed Cordova plugin:

```
$ npx cap update
```

## Inherit from `IonicIdentityVaultUser`

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin. By the end of this section, we will have updated our `IdentityService` to be a subclass of the `IonicIdentityVaultUser` class, giving us the access we need to the Identity Vault functionallity.

### Update the Unit Test

First we need to update our unit tests.

#### Remove Storage

Many of the requirements for the `IdentityService` change since we are change how the token is stored. We will start by removing the tests for requirements that no longer exist. Namely, any requirement to store data using `@ionic/storage`.

We will no longer require the setup and configuration of the `Storage` mock (see the main `beforeEach()` as well as the imports section at the top of the file). Comment out that code. As it turns out we will need it later.

At this point it should be easy to find the tests we no longer need. They will be the tests that reference the now removed `storage` reference. For example, all of the following tests can be removed:

```TypeScript
    it('waits for the storage to be ready', async () => {
      await identity.set(user, 'IAmAToken');
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('sets the token', async () => {
      await identity.set(user, 'IAmAToken');
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('auth-token', 'IAmAToken');
    });

    it('caches the token', async () => {
      await identity.set(user, 'IAmAToken');
      expect(await identity.getToken()).toEqual('IAmAToken');
      expect(storage.get).not.toHaveBeenCalled();
    });
```

All references to "storage" within this test should have now been eliminated.

#### Add the Platform service

The `IonicIdentityVaultUser` takes the `Platorm` service as its first parameter (actually, it takes any object with a `ready()` method). `IdentityService` will have the `Platform` service injected into it, so we need to set that up in our test. We will just use a mock `Platform` service. When we are done, the `TestBed` configuration should look something like this:

```TypeScript
  beforeEach(() => {
    // storage = createStorageMock();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IdentityService,
        // { provide: Storage, useValue: storage },
        { provide: Platform, useFactory: createPlatformMock }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  })
```

#### Ignore all of the Tests (for now)

When we make `IdentityService` a subclass of `IonicIdentityVaultUser`, it will start using the Identity Vault Cordova plugin. This will not work in a web context because no Cordova. We will find out how to deal with this situation in the next section. For now, we will just exclude this whole file by changing the main `describe()` to an `xdescribe()`.

### Update the Code

Our `IdentityService` needs to be changed to inherit from `IonicIdentityVaultUser` using the `DefaultSession` type.

#### Imports

Remove the import from `@ionic/storage`. Instead import the required items from `@ionic/angular` and `@ionic-enterprise/identity-vault`:

```TypeScript
import { Platform } from '@ionic/angular';
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser
} from '@ionic-enterprise/identity-vault';
```

#### Construction

Our `IdentityService` class should extent the `IonicIdentityVaultUser` class. As a result of that, we will need to call the `IonicIdentityVaultUser`'s constrctuor from our constrctor passing the platform service and a configuration object. For now, the only configuration we will make is to use "Secure Storage" as the `AuthMode`. This will result in our application behaving in a similar manner to how it did before, but it will store the token in a secure manner.

```TypeScript
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  ...
  constructor(private http: HttpClient, platform: Platform ) {
    super(platform, { authMode: AuthMode.SecureStorage });
    this.changed = new Subject();
  }
  ...
}
```

#### `set()`

Instead of saving the token using Ionic Storage, use a call to the base class's `login()` method to store the token in the vault.

```diff
   async set(user: User, token: string): Promise<void> {
     this.user = user;
-    await this.setToken(token);
+    await this.login({ username: user.email, token });
     this.changed.next(this.user);
   }
```

#### `getToken()`

If the token is not currently set within the service, we need to obtain the token from the vault rather than from Ionic Storage. Call the base class's `restoreSession()` to accomplish this.

```diff
   async getToken(): Promise<string> {
     if (!this.token) {
-      await this.storage.ready();
-      this.token = await this.storage.get(this.tokenKey);
+      await this.restoreSession();
     }
     return this.token;
   }
```

#### `remove()`

Rather than removing the token using Ionic Storage, call the base class's `logout()` method which will remove the token from the vault.

```TypeScript
   async remove(): Promise<void> {
     this.user = undefined;
-    await this.setToken('');
+    await this.logout();
     this.changed.next(this.user);
   }
```

#### `restoreSession()`

It is possible for the vault to get into a state where it it locked but cannot be unlocked. For example if a user locks via touch ID and then removes their fingerprint. In this case, we will get a `VaultErrorCodes.VaultLocked` error indicating that we cannot unlock the vault. If this is the case, clear the vault so the user can log in again.

```TypeScript
  async restoreSession(): Promise<DefaultSession> {
    try {
      return await super.restoreSession();
    } catch (error) {
      if (error.code === VaultErrorCodes.VaultLocked) {
        const vault = await this.getVault();
        await vault.clear();
      }
    }
  }
```

#### Final Cleanup

At this point, there should be some dead code and unused parameters. If you are using VSCode these will show with a lighter font. Remove all of the dead code and unused parameters and/or imports.

## Conclusion

At this point, the application should no longer work in the browser and you will need to run it on a device (we will fix that soon). Try it out on your device:

- `npm run build`
- `npx cap open ios` or `npx cap open android`
- use Xcode or Android Studio to run the application on your attached device
