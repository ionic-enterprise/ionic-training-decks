# Lab: Store the Tea Rating

In this lab you will further explore our data service and data store in order to implement the saving and retrieval of the user's tea ratings.

## Overall Strategy

Now that we have the rating set up, let's look at doing something with the data.

The first challenge that we have is that our backend API does not have a place to store individual user ratings on a tea. Perhaps it will at some point, but it does not right now. To get around this, we will use Capacitor's Preferences plugin to store the data in a local mechanism, either on-device when running in a mobile context or in `localstorage` when running in a web context. This will involve updating the `useTea` composition function as follows:

- add a `rate()` method
- update the `refresh()` to include the rating

Finally, we will need to update the `TeaDetails` page to display the correct rating when the page is displayed, and to save any rating changes.

By laying everything like this, we allow for change in our system without breaking a lot of code. For example, if the backend API is later changed such that we _can_ store the ratings, the only thing that needs to change is the `useTea` composition function. We would just change how the `rate()` and `refresh()` access the ratings data. Nothing else in the system needs to change.

It is a best practice to always have a layer of code in your system that insulates the rest of the application from change.

## `useTea` Modifications

### Preliminary Changes

Add a `rating` property in `src/models/Tea.ts`. Make it a number

Three tests are using the `Tea` model when creating test data.

- `tests/unit/views/TeaDetailsPage.spec.ts`
- `tests/unit/views/TeaListPage.spec.ts`
- `tests/unit/use/tea.spec.ts`

Update the `TeaDetailsPage` and `TeaListPage` tests to include a `rating` in any defined `Tea` model. Use any number between 0 and 5 for each tea.

In the `tests/unit/use/tea.spec.ts` file there are also a few preliminary items to handle:

- add a rating to each Tea model (use a value of zero for now)
- a couple of "find" tests expect a specific tea, add the `rating` there as well
- update the creation of `httpResultTeas` to remove the `result` just like we do the `image`
- add a `describe('rate')` block for the saving of the rating, but leave it empty for now
- `import { Preferences } from @capacitor/preferences;`

In `src/use/tea.ts`, add the rating setting it to zero in `unpackData()`. Also, create the shell of the `rate()` method as such (be sure to return it from the `default` function as well as to the `src/use/__mocks__/tea.ts` file):

```typescript
const rate = async (id: number, rating: number): Promise<void> => {};
```

At this point we are ready to start implementing the changes.

### Implement the Rate Function

When the rating is saved using `@capacitor/preferences`, we will use a key of `ratingID` where ID is the value of the tea's ID. The test for this looks like the following (this should go in the "rate" `describe` block.

```TypeScript
  describe('rate', () => {
    const { rate } = useTea();

    it('saves the value', async () => {
      await rate(5, 4);
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });
  });
```

Add the code to accomplish this in `src/use/tea.ts`:

```TypeScript
const rate = async (id: number, rating: number): Promise<void> => {
  // TODO: your code goes here...
};
```

**Code Challenge:**

We also need to update the proper tea in the `teas.value` array when there is a change. The challenge for you is:

1. Add a test within the `describe('rate')` that expresses this requirement.
1. Update the `rate()` function to implement the requirement.

Try to complete this without peeking at the answer at the end of the page.

**Hints:**

You should add a `beforeEach()` section within the `describe('rate')` like this:

```typescript
beforeEach(() => {
  const { client } = useBackendAPI();
  (client.get as any).mockResolvedValue({ data: httpResultTeas });
});
```

Your test will then perform the following tasks:

- Refresh the teas array.
- Call `rate()` to set a rating.
- Verify that the rating has been applied to the appropriate item in the `teas.value` array.

### Include the Rating in the Transformed Data

When we fetch the tea data in our service, we currently transform it to set the `image`. We also need to add a transform to set the rating. The test for this is pretty straight forward.

First, pick some teas in our `expectedTeas` array to have non-zero ratings. I suggest just picking three or so of them to have the non-zero ratings. The teas with the zero ratings represent the teas that have not yet been rated. If you picked teas that are also used in the `find()` tests, but sure to update those tests accordingly. We should now have failing tests.

We will be using the Preferences API's `get()` method to get the proper data. In the main `beforeEach()`, mock the `Preferences.get` method with a `mockImplementation()` to return the proper values for each key based on the `expectedTeas`. What the "proper value" is depends highly upon which `expectedTeas` you chose to have a non-zero ratings value. Thus your code will almost certainly be slightly different.

**before:**

```typescript
beforeEach(() => {
  initializeTestData();
  jest.clearAllMocks();
});
```

**after:**

```typescript
beforeEach(() => {
  initializeTestData();
  jest.clearAllMocks();
  (Preferences.get as any).mockImplementation(async (opt: GetOptions) => {
    let value = null;
    switch (opt.key) {
      case 'rating3':
        value = '2';
        break;
      case 'rating6':
        value = '5';
        break;
      case 'rating7':
        value = '3';
        break;
    }
    return { value };
  });
});
```

Now for ths transform itself. Here is where things get a little complicated. Here is what we are doing in a nut-shell:

- Create a `transform()` method that transforms the tea, this needs to be done asynchronously now.
- Since we are doing things asynchronously, the `unpackData()` needs to return a promise of the tea array.
- Map the data using the new `transform()`.
- Now we have an array of promises, but we want a promise of an array, so use `Promise.all()` to do this data conversion.

```TypeScript
const unpackData = (data: Array<RawData>): Promise<Array<Tea>> => {
  return Promise.all(data.map(t => transform(t)));
};

const transform = async (data: RawData): Promise<Tea> => {
  const { value } = await Preferences.get({ key: `rating${data.id}` });
  return {
    ...data,
    rating: parseInt(value || '0', 10),
    image: `assets/img/${images[data.id - 1]}.jpg`,
  };
};
```

## Update the Rating from the Page

With all of that in place, the changes to the view are very straight forward and are concentrated solely on the user interaction with the page. Our only two requirements are that the rating is set properly when we navigate to the page and that any changes to the rating are saved.

First, we will update the test `tests/unit/views/TeaDetailsPage.spec.ts` to cover our requirements:

```TypeScript
  it('sets the rating based on the tea', async () => {
    const wrapper = await mountView();
    expect(wrapper.vm.rating).toEqual(2);
  });

  it('saves the rating on click', async () => {
    const wrapper = await mountView();
    const { rate } = useTea();
    const rating = wrapper.find('[data-testid="rating"]');
    wrapper.vm.rating = 4;
    rating.trigger('click');
    expect(rate).toHaveBeenCalledTimes(1);
    expect(rate).toHaveBeenCalledWith(3, 4);
  });
```

**Note:** depending on how you set up your initial test data, you may need to update the values used above. Basically, the first test should use the specified rating, and the second test should set it to something else.

And then `TeaDetailsPage.vue` code changes that make this happen:

- Write function called `ratingClicked` that will handle saving the rating when the tea is clicked.
- Bind `ratingClicked` to the `click` event on the `app-rating` element.

## Conclusion

We have created the complete workflow for saving a rating change for a tea. There were a few different parts that need to be worked through, but by breaking things apart this way we gain a few advantages:

- each part is small and easy to understand
- our system is insulated from change

In the next section we will look at expanding our simple little application to use tabs based navigation.

**Code Answers (if you need them)**

If you got lost with the first code challenge (writing the `rate()` function, here is the relevant code):

```typescript
describe('rate', () => {
  const { rate, refresh, teas } = useTea();

  beforeEach(() => {
    // Note: this is getting a little repetitive, so feel free to move it into the
    // main beforeEach() and clean up the rest of the tests accordingly. Doing so
    // is left as an exercise for the reader.
    const { client } = useBackendAPI();
    (client.get as any).mockResolvedValue({ data: httpResultTeas });
  });

  it('saves the value', async () => {
    await rate(5, 4);
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'rating5',
      value: '4',
    });
  });

  it('updates the teas array', async () => {
    await refresh();
    await rate(5, 4);
    expect(teas.value[4].rating).toEqual(4);
  });
});
```

```typescript
const rate = async (id: number, rating: number): Promise<void> => {
  await Preferences.set({ key: `rating${id}`, value: rating.toString() });
  const tea = await find(id);
  if (tea) {
    tea.rating = rating;
  }
};
```

Here is the diff for the `TeaDetailsPage` coding in case you need it.

```diff
diff --git a/src/views/TeaDetailsPage.vue b/src/views/TeaDetailsPage.vue
index e21cd23..b651134 100644
--- a/src/views/TeaDetailsPage.vue
+++ b/src/views/TeaDetailsPage.vue
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
@@ -58,10 +62,20 @@ export default defineComponent({
     const tea = ref<Tea | undefined>();
     const rating = ref(0);

+    const ratingClicked = () => {
+      const { rate } = useTea();
+      if (tea.value) {
+        rate(tea.value.id, rating.value);
+      }
+    };
+
     const { find } = useTea();
-    find(id).then(t => (tea.value = t));
+    find(id).then(t => {
+      tea.value = t;
+      rating.value = (t && t.rating) || 0;
+    });

-    return { rating, tea };
+    return { rating, tea, ratingClicked };
   },
 });
 </script>
```
