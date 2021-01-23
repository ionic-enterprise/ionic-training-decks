# Lab: Session Vault Service

In this lab, we will concentrate on refactoring the `SessionVaultService` to use the Identity Vault to store the token instead of storing it using the Capacitor Storage API. When we are done with this lab, the application will be storing the token in the vault, but from the user's perspective it will behave exactly as before.

## Getting Started

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin. By the end of this section, we will have updated our `SessionVaultService` to be a subclass of the `IonicIdentityVaultUser` class, giving us the access we need to the Identity Vault functionallity.

We will walk through adding the parent class one step at a time. The changes made will entirely be in the `src/app/core/session-vault/session-vault.service.ts` file.

**A Note on Unit Tests:** in order to concentrate this traning on the changes required for Identity Vault, the unit test modifications are not included. This does not mean you should skip unit testing. Rather, we wanted to make sure this training was focused on Identity Vault itself as much as possible.

Please refer the the individual commits in the <a href="https://github.com/ionic-team/tea-taster-angular/tree/feature/identity-vault" target="_blank">`feature/identity-vault` barch of the model application</a> for details on the unit testing modifications.

## Add the Platform Service

The `IonicIdentityVaultUser` takes the `Platform` service as the first parameter of its constructor (actually, it takes any object with a `ready()` method). Inject the `Platform` and `BrowserVaultPlugin` services via the constructor in the `SessionVaultService` constructor:

```typescript
...
import { Platform } from '@ionic/angular';
...
import { BrowserVaultPlugin } from '../browser-vault/browser-vault.plugin';
...
  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    platform: Platform,
    private store: Store<State>,
  ) {}
```

## Inherit from `IonicIdentityVaultUser`

We want the `SessionVaultService` to be the service through which we access the Identity Vault functionallity. To achieve this, we need to have the `SessionVaultService` inherit and extend the `IonicIdentityVaultUser` class.

To start with:

- import several key items from `@ionic-enterprise/identity-vault`
- extend the `IonicIdentityVaultUser` using our `Session` type
- in the constructor, call `super(...)`
- add the `getPlugin()` method

```typescript
...
import {
  AuthMode,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
...
@Injectable({
  providedIn: 'root',
})
export class SessionVaultService extends IonicIdentityVaultUser<Session> {
...

  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    platform: Platform,
    private store: Store<State>,
  ) {
    super(platform, { authMode: AuthMode.SecureStorage });
  }

...

  getPlugin(): IonicNativeAuthPlugin {
    if ((this.platform as Platform).is('hybrid')) {
      return super.getPlugin();
    }
    return this.browserVaultPlugin;
  }
```

A further explanation of some of theses change are in order.

### Typing the `IonicIdentityVaultUser<T>` Generic

When we extended the base class, we need to provide a type for our session. Identity Vault is very flexible as to what session information can be stored. For our application, we will use our already defined `Session` type.

If you do not currently have a type that models your session, Identity Vault includes a type called `DefaultSession`. The `DefaultSession` includes `username` and `token`, which is adaquate for many applications. The `DefaultSession` can be extended if desired in order to store other information with your session data.

### The `super()` Call

Because of JavaScript's inheritance rules, the first thing we need to do in our contructor is call `super()`. The base class takes an instatiation of the `Platform` service as well as a configuration object. For our initial version of the application, the only configuration we will do is to set the `authMode` to `SecureStorage`. This will configure the vault to securely store the session information, but will not configure any other advanced features, such as locking the vault or using biometrics to unlock the vault.

### The `getPlugin()` Method

The base class' `getPlugin()` method returns an interface to the native plugin for Identity Vault. We also want this application to run in a web based context for testing and development. By overriding this method, we can have Identity Vault use the plugin when running in a hybrid mobild context and use our previously created web based service when running in any other context.

One item of note here is that we cast the platform service (`this.platform as Platform`). This is required by TypeScript
because Identity Vault is not tightly coupled with `@ionic/angular`'s Platform service and we are calling a method here that Identity Vault does not know about.

## Convert the Methods

At this point our `IdentityService` isn't really using the vault. All of our methods are still directly storing informtion using the Capacitor Storage API. We will fix that now, one method at a time.

### The `login()` Method

Our service has a `login()` method that is called as part of the login workflow to store the session. `IonicIdentityVaultUser` has a `login()` method that takes the same parameters and is used for exactly the same purpose, so we can just remove ours.

### The `logout()` Method

Our service has a `logout()` method that is called as part of the logout workflow to clear the session from storage. `IonicIdentityVaultUser` has a `logout()` method that performs the same task, so we can just remove ours.

### The `restoreSession()` Method

Our `restoreSession()` method gets the session from storage and dispatches an action that ultimately will set that session in the state.

We still need to do the dispatching of the action, but now we will use the vault to restore the session instead of getting it ourselves:

```TypeScript
  async restoreSession(): Promise<Session> {
    const session = await super.restoreSession();

    if (session) {
      this.store.dispatch(sessionRestored({ session }));
    }

    return session;
  }
```

## Restore the Session Before Accessing the Token

Our application is already restoring the session before accessing the token. It is doing this because it relies on the state as the source of truth for the current session, and the state itself may need to be initialized (on startup or because of a browser refresh). Have a look at the auth guard for how we are doing this.

Depending on how your application works, you may also need to add similar logic to refresh the session.

## Final Cleanup

At this point, there should be some unused imports and properties. If you are using VSCode these will show with a lighter font. Remove all of the unused code from any file that has been modified.

## Different Architectures

Perhaps your current application does not fit as nicely with the Identity Vault structure. For example, let's say that you are not using an NgRX store, and that you have an `SessionService` with the following methods:

- `set()` - sets the session and stores it in persistent storage
- `get()` - get the current session, is called every time a session is required, always reads persistent storage
- `clear()` - clears the session from persistent storage

Then you could modify the service as such:

- `set()` - call `super.login()` passing the session
- `clear()` - call `super.logout()`
- `get()` - call `super.getSession()`, or if all you need is the `token` from the session, remove this entirely since the base classes exposes the current token if it is avaliable

There are several other options as well. Consult with your Solutions Architectect as to what the best course of action may be for your application.

## Conclusion

At this point, the application should work just like it did before, only now the auth token will be stored securely when running on a device. Next we will look at locking the vaults and allowing it to be unlocked via PIN or biometrics.
