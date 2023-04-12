# Lab: Add a Login Page

In this lab, you will learn how to:

- Add forms to a React project
- Create new pages for the application
- Add additional routes to the application's router
- Handle and test Ionic Framework component events

Most applications have more than one page. Our application will eventually have several; let's start by adding a login page.

## Create the Page

Start by writing unit tests for a new page. We'll want to create tests that verify the correct title is displayed and that it renders consistently.

Create a file `src/login/LoginPage.test.tsx` and add the following tests:

```tsx
import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

describe('<LoginPage />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders consistently', () => {
    const { asFragment } = render(<LoginPage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the title', () => {
    render(<LoginPage />);
    const titleElements = screen.getAllByText('Login');
    expect(titleElements).toHaveLength(2);
  });
});
```

For the contents of `src/login/LoginPage.tsx`, let's just start with a skeleton page that will contain the title of the page and has a "sign in" button on the bottom.

```tsx
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { logInOutline } from 'ionicons/icons';

const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Login</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton expand="full">
            Sign In
            <IonIcon slot="end" icon={logInOutline} />
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};
export default LoginPage;
```

**Note:** <a href="https://ionicons.com" target="_blank">Ionicons</a> are a collection of icons created by the Ionic Framework team. The `ionicons` npm package is included as a dependency within Ionic Framework starter projects, so we already have access to this library.

### Add Routing

To make our login page accessible, we need to add an entry to the `IonReactRouter` residing in `App.tsx`:

```diff
...
<IonApp>
  <SplashContainer>
    <IonReactRouter>
      <IonRouterOutlet>
+       <Route exact path="/login">
+         <LoginPage />
+       </Route>
        <Route exact path="/tea">
          <TeaListPage />
        </Route>
        <Route exact path="/">
          <Redirect to="/tea" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </SplashContainer>
</IonApp>
...
```

Let's make sure this works by changing the route in our browser to http://localhost:8100/login (or whatever port your app is running on). There's not much to see, but we can see that the route is actually working.

## Form Dependencies

We can build forms using the raw ingredients provided by React, but that's a lot of extra coding to do when good form libraries already exist for React.

For this training, we will use <a href="https://react-hook-form.com/" target="_blank">React Hook Form</a>. It's lightweight and integrates well with Ionic React input controls. We'll use <a href="https://github.com/jquense/yup" target="_blank">Yup</a> for form validation.

Add the required dependencies to your project.

```bash
npm install react-hook-forms yup @hookform/resolvers
```

## Form Handling

React Hook Form allows us to type forms. Add the following type to `src/login/LoginPage.tsx` _outside_ of the component definition:

```typescript
type LoginInputs = { email: string; password: string };
```

_Inside_ the component definition, before the `return` statement, add the following code:

```typescript
const { handleSubmit, control } = useForm<LoginInputs>({ mode: 'onTouched' });
```

This line of code creates a hook for our form, typed to `LoginInputs`. It will validate the form on touch. We will use `handleSubmit` and `control` in our component template coming up.

### Mock the User Interface

Let's mock up what we would like the login form to look like. We know we'll need an input field to enter an email address and one for a password. We already have added a button to press when the user is ready to sign in.

Add the following template code in between the closing `</IonHeader>` and `</IonContent>` tags:

```tsx
<form>
  <IonList lines="none">
    <IonItem>
      <Controller
        name="email"
        control={control}
        render={() => <IonInput type="email" label="Email Address" labelPlacement="floating" />}
      />
    </IonItem>
    <IonItem>
      <Controller
        name="password"
        control={control}
        render={() => <IonInput type="password" label="Password" labelPlacement="floating" />}
      />
    </IonItem>
  </IonList>
</form>
```

Our form layout looks pretty good; the labels for our input fields will float once input is entered, the password field doesn't render plaintext, and the "sign in button" is clickable. Now it's time to wire up the form.

### Binding the Data

Our input fields look nice, but they don't know how to update the form hook when they are touched. Let's fix that:

```diff
<IonItem>
  <Controller
    name="email"
    control={control}
+   render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="email"
        label="Email Address"
        labelPlacement="floating"
+       value={value}
+       onIonBlur={onBlur}
+       onIonInput={(e) => onChange(e.detail.value!)}
      />
    )}
  />
</IonItem>
<IonItem>
  <Controller
    name="password"
    control={control}
+   render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="password"
        label="Password"
        labelPlacement="floating"
+       value={value}
+       onIonBlur={onBlur}
+       onIonInput={(e) => onChange(e.detail.value!)}
      />
    )}
  />
</IonItem>
```

For now, our "sign in" button will just print out to the console:

```tsx
<IonButton expand="full" onClick={handleSubmit((data) => console.log(data))}>
  Sign In
  <IonIcon slot="end" icon={logInOutline} />
</IonButton>
```

Give the form a spin! We've successfully bound our form, but we don't have any way to make sure the user fills out both fields, or if they're entering a valid email address.

### Disabling the Sign In Button

We can use Yup to validate our input fields and disable the "sign in" button if the form is valid.

I'll show you how to import the dependencies we need because it is a little different than we're used to:

```typescript
import * as yup from 'Yup';
import { yupResolver } from '@hookform/resolvers/yup';
```

Your IDE _might_ not pick these up. With our import in place, let's write a function that represents our validation schema.

Place the following function _outside_ of the component definition in `src/login/LoginPage.tsx`:

```typescript
const validationSchema = yup.object({
  email: yup.string().required().email().label('Email address'),
  password: yup.string().required().label('Password'),
});
```

Next, update the line of code that creates our form hook:

```typescript
const {
  handleSubmit,
  control,
  formState: { errors, isValid, touchedFields, dirtyFields },
} = useForm<LoginInputs>({ mode: 'onTouched', resolver: yupResolver(validationSchema) });
```

Let's write unit tests that define when the button should be enabled or disabled. Add the following `describe()` block under the existing unit tests.

```tsx
describe('sign in button', () => {
  it('starts disabled', async () => {
    render(<LoginPage />);
    const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
    expect(button.disabled).toBeTruthy();
  });

  it('is enabled once valid data is entered', async () => {
    render(<LoginPage />);
    const button = await waitFor(() => screen.getByText('Sign In') as HTMLIonButtonElement);
    const password = await waitFor(() => screen.getByLabelText('Password'));
    const email = await waitFor(() => screen.getByLabelText('Email Address'));
    expect(button.disabled).toBeTruthy();
    await waitFor(() => fireEvent.input(email, { target: { value: 'test@test.com' } }));
    expect(button.disabled).toBeTruthy();
    await waitFor(() => fireEvent.input(password, { target: { value: 'password' } }));
    expect(button.disabled).toBeFalsy();
  });
});
```

Finally, add logic to determine whether or not the "sign in" button should be disabled.

```tsx
<IonButton expand="full" onClick={handleSubmit((data) => console.log(data))} disabled={!isValid}>
```

### Error Handling

Logic is in place to keep users from pressing the "sign in" button if they don't provide a valid email address or password, but we don't yet have a way to present that information to the user.

First add unit tests that test the error messages we want to display to users. Add the following `describe()` block within the component's describe block.

```tsx
describe('error messages', () => {
  it('displays an error if the e-mail address is dirty and empty', async () => {
    render(<LoginPage />);
    const email = await waitFor(() => screen.getByLabelText('Email Address'));
    await waitFor(() => fireEvent.input(email, { target: { value: 'test@test.com' } }));
    await waitFor(() => fireEvent.blur(email));
    await waitFor(() => fireEvent.input(email, { target: { value: '' } }));
    await waitFor(() => expect(screen.getByText(/Email address is a required field/)).toBeInTheDocument());
  });

  it('displays an error if the email address has an invalid format', async () => {
    render(<LoginPage />);
    const email = await waitFor(() => screen.getByLabelText('Email Address'));
    await waitFor(() => fireEvent.input(email, { target: { value: 'test' } }));
    await waitFor(() => fireEvent.blur(email));
    await waitFor(() => expect(screen.getByText(/Email address must be a valid email/)).toBeInTheDocument());
  });

  it('displays an error message if the password is dirty and empty', async () => {
    render(<LoginPage />);
    const password = await waitFor(() => screen.getByLabelText('Password'));
    await waitFor(() => fireEvent.input(password, { target: { value: '' } }));
    await waitFor(() => fireEvent.blur(password));
    await waitFor(() => expect(screen.getByText(/Password is a required field/)).toBeInTheDocument());
  });
});
```

`IonInput` allows us to supply helper and error text inside of an input! Let's update our component template:

```diff
<IonItem>
  <Controller
    name="email"
    control={control}
    render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="email"
        ...
+       errorText={errors.email?.message}
      />
    )}
  />
</IonItem>
<IonItem>
  <Controller
    name="password"
    control={control}
    render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="password"
        ...
+       errorText={errors.password?.message}
      />
    )}
  />
</IonItem>
```

Error text will not be displayed unless the `ion-invalid` and `ion-touched` classes are added to an `IonInput`. This ensures errors are not shown before the user has a chance to enter data.

Let's write a function that will give us the correct classes to add to an `IonInput`. Add this function _inside_ the component definition:

```typescript
const getClassNames = (field: keyof LoginInputs) =>
  [
    errors[field] ? 'ion-invalid' : 'ion-valid',
    touchedFields[field] ? 'ion-touched' : 'ion-untouched',
    dirtyFields[field] ? 'ion-dirty' : 'ion-pristine',
  ].join(' ');
```

Finally, add the `className` prop to each `IonInput`:

```diff
<IonItem>
  <Controller
    name="email"
    control={control}
    render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="email"
        ...
+       className={getClassNames('email')}
      />
    )}
  />
</IonItem>
<IonItem>
  <Controller
    name="password"
    control={control}
    render={({ field: { onChange, onBlur, value } }) => (
      <IonInput
        type="password"
        ...
+       className={getClassNames('password')}
      />
    )}
  />
</IonItem>
```

## Conclusion

We have learned how to create a new page and add it to our router. We also learned how to handle component events to create a login form. Next we are going to supply our application with an authentication mechanism.
