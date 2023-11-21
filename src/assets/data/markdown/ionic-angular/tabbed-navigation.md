# Lab: Add Application Tabs

In this lab you will:

- Create some shell pages
- Create a tabbed navigation page and add it to your application
- Rework the routing so the pages draw in the router outlet for the tabs

## Pre-Work - Create Main Pages

If we are going to have multiple tabs, we are going to need a place to navigate to. For now, we will just navigate to some blank starter pages. Let's create those now:

```bash
ionic generate page about
ionic generate page tasting-notes
```

This will add routes to the `src/app/app.routes.ts` file:

```typescript
      {
        path: 'tasting-notes',
        loadComponent: () => import('./tasting-notes/tasting-notes.page').then((c) => c.TastingNotesPage),
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.page').then((c) => c.AboutPage),
      },
```

## Tabs

Tabs are one of two very common navigation styles within native applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page. Each tab will contain a set of stacked pages. We have this stacked paradigm right now with the `TeaDetailsPage` rendering stacked on top of the `TeaPage`. This same idea carries over to tabbed navigation only each tab will have its own stack.

This application will have a small number of distinct sections, so a tabbed layout make the most sense.

### Lay Out the Tabs Page

Before we go any further, we should create the tabs page itself and see how it looks.

```bash
 ionic generate page tabs
```

At this point, we can go to the tabs page by manually setting the route via the URL (example: `http://localhost:4200/tabs`) and we can see that the page is not all that interesting yet. Let's fix that now. Remove everything that is currently in `src/app/tabs/tabs.page.html` and replace it with the following markup:

```html
<ion-tabs>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="tea">
      <ion-label>Tea</ion-label>
      <ion-icon name="leaf"></ion-icon>
    </ion-tab-button>
    <ion-tab-button tab="tasting-notes">
      <ion-label>Tasting Notes</ion-label>
      <ion-icon name="document-text"></ion-icon>
    </ion-tab-button>
    <ion-tab-button tab="about">
      <ion-label>About</ion-label>
      <ion-icon name="information-circle"></ion-icon>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
```

This will cause the test to start failing. The easiest way to fix that is to provide the router, though we don't need any actual routes.

Modify `src/app/tabs/tabs.page.spec.ts` as such:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
...
```

### Routing

The `TabsPage` renders in the `AppComponent`'s router outlet, which is where we want it. However, we want most of our individual pages to render within the `TabsPage`'s router outlet.

This will involve two main files: `src/app/app.routes.ts` and `src/app/tabs/tabs.routes.ts`. Let's refactor our routes one step at a time, testing in the browser with each change.

#### Step 1: Update the Tabs Route

Create a file named `src/app/tabs/tabs.routes.ts` with the following contents:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [authGuard],
  },
];
```

In the `app-routing.module.ts` file there is a redirect for the "empty" route (`path: ''`). It currently redirects to the tea page. Change it to redirect to the tabs page:

```typescript
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
```

Change the existing route for the tabs page to call `loadChildren()` rather than calling `loadComponent()` and to load the newly created `tabs.routes.ts` file rather than the tabs page:

```typescript
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
```

One important concept to keep in mind here is that we _can_ define all of our routes in one location, or we can define routes in a nested fashion when that makes sense. Use the strategy that makes sense for your application. This application is smaller and the only nesting level exists at the `TabsPage` level.

At this point, if you reload from root (ex: `http://localhost:4200`), you should be automatically redirected to the tabs page.

#### Step 2: Move the Child Pages

The following pages should be child pages of the `TabsPage` so they will render in the `TabsPage` route: `AboutPage`, `TastingNotesPage`, and `TeaPage`.

Move those routes from `src/app/app.routes.ts` to `src/app/tabs/tabs.routes.ts`. When you do this, you will need to place them in a `children` array under the main route, and you will need to adjust the relative paths to the lazy loaded modules.

Here is what your tabs routing module should look like at this point:

```typescript
import { NgModule } from '@angular/core';
import { authGuard } from '@app/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'about',
        loadComponent: () => import('../about/about.page').then((c) => c.AboutPage),
      },
      {
        path: 'tasting-notes',
        loadComponent: () => import('../tasting-notes/tasting-notes.page').then((c) => c.TastingNotesPage),
      },
      {
        path: 'tea',
        loadComponent: () => import('../tea/tea.page').then((c) => c.TeaPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tea',
        pathMatch: 'full',
      },
    ],
  },
];
```

Since the `authGuard` is defined for the `tabs` route, we don't need to have it on the `children` so we can remove it as we move the other routes.

If you click on the tabs at the bottom of the page, you should load each individual page. Magic!! 🌈🦄🤓

#### Step 3: Move the Details Page

Click on the "Tea" tab and then click on a tea panel. The `TeaDetailsPage` is displayed but it is not rendered in the tabs page. Rather it is rendered in the root router outlet. Not so magical... 🌧

This page should really be a route under the `TeaPage`, so let's move it to the `src/app/tabs/tabs.routes.ts` file and add it as a sibling of the main route that is defined there. That routing file should now look like this:

```typescript
    children: [
      {
        path: 'about',
        loadComponent: () => import('../about/about.page').then((c) => c.AboutPage),
      },
      {
        path: 'tasting-notes',
        loadComponent: () => import('../tasting-notes/tasting-notes.page').then((c) => c.TastingNotesPage),
      },
      {
        path: 'tea',
        loadComponent: () => import('../tea/tea.page').then((c) => c.TeaPage),
      },
      {
        path: 'tea/tea-details/:id',
        loadComponent: () => import('../tea-details/tea-details.page').then((c) => c.TeaDetailsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tea',
        pathMatch: 'full',
      },
    ],
```

Now we need to adjust the routes for the navigation in the `TeaPage`. In the `TeaPage` test, find the "passes the details page and the ID" test. Add the new items to the route as noted below.

```typescript
it('passes the details page and the ID', () => {
  const navController = TestBed.inject(NavController);
  click(card);
  expect(navController.navigateForward).toHaveBeenCalledWith(['tabs', 'tea', 'tea-details', teas[2].id]);
});
```

Now go change the `TeaPage` source accordingly so the test will pass. Try it in the browser. Now when you click on a tea, the details page shows stacked in the tea tab. Nice! 🎉

#### Step 4: Redirects and Other Details

Notice that we added the following redirect as we created the child routes under `tabs`:

```typescript
  {
    path: '',
    redirectTo: 'tabs/tea',
    pathMatch: 'full',
  },
```

If you remove this redirect and then load the application from the root location, the app will just load the tabs page and not one of the tabs. The redirect was added so we load the proper tab on launch.

One other minor detail is in the markup for the `TeaDetailsPage`. The `defaultHref` for the `ion-back-button` needs to point to the `tabs/tea` route now, and not just the `tea` route.

Finally, we've been coding a lot, and unless you have been pushing your commits somewhere you likely have not been linting your code at all. Run an `npm run lint` here and clean up any errors you may have.

## Conclusion

Congratulations, you have just expanded your application to use tabs based routing.
