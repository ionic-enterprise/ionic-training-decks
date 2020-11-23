# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes

## Create the Page

First we will create a unit test for our new page. This test will have start with one simple test that verifies the correct title is displayed. This essentially just shows that the page itself can be mounted and rendered. Create a `tests/unit/views/Login.spec.ts` file with the following contents:

```typescript
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Login from '@/views/Login.vue';

describe('Login.vue', () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Login }],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    });
  });

  it('displays the title', () => {
    const titles = wrapper.findAllComponents('ion-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('Login');
  });
});
```

Let's just start with a skeleton page that will display the inputs properly and has a nice button on the bottom.

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
          <ion-input type="email" data-testid="email-input"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input type="password" data-testid="password-input"></ion-input>
        </ion-item>
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="full">
          Sign In
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
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
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Login',
    components: {
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
    },
    setup() {
      return { logInOutline };
    },
  });
</script>
```

## Routing

We would like to lazy load the Login view using the `/login` path. Open the `src/router/index.ts` file and add the following configuration for that route:

```typescript
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
```

## Validations

Form validation is not built in to Vue, but there are a couple of libraries that will help you with your form validation needs:

- <a href="https://vuelidate-next.netlify.app/#installation" target="_blank">Vuelidate</a>: model based validate, validates the data
- <a href="https://vee-validate.logaretm.com/v4/" target="_blank">Vee-Validate</a>: template based validation, validates the inputs

Both of these libraries work well and are highly capable of doing the job. The question comes down to which one will work best for your team and your application.

For the purpose of this training application, we will use Vuelidate. It is light-weight, easy to configure, and does exactly what we need it to do.

### Install Vuelidate

We will need to install two packages: `@vuelidate/core` and `@vuelidate/validators`. As of the time of this writing, these two packages are both in Alpha. We will not worry about that, though, as testing shows that they are working fine for our needs.

```bash
$ npm i @vuelidate/{core,validators}
```

Next we will need to perform some simple setup in our `src/main.ts` file as well as any unit tests we have for components that will use Vuelidate (currently just ``).

In `src/main.ts`, import the `VuelidatePlugin` and use it when we create the app.

```TypeScript
import { VuelidatePlugin } from '@vuelidate/core';
...
const app = createApp(App).use(IonicVue).use(router).use(VuelidatePlugin);
```

In `tests/unit/views/Login.spec.ts`, import the `VuelidatePlugin` and list it as a plugin when mounting the component.

```TypeScript
import { VuelidatePlugin } from '@vuelidate/core';
...
    wrapper = mount(Login, {
      global: {
        plugins: [router, VuelidatePlugin],
      },
    });
```

### Set up the Models

We have two bits of information to get from the user. Their email address and their password. So let's create a `data()` object for those now.

```TypeScript
export default defineComponent({
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
    };
  },
...
});
```

Since Vuelidate works on the models, it makes sense that we will need to define our validations in a similar manner. So let's think about what validations may be required for each of these values. First, both values are required. Second, the `email` must have a valid email address format. Let's set those up.

```TypeScript
import { email, required } from '@vuelidate/validators';

export default defineComponent({
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  validations() {
    return {
      email: { email, required },
      password: { required },
    };
  },
...
});
```

As you can see, setting up the validations for our view was very similar to how we set up the data model for our view. Not everything we have in the data model needs to be validated, but anything we are validating needs to be expressed as part of our data model.

This configuration created an object for us called `$v` and we can have a look at it now by adding `<pre>{{ $v }}</pre>` at the end of the `ion-content` area of our Login page, right after the `ion-list` that contains our inputs. Do that now and have a look at it in the browser. You should see an object like this:

```JSON
{
  "$dirty": false,
  "$model": null,
  "$error": false,
  "$errors": [],
  "$invalid": false,
  "$anyDirty": false,
  "$pending": false,
  "email": {
    "$dirty": false,
    "email": {
      "$message": "Value is not a valid email address",
      "$params": {},
      "$pending": false,
      "$invalid": false
    },
    "required": {
      "$message": "Value is required",
      "$params": {},
      "$pending": false,
      "$invalid": false
    },
    "$invalid": false,
    "$pending": false,
    "$error": false,
    "$errors": [],
    "$model": "",
    "$anyDirty": false
  },
  "password": {
    "$dirty": false,
    "required": {
      "$message": "Value is required",
      "$params": {},
      "$pending": false,
      "$invalid": false
    },
    "$invalid": false,
    "$pending": false,
    "$error": false,
    "$errors": [],
    "$model": "",
    "$anyDirty": false
  }
}
```

Notice that the `email` and `password` objects both have a `$model` value. This property is directly tied to the model value we set up in our `data()` object, so we can use it as a `v-model` in our inputs. Let's configured our inputs right now to use it.

```html
<ion-item>
  <ion-label position="floating">Email</ion-label>
  <ion-input
    type="email"
    v-model.trim="$v.email.$model"
    data-testid="email-input"
  ></ion-input>
</ion-item>

<ion-item>
  <ion-label position="floating">Password</ion-label>
  <ion-input
    type="password"
    v-model.trim="$v.password.$model"
    data-testid="password-input"
  ></ion-input>
</ion-item>
```

Play around with entering text in the email and password inputs and note how the `$v` objects changes depending on the shape of the data. Now change the `<pre>` tag to display `$v.$errors` and play around some more.

### Display Messages

Now that we have a good idea of how the validations are working, remove the `<pre>` tag from the template and replace it with an area where we will display the validation messages.

```html
<div class="error-message ion-padding" data-testid="message-area"></div>
```

Create a test that shows that our validations are set up properly by verifying that the user receives proper messages as they enter their data.

```TypeScript
  it('displays messages as the user enters invalid data', async () => {
    wrapper.vm.$v.email.$model = '';
    wrapper.vm.$v.password.$model = '';
    await wrapper.vm.$v.$reset();

    const email = wrapper.findComponent('[data-testid="email-input"]');
    const password = wrapper.findComponent('[data-testid="password-input"]');
    const msg = wrapper.find('[data-testid="message-area"]');

    expect(msg.text()).toBe('');

    await email.setValue('foobar');
    expect(msg.text()).toBe('email: Value is not a valid email address');

    await email.setValue('');
    expect(msg.text()).toBe('email: Value is required');

    await email.setValue('foobar@baz.com');
    expect(msg.text()).toBe('');

    await password.setValue('mypassword');
    expect(msg.text()).toBe('');

    await password.setValue('');
    expect(msg.text()).toBe('password: Value is required');

    await password.setValue('mypassword');
    expect(msg.text()).toBe('');
  });
```

We can then fill in the `message-area` with some markup that processes our error messages.

```html
<div class="error-message ion-padding" data-testid="message-area">
  <div v-for="(error, idx) of $v.$errors" :key="idx">
    {{ error.$property }}: {{ error.$message }}
  </div>
</div>
```

**Note**: would could easily <a href="https://vuelidate-next.netlify.app/custom_validators.html#custom-error-messages">customize the messages</a> if we wanted to, but for now let's just use the out-of-the-box messages.

Let's also give our error messages a little styling (globally) by adding the following within `App.vue`

```css
<style>
.error-message {
  color: var(--ion-color-danger, ##ff0000);
}
</style>
```

### Disable button

We also need to disable the button until we have valid data that has been entered. Here is the test that verifies the requirement:

```typescript
it('has a disabled signin button until valid data is entered', async () => {
  wrapper.vm.$v.email.$model = '';
  wrapper.vm.$v.password.$model = '';
  await wrapper.vm.$v.$reset();

  const button = wrapper.findComponent('[data-testid="signin-button"]');
  const email = wrapper.findComponent('[data-testid="email-input"]');
  const password = wrapper.findComponent('[data-testid="password-input"]');

  expect(button.attributes().disabled).toBe('true');

  await email.setValue('foobar');
  expect(button.attributes().disabled).toBe('true');

  await password.setValue('mypassword');
  expect(button.attributes().disabled).toBe('true');

  await email.setValue('foobar@baz.com');
  expect(button.attributes().disabled).toBe('false');
});
```

## Conclusion

We now have a (mostly) funcitonal login page. The only problems are that we have to manually navigate to it, and it doesn't actuall perform the login. Before we fix that far we are going to need to need to create a couple of services. We will do that next.
