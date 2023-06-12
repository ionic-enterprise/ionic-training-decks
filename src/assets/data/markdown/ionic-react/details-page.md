# Lab: Tea Details Page

In this lab, you will:

- Add a child page to the application
- Set up navigation to and from the child page.

## Overview

Ionic supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## Starting Code

Let's start with some fairly boilerplate starting code for a page.

First the test in `src/pages/tea-details/TeaDetailsPage.test.tsx`:

```tsx
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeaDetailsPage from './TeaDetailsPage';

describe('<TeaDetailsPage />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders consistently', () => {
    const { asFragment } = render(<TeaDetailsPage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the title', () => {
    const { baseElement } = render(<TeaDetailsPage />);
    const titleELements = baseElement.querySelectorAll('ion-title');
    expect(titleELements).toHaveLength(1);
  });
});
```

Then the page itself in `src/pages/tea-details/TeaDetailsPage.tsx`:

```tsx
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const TeaDetailsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tea Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
};
export default TeaDetailsPage;
```

## Navigating

Now that we have a details page, let's set up the navigation to the page and then back again. The first thing we should do is set up the route to the page. From a URL perspective, it makes sense that the page should be a child to the `/tea` route. Also, since we will be displaying a particular tea it makes sense that the tea's ID should be part of the route.

Copy the `/tea` route in `App.tsx`. Modify it to have the following differences:

- The path will be `/tea/:id`.
- `<TeaDetailsPage />` will be the component rendered within `TeaProvider`.

**Note:** we do now have two different tea contexts, which defeats the purpose of why we created `TeaProvider` in the first place. This will be fixed in a couple of labs from now.

We want to navigate from the `TeaListPage` page to the `TeaDetailsPage` page. A logical choice for the trigger is to use a click on the tea's card to start the navigation. Let's write a test for that in `src/pages/tea/TeaListPage.test.tsx`.

```tsx
it('navigates to the details page when a tea card is clicked', async () => {
  const history = useHistory();
  const { baseElement } = render(<TeaListPage />);
  const cards = baseElement.querySelectorAll('ion-card');
  fireEvent.click(cards[3]);
  await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));
  expect(history.push).toHaveBeenCalledWith('/tea/4');
});
```

The `react-router-dom` mock (located in `__mocks__/react-router-dom.ts`) needs to be updated to spy on `history.push`:

```diff
  import { vi } from 'vitest';

  const replace = vi.fn();
+ const push = vi.fn();
+ const useHistory = vi.fn().mockReturnValue({ replace, push });

  export { useHistory };
```

Based on how we have the test set up, we know we should have seven `ion-card` elements, and we know what order they will be displayed in since we are controlling the state in the `beforeEach` block. Our test triggers a click on the 4th card and expects the proper `history.push()` call to occur.

**Note:** you may need to adjust the list a bit based on exactly what your data looks like.

Now that we have a failing test, let's make that click occur in the `src/pages/tea/TeaListPage.tsx` file.

```tsx
<IonCard onClick={() => history.push(`/tea/${tea.id}`)}>
```

If we click on that, we get to the details page, but we have no way to get back. Let's fix that now. Add the following markup to the `TeaDetailsPage.tsx` file. Add it within the `IonToolbar`.

```tsx
<IonButtons slot="start">
  <IonBackButton />
</IonButtons>
```

Be sure to update your imports as we continue.

Now when we navigate from the `TeaListPage` page to the `TeaDetailPage` page, the current `IonRouterOutlet` creates a navigation stack and knows that we have a page to go back to. Therefore, it renders a back button in the toolbar for us (remember, iOS has no hardware back button so you need to deal with this in software).

What happens if we refresh while we are on the details page? We no longer have the back button because there is no stack, only this page. However, we know we want to go to the `TeaListPage` page, so we can set a default on the back button:

```tsx
<IonBackButton defaultHref="/tea" />
```

Try reloading the details page again. There are two real-world scenarios where you will need to take something like this into account:

- You are deploying to the web
- You are deploying natively but allowing deep linking to the child page

In other cases this is less important because you should always have a valid navigation stack.

## Displaying the Tea

Now that we have the navigation in place, let's grab the tea and display it.

### Create the Tests

First we need to figure out what our test setup in `src/pages/tea-details/TeaDetailsPage.test.tsx` should look like. We know that we will need to do the following in the code:

- Get the `id` parameter from our route.
- Get the list of teas from our `useTea()` hook.
- Bind the proper tea to the component.

The mock for `react-router-dom` needs to be updated to mock a new hook we'll be using from the package, `useParams`. Update `__mocks__/react-router-dom.ts`:

```diff
  import { vi } from 'vitest';

  const replace = vi.fn();
  const push = vi.fn();
  const useHistory = vi.fn().mockReturnValue({ replace, push });
+ const useParams = vi.fn().mockReturnValue({ id: '3' });

+ export { useHistory, useParams };
```

Next, we need to configure the tea data so the computed value can be testable. This involves the following steps in `src/pages/tea-details/TeaDetailsPage.test.tsx`:

Importing the `useTea` and `useParam` hooks.

```typescript
import { useTea } from './TeaProvider';
import { useParams } from 'react-router-dom';
```

Mocking their implementation.

```typescript
vi.mock('react-router-dom');
vi.mock('../../providers/TeaProvider');
```

And modifying the `beforeEach()` block that sets up the data and the mocks.

```typescript
beforeEach(() => {
  (useParams as Mock).mockReturnValue({ id: '3' });
  (useTea as Mock).mockReturnValue({
    teas: teas: [
      {
        id: 1,
        name: 'Green',
        image: '/assets/images/green.jpg',
        description: 'Green tea description.',
      },
      {
        id: 2,
        name: 'Black',
        image: '/assets/images/black.jpg',
        description: 'Black tea description.',
      },
      {
        id: 3,
        name: 'Herbal',
        image: '/assets/images/herbal.jpg',
        description: 'Herbal infusions description.',
      },
      {
        id: 4,
        name: 'Oolong',
        image: '/assets/images/oolong.jpg',
        description: 'Oolong tea description.',
      },
    ],
  });
  vi.clearAllMocks();
});
```

Now that we are set up to get data, let's add a couple of tests. These tests show that we get the correct data and that we then display the correct data within the correct element in the DOM.

```tsx
it('renders the tea name', () => {
  render(<TeaDetailsPage />);
  expect(screen.getByTestId('name')).toHaveTextContent('Herbal');
});

it('renders the tea description', () => {
  render(<TeaDetailsPage />);
  expect(screen.getByTestId('description')).toHaveTextContent('Herbal infusions description.');
});
```

### Update the View

Within `src/pages/tea-details/TeaDetailsPage.tsx` we need to import the following:

```typescript
import { useParams } from 'react-router-dom';
import { useTea } from '../../providers/TeaProvider';
import { Tea } from '../../models';
```

We need to get the `id` parameter from the route, which we can do with the `useParams` hook and the list of `teas` from the `useTea` hook. Once we have those, we can create a computed property that grabs the correct tea according to the id in the route.

Add the following code within the `TeaDetailsPage` component definition:

```typescript
const { id } = useParams<{ id: string }>();
const { teas } = useTea();
const tea: Tea | undefined = teas.find((t) => t.id === parseInt(id, 10));
```

Now we can add some tea-specific markup to the component template. Add this inside `IonContent`. Also, add the `ion-padding` class to `IonContent`.

```tsx
{
  tea && (
    <div>
      <div className="ion-justify-content-center" style={{ display: 'flex' }}>
        <IonImg src={tea.image} />
      </div>
      <h1 data-testid="name">{tea.name}</h1>
      <p data-testid="description">{tea.description}</p>
    </div>
  );
}
```

At this point, your tests should be passing.

We should also style that image just a tad to make sure it is not too big:

```tsx
<IonImg src={tea.image} style={{ maxWidth: '75%', maxHeight: '512px' }} />
```

I'm using inline CSS throughout this component, but it would be best practice to extract any inline CSS into CSS classes in a local CSS file (`TeaDetailsPage.css`). I leave that exercise up to you.

That completes our details page. Try it out in the browser and make sure everything works well. Try different mobile footprints via the DevTools as well.

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
