# Lab: Customize the PIN Dialog

At this point, the application has a well defined workflow for determining how to secure the token. However, the workflow used to gather or enter the PIN is a little clunky. The workflow and UI that it is currently using is intended for development use only, and is not intended to be used in a production quality application. **We highly suggest that application developers create their own PIN dialog and workflow in order to provide a more appropriate experience for their application.**

## Create the PIN Dialog

Since this isn't a trainig on "How to Create a Modal Dialog", let's just do copy-paste for that.

```html
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons v-if="!setPasscodeMode" slot="primary">
        <ion-button icon-only @click="cancel">
          <ion-icon :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding ion-text-center">
    <ion-label><div class="prompt">{{ prompt }}</div></ion-label>
    <ion-label><div class="pin">{{ displayPin }}</div></ion-label>
    <ion-label color="danger"
      ><div class="error">{{ errorMessage }}</div></ion-label
    >
  </ion-content>

  <ion-footer>
    <ion-grid>
      <ion-row>
        <ion-col v-for="n of [1, 2, 3]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [4, 5, 6]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [7, 8, 9]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button
            color="tertiary"
            expand="block"
            @click="remove()"
            :disabled="disableDelete"
            >Delete</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            expand="block"
            fill="outline"
            @click="append(0)"
            :disabled="disableInput"
            >0</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            color="secondary"
            expand="block"
            @click="enter()"
            :disabled="disableEnter"
            >Enter</ion-button
          >
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-footer>
</template>

<script lang="ts">
  import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonLabel,
    IonRow,
    IonTitle,
    IonToolbar,
    modalController,
  } from '@ionic/vue';
  import { close } from 'ionicons/icons';
  import { computed, defineComponent, ref } from 'vue';

  export default defineComponent({
    name: 'AppPinDialog',
    components: {
      IonButton,
      IonButtons,
      IonCol,
      IonContent,
      IonFooter,
      IonGrid,
      IonHeader,
      IonIcon,
      IonLabel,
      IonRow,
      IonTitle,
      IonToolbar,
    },
    props: {
      setPasscodeMode: Boolean,
    },
    setup(props) {
      let verifyPin = '';

      const disableDelete = computed(() => !pin.value.length);
      const disableEnter = computed(() => !(pin.value.length > 2));
      const disableInput = computed(() => pin.value.length > 8);

      const displayPin = computed(() => '*********'.slice(0, pin.value.length));

      const errorMessage = ref('');
      const pin = ref('');
      const prompt = ref('');
      const title = ref('');

      function initSetPasscodeMode() {
        prompt.value = 'Create Session PIN';
        title.value = 'Create PIN';
        verifyPin = '';
        pin.value = '';
      }

      function initUnlockMode() {
        prompt.value = 'Enter PIN to Unlock';
        title.value = 'Unlock';
        pin.value = '';
      }

      function initVerifyMode() {
        prompt.value = 'Verify PIN';
        verifyPin = pin.value;
        pin.value = '';
      }

      function append(n: number) {
        errorMessage.value = '';
        pin.value = pin.value.concat(n.toString());
      }

      function cancel() {
        modalController.dismiss(undefined, 'cancel');
      }

      function enter() {
        if (props.setPasscodeMode) {
          if (!verifyPin) {
            initVerifyMode();
          } else if (verifyPin === pin.value) {
            modalController.dismiss(pin.value);
          } else {
            errorMessage.value = 'PINS do not match';
            initSetPasscodeMode();
          }
        } else {
          modalController.dismiss(pin.value);
        }
      }

      function remove() {
        if (pin.value) {
          pin.value = pin.value.slice(0, pin.value.length - 1);
        }
      }

      if (props.setPasscodeMode) {
        initSetPasscodeMode();
      } else {
        initUnlockMode();
      }

      return {
        close,

        disableDelete,
        disableEnter,
        disableInput,
        displayPin,
        errorMessage,
        prompt,
        title,

        append,
        cancel,
        enter,
        remove,
      };
    },
  });
</script>

<style scoped>
  .prompt {
    font-size: 2em;
    font-weight: bold;
  }

  .pin {
    font-size: 3em;
    font-weight: bold;
  }

  .error {
    font-size: 1.5em;
    font-weight: bold;
  }

  ion-grid {
    padding-bottom: 32px;
  }
</style>
```

The logic within this component implements the following workflows:

- when setting up a new PIN, ask for the PIN twice and verify the same PIN is entered twice
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

The code to add to `src/service/SessionVaultService.ts` is then as follows. Be sure to import the `AppPinDialog` and the `modalController`.

```TypeScript
  async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<string> {
    const dlg = await modalController.create({
      backdropDismiss: false,
      component: AppPinDialog,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest
      }
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    return Promise.resolve(data || '');
  }
```

## Handling Startup

Everything is hooked up, but we have one issue. The `@ionic/vue` framework does not gracefully handle displaying the PIN dialog before we have fully entered the app. However, we are trying to do just that with our auth guard. Let's fix that. Modify the auth guard as follows:

```diff
--- a/src/router/index.ts
+++ b/src/router/index.ts
@@ -1,3 +1,4 @@
+import { AuthMode } from '@ionic-enterprise/identity-vault';
 import { createRouter, createWebHistory } from '@ionic/vue-router';
 import {
   NavigationGuardNext,
@@ -5,16 +6,28 @@ import {
   RouteLocationNormalized,
 } from 'vue-router';

+import { sessionVaultService } from '@/services/SessionVaultService';
 import store from '@/store';
 import Tabs from '../views/Tabs.vue';

+async function attemptRestore(): Promise<void> {
+  const mode = await sessionVaultService.getAuthMode();
+  if (
+    mode === AuthMode.PasscodeOnly ||
+    mode === AuthMode.BiometricAndPasscode
+  ) {
+    return;
+  }
+  await store.dispatch('restore');
+}
+
 async function checkAuthStatus(
   to: RouteLocationNormalized,
   from: RouteLocationNormalized,
   next: NavigationGuardNext,
 ) {
   if (!store.state.session && to.matched.some(r => r.meta.requiresAuth)) {
-    await store.dispatch('restore');
+    await attemptRestore();
     if (!store.state.session) {
       return next('/login');
     }
```

The result is that for any authentication mode that could require the entry of a passcode through our modal dialog, we will redirect to the the login page. For any other auth mode, we will attempt to restore as part of the startup flow.

## Conclusion

Congratulations. You now have a fully functional Identity Vault implementation. The implementation that we have is not the only "right way" to implement this. In the next section we will discussion various other options that are commonly implemented.
