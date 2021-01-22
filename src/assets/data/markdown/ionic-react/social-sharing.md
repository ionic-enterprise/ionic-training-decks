# Lab: Add Social Sharing

In this lab, you will use Capacitor to access native social sharing APIs.

## Capacitor Native API Plugins

We can use various <a href="https://capacitorjs.com/docs/plugins" target="_blank">Capacitor Plugins</a> in order to provide access to native APIs. We have already made use of these to a certain degree with our use of the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage</a> and <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen</a> plugins. These plugins work behind the scenes, so we can't really "experience" anything with them.

Some plugins, though, provide native functionallity that the user interacts with directly. The <a href="https://capacitorjs.com/docs/apis/share" target="_blank">Social Sharing</a> plugin is one of those. In this lab we will update the code to use that plugin to allow us to share tea tasting notes with our friends.

While we are on the subject of plugins, Capacitor has been designed to also work with Cordova plugins. When choosing a plugin, we suggest favoring Capacitor plugins over Cordova plugins.

### Web Compatibility

The web is constantly evolving, adding new APIs that provide native-level functionality. This allows certain plugins, such as the Social Sharing plugin, to be functional across iOS, Android, and web platforms.

Sites such as <a href="https://whatpwacando.today/" target="_blank">What PWA Can Do Today</a> showcase what functionality is available on the web platform. Before looking for a plugin, it's often wise to see if the functionality you are looking to achieve is available through a widely supported Web API. There is limited compatibility for the Web Share API (as of writing) -- which is a good indicator that a plugin would be needed to provide this functionality.

In a production setting, we would want to conditionally hide social sharing functionality from the web platform due to it's spotty support. However, we will not be doing this in our lab.

## Add a Button

The first thing we will do is add a sharing button to the top of our `TastingNoteEditor` component. We will also include stubs for the bound properties and the click handler:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
...
const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  ...
}) => {}
  const [allowSharing, setAllowSharing] = useState<boolean>(false);
  ...
  const share = async (): Promise<void> => { };

  return (
    ...
      <IonButtons slot="primary">
        <IonButton
          id="share-button"
          disabled={!allowSharing}
          onClick={() => share()}
        >
          <IonIcon slot="icon-only" icon={shareOutline} />
        </IonButton>
        ... // Cancel button here
      </IonButtons>
    ...
  );
};
export default TastingNoteEditor;
```

At this point, the button should display and be clickable, but it is not functional yet.

### Enable When Enough Information Exists

In order to share a rating, we need to have at least the brand, name, and rating entered. The button should be disabed until these are entered.

First we will test for it. Let's add a describe block to `TastingNoteEditor.test.tsx` with the following unit test:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
...
describe('<TastingNoteEditor />', () => {
  ...

  describe('share', () => {
    it('is not allowed until a brand, name, and rating have all been entered', async () => {
      const { container, getByLabelText } = render(component);
      const [brand, name, rating, share] = await waitForElement(() => [
        container.querySelector('#brand-input')!,
        container.querySelector('#name-input')!,
        getByLabelText(/Rate 1 stars/),
        container.querySelector('#share-button')! as HTMLIonButtonElement,
      ]);
      await wait(() => {
        expect(share.disabled).toBeTruthy();
        fireEvent.ionChange(brand, mockNote.brand);
        expect(share.disabled).toBeTruthy();
        fireEvent.ionChange(name, mockNote.name);
        expect(share.disabled).toBeTruthy();
        fireEvent.click(rating);
      });
      expect(share.disabled).toBeFalsy();
    });
  });

  afterEach(() => {
    ...
  });
});
```

We can then add the proper logic to the `TastingNoteEditor` component:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
...
const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  ...
}) => {
  const {handleSubmit, control, formState, getValues } = useForm<TastingNote>({
    mode: 'onChange',
  });
  ...
  useEffect(() => {
    const { brand, name, rating } = getValues();
    if (brand.length && name.length && rating > 0) setAllowSharing(true);
    else setAllowSharing(false);
  }, [getValues, formState]);
  ...
};
export default TastingNoteEditor;
```

## Share the Note

The final step is to call the social sharing API when the button is clicked. Let's test first. We will need to import the `Plugins` object from `@capacitor/core` and mock the `Share` object within it:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
import { Plugins } from '@capacitor/core';
...
describe('<TastingNoteEditor />', () => {
  ...
  describe('share', () => {
    beforeEach(() => {
      (Plugins.Share as any) = jest.fn();
      (Plugins.Share.share as any) = jest.fn();
    });

    it('is not allowed until a brand, name, and rating have all been entered', async () => {
      ...
    });
  });
};
```

Next we'll add a test to the `share` describe block:

```TypeScript
    it('calls the share plugin when pressed', async () => {
      const { container, getByLabelText } = render(component);
      const [brand, name, rating, share] = await waitForElement(() => [
        container.querySelector('#brand-input')!,
        container.querySelector('#name-input')!,
        getByLabelText(/Rate 1 stars/),
        container.querySelector('#share-button')! as HTMLIonButtonElement,
      ]);
      await wait(() => {
        expect(share.disabled).toBeTruthy();
        fireEvent.ionChange(brand, mockNote.brand);
        expect(share.disabled).toBeTruthy();
        fireEvent.ionChange(name, mockNote.name);
        expect(share.disabled).toBeTruthy();
        fireEvent.click(rating);
        fireEvent.click(share);
      });
      expect(Plugins.Share.share).toHaveBeenCalledTimes(1);
      expect(Plugins.Share.share).toHaveBeenCalledWith({
        title: `${mockNote.brand}: ${mockNote.name}`,
        text: `I gave ${mockNote.brand}: ${mockNote.name} ${mockNote.rating} stars on the Tea Taster app`,
        dialogTitle: 'Share your tasting note',
        url: 'https://tea-taster-training.web.app',
      });
    });
```

Now we can add the code to fill out the `share()` method accordingly. Make note that you will have to import the `Plugins` object from `@capacitor/core` to `TastingNoteEditor.tsx`:

```TypeScript
const share = async (): Promise<void> => {
  const { Share } = Plugins;
  const { brand, name, rating } = getValues();
  await Share.share({
    title: `${brand}: ${name}`,
    text: `I gave ${brand}: ${name} ${rating} stars on the Tea Taster app`,
    dialogTitle: 'Share your tasting note',
    url: 'https://tea-taster-training.web.app',
  });
};
```

## Conclusion

Build for your device and test this out. You should be to share your tasting notes now.
