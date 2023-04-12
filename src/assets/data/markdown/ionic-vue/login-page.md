# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes

## Create the Page

First we will create a unit test for our new page. This test will start with one simple test that verifies the correct title is displayed. This essentially just shows that the page itself can be mounted and rendered. Create a `src/views/__tests__/LoginPage.spec.ts` file with the following contents:

```typescript
import LoginPage from '@/views/LoginPage.vue';
import { IonTitle } from '@ionic/vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('LoginPage.vue', () => {
  it('displays the title', () => {
    const wrapper = mount(LoginPage);
    const titles = wrapper.findAllComponents(IonTitle) as Array<VueWrapper>;
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

    <ion-content class="ion-padding">
      <ion-input
        type="email"
        name="email"
        label="Email"
        label-placement="floating"
        data-testid="email-input"
      ></ion-input>

      <ion-input
        type="password"
        name="password"
        label="Password"
        label-placement="floating"
        data-testid="password-input"
      ></ion-input>
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

We will need to install two packages: `vee-validate` and `yup`. The last package is completely optional, but we will use it in this application to avoid having to write our own validations.

```bash
npm i vee-validate yup
```

### Set up the Models

Switching back to the view file, we have two bits of information to get from the user: their email address and their password. We will use the `useField` composition API from vee-validate to create the models for those inputs. The string passed to the `useField()` function is the value for the associated input's `name`. The following code belongs in the `script` section.

```typescript
import { useForm, useField } from 'vee-validate';

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
```

Let's also hook up the `v-model` on the inputs at this point. For example:

```html
<ion-input type="email" name="email" v-model="email" data-testid="email-input"></ion-input>
```

With Vee-Validate, we will create a validation schema that defines how to validate the fields in our form. To do this, we will also use a library called `yup` to help us with our validations.

```typescript
import { object as yupObject, string as yupString } from 'yup';

const validationSchema = yupObject({
  email: yupString().email().required().label('Email Address'),
  password: yupString().required().label('Password'),
});
const { errors } = useForm({ validationSchema });

const { value: email } = useField('email');
const { value: password } = useField('password');
```

This configuration exposed an object for us called `errors` and we can have a look at it now by adding `<pre>{{ errors }}</pre>` at the end of the `ion-content` area of our Login page, right after the `ion-list`. Do that now and have a look at it in the browser. Play around with entering and removing text in the email and password inputs and note how the `errors` object changes depending on the shape of the data. It should look _something_ like this, depending on the data you have entered:

```json
{
  "email": "Email Address must be a valid email",
  "password": "Password is a required field"
}
```

### Display Messages

Now that we have a good idea of how the validations are working, remove the `<pre>` tag from the template. We will use the <a href="https://ionicframework.com/docs/api/input#helper--error-text" target="_blank">error-text</a> attribute to display the error messages. Here is how we bind the errors for the email input:

```html
<ion-input
  type="email"
  name="email"
  label="Email"
  v-model="email"
  label-placement="floating"
  data-testid="email-input"
  :error-text="errors.email || 'valid'"
></ion-input>
```

Create a similar property binding on the password input.

If you try this out in the web browser, though, you will see that the messages are not displayed. 🤔

Having another look at <a href="https://ionicframework.com/docs/api/input#helper--error-text" target="_blank">the docs</a> we see that in order for the message to be displayed, the input needs to have two classes applied: `ion-touched` and `ion-invalid`. Let's work on setting those appropriately now.

#### Setting `ion-touched`

We want to apply `ion-touched` when the user has entered and then leaves the input. That is, we want to do apply this on `ionBlur`. First we will write some tests for this. In `src/views/__tests__/LoginPage.spec.ts` add a `describe()` section for the email input and add the following tests to it:

```typescript
describe('email input', () => {
  it('starts untouched', () => {
    const wrapper = mount(LoginPage);
    const email = wrapper.findComponent('[data-testid="email-input"]');
    expect(email.classes()).not.toContain('ion-touched');
  });

  it('obtains ion-touched on blur', async () => {
    const wrapper = mount(LoginPage);
    const email = wrapper.findComponent('[data-testid="email-input"]');
    (email as VueWrapper<any>).vm.$emit('ionBlur', { target: email.element });
    expect(email.classes()).toContain('ion-touched');
  });
});
```

We can then add code to the `LoginPage.vue` file accomplish this:

```typescript
const markTouched = (evt: Event) => {
  (evt.target as Element).classList.add('ion-touched');
};
```

And add an event binding on the `ion-input`:

```html
<ion-input
  type="email"
  name="email"
  label="Email"
  v-model="email"
  label-placement="floating"
  data-testid="email-input"
  :error-text="errors.email || 'valid'"
  @ionBlur="markTouched"
></ion-input>
```

**Code Challenge:** add a similar test section and tests for the password input and bind `markTouched` there as well.

#### Setting `ion-valid` and `ion-invalid`

Our final goal is to add or remove the `ion-valid` and `ion-invalid` classes based the status of the validations as reflected by the `errors` object.

Due to <a href="https://github.com/logaretm/vee-validate/issues/3538" target="_blank">a quirk in how vee-validate works</a> we need to install and use the <a href="https://www.npmjs.com/package/wait-for-expect" target="_blank">wait-for-expect</a> package.

```
npm i -D wait-for-expect
```

In the test:

```typescript
import waitForExpect from 'wait-for-expect';
```

We can now create a tests that exercise a couple of different scenarios to ensure that the classes are set properly. Add the following tests within the "email input" `describe()` block:

```typescript
it('is marked invalid or valid based on format', async () => {
  const wrapper = mount(LoginPage);
  const email = wrapper.findComponent('[data-testid="email-input"]');
  await email.setValue('test');
  await waitForExpect(() => expect(email.classes()).not.toContain('ion-valid'));
  await waitForExpect(() => expect(email.classes()).toContain('ion-invalid'));
  await email.setValue('test@testy.com');
  await waitForExpect(() => expect(email.classes()).not.toContain('ion-invalid'));
  await waitForExpect(() => expect(email.classes()).toContain('ion-valid'));
});

it('is marked valid or invalid based on being required', async () => {
  const wrapper = mount(LoginPage);
  const email = wrapper.findComponent('[data-testid="email-input"]');
  await waitForExpect(() => expect(email.classes()).not.toContain('ion-invalid'));
  await email.setValue('test@testy.com');
  await waitForExpect(() => expect(email.classes()).not.toContain('ion-invalid'));
  await waitForExpect(() => expect(email.classes()).toContain('ion-valid'));
  await email.setValue('');
  await waitForExpect(() => expect(email.classes()).not.toContain('ion-valid'));
  await waitForExpect(() => expect(email.classes()).toContain('ion-invalid'));
});
```

Since Vee-Validate does all of its work asynchronously, we cannot rely on the `errors` object to contain the proper data within an `ionInput` or `ionChanged` handler. Instead, let's watch the object itself. First, though, we need to get a reference to the input.

In the `template` section, add a ref to the input as such:

```html
<ion-input
  ref="emailInput"
  type="email"
  name="email"
  label="Email"
  v-model="email"
  label-placement="floating"
  data-testid="email-input"
  :error-text="errors.email || 'valid'"
  @ionBlur="markTouched"
></ion-input>
```

Then define it in the `script` section as well:

```typescript
import { ref, watch } from 'vue';

const emailInput = ref(null);
```

Now we can watch the `errors` object and set the classes as needed:

```typescript
watch(errors, (newValue: { email?: string; password?: string }) => {
  if (newValue.email) {
    setInvalid((emailInput.value as any)?.$el);
  } else {
    setValid((emailInput.value as any)?.$el);
  }
});

const setInvalid = (el?: Element) => {
  el?.classList.remove('ion-valid');
  el?.classList.add('ion-invalid');
};

const setValid = (el?: Element) => {
  el?.classList.remove('ion-invalid');
  el?.classList.add('ion-valid');
};
```

**Code Challenge:** now do the same set of tasks for the password input. Note that you will only need a test for the "required" validation.

If you try this in the web browser now, you should notice the following behavior:

1. It gives the user a chance to enter a valid email address.
1. It displays an error message, though, if the user leaves the email field with an invalidly formed email address.

### Disable button

We also need to disable the button until we have valid data that has been entered. Here is the test that verifies the requirement:

```typescript
describe('sign in button', () => {
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
});
```

The `useForm()` function returns an object called `meta` that contains data about the form's validation state. Let's grab that in our `script` section so it is available in our view's template:

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
