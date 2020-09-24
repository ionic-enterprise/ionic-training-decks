# Lab: Add a Login Page

In this lab, you will learn how to:

- Create new pages for the application
- Add additional routes to the application's router
- Handle and test Ionic Framework component events

## Overview

Most applications have more than one page. Our application will eventually have several; let's start by adding a login page.

## TODO

- Have user install `npm i react-hook-form`
- Have user install `npm i mutationobserver-shim`

## The Login Page

### Create Folder and Files

Add a new folder within `src` called `login`. Within that folder, let's create the component file, the test file, and CSS file for our login page:

- `Login.tsx`
- `Login.test.tsx`
- `Login.css`

Scaffold the page so that it has the same design as our teas page, but without the `IonGrid`:

**`src/login/Login.tsx`**

```TypeScript
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const Login: React.FC = () => {
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

export default Login;
```

**Challenge:** Set up `Login.test.tsx` with tests to verify:

1. `<Login />` displays a header with the text "Login"
2. `<Login />` renders consistently

### Add Routing

To make our login page accessible, we need to add an entry to the `IonReactRouter` residing in `App.tsx`:

```TypeScript
...
import Login from './login/Login';
...
const App: React.FC = () => {
  ...
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={Login} exact={true} />
          <Route path="/tea" component={TeaList} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Let's make sure this works by changing the route in our browser to http://localhost:8100/login if you are running the application using `ionic serve` or http://localhost:3000/login if you are running it using `ng start`. There's not much to see, but we can see that the route is actually working.

### Mock the User Interface

Let's mock up what we would like the login page to look like. We know we are going to need a form in which to enter an e-mail address and a password along with a button to press when the user is ready to sign in, so let's start there:

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

Well, that's a start, but let's pretty it up a bit. First, let's use the "floating" style labels like this: `<IonLabel position="floating">Some Label</IonLabel>`. Nice!

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

- Have an `id`
- Take up the whole screen width
- Have a sign-in icon to go along with the text

<a href="https://ionicons.com" target="_blank">Ionicons</a> are a collection of icons created by the Ionic Framework team. The `ionicons` npm package is included as a dependency within Ionic Framework starter projects, so we already have access to this library.

Take a few minutes to check out the site. The icon we're going to use is `log-in-outline`.

In the last lab we learned that Create React App encourages us to import image assets in our TypeScript files. Ionicons provides us with exports for each icon that we can import into `Login.tsx`. Add the following import:

```TypeScript
import { logInOutline } from 'ionicons/icons';
```

With that taken care of, let's update the `<IonFooter>` portion of the component like so:

```JSX
<IonFooter>
  <IonToolbar>
    <IonButton id="signin-button" expand="full">
      Sign In
      <IonIcon slot="end" icon={logInOutline} />
    </IonButton>
  </IonToolbar>
</IonFooter>
```

## Form Handling

With our layout mocked, we can start building out functionality for the form. We know we're going to need to hold the state of our form's e-mail address and password fields and a function that handles pressing the button. Let's set those up:

```TypeScript
import React, { useState } from 'react';
...
const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const signIn = () => {
    console.log(email, password);
  };

  return (
    ...
  );
};

export default Login;
```

We're making use of React's <a href="https://reactjs.org/docs/hooks-state.html" target="_blank">State Hook</a> to manage the state of our component's input fields. Throughout this course, we're going to use different React Hooks to make our life easier. In fact, we've already used the `useEffect` React Hook to run initialization logic on our `<App />` component!

`useState` returns an array where the first entry is the variable that holds data, and the second entry is a "setter" function that is used to update the variable. You can type the shape of data you want the variable to hold, and set a default value through the function's first argument.

### Binding Input Fields

Let's make use of our "setter" functions to update `email` and `password` when those input fields are changed. Update the `<form>` portion of your template to match below:

```JSX
<form>
  <IonList>
    <IonItem>
      <IonLabel position="floating">E-Mail Address</IonLabel>
      <IonInput
        onIonChange={e => setEmail(e.detail.value!)}
        name="email"
        type="email"
        id="email-input"
        required
      />
    </IonItem>
    <IonItem>
      <IonLabel position="floating">Password</IonLabel>
      <IonInput
        onIonChange={e => setPassword(e.detail.value!)}
        name="password"
        type="password"
        id="password-input"
        required
      />
    </IonItem>
  </IonList>
</form>
```

That's it. The React State Hook does most of the legwork for us, keeping our component's code nice and tidy.

### Ionic React Test Utils

Before moving on with our login page, let's take a detour to add a dependency that will help us test Ionic Framework components. Certain Ionic Framework components contain attributes and/or events that Jest and React Testing Library aren't aware of (yet).

<a href="https://github.com/ionic-team/ionic-react-test-utils" target="_blank">Ionic React Test Utils</a> is a set of helper methods that makes Jest and React Testing Library aware of these attributes and events.

Terminate any running processes and run the following command in the terminal:

```bash
$ npm install @ionic/react-test-utils
```

Open up `src/setupTests.ts` and add the following lines:

```TypeScript
import { mockIonicReact } from '@ionic/react-test-utils';
mockIonicReact();
```

Once complete, we can run our serve and test commands again and return to completing our login page.

### Disabling the Sign In Button

Users interacting with our application shouldn't be able to press the "Sign In" button if the form is invalid, don't you agree?

#### Test First

Let's use tests to define when the "Sign In" button should be enabled or disabled:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import Login from './Login';

describe('<Login />', () => {
  it('displays the header', () => {
    const { container } = render(<Login />);
    expect(container).toHaveTextContent('Login');
  });

  it('renders consistently', () => {
    const { asFragment } = render(<Login />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('sign in button', () => {
    let button: HTMLIonButtonElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;

    beforeEach(() => {
      const { container } = render(<Login />);
      button = container.querySelector('ion-button')!;
      email = container.querySelector('#email-input') as HTMLIonInputElement;
      password = container.querySelector('#password-input') as HTMLIonInputElement;
    });

    it('starts disabled', async () => {
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just an e-mail address', () => {
      fireEvent.ionChange(email, 'test@test.com');
      expect(button.disabled).toBeTruthy();
    });

    it('is disabled with just a password', () => {
      // TODO: Fill this in
    });

    it('is enabled with both an email address and a password', () => {
      // TODO: Fill this in
    });
  });
});
```

**Challenge:** Fill out the logic for the last two tests. Remember, your tests should be failing at this point!

#### Then Code

Let's go ahead and add the logic to determine whether our "Sign In" button should be enabled or disabled. We'll also wire up the `onClick` event to the `signIn` function we created earlier:

```JSX
...
<IonButton
  id="signin-button"
  expand="full"
  onClick={() => signIn()}
  disabled={!email.length || !password.length}>
  Sign In
  <IonIcon slot="end" icon={logInOutline} />
</IonButton>
...
```

Now we're cooking! Update your snapshots and then your tests should pass. If we play around with the form in Chrome we can see that our input values are logged to the console when the "Sign In" button is pressed.

### Error Handling

Logic is in place to keep users from pressing the "Sign In" button if they don't provide an e-mail address or password value, but wouldn't it be great if we could detect invalid user input?

Specifically, it would be nice if we could tell the user that:

- The e-mail address must have a valid format
- E-mail address is a required field
- Password is a required field

#### Test First

First let's write tests to define when each error message should be displayed:

```TypeScript
...
describe('<Login />', () => {
  ...
  describe('error messages', () => {
      let errorDiv: HTMLDivElement;
      let email: HTMLIonInputElement;
      let password: HTMLIonInputElement;

      beforeEach(() => {
        const { container } = render(<Login />);
        email = container.querySelector('#email-input') as HTMLIonInputElement;
        password = container.querySelector(
          '#password-input',
        ) as HTMLIonInputElement;
        errorDiv = container.querySelector('.error-message') as HTMLDivElement;
      });

      it('displays an error message if the e-mail address is dirty and empty', () => {
        const error = 'E-Mail Address is required';
        fireEvent.ionChange(email, 'test@test.com');
        fireEvent.ionChange(email, '');
        expect(errorDiv.textContent!.trim()).toEqual(error);
      });

      it('displays an error message if the e-mail address has an invalid format', () => {
        const error = 'E-Mail Address must have a valid format';
        // TODO: Fill this in
      });

      it('clears the error message when the e-mail address has an valid format', () => {
        const error = '';
        // TODO: Fill this in
      });

      it('displays an error message if the password is dirty and empty', () => {
        const error = 'Password is required';
        // TODO: Fill this in
      });
    });
});
```

**Challenge:** Fill in the logic for the remaining tests.

#### Then Code

We want some kind of "listener" that can validate `email` and `password` when they change. The React <a href="https://reactjs.org/docs/hooks-effect.html" target="_blank">Effect Hook</a> was built for just this type of use-case! So far we leveraged `useEffect` to run component startup logic, but we haven't learned _how_ it actually works:

`useEffect` can be used to listen to any set of objects and run code when any of those objects change. That is the purpose of the second argument - it's a list of objects to listen to. If we pass in an empty array, `useEffect` listens to the component and will run code when the component initializes.

Let's add an effect that will set the error based on any broken validation rules and display the error in our template. We'll also add a pair of "dirty flags" to track if the user has modified either field:

```TypeScript
...
const Login: React.FC = () => {
  const [dirtyEmail, setDirtyEmail] = useState<boolean>(false);
  const [dirtyPassword, setDirtyPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  ...
    useEffect(() => {
    if (dirtyEmail && !email.length)
      return setError('E-Mail Address is required');

    if (dirtyEmail && !email.match(/\S+@\S+\.\S+/))
      return setError('E-Mail Address must have a valid format');

    if (dirtyPassword && !password.length)
      return setError('Password is required');

    return setError('');
  }, [email, password, dirtyEmail, dirtyPassword]);

  return (
    ...
    <form>
      ...
    </form>
    <div className="error-message">{error}</div>
    ...
  );
};
...
```

By combining `useEffect` and `useState` we were able to roll our own client-side form validation without any third-party libraries!

Now we need a way to set the dirty flags once an input has been modified, and we need to make sure that users cannot press the "Sign In" button while an error is present. Let's add that code in:

```TypeScript
...
const Login: React.FC = () => {
  ...
  const onEmailChange = (email: string) => {
    setDirtyEmail(true);
    setEmail(email);
  };

  const onPasswordChange = (password: string) => {
    setDirtyPassword(true);
    setPassword(password);
  };
  ...
  return (
    ...
    <form>
      <IonList>
        <IonItem>
          <IonLabel position="floating">E-Mail Address</IonLabel>
          <IonInput
            onIonChange={e => onEmailChange(e.detail.value!)}
            name="email"
            type="email"
            id="email-input"
            required
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            onIonChange={e => onPasswordChange(e.detail.value!)}
            name="password"
            type="password"
            id="password-input"
            required
          />
        </IonItem>
      </IonList>
    </form>
    ...
    <IonButton
      id="signin-button"
      expand="full"
      onClick={() => signIn()}
      disabled={error.length > 0 || !email.length || !password.length}>
      Sign In
      <IonIcon slot="end" icon={logInOutline} />
    </IonButton>
    ...
  );
});
...
```

All of our tests should pass, and don't forget to update your snapshot.

## Global Error Styling

Our error messages are now displaying when a user breaks any of our rules, but it could look nicer. Since this is not the only page where we could potentially want to display error messages, let's add styling we can use across the application when we want to display an error message.

Create a new file in `src/theme` called `global.css` and add the following CSS class definition:

```CSS
.error-message {
  padding: 2em;
  color: var(--ion-color-danger);
  text-align: center;
}
```

For this style to be applied across the application we need to import the file into `App.tsx`:

```TypeScript
...
import './theme/global.css';

const App: React.FC = () => {
  ...
};

export default App;
```

Update your snapshot then we're done with this lab.

## Conclusion

We have learned how to create a new page and add it to our router. We also learned how to handle component events to create a login form. Next we are going to supply our application with an authentication mechanism.
