# Other Options

We have implemented Identity Vault in a very specific manner, but it is by no means the only choice that we have. Identity Vault can be configured to work in multiple different ways and can support multiple workflows depending on how you configure it. Here are some examples of other modifications we can make.

## Android Biometric Prompt Customizations

The prompt that is displayed when doing biometric unlocking is controlled by the mobile OS, so there is nothing that can be done to customize that look and feel. Android, however, does allow you to modify the text prompts that are displayed. In order to do this, you can set the following properties when calling the base class' constructor:

- androidPromptTitle
- androidPromptSubtitle
- androidPromptDescription

Here is an example:

```typescript
super(platform, {
  androidPromptTitle: 'Identity Vault Demo',
  androidPromptSubtitle: 'Demo All the Things!',
  androidPromptDescription: 'You need to unlock me',
  restoreSessionOnReady: false,
  unlockOnReady: false,
  unlockOnAccess: true,
  lockAfter: 5000,
  hideScreenOnBackground: true,
  allowSystemPinFallback: true,
  shouldClearVaultAfterTooManyFailedAttempts: false,
});
```

Please note that this **only** applies to Android. No such options exist for iOS.

## Session PIN Fallback

When unlocking the vault, our application uses biometric authentication if it is available, and a session PIN if biometrics is not available. It does this by setting the `AuthMode` to `BiomtricOnly` or `PasscodeOnly` upon login. It is also possible to use a mode called `BiometricAndPasscode`. The way this will behave is:

- Upon login, the user will be asked to enter a PIN
- When unlocking the vault:
  - If biometrics is enabled on the device:
    - The first attempts to unlock the vault will use biometrics
    - If there are too many failed attempts or the user cancels the biometric unlock, the PIN dialog will be presented
  - If biometrics is not available, the PIN dialog will be presented

This provides a simple and consistent behavior for the user with a fallback (other than logging in again) in cases where the biometric unlock will not work for some reason.

This also allows you to use one `AuthMode` across all devices as it will automatically revert to the `PasscodeOnly` behavior on devices where biometrics is not available.

## System PIN Fallback

For some applications, the desired behavior may be to use `BiometricOnly` or `PasscodeOnly` like we are currently using in our application, but to fall back to the system PIN (that is, the PIN the user has set for their device) when the biometric unlock fails.

To do this in the most effective manner:

- Use the `BiometricOnly` authentication mode if biometrics is available
- Set `allowSystemPinFallback` option to `true` in the `IdentityService` constructor
- Set `shouldClearVaultAfterTooManyFailedAttempts` to `false` in the `IdentityService` constructor

The application will then present the Biometric prompt to unlock the device. If the user cancels the biometric unlock or the biometric unlock fails too many times, the system PIN prompt will be presented. In cases where the biometric identity has been locked by the OS due to too many failed attempts, unlocking via the system PIN will also unlock the biometric identity.

In cases where biometrics is not available (or the user does not want to use biometrics), you can use any of the following modes: `PasscodeOnly`, `SecureStorage`, `InMemoryOnly`

**Note:** you should never use `BiometricAndPasscode` when using system PIN as a fallback since the whole point of `BiometricAndPasscode` is to use a session PIN fallback, so you would have competing fallback positions.

## User Settings

In our application, we are using `IdentityVault` to query the native OS and determine if biometric locking is available to the user. The application then uses that information to determine if session is biometrically locked or not.

We have the ability to provide more flexibility to our users. For example, as part of the login process there could be a toggle that turns biometric locking on or off depending on user preferences. Once the user has established a session, that option would be used throughout that session.

It would also be possible to allow the user to change how the session is stored while the session is active by using those same query methods along with [the `setAuthMode` method](https://ionicframework.com/docs/enterprise/identity-vault#setauthmode).

If you couple all of this with the Capacitor [Storage API](https://capacitorjs.com/docs/apis/storage) you can also store the user's current choices so it can be used by default for future sessions (the current session automatically keeps track of how it is configured).

## Mutliple Vaults

In our application, we are using one vault, the `IdentityService`. It is possible to have mutiple vaults by creating multiple services that extend `IonicIdentityVaultUser` and pass a `VaultDescriptor` to the constructor of the base class in order to give each vault a unique ID.

Here is an example:

```typescript
super(
  platform,
  {
    restoreSessionOnReady: false,
    unlockOnReady: false,
    unlockOnAccess: true,
    lockAfter: 5000,
    hideScreenOnBackground: false,
    authMode: AuthMode.SecureStorage,
  },
  {
    username: 'MyDefaultUser',
    vaultId: 'dbEncryptionKeyVault',
  },
);
```

This can be used for multiple different scenarios. For example, let's say that upon login, part of the workflow within the application involves asking the back-end for various API keys. We would like to securely store those API keys, but they are not really part of the session. We can use the main vault to store the session, and then use the

## Conclusion

Please play around with some of these options and see how they work within the training application. Note that the approach taken here is not the only valid approach to take. Rather, it is the approach that works for _this_ application. It is a common approach that will work in many instsances, but there are areas in the workflow that you may want to change in your own application.

Please remember that we are here to advise you in this and other implementation details of your application. If you do not have advisory hours on your contract, please let us know. We will be happy to work with you to provide you with options that make sense for your situation.
