# Lab: Add Social Sharing

In this lab you will use Capacitor to access a native API. Specifically, the social sharing APIs on iOS and Android devices.

## Capacitor Native API Plugins

We can use various <a href="https://capacitorjs.com/docs/plugins" target="_blank">Capacitor Plugins</a> in order to provide access to native APIs. We have already done this to a certain degree with our use of the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage</a> plugin. That plugin, however, works completely behind the scenes, so we can't really "experience" anything with it.

Some plugins, though, provide native functionality that the user interacts with directly. The <a href="https://capacitorjs.com/docs/apis/share" target="_blank">Social Sharing</a> plugin is one of those. In this lab we will update the code to use that plugin to allow us to share tea tasting notes with our friends.

```bash
npm i @capacitor/share
npx cap sync
```

While we are on the subject of plugins, Capacitor has been designed to also work with Cordova plugins. When choosing a plugin, we suggest favoring Capacitor plugins over Cordova plugins.

## Add a Button

The first thing we will do is add a sharing button to the top of our `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.html` file, to the left of the cancel button. We will also include stubs for the bound properties and the click handler in the associated TypeScript file.

```html
<ion-buttons slot="primary">
  <ion-button *ngIf="sharingIsAvailable" [disabled]="!allowSharing" id="share-button" (click)="share()">
    <ion-icon slot="icon-only" name="share-outline"></ion-icon>
  </ion-button>
  ... // Cancel button is already here...
</ion-buttons>
```

```TypeScript
  get sharingIsAvailable(): boolean {
    return true;
  }

  get allowSharing(): boolean {
    return true;
  }
  ...
  share() {}
```

At this point, the button should display and be clickable, but it is not functional yet.

### Share Only on Devices

The designers have let us know that they only want this functionality available when users are running in a mobile context, so let's take care of making sure the button is only visible in that context.

We will start with the test. First, import the `Platform` service from `@ionic/angular` and provide a mock for it where we set up the testing module.

```TypeScript
import { IonicModule, ModalController, Platform } from '@ionic/angular';
...
import { createOverlayControllerMock, createPlatformMock } from '@test/mocks';

describe('TastingNoteEditorComponent', () => {
  ...
        providers: [
          ...
          {
            provide: Platform,
            useFactory: createPlatformMock,
          },
```

At this point we can start creating the tests for the properties that control the button:

```TypeScript
  describe('share', () => {
    describe('in a web context', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as any).withArgs('hybrid').and.returnValue(false);
        fixture.detectChanges();
      });

      it('is not available', () => {
        expect(fixture.debugElement.query(By.css('#share-button'))).toBeFalsy();
      });
    });

    describe('in a mobile context', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as any).withArgs('hybrid').and.returnValue(true);
        fixture.detectChanges();
      });

      it('is available', () => {
        expect(fixture.debugElement.query(By.css('#share-button'))).toBeTruthy();
      });
    });
  });
```

The web context test fails, of course, because our `sharingIsAvailable` getter is just returning `true` all of the time. Let's fix that now:

```TypeScript
import { ModalController, Platform } from '@ionic/angular';
...
  get sharingIsAvailable(): boolean {
    return this.platform.is('hybrid');
  }
...
  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private tastingNotesService: TastingNotesService,
    private teaService: TeaService,
  ) {}
```

### Enable When Enough Information Exists

In order to share a rating, we need to have at least the brand, name, and rating entered. The button should be disabled until these are entered.

First we will test for it. This test belongs right after the `is available` test within the `in a mobile context` describe that we just created above.

```TypeScript
      it('is not allowed until a brand, name, and rating have all been entered', () => {
        const button = fixture.debugElement.query(By.css('#share-button'));
        expect(button.nativeElement.disabled).toBeTrue();

        component.brand = 'Lipton';
        fixture.detectChanges();
        expect(button.nativeElement.disabled).toBeTrue();

        component.name = 'Yellow Label';
        fixture.detectChanges();
        expect(button.nativeElement.disabled).toBeTrue();

        component.rating = 2;
        fixture.detectChanges();
        expect(button.nativeElement.disabled).toBeFalse();
      });
```

We can then enter the proper logic in the `allowShare` getter:

```TypeScript
  get allowSharing(): boolean {
    return !!(this.brand && this.name && this.rating);
  }
```

## Share the Note

The final step is to call the share API when the button is clicked. Let's update the test. First we will need to create a global mock for the plugin (just like we previously did for the Storage plugin). Create a `__mocks__/@capacitor/share.ts` file with the following contents:

```TypeScript
class MockShare {
  async share(opt: {
    title: string;
    text: string;
    url: string;
    dialogTitle: string;
  }): Promise<{ activityType: string | undefined }> {
    return { activityType: 'test' };
  }
}

const Share = new MockShare();

export { Share };
```

Then we will add a test within the `share in a mobile context` describe block of the notes editor test.

```TypeScript
import { Share } from '@capacitor/share';
...
      it('calls the share plugin when clicked', async () => {
        spyOn(Share, 'share');
        const button = fixture.debugElement.query(By.css('#share-button'));

        component.brand = 'Lipton';
        component.name = 'Yellow Label';
        component.rating = 2;

        const event = new Event('click');
        button.nativeElement.dispatchEvent(event);
        fixture.detectChanges();

        expect(Share.share).toHaveBeenCalledTimes(1);
        expect(Share.share).toHaveBeenCalledWith({
          title: 'Lipton: Yellow Label',
          text: 'I gave Lipton: Yellow Label 2 stars on the Tea Taster app',
          dialogTitle: 'Share your tasting note',
          url: 'https://tea-taster-training.web.app',
        });
      });
```

We can then add the code fill out the `share()` accordingly. You will also have to add a line importing the `Share` object from `@capacitor/share`:

```TypeScript
  async share(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await Share.share({
      title: `${this.brand}: ${this.name}`,
      text: `I gave ${this.brand}: ${this.name} ${this.rating} stars on the Tea Taster app`,
      dialogTitle: 'Share your tasting note',
      url: 'https://tea-taster-training.web.app',
    });
  }
```

## Conclusion

Build for your device and test this out. You should be to share your tasting notes now.
