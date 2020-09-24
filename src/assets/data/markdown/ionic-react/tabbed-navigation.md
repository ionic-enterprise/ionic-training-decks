# Lab: Add Application Tabs

In this lab you will:

- Scaffold additional application pages
- Create a component to protect authenticated routes
- Create a tab-based navigation component and add it to your application
- Rework the routing so the pages draw in the router outlet for the tabs

## Overview

Tabs are one of two very common navigation styles within mobile applications. The other is side-menu navigation. A tabs navigation page will have a row of tabs either at the top or the bottom of the page.

This application will have a small number of distinct pages, so tab-based navigation makes the most sense.

## Pre-Work

### Create Additional Pages

If we are going to have multiple tabs, we are going to need a place to navigate to. For now, we will just navigate to some blank starter pages. Let's go ahead and create those now.

Add a new folder `src/about`. In this folder create a file for a component named `<About />`, the test file for this component, and a CSS file for this component.

Add the following code to shell out the `<About />` component:

```TypeScript
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import './About.css';

const About: React.FC = () => {
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
export default About;
```

Add a snapshot test to `About.test.tsx` to ensure it renders consistently.

Now create a new folder `src/tasting-notes` and do the same for a component named `<TastingNotes />`. Add code to `src/tasting-notes/TastingNotes.tsx` to shell it out. Add a snapshot test to the tasting notes test file.

### Protected Route Component

Right now our application has no means to prevent users from navigating to the tea or details page if they have not signed in. Serve the application and give it a try. We should fix that before adding any additional pages to the application.

Unfortuantely, React Router doesn't provide a component that only renders a component if the user is authenticated. The good news is that the `<Route />` component is composable, meaning we can create our own protected route implementation.

Create a new file in `src/components` named `ProtectedRoute.tsx` and fill it with the following:

```TypeScript
import React, { useContext } from 'react';
import { Route, Redirect, RouteProps } from 'react-router';
import { AuthContext } from '../auth/AuthContext';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated } = useContext(AuthContext);

  return ( <Route {...rest} render={props =>
    isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
  } />);
};
```

`<ProtectedRoute />` satisfies the following requirements:

- It has the same API as `<Route />`
- It renders a `<Route />` and passes all the props through to it
- It checks to see if the user is authenticated.
  - If they are, it renders the `component` prop.
  - Otherwise, it redirects the user to the login page.

Add this export to the barrel file in `src/components`.

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

Create a new file `src/components/Tabs.tsx` and fill it in with the following code:

```TypeScript
import React from 'react';
import { IonRouterOutlet, IonTabBar, IonTabs } from '@ionic/react';

export const Tabs: React.FC<RouteComponentProps> = ({ match }) => (
  <IonTabs>
    <IonRouterOutlet>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
    </IonTabBar>
  </IonTabs>
);
```

Add `<Tabs />` to the `src/components` barrel file.

### Routes

Open `App.tsx` and replace the routes inside `<IonRouterOutlet>` with the following:

```JSX
<Route exact path="/login" component={Login} />
<ProtectedRoute path="/tabs" component={Tabs} />
<Route exact path="/" render={() => <Redirect to="/login" />} />
```

Serve the application and sign out if you are signed in. Replace the `/login` portion of the URL so that it is just `/` (our default route). Our `<ProtectedRoute />` component takes you straight to the login page. Nice! Sign in, then change the URL so that the path is `/tabs`. You should see any empty-ish screen.

We want to move all routes so that authenticated (protected) paths begin with `/tabs`:

- `/tea` becomes `/tabs/tea`
- `/tea/details/:id` becomes `/tabs/tea/details/:id`
- ...and so on

However, `/login` will remain `/login` (since the login page will not be accessible via the tab bar).

Now open `Tabs.tsx` back up so we can add our tab-based routes. Place the following code inside `<IonRouterOutlet />`:

```JSX
<Route exact path={match.url} render={() => <Redirect to={`${match.url}/tea`} />} />
<ProtectedRoute exact path={`${match.url}/tea`} component={TeaList} />
<ProtectedRoute exact path={`${match.url}/about`} component={About} />
<ProtectedRoute exact path={`${match.url}/tasting-notes`} component={TastingNotes} />
<ProtectedRoute path={`${match.url}/tea/details/:id`} component={TeaDetails} />
```

An Ionic Framework application can have multiple `<IonRouterOutlet />` components:

- The `path` property is always absolute. It appears that we have have nested router outlets, but we still need to provide the full path.
- `match.url` will return the current path. For our purposes, this will always be `/tabs`. However, if you change this value in `App.tsx` you won't need to change each route above.
- When navigating from `/tabs/tea` to `/tabs/tea/details/:id` there will be an animation as if the navigation is stacked. When navigation from tab-to-tab there is no animation, just as you'd observe with natively built apps.

Oh yeah, we also added our new pages - and each route is protected!

### Tab Bar

Now it's time to fill out the `<IonTabBar />` component:

```JSX
...
<IonTabBar slot="bottom">
  <IonTabButton tab="tea" href={`${match.url}/tea`}>
    <IonIcon icon={leaf} />
    <IonLabel>Tea</IonLabel>
  </IonTabButton>
  <IonTabButton tab="tasting-notes" href={`${match.url}/tasting-notes`}>
    <IonIcon icon={documentText} />
    <IonLabel>Tasting Notes</IonLabel>
  </IonTabButton>
  <IonTabButton tab="about" href={`${match.url}/about`}>
    <IonIcon icon={informationCircle} />
    <IonLabel>About</IonLabel>
  </IonTabButton>
</IonTabBar>
...
```

Our application now has tab-based navigation! Go ahead and switch back and forth between tabs.

Click the Tea tab and click any of the cards. Oops...

## Navigation Cleanup

There's two places we need to cleanup navigation, it's not such a heavy lift.

1. Open `src/tea/list/TeaList.tsx` and edit `/tea/details/${id}` to be `/tabs/tea/details/${id}`.
2. Open `src/login/Login.tsx` and edit `/tea` to be `/tabs`.

_Now_ we have fully functioning tab-based navigation!

## Conclusion

Congratulations, you have just expanded your application to use tab-based routing! Next, we're going to implement the tasting notes feature.
