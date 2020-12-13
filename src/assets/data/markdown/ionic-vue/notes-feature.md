# Lab: Add the Notes Feature

In this lab, we will take what we have learned so far and add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, services, components, and pages, we will also use some Framework components we have not seen yet. These will include:

- The modal overlay
- Various form elements
- The sliding Ion Item

## Preliminary Items

There are a couple of preliminary items that we need to get out of the way first.

- Create a data model
- Create a data service that performs HTTP requests

These are a couple of things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items, though, please review the code that is provided here.

### The `TastingNotes` Model

Add the following model in `src/models/tasting-note.ts` and make sure to update the `src/models/index.ts` accordingly:

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

### The `TastingNotes` Service

#### Test

`tests/unit/services/TastingNotesService.spec.ts`

```typescript
import { client } from '@/services/api';
import TastingNoteseaService from '@/services/TastingNotesService';

describe('TastingNotesService', () => {
  beforeEach(() => {
    client.get = jest.fn().mockResolvedValue({});
    client.delete = jest.fn().mockResolvedValue({});
    client.post = jest.fn().mockResolvedValue({});
  });
  describe('getAll', () => {
    it('gets the user tasting notes', async () => {
      await TastingNoteseaService.getAll();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/user-tasting-notes');
    });
  });

  describe('get', () => {
    it('gets a user tasting note', async () => {
      await TastingNoteseaService.get(4);
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/user-tasting-notes/4');
    });
  });

  describe('delete', () => {
    it('removes the specified note', async () => {
      await TastingNoteseaService.delete({
        id: 4,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      });
      expect(client.delete).toHaveBeenCalledTimes(1);
      expect(client.delete).toHaveBeenCalledWith('/user-tasting-notes/4');
    });
  });

  describe('save', () => {
    it('saves a new note', async () => {
      await TastingNoteseaService.save({
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      });
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      });
    });

    it('saves an existing note', async () => {
      await TastingNoteseaService.save({
        id: 7,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      });
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/user-tasting-notes/7', {
        id: 7,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      });
    });
  });
});
```

#### Code

`src/services/TastingNotesService.ts`

```typescript
import { client } from './api';
import { TastingNote } from '@/models';

const endpoint = '/user-tasting-notes';

export default {
  async getAll(): Promise<Array<TastingNote>> {
    const res = await client.get(endpoint);
    return (res && res.data) || [];
  },

  async get(id: number): Promise<TastingNote> {
    const res = await client.get(`${endpoint}/${id}`);
    return res.data;
  },

  async delete(tastingNote: TastingNote): Promise<void> {
    await client.delete(`${endpoint}/${tastingNote.id}`);
  },

  async save(tastingNote: TastingNote): Promise<TastingNote> {
    const url = endpoint + (tastingNote.id ? `/${tastingNote.id}` : '');
    const res = await client.post(url, tastingNote);
    return res.data;
  },
};
```

## Create the Store Module

The `tastingNotes` store module is going to be very similar to the `teas` module with some important differences:

- The list of actions will be more complete:
  - load
  - clear
  - save
  - delete
- There is no stand-alone `rate` action (or mutation)
- All of the actions other than `clear` will be namespaced
- The list of mutations is more complete to go along with the actions:
  - SET
  - CLEAR
  - MERGE
  - DELETE

### State

Copy `src/store/teas/state.ts` to `src/store/tasting-notes/state.ts` and change the type used for the `items` collection from `Array<Tea>` to `Array<TastingNote>`.

### Mutations

The start of the `tests/unit/store/tasting-notes/mutations.spec.ts` test will look a lot like its `teas` counterpart but with different data and without the `SET_RATING` mutaion, enough so that we can start by copying the test and code files over from one module to the other and changing things up a bit from there.

Here is the test:

```TypeScript
import { mutations } from '@/store/tasting-notes/mutations';
import { TastingNote } from '@/models';

const tastingNotes: Array<TastingNote> = [
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
  {
    id: 81,
    brand: 'Rishi',
    name: 'Sencha',
    teaCategoryId: 3,
    rating: 4,
    notes: 'A basic green sencha with a grassy flavor. Very nice, but nothing special',
  },
];

describe('tea mutations', () => {
  describe('CLEAR_SESSION', () => {
    it('set the notes to an empty array', () => {
      const state = { list: tastingNotes };
      mutations.CLEAR(state);
      expect(state).toEqual({ list: [] });
    });
  });

  describe('SET', () => {
    it('sets the notes', () => {
      const state = { list: [] };
      mutations.SET(state, tastingNotes);
      expect(state).toEqual({ list: tastingNotes });
    });
  });
});
```

We can then get the code in place to satisfy those tests (`src/store/tasting-notes/mutations.ts`):

```TypeScript
import { State } from './state';
import { TastingNote } from '@/models';

export const mutations = {
  CLEAR: (state: State) => (state.list = []),
  SET: (state: State, tastingNotes: Array<TastingNote>) =>
    (state.list = tastingNotes),
};
```

At this point we can look at what we will need for the MERGE and DELETE mutations.

#### DELETE

Test:

```TypeScript
  describe('DELETE', () => {
    it('does fail if the node does not exist', () => {
      const state = { list: tastingNotes };
      const note = { ...tastingNotes[2] };
      note.id = 4273;
      mutations.DELETE(state, note);
      expect(state).toEqual({ list: tastingNotes });
    });

    it('removes the specified note', () => {
      const state = { list: [...tastingNotes] };
      const expectedState = { list: [...tastingNotes] };
      expectedState.list.splice(2, 1);
      const note = { ...tastingNotes[2] };
      mutations.DELETE(state, note);
      expect(state).toEqual(expectedState);
    });
  });
```

Code:

```TypeScript
  DELETE: (state: State, tastingNote: TastingNote) => {
    const idx = state.list.findIndex(x => x.id === tastingNote.id);
    if (idx > -1) {
      state.list.splice(idx, 1);
    }
  },
```

#### MERGE

Test:

```TypeScript
  describe('MERGE', () => {
    it('updates an existing note', () => {
      const state = { list: [...tastingNotes] };
      const note: TastingNote = {
        id: 314159,
        brand: 'Lipton',
        name: 'Yellow Label Orange Pekoe',
        teaCategoryId: 2,
        rating: 1,
        notes: 'Horrible for any application',
      };
      mutations.MERGE(state, note);
      expect(state.list.length).toBe(4);
      expect(state.list[1]).toEqual(note);
    });

    it('adds a new note to the end', () => {
      const state = { list: [...tastingNotes] };
      const note: TastingNote = {
        id: 4242,
        brand: 'Brewbie',
        name: 'Whispering Pine',
        teaCategoryId: 3,
        rating: 3,
        notes: 'Pretty good tea for having such a bad name',
      };
      mutations.MERGE(state, note);
      expect(state.list.length).toBe(5);
      expect(state.list[4]).toEqual(note);
    });
  });
```

Code:

```TypeScript
  MERGE: (state: State, tastingNote: TastingNote) => {
    const idx = state.list.findIndex(x => x.id === tastingNote.id);
    if (idx > -1) {
      state.list.splice(idx, 1, tastingNote);
    } else {
      state.list.push(tastingNote);
    }
  },
```

### Actions

Similar to how we copied the mutations files from the "tea" module in order to get started, we can also copy the actions over from the "teas" module and then tweak them for the tasting notes module.

Here is the starting point then for the test:

```TypeScript
import { ActionContext } from 'vuex';
import { actions } from '@/store/tasting-notes/actions';
import TastingNotesService from '@/services/TastingNotesService';
import { TastingNote } from '@/models';

jest.mock('@/services/TastingNotesService');

const context: ActionContext<any, any> = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  state: {},
  rootGetters: {},
  rootState: {},
};

const tastingNotes: Array<TastingNote> = [
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
  {
    id: 81,
    brand: 'Rishi',
    name: 'Sencha',
    teaCategoryId: 3,
    rating: 4,
    notes:
      'A basic green sencha with a grassy flavor. Very nice, but nothing special',
  },
];

describe('tasting notes actions', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('clear', () => {
    it('commits CLEAR', () => {
      actions.clear.handler(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('CLEAR');
    });
  });

  describe('load', () => {
    beforeEach(() => {
      (TastingNotesService.getAll as any).mockResolvedValue(tastingNotes);
    });

    it('gets the tasting notes', async () => {
      await actions.load(context);
      expect(TastingNotesService.getAll).toHaveBeenCalledTimes(1);
    });

    it('commits the tasting notes', async () => {
      await actions.load(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('SET', tastingNotes);
    });
  });
});
```

And the starting code:

```TypeScript
import { ActionContext } from 'vuex';

import TastingNotesService from '@/services/TastingNotesService';
import { TastingNote} from '@/models';

import { State } from './state';
import { State as RootState } from '../state';

export const actions = {
  clear: {
    root: true,
    handler({ commit }: ActionContext<State, RootState>) {
      commit('CLEAR');
    },
  },

  async load({ commit }: ActionContext<State, RootState>): Promise<void> {
    const tastingNotes = await TastingNotesService.getAll();
    commit('SET', tastingNotes);
  },
};
```

Notice that the load action in this module is not `root: true`. This is because we do not want to do the load as a root action but want to be more targetted with when that occurs. Now we are ready to start working on the `save` and `delete` actions.

#### Save

Test:

```TypeScript
  describe('save', () => {
    let note: TastingNote;
    beforeEach(() => {
      note = {
        brand: 'Rishi',
        name: 'Matcha',
        teaCategoryId: 3,
        rating: 5,
        notes: 'Very rich with lots of fresh flavor',
      };
      (TastingNotesService.save as any).mockResolvedValue({
        id: 4242,
        ...note,
      });
    });

    it('saves the tasting note', async () => {
      await actions.save(context, note);
      expect(TastingNotesService.save).toHaveBeenCalledTimes(1);
      expect(TastingNotesService.save).toHaveBeenCalledWith(note);
    });

    it('performs a MERGE commit with the saved note', async () => {
      await actions.save(context, note);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('MERGE', {
        id: 4242,
        ...note,
      });
    });
  });
```

Code:

```TypeScript
  async save(
    { commit }: ActionContext<State, RootState>,
    tastingNote: TastingNote,
  ): Promise<void> {
    const res = await TastingNotesService.save(tastingNote);
    if (res) {
      commit('MERGE', res);
    }
  },
```

#### Delete

Test:

```TypeScript
  describe('delete', () => {
    let note: TastingNote;
    beforeEach(() => {
      note = {...tastingNotes[1]};
    });

    it('deletes the tasting note', async () => {
      await actions.delete(context, note);
      expect(TastingNotesService.delete).toHaveBeenCalledTimes(1);
      expect(TastingNotesService.delete).toHaveBeenCalledWith(note);
    });

    it('performs a DELETE commit on the deleted note', async () => {
      await actions.delete(context, note);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('DELETE', note);
    });
  });
```

Code:

```TypeScript
  async delete(
    { commit }: ActionContext<State, RootState>,
    tastingNote: TastingNote,
  ): Promise<void> {
    if (tastingNote.id) {
      await TastingNotesService.delete(tastingNote);
      commit('DELETE', tastingNote);
    }
  },
```

### Configuration

Now that the store module's state, mutations, and actions are all in place, we are ready to add it to our store. First, copy the `index.ts` file from `scr/store/teas` to `src/store/tasting-notes`. If you have a look at that file you will see that it is very generic. There is nothing here that needs to change.

Next add the module in the `src/store/index.ts` file using the teas module as a guide.

## Create the Editor Component

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

<script lang="ts">
  import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
  } from '@ionic/vue';
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'AppTastingNoteEditor',
    components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar },
  });
</script>

<style scoped></style>
```

We also create a `tests/unit/components/AppTastingNoteEditor.spec.ts` file with the following contents:

```TypeScript
import { mount, VueWrapper } from '@vue/test-utils';
import { VuelidatePlugin } from '@vuelidate/core';
import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';
import store from '@/store';

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    wrapper = mount(AppTastingNoteEditor, {
      global: {
        plugins: [store, VuelidatePlugin],
      },
    });
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
```

### Hookup the Modal

The first thing we need to do is get a modal overlay hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it. This will also get the infrastructure for the rest of our modifications in place. We will launch the modal for the "add a new note" scenario from a floating action button on the `TastingNotes` page.

First we need to set up the test for the `TastingNotes` page view (`tests/unit/views/TastingNotes.spec.ts`).

```typescript
// TODO: Fill this bit in after we figure out why the test is not working
```

From here, the code and the markup in `src/views/TastingNotes.vue` are pretty easy:

```html
<template>
  ...
  <ion-content class="ion-padding">
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="presentNoteEditor">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
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
  ...

  import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';

  export default defineComponent({
    ...
    components: {
      ...
      IonFab,
      IonFabButton,
      ...
      IonIcon,
      ...
    },
    methods: {
      async presentNoteEditor() {
        const modal = await modalController.create({
          component: AppTastingNoteEditor,
        });
        modal.present();
      },
    },
    setup() {
      return { add };
    },
  });
</script>
```

### Basic Layout

Now that we can click on the FAB button and see the modal, let's start laying out the basics of our form. We already have title and a content section, but we know we will need a button in the header that will allow the dialog to be cancelled. We will also need a button on the bottom that will be used for saving and dismissing.

- add the `ion-buttons` section within the `ion-header>ion-toolbar`
- add the `ion-footer` section under the `ion-contents`
- be sure to update the component references
- add the `methods` section and `setup()` as shown

```html
<template>
  ...
  <ion-buttons slot="primary">
    <ion-button
      id="cancel-button"
      data-testid="cancel-button"
      @click="cancel()"
    >
      <ion-icon slot="icon-only" name="close"></ion-icon>
    </ion-button>
  </ion-buttons>
  ...
  <ion-footer>
    <ion-toolbar>
      <ion-button expand="full" data-testid="submit-button">Add</ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
  import {
    // TODO: there are now component imports missing, add them
  } from '@ionic/vue';
  import { close } from 'ionicons/icons';
  ...

  export default defineComponent({
    ...
    components: {
      // TODO: there are now component references missing, add them
    },
    methods: {
      cancel() {
        console.log('close clicked');
      },
    },
    setup() {
      return { close };
    },
  });
</script>
```

Let's start filling out the form. We already have one simple form. The `LoginPage`. It looks like over there we used a list of inputs. We will need something like that, so let's use that as a model for the first couple of input fields here. All of the following items will go inside the `ion-content` element. Be sure to update the components as usual, and also to add a `data()` method to the component definition.

```html
<template>
  ...
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-label position="floating">Brand</ion-label>
        <ion-input v-model.trim="brand" data-testid="brand-input"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Name</ion-label>
        <ion-input v-model.trim="name" data-testid="name-input"></ion-input>
      </ion-item>
    </ion-list>
  </ion-content>
  ...
</template>

<script lang="ts">
  import {
    // TODO: there are now component imports missing, add them
  } from '@ionic/vue';
  ...

  export default defineComponent({
    ...
    components: {
      // TODO: there are now component references missing, add them
    },
    data() {
      return {
        name: '',
        brand: '',
      };
    },
    ...
  });
</script>
```

We need a way to select the type of tea that we have. Add a select for this. In addition to the usual upding of the component references (not shown, but be sure to do it, also applies to the other additions we need to make), you will also need to map the teas from the state so we can use them to populate the select.

First we should create a test to make sure we do the binding correctly. Update `tests/unit/components/AppTastingNoteEditor.spec.ts`

```TypeScript
...
import { Tea } from '@/models';

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<any>;
  let teas: Array<Tea>;

  beforeEach(async () => {
    teas = [
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
    store.commit('teas/SET', teas);
    ...
  });
  ...
  it('binds the teas in the select', () => {
    const select = wrapper.findComponent('[data-testid="tea-type-select"]');
    const opts = select.findAllComponents('ion-select-option');
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
    <ion-select data-testid="tea-type-select" v-model.number="teaCategoryId">
      <ion-select-option v-for="t of teas" :value="t.id" :key="t.id"
        >{{ t.name }}</ion-select-option
      >
    </ion-select>
  </ion-item>
  ...
</template>

<script lang="ts">
  ...
  import { mapState } from 'vuex';
  ...
    computed: {
      ...mapState('teas', {
        teas: 'list',
      }),
    },
  ...
</script>
```

Add a rating:

```html
<template>
  ...
  <ion-item>
    <ion-label>Rating</ion-label>
    <app-rating v-model.number="rating" data-testid="rating-input"></app-rating>
  </ion-item>
  ...
</template>

<script lang="ts">
  ...
    data() {
      return {
        ...
        rating: 0,
        ...
      };
    },
  ...
</script>
```

And finally, add a text area for some free-form notes on the tea we just tasted:

```html
<template>
  ...
  <ion-item>
    <ion-label position="floating">Notes</ion-label>
    <ion-textarea
      data-testid="notes-textbox"
      v-model="notes"
      rows="5"
    ></ion-textarea>
  </ion-item>
  ...
</template>

<script lang="ts">
  ...
    data() {
      return {
        ...
        notes: '',
        ...
      };
    },
  ...
</script>
```

That looks pretty good so far.

### Validations

Basically, every field is required. For the text fields we will add a validation so a message is displayed if someone has information entered and then removes it. The button should be disabled any time some information is missing.

First the test for the validation messages:

**Note:** Skip this test for now. There appears to be some bugs with Vuelidate. This will need to be revisted in the future. Were this a production app I may look at other ways of displaying a message.

```TypeScript
  it.skip('displays messages as the user enters invalid data', async () => {
    wrapper.vm.$v.brand.$model = '';
    wrapper.vm.$v.name.$model = '';
    wrapper.vm.$v.notes.$model = '';
    await wrapper.vm.$v.$reset();

    const brand = wrapper.findComponent('[data-testid="brand-input"]');
    const name = wrapper.findComponent('[data-testid="name-input"]');
    const notes = wrapper.findComponent('[data-testid="notes-textbox"]');
    const msg = wrapper.find('[data-testid="message-area"]');

    expect(msg.text()).toBe('');

    await brand.setValue('foobar');
    expect(msg.text()).toBe('');

    await brand.setValue('');
    expect(msg.text()).toBe('brand: Value is required');

    await brand.setValue('Lipton');
    expect(msg.text()).toBe('');

    await name.setValue('foobar');
    expect(msg.text()).toBe('');

    await name.setValue('');
    expect(msg.text()).toBe('name: Value is required');

    await name.setValue('Yellow Label');
    expect(msg.text()).toBe('');

    await notes.setValue('foobar');
    expect(msg.text()).toBe('');

    await notes.setValue('');
    expect(msg.text()).toBe('notes: Value is required');

    await notes.setValue('Not very good');
    expect(msg.text()).toBe('');
  });
```

In the `AppTastingNoteEditor.vue` file, we need to:

- `import { required } from '@vuelidate/validators';`
- add a `validations()` method to the component definition
- add a section to display the error messages

Refer to the `Login.vue` file if you need a sample. I will provide a couple of the items here:

```HTML
    <!--<div class="error-message ion-padding" data-testid="message-area">
      <div v-for="(error, idx) of $v.$errors" :key="idx">
        {{ error.$property }}: {{ error.$message }}
      </div>
    </div>-->
```

**Note:** - the above markup is intentionally commented out for now. We are working through some Vuelidate bugs at the moment and will revisit this at a later date.

```TypeScript
  validations() {
    return {
      brand: { required, $autoDirty: true },
      name: { required, $autoDirty: true },
      notes: { required, $autoDirty: true },
    };
  },
```

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

      const button = wrapper.findComponent('[data-testid="submit-button"]');

      expect(button.attributes().disabled).toBe('true');

      await brand.setValue('foobar');
      expect(button.attributes().disabled).toBe('true');

      await name.setValue('mytea');
      expect(button.attributes().disabled).toBe('true');

      await teaType.setValue(3);
      expect(button.attributes().disabled).toBe('true');

      await rating.setValue(2);
      expect(button.attributes().disabled).toBe('true');

      await notes.setValue('Meh. It is ok.');
      expect(button.attributes().disabled).toBe('false');
    });
  });
```

Code:

```HTML
<template>
  ...
  <ion-footer>
    <ion-toolbar>
      <ion-button
        expand="full"
        data-testid="submit-button"
        :disabled="!allowSubmit"
        >Add</ion-button
      >
    </ion-toolbar>
  </ion-footer>
  ...
</template>
...
<script lang="ts">
...
  computed: {
    ...
    allowSubmit(): boolean {
      return !!(
        this.brand &&
        this.name &&
        this.teaCategoryId &&
        this.rating &&
        this.notes
      );
    },
    ...
</script>
```

### Save and Close

There two buttons on the modal. One is the `submit-button` which is labeled "Add", and is not _really_ a submit button in that it does not submit the form, but we have given it that ID as it best describes the role the button will functionally fill. The other button is the `cancel-button`.

The `submit-button` needs to dispatch a `tastingNotes/save` action to the store. Both buttons need to close the dialog.

#### Modifications to the Test

We will start by modifying the main `beforeEach()` in the test to mock the store's dispatch and the modalController's dismiss.

```TypeScript
import { modalController } from '@ionic/vue';
...
    store.dispatch = jest.fn();
    modalController.dismiss = jest.fn();
```

Within the "submit button" describe block we will add another group of test for when the button click is triggered:

```TypeScript
    describe('on click', () => {
      beforeEach(async () => {
        const brand = wrapper.findComponent('[data-testid="brand-input"]');
        const name = wrapper.findComponent('[data-testid="name-input"]');
        const teaType = wrapper.findComponent(
          '[data-testid="tea-type-select"]',
        );
        const rating = wrapper.findComponent('[data-testid="rating-input"]');
        const notes = wrapper.findComponent('[data-testid="notes-textbox"]');

        await brand.setValue('foobar');
        await name.setValue('mytea');
        await teaType.setValue(3);
        await rating.setValue(2);
        await notes.setValue('Meh. It is ok.');
      });

      it('dispatches the save action', async () => {
        const button = wrapper.findComponent('[data-testid="submit-button"]');
        await button.trigger('click');

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith('tastingNotes/save', {
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('closes the modal', async () => {
        const button = wrapper.findComponent('[data-testid="submit-button"]');

        expect(modalController.dismiss).not.toHaveBeenCalled();
        await button.trigger('click');
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
```

The cancel button tests will be similar, but with no data setup. We also will expect that the dispatch does not take place.

```TypeScript
  describe('cancel button', () => {
    it('does not dispatch', async () => {
      const button = wrapper.findComponent('[data-testid="cancel-button"]');
      await button.trigger('click');
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('closes the modal', async () => {
      const button = wrapper.findComponent('[data-testid="cancel-button"]');

      expect(modalController.dismiss).not.toHaveBeenCalled();
      await button.trigger('click');
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
```

#### Modifications to the Code

You will need to do a little preliminary work:

- add a `@click="submit"` button to the `submit-button` (you can you a different method name if you wish)
- import the `modalController` from `@ionic/vue`
- import the `mapActions` helper from `vuex`

With that in place it is a matter of mapping the `tastingNotes/save` action and writing the methods that are bound to the click events.

```TypeScript
  methods: {
    ...mapActions('tastingNotes', ['save']),
    cancel() {
      modalController.dismiss();
    },
    async submit() {
      await this.save({
        brand: this.brand,
        name: this.name,
        rating: this.rating,
        teaCategoryId: this.teaCategoryId,
        notes: this.notes,
      });
      modalController.dismiss();
    },
  },
```

## Listing the Tasting Notes

We can now theoretically add tasting notes, but we don't really kno since we cannot see them. So now would be a good time to update the TastingNotes page view to display the notes that we have in the store.

First, let update the test (`tests/unit/view/TastingNotes.spec.ts`) to include some notes. There is a lot going on here, so let's take it a bit at a time.

First, define some tasting notes data:

```TypeScript
...
import { TastingNote } from '@/models';
...
describe('TastingNotes.vue', () => {
  ...
  let tastingNotes: Array<TastingNote>;

  beforeEach(async () => {
    tastingNotes = [
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
...
```

We will need to load that data upon entering the page. That means that the page will need to dispatch a `tastingNotes/load` action, so let's modify the `store.dispatch = jest.fn()` line to have a mock implementation as such:

```TypeScript
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'tastingNotes/load') {
        store.commit('tastingNotes/SET', tastingNotes);
      }
    });
```

Due to mounting the `App` component and then navigating to the `TastingNotes` component (see below), we also need to set a session. Otherwise the `App` component will try to navigate to the `Login` page.

```TypeScript
    store.commit('SET_SESSION', {
      token: '1234',
      user: {
        id: 14,
        firstName: 'Tony',
        lastName: 'Test',
        email: 'tony@test.com',
      },
    });
```

This event will be triggered from the `ionViewWillEnter()` lifecycle event. In order to trigger that event we need to navigate to the page but we need to do so within the context of an `ion-router-outlet`, so what we will do is wrap the `App` component, which contains said outlet, and use the router to navigate to our page.

```TypeScript
import { createRouter, createWebHistory } from '@ionic/vue-router';
import App from '@/App.vue';
...
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TastingNotes }],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router, store],
      },
    });
```

Here is what it looks like when it is all put together.

```TypeScript
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import App from '@/App.vue';
import TastingNotes from '@/views/TastingNotes.vue';
import store from '@/store';
import { TastingNote } from '@/models';

describe('TastingNotes.vue', () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  let tastingNotes: Array<TastingNote>;

  beforeEach(async () => {
    tastingNotes = [
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
    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'tastingNotes/load') {
        store.commit('tastingNotes/SET', tastingNotes);
      }
    });
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TastingNotes }],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router, store],
      },
    });
  });
...
```

The result of this is that the store will have tasting notes in it, but only if _something_ in the above workflow dispatches the action that will do the load. That something will be our page view.

Our requirements are that if a note exists in the store, we display it in the list, and that we display the `name` and the `brand` fields in the list. Let's test that now.

```TypeScript
  it('displays the notes', () => {
    const list = wrapper.findComponent('[data-testid="notes-list"]');
    const items = list.findAllComponents('ion-item');
    expect(items.length).toBe(3);
    expect(items[0].text()).toContain('Lipton');
    expect(items[0].text()).toContain('Green Tea');
    expect(items[1].text()).toContain('Lipton');
    expect(items[1].text()).toContain('Yellow Label');
    expect(items[2].text()).toContain('Rishi');
    expect(items[2].text()).toContain('Puer Cake');
  });
```

Putting this all together on the page then, we have:

```HTML
<template>
 ...
      <ion-list data-testid="notes-list">
        <ion-item v-for="note of tastingNotes" :key="note.id">
          <ion-label>
            <div>{{ note.brand }}</div>
            <div>{{ note.name }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
 ...
</template>

<script lang="ts">
import {
  // TODO: add the components that you added above that are not here yet
} from '@ionic/vue';
...
import { mapActions, mapState } from 'vuex';
...
export default defineComponent({
  name: 'TastingNotes',
  components: {
    // TODO: add the components that you added above that are not here yet
  },
  computed: {
    ...mapState('tastingNotes', {
      tastingNotes: 'list',
    }),
  },
  methods: {
    ...mapActions('tastingNotes', ['load']),
    ... // The stuff that is already here, not another spread operator... :)
  },
  ionViewWillEnter() {
    this.load();
  },
  ...
</script>
```

So what's giong on here?

1. this list of tasting notes is mapped to the `tastingNotes` computed property
1. the `tastingNotes/load` action is mapped to the `load()` method
1. the page dispatches `tastingNotes/load` by calling `load()` from the `ionViewWillEnter()` lifecycle event
1. the store load the notes and the view reactively displays them

## Update Notes

We can add notes, but it would also be good if we could update them.

### Hook it Up

### Modify the Editor

The editor component currently only handles creating new tasting note. We will also need to handle the case where we need to edit a tasting note. We could handle this by passing the whole tasting note, but let's just pass the note's ID. Since `id` is not a great name for a prop, let's use `noteId`

```TypeScript
  props: {
    noteId: Number,
  },
```

We can then modify the `TastingNotes` page to pass along the `noteId` when a user clicks on the note in the list. This only involves minor changes to the `presentNoteEditor()` method.

```html
<ion-item @click="presentNoteEditor($event, note.id)"></ion-item>
```

```TypeScript
async presentNoteEditor(evt: Event, noteId?: number): Promise<void> {
  const modal = await modalController.create({
    component: AppTastingNoteEditor,
    componentProps: {
      noteId,
    },
  });
  return modal.present();
},
```

With that hooked up we can now start building out the changes to the editor and we can visually see the results as we go. Let's switch back to the `AppTastingNoteEditor` component and complete the building out of the editor to also allow for editing.

#### The Title

First, we should modify the title based on whether we are doing an add or an update.

```TypeScript
  it('displays an appropriate title', async () => {
    const title = wrapper.findComponent('ion-title');
    expect(title.text()).toBe('Add New Tasting Note');
    await wrapper.setData({ id: 42 });
    expect(title.text()).toBe('Tasting Note');
  });
```

So the add case has "Add New Tasting Note" where the update case just says "Tasting Note". Let's implement that in the code:

```html
<template>
  ...
  <ion-title>{{ title }}</ion-title>
  ...
</template>
...
<script lang="ts">
  ...
    computed: {
      ...
      title(): string {
        return `${this.noteId ? '' : 'Add New '}Tasting Note`;
      },
  ...
</script>
```

#### The Button Label

**Challenge:** write a very similar test and computed property for the `submit-button`. It should have a label of "Add" when we are adding a new note and a label of "Update" when we are updating an existing note.

#### Load the Note

If we have an ID when the editor is created we need to populate the data from the note. To do this we will need to make sure we have notes data in the store. We can do that in the main test setup easily enough just add a `store.commit()` call after the existing one for `teas/SET`:

```TypeScript
    store.commit('tastingNotes/SET', [
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
    ]);
```

At that point, we can add a test. We will need to mount the component within our test so we can pass the property:

```TypeScript
  it('populates the data when editing a note', () => {
    const modal = mount(AppTastingNoteEditor, {
      props: {
        noteId: 73,
      },
      global: {
        plugins: [store, VuelidatePlugin],
      },
    });
    expect(modal.vm.brand).toEqual('Rishi');
    expect(modal.vm.name).toEqual('Puer Cake');
    expect(modal.vm.teaCategoryId).toEqual(6);
    expect(modal.vm.rating).toEqual(5);
    expect(modal.vm.notes).toEqual('Smooth and peaty, the king of puer teas');
  });
```

We can then use the `created` lifecycle event to load the note and set the appropriate data items. This is done within the `script` tag in the `src/components/AppTastingNoteEditor.vue` file.

```TypeScript
...
import { mapActions, mapGetters, mapState } from 'vuex';
...
  computed: {
    ...mapState('teas', {
      teas: 'list',
    }),
    ...mapGetters('tastingNotes', { findNote: 'find' }),
...
  created() {
    if (this.noteId) {
      const note = this.findNote(this.noteId);
      this.brand = note?.brand;
      this.name = note?.name;
      this.teaCategoryId = note?.teaCategoryId;
      this.rating = note?.rating;
      this.notes = note?.notes;
    }
  },
...
```

#### Save the Note

When saving the note, the value should be dispatched with the ID. Here is the test:

```TypeScript
      it('includes the ID if it set', async () => {
        const button = wrapper.findComponent('[data-testid="submit-button"]');
        await wrapper.setProps({noteId: 4273});
        await button.trigger('click');

        expect(store.dispatch).toHaveBeenCalledWith('tastingNotes/save', {
          id: 4273,
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });
```

**Challenge:** Update the submit method so this code passes.

Now go add and edit some tasting notes to make sure everything still passes.

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for a user to delete a note.

We will use a contruct called a <a ref="" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

Using this results in a little be of rework in how the item is rendered and bound on the `TastingNotes` page:

```HTML
        <ion-item-sliding v-for="note of tastingNotes" :key="note.id">
          <ion-item @click="presentNoteEditor($event, note.id)">
            <ion-label>
              <div>{{ note.brand }}</div>
              <div>{{ note.name }}</div>
            </ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option color="danger" @click="deleteNote(note)">
              Delete
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
```

**Note:** Remember to update the component imports and references for the newly added elements.

And the code for the delete is pretty straight forward. Just map the `delete` action to `deleteNote`. Note that we are already maping `load`. This slightly complicates the map as we cannot just map `delete` as "delete" for technical reasons (you will get the following error: `SyntaxError: Delete of an unqualified identifier in strict mode.`).

```typescript
   ...mapActions('tastingNotes', { deleteNote: 'delete', load: 'load' }),
```

**Extra Credit #1:** Normally, we would write the tests first and then the code. Here we did not, but that is because I wanted to give you some practice crafting your own tests.

**Extra Credit #2:** You could also use an alert to ask the user if they _really_ want to delete the note. Extra extra credit if you want to implement that logic.

Play around with this in the browser and make sure everthing is working.

## Final Cleanup

Let's put the browser in iPhone emulation mode and reload the app to make sure we are getting the iOS styling. Notice on the Teas page we have what is called a <a href="https://ionicframework.com/docs/api/title#collapsible-large-titles">Collapsible Large Title</a>. On the Tasting Notes page, we do not have this, but we probably should because we essentially have a scollable list. So let's add that.

First we will update the "displays the title" test in `tests/util/views/TastingNotes.spec.ts`. This isn't a huge change, but it is enough to ensure both titles are set correctly.

```diff
   it('displays the title', () => {
     const titles = wrapper.findAllComponents('ion-title');
-    expect(titles).toHaveLength(1);
+    expect(titles).toHaveLength(2);
     expect(titles[0].text()).toBe('Tasting Notes');
+    expect(titles[1].text()).toBe('Tasting Notes');
   });
```

We can then update the `template` in `src/views/TastingNotes.vue`:

```diff
 <template>
   <ion-page>
-    <ion-header>
+    <ion-header :translucent="true">
       <ion-toolbar>
         <ion-title>Tasting Notes</ion-title>
       </ion-toolbar>
     </ion-header>

-    <ion-content>
+    <ion-content :fullscreen="true">
+      <ion-header collapse="condense">
+        <ion-toolbar>
+          <ion-title size="large">Tasting Notes</ion-title>
+        </ion-toolbar>
+      </ion-header>
```

The last thing we should do is add a couple of options to the modal dialog to prevent the user from accidently dismissing it by touching the background, and to allow swiping the dialog to close on iOS.

```diff
     async presentNoteEditor(evt: Event, noteId?: number): Promise<void> {
       const modal = await modalController.create({
         component: AppTastingNoteEditor,
+        backdropDismiss: false,
+        swipeToClose: true,
         componentProps: {
           noteId,
         },
       });
       return modal.present();
     },
```

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
