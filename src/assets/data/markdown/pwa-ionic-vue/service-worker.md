# Lab: Interact with the Service Worker

In this lab, we will learn out to interact with the service worker to let the user know when an update is available and offer to apply them.

## Overview

The service workers main job is to cache the application and its resources. When the service worker does this, it does so as a single unit and stores them as a snapshot. When the application is updated, the updates will also be downloaded as a unit and the new snapshot will only be applied when the update is completely downloaded. This ensures consistency of the application.

Right now our app checks for an update every six seconds. If an update exists, the service worker downloads it and informs the app that an update is needed. The app then instructs the service worker to apply the update. This code in `src/App.vue` handles that update:

```typescript
watchEffect(() => {
  if (needRefresh.value) {
    updateServiceWorker();
  }
});
```

This problem with this is that it could be jarring to the user. It is better if we tell the user an update is available and only apply it if the user agrees. This same code provides the perfect spot to do this.

## Add a Confirmation Dialog

Let's create a simple composable function that uses an `IonAlert` to show a simple confirmation dialog.

### Test

Create a test for it in `src/composables/__tests__/confirmation-dialog.spec.ts`:

```typescript
import { alertController } from '@ionic/vue';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useConfirmationDialog } from '../confirmation-dialog';

vi.mock('@ionic/vue', async () => {
  const actual = vi.importActual('@ionic/vue');
  return {
    ...actual,
    alertController: { create: vi.fn() },
  };
});

describe('confirmation dialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('confirm', () => {
    let dialog: any;
    beforeEach(() => {
      dialog = {
        present: vi.fn(),
        onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }),
      };
      (alertController.create as Mock).mockResolvedValue(dialog);
    });

    it('creates an alert', async () => {
      const { confirm } = useConfirmationDialog();
      await confirm('Delete tag', 'Are you sure you want to remove this tag?');
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alertController.create).toHaveBeenCalledWith({
        header: 'Delete tag',
        message: 'Are you sure you want to remove this tag?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            role: 'confirm',
          },
        ],
      });
    });

    it('presents the dialog', async () => {
      const { confirm } = useConfirmationDialog();
      await confirm('Delete tag', 'Are you sure you want to remove this tag?');
      expect(dialog.present).toHaveBeenCalledTimes(1);
    });

    it('resolves false on no', async () => {
      const { confirm } = useConfirmationDialog();
      expect(await confirm('Delete tag', 'Are you sure you want to remove this tag?')).toBe(false);
    });

    it('resolves true on yes', async () => {
      const { confirm } = useConfirmationDialog();
      (dialog.onDidDismiss as Mock).mockResolvedValue({ role: 'confirm' });
      expect(await confirm('Delete tag', 'Are you sure you want to remove this tag?')).toBe(true);
    });
  });
});
```

### Code

Create the composable function in `src/composables/confirmation-dialog.ts`:

```typescript
import { alertController } from '@ionic/vue';

const confirm = async (header: string, message?: string): Promise<boolean> => {
  const alert = await alertController.create({
    header,
    message,
    buttons: [
      {
        text: 'No',
        role: 'cancel',
      },
      {
        text: 'Yes',
        role: 'confirm',
      },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'confirm';
};

export const useConfirmationDialog = () => ({ confirm });
```

### Mock

Create a mock for this so we can properly test wherever it is used.

```typescript
import { vi } from 'vitest';

const confirm = vi.fn().mockResolvedValue(false);

export const useConfirmationDialog = () => ({ confirm });
```

## Use the Confirmation Dialog

The requirements for confirming a refresh are straight forward.

- Ask the user if they would like to refresh as needed.
- Do the refresh if the user says "yes."
- Do not do the refresh if the user says "no."

Replace the previous "updates the service worker as needed" test in `src/__tests__/App.spec.ts` with tests that reflect the new requirments.

```typescript
import { useConfirmationDialog } from '@/composables/confirmation-dialog';

vi.mock('@/composables/confirmation-dialog');

...

  it('asks to update the service worker as needed', async () => {
    const { needRefresh } = useRegisterSW();
    const { confirm } = useConfirmationDialog();
    shallowMount(App);
    expect(confirm).not.toHaveBeenCalled();
    needRefresh.value = true;
    await flushPromises();
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('updates the app on confirm', async () => {
    const { needRefresh, updateServiceWorker } = useRegisterSW();
    const { confirm } = useConfirmationDialog();
    (confirm as Mock).mockResolvedValue(true);
    shallowMount(App);
    expect(updateServiceWorker).not.toHaveBeenCalled();
    needRefresh.value = true;
    await flushPromises();
    expect(updateServiceWorker).toHaveBeenCalledTimes(1);
  });

  it('does not update the app if the user does not confirm', async () => {
    const { needRefresh, updateServiceWorker } = useRegisterSW();
    const { confirm } = useConfirmationDialog();
    (confirm as Mock).mockResolvedValue(false);
    shallowMount(App);
    expect(updateServiceWorker).not.toHaveBeenCalled();
    needRefresh.value = true;
    await flushPromises();
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });
```

Updating our code in `src/App.vue` to perform the confirmation is straight forward. Remember to add an `import` for `useConfirmationDialog()`.

```typescript
const { confirm } = useConfirmationDialog();
watchEffect(async () => {
  if (
    needRefresh.value &&
    (await confirm(
      'Update Available',
      'An update is available for this application. Would you like to refresh this application to get the update?'
    ))
  ) {
    updateServiceWorker();
  }
});
```

## Final Cleanup

Build and deploy. After the initial update, you will notice the following behavior:

1. If new changes are deployed, the app will ask if you would like to refresh.
1. If you say "No", the service worker will continue to serve the existing version of the application without the newly deployed changes. The app will ask again if you either deploy more changes or you restart the application.
1. If you say "Yes", the service worker will refresh the app and start serving the newly deployed changes.

The above is still using our "check every six seconds" rule, which is probably a bit too often. Change the interval to once every hour.

Make sure your application lints properly and that all of the test pass.

**Extra Credit**: use the new `useConfirmationDialog()` to confirm the deletion of a tasting note.

## Conclusion

You now have a fully functioning application that you can easily deploy as either a hybrid mobile application or a PWA.
