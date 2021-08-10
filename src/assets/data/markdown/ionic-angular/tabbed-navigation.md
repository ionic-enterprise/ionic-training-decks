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

Once those pages have been generated, be sure to open each of their routing modules and add our Auth Guard to their base routes. For example:

```typescript
  {
    path: '',
    component: AboutPage,
    canActivate: [AuthGuardService],
  },
```

Also, open the test for each page and remove the `forRoot()` from the `IonicModule` import in the `TestBed` configuration object.

## Tabs

Tabs are one of two very common navigation styles within native applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page. Each tab will contain a set of stacked pages. We have this stacked paradigm right now with the `TeaDetailsPage` rendering stacked on top of the `TeaPage`. This same idea carries over to tabbed navigation only each tab will have its own stack.

This application will have a small number of distinct sections, so tabs make the most sense.

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

This will cause the test to start failing. The easiest way to fix that is to remove the `IonicModule` import and just use Angular's `CUSTOM_ELEMENT_SCHEMA`. This is OK because we aren't really going to be testing the tabs any further than the basic test. Our other option would be to mock out several dependencies, and that is a lot of work for no gain in this case.

Modify `src/app/tabs/tabs.page.spec.ts` as such:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
...
```

### Routing

The `TabsPage` renders in the `AppComponent`'s router outlet, which is where we want it. However, we want most of our individual pages to render within the `TabsPage`'s router outlet.

This will involve two main files: `src/app/app-routing.module.ts` and `src/app/tabs/tabs-routing.module.ts`. Let's refactor our routes one step at a time, testing in the browser with each change.

#### Step 1: Make Tabs the Default Route

In the `app-routing.module.ts` file there is a redirect for the "empty" route (`path: ''`). It currently redirects to the tea page. Change it to redirect to the tabs page:

```typescript
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
```

At this point, if you reload from root (ex: `http://localhost:4200`), you should be automatically redirected to the tabs page.

#### Step 2: Move the Child Pages

The following pages should be child pages of the `TabsPage` so they will render in the `TabsPage` route: `AboutPage`, `TastingNotesPage`, and `TeaPage`.

Move those routes from `app-routing.module.ts` to `tabs-routing.module.ts`. When you do this, you will need to place them in a `children` array under the main route, and you will need to adjust the relative paths to the lazy loaded modules.

Here is what your tabs routing module should look like at this point:

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'about',
        loadChildren: () => import('../about/about.module').then((m) => m.AboutPageModule),
      },
      {
        path: 'tasting-notes',
        loadChildren: () => import('../tasting-notes/tasting-notes.module').then((m) => m.TastingNotesPageModule),
      },
      {
        path: 'tea',
        loadChildren: () => import('../tea/tea.module').then((m) => m.TeaPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
```

If you click on the tabs at the bottom of the page, you should load each individual page. Magic!! 🌈🦄🤓

#### Step 3: Move the Details Page

Click on the the "Tea" tab and then click on a tea panel. The `TeaDetailsPage` is displayed but it is not rendered in the tabs page. Rather it is rendered in the root router outlet. Not so magical... 🌧

This page should really be a route under the `TeaPage`, so let's move it to the `tea-routing.module.ts` file and add it as a sibling of the main route that is defined there. That routing file should now look like this:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeaPage } from './tea.page';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: '',
    component: TeaPage,
    canActivate: [AuthGuardService],
  },
  {
    path: 'tea-details',
    loadChildren: () => import('../tea-details/tea-details.module').then((m) => m.TeaDetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaPageRoutingModule {}
```

Now we need to adjust the routes for the navigation in the `TeaPage`. In the `TeaPage` test, find the "passes the details page and the ID" test. Add the new items to the route as noted below.

```typescript
it('passes the details page and the ID', () => {
  const navController = TestBed.inject(NavController);
  component.showDetailsPage(42);
  expect(navController.navigateForward).toHaveBeenCalledWith(['tabs', 'tea', 'tea-details', 42]);
});
```

Now go change the `TeaPage` source accordingly so the test will pass. Try it in the browser. Now when you click on a tea, the details page shows stacked in the tea tab. Nice! 🎉

#### Step 4: Redirects and Other Details

If you load the application from root, it will go to the `tabs` route, but we really need it to display one of the pages. The `tabs/tea` route makes the most sense. Modify the current redirect within `app-routing.module.ts` to go to `tabs/tea`, and add a redirect from `tabs` to `tabs/tea`.

```typescript
  {
    path: '',
    redirectTo: 'tabs/tea',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    redirectTo: 'tabs/tea',
    pathMatch: 'full',
  },
```

One other minor detail is in the markup for the `TeaDetailsPage`. The `defaultHref` for the `ion-back-button` needs to point to the `tabs/tea` route now, and not just the `tea` route.

## Conclusion

Congratulations, you have just expanded your application to use tabs based routing.
