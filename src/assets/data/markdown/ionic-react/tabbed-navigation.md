# Lab: Add Application Tabs

In this lab you will:

- Create some shell pages
- Create a tabbed navigation page and add it to your application
- Rework the routing so the pages draw in the router outlet for the tabs

## Create New Pages

If we are going to have multiple tabs, we are going to need a place to navigate to. For now, we will just navigate to some blank starter pages. Let's create those now. Add two files: `src/about/AboutPage.tsx` and `src/notes/TastingNotesPage.tsx`. The contents of these files should look like this:

```tsx
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const AboutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
};
export default AboutPage;
```

Adjust the component name and the title based on the page. Do not worry about adding routes for these pages yet; we will address that in a bit.

Add a couple of simple tests for the pages that were just created using the same naming convention we have been using already. Use the following as a template:

```tsx
import { render } from '@testing-library/react';
import AboutPage from './AboutPage';

describe('<AboutPage />', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<AboutPage />);
    expect(baseElement).toBeDefined();
  });

  it('renders consistently', () => {
    const { asFragment } = render(<AboutPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
```

## Tabs

Tabs are one of two very common navigation paradigms within mobile applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page. Each tab will contain a set of stacked pages. We have the stacked paradigm right now with the tea details page rendering stacked on top of the tea listing page. This same idea carries over to tabbed navigation -- only each tab will have its own stack.

This application will have a small number of distinct sections, so tabs make the most sense.

### Lay Out the Tabs Page

Create a `src/Tabs.tsx` file with the following contents:

```tsx
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import { documentText, informationCircle, leaf } from 'ionicons/icons';

const Tabs: React.FC = () => {
  const { url } = useRouteMatch();

  return (
    <IonTabs>
      <IonRouterOutlet></IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="tea" href={`${url}/tea`}>
          <IonIcon icon={leaf} />
          <IonLabel>Tea</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tasting-notes" href={`${url}/tasting-notes`}>
          <IonIcon icon={documentText} />
          <IonLabel>Tasting Notes</IonLabel>
        </IonTabButton>
        <IonTabButton tab="about" href={`${url}/about`}>
          <IonIcon icon={informationCircle} />
          <IonLabel>About</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
export default Tabs;
```

This page will be rendered with a row of tabs on the bottom of the page. The top portion of the page contains a router outlet that will be used to render the pages displayed by the individual tabs.

### Update the Main Router Outlet

Our application now has two router outlets. The tab router outlet is nested within the outlet defined in `src/App.tsx`. Since we want to dedicate one of our application's tabs to the tea stack we've created, we no longer need them in the "main" router outlet.

Our "main" router outlet will consist of:

- The login page
- The tabs page
- A redirect to the tabs page from the root path (`/`)

Any other pages we've built in the app will reside within the tab router outlet.

Remove the existing `<Route />` definitions for the `/tea` and `/tea/:id` paths. In their place, add the following route definition:

```tsx
<Route path="/tabs">
  <PrivateRoute>
    <TeaProvider>
      <Tabs />
    </TeaProvider>
  </PrivateRoute>
</Route>
```

With this change, all routes residing within the tab router outlet are private and have access to the tea context. Nice!

The final change to this router is to update the redirect for the root (`/`) path:

```diff
- <Redirect to="/teas" />
+ <Redirect to="/tabs" />
```

### Update the Tab Router Outlet

Now open `src/Tabs.tsx`. The first thing we'll do is add back the routes we removed from the main router outlet:

```tsx
<IonRouterOutlet>
  <Route exact path={`${url}/tea`}>
    <TeaListPage />
  </Route>
  <Route exact path={`${url}/tea/:id`}>
    <TeaDetailsPage />
  </Route>
  <Route exact path={url}>
    <Redirect to={`${url}/tea`} />
  </Route>
</IonRouterOutlet>
```

The last route is another redirect, this time to redirect `/tabs` to `/tabs/tea`.

Let's add two new route entries for our new pages:

```diff
+ <Route exact path={`${url}/about`}>
+   <AboutPage />
+ </Route>
+ <Route exact path={`${url}/tasting-notes`}>
+   <TastingNotesPage />
+ </Route>
  <Route exact path={`${url}/tea`}>
    <TeaListPage />
  </Route>
  <Route exact path={`${url}/tea/:id`}>
    <TeaDetailsPage />
  </Route>
  <Route exact path={url}>
    <Redirect to={`${url}/tea`} />
  </Route>
```

### Navigation Cleanup

You will have to modify a couple of the pages to compensate for the change:

- In `src/tea/TeaListPage.test.tsx` find the "navigates to the details page when a tea card is clicked" test and change the expected route from `/tea/4` to `/tabs/tea/4` (the actual ID number may be different in your test).
- Modify the code in `src/tea/TeaListPage.tsx` accordingly.
- Modify the `defaultHref` for the back button in the `TeaDetailsPage` to be `/tabs/teas`.

After making all of these modifications, try the navigation in your app. Examine the DOM with the DevTools and look for the tabs router outlet. Observe how the different pages are rendered within the DOM. Be sure to try this:

1. Click on a card in the Teas tab to open the Tea Details page.
2. Click on the About or Tasting Notes tab.
3. Click on the Tea tab again. Notice that the Tea Details page is still showing. Each tab has its own navigation stack, and the stack persists as you go from tab to tab.

## Conclusion

Congratulations, you have just expanded your application to use tabs based routing.
