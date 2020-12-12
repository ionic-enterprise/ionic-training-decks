# Lab: Create the Authentication Workflow

So far, we have a couple of services that handle authentication and the storage of the session. We have also created a simple Vuex store that is managing the state of the session within our application. It is now time to put all of theses pieces together to create an authentication workflow.

state this lab you will need to:

- Handle the Login
- Handle the Logout
- Navigate when the session state changes
- Guard the routes that require a session

## Handle the Login

When the user clicks on the "Sign On" button in the Login view, we need to dispatch the `login` action along with the credentials. If the login fails, we need to display an error message.

The first thing we are going to need to do in the test is make sure our store is available. For our purposes, we also need to make sure it has a mocked `dispatch()`. Here is the synposis of the changes to the setup code:

- import `flushPromises` and our `store`
- mock the `store.dispatch`
- add `store` to the plugins when mounting the component

```typescript
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { VuelidatePlugin } from '@vuelidate/core';
import { createRouter, createWebHistory } from '@ionic/vue-router';
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
    wrapper.vm.$v.email.$model = 'test@test.com';
    wrapper.vm.$v.password.$model = 'test';
    wrapper.vm.email = wrapper.vm.$v.email.$model;
    wrapper.vm.password = wrapper.vm.$v.password.$model;
    await wrapper.vm.$nextTick();
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

  it('does not show an error if the login succeeds', async () => {
    const button = wrapper.findComponent('[data-testid="signin-button"]');
    const msg = wrapper.find('[data-testid="message-area"]');
    button.trigger('click');
    await flushPromises();
    expect(msg.text()).toBe('');
  });

  it('shows an error if the login fails', async () => {
    (store.dispatch as any).mockResolvedValue(false);
    const button = wrapper.findComponent('[data-testid="signin-button"]');
    const msg = wrapper.find('[data-testid="message-area"]');
    button.trigger('click');
    await flushPromises();
    expect(msg.text()).toBe('Invalid Email or Password. Please try again.');
  });
});
```

For the code, here are the pieces. It is up to you to find the correct spot in `src/views/Login.vue` to place each of these pieces.

First the one-liners:

- add an `errorMessage` field to the data object
- add a place to display the message within the "error message" area: `<div v-if="errorMessage">{{ errorMessage }}</div>`
- `import { mapActions } from 'vuex';`
- add a click event binding to the button: `@click="signinClicked"`

Finally, we need to map our "login" action to a method in our component and write the `signinClicked()` method that we just bound to the button.

```typescript
  methods: {
    ...mapActions(['login']),
    async signinClicked() {
      const result = await this.login({
        email: this.email,
        password: this.password,
      });
      if (!result) {
        this.password = '';
        this.errorMessage = 'Invalid Email or Password. Please try again.';
      }
    },
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

First, remember the changes we needed to make in the Login page in order to inject a store with a mocked `dispatch()`? Make those again here. The following snippet should refresh your memory a bit.

```typescript
import  store  from '@/store'
...
describe('TeaList.vue' () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  beforeEach(async () => {
    store.dispatch = jest.fn();
...
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
  it('dispatches a logout action when the logout button is clicked', () => {
    const button = wrapper.findComponent('[data-testid="logout-button"]');
    button.trigger('click');
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith('logout');
  });
```

Back in the view's code, add a click handler to the logout button (`@click="$store.dispatch('logout')"`).

Test that out in the browser with the devtools open and you should see the proper actions and mutations displayed in the console.

## Handle the Routing on Login and Logout

We are currently performing the login and the logout, but we should also navigate appropriately when that session changes so the user does not have to do that themselves. Ideally, this is something that will also be centralized in the logic. We will implement this by modifying our App component to watch the session state and react accordingly.

### Add Getters to the Store

Before we do anything, let's add a getter for the session token and the user id to the store. This will allow us to refactor the structure of the state if we need to without breaking code in the rest of the application. Since the `getters` are highly dependent on the shape of the state, we will define them in the `src/store/state.ts` file instead of their own file.

In `src/store/state.ts`:

```TypeScript
export const getters = {
  sessionToken: (state: State) => state.session && state.session.token,
  userId: (state: State) => state.session && state.session.user.id,
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

### Update the App Component

In our App component, we want to watch the `userId` and perform some navigation if it changes. You could ask why not just watch the session itself or perhaps the token, but those can change without the user changing (in the case of a token refresh, for example).

We will not _really_ test this, but we will need to modify the way the test is structured so all the right stuff is injected into the component:

```TypeScript
import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import store from '@/store';

import App from '@/App.vue';

describe('App.vue', () => {
  let router: any;
  let wrapper: VueWrapper<any>;
  beforeEach(async () => {
    store.commit('SET_SESSION', {
      token: '1234',
      user: {
        id: 14,
        firstName: 'Tony',
        lastName: 'Test',
        email: 'tony@test.com',
      }
    });
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: App }],
    });
    router.push('/');
    await router.isReady();
    wrapper = shallowMount(App, {
      global: {
        plugins: [router, store],
      },
    });
  });

  it('renders', () => {
    expect(wrapper.exists()).toBeTruthy();
  });
});
```

In the code we first need to import a couple of items.

```typescript
import { mapGetters } from 'vuex';
import { useRouter } from 'vue-router';
```

Then we need to make the `userId` and the `router` available and known to our component.

```typescript
export default defineComponent({
  ...
  computed: mapGetters(['userId']),
  setup() {
    const router = useRouter();
    return { router };
  },
  ...
});
```

Finally, we need to navigate to either the root route or the login page under two conditions: the App component is mounted (meaning that the app is just starting up) or the `userId` changes (meaning that the user logged in, logged out, or the session was cleared because of a 401 error).

```typescript
export default defineComponent({
  ...
  methods: {
    navigate(): void {
      this.router.replace(this.userId ? '/' : '/login');
    },
  },
  mounted() {
    this.navigate();
  },
  watch: {
    userId() {
      this.navigate();
    },
  },
});
```

Excellent!! Now when we log in and out the application navigates appropriately.

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

function checkAuthStatus(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const loggedIn = !!store.state.session;
  if (to.matched.some(r => !loggedIn && r.meta.requiresAuth)) {
    return next('/login');
  }
  next();
}
```

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

You will need to update the headers.

```TypeScript
import axios, { AxiosRequestConfig } from 'axios';
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
      store.dispatch('clear');
    }
    return Promise.reject(error);
  },
);
```

## Conclusion

We now have a fully operational authentication workflow within our application.
