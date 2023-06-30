# Lab: Interact with the Service Worker

In this lab, we will learn out to interact with the service worker to let the user know when an update is available and offer to apply them.

## Overview

The service workers main job is to cache the application and its resources. When the service worker does this, it does so as a single unit and stores them as a snapshot. When the application is updated, the updates will also be downloaded as a unit and the new snapshot will only be applied when the update is completely downloaded. This ensures consistency of the application.

Right now our app checks for an update every six seconds. If an update exists, the service worker downloads it and informs the app that an update is needed. The app then instructs the service worker to apply the update. This code in `src/App.tsx` handles that update:

```typescript
useEffect(() => {
  needRefresh && updateServiceWorker();
}, [needRefresh]);
```

This problem with this is that it could be jarring to the user. It is better if we tell the user an update is available and only apply it if the user agrees. This same code provides the perfect spot to do this.

## Add a Confirmation Dialog

Let's create a function that uses the `useIonAlert` hook to show a simple confirmation dialog.

First, destructure the `presentAlert` method from `useIonAlert()`:

```diff
+ const [presentAlert] = useIonAlert();
  const interval = 6 * 1000;
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered: (r) => r && setInterval(() => r.update(), interval),
  });
```

Next, add a function to display the alert:

```typescript
const presentRefreshAlert = async () => {
  await presentAlert({
    header: 'Update Available',
    message:
      'An update is available for this application. Would you like to refresh this application to get the update?',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
      },
      {
        text: 'Yes',
        role: 'confirm',
        handler: () => updateServiceWorker(),
      },
    ],
  });
};
```

Finally, update the `useEffect` to call `presentRefreshAlert()` when `needRefresh` is true:

```typescript
useEffect(() => {
  needRefresh && presentRefreshAlert();
}, [needRefresh]);
```

## Final Cleanup

Build and deploy. After the initial update, you will notice the following behavior:

1. If new changes are deployed, the app will ask if you would like to refresh.
1. If you say "No", the service worker will continue to serve the existing version of the application without the newly deployed changes. The app will ask again if you either deploy more changes or you restart the application.
1. If you say "Yes", the service worker will refresh the app and start serving the newly deployed changes.

The above is still using our "check every six seconds" rule, which is probably a bit too often. Change the interval to once every hour.

Make sure your application lints properly and that all of the test pass.

## Conclusion

You now have a fully functioning application that you can easily deploy as either a hybrid mobile application or a PWA.
