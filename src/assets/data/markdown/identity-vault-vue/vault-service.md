# Lab: Session Vault Service

In this lab, we will concentrate on refactoring the `SessionVaultService` to use the Identity Vault to store the token instead of storing it using the Capacitor Storage API. When we are done with this lab, the application will be storing the token in the vault, but from the user's perspective it will behave exactly as before.

## Getting Started

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin. By the end of this section, we will have updated our `SessionVaultService` to be a subclass of the `IonicIdentityVaultUser` class, giving us the access we need to the Identity Vault functionallity.

As a result, the `SessionVaultService` will be transformed from a collection of methods to an actual class that we need to instantiate as a singleton. Thus the semantics of how it is imported and used will change slightly.

We will walk through adding the parent class one step at a time. The changes made will entirely be in the `src/app/core/session-vault/session-vault.service.ts` file.

## A Note on Unit Tests

In order to concentrate this traning on the changes required for Identity Vault, the unit test modifications are not included. This does not mean you should skip unit testing. Rather, we wanted to make sure this training was focused on Identity Vault itself as much as possible. Please refer the the individual commits in the <a href="https://github.com/ionic-team/tea-taster-vue/tree/feature/identity-vault" target="_blank">`feature/identity-vault` barch of the model application</a> for details on the unit testing modifications.

That said, there are some caveats to keep in mind when working on the unit tests.

- The `transformIgnorePatterns` value in `jest.config.js` will need to be set to include both `@ionic` and `@ionic-enterprise` scoped directories in the list of files that are not ignored: `transformIgnorePatterns: ['/node_modules/(?!(@ionic|@ionic-enterprise)/)'],`.
- You will need to <a href="https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom" target="_blank">mock the "matchMedia" method</a>. The easiest way to do this is to add a `patchJSDom.js` file to your project's root and call it from your `jest.config.js` as such: `setupFiles: ['./patchJSDom.js']`.

**`patchJSDom.js`**

```JavaScript
/* eslint-disable */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Remove the Old Code

We are completely rewriting this file. Just remove the old code entirely

## Inherit from `IonicIdentityVaultUser`

We want the `SessionVaultService` to be the service through which we access the Identity Vault functionallity. To achieve this, we need to have the `SessionVaultService` inherit and extend the `IonicIdentityVaultUser` class.

Here is a synposis of what we will do with the new code:

- Import several key items from `@ionic-enterprise/identity-vault`.
- Import `isPlatform` from `@ionic/vue` so we can determine when we are running in a web context.
- Import the `browserVaultPlugin` singleton we created in the last section. This will be used when we are running in a web context.
- Import the model for the session we will be storing, which is `Session` in our case.
- Extend the `IonicIdentityVaultUser` using our `Session` type.
- Call `super(...)` from the constructor, passing a "Platform" object (explained later) and a configuration object.
- Add the `getPlugin()` method so we can use the `browserVaultPlugin` when we are running in the web.

Here is the completed code:

```typescript
import {
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
  AuthMode,
} from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';

import { browserVaultPlugin } from './BrowserVaultPlugin';
import { Session } from '@/models';

export class SessionVaultService extends IonicIdentityVaultUser<Session> {
  constructor() {
    super(
      { ready: () => Promise.resolve() },
      { authMode: AuthMode.SecureStorage },
    );
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (isPlatform('hybrid')) {
      return super.getPlugin();
    }
    return browserVaultPlugin;
  }
}

export const sessionVaultService = new SessionVaultService();
```

A further explanation of some of the key part of this code are in order.

### Typing the `IonicIdentityVaultUser<T>` Generic

When we extended the base class, we need to provide a type for our session. Identity Vault is very flexible as to what session information can be stored. For our application, we will use our already defined `Session` type.

If you do not currently have a type that models your session, Identity Vault includes a type called `DefaultSession`. The `DefaultSession` includes `username` and `token`, which is adaquate for many applications. The `DefaultSession` can be extended if desired in order to store other information with your session data.

### The `super()` Call

Because of JavaScript's inheritance rules, the first thing we need to do in our contructor is call `super()`. The base class takes a "Platform" object as well as a configuration object.

#### The "Platform" Object

The "Platform" object is so named because in `@ionic/anglar` there is a `Platform` service that is passed in here. In reality, any object that contains a `ready()` function that resolves when the system is ready can be passed, and that is what we do here. Here is the low-down.

With `Cordova`, there is a concept of the `deviceReady` event which is fired after all of the Cordova plugins have been loaded and the Cordova ecosystem is ready to do its thing. In `@ionic/angular`, this is communicated to the rest of the system via the `Platform.ready` method.

With `Capacitor`, plugins are loaded in a different manner and there is no need for such an event.

Since Identity Vault is designed to work with either `Capacitor` or `Cordova`, and could be used with any of the different "flavors" of the Ionic Framework, we may need to know when the `deviceReady` event has been fired.

We just pass `{ ready: () => Promise.resolve() }` because we are using `@ionic/vue`, which only supports `Capacitor` out of the box, which doesn't have a `deviceReady` event, so we can just pass an object with a properly named function that is already resolved.

The caveat here is _if_ you (for some reason) hack your `@ionic/vue` project to use `Cordova` instead of `Capacitor` you will need to be smarter about what you pass here as it will need to only resolve after the `deviceReady` event is fired. If you do something like that, however, you are on your own. That is not a supported configuration for Vue.

#### The Configuration Object

The configuration object is where we will pass all of the more interesting configuration down to Identity Vault. For our initial version of the application, the only configuration we need is to set the `authMode` to `SecureStorage`. This configures the vault to securely store the session information, but does not configure any other advanced features, such as locking the vault or using biometrics to unlock the vault.

### The `getPlugin()` Method

The base class' `getPlugin()` method returns an interface to the native plugin for Identity Vault. We also want this application to run in a web based context for testing and development. By overriding this method, we can have Identity Vault use the plugin when running in a hybrid mobild context and use our previously created web based service when running in any other context.

One item of note here is that we cast the platform service (`this.platform as Platform`). This is required by TypeScript
because Identity Vault is not tightly coupled with `@ionic/angular`'s Platform service and we are calling a method here that Identity Vault does not know about.

## Update the Store Actions

Thanks to using a Vuex store, the consumption of our `SessionVaultService` is very centralized. We have one file to change (`src/store/actions.ts`), and the changes there are very minor. We need to grab the singleton object we created and call the proper Identity Vault methods instead of the functions we had before.

```diff
diff --git a/src/store/actions.ts b/src/store/actions.ts
index 70e056e..5c9347e 100644
--- a/src/store/actions.ts
+++ b/src/store/actions.ts
@@ -1,7 +1,7 @@
 import { ActionContext } from 'vuex';

 import AuthenticationService from '@/services/AuthenticationService';
-import SessionVaultService from '@/services/SessionVaultService';
+import { sessionVaultService } from '@/services/SessionVaultService';

 import { State } from './state';
 import { Session } from '@/models';
@@ -22,14 +22,14 @@ export const actions = {
       };
       commit('SET_SESSION', session);
       dispatch('load');
-      SessionVaultService.set(session);
+      sessionVaultService.login(session);
     }
     return response?.success;
   },

   async logout({ dispatch }: ActionContext<State, State>): Promise<void> {
     await AuthenticationService.logout();
-    await SessionVaultService.clear();
+    await sessionVaultService.logout();
     dispatch('clear');
   },

@@ -37,7 +37,7 @@ export const actions = {
     commit,
     dispatch,
   }: ActionContext<State, State>): Promise<void> {
-    const session = await SessionVaultService.get();
+    const session = await sessionVaultService.restoreSession();
     if (session) {
       commit('SET_SESSION', session);
       dispatch('load');
```

With a less centralized architecture, I may have looked at using a different strategy (see below), but this is the right one for our app.

## Restore the Session Before Accessing the Token

Our application is already restoring the session before accessing the token. It is doing this because it relies on the state as the source of truth for the current session, and the state itself may need to be initialized (on startup or because of a browser refresh). Have a look at the auth guard for how we are doing this.

Depending on how your application works, you may also need to have similar logic to refresh the session.

## Different Architectures

Perhaps your current application does not fit as nicely with the Identity Vault structure. For example, let's say that you are not using a Vuex store, and that you have an `SessionService` with the following methods, but they are called in a less centralized manner than we have in this application:

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
