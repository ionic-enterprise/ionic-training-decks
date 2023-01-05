# Lab: Tea Details Page

In this lab, you will:

- add a child page to the application
- set up the navigation to and from the child page

## Stacked Navigation

Ionic supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## Starting Code

Let's start with some fairly boilerplate starting code for a page.

First the test in `tests/unit/views/TeaDetailsPage.spec.ts`

```TypeScript
import { useAuth } from '@/composables/auth';
import TeaDetailsPage from '@/views/TeaDetailsPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';

describe('TeaDetailsPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TeaDetailsPage }],
    });
    router.push('/');
    await router.isReady();
    return mount(TeaDetailsPage, {
      global: {
        plugins: [router],
      },
    });
  };

  it('renders', async () => {
    const wrapper = await mountView();
    const header = wrapper.find('ion-header');
    const content = wrapper.find('ion-content');
    expect(header.exists()).toBe(true);
    expect(content.exists()).toBe(true);
  });
});
```

Then the page itself in `src/views/TeaDetailsPage.vue`

```HTML
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tea Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content></ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
</script>

<style scoped></style>
```

## Navigating

Now that we have a details page, let's set up the navigation to the page and then back again. The first thing we should do is set up the route to the page. From URL perspective, it makes sense that the page should be a child to the `/teas` route. Also, since we will be displaying a particular tea it makes sense that the tea's ID should be part of the route. Add a route in the `src/router/index.ts` file. It will be similar to the existing `/teas` route with the following differences:

- The path will be `/teas/tea/:id`.
- We want to lazy load the page. The `TeaListPage` is loaded eagerly. To lazy load the page, use this syntax for the `component` property: `() => import('@/views/TeaDetailsPage.vue')`.
- The name should be different, give it reasonable name.

We want to navigate from the `TeaListPage` page to the `TeaDetailsPage` page. A logical choice for the trigger is to use a click on the tea's card to start the navigation. Let's write a test for that in `tests/unit/views.TeaListPage.spec.ts`.

```TypeScript
  it('navigates to the tea details page when a tea card is clicked', async () => {
    const wrapper = await mountView();
    const cards = wrapper.findAll('ion-card');
    router.push = jest.fn();
    cards[3].trigger('click');
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/teas/tea/4');
  });
```

Based on how we have the test set up, we know we should have seven `ion-card` elements, and we know what order they will be displayed in since we are controlling the state. Our test triggers a click on the 4th card and expects the proper `router.push()` call to occur.

**Note:** you may need to adjust the list a bit based on exactly what your data looks like.

Now that we have a failing test, let's make that click occur in the `TeaListPage.vue` file.

```HTML
<ion-card button @click="$router.push(`/teas/tea/${tea.id}`)">
```

If we click on that, we get to the details page, but we have no way to get back. Let's fix that now. Add the following markup to the `TeaDetailsPage.vue` file. Add it within the `ion-toolbar`.

```html
<ion-buttons slot="start">
  <ion-back-button />
</ion-buttons>
```

Be sure to update the list of components where we import them.

Now when we navigate from the `TeaListPage` page to the `TeaDetailsPage` page, the current `IonRouterOutlet` creates a navigation stack and knows that we have a page to go back to. It thus renders a back button in the toolbar for us (remember, iOS has no hardware back button so you need to deal with this in software).

What happens if we refresh while we are on the details page? We no longer have the back button because there is no stack, only this page. However, we know we want to go to the `TeaListPage` page, so we can set a default on the back button:

```html
<ion-back-button defaultHref="/teas" />
```

Try reloading the details page again. There are two real-world scenarios where you will need to take something like this in to account:

- you are deploying to the web
- you are deploying natively but allowing deep linking to the child page

In other cases this is less important because you should always have a valid navigation stack.

## Display the Tea

Now that we have the navigation in place, let's grab the tea and display it.

### Update the Composition Function

To grab the proper tea, it would be handy to have a `find` function in `src/composables/tea.ts` that would go grab the tea based on the ID:

```typescript
const find = async (id: number): Promise<Tea | undefined> => {
  // This will be replaced with code that actually does things...
  return undefined;
};
```

The requirements for this function are:

- If the teas have not been fetched yet, it should fetch them before doing the search.
- If the teas have been fetched, it should just search those teas without hitting the network again.
- If a tea with the given ID does not exist, it should return `undefined`.

Expressed as a set of tests, those requirements look like this:

```typescript
describe('find', () => {
  const { client } = useBackendAPI();
  const { find, refresh, teas } = useTea();

  beforeEach(() => {
    teas.value = [];
    (client.get as jest.Mock).mockResolvedValue({ data: httpResultTeas });
  });

  it('refreshes the tea data if it has not been loaded yet', async () => {
    const t = await find(6);
    expect(teas.value.length).toEqual(8);
    expect(t).toEqual({
      id: 6,
      name: 'Puer',
      image: 'assets/img/puer.jpg',
      description: 'Puer tea description.',
    });
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith('/tea-categories');
  });

  it('finds the tea from the existing teas', async () => {
    await refresh();
    jest.clearAllMocks();
    const t = await find(4);
    expect(t).toEqual({
      id: 4,
      name: 'Oolong',
      image: 'assets/img/oolong.jpg',
      description: 'Oolong tea description.',
    });
    expect(client.get).not.toHaveBeenCalled();
  });

  it('returns undefined if the tea does not exist', async () => {
    expect(await find(42)).toBeUndefined();
  });
});
```

1. Add those tests to `tests/unit/composables/tea.spec.ts`.
1. Add the `find` from above to `src/composables/tea.ts` and fill in the logic.
1. Be sure to return the `find` in the default function exported by `src/composables/tea.ts`.
1. Include a `find` mock in `src/composables/__mocks__/tea.ts`.

### Update the Details View

#### Create the Tests

First we need to figure out what our test setup in `tests/unit/view/TeaDetails.spec.ts` should look like. We know that we will need to do the following in the code:

- Get the `id` parameter from our route.
- Call the `find` from `useTeas()` to find the proper tea.

The `router` is already being configured in the `mountView()` function. We just need to make a couple of minor tweaks to the actual paths that are used:

```typescript
router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [{ path: '/teas/tea/:id', component: TeaDetailsPage }],
});
router.push('/teas/tea/3');
```

**Note:** the above is a change to existing code, so don't just copy-paste. Just change the paths.

Next, we need to configure the tea data so the `find()` call we need to make in the code will be testable. This involves the following steps:

- Import the `useTea()` function: `import { useTea } from '@/composables/tea';`
- Mock the `useTea()` implementation: `jest.mock('@/composables/tea');`
- Add a `beforeEach()` that sets up the data and the mocks.

```typescript
beforeEach(() => {
  const { find, teas } = useTea();
  teas.value = [
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
  ];
  (find as jest.Mock).mockResolvedValue(teas.value[2]);
  jest.clearAllMocks();
});
```

Now that we are set up to get data, let's add a couple of tests. These tests show that we get the correct data, and that we then display the correct data within the correct element in the DOM.

```typescript
it('finds the tea specified in the route', async () => {
  const { find } = useTea();
  await mountView();
  expect(find).toHaveBeenCalledTimes(1);
  expect(find).toHaveBeenCalledWith(3);
});

it('renders the tea name', async () => {
  const wrapper = await mountView();
  const name = wrapper.find('[data-testid="name"]');
  expect(name.text()).toBe('Herbal');
});

it('renders the tea description', async () => {
  const wrapper = await mountView();
  const description = wrapper.find('[data-testid="description"]');
  expect(description.text()).toBe('Herbal Infusion description.');
});
```

#### Update the View

Within `src/views/TeaDetailsPage.vue` we need to do the following:

- `import { ref } from 'vue';`
- `import { useRoute } from 'vue-router';`
- `import { Tea } from '@/models';`
- `import { useTea } from '@/composables/tea';`

Within the `script` section, we know we need to use the `params` object to grab the `id`. We then need to use the `id` to `find()` the tea and return the tea so we can use it in the template.

Here is some of that in place, with a TODO for you to finish it up.

```typescript
const { params } = useRoute();
const id = parseInt(params.id as string, 10);
const tea = ref<Tea | undefined>();

// TODO:
// 1 - destructure the find() from useTea()
// 2 - use find() to find the tea based on the id
// 3 - set the tea.value
//
// Note that find() is async so you will need to deal with that in some manner.
// FWIW, using "then()" is old-school, but very clean in this case.
```

Within the view `template` we can then add the following markup. Add this inside the `ion-content`. Also, add the `ion-padding` class to the `ion-content`.

```html
<div v-if="tea">
  <div class="ion-justify-content-center" style="display: flex">
    <ion-img :src="tea.image"></ion-img>
  </div>
  <h1 data-testid="name">{{ tea.name }}</h1>
  <p data-testid="description">{{ tea.description }}</p>
</div>
```

Be sure to also update our list of components for anything new we added (this should just be `IonImg`, unless something was missed earlier). At this point, your tests should be passing without error or warning.

We should also style that image just a tad to make sure it is not too big:

```html
<style scoped>
  ion-img {
    max-width: 75%;
    max-height: 512px;
  }
</style>
```

That should complete our details page. Try it out in the browser and make sure everything works well. Try different mobile footprints via the devtools as well.

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
