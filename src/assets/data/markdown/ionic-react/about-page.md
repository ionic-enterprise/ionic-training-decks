# Lab: Add the Notes Feature

In this lab you will:

- Implement the About page
- Complete your Ionic Framework application!

## Overview

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

## About Page

The about page will use properties from `package.json` to display in an `IonList`. The full code for `src/about/About.tsx` can be found below:

```TypeScript
import React from 'react';
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
import { author, name, description, version } from '../../package.json';
import './About.css';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About Tea Taster</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
            <IonNote slot="end">{author}</IonNote>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
export default About;
```

## Move the Logout Logic

Currently, the way an application user would sign out is through the tea listing page. Once a user has logged in, it's doubtful that they'll want to log out. It makes more sense to put that functionality on a page like "My Account" or "My Profile". We don't have one of those pages, so this page will do for now.

Here is the full test file for `About.test.tsx`:

```TypeScript
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import About from './About';
import { AuthContext } from '../auth/AuthContext';
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useHistory: () => ({ replace: jest.fn() }),
  };
});

const logoutSpy = jest.fn();
const tree = (
  <AuthContext.Provider
    value={{
      login: jest.fn(),
      isAuthenticated: false,
      user: undefined,
      logout: logoutSpy,
    }}>
    <About />
  </AuthContext.Provider>
);

describe('<About />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<About />);
    expect(asFragment).toMatchSnapshot();
  });

  describe('sign out button', () => {
    it('signs the user out', async () => {
      let button: HTMLIonButtonElement;
      const { container } = render(tree);
      button = container.querySelector('ion-button')!;
      fireEvent.click(button);
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

I leave it to you to move the proper code from `TeaList` to the about page and then clean up any unused items.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to `1.0.0` in your `package.json` file! 🥳🎉🤓
