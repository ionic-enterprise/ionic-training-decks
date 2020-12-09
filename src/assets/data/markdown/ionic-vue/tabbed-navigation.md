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

Add a couple of simple tests for the views that were just created. Create them under `tests/unit/views` using the same naming convension that we have been using already. Use the following as a template. For the About page you can simplify that even further as we will not need to use the store in the About page.

```TypeScript
let tea: Tea;
import { mount, VueWrapper } from '@vue/test-utils';
import TastingNotes from '@/views/TastingNotes.vue';
import store from '@/store';

describe('TastingNotes.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    store.dispatch = jest.fn();
    wrapper = mount(TastingNotes, {
      global: {
        plugins: [store],
      },
    });
  });

  it('displays the title', () => {
    const titles = wrapper.findAllComponents('ion-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('Tasting Notes');
  });
});
```

## Tabs

Tabs are one of two very common navigation syles within native applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page. Each tab will contain a set of stacked pages. We have this stacked paradigm right now with the `TeaDetails` page rendering stacked on top of the `TeaList` page. This same idea carries over to tabbed navigation only each tab will have its own stack.

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

Have a look at the documentation on <a href="https://ionicframework.com/docs/vue/navigation#shared-urls-versus-nested-routes" target="_blank">Shared URLs vs. Nested Routes</a>. We currently have an example of using shared URLs in our routes. Have a look at the routes for the `TeaList` and the `TeaDetails` pages.

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

Here is what the routes will look like with the tabs in place:

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
        redirect: 'teas',
      },
      {
        path: 'teas',
        name: 'Tea List',
        component: () => import('@/views/TeaList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/teas/tea/:id',
        name: 'Tea Details',
        component: () => import('@/views/TeaDetails.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasting-notes',
        name: 'Tasting Notes',
        component: () => import('@/views/TastingNotes.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];
```

A few things to note about this:

- The main route (the one '/' redirects to) is now `/tabs/teas`.
- The following routes are rendered in the main router outlet: `/login` and `/tabs/`.
- The `/tabs/` route contins child (nested) routes, which per the docs requires a child router outlet in which to render the child pages. The `IonTabs` component in the `Tabs` page provides that.
- The `Tea Details` and `Tea List` routes are still "shared URL" routes.
- The `TeaList` page is now lazy loaded, so it should not be imported at the top of the file.
- The `Tabs` page is not lazy loaded, so it should be imported at the top of the file.

After making these modifications, try the navigation in your app. Examine the DOM with the devtools and look for the child router outlet. Observe how the different pages are rendered within the DOM.

## Conclusion

Congratulations, you have just expanded your application to use tabs based routing.
