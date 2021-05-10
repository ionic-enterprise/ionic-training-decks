# Lab: Securing the Session

In this lab, we will concentrate on refactoring the application to use the Identity Vault to store the token instead of storing it using the Capacitor Storage API. When we are done with this lab, the application will be storing the token in the vault, but from the user's perspective it will behave exactly as before.

## Getting Started

Identity Vault includes a class called `IonicIdentityVaultUser` which defines the currently logged in user and provides an interface with the identity vault plugin. By the end of this section, we will have created a `SessionVault` singleton class that subclasses `IonicIdentityVaultUser`, giving us the access we need to the Identity Vault functionality.

**A Note on Unit Tests:** in order to concentrate this training on the changes required for Identity Vault, the unit test modifications are not included. This does not mean you should skip unit testing. Rather, we wanted to make sure this training was focused on Identity Vault itself as much as possible.

## Create the SessionVault Class

The `SessionVault` singleton class will be the class in which we inherit `IonicIdentityVaultUser`. This class allows us to leverage `BrowserVault` when the application is run on the web and provide other customizations and configurations available as part of the Identity Vault API.

```TypeScript
export class SessionVault {
  private static instance: SessionVault | undefined = undefined;

  private constructor() {}

  public static getInstance(): SessionVault {
    if (!SessionVault.instance) SessionVault.instance = new SessionVault();
    return SessionVault.instance;
  }
}
```

Create a file `src/core/vault/SessionVault.ts` with the above contents.

## Inherit from `IonicIdentityVaultUser`

We want `SessionVault` to be the class through which we access the Identity Vault functionality. To achieve this, we need to have `SessionVault` inherit and extend the `IonicIdentityVaultUser` class.

To start with:

- Import several key items from `@ionic-enterprise/identity-vault`
- Extend the `IonicIdentityVaultUser` using our `Session` type
- In the constructor, call `super(...)`
- Add the `getPlugin()` method

```typescript
import { isPlatform } from '@ionic/react';
import {
  IonicIdentityVaultUser,
  AuthMode,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
import { BrowserVaultPlugin } from './BrowserVaultPlugin';
import { Session } from '../models';

export class SessionVault extends IonicIdentityVaultUser<Session> {
  private static instance: SessionVault | undefined = undefined;

  private constructor() {
    super(
      { ready: () => Promise.resolve(true) },
      { authMode: AuthMode.SecureStorage },
    );
  }

  public static getInstance(): SessionVault {
    if (!SessionVault.instance) {
      SessionVault.instance = new SessionVault();
    }
    return SessionVault.instance;
  }

  getPlugin(): IonicNativeAuthPlugin {
    if (isPlatform('capacitor')) return super.getPlugin();
    return BrowserVaultPlugin.getInstance();
  }
}
```

A further explanation of some of theses change are in order.

### Typing the `IonicIdentityVaultUser<T>` Generic

When we extended the base class, we need to provide a type for our session. Identity Vault is very flexible as to what session information can be stored. For our application, we will use our already defined `Session` type.

If you do not currently have a type that models your session, Identity Vault includes a type called `DefaultSession`. The `DefaultSession` includes `username` and `token`, which is adequate for many applications. The `DefaultSession` can be extended if desired in order to store other information with your session data.

### The `super()` Call

Because of JavaScript's inheritance rules, the first thing we need to do in our constructor is call `super()`. The base class takes an instantiation of a `platform` class, which includes a function `ready` which will let Identity Vault know the application is ready to be interacted with. This is applicable in frameworks that have an application lifecycle - such as Angular - but is not applicable to React. As it is required, we will simply pass in an implementation that let's Identity Vault know the application is ready once the singleton class has been instantiated.

For our initial version of the application, the only configuration we will do is set the `authMode` to `SecureStorage`. This will configure the vault to securely store the session information, but will not configure any other advanced features, such as locking the vault or using biometrics to unlock the vault.

### The `getPlugin()` Method

The base class' `getPlugin()` method returns an interface to the native plugin for Identity Vault. We also want this application to run in a web based context for testing and development. By overriding this method, we can have Identity Vault use the plugin when running in a hybrid mobile context and use our previously created web based class when running in any other context.

## Restoring the Session on Application Launch

At this point none of our application code isn't using the vault. The authentication context still relies on the Capacitor Storage API when attempting to restore a user session. We will fix that now by modifying `src/core/auth/AuthContext.tsx`.

First, we will need to add a property to `AuthContext`, allowing us to share `SessionVault` with other files:

```diff
 ...
+ import { SessionVault } from '../vault/SessionVault';
 ...
 export const AuthContext = createContext<{
   state: typeof initialState;
   dispatch: (action: AuthAction) => void;
+  vault: SessionVault;
 }>({
   state: initialState,
   dispatch: () => {},
+  vault: SessionVault.getInstance(),
 });
 ...
```

Subsequently, we need to return the `SessionVault` singleton instance as part of the `<AuthProvider />` component:

```diff
 ...
 export const AuthProvider: React.FC = ({ children }) => {
+ const vault = SessionVault.getInstance();
  const [initializing, setInitializing] = useState<boolean>(true);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
   ...
  }, []);

  return (
+   <AuthContext.Provider value={{ state, dispatch, vault }}>
      {initializing ? (
        <IonSpinner name="dots" data-testid="initializing" />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
 ...
```

Finally, the `useEffect` block that runs when `<AuthProvider />` is rendered needs to be modified to use `SessionVault` instead of the Capacitor Storage API and Axios:

```typescript
useEffect(() => {
  (async () => {
    try {
      const session = await vault.restoreSession();
      if (!session) throw new Error('Session not found.');
      dispatch({ type: 'RESTORE_SESSION', session });
      setInitializing(false);
    } catch (error) {
      dispatch({ type: 'CLEAR_SESSION' });
      setInitializing(false);
    }
  })();
}, []);
```

This `useEffect` function attempts to restore the session by leveraging Identity Vault's `restoreSession()` method. If a session is stored the `Session` object will be returned from Identity Vault. With it, the `RESTORE_SESSION` action is called, which allows the application to load the first auth guarded path. If no session is found, the action is not dispatched and the application will route to the login page.

In both scenarios, the `initializing` flag is set to `false` to let the application know it is time to render the core application component.

## Update the Authentication Hook

The application will look to restore a session from Identity Vault when started, but our login and logout methods are still directly storing information using the Capacitor Storage API. The `useAuthentication` hook implements these methods; we will modify the hook to leverage Identity Vault one method at a time.

Start by adding the `vault` property to the list of variables destructured from the `AuthContext` in `src/core/auth/useAuthentication.tsx`:

```typescript
...
export const useAuthentication = () => {
  const { state, dispatch, vault } = useContext(AuthContext);
...
};
```

### The `login()` Method

`IonicIdentityVaultUser` has a `login()` method that takes in a session and stores it within Identity Vault. We can modify the `login()` method to remove code that interacts with the Capacitor Storage API and add a line that calls `vault.login()`:

```typescript
const login = async (username: string, password: string): Promise<void> => {
  dispatch({ type: 'LOGIN' });
  try {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await Axios.post(url, { username, password });

    if (!data.success) throw new Error('Failed to log in.');
    const session = { token: data.token, user: data.user };
    await vault.login(session);
    dispatch({ type: 'LOGIN_SUCCESS', session });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', error: error.message });
  }
};
```

### The `logout()` Method

Likewise, `IonicIdentityVaultUser` has a `logout()` method. We can apply the same methodology here that we did for the `login()` method, removing code that interacts with the Capacitor Storage API and adding a line that calls `vault.logout()`:

```typescript
const logout = async (): Promise<void> => {
  dispatch({ type: 'LOGOUT' });
  try {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/logout`;
    const headers = { Authorization: 'Bearer ' + state.session!.token };

    await Axios.post(url, null, { headers });
    await vault.logout();
    dispatch({ type: 'LOGOUT_SUCCESS' });
  } catch (error) {
    dispatch({ type: 'LOGOUT_FAILURE', error: error.message });
  }
};
```

## Accessing the Session

The last part to modify is `useAuthInterceptor`. We will modify both the request and response interceptor logic such that:

- The authorization token will be access directly from Identity Vault, instead of application state
- When a 401 response error occurs, we will remove the current session from Identity Vault

Make the following updates to `src/core/auth/useAuthInterceptor.tsx`:

```typescript
...
export const useAuthInterceptor = () => {
  const { state, dispatch, vault } = useContext(AuthContext);
  ...
  instance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (vault.token) config.headers.Authorization = `Bearer ${vault.token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse<any>) => response,
    async (error: any) => {
      if (error.response.status === 401) {
        await vault.logout();
        dispatch({ type: 'CLEAR_SESSION' });
        return Promise.reject({ ...error, message: 'Unauthorized session.' });
      }
      return Promise.reject(error);
    },
  );

  return { instance };
};
```

## Final Cleanup

At this point, there should be some unused imports and properties. If you are using VSCode these will show with a lighter font. Remove all of the unused code from any file that has been modified.

## Different Architectures

Perhaps your current application is not structured similarly to the application being used in this training. For example, let's say you have a `Session` class with the following methods:

- `set()` - sets the session and stores it in persistent storage
- `get()` - get the current session, is called every time a session is required, always reads persistent storage
- `clear()` - clears the session from persistent storage

Then you could have the class extend `IonicIdentityVaultUser` and modify the methods like so:

- `set()` - call `super.login()` passing the session
- `clear()` - call `super.logout()`
- `get()` - call `super.getSession()`, or if all you need is the `token` from the session, remove this entirely since the base classes exposes the current token if it is available

There are several other options as well. Consult with your Solutions Architect as to what the best course of action may be for your application.

## Conclusion

At this point, the application should work just like it did before, only now the auth token will be stored securely when running on a device. Next we will look at locking the vaults and allowing it to be unlocked via PIN or biometrics.
