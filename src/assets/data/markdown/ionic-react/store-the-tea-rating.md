# Lab: Store the Tea Rating

In this lab you will further explore our tea composable function in order to implement the saving and retrieval of the user's tea ratings.

## Overall Strategy

Now that we have the rating set up, let's look at doing something with the data.

The first challenge that we have is that our backend API does not have a place to store individual user ratings on a tea. Perhaps it will at some point, but it does not right now. To get around this, we will use Capacitor's Preferences plugin to store the data in a local mechanism, either on-device when running in a mobile context or in `localStorage` when running in a web context. This will involve updating the `TeaProvider` context as follows:

- add a `rate()` method
- update the `loadTeas()` to include the rating

Finally, we will need to update the tea details page to display the correct rating when the page is displayed, and to save any rating changes.

By laying out everything like this, we allow for change in our system without breaking a lot of code. For example, if the backend API is later changed such that we _can_ store the ratings, the only thing that needs to change is the tea provider. We would just change how the `rate()` and `loadTeas()` access the ratings data. Nothing else in the system needs to change.

It is a best practice to always have layers of code in your system that insulate the rest of the application from change.

## `TeaProvider` Modifications

### Preliminary Changes

Add a `rating` property in `src/models/Tea.ts`. Make it a number

Three tests are using the `Tea` model when creating test data.

- `src/tea/TeaDetailsPage.test.ts`
- `src/tea/TeaListPage.test.ts`
- `src/tea/TeaProvider.test.tsx`

Update the `TeaDetailsPage` and `TeaListPage` tests to include a `rating` in any defined `Tea` model. Use any number between 0 and 5 for each tea.

In the `src/tea/TeaProvider.test.tsx` file there are also a few preliminary items to handle:

- when adding a rating to each Tea model, use a value of zero for now
- update the creation of `httpResultTeas` to remove the `rating` just like we do the `image` (also update the type declaration for `httpResultTeas` to omit the 'rating' as well as the 'image')
- add a `describe('rate')` block for the saving of the rating, but leave it empty for now
- `import { Preferences } from '@capacitor/preferences';`
- `vi.mock('@capacitor/preferences');`

Some tests should be failing at this point. In `src/tea/TeaProvider.tsx`, add the rating setting it to zero in `unpack()`. This should fix the failing tests.

Also, create the shell of the `rate()` method as such (be sure to return it from the `useTea` hook as well as to the `src/tea/__mocks__/TeaProvider.tsx` file):

```typescript
const rate = async (id: number, rating: number): Promise<void> => {
  null;
};
```

At this point we are ready to start implementing the changes.

### Implement the Rate Function

When the rating is saved using `@capacitor/preferences`, we will use a key of `ratingID` where ID is the value of the tea's ID. The test for this looks like the following:

```typescript
describe('rate', () => {
  const wrapper = ({ children }: any) => <TeaProvider>{children}</TeaProvider>;

  it('saves the rating', async () => {
    const { result } = await waitFor(() => renderHook(() => useTea(), { wrapper }));
    await result.current.rate(5, 4);
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'rating5', value: '4' });
  });
});
```

Add the code to accomplish this in `src/tea/TeaProvider.tsx`:

```typescript
const rate = async (id: number, rating: number): Promise<void> => {
  // TODO: your code goes here based on the failing test
};
```

**Code Challenge:**

We also need to update the proper tea in the `teas` array when there is a change. The challenge for you is:

1. Add a test within the `describe('rate')` that expresses this requirement.
1. Update the `rate()` function to implement the requirement.

Try to complete this without peeking at the answer at the end of the page.

**Hints:**

You should add a `beforeEach()` section within the `describe('rate')` like this:

```typescript
beforeEach(() => (client.get as Mock).mockResolvedValue({ data: httpResultTeas }));
```

Your test will then perform the following tasks:

- Refresh the teas array.
- Call `rate()` to set a rating.
- Verify that the rating has been applied to the appropriate item in the `teas` array.

### Include the Rating in the Transformed Data

When we fetch the tea data in our service, we currently transform it to set the `image`. We also need to add a transform to set the rating. The test for this is pretty straight forward.

First, pick some teas in our `expectedTeas` array to have non-zero ratings. I suggest just picking three or so of them to have the non-zero ratings. The teas with the zero ratings represent the teas that have not yet been rated. We should now have failing tests.

We will be using the Preferences API's `get()` method to get the proper data. In the main `beforeEach()`, mock the `Preferences.get` method with a `mockImplementation()` to return the proper values for each key based on the `expectedTeas`. What the "proper value" is depends highly upon which `expectedTeas` you chose to have a non-zero ratings value. Thus your code will almost certainly be slightly different.

```diff
beforeEach(() => {
  initializeTestData();
  vi.resetAllMocks();
  (client.get as Mock).mockResolvedValue({ data: [] });
+ (Preferences.get as Mock).mockImplementation(async (opt: GetOptions) => {
+   switch (opt.key) {
+     case 'rating1':
+       return { value: '2' };
+     case 'rating3':
+       return { value: '4' };
+     case 'rating5':
+       return { value: '2' };
+     default:
+       return { value: null };
+   }
+ });
});
```

_Note:_ you need to import `GetOptions` from `'capacitor/preferences'`.

Now for the transform itself. Here is where things get a little complicated. Here is what we are doing in a nut-shell:

- Create a `transform()` method that transforms the tea, this needs to be done asynchronously now.
- Since we are doing things asynchronously, the `unpack()` needs to return a promise of the tea array.
- Map the data using the new `transform()`.
- Now we have an array of promises, but we want a promise of an array, so use `Promise.all()` to do this data conversion.

Like the `unpack` method, this function can exist either inside our outside of the provider definition.

```typescript
type RawData = Omit<Tea, 'image' | 'rating'>;
...

const unpack = (data: RawData[]): Promise<Tea[]> => {
  return Promise.all(data.map((t) => transform(t)));
};

// Note: You may have the 'images' array defined outside of the function, which is OK.
const transform = async (data: RawData): Promise<Tea> => {
  const images: Array<string> = ['green', 'black', 'herbal', 'oolong', 'dark', 'puer', 'white', 'yellow'];
  const image = `/assets/images/${images[data.id - 1]}.jpg`;
  const { value } = await Preferences.get({ key: `rating${data.id}` });
  return { ...data, image, rating: parseInt(value || '0', 10) };
};
```

I leave it to you to update `loadTeas()` to unpack the data returned from the network call in an asynchronous manner.

## Update the Rating from the Page

With all of that in place, the changes to `src/tea/TeaDetailsPage.tsx` are very straight forward.

First, change the computed property that selects the tea to be a stateful property. It will be set using a `useEffect`.

```typescript
const [tea, setTea] = useState<Tea>();

useEffect(() => {
  setTea(teas.find((t) => t.id === parseInt(id, 10)));
}, [teas]);
```

Second, we will need to update the mock in the `beforeEach` block in `src/tea/TeaDetailsPage.test.tsx`:

```diff
(useTea as Mock).mockReturnValue({
  teas: [
    ...
  ],
+ rate: vi.fn(),
});
```

Third, add a test that covers the change handling requirement:

```tsx
it('saves the rating on click', async () => {
  const { rate } = useTea();
  render(<TeaDetailsPage />);
  const stars = screen.getAllByTestId(/\b(star|outline)\b/);
  fireEvent.click(stars[3]);
  await waitFor(() => expect(rate).toHaveBeenCalledTimes(1));
  expect(rate).toHaveBeenCalledWith(3, 4);
});
```

**Note:** depending on how you set up your initial test data, you may need to update the values used above. Basically, the test should set the rating to something else.

Finally, modify `TeaDetailsPage.tsx` to make this happen:

- Write function called `handleRatingChange` that will handle saving the rating when the tea is clicked and update the tea state (using `setTea`).
- Bind `handleRatingChange` to the `onClick` event on the `<Rating />` component.

## Conclusion

We have created the complete workflow for saving a rating change for a tea. There were a few different parts that need to be worked through, but by breaking things apart this way we gain a few advantages:

- each part is small and easy to understand
- our system is insulated from change

In the next section we will look at expanding our simple little application to use tabs based navigation.

**Code Answers (if you need them)**

If you got lost with the first code challenge (writing the `rate()` function, here is the relevant code):

```typescript
describe('rate', () => {
  const wrapper = ({ children }: any) => <TeaProvider>{children}</TeaProvider>;

  beforeEach(() => {
    // Note: this is getting a little repetitive, so feel free to move it into the
    // main beforeEach() and clean up the rest of the tests accordingly. Doing so
    // is left as an exercise for the reader.
    (client.get as Mock).mockResolvedValue({ data: httpResultTeas });
  });

  it('saves the rating', async () => {
    const { result } = await waitFor(() => renderHook(() => useTea(), { wrapper }));
    await result.current.rate(5, 4);
    expect(Preferences.set).toHaveBeenCalledTimes(1);
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'rating5', value: '4' });
  });

  it('updates the tea array', async () => {
    const { result } = await waitFor(() => renderHook(() => useTea(), { wrapper }));
    await result.current.rate(5, 4);
    const tea = result.current.teas.find((x) => x.id === 5);
    expect(tea?.rating).toBe(4);
  });
});
```

```typescript
const rate = async (id: number, rating: number): Promise<void> => {
  await Preferences.set({ key: `rating${id}`, value: rating.toString() });
  const idx = teas.findIndex((t) => t.id === id);
  teas[idx].rating = rating;
  setTeas(teas);
};
```

Here is the component definition code in `TeaDetailsPage` in case you need it.

```typescript
const { id } = useParams<{ id: string }>();
const { teas, rate } = useTea();
const [tea, setTea] = useState<Tea | undefined>();

useEffect(() => {
  setTea(teas.find((t) => t.id === parseInt(id, 10)));
}, [teas]);

const handleRatingChange = async (rating: number) => {
  await rate(tea!.id, rating);
  setTea({ ...tea!, rating });
};
```

And the modification made to the component template:

```tsx
<Rating rating={tea.rating} onRatingChange={handleRatingChange} />
```
