# Lab: Add Application Tabs

In this lab you will:

- Create some shell pages
- Create a tabbed navigation page and add it to your application
- Rework the routing so the pages draw in the router outlet for the tabs

## Create New Pages

If we are going to have multiple tabs, we are going to need a place to navigate to. For now, we will just navigate to some blank starter pages. Let's create those now. Add two files: `src/views/About.vue` and `src/views/TastingNotes.vue`. The contents of these files should look like this:

```HTML
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tasting Notes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content></ion-content>
  </ion-page>
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
  name: 'TastingNotes',
  components: { IonContent, IonHeader, IonPage, IonTitle, IonToolbar },
});
</script>

<style scoped></style>
```

Adjust the name and the `ion-title` based on the page. Do not worry about adding routes for these pages yet. We will address that in a bit.

Add a couple of simple tests for the views that were just created. Create them under `tests/unit/views` using the same naming convention that we have been using already. Use the following as a template. For the About page you can simplify that even further as we will not need to use the store in the About page.

```TypeScript
import TastingNotes from '@/views/TastingNotes.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';

describe('TastingNotes.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<typeof TastingNotes>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TastingNotes }],
    });
    router.push('/');
    await router.isReady();
    return mount(TastingNotes, {
      global: {
        plugins: [router],
      },
    });
  };

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('Tasting Notes');
  });
});
```

## Tabs

Tabs is one of two very common navigation paradigms within native applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page. Each tab will contain a set of stacked pages. We have the stacked paradigm right now with the `TeaDetails` page rendering stacked on top of the `TeaList` page. This same idea carries over to tabbed navigation only each tab will have its own stack.

This application will have a small number of distinct sections, so tabs make the most sense.

### Lay Out the Tabs Page

Create a `src/views/Tabs.vue` file with the following contents:

```TypeScript
<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="teas" href="/tabs/teas">
          <ion-label>Tea</ion-label>
          <ion-icon :icon="leaf"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="tasting-notes" href="/tabs/tasting-notes">
          <ion-label>Tasting Notes</ion-label>
          <ion-icon :icon="documentText"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="about" href="/tabs/about">
          <ion-label>About</ion-label>
          <ion-icon :icon="informationCircle"></ion-icon>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue';
import { leaf, documentText, informationCircle } from 'ionicons/icons';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Tabs',
  components: {
    IonIcon,
    IonLabel,
    IonPage,
    IonTabBar,
    IonTabButton,
    IonTabs,
  },
  setup() {
    return { documentText, informationCircle, leaf };
  },
});
</script>

<style scoped></style>
```

This page will be rendered with a row of tabs on the bottom of the page. The top portion of the page contains a router outlet that will be used to render the pages displayed by the individual tabs.

### Update the Routes

Have a look at the documentation on <a href="https://ionicframework.com/docs/vue/navigation#shared-urls-versus-nested-routes" target="_blank">Shared URLs vs. Nested Routes</a>. Here is what we currently have for our routes. Note that we currently have an example of using shared URLs in our routes. When we add the tabs, we will also have some nested routes.

```TypeScript
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/teas',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/teas',
    name: 'Tea List',
    component: TeaList,
    meta: { requiresAuth: true },
  },
  {
    path: '/teas/tea/:id',
    name: 'Tea Details',
    component: () => import('@/views/TeaDetails.vue'),
    meta: { requiresAuth: true },
  },
];
```

What we will do here is:

- Add the tabs route
- Move the "Tea List" and "Tea Details" routes to be children of the tabs route
- Add the "About" and "Tasting Notes" as children of the tabs route
- Fix up the redirects as the route to the tea list page is different

Let's do this one step at a time. First, create the `tabs` route as such:

```TypeScript
import Tabs from '../views/Tabs.vue';
...
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/teas',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/tabs/',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: '/tabs/teas',
      },
    ],
  },
  // The "Tea List" and "Tea Details" routes are still here at this point
  // They are just not shown
  // Do not delete them, you will need to move them shortly
];
```

With that in place, do the following (try to do this withoug looking at the finished product in the conclusion):

1. Move the "Tea List" and "Tea Details" routes to be within the `children` array of the "Tabs" route.
1. Remove the starting '/' from the "Tea List" and "Tea Details" routes (example: `path: 'teas',`).
1. Make the "Tea List" route lazy loaded (use "Tea Details" as a model), at which point you can remove the import of the `TeaList` component.
1. Using "Tea List" as a model, create routes for the "About" and "Tasting Notes" pages. They shall also be lazy loaded.
1. Change the '/' redirect to be '/tabs/teas' instead of '/teas'.

A few things to note about this:

- The following routes are rendered in the main router outlet: `/login` and `/tabs/`.
- The `/tabs/` route contins child (nested) routes, which per the docs requires a child router outlet in which to render the child pages. The `IonTabs` component in the `Tabs` page provides that.
- The `TeaList` page is now lazy loaded, so it should not be imported at the top of the file.
- The `Tabs` page is not lazy loaded, so it should be imported at the top of the file.

You will also have to modify a couple of the pages to compensate for the change:

- in `tests/unit/views/TeaList.spec.ts` find the 'goes to the tea details page when a tea card is clicked' test and change the expected route from `/teas/tea/4` to `/tabs/teas/tea/4`
- modify the code in `src/views/TeaList.vue` accordingly
- modify the `defaultHref` for the back button in the `TeaDetails` view to be `/tabs/teas`

After making all of these modifications, try the navigation in your app. Examine the DOM with the devtools and look for the child router outlet. Observe how the different pages are rendered within the DOM. Be sure to try this:

1. Click on a card in the Teas tab to open the Tea Details page.
1. Click on the About or Tasting Notes tab.
1. Click on the Tea tab again. Notice that the Tea Details page is still showing. Each tab has its own navigation stack, and the stack persists as you go from tab to tab.

## Conclusion

Congratulations, you have just expanded your application to use tabs based routing.

In case you need it, here are the full set of routes:

```TypeScript
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/teas',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/tabs/',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: '/tabs/teas',
      },
      {
        path: 'teas',
        name: 'Tea List',
        component: () => import('@/views/TeaList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'teas/tea/:id',
        name: 'Tea Details',
        component: () => import('@/views/TeaDetails.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasting-notes',
        name: 'Tasting Notes',
        component: () => import('@/views/TastingNotes.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];
```
