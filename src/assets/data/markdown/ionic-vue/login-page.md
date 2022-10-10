# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes

## Create the Page

First we will create a unit test for our new page. This test will start with one simple test that verifies the correct title is displayed. This essentially just shows that the page itself can be mounted and rendered. Create a `tests/unit/views/LoginPage.spec.ts` file with the following contents:

```typescript
import LoginPage from '@/views/LoginPage.vue';
import { mount, VueWrapper } from '@vue/test-utils';

describe('LoginPage.vue', () => {
  it('displays the title', () => {
    const wrapper = mount(LoginPage);
    const titles = wrapper.findAllComponents('ion-title') as Array<VueWrapper>;
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('Login');
  });
});
```

For the contents of `src/views/LoginPage.vue`, let's just start with a skeleton page that will display the inputs properly and has a nice button on the bottom.

```html
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" name="email" data-testid="email-input"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input type="password" name="password" data-testid="password-input"></ion-input>
        </ion-item>
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="full" data-testid="signin-button">
          Sign In
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
  import {
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
  } from '@ionic/vue';
  import { logInOutline } from 'ionicons/icons';
</script>
```

## Routing

We would like to lazy load the LoginPage view using the `/login` path. Open the `src/router/index.ts` file and add the route. This will look a lot like the existing `/tea` route with the following changes:

- the `path` and `name` will be different
- in order to perform lazy loading, the `component` will be specified as: `component: () => import('@/views/LoginPage.vue')`

You can test that you have the route set up properly by replacing `/teas` with `/login` in the URL bar of your browser.

## Validations

Form validation is not built in to Vue, but there are a couple of libraries that will help you with your form validation needs:

- <a href="https://vuelidate-next.netlify.app/#installation" target="_blank">Vuelidate</a>: model based validate, validates the data
- <a href="https://vee-validate.logaretm.com/" target="_blank">Vee-Validate</a>: template based validation, validates the inputs

Both of these libraries work well and are highly capable of doing the job. The question comes down to which one will work best for your team and your application.

For the purpose of this training application, we will use Vee-Validate. It is light-weight, easy to configure, and does exactly what we need it to do.

### Install Vee-Validate

We will need to install two packages: `vee-validate@next` and `yup`. The last package is completely optional, but we will use it in this application to avoid having to write our own validations.

```bash
npm i vee-validate@next yup
```

### Set up the Models

Switching back to the view file, we have two bits of information to get from the user: their email address and their password. We will use the `useField` composition API from vee-validate to create the models for those inputs. The string passed to the `useField()` function is the value for the associated input's `name`. The following code belongs in the `script setup` section.

```TypeScript
import { useForm, useField } from 'vee-validate';
...
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
```

Let's also hook up the `v-model` on the inputs at this point. For example:

```html
<ion-input type="email" name="email" v-model="email" data-testid="email-input"></ion-input>
```

With Vee-Validate, we will create a validation schema that defines how to validate the fields in our form. To do this, we will also use a library called `yup` to help us with our validations.

```TypeScript
...
import { object as yupObject, string as yupString } from 'yup';
...
const validationSchema = yupObject({
  email: yupString().required().email().label("Email Address"),
  password: yupString().required().label("Password"),
});

const { errors } = useForm({ validationSchema });

const { value: email } = useField("email");
const { value: password } = useField("password");
```

This configuration exposed an object for us called `errors` and we can have a look at it now by adding `<pre>{{ errors }}</pre>` at the end of the `ion-content` area of our Login page, right after the `ion-list`. Do that now and have a look at it in the browser. You should see an object like this:

```JSON
{
  "email": "Email Address must be a valid email",
  "password": "Password is a required field"
}
```

Play around with entering text in the email and password inputs and note how the `errors` object changes depending on the shape of the data.

### Display Messages

Now that we have a good idea of how the validations are working, remove the `<pre>` tag from the template and replace it with an area where we will display the validation messages.

```html
<div class="error-message ion-padding" data-testid="message-area"></div>
```

Vee-validate does all of its work asynchronously, so we need to wait for all of the promises to complete before we check any message values. We will use the `flushPromises()` function from the testing utilities to help us out here, but first we will need to add it to the import from `@vue/test-utils`.

```typescript
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
```

Due to <a href="https://github.com/logaretm/vee-validate/issues/3538" target="_blank">a quirk in how vee-validate works</a> we will also need to install and use the <a href="https://www.npmjs.com/package/wait-for-expect" target="_blank">wait-for-expect</a> package.

```
npm i -D wait-for-expect
```

In the test:

```typescript
import waitForExpect from 'wait-for-expect';
```

We can now create a test that shows that our validations are set up properly by verifying that the user receives proper messages as they enter their data.

```TypeScript
  it('displays messages as the user enters invalid data', async () => {
    const wrapper = mount(LoginPage);
    const email = wrapper.findComponent('[data-testid="email-input"]');
    const password = wrapper.findComponent('[data-testid="password-input"]');
    const msg = wrapper.find('[data-testid="message-area"]');

    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await email.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Email Address must be a valid email'));

    await email.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Email Address is a required field'));

    await email.setValue('foobar@baz.com');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await password.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Password is a required field'));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));
  });
```

We can then fill in the `message-area` with some markup that processes our error messages.

```html
<div class="error-message ion-padding" data-testid="message-area">
  <div v-for="(error, idx) of errors" :key="idx">{{ error }}</div>
</div>
```

Let's also give our error messages a little styling (globally) by adding the following within `App.vue`

```css
<style>
.error-message {
  color: var(--ion-color-danger, #ff0000);
  font-size: small;
}
</style>
```

### Disable button

We also need to disable the button until we have valid data that has been entered. Here is the test that verifies the requirement:

```typescript
it('has a disabled signin button until valid data is entered', async () => {
  const wrapper = mount(LoginPage);
  const button = wrapper.find('[data-testid="signin-button"]');
  const email = wrapper.findComponent('[data-testid="email-input"]');
  const password = wrapper.findComponent('[data-testid="password-input"]');

  await flushPromises();
  await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

  await email.setValue('foobar');
  await flushPromises();
  await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

  await password.setValue('mypassword');
  await flushPromises();
  await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));

  await email.setValue('foobar@baz.com');
  await flushPromises();
  await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
});
```

The `useForm()` function returns an object called `meta` that contains data about the form's validation state. Let's grab that in our `script setup` section so it is available in our view's template:

```typescript
const { errors, meta } = useForm({ validationSchema });
```

We can then bind the button's `disabled` attribute to be disabled so long as the form is not valid:

```html
<ion-button expand="full" data-testid="signin-button" :disabled="!meta.valid">
  Sign In
  <ion-icon slot="end" :icon="logInOutline"></ion-icon>
</ion-button>
```

### Code Challenge: Computed Values

Have a look at how we are binding the `disabled` attribute: `:disabled="!meta.valid"`. That is not very easy to read. Future you will have to go down to the code to figure out what `meta` means. It would be better if the binding was more like `:disabled="formIsInvalid"`.

The most natural way to compute a value based on another and ensure that the view is updated properly is to use Vue's <a href="https://vuejs.org/api/reactivity-core.html#computed" target="_blank">Computed Values</a>. Create a computed value named `formIsInvalid` and bind it instead. Note that `meta` is a <a href="https://vuejs.org/api/reactivity-core.html#ref" target="_blank">reactive ref object</a>. As such you will need to get at the data via its `value` property.

## Conclusion

We now have a (mostly) functional login page. The only problems are that we have to manually navigate to it, and it doesn't actually perform the login. Before we fix that far we are going to need to need to create a couple of services. We will do that next.
