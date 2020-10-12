# Lab: Add a Login Page

In this lab, you will learn how to:

- Add forms to a React project
- Create new pages for the application
- Add additional routes to the application's router
- Handle and test Ionic Framework component events

## Overview

Most applications have more than one page. Our application will eventually have several; let's start by adding a login page.

## Additional Dependencies

In this training, we will use [React Hook Form](https://react-hook-form.com/) as our form library of choice. It is lightweight library that provides us with easy-to-use validation and integrates well with Ionic Framework input components.

Terminate `ionic serve` and `npm test` scripts, then run the following terminal command:

```bash
$ npm install react-hook-form mutationobserver-shim
```

This will install React Hook Form and a helper dependency needed to test the library.

Speaking of testing, let's add a dependency that will help us test Ionic Framework components. Certain Ionic Framework components contain attributes/events that React Testing Library isn't aware of.

<a href="https://github.com/ionic-team/ionic-react-test-utils" target="_blank">Ionic React Test Utils</a> is a set of helper methods that makes our tests aware of these attributes and events.

Install it with the following terminal command:

```bash
$ npm install @ionic/react-test-utils
```

Finally, open `src/setupTests.ts` and add the following lines of code:

**`src/setupTests.ts`**

```TypeScript
require('mutationobserver-shim');
import { mockIonicReact } from '@ionic/react-test-utils';
mockIonicReact();
```

Once complete, run `ionic serve` and `npm test` again and move onto the next section.

## The Login Page

### Create Folder and Files

Add a new feature folder `src/login`. Inside that folder add two files for the component and the test file: `LoginPage.tsx` and `LoginPage.test.tsx`.

Next, copy the code snippet below and paste it into `LoginPage.tsx`:

```TypeScript
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Login</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
```

**Challenge:** Set up `LoginPage.test.tsx` with tests to verify:

1. `<LoginPage />` displays a header with the text "Login"
2. `<LoginPage />` renders consistently

### Add Routing

To make our login page accessible, we need to add an entry to the `IonReactRouter` residing in `App.tsx`:

```TypeScript
...
import LoginPage from './login/LoginPage';
...
const App: React.FC = () => {
  ...
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={LoginPage} exact={true} />
          <Route path="/tea" component={TeaPage} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Let's make sure this works by changing the route in our browser to http://localhost:8100/login. There's not much to see, but we can see that the route is actually working.

### Mock the User Interface

Let's mock up what we would like the login page to look like. We know we are going to need a form in which to enter an e-mail address and a password along with a button to press when the user is ready to sign in, so let's start there:

**`src/login/LoginPage.tsx`**

```JSX
<IonPage>
  ...
  <IonContent>
    <IonHeader collapse="condense">
    ...
    </IonHeader>

    <form>
      <IonList>
        <IonItem>
          <IonLabel>E-Mail Address</IonLabel>
          <IonInput />
        </IonItem>
        <IonItem>
          <IonLabel>Password</IonLabel>
          <IonInput />
        </IonItem>
      </IonList>
    </form>
  </IonContent>

  <IonFooter>
    <IonToolbar>
      <IonButton>Sign In</IonButton>
    </IonToolbar>
  </IonFooter>

</IonPage>
```

Well, that's a start, but let's pretty it up a bit. First, let's use the "floating" style labels like this: `<IonLabel position="floating">Some Label</IonLabel>`.

We should also give the inputs an `id`, a `name`, and a `type`:

```JSX
<IonList>
  <IonItem>
    <IonLabel position="floating">E-Mail Address</IonLabel>
    <IonInput id="email-input" name="email" type="email" required />
  </IonItem>
  <IonItem>
    <IonLabel position="floating">Password</IonLabel>
    <IonInput id="password-input" name="password" type="password" required />
  </IonItem>
</IonList>
```

The password field now shows markers instead of the actual text being typed in. The additional attributes get us ready for work we will have to do later.

Finally, let's add the "Sign In" button. Ideally it should:

- Take up the whole screen width
- Have a sign-in icon to go along with the text

<a href="https://ionicons.com" target="_blank">Ionicons</a> are a collection of icons created by the Ionic Framework team. The `ionicons` npm package is included as a dependency within Ionic Framework starter projects, so we already have access to this library.

Take a few minutes to check out the site. The icon we're going to use is `log-in-outline`.

In the last lab we learned that Create React App encourages us to import image assets in our TypeScript files. Ionicons provides us with exports for each icon that we can import into `LoginPage.tsx`. Add the following import:

```TypeScript
import { logInOutline } from 'ionicons/icons';
```

With that taken care of, let's update the `<IonFooter>` portion of the page like so:

```JSX
<IonFooter>
  <IonToolbar>
    <IonButton expand="full">
      Sign In
      <IonIcon slot="end" icon={logInOutline} />
    </IonButton>
  </IonToolbar>
</IonFooter>
```

## Form Handling

With our layout mocked, we can start building out functionality for the form.

### Binding the Data

First, let's import the `useForm` hook and `Controller` component made available from the `react-hook-form` dependency:

**`src/login/LoginPage.tsx`**

```TypeScript
import React from 'react';
...
import { useForm, Controller } from 'react-hook-form';
import { logInOutline } from 'ionicons/icons';
...
```

The `useForm` hook allows us to create a context for our login form, and provides many values we'll want to take advantage of. `Controller` makes non-standard input fields (such as `IonInput`) interoperable with React Form Hook.

Within our `LoginPage` component, let's establish a context for the form and pull out properties that will:

- Handle form submission
- Register inputs to our form
- Obtain information about our form
- Provide any form errors

We'll also specify that we want our form to be validated when any inputs are changed:

```TypeScript
...
const LoginPage: React.FC = () => {
  const { handleSubmit, control, formState, errors } = useForm({
    mode: 'onChange'
  });

  return (
    ...
  );
};
export default LoginPage;
```

Next we will make use of the `Controller` component. Modify the `<form>` of the page component like so:

```JSX
...
<form>
  <IonList>
    <IonItem>
      <IonLabel position="floating">E-Mail Address</IonLabel>
      <Controller
        render={({ onChange, value }) => (
          <IonInput
            id="email-input"
            onIonChange={(e: any) => onChange(e.detail.value!)}
            value={value}
          />
        )}
        control={control}
        name="email"
        rules={{
          required: true,
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            message: 'E-Mail Address must have a valid format',
          },
        }}
        defaultValue={''}
      />
    </IonItem>
    <IonItem>
      <IonLabel position="floating">Password</IonLabel>
      <Controller
        render={({ onChange, value }) => (
          <IonInput
            id="password-input"
            onIonChange={(e: any) => onChange(e.detail.value!)}
            value={value}
            type="password"
          />
        )}
        control={control}
        name="password"
        rules={{ required: true }}
        defaultValue={''}
      />
    </IonItem>
  </IonList>
</form>
...
```

There is quite a bit going on here, so let's break it down:

- We use the `Controller` component to define the parameters of our input fields, such as their default values and validation logic
- The `render` prop of the `Controller` component allows us to utilize Ionic Framework components within React Form Hook's library
- The `onIonChange` event handles the changing of the input fields; in our cases we will delegate that responsibility to the `Controller` component
- Input validation rules are set on the `rules` prop of the `Controller` component

React Form Hook's `Controller` component can take some getting used to. However, the pattern you see above is safe to use when building your own forms outside of this training.

And of course, I recommend taking a look through the [React Form Hook Controller documentation](https://react-hook-form.com/api#Controller).

### Disabling the Sign In Button

Application users should not be able to click the "Sign In" button if the form itself is not valid. Also, when the user does click on the button our page should do something. What that _something_ is currently is undefined, but we will bind the event so it is ready once we do define what it should do.

#### Test First

We need to do some cleanup in our test file for the login page. React Hook Form runs asynchronously which is going to cause our current tests to fail. This can be fixed by making the tests `async` and using the `wait` utility provided by React Testing Library. Update the existing tests:

**`src/login/LoginPage.test.tsx`**

```TypeScript
import React from 'react';
import { render, wait } from '@testing-library/react';
import LoginPage from './LoginPage';

describe('<LoginPage />', () => {
  it('displays the header', async () => {
    const { container } = render(<LoginPage />);
    await wait(() => expect(container).toHaveTextContent(/Login/));
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<LoginPage />);
    await wait(() => expect(asFragment()).toMatchSnapshot());
  });
});
```

Now let's use our tests to define when the button should be enabled and disabled:

```TypeScript
import React from 'react';
import { render, wait, waitForElement } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import LoginPage from './LoginPage';

describe('<LoginPage />', () => {
  ...
  describe('sign in button', () => {
    it('starts disabled', async () => {
      const { container } = render(<LoginPage />);
      const button = await waitForElement(
        () => container.querySelector('ion-button')! as HTMLIonButtonElement,
      );
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just an e-mail address', async () => {
      const { container } = render(<LoginPage />);
      const [button, email] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#email-input')! as HTMLIonInputElement,
      ]);
      await wait(() => fireEvent.ionChange(email, 'test@test.com'));
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just a password', async () => {
      const { container } = render(<LoginPage />);
      const [button, password] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#password-input')! as HTMLIonInputElement,
      ]);
      await wait(() => fireEvent.ionChange(password, 'P@ssword123'));
      expect(button.disabled).toBeTruthy();
    });

    it('is enabled with both an email address and a password', async () => {
      const { container } = render(<LoginPage />);
      const [button, email, password] = await waitForElement(() => [
        container.querySelector('ion-button')! as HTMLIonButtonElement,
        container.querySelector('#email-input')! as HTMLIonInputElement,
        container.querySelector('#password-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(email, 'test@test.com');
        fireEvent.ionChange(password, 'P@ssword123');
      });
      expect(button.disabled).toBeFalsy();
    });
  });
});
```

Additionally, React Testing Library has utilities to wait for an element to exist within the DOM, which is what we used above.

#### Then Code

Let's go ahead and add the logic to determine whether our "Sign In" button should be enabled or disabled. We'll also wire up the `onClick` event of the button - for now we will just have it log the input data to the console:

**`src/login/LoginPage.tsx`**

We'll also wire up the `onClick` event to the `signIn` function we created earlier:

```JSX
...
  <IonButton
    expand="full"
    disabled={!formState.isValid}
    onClick={handleSubmit(data => console.log(data))}
  >
    Sign In
    <IonIcon slot="end" icon={logInOutline} />
  </IonButton>
...
```

Now we're cooking! If we play around with the form in Chrome we can see that our input values are logged to the console when the "Sign In" button is pressed.

### Error Handling

Logic is in place to keep users from pressing the "Sign In" button if they don't provide an e-mail address or password value, but wouldn't it be great if we could detect invalid user input?

Specifically, it would be nice if we could tell the user that:

- The e-mail address must have a valid format
- E-mail address is a required field
- Password is a required field

#### Test First

First let's use our tests to define when the error messages should be displayed:

**`src/login/LoginPage.test.tsx`**

```TypeScript
describe('<LoginPage />', () => {
  ...
  describe('error messages', () => {
    it('starts with no error message', async () => {
      const { container } = render(<LoginPage />);
      const errorDiv = await waitForElement(
        () => container.querySelector('.error-message')!,
      );
      expect(errorDiv.textContent).toEqual('');
    });

    it('dsiplays an error message if the e-mail address is dirty and empty', async () => {
      const expected = /E-Mail Address is required/;
      const { container } = render(<LoginPage />);
      const [errorDiv, email] = await waitForElement(() => [
        container.querySelector('.error-message')!,
        container.querySelector('#email-input')! as HTMLIonInputElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(email, 'test@test.com');
        fireEvent.ionChange(email, '');
      });
      expect(errorDiv).toHaveTextContent(expected);
    });

    it('displays an error message if the e-mail address has an invalid format', async () => {
      const expected = /E-Mail Address must have a valid format/;
      // Fill in this test.
    });

    it('displays an error message if the password is dirty and empty', async () => {
      const expected = /Password is required/;
      // Fill in this test.
    });
  });
});
```

**Challenge:** Fill in the remaining tests.

#### Then Code

Now let's update the form. Add the following block of code after the closing `IonList` tag and before the closing `form` tag:

**`src/login/LoginPage.tsx`**

```JSX
...
    </IonList>

    <div className="error-message">
      <div>
        {errors.email?.type === 'required' &&
          'E-Mail Address is required'}
      </div>
      <div>
        {errors.email?.type === 'pattern' && errors.email.message}
      </div>
      <div>
        {errors.password?.type === 'required' && 'Password is required'}
      </div>
    </div>

  </form>
...
```

## Global Error Styling

Our error messages are now displaying when a user breaks any of our rules, but it could look nicer. Since this is not the only page where we could potentially want to display error messages, let's add styling we can use across the application when we want to display an error message.

Create a new file in `src/theme` called `global.css` and add the following CSS class definition:

**`src/theme/global.css`**

```CSS
.error-message {
  padding: 2em;
  color: var(--ion-color-danger);
  text-align: center;
}
```

For this style to be applied across the application we need to import the file into `App.tsx`:

**`src/App.tsx`**

```TypeScript
...
import './theme/global.css';

const App: React.FC = () => {
  ...
};

export default App;
```

## Conclusion

We have learned how to create a new page and add it to our router. We also learned how to handle component events to create a login form. Next we are going to supply our application with an authentication mechanism.
