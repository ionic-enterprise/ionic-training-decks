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
$ ionic cordova plugin add @ionic-enterprise/identity-vault
```

The above command will have created a `resources/` folder and a `config.xml` file. Since this is a Capacitor application, these items will not be used and can be removed.

Since we are using Capacitor, however, we need to make sure the native projects get updated with the newly installed Cordova plugin:

```
$ npx cap update
```

## Inherit from `IonicIdentityVaultUser`

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin.

The original code contained a service that had a very similar role. This is the `IdentityService`. We will make the `IdentityService` a subclass of the `IonicIdentityVaultUser` class.

### Update the Unit Test

#### Remove Storage

At this point, many of the requirements for the `IdentityService` change. We will start by removing the tests for requirements that no longer exist. Namely, any requirement to store data using `@ionic/storage`.

For example, all of the following tests can be removed:

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

At this point, we can also remove the setup and configuration of the `Storage` mock (see the main `beforeEach()`). All references to "storage" within this test should have now been eliminated. Be sure to also clean up any unsed declarations and imports at this time.

#### Add the Platform service

The `IonicIdentityVaultUser` takes the `Platorm` service as its first parameter (actually, it takes any object with a `ready()` method). `IdentityService` will have the `Platform` service injected into it, so we need to set that up in our test. We will just use a mock `Platform` service. When we are done, the `TestBed` configuration should look something like this:

```TypeScript
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IdentityService,
        { provide: Platform, useFactory: createPlatformMock }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
  })
```

#### Ignore all of the Tests (for now)

When we make `IdentityService` a subclass of `IonicIdentityVaultUser`, it will start using the Identity Vault Cordova plugin. This will not work in a web context because no Cordova. We will find out how to deal with this situation in the next section. For now, we will just exclude this whole file by changing the main `describe()` to an `xdescribe()`.

### Update the Code

Our `IdentityService` needs to be changed to inherit from `IonicIdentityVaultUser` using the `DefaultSession` type.

#### Imports

Revmoe the import from `@ionic/storage`. Instead import the required items from `@ionic/angular` and `@ionic-enterprise/identity-vault`:

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

#### Final Cleanup

At this point, there should be some dead code and unused parameters. If you are using VSCode these will show with a lighter font. Remove all of the dead code and unused parameters and/or imports.
