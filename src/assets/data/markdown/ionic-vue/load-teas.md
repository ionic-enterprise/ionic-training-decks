# Lab: Load Teas

In this lab, you will learn how to create a composition function that will be used to manage data.

## Create a Tea Function

The first thing we need to to is create some templates for our function and test.

**`tests/unit/use/tea.spec.ts`**

```TypeScript
import useBackendAPI from '@/use/backend-api';
import useTea from '@/use/tea';
import { Tea } from '@/models';

jest.mock('@/use/backend-api');

describe('useTea', () => {
  let expectedTeas: Array<Tea>;
  let httpResultTeas: Array<{ id: number; name: string; description: string }>;

  const initializeTestData = () => {};

  beforeEach(() => {
    initializeTestData();
    jest.clearAllMocks();
  });

  describe('refresh', () => {
    const { client } = useBackendAPI();

    it('gets the tea categories', async () => {});

    it('transforms the tea data', async () => {});
  });
});
```

**`src/use/tea.ts`**

```TypeScript
import { ref } from 'vue';
import { Tea } from '@/models';
import useBackendAPI from './backend-api';

const { client } = useBackendAPI();
const teas = ref<Array<Tea>>([]);

const refresh = async (): Promise<void> => {};

export default () => ({
  refresh,
  teas,
});
```

In this case, I included the scaffolding for the test cases for you. These test cases specify the two requirements that we have for our `refresh()` function. It needs to:

- get the data
- transform the data

So let's tackle those requirements one at a time. First, we need to make the API call to get the data.

```TypeScript
    it('gets the tea categories', async () => {
      const { refresh } = useTea();
      await refresh();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/tea-categories');
    });
```

In order to satisfy that test, we can just perform the basic "get" pattern of sending a GET request to the backend API and then assigning the data.

```TypeScript
const refresh = async (): Promise<void> => {
  teas.value = await client.get('./tea-categories').then(res => res.data);
};
```

But there is a bit of a problem. The data that comes back from the API is not in the shape we want for our application. This is a common issue that needs to be handled in the logic. Specifically, the backend team has not decided how to handle the tea images yet, so what we will do for now is map the images to our own set of assets based on the IDs of the tea.

This is where the second requirement, the requirement to transform the data, comes in to play. In our tests, let's express the difference between the two formats as two different sets of data: the raw HTTP data, and the expected data. Update the `initializeTestData()` method as such:

```TypeScript
  const initializeTestData = () => {
    expectedTeas = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
      },
      {
        id: 2,
        name: 'Black',
        image: 'assets/img/black.jpg',
        description: 'Black tea description.',
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'assets/img/herbal.jpg',
        description: 'Herbal Infusion description.',
      },
      {
        id: 4,
        name: 'Oolong',
        image: 'assets/img/oolong.jpg',
        description: 'Oolong tea description.',
      },
      {
        id: 5,
        name: 'Dark',
        image: 'assets/img/dark.jpg',
        description: 'Dark tea description.',
      },
      {
        id: 6,
        name: 'Puer',
        image: 'assets/img/puer.jpg',
        description: 'Puer tea description.',
      },
      {
        id: 7,
        name: 'White',
        image: 'assets/img/white.jpg',
        description: 'White tea description.',
      },
      {
        id: 8,
        name: 'Yellow',
        image: 'assets/img/yellow.jpg',
        description: 'Yellow tea description.',
      },
    ];
    httpResultTeas = expectedTeas.map((t: Tea) => {
      const tea: any = { ...t };
      delete tea.image;
      return tea;
    });
  }
```

What we have here is the `expectedTeas` with the data in the shape we want within the domain of our application. The `httpResultTeas` are _almost_ the same, just without the `image` property, so we strip that. The test to make sure the service reshapes the data properly is then fairly straight forward.

```TypeScript
    it('transforms the tea data', async () => {
      const { refresh, teas } = useTea();
      (client.get as any).mockResolvedValue({ data: httpResultTeas });
      await refresh();
      expect(teas.value).toEqual(expectedTeas);
    });
```

The HTTP `GET` returns the teas in one shape, we expect the results in the other shape.

So, let's get down to coding this in `src/use/tea.ts`. The first thing we will do is define a type for the data coming back from the HTTP API and the shell of a transforming function.

```TypeScript
interface RawData {
  id: number;
  name: string;
  description: string;
}

const unpackData = (data: Array<RawData>): Array<Tea> => {
  return [];
}
```

We can then also update the promise handling in our `getAll()` to ensure the transform is called if we have data:

```TypeScript
      .then(res => res.data && unpackData(res.data));
```

Looking at the data we have coming back, we have eight tea categories with IDs 1 through 8, so for this data it it pretty easy to map the tea to an image using the ID. First, create an array of the image names in the right order (this can either be global to the file or within the `unpackData()` function):

```TypeScript
const images: Array<string> = [
  'green',
  'black',
  'herbal',
  'oolong',
  'dark',
  'puer',
  'white',
  'yellow',
];
```

Then in `unpackData()` map the data, adding in the image property in the format required:

```TypeScript
  return data.map(t => ({ ...t, image: `assets/img/${images[t.id - 1]}.jpg` }));
```

Obviously, this is a fairly contrived example and it does not compensate for changes such as someone adding a tea category or changing the IDs in some way, etc. However, let's say that in the future the backend team decides to add a "Type Code" to the tea category that does a better job of mapping this tea to an image within your system, you only have to go to this service to make that change.

The same applies of this decide to shorten the property names in order to save on bytes going over the air. You still only need to change this service. The rest of your system is insulated from the external API changes by the use of this composition function.

At this point, we should create a `src/use/__mocks__/tea.ts` as well. You should be an old hand at that by now, but for this one you will also need to supply the `teas` reactive value as such: `teas: ref<Array<Tea>>([]),`

## Update the Tea List Page

Now that we have this put together, we can update the `TeaList` page to show the actual teas from our API rather than the hard coded teas that are being displayed right now.

### Modify the Test

Modify the test first. Since we are not changing anything about how the page works, but are only changing the source of our data, so we need to modify the test to load that source (our composition function) up front.

```TypeScript
import useTea from '@/use/tea';
...
jest.mock('@/use/tea');
  ...
  const { teas } = useTea();
  ...

  beforeEach(async () => {
    teas.value = [
      // Copy the tea data from the `TeaList.vue` file to here...
    ];
    jest.clearAllMocks();
  });
  ...
```

There are also a couple of tests that grab the list of teas from the view's view model for comparison purposes. You can identify them by having a like this this in them: `const teas = wrapper.vm.teaData as Array<Tea>;`

Remove that line, and update the comparison to use `teas.value`. Here is a `diff` for one such test to give you an idea of the change required:

```diff
     it('displays the name in the title', async () => {
       const wrapper = await mountView();
-      const teas = wrapper.vm.teaData as Array<Tea>;
       const cols = wrapper.find('ion-col');
       cols.forEach((c, idx) => {
         const title = c.find('ion-card ion-card-header ion-card-title');
-        expect(title.text()).toBe(teas[idx].name);
+        expect(title.text()).toBe(teas.value[idx].name);
       });
     });
```

Finally, add a test showing that we a refreshing the data. This can go right after the "displays the title" test:

```typescript
it('refreshes the tea data', async () => {
  const { refresh } = useTea();
  await mountView();
  expect(refresh).toHaveBeenCalledTimes(1);
});
```

### Modify the View

Let's attach the view code in a methodic, orderly fashion.

1. Our view currently has a hard-coded `data()` section. Remove that entirely.
1. Within the `setup()`, do the following:
   1. `const { refresh, teas } = useTea();` (you will also need to add an import)
   1. Call `refresh()`
   1. Add a computed value: `const teaRows = computed(() => {});` (be sure to include `teaRows` in the object returned at the end of the `setup()` function)

At this point, we need to figure out the logic for the computed value we added in our `setup()`. Note that we currently have a `computed:` section outside of our `setup()`. It contains a `teaRows()` function that has _almost_ exactly what we want with one minor modification:

```diff
-      this.teaData.forEach(t => {
+      teas.value.forEach(t => {
```

So, what we need to do to finish this up is the following:

1. Copy the code from the `teaRows()` function to the body of our `const teaRows = computed(() => {});` computed value.
1. Change `this.teaData` to `teas.value` as noted in the above `diff`.
1. Remove the old `computed:` section.

At this point, the old styled `computed:` and `data()` sections should be gone, and all of the logic to fetch our teas and transform the array into a matrix should be contained within our `setup()` routine. All of our tests should be passing, and when we run the code in the browser we should see eight teas displayed.

## Conclusion

Our TeaList page is now getting live data from our backend. The data itself is managed by our `useTea` composition function.

In case you had any issues transforming the view, here is the full code for the `setup()` function that you can use as a reference. Try to code this on your own, however, without peeking.

```TypeScript
  setup() {
    const { logout } = useAuth();
    const { refresh, teas } = useTea();
    const router = useRouter();

    const teaRows = computed(() => {
      const teaMatrix: Array<Array<Tea>> = [];
      let row: Array<Tea> = [];
      teas.value.forEach(t => {
        row.push(t);
        if (row.length === 4) {
          teaMatrix.push(row);
          row = [];
        }
      });

      if (row.length) {
        teaMatrix.push(row);
      }
      return teaMatrix;
    });

    const logoutClicked = async (): Promise<void> => {
      await logout();
      router.replace('/login');
    };

    refresh();

    return { logoutClicked, logOutOutline, teaRows };
  },
```
