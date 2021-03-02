# Lab: Customize the PIN Dialog

At this point, the application has a well defined workflow for determining how to secure the token. However, the workflow used to gather or enter the PIN is a little clunky. The workflow and UI that it is currently using is intended for development use only, and is not intended to be used in a production quality application. **We highly suggest that application developers create their own PIN dialog and workflow in order to provide a more appropriate experience for their application.**

## Create the PIN Dialog

Since this isn't a trainig on "How to Create a Modal Dialog", let's just steal some code for that 😃

Just grab the PIN dialog files from the <a href="https://github.com/ionic-team/tea-taster-react/tree/feature/identity-vault/src/pin-dialog" target="_blank">completed example</a> for this training and copy it into your application.

The logic within this component implements the following workflows:

- When setting up a new PIN, ask for the PIN twice to verify the correct PIN was entered
- When unlocking, just take the PIN once

Have a look at the code just to get an idea of how it works. There is nothing in that code that is specific to Identity Vault, but if you have any questions about how the modal works, please ask.

## Hooking up the PIN Dialog

Now that we have a PIN dialog, let's get straight into the Identity Vault portions and get it all hooked up so we can use it instead of the default "development-only" PIN entry prompts.

Note that we will be working within the `src/core/auth/AuthContext.tsx` file for the remainder of this lab.

The `IonicIdentityVaultUser` base class provides a hook called `onPasscodeRequest()`. This hook can be used to perform essentially any workflow that you desire so long as that workflow involves returning a Promise that will resolve to the PIN. If `onPasscodeRequest()` resolves to `undefined` then the system PIN dialogs will be used.

For our application, we have the following requirements for the PIN dialog:

- Create a callback that is handled by Identity Vault's `onPasscodeRequest()` event
- Display the `PinDialog` when appropriate and passes in the proper `setPasscodeMode` value
- When the dialog is dismissed, resolve the PIN
- If the PIN is `undefined`, resolve to an empty string (this avoids showing the system dialogs)

Display the `PinDialog` that passes the `setPasscodeMode` prop

### Handling a Passcode Request

Handling a passcode request consists of two pieces:

1. Displaying `PinDialog` when appropriate
2. Creating a callback that can be handled by the `onPasscodeRequest()` event

Start by creating a type `PasscodeCallback` that takes in a string and returns `void`. This string will be the value returned to us from `PinDialog`. We will also create a variable named `passcodeRequestCallback` that we can redefine within the `<AuthProvider />` component.

Add the following two lines anywhere _outside_ of the `AuthProvider` definition:

```typescript
type PasscodeCallback = (value: string) => void;
let passcodeRequestCallback: undefined | PasscodeCallback;
```

For simplicity, I put those lines right above the `AuthProvider` function. It is important that `passcodeRequestCallback` is defined outside of the "React scope" in order to work within Identity Vault's lifecycle. The rest of the modifications we make in this lab will be _within_ the `<AuthProvider />` component.

Next, let's start overriding `onPasscodeRequest()` such that it will handle the callback we created. Add the following method below `vault.onVaultLocked()`:

```typescript
vault.onPasscodeRequest = async (
  _isPasscodeSetRequest: boolean,
): Promise<string | undefined> => {
  return new Promise(resolve => {
    passcodeRequestCallback = (value: string) => {
      resolve(value || '');
    };
  });
};
```

This method will handle our passcode request's callback when `PinDialog` is dismissed. We need to add a way to display `PinDialog`. Add the following function under `vault.onPasscodeRequest()`:

```typescript
const handlePasscodeRequest = (callback: PasscodeCallback) => (
  <PinDialog onDismiss={({ data }) => callback(data)} setPasscodeMode={true} />
);
```

We will update this function later so `setPasscodeMode` is actually bound to a variable in the next section.

Finally, add the following line to the `return` block:

```diff
return (
  <AuthContext.Provider value={{ state, dispatch, vault }}>
+   {passcodeRequestCallback && handlePasscodeRequest(passcodeRequestCallback)}
    {children}
  </AuthContext.Provider>
);
```

If you run the application now on a device that does not support biometrics (such as an iOS simulator) you should see `PinDialog` request you to create a PIN. However, the `PinDialog` component is never dismissed, and it assumes the user is always creating a PIN - there is no way to toggle the mode. Let's fix that.

### Additional State Properties

We need to track the state of two things: whether or not the application should display `PinDialog`, and if `PinDialog` needs to set up a new PIN or if it is being used to unlock the application.

Let's add two new state variables to `<AuthProvider />` to hold those pieces of state:

```typescript
const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
const [setPasscodeMode, setSetPasscodeMode] = useState<boolean>(false);
```

I prefer to have all my component variable definitions grouped together, so I added these lines under:

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

As long as it builds you are free to add them anywhere you'd like.

Modify `vault.onPasscodeRequest()` so that it updates these pieces of state, letting the application know when `PinDialog` should show, and in what mode:

```diff
vault.onPasscodeRequest = async (
  _isPasscodeSetRequest: boolean,
): Promise<string | undefined> => {
  return new Promise(resolve => {
    passcodeRequestCallback = (value: string) => {
      resolve(value || '');
+     setShowPasscodeModal(false);
+     setSetPasscodeMode(false);
    };
+   setSetPasscodeMode(_isPasscodeSetRequest);
+   setShowPasscodeModal(true);
  });
};
```

Likewise, modify `handlePasscodeRequest`:

```diff
const handlePasscodeRequest = (callback: PasscodeCallback) => (
  <PinDialog
    onDismiss={({ data }) => callback(data)}
-   setPasscodeMode={true}
+   setPasscodeMode={setPasscodeMode}
  />
);
```

And finally, update the `return` block:

```diff
 return (
    <AuthContext.Provider value={{ state, dispatch, vault }}>
+     {showPasscodeModal &&
        passcodeRequestCallback &&
        handlePasscodeRequest(passcodeRequestCallback)}
      {children}
    </AuthContext.Provider>
  );
```

If you run the application now on a device that does not support biometrics, you should be able to experience the completed custom passcode implementation!

This is just one possible implementation. You do not have to use a single dialog with the mode sent as a property. You could use two completely different dialogs. You could use different dialogs for iOS and Android. You could generate a random PIN and display it to the user when setting the passcode and then display a dialog to get the PIN back from the user. You can basically do anything you want so long as it makes sense.

## Conclusion

Congratulations. You now have a fully functional Identity Vault implementation. The implementation that we have is not the only "right way" to implement this. In the next section we will discussion various other options that are commonly implemented.
