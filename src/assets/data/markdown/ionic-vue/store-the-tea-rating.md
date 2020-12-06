# Lab: Store the Tea Rating

In this lab you will further explore our data service and data store in order to implement the saving and retrieval of the user's tea ratings.

## Overall Strategy

Now that we have the rating set up, let's look at doing something with the data.

The first challenge that we have is that our backend API does not have a place to store individual user ratings on a tea. Perhaps it will at some point, but it does not right now. To get around this, we will use Capacitor's Storage plugin to store the data in a local mechanism, either on-device when running in a mobile context or in `localstorage` when running in a web context. This will involve updating the `TeaService` as follows:

- add a `save()` method
- update the `getAll()` to include the rating

Next we will need to look at our store. It will need an action that we can dispatch when a rating is updated. This action will need to save the change via `TeaService.save()` and commit the change to the state to ensure that the state remains consistent.

Finally, we will need to update the `TeaDetails` page to display the correct rating when the page is displayed, and to dispatch any rating changes to our store.

By laying everything out this way, we allow for change in our system without breaking a lot of code. For illustration, let's look at a couple of different scenarios.

**Scenario 1:** We add an endpoint for storing user ratings of teas in the backend API. In this case, the only thing that needs to change is the `TeaService` to change how the `save()` and `getAll()` access the ratings data.

**Scenario 2:** We add an admin area to the app where admin users are allowed to edit the names and descriptions of the teas. In this case we can update `TeaService.save()` to allow for a full save of the tea, and we can add some new actions and mutations to the store, but the existing actions and mutatins that _only_ deal with the tea ratings can stay the same.

In neither of these scenarios did we need to touch any of the components, only the areas of the app that deal with the data.

## `TeaService` Modifications

### Preliminary Changes

Add a `rating` property in `src/models/Tea.ts`

```typescript
rating: number;
```

In the `tests/unit/services/TestService.spec.ts` file, there are a few preliminary items to handle:

- import the `Plugins` object
- mock `@capacitor/core`
- add a rating to each Tea model (use a value of zero for now)
- reset the mocks in the setup
- add a `describe()` block for the saving of the rating

```typescript
import { Plugins } from '@capacitor/core';
...

jest.mock('@capacitor/core');

describe('TeaService', () => {
  let expectedTeas: Array<Tea>;
  let httpResultTeas: Array<{ id: number; name: string; description: string }>;

  function initializeTestData() {
    expectedTeas = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 0
      },
      ... // etc for the rest of the Teas
    ];
    httpResultTeas = expectedTeas.map((t: Tea) => {
      const tea = { ...t };
      delete tea.image;
      delete tea.rating;
      return tea;
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    initializeTestData();
  });

  describe('getAll', () => {
  ...
  });

  describe('save', () => {});
});
```

Finally, in `src/service/TestService.ts`, add the rating setting it to zero in `unpackData()` and create the shell of the `save()` method.

```typescript
import { Plugins } from '@capacitor/core';
...
function unpackData(data: Array<RawData>): Array<Tea> {
  return data.map(t => ({
    ...t,
    rating: 0,
    image: `assets/img/${images[t.id - 1]}.jpg`,
  }));

...

export default {
  ...

  async save(tea: Tea): Promise<void> {
    return undefined;
  },
};
```

At this point we are ready to start implementing the changes.

### Implement the Save

When a tea is saved, we need to ensure the rating from the tea is saved. We will use a key of `ratingID` where ID is the value of the tea's ID. The test for this looks like the following:

```TypeScript
  describe('save', () => {
    it('saves the value', () => {
      const tea = { ...expectedTeas[4] };
      tea.rating = 4;
      TeaService.save(tea);
      expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });
  });
```

And the code to accomplish this in `TeaService.ts` is:

```TypeScript
  async save(tea: Tea): Promise<void> {
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating.toString(),
    });
  },
```

### Include the Rating in the Transformed Data

When we update fetch the tea data in our service, we currently transform it to set the `image`. We also need to add a transform to set the rating. The test for this is pretty straight forward.

First, pick some teas in our `expectedTeas` array to have non-zero ratings. I suggest just picking three or so of them to have the non-zero ratings. The teas with the zero ratings represent the teas that have not yet been rated. We should now have failing tests

We will be using the Storage API's `get()` method to get the proper data. In the `beforeEach()` for the "getAll" set of tests, mock the `Plugins.Storage.get` method. We will use a `mockImplementation()` to return the proper values for each key based on the `expectedTeas` we set to have a non-zero rating. Remember that the code we are mocking is asyncronous, so we should return a promise.

```typescript
  describe('getAll', () => {
    beforeEach(() => {
      client.get = jest.fn().mockResolvedValue({});
      Plugins.Storage.get = jest.fn().mockImplementation(opt => {
        let value = null;
        switch (opt.key) {
          case 'rating3':
            value = '1';
            break;
          case 'rating4':
            value = '3';
            break;
          case 'rating6':
            value = '5';
            break;
        }

        return Promise.resolve({ value });
      });
    });
  ...
  });
```

Now for ths transform itself. Here is where things get a little complicated. Here is what we are doing in a nut-shell:

- create a `transformTea()` method that transforms the tea, this needs to be done asyncronously now
- since we are doing things asyncronously, the `unpackData()` needs to return a promise of the tea array
- map the data using that transform
- now we have an array of promises, but we want a promise of an array, use `Promise.all()` to do this transform

```TypeScript
async function transformTea(data: RawData): Promise<Tea> {
  const { Storage } = Plugins;
  const { value } = await Storage.get({ key: `rating${data.id}` });
  return {
    ...data,
    image: `assets/img/${images[data.id - 1]}.jpg`,
    rating: parseInt(value || '0', 10),
  };
}

function unpackData(data: Array<RawData>): Promise<Array<Tea>> {
  return Promise.all(data.map(d => transformTea(d)));
}
```

## Update the Store

Our store needs to be updated to handle a rating change. This involves adding an action that can be dispatched by our pages as needed as well as a mutation that keeps the state consistent. Since this only applies to the teas, all of this will be namespaced to the `teas` module.

### Mutations

The first thing we need is a mutation that updates the specific tea in our state. In the `src/store/teas/mutations.ts` file add a stub function for a SET_RATING mutation:

```TypeScript
export const mutations = {
  ...
  SET_RATING: (state: State, payload: { id: number; rating: number }) => (state),
};
```
The test for this in `tests/util/store/teas/mutations.spec.ts` looks like this:

```typescript
describe('SET_RATING', () => {
  it('sets the specific tea', () => {
    const state = { teas, session };
    mutations.SET_RATING(state, { ...teas[1], rating: 4 });
    const expectedTeas = [...teas];
    expectedTeas[1] = { ...teas[1], rating: 4 };
    expect(state).toEqual({ teas: expectedTeas, session });
  });
});
```

**Note:** the `teas` array is missing the `rating` for each tea. Fill add one for each item. Just make sure `teas[1]` has a rating other than 4.

Filling out the body of the mutation in `src/store/teas/mutations.ts` we get:

```TypeScript
  SET_RATING: (state: State, payload: { id: number; rating: number })=> {
    const targetTea = state.teas.find(t => t.id === payload.id);
    if (targetTea) {
      targetTea.rating = payload.rating;
    }
  },
```

### Actions

We will also need to add an action. We will call it the `rate` action. As a payload it will take the tea to rate as well as a value for the new rating. Let's create the skeleton for that in `src/store/teas/actions.ts`.

```TypeScript
import { Tea } from '@/models';
...
export const actions = {
...
  async rate(
    { commit }: ActionContext<State, RootState>,
    payload: { tea: Tea; rating: number },
  ): Promise<void> {
    return undefined;
  },
...
};
```

Thinking about what this action needs to do, it needs to save the tea with the new rating, and it needs to commit the change to the store. Let's express those requirements as tests in `tests/unit/store/teas/actions.spec.ts`.

The first thing to note is that we have the same problem with the `teas` array that we had in the `mutations` test. Perform a similar update here by adding a `rating` to each tea in the array.

```TypeScript
  describe('rate', () => {
    it('saves the tea with the new rating', async () => {
      await actions.rate(context, { tea: teas[1], rating: 5 });
      expect(TeaService.save).toHaveBeenCalledTimes(1);
      expect(TeaService.save).toHaveBeenCalledWith({...teas[1], rating: 5});
    });

    it('commits the SET_TEA_RATING mutation', async () => {
      await actions.rate(context, { tea: teas[1], rating: 5 });
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith(
        'SET_RATING',
        { id: teas[1].id, rating: 5 },
      );
    });
  });
```

Then we can code this up safely in `src/store/teas/actions.ts`.

```TypeScript
  async rate(
    { commit }: ActionContext<State, State>,
    payload: { tea: Tea; rating: number },
  ): Promise<void> {
    TeaService.save({ ...payload.tea, rating: payload.rating });
    commit('SET_RATING', {
      id: payload.tea.id,
      rating: payload.rating,
    });
  },
```

## Update the Rating from the Page

With all of that in place, the changes to the view are very straight forward and are concentrated solely on the user interaction with the page. Really, our only two requirements are that the rating is set properly when we navigate to the page and that any changes to the rating are saved.

First, we will update the test `tests/unit/views/TeaDetails.spec.ts` to cover our requirements:

```TypeScript
  it('sets the rating based on the tea', () => {
    expect(wrapper.vm.rating).toBe(2);
  });

  it('dispatches rating on click', async () => {
    const rating = wrapper.find('[data-testid="rating"]');
    wrapper.setData({rating: 3});
    rating.trigger('click');
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith('teas/rate', {tea, rating: 3});
  });
```

And then `TeaDetails.vue` code changes that make this happen:

```diff
--- a/src/views/TeaDetails.vue
+++ b/src/views/TeaDetails.vue
@@ -16,7 +16,11 @@
         </div>
         <h1 data-testid="name">{{ tea.name }}</h1>
         <p data-testid="description">{{ tea.description }}</p>
-        <app-rating data-testid="rating" v-model="rating"></app-rating>
+        <app-rating
+          data-testid="rating"
+          v-model="rating"
+          @click="ratingClicked"
+        ></app-rating>
       </div>
     </ion-content>
   </ion-page>
@@ -37,6 +41,7 @@ import {
   IonToolbar,
 } from '@ionic/vue';

 import AppRating from '@/components/AppRating.vue';

 export default defineComponent({
@@ -57,12 +62,23 @@ export default defineComponent({
       rating: 0,
     };
   },
+  methods: {
+    ...mapActions('teas', ['rate']),
+    ratingClicked() {
+      this.rate({
+        tea: this.tea,
+        rating: this.rating,
+      });
+    },
+  },
+  created() {
+    this.rating = this.tea?.rating;
+  },
+  watch: {
+    tea(newValue) {
+      this.rating = newValue?.rating;
+    },
+  },
   setup() {
     const { params } = useRoute();
     const id = parseInt(params.id as string, 10);
```

## Conclusion

We have created the complete workflow for saving a rating change for a tea. There were a few different parts that need to be worked through, but by breaking things apart this way we gain a few advantages:

- each part is small and easy to understand
- our system is insulated from change

In the next section we will look at exapanding our simple little application to use tabs based navigation.
