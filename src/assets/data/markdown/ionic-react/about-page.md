# Lab: The About Page

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

**Note:** this is an "extra credit" lab and can be skipped without affecting the main functionality of the application.

## Get the Data

Open the application's `tsconfig.json` file and make sure `resolveJsonModule` is set to `true` in order to allow the code to resolve JSON files:

```json
  "compilerOptions": {
...
    "resolveJsonModule": true,
...
```

**Note:** You may need to add the `author` node to the `package.json` file. Here is an example:

```json
  "author": {
    "name": "Ionic Customer Success Team",
    "email": "support@ionic.io",
    "url": "https://ionic.io"
  },
```

This will allow us to read the `package.json` file and get some important information from it for our `AboutPage`. Note that there is no need for this data to be part of the component.

```typescript
import packageInfo from '../../package.json';
const { author, description, name, version } = packageInfo;
```

We can then update the template for the component.

```tsx
<IonPage>
  <IonHeader>
    <IonToolbar>
      <IonTitle>About Tea Taster</IonTitle>
    </IonToolbar>
  </IonHeader>
  <IonContent className="ion-text-center ion-padding main-content">
    <IonList>
      <IonListHeader>About</IonListHeader>
      <IonItem>
        <IonLabel>Name</IonLabel>
        <IonNote slot="end">{name}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Description</IonLabel>
        <IonNote slot="end">{description}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Version</IonLabel>
        <IonNote slot="end">{version}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Author</IonLabel>
        <IonNote slot="end">{author.name}</IonNote>
      </IonItem>
    </IonList>
  </IonContent>
</IonPage>
```

## Move the Logout Logic

Currently, the logout logic is on the first page. Once the user has logged in, it is doubtful they will need to logout, so it would make more sense to put that functionality on a page like the "My Account" page, or "My Profile". We don't have one of those, but the about page will do for now.

We start by moving the logout related tests from the `TeaListPage` view's test to the `AboutPage` test file. You will need to add a couple of imports, etc, but I leave that up to you at this point. The tests you need to move have descriptions like:

- 'performs a logout when the logout button is clicked'
- 'navigates to the login after the logout action is complete'

I also leave it up to you to move the proper code from `src/tea/TeaListPage.tsx` to `src/about/AboutPage.tsx` and then clean up the `TeaListPage` code.

Be sure that:

- All of your tests are passing.
- You have no lint errors.
- Your app builds cleanly.
- Your app runs in the browser without warnings or errors in the console.
- Your app runs well on your devices.

If any of these are not the case, we should spend some time doing a little debugging.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to 1.0.0 in your `package.json` file! 🥳🎉🤓
