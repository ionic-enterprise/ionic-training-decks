# Lab: Customize the PIN Dialog

At this point, the application has a well defined workflow for determining how to secure the token. However, the workflow used to gather or enter the PIN is a little clunky. It just uses some system dialogs and a default workflow that is specified by Identity Vault. We suggest that applications create their own PIN dialog and workflow in order to provide a more appropriate experience for the application.

## Create the PIN Dialog

Since this isn't a trainig on "How to Create a Modal Dialog", let's just steal some code for that 😃

The Identity Vault Demo application has a good starting point that we can use: https://github.com/ionic-team/cs-demo-iv/blob/master/src/app/pin-dialog. Copy that code into your application. Note that you will also need to update the `app.module.ts` file to import the `PinDialogModule` into `AppModule`:

```diff
 import { AppComponent } from './app.component';
 import { AppRoutingModule } from './app-routing.module';
 import { httpInterceptorProviders } from './services/http-interceptors';
+import { PinDialogComponentModule } from './pin-dialog/pin-dialog.module';

 @NgModule({
   declarations: [AppComponent],
@@ -18,7 +19,8 @@ import { httpInterceptorProviders } from './services/http-interceptors';
     HttpClientModule,
     IonicModule.forRoot(),
     IonicStorageModule.forRoot(),
-    AppRoutingModule
+    AppRoutingModule,
+    PinDialogComponentModule
   ],
   providers: [
     httpInterceptorProviders,
```

You may want to do a little styling to the component you just copies so the look and feel matches this app more closely. For example, I like to remove the color from the toolbar and add `fill="outline"` to each button to make the component visually match the rest of this application. The logic of the component should not need any modification so long as you want to use the following workflow:

- when setting up a new PIN, ask for the PIN twice to verify the correct PIN was entered
- when unlocking, just take the PIN once

## Hooking up the PIN Dialog

The `IonicIdentityVaultUser` base class provides a hook called `onPasscodeRequest()`. This hook can be used to perform essentially any workflow that you desire so long as that workflow involves returning a Promise that will resolve to the PIN. If `onPasscodeRequest()` resolved to `undefined` then the system PIN dialogs will be used.

For our application, we have the following requirements for the PIN dialog:

- Create a modal that uses the PinDialogCompnent, disables backdrop dismiss, and passes the `setPasscodeMode` parameter
- Present the dialog
- When the dialog is dismissed, resolve the PIN
- If the PIN is `undefined`, resolve to an empty string (this avoids showing the system dialogs)

The tests for this look like:

```TypeScript
  describe('onPasscodeRequest', () => {
    beforeEach(() => {
      modal.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    });

    [true, false].forEach(setPasscode => {
      it(`creates a PIN dialog, setting passcode: ${setPasscode}`, async () => {
        const modalController = TestBed.get(ModalController);
        await identity.onPasscodeRequest(setPasscode);
        expect(modalController.create).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledWith({
          backdropDismiss: false,
          component: PinDialogComponent,
          componentProps: {
            setPasscodeMode: setPasscode
          }
        });
      });
    });

    it('presents the modal', async () => {
      await identity.onPasscodeRequest(false);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('resolves to the PIN', async () => {
      modal.onDidDismiss.and.returnValue(Promise.resolve({ data: '4203', role: 'OK' }));
      expect(await identity.onPasscodeRequest(true)).toEqual('4203');
    });

    it('resolves to an empty string if the PIN is undefined', async () => {
      expect(await identity.onPasscodeRequest(true)).toEqual('');
    });
  });
```

The code to accomplish this is:

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
