# Lab: Add Social Sharing

In this lab, you will use Capacitor to access native social sharing APIs.

## Capacitor Native API Plugins

We can use various <a href="https://capacitorjs.com/docs/plugins" target="_blank">Capacitor Plugins</a> in order to provide access to native APIs. We have already made use of these to a certain degree with our use of the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage</a> and <a href="https://capacitorjs.com/docs/apis/splash-screen" target="_blank">Splash Screen</a> plugins. These plugins work behind the scenes, so we can't really "experience" anything with them.

Some other plugins provide native functionality that users can interact with directly. The <a href="https://capacitorjs.com/docs/apis/share" target="_blank">Share Capacitor plugin</a> among them. In this lab we will update the code to use that plugin to allow us to share tea tasting notes with our friends.

While we are on the subject of plugins, Capacitor has been designed to also work with Cordova plugins. When choosing a plugin, we suggest favoring Capacitor plugins over Cordova plugins.

## Pre-Work

Let's update the sliding items from the last lab so that it displays a trashcan icon instead of the full word "Delete".

**`src/tasting-notes/TastingNotesPage.tsx`**

```JSX
<IonItemOption
  color="danger"
  onClick={() => handleDeleteNote(note.id!)}
  slot="icon-only"
>
  <IonIcon icon={trashBin} />
</IonItemOption>
```

Install the Share Capacitor API plugin to your application:

```bash
$ npm install @capacitor/share
$ npx cap sync
```

## Sharing a Tasting Note

It would be fun to share one of the tasting notes with our friends. We will accomplish this by adding another sliding option to each list item.

### Adding the Option

Start by stubbing out a method to handle when the option is tapped.

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
...
const handleShareNote = async (note: TastingNote) => {
  console.log(note);
};
...
```

Then add the option to the `<IonItemOptions />` component.

```TypeScript
<IonItemOption
  data-testid={`share${idx}`}
  color="secondary"
  onClick={() => handleShareNote(note)}
  slot="icon-only"
>
  <IonIcon icon={share} />
</IonItemOption>
```

### Using the Plugin

First, the Capacitor Social Sharing API needs to be mocked in our unit test. Update the `beforeEach()` block in `TastingNotesPage.test.tsx` to the following:

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
...
jest.mock('@capacitor/share');
...
beforeEach(() => {
  mockGetNotes = jest.fn(async () => mockNotes);
  Share.share = jest.fn();
});
```

Next, add a `describe()` block for 'sharing a note' as a sibling to the 'initialization', 'add a new note', and 'update an existing note' describe blocks.

```TypeScript
describe('sharing a note', () => {
  it('calls the share plugin when called', async () => {
    const { getByTestId } = render(<TastingNotesPage />);
    const item = await waitFor(() => getByTestId(/share0/));
    fireEvent.click(item);
    await waitFor(() => expect(Share.share).toHaveBeenCalledTimes(1));
  });

  it('shares the brand, name, rating, and notes', async () => {
    const { getByTestId } = render(<TastingNotesPage />);
    const item = await waitFor(() => getByTestId(/share0/));
    fireEvent.click(item);
    await waitFor(() =>
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Lipton: Yellow Label',
        text: `Overly acidic, highly tannic flavor Rated 1/5 stars`,
        dialogTitle: `Share Yellow Label's tasting note`,
        url: 'https://tea-taster-training.web.app',
      }),
    );
  });
});
```

Finally, implement `handleSharedNote` in `TastingNotesPage.tsx`.

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
const handleShareNote = async (note: TastingNote) => {
  const { brand, name, rating, notes } = note;
  await Share.share({
    title: `${brand}: ${name}`,
    text: `${notes} Rated ${rating}/5 stars`,
    dialogTitle: `Share ${name}'s tasting note`,
    url: 'https://tea-taster-training.web.app',
  });
};
```

## Side-Note: Web Compatibility

The web is constantly evolving, adding new APIs that provide native-level functionality. This allows certain plugins, such as the Social Sharing plugin, to be functional across iOS, Android, and web platforms.

Sites such as <a href="https://whatpwacando.today/" target="_blank">What PWA Can Do Today</a> showcase what functionality is available on the web platform. Before looking for a plugin, it's often wise to see if the functionality you are looking to achieve is available through a widely supported Web API. There is limited compatibility for the Web Share API (as of writing) -- which is a good indicator that a plugin would be needed to provide this functionality.

In a production setting, we would want to conditionally hide social sharing functionality from the web platform due to it's spotty support. However, we will not be doing this in our lab.

## Conclusion

Build for your device and test this out. You should be to share your tasting notes now. We are almost done building the application. One more page and we are done!
