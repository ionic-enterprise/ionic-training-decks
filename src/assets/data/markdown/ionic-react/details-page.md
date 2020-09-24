# Lab: Tea Details Page

In this lab, you will learn how to:

- Use path parameters to create dynamic routes
- Leverage path parameters within components

## Overview

The Ionic Framework supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## Tea Feature Cleanup

We'll be placing more files into our tea feature folder: `src/tea`. At the root of the folder we already have 7 files, it makes sense to start creating some subfolders.

Go ahead and create subdirectories called `list` and `details`. Move `TeaList.tsx`, `TeaList.test.tsx`, and `TeaList.css` into `list` then create `TeaDetails.tsx`, `TeaDetails.test.tsx`, and `TeaDetails.css` inside the `details` subdirectory.

Now do the bare minimum needed to create and export a component named `<TeaDetails />` inside `src/tea/details/TeaDetails.tsx` and write a snapshot test in `src/tea/details/TeaDetails.test.tsx`.

Make sure update your import statements, delete `src/tea/__snapshots__`, and regenerate your snapshots.

## Create the Files

Create two files in `src/tea` named `TeaDetails.tsx` and `TeaDetails.test.tsx`. Do the bare minimum needed to create and export a component named `<TeaDetails />`.

## Adding the Details Route

Head over to `App.tsx`. We need to add an additional route inside our `<IonRouterOutlet>`:

```TypeScript
      ...
      <IonRouterOutlet>
        ...
        <Route path="/tea/details/:id" component={TeaDetails} />
        ...
      </IonRouterOutlet>
      ...
```

With a little URL hacking you should be able to navigate to this page, but you will need to supply an ID like this: `/tea/details/1`. Pretty neat!

## Update the Teas page

The tea category detail route has been defined but our application has no idea how to navigate to it. So let's add the child page to the application's routing flow by navigating the user to the child page upon clicking one of the tea category cards.

Open `src/tea/list/TeaList.tsx`. Modify the `<IonCard>` component by adding the following props:

```TypeScript
...
<IonCard button onClick={() => showDetailsPage(tea.id)}>
...
```

The `button` prop which adds some styling to the card, making it behave in a "clickable" fashion.

Next let's define `showDetailsPage()`. Add the following code below the `useIonViewWillEnter` block:

```TypeScript
const TeaList: React.FC = () => {
  ...
  const showDetailsPage = (id: number) => {
    history.push(`/tea/details/${id}`);
  }
  ...
};
export default TeaList;
```

Notice that we're calling `history.push()` whereas we've seen `history.replace()`. When signing a user in or signing a user out, we want to replace the entire history stack (so they can't go back to an invalid application state). In this case however, we want to push a new route onto the stack so the application user can go back to our tea page if they desire.

Now when we click on a card we should go to the tea category detail page and the path should include the ID of the specific tea category.

## The Tea Details Page

### Reading the ID Parameter

We need a way to fetch the `:id` path parameter so that our child page can retrieve information for the correct tea category. Path parameters can be obtained from the `match` prop available from `react-router`'s `RouteComponentProps` type.

Open `src/tea/TeaDetails.tsx` and make the following adjustments:

```TypeScript
import { RouteComponentProps } from 'react-router';

interface TeaDetailsProps
  extends RouteComponentProps<{
    id: string;
  }> {}


const TeaDetails: React.FC<TeaDetailsProps> = ({ match }) => {
  return (
    ...
  );
};
export default TeaDetails;
```

Note how we use a TypeScript interface to strongly type the props object. This interface gives us type safety and code completion inside of the component.

### Navigating Back

We also need a way for application users to navigate back, otherwise our application users will be stuck (unless they are on a device that has a back button)! Let's fix that:

1. Go to the <a href="https://ionicframework.com/docs/api/back-button" target="_blank">IonBackButton documentation</a>
2. Take a look at the React Usage example, the first one is marked "Default back button"
3. **Challenge:** Try adding the appropriate mark-up from there to `<TeaDetails />`.

If you were already on the child page when you did this, then you did not see a back button. This is because when the page refreshed, the navigation stack was destroyed. If your app needs to still display the back button even if there is no navigation stack (for example, if you are going to deploy to the web where someone _could_ directly go to the tea category details page via a link), use the `defaultHref` property.

### Displaying the Data

**Challenge:** We'll start this section off with a challenge. Write logic to fetch the specific tea category to display on the page.

Once complete, we can start adding information to the page. Update the component's template to match the following:

```JSX
  <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tea" />
          </IonButtons>
          <IonTitle>Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding">
          <div
            className="ion-justify-content-center"
            style={{ display: 'flex' }}>
            <IonImg src={teaCategory?.image} />
          </div>
          <h1>{teaCategory?.name}</h1>
          <p>{teaCategory?.description}</p>
        </div>
      </IonContent>
    </IonPage>
```

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
