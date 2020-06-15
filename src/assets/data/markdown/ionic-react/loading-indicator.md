# Lab: Add a Loading Indicator

In this lab, you will learn how to use overlay component. Specifically the Loading Indicator.

## Steps

Using overlays in `@ionic/react` is a bit easier than it currently is in `@ionic/angular`, at least for common scenarios like showing and hiding a loading indicator. In each of the three pages, you will do this:

1. Create a state hook for the `loading` flag: `const [loading, setLoading] = useState(false);` (see the other state hooks)
1. In the `useIonViewWillLoad` hook, Call `setLoading(true);` before loading the data and `setLoading(false)` once the data is done loading
1. Add an `IonLoading` to the component within the `IonContent`: `<IonLoading message="Loading Weather..." isOpen={loading}></IonLoading>`

Change the message to be appropriate to the page itself (or you can remove the message entirely if you wish or make it completely generic).

## Conclusion

Well, that was easy... 😁

**Note:** In a produtcion app, you want to have unit tests for each of these pages. This training has not been developed that far yet. This section will get bigger once that is in place.
