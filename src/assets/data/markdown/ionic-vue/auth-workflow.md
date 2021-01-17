# Lab: Create the Authentication Workflow

So far, we have a couple of services that handle the authentication and the storage of the session. We have also created a simple Vuex store that is managing the state of the session within our application. It is now time to put all of theses pieces together to create an authentication workflow.

In this lab you will add the following capabilities:

- Handle the Login
- Handle the Logout
- Navigate when the session state changes
- Guard the routes that require a session

## Handle the Login

When the user clicks on the "Sign On" button in the Login view, we need to satisfy the following requirements:

- Perform the login (that is, dispatch the `login` action along with the credentials).
- If the login fails, we need to display an error message.
- If the login succeeds, we do not need to do anything.

The first thing we are going to need to do in the test is make sure our store and the router are available. For our purposes, we also need to make sure the store has a mocked `dispatch()`. Here is the synposis of the changes to the setup code:

- import `flushPromises` and our `store`
- import `createRouter` and `createWebHistory`
- mock the `store.dispatch`
- create the router and wait for it to be ready
- add `store` to the plugins when mounting the component

```typescript
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { VuelidatePlugin } from '@vuelidate/core';

import store from '@/store';
import Login from '@/views/Login.vue';

describe('Login.vue', () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  beforeEach(async () => {
    store.dispatch = jest.fn().mockResolvedValue(true);
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Login }],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(Login, {
      global: {
        plugins: [router, store, VuelidatePlugin],
      },
    });
  });
...
});
```

Now we are ready to define the requirements via a set of tests:

```typescript
describe('clicking the sign on button', () => {
  beforeEach(async () => {
    const email = wrapper.findComponent('[data-testid="email-input"]');
    const password = wrapper.findComponent('[data-testid="password-input"]');
    await email.setValue('test@test.com');
    await password.setValue('test');
  });

  it('dispatches the login action with the credentials', () => {
    const button = wrapper.findComponent('[data-testid="signin-button"]');
    button.trigger('click');
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith('login', {
      email: 'test@test.com',
      password: 'test',
    });
  });

  describe('if the login succeeds', () => {
    beforeEach(() => {
      (store.dispatch as any).mockResolvedValue(true);
    });

    it('does not show an error', async () => {
      const button = wrapper.findComponent('[data-testid="signin-button"]');
      const msg = wrapper.find('[data-testid="message-area"]');
      button.trigger('click');
      await flushPromises();
      expect(msg.text()).toBe('');
    });

    it('navigates to the root page', async () => {
      const button = wrapper.findComponent('[data-testid="signin-button"]');
      router.replace = jest.fn();
      button.trigger('click');
      await flushPromises();
      expect(router.replace).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('if the login succeeds', () => {
    beforeEach(() => {
      (store.dispatch as any).mockResolvedValue(false);
    });

    it('shows an error', async () => {
      const button = wrapper.findComponent('[data-testid="signin-button"]');
      const msg = wrapper.find('[data-testid="message-area"]');
      button.trigger('click');
      await flushPromises();
      expect(msg.text()).toContain(
        'Invalid Email or Password. Please try again.',
      );
    });

    it('does not navigate navigate', async () => {
      const button = wrapper.findComponent('[data-testid="signin-button"]');
      router.replace = jest.fn();
      button.trigger('click');
      await flushPromises();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
```

For the code, here are the pieces. It is up to you to find the correct spot in `src/views/Login.vue` to place each of these pieces.

First the one-liners:

- Add an `errorMessage` ref object similar to the `email` and `password` objects, be sure to expose it at the bottom of the `setup()`.
- Update the template to display the error message if there is one. Here is the markup: `<div v-if="errorMessage">{{ errorMessage }}</div>`. We already have an area where error messages should be displayed. This markup belong inside that area.
- `import { useRouter } from 'vue-router';`
- `import { useStore } from 'vuex';`
- Add a click event binding to the button: `@click="signinClicked"`.

Now we can define and expose our click handler. This is done within the `setup()` method as such:

```typescript
  setup() {
    ...
    const router = useRouter();
    const store = useStore();
    ...
    async function signinClicked() {
      const result = await store.dispatch('login', {
        email: email.value,
        password: password.value,
      });
      if (!result) {
        password.value = '';
        errorMessage.value = 'Invalid Email or Password. Please try again.';
      } else {
        router.replace('/');
      }
    }

    return { email, errorMessage, logInOutline, password, v, signinClicked };
  },
```

Give that a test with the devtools open. You should see the logging from the store showing the appropriate stuff being done. So far so good.

## Handle the Logout

We can log in, but what about logging out? For now, we will add that to the Tea page.

Let's add the actual button first. In `src/views/TeaList.vue` add the following markup within the `ion-toolbar` that is in the header:

```HTML
        <ion-buttons slot="end">
          <ion-button data-testid="logout-button">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
```

Now we will need to go to the `script` tag and make some adjustments. First, where we are doing the imports, add the following:

- add `IonButton`, `IonButtons`, and `IonIcon` to the list of components being imported
- add `import { logOutOutline } from 'ionicons/icons';`

Then, were we define the component itself:

- add `IonButton`, `IonButtons`, and `IonIcon` to the `components` object
- add a `setup()` method with the following contents

```TypeScript
  setup() {
    return { logOutOutline };
  },
```

Now let's make that button actually do something. Specifically, let's make it log us out. Let's update the test to express that requirement.

First, remember the changes we needed to make in the Login page in order to inject the router and a store with a mocked `dispatch()`? Make those again here. The following snippet should refresh your memory a bit.

```typescript
...
import { createRouter, createWebHistory } from '@ionic/vue-router';
...
import  store  from '@/store'
...
describe('TeaList.vue' () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  beforeEach(async () => {
    store.dispatch = jest.fn().mockResolvedValue(undefined);
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: TeaList }],
    });
    router.push('/');
    await router.isReady();
    router.replace = jest.fn();
    wrapper = mount(Tea, {
      global: {
        plugins: [router, store],
      },
    });
  });
});
```

Next, express the requirement as a test.

```TypeScript
  it('dispatches a logout action when the logout button is clicked', async () => {
    const button = wrapper.findComponent('[data-testid="logout-button"]');
    await button.trigger('click');
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith('logout');
  });

  it('navigates to the login after the dispatch is complete', async () => {
    const button = wrapper.findComponent('[data-testid="logout-button"]');
    await button.trigger('click');
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });
```

Back in the view's code, add a click handler to the logout button (`@click="$store.dispatch('logout').then(() => $router.replace('/login'))"`).

Test that out in the browser with the devtools open and you should see the proper actions and mutations displayed in the console.

## Handle the Routing on Login and Logout

We are currently performing the login and the logout, but we should also navigate appropriately when that session changes so the user does not have to do that themselves. Ideally, this is something that will also be centralized in the logic. We will implement this by modifying our App component to watch the session state and react accordingly.

### Add Getters to the Store

Before we do anything, let's add a getter for the session token to the store. This will allow us to refactor the structure of the state if we need to without breaking code in the rest of the application. Since the `getters` are highly dependent on the shape of the state, we will define them in the `src/store/state.ts` file instead of their own file.

In `src/store/state.ts`:

```TypeScript
export const getters = {
  sessionToken: (state: State) => state.session && state.session.token,
}
```

In `src/store/index.ts`

```TypeScript
...
import { state, getters } from './state';
...
export default createStore({
  state,
  getters,
  mutations,
  actions,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

## Guard the Routes

There are some routes within our app where we do not want to allow users to go unless they are logged in. Let's create a guard for that. All of this work will be done within `src/router/index.js`

First, let's write the guard itself. Add a `checkAuthStatus()` function to the top of the file. You will need to import a few more items, so I put the imports in here as well.

```TypeScript
import { createRouter, createWebHistory } from '@ionic/vue-router';
import {
  NavigationGuardNext,
  RouteRecordRaw,
  RouteLocationNormalized,
} from 'vue-router';

import store from '@/store';
import TeaList from '../views/TeaList.vue';

async function checkAuthStatus(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  if (!store.state.session && to.matched.some(r => r.meta.requiresAuth)) {
    await store.dispatch('restore');
    if (!store.state.session) {
      return next('/login');
    }
  }
  next();
}
```

The guts of that function are:

- If we are not logged in, use `to.matched` to check each segment of the target route. If at least one segment in the route requires authentication, dispatch a "restore" as we may have a stored session. If we are still logged out after that, then redirect to the Login page.
- Otherwise (either we are logged in, or no segments required authentication), continue to the next hook in the pipeline.

Next, after we create the router, call the guard for each route change (code given in context, only add the appropriate line in your own code).

```TypeScript
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
```

Finally, mark the teas route as requiring authentication:

```TypeScript
  {
    path: '/teas',
    name: 'Teas',
    component: TeaList,
    meta: { requiresAuth: true },
  },
```

## Add Interceptors

We need to intercept outgoing requests and add the token if we have one. We also need to take a look at responses coming back from the server, and if we get a 401 we need to clear our store state as it is invalid. Make the appropriate modifications to `src/services/api.ts`.

You will need to update the imports.

```TypeScript
import axios, { AxiosRequestConfig } from 'axios';

import router from '@/router';
import store from '@/store';
```

After the client is created, you will need to add the interceptors.

```TypeScript
client.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = store.getters.sessionToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  response  => response,
  error => {
    if (error.response.status === 401) {
      store.dispatch('clear').then(() => router.replace('/login'));
    }
    return Promise.reject(error);
  },
);
```

## Linting

We have been developing for a bit now, but have not run `lint` at all. I suggest running lint early and often. At the very least, before any commit to `main` (or `master`) we should run `lint` and clean up any issues in our code. Let's do that now:

```bash
$ npm run lint
```

I have three errors. You may have more or fewer, depending on how you have followed along in the labs. Fix any linting issues that you have now. If you have any questions about how to fix anything, let's discuss them.

## Conclusion

We now have a fully operational authentication workflow within our application.
