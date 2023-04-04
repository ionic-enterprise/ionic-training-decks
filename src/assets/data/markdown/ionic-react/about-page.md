# Lab: The About Page

In this lab you will:

- Implement the About page
- Complete your Ionic Framework application!

## Overview

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

## About Page

The about page will use properties from `package.json` to display in an `IonList`. The full code for `src/about/AboutPage.tsx` can be found below:

**`src/about/AboutPage.tsx`**

```tsx
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const AboutPage: React.FC = () => {
  const { author, name, version, description } = require('../../package.json');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About Tea Taster</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="main-content">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">About Tea Taster</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
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
  );
};
export default AboutPage;
```

## Move the Logout Logic

Currently, the way an application user would sign out is through the tea listing page. Once a user has logged in, it's doubtful that they'll want to log out. It makes more sense to put that functionality on a page like "My Account" or "My Profile". We don't have one of those pages, so this page will do for now.

I leave it to you to move the proper code from `TeaPage` to the about page and then clean up any unused items.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to `1.0.0` in your `package.json` file! 🥳🎉🤓
