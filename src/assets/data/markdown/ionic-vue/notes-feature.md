# Lab: Add the Notes Feature

In this lab, we will take what we have learned so far and add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, services, components, and pages, we will also use some Framework components we have not seen yet. These will include:

- The modal overlay
- Various form elements
- The sliding Ion Item

## Preliminary Items

There are a couple of preliminary items that we need to get out of the way first.

- Create a data model
- Create a data service that performs HTTP requests

### The `TastingNotes` Model

Add the following model in `src/models/TastingNote.ts` and make sure to update the `src/models/index.ts` accordingly:

```typescript
export interface TastingNote {
  id?: number;
  brand: string;
  name: string;
  notes: string;
  rating: number;
  teaCategoryId: number;
}
```

### The `useTastingNotes` Composition Function

This is a review of skills we have already learned. As such, the next steps provide you with enough information to get started, but expect you to do the heavy lifting. Let's get started. Here is the starting point for both the test and the code.

#### Test

`tests/unit/composables/tasting-notes.spec.ts`

```typescript
import { useBackendAPI } from '@/composables/backend-api';
import { useTastingNotes } from '@/composables/tasting-notes';
import { TastingNote } from '@/models';

jest.mock('@/composables/backend-api');

describe('useTastingNotes', () => {
  const { client } = useBackendAPI();
  let tastingNotes: Array<TastingNote>;

  const initializeTestData = () => {
    tastingNotes = [
      {
        id: 1,
        brand: 'Lipton',
        name: 'Green',
        notes: 'Bland and dull, but better than their standard tea',
        rating: 2,
        teaCategoryId: 1,
      },
      {
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      },
      {
        id: 42,
        brand: 'Rishi',
        name: 'Elderberry Healer',
        notes: 'Elderberry and ginger. Strong and healthy.',
        rating: 4,
        teaCategoryId: 7,
      },
    ];
  };

  beforeEach(() => {
    initializeTestData();
    jest.clearAllMocks();
    (client.get as jest.Mock).mockResolvedValue({ data: tastingNotes });
  });

  describe('refresh', () => {
    // TODO: create similar tests to those in tests/unit/composables/tea.spec.ts
  });

  describe('find', () => {
    // TODO: create similar tests to those in tests/unit/composables/tea.spec.ts
  });

  describe('merge', () => {
    const { notes, merge, refresh } = useTastingNotes();
    // beforeEach(async () => await refresh());

    describe('a new note', () => {
      let note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
    });

    describe('an existing note', () => {
      let note: TastingNote = {
        id: 1,
        brand: 'Lipton',
        name: 'Green Tea',
        notes: 'Kinda like Lite beer. Dull, but well executed.',
        rating: 3,
        teaCategoryId: 1,
      };
    });
  });

  describe('remove', () => {
    const { notes, remove, refresh } = useTastingNotes();
    // beforeEach(async () => await refresh());
  });
});
```

#### Code

`src/composables/tasting-notes.ts`

```typescript
import { TastingNote } from '@/models';
import { ref } from 'vue';
import { useBackendAPI } from './backend-api';

const { client } = useBackendAPI();

const notes = ref<Array<TastingNote>>([]);

const find = async (id: number): Promise<TastingNote | undefined> => {
  return undefined;
};

const merge = async (note: TastingNote): Promise<TastingNote> => {
  return note;
};

const refresh = async (): Promise<void> => {
  null;
};

const remove = async (note: TastingNote): Promise<void> => {
  null;
};

export const useTastingNotes = () => ({
  notes,
  find,
  merge,
  refresh,
  remove,
});
```

#### Mock

```typescript
import { ref } from 'vue';
import { TastingNote } from '@/models';

export const useTastingNotes = jest.fn().mockReturnValue({
  notes: ref<Array<TastingNote>>([]),
  find: jest.fn().mockResolvedValue(undefined),
  merge: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
});
```

### `refresh` and `find`

We have done a `refresh` and a `find` before. Specifically for `useTeas()`. Look at the tests and code for those and create similar tests and code here.

For the tests, you can copy from the `refresh` and `find` tests from `tests/unit/composables/tea.spec.ts` and update them as appropriate.

For the `refresh()`, the proper endpoint is `/user-tasting-notes` and there is no need to transform the data, only to make sure the `notes.value` gets assigned properly when the data comes back.

For the `find()`, the biggest change involves the actual data being returned, though one test does also include the endpoint so be sure to update that as well.

In both cases, test descriptions will need some appropriate updates as well.

The code to satisfy the tests should be straight forward, but feel free to use the `src/composables/tea.ts` code to help guide you.

**Note:** It probably isn't worth it yet, but if we have to do one more composition function like this as the project grows we will want to look at abstracting some of this code further.

### `merge`

The `merge()` will either add a new note or update an existing note. This is determined by the existence or absence of an ID on the note object.

#### Adding

When adding a new note, we need to:

- Post to the `/user-tasting-notes` endpoint with a payload of the note.
- That endpoint will return the posted object with the ID added. As such, we need to:
  - Add that object to the `notes.value` array.
  - Return the new object.

Add the following tests within the `describe('a new note')` section:

```typescript
beforeEach(() => {
  (client.post as jest.Mock).mockResolvedValue({ data: { id: 73, ...note } });
});

it('posts the new note', async () => {
  await merge(note);
  expect(client.post).toHaveBeenCalledTimes(1);
  expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
});

it('resolves the saved note', async () => {
  expect(await merge(note)).toEqual({ id: 73, ...note });
});

it('adds the note to the notes list', async () => {
  await merge(note);
  expect(notes.value.length).toEqual(4);
  expect(notes.value[3]).toEqual({ id: 73, ...note });
});
```

_Note:_ you should also uncomment the `beforeEach(async () => await refresh());` line for the `merge` block. That was commented out as errors occur if you have a `beforeEach` but no tests.

Write the code in the `merge()` function to support that.

#### Updating

Updating a note is very similar:

- POST to the `/user-tasting-notes/:id` endpoint with a payload of the note, where `:id` is the `note.id`.
- That endpoint will return the posted object as save by the backend. As such, we need to:
  - Update that object within the `notes.value` array (find the index of it by ID, then replace the object).
  - Return the new object.

**Code Challenge:** your task is to:

1. Using the `describe('a new note')` tests as a model, create a set of tests for the "update" requirements within `describe('an existing note')`.
   1. The `beforeEach` sets up the mock to resolve to `{ data: note }`
   1. The POST test posts to the `/user-tasting-notes/1` endpoint
   1. The "resolves" test makes sure the `merge(note)` resolves to the `note`
   1. The "adds a note" test becomes an "updates the note" test, so no note is added (the length of `notes.value` is still 3), but the proper note has been modified
1. Update the `merge()` code accordingly.

### `remove`

In order to remove a tasting note, we need to:

- send a DELETE to the `/user-tasting-notes/:id` endpoint, where `:id` is the `note.id`. There is no payload for this.
- Remove the note from the `notes.value` array.

**Code Challenge:** your task is to:

1. Add a `delete()` method to the `client` in the `backend-api.ts` mock file (Axios already supports this, we never had it in our mock because we did not need it yet).
1. A spot already exists for the tests. Fill that out first.
   1. uncomment the `beforeEach` now that we are adding tests
   1. add a "DELETE" test (see similar GET and POST tests)
   1. add a "removes the note from notes" test
1. Add the code to the `remove()` function to satisfy these requirements

## Create the Editor Component

Now we are getting into newer territory. Namely creating a form component that will be used inside of an `IonModal`. As such, more details are provided here.

Let's create a composite component that we can use to create new tasting notes or update existing notes. Create a file called `src/components/AppTastingNoteEditor.vue` with the following contents:

```html
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Tasting Notes Editor</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <p>Hello!!</p>
  </ion-content>
</template>

<script setup lang="ts">
  import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue';
</script>

<style scoped></style>
```

Also create a `tests/unit/components/AppTastingNoteEditor.spec.ts` file with the following contents:

```TypeScript
import { mount, VueWrapper } from '@vue/test-utils';
import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(AppTastingNoteEditor);
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
```

### Hookup the Modal

The first thing we need to do is get a modal overlay hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it. This will also get the infrastructure for the rest of our modifications in place. We will launch the modal for the "add a new note" scenario from a <a href="https://ionicframework.com/docs/api/fab" target="_blank">floating action button</a> on the `TastingNotesPage`.

First we need to set up the test for the `TastingNotesPage` view (`tests/unit/views/TastingNotesPage.spec.ts`).

```typescript
describe('adding a new note', () => {
  let modal: { present: () => Promise<void> };
  beforeEach(() => {
    modal = {
      present: jest.fn().mockResolvedValue(undefined),
    };
    modalController.create = jest.fn().mockResolvedValue(modal);
  });

  it('displays the modal', async () => {
    const wrapper = await mountView();
    const button = wrapper.find('[data-testid="add-note-button"]');
    await button.trigger('click');
    expect(modal.present).toHaveBeenCalledTimes(1);
  });
});
```

The `modalController` needs to be imported from `@ionic/vue`.

From here, the code and the markup in `src/views/TastingNotesPage.vue` are pretty easy:

```html
<template>
  ...
  <ion-content>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="presentNoteEditor" data-testid="add-note-button">
        <ion-icon :icon="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
  import {
    ...
    IonFab,
    IonFabButton,
    ...
    IonIcon,
    ...
    modalController,
  } from '@ionic/vue';
  import { add } from 'ionicons/icons';
  import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';

  const presentNoteEditor = async () => {
    const modal = await modalController.create({
      component: AppTastingNoteEditor,
    });
    modal.present();
  };
</script>
```

### Basic Layout

Now that we can click on the FAB button and see the modal, let's return our attention to the `src/components/AppTastingNoteEditor.vue` file and start laying out the basics of our form. We already have title and a content section. We know we will need a button in the header that will allow the dialog to be cancelled. We will also need a button on the bottom that will be used for saving and dismissing.

- Add the `ion-buttons` section within the `ion-header>ion-toolbar`.
- Add the `ion-footer` section under the `ion-contents`.
- Import the `close` icon from `ionicons/icons`.
- Update the component imports.
- Define a stub function called `cancel`.
- Define a stub function called `submit`.

**Note:** I generally just "console.log" from the stub functions to avoid linting errors and to prove my bindings are working.

Here is the `ion-buttons` markup for within the `ion-header>ion-toolbar`:

```html
<ion-buttons slot="primary">
  <ion-button id="cancel-button" data-testid="cancel-button" @click="cancel">
    <ion-icon slot="icon-only" :icon="close"></ion-icon>
  </ion-button>
</ion-buttons>
```

Here is the markup for the footer:

```html
<ion-footer>
  <ion-toolbar>
    <ion-button expand="full" data-testid="submit-button" @click="submit">Add</ion-button>
  </ion-toolbar>
</ion-footer>
```

The contents of the `script` section is left up to you. You should have several code samples to use at this point to determine how to update the imports and create the stubs.

Let's start filling out the form. We already have one simple form, the `LoginPage`. On that page we used a list of inputs. We will need something like that within this editor, so let's use that as a model for the first couple of input fields. All of the following items will go inside the `ion-content` element. Be sure to update the components list as usual. Now is a good time to start filling out the validations as well.

```html
<template>
  ...
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-label position="floating">Brand</ion-label>
        <ion-input name="brand" v-model="brand" data-testid="brand-input"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Name</ion-label>
        <ion-input name="name" v-model="name" data-testid="name-input"></ion-input>
      </ion-item>
    </ion-list>

    <div class="error-message ion-padding" data-testid="message-area">
      <div v-for="(error, idx) of errors" :key="idx">{{ error }}</div>
    </div>
  </ion-content>
  ...
</template>

<script setup lang="ts">
  import {
    // TODO: there are now component imports missing, add them
  } from '@ionic/vue';
  ...
  import { computed } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { object as yupObject, string as yupString } from 'yup';

  const validationSchema = yupObject({
    brand: yupString().required().label('Brand'),
    name: yupString().required().label('Name'),
  });

  const { errors, meta } = useForm({ validationSchema });
  const { value: brand } = useField('brand');
  const { value: name } = useField('name');

  const formIsValid = computed(() => meta.value.valid);

  ... // Other functions and stubs have already been defined here.
</script>
```

We need a way to select the type of tea that we have. Add a select for this. In addition to the usual updating of the component references (not shown), you will also need to map the teas from the state so we can use them to populate the select.

First we should create a test to make sure we do the binding correctly. Update `tests/unit/components/AppTastingNoteEditor.spec.ts`

```TypeScript
...
import { useTea } from '@/composables/tea';

jest.mock('@/composables/tea');

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    const { teas } = useTea();
    teas.value = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 3,
      },
      {
        id: 2,
        name: 'Black',
        image: 'assets/img/black.jpg',
        description: 'Black tea description.',
        rating: 0,
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'assets/img/herbal.jpg',
        description: 'Herbal Infusion description.',
        rating: 0,
      },
    ];
    ...
  });
  ...
  it('binds the teas in the select', () => {
    const select = wrapper.find('[data-testid="tea-type-select"]');
    const opts = select.findAll('ion-select-option');
    expect(opts.length).toBe(3);
    expect(opts[0].text()).toBe('Green');
    expect(opts[1].text()).toBe('Black');
    expect(opts[2].text()).toBe('Herbal');
  });
});
```

Then we can switch back to `src/components/AppTastingNoteEditor.vue` and add the select data with the mapped state.

```html
<template>
  ...
  <ion-item>
    <ion-label>Type</ion-label>
    <ion-select name="teaCategoryId" data-testid="tea-type-select" v-model.number="teaCategoryId">
      <ion-select-option v-for="t of teas" :value="t.id" :key="t.id">{{ t.name }}</ion-select-option>
    </ion-select>
  </ion-item>
  ...
</template>

<script setup lang="ts">
  ...
  import {
    object as yupObject,
    string as yupString,
    number as yupNumber,
  } from 'yup';
  import { useTea } from '@/composables/tea';
  ...

  const { teas } = useTea();

  ...
  // NOTE: You are only adding the "teaCategoryId" here...
  const validationSchema = yupObject({
    brand: yupString().required().label('Brand'),
    name: yupString().required().label('Name'),
    teaCategoryId: yupNumber().required().label('Type of Tea'),
  });
  ...
  // NOTE: you are adding this to the same general area where other useField calls exist
  const { value: teaCategoryId } = useField('teaCategoryId');
  ...
</script>
```

**Note:** if you reload the app from the Tasting Notes tab and don't go to the Teas tab before opening the modal you won't see any teas. This isn't really an issue for "normal" operation of the app on a device, but it _is_ an issue. Let's add an `initialize()` function and call it within our `script` section. Performing the tests for this is an "extra credit" assignment left to the user.

The code looks something like this:

```typescript
const { refresh, teas } = useTea();
...
const initialize = () => {
  if (teas.value.length === 0) {
    refresh();
  }
}
...
initialize();
```

Add a rating:

```html
<template>
  ...
  <ion-item>
    <ion-label>Rating</ion-label>
    <app-rating name="rating" v-model.number="rating" data-testid="rating-input"></app-rating>
  </ion-item>
  ...
</template>

<script setup lang="ts">
  ...
  // TODO: import the AppRating component
  ...
  // TODO: Add the rating in a similar manner to how you defined teaCategoryId
</script>
```

And finally, add a text area for some free-form notes on the tea we just tasted:

```html
<template>
  ...
  <ion-item>
    <ion-label position="floating">Notes</ion-label>
    <ion-textarea name="notes" data-testid="notes-textbox" v-model="notes" rows="4"></ion-textarea>
  </ion-item>
  ...
</template>

<script setup lang="ts">
  ...
  TODO: do the usual component additions
  ...
  TODO: add a notes text validation, it is required just like brand and name
  ...
</script>
```

That looks pretty good so far.

### Validation Tests

We have built up the validations as we went. Let's just add a simple test to verify some of the messages:

```TypeScript
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import waitForExpect from 'wait-for-expect';
  ...
  it('displays messages as the user enters invalid data', async () => {
    const brand = wrapper.findComponent('[data-testid="brand-input"]');
    const name = wrapper.findComponent('[data-testid="name-input"]');
    const notes = wrapper.findComponent('[data-testid="notes-textbox"]');
    const msg = wrapper.find('[data-testid="message-area"]');

    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Brand is a required field'));

    await brand.setValue('Lipton');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Name is a required field'));

    await name.setValue('Yellow Label');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Notes is a required field'));

    await notes.setValue('Not very good');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));
  });
```

That should all pass if we have coded everything correctly.

### Disable / Enable Button

The submit button at the bottom of the modal should be disabled until valid data is entered.

Test:

```TypeScript
  describe('submit button', () => {
    it('is disabled until valid data is entered', async () => {
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const teaType = wrapper.findComponent('[data-testid="tea-type-select"]');
      const rating = wrapper.findComponent('[data-testid="rating-input"]');
      const notes = wrapper.findComponent('[data-testid="notes-textbox"]');

      const button = wrapper.find('[data-testid="submit-button"]');

      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await brand.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await name.setValue('mytea');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await teaType.setValue(3);
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await rating.setValue(2);
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

      await notes.setValue('Meh. It is ok.');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });
  });
```

The markup to enable this is super simple. We had already snuck in the `formIsValid` computed value earlier, so it is just a matter of binding the `formIsValid` to the submit button's `disabled` property, just like we did in the Login view before.

```HTML
:disabled="!formIsValid"
```

### Save and Close

There two buttons on the modal. One is the `submit-button` which is labeled "Add", and is not _really_ a submit button in that it does not submit the form, but we have given it that ID as it best describes the role the button will functionally fill. The other button is the `cancel-button`.

The `submit-button` needs to merge the tasting note. Both buttons need to close the dialog.

#### Modifications to the Test

Add the following to the top of the `tests/unit/components/AppTastingNoteEditor.spec.ts` file:

```typescript
import { useTastingNotes } from '@/composables/tasting-notes';
import { modalController } from '@ionic/vue';

jest.mock('@/composables/tasting-notes');
```

Within the "submit button" describe block we will add another group of test for when the button click is triggered:

```TypeScript
    describe('on click', () => {
      beforeEach(async () => {
        const brand = wrapper.findComponent('[data-testid="brand-input"]');
        const name = wrapper.findComponent('[data-testid="name-input"]');
        const teaType = wrapper.findComponent('[data-testid="tea-type-select"]');
        const rating = wrapper.findComponent('[data-testid="rating-input"]');
        const notes = wrapper.findComponent('[data-testid="notes-textbox"]');

        await brand.setValue('foobar');
        await name.setValue('mytea');
        await teaType.setValue(3);
        await rating.setValue(2);
        await notes.setValue('Meh. It is ok.');

        modalController.dismiss = jest.fn();
      });

      it('merges the tasting note', async () => {
        const { merge } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await button.trigger('click');

        expect(merge).toHaveBeenCalledTimes(1);
        expect(merge).toHaveBeenCalledWith({
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('closes the modal', async () => {
        const button = wrapper.find('[data-testid="submit-button"]');

        expect(modalController.dismiss).not.toHaveBeenCalled();
        await button.trigger('click');
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
```

The cancel button tests will be similar, but with no data setup. We also will expect that the merge does not take place.

```TypeScript
  describe('cancel button', () => {
    beforeEach(() => {
      modalController.dismiss = jest.fn();
    });

    it('does not merge', async () => {
      const { merge } = useTastingNotes();
      const button = wrapper.find('[data-testid="cancel-button"]');
      await button.trigger('click');
      expect(merge).not.toHaveBeenCalled();
    });

    it('closes the modal', async () => {
      const button = wrapper.find('[data-testid="cancel-button"]');

      expect(modalController.dismiss).not.toHaveBeenCalled();
      await button.trigger('click');
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
```

#### Modifications to the Code

The `script` section already contains stubs for the `submit()` and `cancel()` functions. Here is a bit of the `submit()`. Filling out the rest is left as an exercise for you:

```TypeScript
    const submit = async () => {
      const { merge } = useTastingNotes();
      await merge({
        brand: brand.value,
        // TODO: fill in the rest
      });
      await modalController.dismiss();
    };
```

## Listing the Tasting Notes

We can now theoretically add tasting notes, but we don't really know since we cannot see them. So now would be a good time to update the TastingNotes page view to display the notes that we have in the store.

First, let update the test (`tests/unit/views/TastingNotesPage.spec.ts`) to include some notes. There is a lot going on here, so let's take it a bit at a time.

First, define some tasting notes data:

```TypeScript
...
import { useTastingNotes } from '@/composables/tasting-notes';

jest.mock('@/composables/tasting-notes');
...
describe('TastingNotesPage.vue', () => {
  ...
  beforeEach(() => {
    const { notes } = useTastingNotes();
    notes.value = [
      {
        id: 42,
        brand: 'Lipton',
        name: 'Green Tea',
        teaCategoryId: 3,
        rating: 3,
        notes: 'A basic green tea, very passable but nothing special',
      },
      {
        id: 314159,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 2,
        rating: 1,
        notes:
          'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
      },
      {
        id: 73,
        brand: 'Rishi',
        name: 'Puer Cake',
        teaCategoryId: 6,
        rating: 5,
        notes: 'Smooth and peaty, the king of puer teas',
      },
    ];
    jest.clearAllMocks();
  });
...
```

We will need to load that data upon entering the page. That means that the page will need to call the `refresh()` from `useTastingNotes()`. Let's create a test for that:

```TypeScript
  it('refreshes the tasting notes data', async () => {
    const { refresh } = useTastingNotes();
    await mountView();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
```

Add the code to the view component in order to accomplish this. See the `TeaListPage.vue` file if you need a model.

Our requirements are that if a note exists for this user, we display it in the list, and that we display the `name` and the `brand` fields in the list. Let's test that now.

```TypeScript
  it('displays the notes', async () => {
    const wrapper = await mountView();
    const list = wrapper.find('[data-testid="notes-list"]');
    const items = list.findAll('ion-item');
    expect(items.length).toBe(3);
    expect(items[0].text()).toContain('Lipton');
    expect(items[0].text()).toContain('Green Tea');
    expect(items[1].text()).toContain('Lipton');
    expect(items[1].text()).toContain('Yellow Label');
    expect(items[2].text()).toContain('Rishi');
    expect(items[2].text()).toContain('Puer Cake');
  });
```

The key parts for all of this to work together is the following markup:

```HTML
      <ion-list data-testid="notes-list">
        <ion-item v-for="note of notes" :key="note.id">
          <ion-label>
            <div>{{ note.brand }}</div>
            <div>{{ note.name }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
```

At this point, all we should have to do to our `script` section is to add `notes` to the destructuring of our `useTastingNotes()` return value:

```typescript
const { notes, refresh } = useTastingNotes();
```

As you can see, the heavy lifting is all being done by our composition API function. Try adding a note, and you will see that the list is automatically updated. This is also due to the composition function doing all of the heavy lifting in managing the data. The view is just reacting to the changes.

## Update Notes

We can add notes, but it would also be good if we could update them.

### Modify the Editor

The editor component currently only handles creating new tasting note. We will also need to handle the case where we need to edit a tasting note. We could handle this by passing the whole tasting note, but let's just pass the note's ID. Since `id` is not a great name for a prop, let's use `noteId`. Add the following prop to the `script` section of our `AppTastingNoteEditor`:

```TypeScript
const props = defineProps({
  noteId: Number,
});
```

With that in place we can now start building out the changes to the editor and we can visually see the results as we go. Let's get started.

#### The Title

First, we should modify the title based on whether we are doing an add or an update.

```TypeScript
  it('displays an appropriate title', async () => {
    const title = wrapper.find('ion-title');
    expect(title.text()).toBe('Add New Tasting Note');
    await wrapper.setProps({ noteId: 42 });
    expect(title.text()).toBe('Tasting Note');
  });
```

So the add case has "Add New Tasting Note" where the update case just says "Tasting Note". Let's implement that in the code.

```html
<template>
  ...
  <ion-title>{{ title }}</ion-title>
  ...
</template>

<script setup lang="ts">
  ...
  const title = computed(
    () => `${props.noteId ? '' : 'Add New '}Tasting Note`,
  );
  ...
</script>
```

#### The Button Label

**Challenge:** write a very similar test and computed property for the `submit-button`. It should have a label of "Add" when we are adding a new note and a label of "Update" when we are updating an existing note.

#### Load the Note

If we have an ID when the editor is created we need to find the note. At that point, we can add a test. We will need to mount the component within our test so we can pass the property:

```TypeScript
  it('populates the data when editing a note', async () => {
    const { find } = useTastingNotes();
    (find as jest.Mock).mockResolvedValue({
      id: 73,
      brand: 'Rishi',
      name: 'Puer Cake',
      teaCategoryId: 6,
      rating: 5,
      notes: 'Smooth and peaty, the king of puer teas',
    });
    const modal = mount(AppTastingNoteEditor, {
      props: {
        noteId: 73,
      },
    });
    await flushPromises();
    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith(73);
    const brand = modal.findComponent('[data-testid="brand-input"]');
    const name = modal.findComponent('[data-testid="name-input"]');
    const rating = modal.findComponent('[data-testid="rating-input"]');
    const notes = modal.findComponent('[data-testid="notes-textbox"]');
    const teaCategory = modal.findComponent('[data-testid="tea-type-select"]');
    expect((brand.element as HTMLInputElement).value).toEqual('Rishi');
    expect((name.element as HTMLInputElement).value).toEqual('Puer Cake');
    expect((teaCategory.element as HTMLSelectElement).value).toEqual(6);
    expect((notes.element as HTMLInputElement).value).toEqual('Smooth and peaty, the king of puer teas');
    expect((rating as VueWrapper).props().modelValue).toEqual(5);
  });
```

We can then add code to the `initialize()` within our `script` section:

```TypeScript
...
const initialize = async () => {
  if (props.noteId) {
   const { find } = useTastingNotes();
   const note = await find(props.noteId);
   if (note) {
     brand.value = note.brand;
     name.value = note.name;
     notes.value = note.notes;
     teaCategoryId.value = note.teaCategoryId;
     rating.value = note.rating;
   }
 }

 if (teas.value.length === 0) {
   refresh();
 }
};
...
initialize();
```

#### Save the Note

When saving the note, the value passed to the `merge()` should include the ID. Here is the test. Place this right after the existing "merges the tasting note" test.

```TypeScript
      it('includes the ID if it set', async () => {
        const { merge } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await wrapper.setProps({noteId: 4273});
        await button.trigger('click');

        expect(merge).toHaveBeenCalledWith({
          id: 4273,
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });
```

**Challenge:** Update the submit method so this test passes.

### Hookup the Editor

We can then modify the `TastingNotesPage` to pass along the `noteId` when a user clicks on the note in the list:

```html
<ion-item button @click="presentNoteEditor($event, note.id)" ...></ion-item>
```

This involves a minor change to the `presentNoteEditor()` method.

```TypeScript
const presentNoteEditor = async (evt: Event, noteId?: number): Promise<void> => {
  const modal = await modalController.create({
    component: AppTastingNoteEditor,
    componentProps: {
      noteId,
    },
  });
  return modal.present();
},
```

Now go add and edit some tasting notes to make sure everything still works when using the app.

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for a user to delete a note.

For this feature, we need to switch our attention back to the `TastingNotes` page where we are listing the tasting notes. We will use a construct called a <a href="https://ionicframework.com/docs/api/item-sliding" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

Using this results in a little bit of rework in how the item is rendered and bound on the `TastingNotes` page:

```HTML
        <ion-item-sliding v-for="note of notes" :key="note.id">
          <ion-item button @click="presentNoteEditor($event, note.id)">
            <ion-label>
              <div>{{ note.brand }}</div>
              <div>{{ note.name }}</div>
            </ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option color="danger" @click="remove(note)">
              Delete
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
```

**Note:** Remember to update the component imports and references for the newly added elements.

For now, all you need to do in the code is grab the `remove` from `useTastingNotes()`:

```typescript
const { notes, refresh, remove } = useTastingNotes();
```

Play around with this in the browser and make sure everything is working.

## Final Cleanup

Let's put the browser in iPhone emulation mode and reload the app to make sure we are getting the iOS styling. Notice on the Teas page we have what is called a <a href="https://ionicframework.com/docs/api/title#collapsible-large-titles">Collapsible Large Title</a>. On the Tasting Notes page, we do not have this, but we probably should because we essentially have a scrollable list. So let's add that.

First we will update the "displays the title" test in `tests/unit/views/TastingNotes.spec.ts`. This isn't a huge change, but it is enough to ensure both titles are set correctly. Here is a diff of the test changes:

```diff
   it('displays the title', () => {
     const titles = wrapper.findAll('ion-title');
-    expect(titles).toHaveLength(1);
+    expect(titles).toHaveLength(2);
     expect(titles[0].text()).toBe('Tasting Notes');
+    expect(titles[1].text()).toBe('Tasting Notes');
   });
```

We then need to update the `template` in `src/views/TastingNotesPage.vue`. Here is a synopsis of the changes:

- Add `:translucent="true"` to the `ion-header`.
- Add `:fullscreen="true"` to the `ion-content`.
- Add an `ion-header` at the top of the `ion-content`. Its contents will be similar to the existing `ion-header` with the following differences:
  - Instead of `:translucent="true"`, set `collapse="condense"`.
  - On the `ion-title`, set `size="large"`.
  - If you had anything else in the toolbar other than the title (which we do not in this case), remove it.

Have a look at `src/views/TeaListPage.vue` if you need a model for your changes.

The last thing we should do is add a couple of options to the modal dialog to prevent the user from accidentally dismissing it by touching the background, and to allow swiping the dialog to close on iOS.

```diff
     async presentNoteEditor(evt: Event, noteId?: number): Promise<void> {
       const modal = await modalController.create({
         component: AppTastingNoteEditor,
+        backdropDismiss: false,
+        canDismiss: true,
         componentProps: {
           noteId,
         },
       });
       return modal.present();
     },
```

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app.

Here are some hints for the code you had to write on your own:

### Code Challenges

If you had trouble with any of the code challenges, you can see possible solutions here. Try to use these as a guide rather than just copy-pasting what is here. The following examples are for the functions exported `useTastingNotes()` composition function.

#### `merge`

```typescript
describe('an existing note', () => {
  let note: TastingNote = {
    id: 1,
    brand: 'Lipton',
    name: 'Green Tea',
    notes: 'Kinda like Lite beer. Dull, but well executed.',
    rating: 3,
    teaCategoryId: 1,
  };

  beforeEach(() => {
    (client.post as jest.Mock).mockResolvedValue({ data: note });
  });

  it('posts the existing note', async () => {
    await merge(note);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/1', note);
  });

  it('resolves the saved note', async () => {
    expect(await merge(note)).toEqual(note);
  });

  it('updates the note in the notes list', async () => {
    await merge(note);
    expect(notes.value.length).toEqual(3);
    expect(notes.value[0]).toEqual(note);
  });
});
```

```typescript
const add = async (note: TastingNote): Promise<TastingNote> => {
  const { data } = await client.post('/user-tasting-notes', note);
  notes.value.push(data);
  return data;
};

const update = async (note: TastingNote): Promise<TastingNote> => {
  const { data } = await client.post(`/user-tasting-notes/${note.id}`, note);
  const idx = notes.value.findIndex((x) => x.id === data.id);
  if (idx > -1) {
    notes.value[idx] = data;
  }
  return data;
};

const merge = (note: TastingNote): Promise<TastingNote> => {
  return note.id ? update(note) : add(note);
};
```

#### `remove`

```typescript
describe('remove', () => {
  const { notes, remove, refresh } = useTastingNotes();
  beforeEach(async () => await refresh());

  it('deletes the existing note', async () => {
    await remove(tastingNotes[1]);
    expect(client.delete).toHaveBeenCalledTimes(1);
    expect(client.delete).toHaveBeenCalledWith('/user-tasting-notes/3');
  });

  it('removes the note from the notes', async () => {
    await remove(tastingNotes[1]);
    expect(notes.value.length).toEqual(2);
    expect(notes.value[0].id).toEqual(1);
    expect(notes.value[1].id).toEqual(42);
  });
});
```

```typescript
const remove = async (note: TastingNote): Promise<void> => {
  await client.delete(`/user-tasting-notes/${note.id}`);
  notes.value = notes.value.filter((x) => x.id !== note.id);
};
```
