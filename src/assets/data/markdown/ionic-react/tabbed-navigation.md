# Lab: Add Application Tabs

In this lab you will:

- Scaffold additional application pages
- Create a tab-based navigation component and add it to your application
- Rework the routing so the pages draw in the router outlet for the tabs

## Overview

Tabs are one of two very common navigation styles within mobile applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page.

This application will have a small number of distinct pages, so tab-based navigation makes the most sense.

## Pre-Work

### Create Additional Pages

If we are going to have multiple tabs, we are going to need places to navigate to. Add two new folders, `src/about` and `src/tasting-notes`.

Within `src/about` add two new files: `AboutPage.tsx` and `AboutPage.test.tsx`.

**`src/about/AboutPage.tsx`**

```TypeScript
import { IonPage, IonHeader, IonTitle, IonToolbar, IonContent } from '@ionic/react';

const AboutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">About</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};
export default AboutPage;
```

**`src/about/AboutPage.test.tsx`**

```TypeScript
import { render } from '@testing-library/react';
import AboutPage from './AboutPage';

describe('<AboutPage />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<AboutPage />);
    expect(asFragment).toMatchSnapshot();
  });
});
```

Now create two new files within `src/tasting-notes`: `TastingNotesPage.tsx` and `TastingNotesPage.test.tsx` and shell out these files the way we did for the about page. The page's component name should be `TastingNotesPage`.

## Tab-Based Navigation

We can leverage the `<IonTabs />` component in such a way that will define the routes that belongs to it's tabs and create the look-and-feel of the tab bar:

```JSX
<IonTabs>
  <IonRouterOutlet>
    {/* Routes defined here */}
  </IonRouterOutlet>
  <IonTabBar>
    {/* Tabs UI defined here */}
  </IonTabBar>
</IonTabs>
```

Take a moment to look at the <a href="https://ionicframework.com/docs/api/tabs" target="_blank">Ionic Tabs documentation</a> and familiarize yourself with the components used in the creation of a tab bar.

Create a new file `src/Tabs.tsx` and fill it in with the following code:

**`src/Tabs.tsx`**

```TypeScript
import React from 'react';
import { Redirect, Route, useRouteMatch } from 'react-router';
import { IonRouterOutlet, IonTabBar, IonTabs } from '@ionic/react';

const Tabs: React.FC = () => {
  const { url } = useRouteMatch();

  return (
    <IonTabs>
      <IonRouterOutlet></IonRouterOutlet>
      <IonTabBar slot="bottom"></IonTabBar>
    </IonTabs>
  );
};
export default Tabs;

```

### Routes

Open `App.tsx` and replace the routes inside `<IonRouterOutlet>` with the following:

```JSX
<Route exact path="/login">
  <LoginPage />
</Route>
<Route path="/tabs">
  <PrivateRoute>
    <TeaProvider>
      <Tabs />
    </TeaProvider>
  </PrivateRoute>
</Route>
<Route exact path="/">
  <Redirect to="/login" />
</Route>
```

Remove `<TeaProvider />` from `App.tsx`. We will move it into `<Tabs />`.

Sign out of the application if you are signed in. Replace the `/login` portion of the URL so that it is just `/` (our default route). Sign in, then change the URL so that the path is `/tabs`. You should see any empty-ish screen.

We want to move all routes so that authenticated (protected) paths begin with `/tabs`:

- `/tea` becomes `/tabs/tea`
- `/tea/details/:id` becomes `/tabs/tea/details/:id`
- ...and so on

However, `/login` will remain `/login` (since the login page will not be accessible via the tab bar).

Now open `Tabs.tsx` back up so we can add our tab-based routes. Place the following code inside `<IonRouterOutlet />`:

```JSX
<Route exact path={url}>
  <Redirect to={`${url}/tea`} />
</Route>
<Route exact path={`${url}/tea`}>
  <TeaPage />
</Route>
<Route path={`${url}/tea/details/:id`}>
  <TeaDetailsPage />
</Route>
<Route exact path={`${url}/tasting-notes`}>
  <TastingNotesPage />
</Route>
<Route exact path={`${url}/about`}>
  <AboutPage />
</Route>
```

An Ionic Framework application can have multiple `<IonRouterOutlet />` components:

- The `path` property is always absolute. It appears that we have have nested router outlets, but we still need to provide the full path.
- `match.url` will return the current path. For our purposes, this will always be `/tabs`. However, if you change this value in `App.tsx` you won't need to change each route above.
- When navigating from `/tabs/tea` to `/tabs/tea/details/:id` there will be an animation as if the navigation is stacked. When navigation from tab-to-tab there is no animation, just as you'd observe with natively built apps.

Oh yeah, we also added our new pages - and each route is protected!

### Tab Bar

Now it's time to fill out the `<IonTabBar />` component:

**`src/Tabs.tsx`**

```JSX
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
```

Our application now has tab-based navigation! Go ahead and switch back and forth between tabs.

Click the tea tab and click any of the cards. Oops...

## Navigation Cleanup

There's three places we need to cleanup navigation, it's not such a heavy lift.

1. Open `src/tea/TeaPage.tsx` and edit `/tea/details/${id}` to be `/tabs/tea/details/${id}`.
2. Open `src/login/LoginPage.tsx` and edit `/tea` to be `/tabs`.
3. Open `src/tea/details/TeaDetails.tsx` and edit `/tea` to be `/tabs/tea`.

_Now_ we have fully functioning tab-based navigation!

## Conclusion

Congratulations, you have just expanded your application to use tab-based routing! Next, we're going to implement the tasting notes feature.
