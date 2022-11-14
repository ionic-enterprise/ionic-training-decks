# Lab: Mock Up the Interface

It is often desirable to lay out the user interface without worrying about how to get the data that will be displayed. This allows us to concentrate solely on how the application will look and feel in order to get that worked out early in the process.

In this lab, you will learn how to:

- Install assets that can be used by your application
- Model the data
- Mock up the user interface

## Install the Images

There are several images we would like to display for our teas, but these assets to do not exist yet. <a download href="/assets/packages/ionic-angular/img.zip">Download the images</a> and unpack the zip file under `public/assets`, creating an `img` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `img.zip` from `Downloads` into `public/assets`
1. Double click the `img.zip` file in `public/assets`, which creates an `img` folder
1. Remove the `img.zip` file
1. Find the favicon.png file and move it into `public/assets/icon`

If you are running the application in the browser, you should notice that the icon in the browser tab has now changed. However, the tab still says "Ionic App." To change that, you can edit the `public/index.html` file and change the `title`.

## Model the Data

Before we mock up the UI for the main page, let's define the data model for our teas:

- Create a `src/models` folder
- Add a `src/models/Tea.ts` file

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

We will also create a barrel file for our models. This is a little redundant right now, but it will make our lives easier later. Create a `src/models/index.ts` file and export our Tea model there.

```typescript
export * from './Tea';
```

## Rename the Home Page

We have done some work already with the Home page. Rather than start over, let's just rename that to be our TeaList page. This is a multi-part process as follows:

- Move the view file: `git mv src/views/HomePage.vue src/views/TeaListPage.vue`
- Move the test file: `git mv tests/unit/views/HomePage.spec.ts tests/unit/views/TeaListPage.spec.ts`
- Fix the routing.
- Fix the tests.
- Make minor updates to the code.

First move the files as noted above. You can also just rename them in your IDE if you want. The details are up to you.

### Fix the Routing

The routing is set up in `src/router/index.ts`. When we renamed the Vue file from HomePage to TeaListPage, we broke the import statement. In reality all we _have_ to do is fix that statement, like this:

```diff
-import HomePage from '../views/HomePage.vue';
+import HomePage from '../views/TeaListPage.vue';
```

In the long run, though, that would be confusing. While we are in there we should also update the routes so they are more descriptive for our application. We should also use a more descriptive name for the component. As a result, do this instead:

```diff
 import { createRouter, createWebHistory } from '@ionic/vue-router';
 import { RouteRecordRaw } from 'vue-router';
-import HomePage from '../views/HomePage.vue';
+import TeaListPage from '../views/TeaListPage.vue';

 const routes: Array<RouteRecordRaw> = [
   {
     path: '/',
-    redirect: '/home',
+    redirect: '/teas',
   },
   {
-    path: '/home',
-    name: 'Home',
-    component: HomePage,
+    path: '/teas',
+    name: 'Tea List',
+    component: TeaLisPage,
   },
 ];
```

### Fix the Tests

Similar to the routes, all we _really_ need to do with the test is fix the import in `tests/unit/views/TeaListPage.spec.ts`:

```diff
-import HomePage from '@/views/HomePage.vue';
+import HomePage from '@/views/TeaListPage.vue';
```

However, our test still refers to our Tea view as "Home", and that will be confusing long term, so let's fix the test properly:

```diff
 import { mount } from '@vue/test-utils';
-import HomePage from '@/views/HomePage.vue';
+import TeaListPage from '@/views/TeaListPage.vue';

-describe('HomePage.vue', () => {
+describe('TeaListPage.vue', () => {
   it('displays the title', () => {
-    const wrapper = mount(HomePage);
+    const wrapper = mount(TeaListPage);
     const titles = wrapper.findAll('ion-title');
     expect(titles).toHaveLength(2);
     expect(titles[0].text()).toBe('Blank');
   });

   it('displays the default text', () => {
-    const wrapper = mount(HomePage);
+    const wrapper = mount(TeaListPage);
     const container = wrapper.find('#container');
     expect(container.text()).toContain('Ready to create an app?');
```

At this point, our tests and the continuous build for our development server should both be working.

### Update the View

There is not much to update in `src/views/TeaListPage.vue`. We _could_ just update the name of the component to avoid future confusion. In the long run, however, it will be to our advantage to switch to using <a href="https://vuejs.org/api/sfc-script-setup.html" target="_blank">script setup</a>.

```html
<script setup lang="ts">
  import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
</script>
```

## Coding Challenge

Now that we have renamed the Home view and fixed up the routes, I have a coding challenge for you. What I would like you to do is change the Tea view to have a title of "Teas" rather than "Blank". This will be a two step process:

1. Update the test to expect "Teas" in the titles rather than "Blank". You should have a failing test at this point.
1. Update the code accordingly.

## Mock Up the Tea Display

Let's mock up how the Ionic components will be used in the Tea view. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when laying out the interface for an application.

### Mock the Data

One way of handling data in a Vue component is to use the <a href="https://vuejs.org/api/reactivity-core.html#ref">ref()</a> to declare a reactive value. The advantage of this approach is that the component will automatically re-render when the data changes.

Add a `ref()` to the `script setup` tag as follows:

```typescript
const teaData = ref<Array<Tea>>([
  {
    id: 1,
    name: 'Green',
    image: 'assets/img/green.jpg',
    description:
      'Green teas have the oxidation process stopped very early on, leaving them with a very subtle flavor and ' +
      'complex undertones. These teas should be steeped at lower temperatures for shorter periods of time.',
  },
  {
    id: 2,
    name: 'Black',
    image: 'assets/img/black.jpg',
    description:
      'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Black teas tend ' +
      'to have a higher caffeine content than other teas.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'assets/img/herbal.jpg',
    description:
      'Herbal infusions are not actually "tea" but are more accurately characterized as infused beverages ' +
      'consisting of various dried herbs, spices, and fruits.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: 'assets/img/oolong.jpg',
    description:
      'Oolong teas are partially oxidized, giving them a flavor that is not as robust as black teas but also ' +
      'not as subtle as green teas. Oolong teas often have a flowery fragrance.',
  },
  {
    id: 5,
    name: 'Dark',
    image: 'assets/img/dark.jpg',
    description:
      'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged probiotic teas that steeps ' +
      'up very smooth with slightly sweet notes.',
  },
  {
    id: 6,
    name: 'Puer',
    image: 'assets/img/puer.jpg',
    description:
      'An aged black tea from china. Puer teas have a strong rich flavor that could be described as "woody" or "peaty."',
  },
  {
    id: 7,
    name: 'White',
    image: 'assets/img/white.jpg',
    description:
      'White tea is produced using very young shoots with no oxidation process. White tea has an extremely ' +
      'delicate flavor that is sweet and fragrant. White tea should be steeped at lower temperatures for ' +
      'short periods of time.',
  },
]);
```

**Important:** you will also need to add a couple of imports. Import 'ref' from 'vue'. Import `Tea` from `@/models`.

**Note:** If we were further along, we probably would have created fake data in a composition API service, but we have not talked about of that yet.

### Experiment with a List

Now that we have a list of teas, we need to figure out how to display this information. One component that seems natural is to use a <a href="https://ionicframework.com/docs/api/card" target="_blank">card</a> to display each tea in the list. Let's see how that looks. Before doing this, use your browser's dev-tools to emulate an iPhone.

First we will do a little cleanup:

- Remove the `<div id="container">` and all of its child elements from the `template`
- Remove the styles for the "#container" from the `style`

The add the following markup where the `<div id="container">` used to be (under the `ion-header` that is within the `ion-content`):

```html
<ion-list>
  <ion-item v-for="tea of teaData" :key="tea.id">
    <ion-card>
      <ion-img :src="tea.image"></ion-img>
      <ion-card-header>
        <ion-card-title>{{tea.name}}</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{tea.description}}</ion-card-content>
    </ion-card>
  </ion-item>
</ion-list>
```

This looks nice on an iPhone form factor, but try some others. Try an iPad Pro, for example. Toggle device emulation off in the devtools and look at it as a web page with desktop resolution. In both of those cases, the cards just look "big." Clearly a more responsive design is called for.

Leave device emulation off in the devtools. Let's just worry about the desktop sized layout for now.

### The Components List

If you examine the console, you will notice several warnings having to do with failing to resolve a component. The problem here is that we are using some components but have not imported or declared them yet. If you look at the code, you will see where the components are imported:

```typescript
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
```

**Challenge:** update that `import` list to include all of the components you are currently using. You will know when you have succeeded when there are no more warnings upon refreshing the page.

### Use a Responsive Grid

We _could_ just limit the size of the cards so they would not get so big, but that would just be a waste of screen space on larger devices. Clearly we are not going to go with a list, so let's remove the markup we just added.

What we really need is a way to do the following:

1. show a single list on a phone
1. show two columns of tea cards side by side on an iPad
1. expand the columns to four on even wider screens, such as an iPad in landscape mode or our desktop

Enter the <a href="https://ionicframework.com/docs/layout/grid" target="_blank">responsive grid</a>. By default, the responsive grid shows rows containing 12 columns. Elements within the rows can be contained either within a single column or spread across multiple columns allowing for a very flexible layout within each row.

In our case we want to show at most four columns of cards per row for high resolution tablets. As the form factor changes, we want the number of columns to change. On lower resolution tablets we would like to display only two columns per row, and on phone resolutions we would like just a single column of cards. Luckily, there are some simple mechanisms in place that will allow us to do that, but first let's think about how we want the grid to work at the highest resolutions and then express that in some tests.

We no longer need the test that expects the content of our "#container" so remove that test case.

We will lay out this test for our current mock data (which has seven teas), and our highest resolution, which will have four teas per row. In this case, our page is expected to render two rows, the first with four columns and the second with three columns. We will need tests like this:

```typescript
describe('with seven teas', () => {
  it('displays two rows', () => {});
  it('displays four columns in the first row', () => {});
  it('displays three columns in the second row', () => {});
});
```

Let's fill out the first test:

```typescript
it('displays two rows', () => {
  const wrapper = mount(TeaListPage);
  const rows = wrapper.findAll('ion-grid ion-row');
  expect(rows).toHaveLength(2);
});
```

In order to satisfy this requirement, it will be easiest if we convert our list of teas to a matrix. Let's create a computed data item that does just that. The great thing about a computed data item is that Vue will cache the value for us as well as track the dependencies for it. This means that it will only recalculate if this teas list changes.

Add the following code to the Tea view's `script setup` section:

```typescript
const teaRows = computed((): Array<Array<Tea>> => {
  const teaMatrix: Array<Array<Tea>> = [];
  let row: Array<Tea> = [];
  teaData.value.forEach((t) => {
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
```

**Note:** you will also need to import `computed` from `vue`.

We can then update the view's template accordingly. Add the following markup either directly above or directly below the `ion-list` that we added earlier:

```html
<ion-grid>
  <ion-row class="ion-align-items-stretch" v-for="(row, index) in teaRows" :key="index"></ion-row>
</ion-grid>
```

**Hint:** remember to `import` new components as you use them.

Also, if you are wondering about the `ion-align-items-stretch` class, you can read more about it <a href="https://ionicframework.com/docs/layout/css-utilities#flex-container-properties" target="_blank">in our documentation</a>.

Now let's display the columns properly, first updating the tests:

```typescript
it('displays four columns in the first row', () => {
  const wrapper = mount(TeaListPage);
  const rows = wrapper.findAll('ion-grid ion-row');
  const cols = rows[0].findAll('ion-col');
  expect(cols).toHaveLength(4);
});

it('displays three columns in the second row', () => {
  // Using the above test as a model, write your own test here...
});
```

Verify that we have two failing tests. Now we can update the template by adding `<ion-col v-for="tea of row" size="3" :key="tea.id"></ion-col>` inside the `ion-row`:

```html
<ion-grid>
  <ion-row class="ion-align-items-stretch" v-for="(row, index) in teaRows" :key="index">
    <ion-col v-for="tea of row" size="3" :key="tea.id"></ion-col>
  </ion-row>
</ion-grid>
```

**Note:** the `size="3"` tells the column component to take up three column positions in the row. Remember that each row contains 12 column positions and that `ion-col` components in the row can be spread across multiple column positions. We only want at most four columns per row. Thus, each `ion-col` component we supply should be spread across three of the column positions in the row.

Now that we have the grid laid out, we can add our card template. We will just use the card template from our `ion-list` that we had added above. First let's add the tests.

```typescript
import { Tea } from '@/models';
...
  describe('with seven teas', () => {
    ...
    it('displays the name in the title', () => {
      const wrapper = mount(TeaListPage);
      const teas = (wrapper.getCurrentComponent() as any).setupState.teaData;
      const cols = wrapper.findAll('ion-col');
      cols.forEach((c, idx) => {
        const title = c.find('ion-card ion-card-header ion-card-title');
        expect(title.text()).toBe(teas[idx].name);
      });
    });

    it('displays the description in the content', () => {
      const wrapper = mount(TeaListPage);
      const teas = (wrapper.getCurrentComponent() as any).setupState.teaData;
      const cols = wrapper.findAll('ion-col');
      cols.forEach((c, idx) => {
        const title = c.find('ion-card ion-card-content');
        expect(title.text()).toBe(teas[idx].description);
      });
    });
  });
```

With the test in place, we can make the following modifications to the view:

- Move the `ion-card` layout from the `ion-list` to be a child of the `ion-col` in our grid
- Remove the rest of the `ion-list`
- Ensure that the `import` of components matches the ones used in the `template`

The component now loops through the rows. For each row it displays a column for each tea in that row. That looks great on a large device such as an iPad Pro or standard web browser. However, the cards are all different sizes and look a little crowded. We can fix that with a little styling in the view. You can replace the styling that is currently there with the following:

```scss
<style scoped>
ion-card {
  height: 100%;
}

ion-col {
  margin-bottom: 1em;
}
</style>
```

Note the `scoped` attribute. That limits the effects of this CSS to only the view defined by this vue file.

Now each card takes up its full cell height, and there is some margin between the rows. Nice!

There is one last thing. The current layout will always display four columns, which will look very squished on a phone. Recall that we wanted two columns on lower resolution tablets and a single column on phones. The grid provides breakpoints that allow us to set the column sizes based on the size of the screen. Let's do the following:

- smaller devices: column size 12 -> each column takes up the whole "row"
- large devices: column size 6 -> each column takes up half of the "row" (2 columns per "row")
- extra large devices: column size 3 -> each column takes up a quarter of the "row" (4 columns per "row")

The `ion-col` element currently has a single `size` attribute with a value of `3`:

```html
<ion-col v-for="tea of row" size="3" :key="tea.id"></ion-col>
```

Change the `ion-col` element to include the following `size` attributes instead:

- `size`: 12
- `size-md`: 6
- `size-xl`: 3

Now as you change the type of device that is being emulated, the layout adapts accordingly.

## Conclusion

In this lab you learned how to mock up the UI to ensure it looks the way you want it to look. Make sure you have a look at your app in both light and dark mode. Next we will begin laying out our authentication workflow so we can eventually get real data from our backend API.
