# Lab: Customize the PIN Dialog

At this point, the application has a well defined workflow for determining how to secure the token. However, the workflow used to gather or enter the PIN is a little clunky. The workflow and UI that it is currently using is intended for development use only, and is not intended to be used in a production quality application. **We highly suggest that application developers create their own PIN dialog and workflow in order to provide a more appropriate experience for their application.**

## Create the PIN Dialog

Since this isn't a trainig on "How to Create a Modal Dialog", let's just steal some code for that 😃

Just grab the PIN dialog from the <a href="https://github.com/ionic-team/tea-taster-angular/tree/feature/identity-vault/src/app/pin-dialog" target="_blank">completed example</a> for this training and copy it into your application. Note that you will also need to update the `app.module.ts` file to import the `PinDialogModule` into `AppModule`:

```diff
--- a/src/app/app.module.ts
+++ b/src/app/app.module.ts
@@ -14,6 +14,7 @@ import { AuthEffects, DataEffects } from './store/effects';
 import { StoreDevtoolsModule } from '@ngrx/store-devtools';
 import { environment } from '../environments/environment';
 import { AuthInterceptor, UnauthInterceptor } from './core';
+import { PinDialogComponentModule } from './pin-dialog/pin-dialog.module';

 @NgModule({
   declarations: [AppComponent],
@@ -23,6 +24,7 @@ import { AuthInterceptor, UnauthInterceptor } from './core';
     BrowserModule,
     IonicModule.forRoot(),
     HttpClientModule,
+    PinDialogComponentModule,
     StoreModule.forRoot(reducers, {
       metaReducers,
       runtimeChecks: {
```

The logic within this coomponent implements the following workflows:

- when setting up a new PIN, ask for the PIN twice to verify the correct PIN was entered
- when unlocking, just take the PIN once

Have a look at the code just to get an idea of how it works. There is nothing in this code that is specific to Identity Vault, but if you have any questions about how the modal works, please ask.

## Hooking up the PIN Dialog

Now that we have a PIN dialog, let's get straight into the Identity Vault portions and get it all hooked up so we can use it instead of the default "development-only" PIN entry prompts.

The `IonicIdentityVaultUser` base class provides a hook called `onPasscodeRequest()`. This hook can be used to perform essentially any workflow that you desire so long as that workflow involves returning a Promise that will resolve to the PIN. If `onPasscodeRequest()` resolves to `undefined` then the system PIN dialogs will be used.

For our application, we have the following requirements for the PIN dialog:

- Create a modal that uses the PinDialogComponent, disables backdrop dismiss, and passes the `setPasscodeMode` parameter
- Present the dialog
- When the dialog is dismissed, resolve the PIN
- If the PIN is `undefined`, resolve to an empty string (this avoids showing the system dialogs)

The code to add to `src/app/core/session-vault/session-vault.service.ts` is then as follows. Be sure to import the `PinDialogComponent` and to inject the `ModalController`.

```TypeScript
  async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<string> {
    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest
      }
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    return Promise.resolve(data || '');
  }
```

This is just one possible implementation. You do not have to use a single dialog with the mode sent as a property. You could use two completely different dialogs. You could use different dialogs for iOS and Android. You could generate a random PIN and display it to the user when setting the passcode and then display a dialog to get the PIN back from the user. You can basically do anything you want so long as it makes sense.

## Conclusion

Congratulations. You now have a fully functional Identity Vault implementation. The implementation that we have is not the only "right way" to implement this. In the next section we will discussion various other options that are commonly implemented.
