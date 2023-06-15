# Lab: Add Social Sharing

In this lab you will use Capacitor to access a native API. Specifically, the social sharing APIs on iOS and Android devices.

**Note:** this is an "extra credit" lab and can be skipped without affecting the main functionality of the application. It adds a neat feature, though... 🤓

## Capacitor Native API Plugins

We can use various <a href="https://capacitorjs.com/docs/plugins" target="_blank">Capacitor Plugins</a> in order to provide access to native APIs.

You've used some before, using the <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen</a> plugin to programmatically dismiss the application's splash screen. You've also used the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Preferences</a> plugin.

Some plugins provide native functionality that the user can interact with directly. The <a href="https://capacitorjs.com/docs/apis/share" target="_blank">Social Sharing</a> plugin is one of those. In this lab we will update the code to use that plugin to allow us to share tea tasting notes with our friends.

While we are on the subject of plugins, Capacitor has been designed to also work with Cordova plugins. When choosing a plugin, we suggest favoring Capacitor plugins over Cordova plugins.

## Add a Button

The first thing we will do is add a sharing button to the top of our `TastingNoteEditor` modal component, to the left of the submit button. We will also include stubs for state variables and methods that we need.

Add the following component variables and method _after_ the statement that destructures `useForm()`:

```typescript
const sharingIsAvailable = true;
const allowShare = false;

const share = async (): Promise<void> => {};
```

**Note:** the placement is important, as we will see shortly.

And modify the component template, adding the following button before the submit button.

```tsx
{
  sharingIsAvailable && (
    <IonButton data-testid="share-button" disabled={!allowShare} onClick={() => share()}>
      <IonIcon slot="icon-only" icon={shareOutline} />
    </IonButton>
  );
}
```

At this point, the button should display and be clickable, but it is not functional yet.

### Share Only on Devices

The designers have let us know that they only want this functionality available when users are running in a mobile context, so let's take care of making sure the button is only visible in that context.

We will start with the test. First, import the `isPlatform` function from `@ionic/react` and mock it. Add the following import and mock to `src/components/note-editor/TastingNoteEditor.test.tsx`:

```typescript
import { isPlatform } from '@ionic/react';
...
vi.mock('@ionic/react', async (getOriginal) => {
  const original: any = await getOriginal();
  return { ...original, isPlatform: vi.fn() };
});
```

In the main `beforeEach()`, create a mock implementation that defaults to us running in a mobile context. We will do this in the code by passing the "hybrid" flag, so just compare the value sent to "hybrid".

```typescript
beforeEach(() => {
  (isPlatform as Mock).mockReturnValue(true);
  vi.clearAllMocks();
});
```

At this point we can start creating the tests for the button. Note the special case test for the web context.

```typescript
describe('share button', () => {
  describe('in a web context', () => {
    beforeEach(() => (isPlatform as Mock).mockReturnValue(false));

    it('does not exist', () => {
      render(<TastingNoteEditor {...props} />);
      expect(screen.queryByTestId('share-button')).not.toBeInTheDocument();
    });
  });

  describe('in a mobile context', () => {
    it('exists', () => {
      render(<TastingNoteEditor {...props} />);
      expect(screen.queryByTestId('share-button')).toBeInTheDocument();
    });
  });
});
```

The web context test fails, of course, because our `sharingIsAvailable` property is just set to `true` all of the time. Let's fix that now:

```typescript
const sharingIsAvailable = isPlatform('hybrid');
```

### Enable When Enough Information Exists

In order to share a rating, we need to have at least the brand, name, and rating entered. The button should be disabled until these are entered.

First we will test for it. This test belongs right after the `exists` test within the `in a mobile context` describe that we just created above.

```typescript
it('is disabled until enough information is entered', async () => {
  render(<TastingNoteEditor {...props} />);
  const button = screen.getByTestId('share-button') as HTMLIonButtonElement;
  await waitFor(() => expect(button.disabled).toBeTruthy());

  await waitFor(() => fireEvent.input(screen.getByLabelText('Brand'), { target: { value: 'foobar' } }));
  await waitFor(() => expect(button.disabled).toBeTruthy());

  await waitFor(() => fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'mytea' } }));
  await waitFor(() => expect(button.disabled).toBeTruthy());

  await waitFor(() => fireEvent.click(screen.getAllByTestId('outline')[2]));
  await waitFor(() => expect(button.disabled).toBeFalsy());
});
```

`useForm()` has a method we can use to watch changes made to form inputs; appropriately named `watch`:

```diff
const {
  handleSubmit,
  control,
  formState: { errors, isValid, touchedFields, dirtyFields },
  reset,
+ watch,
} = useForm<TastingNote>(
  mode: 'onTouched',
  resolver: yupResolver(validationSchema),
  defaultValues: note || undefined,
);
```

We'll use it to run the logic to determine whether or not the form is in a sharable state:

```typescript
const allowShare = watch(['brand', 'name', 'rating']).every((el) => !!el);
```

The relevant portion to us is that every time `brand`, `name` or `rating` changes we make sure none of the fields are empty or undefined. If you'd like to learn more about how `watch` works, I highly recommend checking out the relevant <a href="https://react-hook-form.com/api/useform/watch/" target="_blank">React Hook Form documentation</a>.

## Share the Note

The final step is to call the share API when the button is clicked. Let's update the test. First we will need to create a manual mock for the plugin. Create a file named `__mocks__/@capacitor/share.ts` with the following contents:

```typescript
import { vi } from 'vitest';

export const Share = {
  share: vi.fn().mockResolvedValue(undefined),
};
```

Install the plugin so it is available to us:

```bash
npm i @capacitor/share
```

Import and mock the plugin in the `src/components/note-editor/TastingNoteEditor.test.tsx` test file:

```typescript
import { Share } from '@capacitor/share';
...
vi.mock('@capacitor/share');
```

Then we will add a test within the `in a mobile context` describe block.

```typescript
it('calls the share plugin when pressed', async () => {
  render(<TastingNoteEditor {...props} />);
  const button = screen.getByTestId('share-button') as HTMLIonButtonElement;
  await waitFor(() => fireEvent.input(screen.getByLabelText('Brand'), { target: { value: 'foobar' } }));
  await waitFor(() => fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'mytea' } }));
  await waitFor(() => fireEvent.click(screen.getAllByTestId('outline')[2]));
  fireEvent.click(button);
  await waitFor(() => expect(Share.share).toHaveBeenCalledTimes(1));
  expect(Share.share).toHaveBeenCalledWith({
    title: 'foobar: mytea',
    text: 'I gave foobar: mytea 3 stars on the Tea Taster app',
    dialogTitle: 'Share your tasting note',
    url: 'https://tea-taster-training.web.app',
  });
});
```

We can then add the code fill out the `share()` accordingly. First, we need to destructure `getValues` from `useForm()`:

```diff
const {
  handleSubmit,
  control,
  formState: { errors, isValid, touchedFields, dirtyFields },
  watch,
+ getValues,
} = useForm<TastingNote>({
  mode: 'onTouched',
  resolver: yupResolver(validationSchema),
  defaultValues: note || undefined,
});
```

Then we can fill out the `share()` function:

```typescript
const share = async (): Promise<void> => {
  const [brand, name, rating] = getValues(['brand', 'name', 'rating']);
  await Share.share({
    title: `${brand}: ${name}`,
    text: `I gave ${brand}: ${name} ${rating} stars on the Tea Taster app`,
    dialogTitle: 'Share your tasting note',
    url: 'https://tea-taster-training.web.app',
  });
};
```

You will also have to add a line importing the `Share` object from `@capacitor/share`.

## Conclusion

Build for your device and test this out. You should be to share your tasting notes now.
