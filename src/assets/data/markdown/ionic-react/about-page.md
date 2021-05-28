# Lab: The About Page

In this lab you will:

- Implement the About page
- Complete your Ionic Framework application!

## Overview

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

## About Page

The about page will use properties from `package.json` to display in an `IonList`. The full code for `src/about/AboutPage.tsx` can be found below:

**`src/about/AboutPage.tsx`**

```TypeScript
import {
  IonContent, IonHeader, IonItem, IonLabel, IonList,
  IonNote, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import { author, name, description, version } from '../../package.json';

const AboutPage: React.FC = () => {
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

Here is the full test file for `AboutPage.test.tsx`:

**`src/about/AboutPage.test.tsx`**

```TypeScript
import { render, waitFor } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import AboutPage from './AboutPage';

let mockLogout = jest.fn(() => Promise.resolve());
jest.mock('../core/auth', () => ({
  useAuthentication: () => ({
    logout: mockLogout,
  }),
}));
jest.mock('react-router', () => ({
  useHistory: () => ({
    replace: jest.fn(),
  }),
}));

describe('<AboutPage />', () => {
  beforeEach(() => (mockLogout = jest.fn(() => Promise.resolve())));

  it('displays the header', async () => {
    const { container } = render(<AboutPage />);
    await waitFor(() =>
      expect(container).toHaveTextContent(/About Tea Taster/),
    );
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<AboutPage />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  describe('sign out button', () => {
    it('signs the user out', async () => {
      const { getByTestId } = render(<AboutPage />);
      const logout = await waitFor(() => getByTestId(/logout-button/));
      fireEvent.click(logout);
      await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

I leave it to you to move the proper code from `TeaPage` to the about page and then clean up any unused items.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to `1.0.0` in your `package.json` file! 🥳🎉🤓
