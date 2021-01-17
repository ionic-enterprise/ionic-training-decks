# Lab: Tea Details Page

In this lab, you will:

- add a child page to the application
- set up the navigation to and from the child page

## Stacked Navigation

Ionic supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more inforamtion to it later.

## Starting Code

Let's start with some fairly boilerplate starting code for a page.

First the test in `tests/unit/views/TeaDetails.spec.ts`

```TypeScript
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import store from '@/store';
import TeaDetails from '@/views/TeaDetails.vue';

describe('TeaDetails.vue', () => {
  let router: any;
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    store.dispatch = jest.fn();
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TeaDetails }],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(TeaDetails, {
      global: {
        plugins: [router, store],
      },
    });
  });

  it('renders', () => {
    const header = wrapper.findComponent('ion-header');
    const content = wrapper.findComponent('ion-content');
    expect(header.exists()).toBe(true);
    expect(content.exists()).toBe(true);
  });
});
```

Then the page itself in `src/views/TeaDetails.vue`

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

<script lang="ts">
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TeaDetails',
  components: { IonContent, IonHeader, IonTitle, IonToolbar },
});
</script>

<style scoped></style>
```

## Navigating

Now that we have a details page, let's set up the navigation to the page and then back again. The first thing we should do is set up the route to the page. From URL perspective, it makes sense that the page should be a child to the `/teas` route. Also, since we will be displaying a particular tea it makes sense that the tea's ID should be part of the route. Add the following route in the `src/router/index.ts` file:

```TypeScript
  {
    path: '/teas/tea/:id',
    name: 'Tea Details',
    component: () => import('@/views/TeaDetails.vue'),
    meta: { requiresAuth: true },
  },
```

We want to navigate from the `TeaList` page to the `TeaDetails` page. A logical choice for the trigger is to use a click on the tea's card to start the navigation. Let's write a test for that in `tests/unit/views.TeaList.spec.ts`.

```TypeScript
  it('goes to the tea details page when a tea card is clicked', () => {
    const cards = wrapper.findAllComponents('ion-card');
    router.push = jest.fn();
    cards[3].trigger('click');
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/teas/tea/4');
  });
```

Based on how we have the test set up, we know we should have seven `ion-card` elements, and we know what order they will be displayed in since we are controlling the state. Our test triggers a click on the 4th card and expects the proper `router.push()` call to occur.

Now that we have a failing test, let's make that click occur in the `TeaList.vue` file.

```HTML
<ion-card button @click="$router.push(`/teas/tea/${tea.id}`)">
```

If we click on that, we get to the details page, but we have no way to get back. Let's fix that now. Add the following markup to the `TeaDetails.vue` file. Add it within the `ion-toolbar`.

```html
<ion-buttons slot="start">
  <ion-back-button />
</ion-buttons>
```

Be sure to update the `components` object appropriately where we define the component. What will happen here is that when we navigate from the `TeaList` page to the `TeaDetails` page, the current `IonRouterOutlet` creates a navigation stack and knows that we have a page to go back to. It thus renders a back button in the toolbar for us (remember, iOS has no hardware backbutton so you need to deal with this in software).

What happens if we refresh while we are on the details page? We no longer have the back button because there is no stack, only this page. However, we know we want to go to the `TeaList` page, so we can set a default on the back button:

```html
<ion-back-button defaultHref="/teas" />
```

Try reloading the details page again. There are two real-world scenarios where you will need to take something like this in to account:

- you are deploying to the web
- you are deploying natively but allowing deep linking to the child page

In other cases this is less important because you should always have a valid navigation stack.

## Display the Tea

Now that we have the navigation in place, let's grab the tea and display it.

First we need to noodle out what our main test setup in `tests/unit/view/TeaDetails.spec.ts` should look like. We know that we will need to do the following:

- get the `id` parameter from our route
- call the `find` getter from the `teas` store module to find the proper tea

Luckily, the `router` and `store` setup are already in our `beforeEach()`, so let's just modify it slightly to define the route properly when we create the router. We will also need to ensure our tea store has data we can find.

```typescript
...
import { Tea } from '@/models';
...
  let tea: Tea;

  beforeEach(async () => {
    tea = {
      id: 4,
      name: 'Purple Tea',
      description: 'Is this actually a thing?',
      image: '/assets/img/nope.jpg',
    };
    store.commit('teas/SET', [tea]);
    ...
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/teas/tea/:id', component: TeaDetails }],
    });
    router.push('/teas/tea/4');
    ...
  });
```

**Note:** some of the above is new code and some is chaning existing code, so don't just copy-paste.

Add the following code to the object we pass to the `defineComponent()` call in `TeaDetails.vue`:

```typescript
  setup() {
    const { params } = useRoute();
    const id = parseInt(params.id as string, 10);
    return { id };
  },
```

You will also need to add a couple of imports within the `script` tag:

```typescript
import { useRoute } from 'vue-router';
import { mapGetters } from 'vuex';

import { Tea } from '@/models';
```

Then we need to add a couple of computed properties:

```typescript
  computed: {
    ...mapGetters('teas', ['find']),
    tea(): Tea {
      return this.find(this.id);
    },
  },
```

What are we doing here?

- We grab the parameters from the route
- Then we parse the `id` parameter into an integer (parameters are always strings otherwise)
- The computed properties map the getter we just created and then use it to ultimately return the tea we are looking for

Our tests should be passing at this point. Switching back to them, we can add a couple more. We won't get too specific about how we render this in case we want to change things up in the future, but we will just add a couple of simple tests that show things are wired up correctly.

```typescript
it('renders the tea name', () => {
  const name = wrapper.find('[data-testid="name"]');
  expect(name.text()).toBe('Purple Tea');
});

it('renders the tea description', () => {
  const description = wrapper.find('[data-testid="description"]');
  expect(description.text()).toBe('Is this actually a thing?');
});
```

Within the view we can then add the following markup. Add this inside the `ion-content`. Also, add the `ion-padding` class to the `ion-content`.

```html
<div v-if="tea">
  <div class="ion-justify-content-center" style="display: flex">
    <ion-img :src="tea.image"></ion-img>
  </div>
  <h1 data-testid="name">{{ tea.name }}</h1>
  <p data-testid="description">{{ tea.description }}</p>
</div>
```

Be sure to also update our list of components for anything new we added (this should just be `IonImg`, unless something was missed earlier).

We should also style that image just a tad to make sure it is not too big:

```html
<style scoped>
  ion-img {
    max-width: 75%;
    max-height: 512px;
  }
</style>
```

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
