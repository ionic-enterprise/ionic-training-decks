# Lab: Tea Details Page

In this lab, you will learn how to:

- Use path parameters to create dynamic routes
- Leverage path parameters within components

## Overview

The Ionic Framework supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## Create the Files

Create a new folder in `src/tea` named `details`. Within `src/tea/details` create two files: `TeaDetailsPage.tsx` and `TeaDetailsPage.test.tsx`.

Let's fill the files in with some shell code:

**`src/tea/details/TeaDetailsPage.test.tsx`**

```TypeScript
import { render, waitFor } from '@testing-library/react';
import TeaDetailsPage from './TeaDetailsPage';

describe('<TeaDetailsPage />', () => {
  it('displays the header', async () => {
    const { container } = render(<TeaDetailsPage />);
    await waitFor(() => expect(container).toHaveTextContent(/Details/));
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<TeaDetailsPage />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});
```

**`src/tea/details/TeaDetailsPage.tsx`**

```TypeScript
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const TeaDetailsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Details</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};
export default TeaDetailsPage;
```

## Adding the Details Route

Head over to `App.tsx`. We need to add an additional route inside our `<IonRouterOutlet>`:

**`src/App.tsx`**

```JSX
<IonRouterOutlet>
  <PrivateRoute exact path="/tea" component={TeaPage} />
  <PrivateRoute path="/tea/details/:id" component={TeaDetailsPage} />
  <Route exact path="/login">
    <LoginPage />
  </Route>
  <Route exact path="/">
    <Redirect to="/tea" />
  </Route>
</IonRouterOutlet>
```

With a little URL hacking you should be able to navigate to this page, but you will need to supply an ID like this: `/tea/details/1`. Pretty neat!

## Update the Teas page

The tea category detail route has been defined but our application has no idea how to navigate to it. So let's add the child page to the application's routing flow by navigating the user to the child page upon clicking one of the tea category cards.

Modify the `<IonCard>` component in `TeaPage.tsx` by adding the following props:

**`src/tea/TeaPage.tsx`**

```JSX
<IonCard button onClick={() => showDetailsPage(tea.id)}>
```

The `button` prop which adds some styling to the card, making it behave in a "clickable" fashion.

Next let's define `showDetailsPage()`. Add the following code below the `useEffect` block:

```TypeScript
const TeaPage: React.FC = () => {
  ...
  const showDetailsPage = (id: number) => {
    history.push(`/tea/details/${id}`);
  }
  ...
};
export default TeaPage;
```

Notice that we're calling `history.push()` whereas we've seen `history.replace()`. When signing a user in or signing a user out, we want to replace the entire history stack (so they can't go back to an invalid application state). In this case however, we want to push a new route onto the stack so the application user can go back to our tea page if they desire.

Now when we click on a card we should go to the tea category detail page and the path should include the ID of the specific tea category.

## The Tea Details Page

### Reading the ID Parameter

We need a way to fetch the `:id` path parameter so that our child page can retrieve information for the correct tea category. We can grab this using React Router's `useParams` hook.

Open `TeaDetailsPage.tsx` and make the following adjustments:

**`src/tea/details/TeaDetailsPage.tsx`**

```TypeScript
import { ... } from '@ionic/react';
import { useParams } from 'react-router';

const TeaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
   ...
  );
};
export default TeaDetailsPage;
```

Now that we know how the `useParams()` hook works, let's go ahead and mock it in our test file:

**`src/tea/details/TeaDetailsPage.test.tsx`**

```TypeScript
...
jest.mock('react-router', () => ({
  useParams: () => ({
    id: 1,
  }),
}));

describe('<TeaDetailsPage />', () => {
  ...
});
```

### Navigating Back

We also need a way for application users to navigate back, otherwise our application users will be stuck (unless they are on a device that has a back button)! Let's fix that:

1. Go to the <a href="https://ionicframework.com/docs/api/back-button" target="_blank">IonBackButton documentation</a>
2. Take a look at the React Usage example, the first one is marked "Default back button"
3. **Challenge:** Try adding the appropriate mark-up from there to `<TeaDetailsPage />`.

If you were already on the child page when you did this, then you did not see a back button. This is because when the page refreshed, the navigation stack was destroyed. If your app needs to still display the back button even if there is no navigation stack (for example, if you are going to deploy to the web where someone _could_ directly go to the tea category details page via a link), use the `defaultHref` property.

### Displaying the Data

We know that we want to fetch the details of the tea with the ID specified in our URL path. We also know that we can use `useEffect()` to run logic when state changes; therefore we should write a `useEffect()` that fetches the details of a tea when `id` changes:

**`src/tea/details/TeaDetailsPage.tsx`**:

```TypeScript
import { ... } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Tea } from '../../shared/models';
import { useTea } from '../useTea';

const TeaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTeaById } = useTea();
  const [tea, setTea] = useState<Tea | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      const tea = await getTeaById(parseInt(id, 10));
      setTea(tea);
    };
    init();
  }, [id, getTeaById]);

  return (
    ...
  );
};
export default TeaDetailsPage;
```

Our tests don't know how to handle calling `getTeaById` so let's fix that:
**`src/tea/details/TeaDetailsPage.test.tsx`**

```TypeScript
...
jest.mock('react-router', () => ({
 ...
}));
const mockTea = expectedTeas[0];
jest.mock('../useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(),
    getTeaById: jest.fn(() => Promise.resolve(mockTea)),
  }),
}));

describe('<TeaDetailsPage />', () => {
  ...
});
```

Once complete, let's write some additional unit tests to ensure that the content we want to display properly renders in our tea details page:

```TypeScript
describe('<TeaDetailsPage />', () => {
  ...
  it('renders the tea name', async () => {
    const { container } = render(<TeaDetailsPage />);
    await waitFor(() => expect(container).toHaveTextContent(mockTea.name));
  });

  it('renders the tea description', async () => {
    const { container } = render(<TeaDetailsPage />);
    await waitFor(() => expect(container).toHaveTextContent(mockTea.description));
  });
});
```

Add the following markup right before the closing `</IonContent>` tag:

```JSX
<div className="ion-padding">
  <div className="ion-justify-content-center">
    <IonImg src={tea?.image} />
  </div>
  <h1>{tea?.name}</h1>
  <p>{tea?.description}</p>
</div>
```

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
