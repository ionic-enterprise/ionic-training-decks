# Lab: Add Biometrics

We will implement a workflow where-by if a user can use biometrics to secure their login, Biometrics will be used. Otherwise a PIN will be used. In order to accomplish this, we will need to modify `SessionVault` to handle locking the vault, the authentication context/hook to modify state when locking/unlocking the vault, and the `LoginPage` to present the user with an unlock option when the vault is locked.

## Modify `SessionVault` Configuration

We need to add a couple of options to our Identity Vault configuration. Most notably, we need to tell Identity Vault how long, in milliseconds, the application should be in the background before the vault is locked. This is configured via the `IonicIdentityVaultUser` constructor `lockAfter` property. We will also tell Identity Vault to protect our data by hiding the screen content when the app is in the background. Finally, we will tell Identity Vault that it should automatically try to unlock a locked vault upon attempting to access it.

We will eventually remove the `authMode` option and specify it during the login process, but we will leave it in place for now:

```typescript
private constructor() {
  super(
    { ready: () => Promise.resolve(true) },
    {
      unlockOnAccess: true,
      hideScreenOnBackground: true,
      lockAfter: 5000,
      authMode: AuthMode.SecureStorage
    },
  );
}
```

If you build and run on a device at this time, the only different you should notice is that when the application is put into the background, the contents of the screen are no longer displayed. On Android, you will see a grey page instead, and on iOS you will see the contents of the splash screen for your application. This is due to the `hideScreenOnBackground` option.

## Add a Login Workflow

### Use Biometrics

Our first requirement is to use biometrics if it is available. We will determine this at login time, which means we will need to modify the `login()` method of the `useAuthentication` hook to determine the appropriate mode.

Update `src/core/auth/useAuthentication.tsx` like so:

```typescript
const login = async (username: string, password: string): Promise<void> => {
  dispatch({ type: 'LOGIN' });
  try {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/login`;
    const { data } = await Axios.post(url, { username, password });

    if (!data.success) throw new Error('Failed to log in.');

    const session = { token: data.token, user: data.user };
    const mode = (await vault.isBiometricsAvailable()) ? AuthMode.BiometricOnly : AuthMode.PasscodeOnly;

    await vault.login(session, mode);
    dispatch({ type: 'LOGIN_SUCCESS', session });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', error: error.message });
  }
};
```

At this point, we can remove the `authMode` configuration from the `SessionVault` constructor code.

### Update the `Info.plist` File

On iOS, the user has to give permission to use FaceID. In order to do this, open the project in Xcode (`npx cap open ios`) and find the `Info.plist` file under the `App` folder. Open it and add the following value:

- Key: NSFaceIDUsageDescription
- Value: Use Face ID to unlock the application

This is the prompt that will be used when asking for permission to use FaceID.

### Implement the `onVaultLocked` Event Handler

When the vault is locked, we should dispatch an action that clears the authentication state's session. This way, the user must unlock the vault to resume using the application. We can achieve this by overriding the `onVaultLocked` event exposed by the `IonicIdentityVaultUser` class.

Since we need access to the React Context API to dispatch the provided `CLEAR_SESSION` action, we must override the method in `src/core/auth/AuthContext.tsx`. Add the following method under the `useEffect` statement of the `<AuthProvider />` component:

```typescript
vault.onVaultLocked = (): void => {
  dispatch({ type: 'CLEAR_SESSION' });
};
```

When the `CLEAR_SESSION` action is dispatched:

- The session stored in authentication state is set to `undefined`
- The application will redirect the user to the login page if they are on a route that has been declared using the `<PrivateRoute />` component.

Notice that we are not storing the locked state anywhere. If we did that, we would need to worry about stuff like:

- Resetting the lock state on restart if appropriate.
- Handling issues with users removing fingerprints while we are locked out.

Basically, the locked state can change on us due to external influences, making it a poor choice for putting in application state. It is better if we query the vault for the state when we need it. We will do that later.

### Restoring the Session

Our second requirement calls for the application to provide a way for the user to restore a session when:

- The application has been started and placed in the background
- The user brings the application back into the foreground after the vault has locked

In the last lab, code was added that would attempt to restore the session when the application first loads. However, that logic is _only_ run when the application first loads - not when the application is resumed.

To rectify this, we will add a `restoreSession()` method to `src/core/auth/useAuthentication.tsx`:

```TypeScript
...
export const useAuthentication = () => {
  const { state, dispatch, vault } = useContext(AuthContext);
  ...
  const restoreSession = async (): Promise<void> => {
    const session = await vault.restoreSession();
    if (session) dispatch({ type: 'RESTORE_SESSION', session });
  };

  return {
    ...
    restoreSession,
  };
};
```

This method will be invoked as part of the unlock flow to be added to the `LoginPage`. Since we only want components to utilize this method, the architectural structure of the code base dictates it should live in the `useAuthentication` hook.

#### Override the `restoreSession()` Method

It is possible -- especially during development -- to get the vault in such a state where we try to perform a restore while the vault itself is locked and cannot be unlocked. In such cases, we will just clear the vault, forcing a new login.

Update the `SessionVault` class to override the standard `IonicIdentityVaultUser` implementation with the following:

```TypeScript
async restoreSession(): Promise<Session | undefined> {
  try {
    return await super.restoreSession();
  } catch (error) {
    if (error.code === VaultErrorCodes.VaultLocked) {
      const vault = await this.getVault();
      await vault.clear();
    } else {
      throw error;
    }
  }
}
```

### Side-Note: Using React Hook APIs with Identity Vault

At this point in the lab we have overrode Identity Vault methods in both the `SessionVault` singleton class, and the `<AuthProvider />` component (that establishes the `AuthContext`). It may seem confusing which file should be modified when, so an explanation is in order:

Plain old JavaScript objects (POJOs) cannot access any React Hook API. Therefore in a scenario where we want to utilize a React Hook API, such as dispatching an action during the `onVaultLocked()` event, we must override the event within a function that can access React Hook APIs. Conversely, the override we made to the `restoreSession()` event in the last section does not require any React Hook API, so it makes logical sense to add it to the `SessionVault` singleton class.

### Determining Unlock Status

Our third requirement is to provide a way to determine if the application has a locked session that is capable of being unlocked. Since this method will be called as part of the `LoginPage`, we will add it to the `useAuthentication` hook.

Add the following method to `src/core/auth/useAuthentication.tsx`:

```typescript
...
export const useAuthentication = () => {
  const { state, dispatch, vault } = useContext(AuthContext);
  ...
  const canUnlockVault = async (): Promise<boolean> => {
    if (!(await vault.hasStoredSession())) return false;
    if (!(await (await vault.getVault()).isLocked())) return false;

    const mode = await vault.getAuthMode();
    return (
      mode === AuthMode.PasscodeOnly ||
      mode === AuthMode.BiometricAndPasscode ||
      (mode === AuthMode.BiometricOnly && (await vault.isBiometricsAvailable()))
    );
  };

  return {
    ...
    canUnlockVault,
  };
};
```

## `LoginPage` Modifications

The login page still does not present a way to unlock the application, which is something we will fix now.

Before going any further, make sure you are serving the application and are logged out. This will allow us to see the changes to the login page as we make them.

### Markup Changes

In cases where a locked session exists, we want to display something that the user can tap on to begin the unlock process. Add the following component logic to `src/login/LoginPage.tsx`:

```diff
...
const LoginPage: React.FC = () => {
  const history = useHistory();
+ const [showUnlock, setShowUnlock] = useState<boolean>(false);
  const {
    login,
    session,
    error,
+   canUnlockVault,
+   restoreSession,
  } = useAuthentication();
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<{
    email: string;
    password: string;
  }>({ mode: 'onChange' });

  useEffect(() => {
    session && history.replace('/tabs');
  }, [session, history]);

+ useEffect(() => {
+   (async () => {
+     setShowUnlock(await canUnlockVault());
+   })();
+   // eslint-disable-next-line
+ }, [session]);

  const handleLogin = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
  };
...
```

It's worth noting that without `// eslint-disable-next-line`, React will warn us that we are missing a `useEffect` dependency: `canUnlockVault`. However, if we add that method as a dependency, it will run on each re-render, including each keystroke made on the page. That's not ideal. While we appreciate the effort from React, we know we want to recalculate this value whenever our authentication state's `session` changes, so we'll add both the "ignore next line" linting comment and make `session` the dependency in which when changed the `useEffect` runs again.

Next modify the component template:

```diff
...
const LoginPage: React.FC = () => {
  ...
  return (
    <IonPage>
      ...
        </IonHeader>
+       {showUnlock && (
+         <div
+           className="unlock-app ion-text-center"
+           onClick={() => restoreSession()}
+          >
+           <IonIcon icon={lockOpenOutline} />
+           <div>Unlock</div>
+         </div>
+       )}
        <form>
          ...
    </IonPage>
  );
};

export default LoginPage;
```

### Style Changes

We will also perform a little bit of styling to make the "unlock" part of the screen look better.

Add the following CSS snippet to `src/theme/global.css`:

```CSS
.unlock-app {
  margin-top: 3em;
  font-size: xx-large;
}
```

### Goodbye, Loading Component

There's one more modification to make before finishing the Login Workflow.

Remember this block of code from the last lab?

```JSX
 <AuthContext.Provider value={{ state, dispatch, vault }}>
  {initializing ? <IonSpinner {...} /> : children}
</AuthContext.Provider>
```

Before Identity Vault was implemented into the application, the `initializing` variable was used as a way to defer initial application routing until the authenticated status of the user was determined. This prevented a poor user experience in which authenticated users would see the `LoginPage` for a moment or two before being redirected to the main tea tab.

Now that we expect users to take some action before making it to the guarded portion of the application; either unlocking the vault or signing in, we no longer need this variable or the loading component.

Go ahead and update `src/core/auth/AuthContext.tsx` so that the `<AuthProvider />` component looks like so:

```typescript
export const AuthProvider: React.FC = ({ children }) => {
  const vault = SessionVault.getInstance();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const session = await vault.restoreSession();
      if (!session) return;
      return dispatch({ type: 'RESTORE_SESSION', session });
    })();
  }, [vault]);

  vault.onVaultLocked = (): void => {
    dispatch({ type: 'CLEAR_SESSION' });
  };

  return <AuthContext.Provider value={{ state, dispatch, vault }}>{children}</AuthContext.Provider>;
};
```

## Conclusion

At this point, it is a good idea to run the application on actual devices. Try the application on devices with and without biometrics.
