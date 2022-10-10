# Lab: Add Social Sharing

In this lab you will use Capacitor to access a native API. Specifically, the social sharing APIs on iOS and Android devices.

**Note:** this is an "extra credit" lab and can be skipped without affecting the main functionality of the application. It adds a neat feature, though... 🤓

## Capacitor Native API Plugins

We can use various <a href="https://capacitorjs.com/docs/plugins" target="_blank">Capacitor Plugins</a> in order to provide access to native APIs. We have already done this to a certain degree with our use of the <a href="https://capacitorjs.com/docs/apis/preferences" target="_blank">Preferences</a> plugin. That plugin, however, works completely behind the scenes, so we can't really "experience" anything with it.

Some plugins, though, provide native functionality that the user interacts with directly. The <a href="https://capacitorjs.com/docs/apis/share" target="_blank">Social Sharing</a> plugin is one of those. In this lab we will update the code to use that plugin to allow us to share tea tasting notes with our friends.

While we are on the subject of plugins, Capacitor has been designed to also work with Cordova plugins. When choosing a plugin, we suggest favoring Capacitor plugins over Cordova plugins.

## Add a Button

The first thing we will do is add a sharing button to the top of our `AppTastingNotes` modal component, to the left of the cancel button. We will also include stubs for the computed properties and methods that we need.

```html
<template>
  ...
  <ion-buttons slot="primary">
    <ion-button
      id="share-button"
      data-testid="share-button"
      v-if="sharingIsAvailable"
      :disabled="!allowShare"
      @click="share()"
    >
      <ion-icon slot="icon-only" :icon="shareOutline"></ion-icon>
    </ion-button>
    ... // Cancel button is already here...
  </ion-buttons>
  ...
</template>

<script setup lang="ts">
  ...
  import { computed, ref } from 'vue';
  import { close, shareOutline } from 'ionicons/icons';
  ...
  const allowShare = computed( () => true);
  const sharingIsAvailable = ref(true);
  const share = async (): Promise<void> => {
    return;
  }
</script>
```

At this point, the button should display and be clickable, but it is not functional yet.

### Share Only on Devices

The designers have let us know that they only want this functionality available when users are running in a mobile context, so let's take care of making sure the button is only visible in that context.

We will start with the test. First, import the `isPlatform` function from `@ionic/vue` and mock it. This get's a little tricky as you need to mock all of `@ionic/vue` using the actual implementation for most of it.

```TypeScript
import { isPlatform, modalController } from '@ionic/vue';
...
jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});
```

In the main `beforeEach()`, create a mock implementation that defaults to us running in a mobile context. We will do this in the code by passing the "hybrid" flag, so just compare the value sent to "hybrid". Do this before mounting the component (towards the end of the `beforeEach()`).

```TypeScript
    (isPlatform as jest.Mock).mockImplementation((key: string) => key === 'hybrid');
```

At this point we can start creating the tests for the button. Note the special case test for the web context. Also note that we are remounting the modal there. That is because the `isPlatform` is only going to be evaluated at that time. We aren't doing anything here that would otherwise trigger a re-evaluation.

```TypeScript
  describe('share button', () => {
    describe('in a web context', () => {
      beforeEach(() => {
        (isPlatform as jest.Mock).mockImplementation(
          (key: string) => key !== 'hybrid',
        );
      });

      afterEach(() => {
        (isPlatform as jest.Mock).mockImplementation(
          (key: string) => key === 'hybrid',
        );
      });

      it('does not exist', () => {
        const modal = mount(AppTastingNoteEditor);
        const button = modal.findComponent('[data-testid="share-button"]');
        expect(button.exists()).toBe(false);
      });
    });

    it('exists', () => {
      const button = wrapper.findComponent('[data-testid="share-button"]');
      expect(button.exists()).toBe(true);
    });
  });
```

The web context test fails, of course, because our `sharingIsAvailable` property is just returning `true` all of the time. Let's fix that now:

```TypeScript
const sharingIsAvailable = ref(isPlatform('hybrid');
```

### Enable When Enough Information Exists

In order to share a rating, we need to have at least the brand, name, and rating entered. The button should be disabled until these are entered.

First we will test for it. This test belongs right after the `exists` test within the `share button` describe that we just created above.

```TypeScript
    it('is disabled until enough information is entered', async () => {
      const button = wrapper.findComponent('[data-testid="share-button"]');
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const rating = wrapper.findComponent('[data-testid="rating-input"]');

      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await brand.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await name.setValue('mytea');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await rating.setValue(2);
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });
```

We can then enter the proper logic in the `allowShare` computed property:

```TypeScript
const allowShare = computed(() => !!(brand.value && name.value && rating.value));
```

## Share the Note

The final step is to call the share API when the button is clicked. Let's update the test. First we will need to create a manual mock for the plugin similar to the one we already have for `@capacitor/preferences`:

**`__mocks__/@capacitor/share.ts`**

```typescript
export const Share = {
  share: jest.fn().mockResolvedValue(undefined),
};
```

Install the plugin so it is available to us:

```bash
$ npm i @capacitor/share
```

Import and mock the plugin in the `tests/unit/components/AppTastingNotes.spec.ts` test file:

```TypeScript
import { Share } from '@capacitor/share';
...
jest.mock('@capacitor/share');
```

Then we will add a test within the `share button` describe block.

```TypeScript
    it('calls the share plugin when pressed', async () => {
      const button = wrapper.find('[data-testid="share-button"]');
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const rating = wrapper.findComponent('[data-testid="rating-input"]');

      await brand.setValue('foobar');
      await name.setValue('mytea');
      await rating.setValue(2);

      await button.trigger('click');

      expect(Share.share).toHaveBeenCalledTimes(1);
      expect(Share.share).toHaveBeenCalledWith({
        title: 'foobar: mytea',
        text: 'I gave foobar: mytea 2 stars on the Tea Taster app',
        dialogTitle: 'Share your tasting note',
        url: 'https://tea-taster-training.web.app',
      });
    });
```

We can then add the code fill out the `share()` accordingly:

```TypeScript
    async function share(): Promise<void> {
      await Share.share({
        title: `${brand.value}: ${name.value}`,
        text: `I gave ${brand.value}: ${name.value} ${rating.value} stars on the Tea Taster app`,
        dialogTitle: 'Share your tasting note',
        url: 'https://tea-taster-training.web.app',
      });
    }
```

You will also have to add a line importing the `Share` object from `@capacitor/share`.

## Conclusion

Build for your device and test this out. You should be to share your tasting notes now.
