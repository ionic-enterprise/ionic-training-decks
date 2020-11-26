# Lab: Manage the Session State

The application needs to know about the current state of the session. However, you will notice that both of our services are stateless. We could use `IdentityService.get()` each time we need to know if we have a session or not, but that seems wasteful. It would be better if we had something inside our application that was in charge of managing the state of the application for us. Enter <a href="https://next.vuex.vuejs.org" target="_blank">vuex</a>.

In this lab you will learn how to:

- Create Services
- Use the Capacitor Storage API

## Installation and Setup

First we need the Vuex package:

```bash
$ npm install vuex@next
```

Next, create a `src\store` folder and in there, create an `index.ts` file. Here is the template:

```typescript
import { createStore, createLogger } from 'vuex';

const debug = process.env.NODE_ENV !== 'production';

export default createStore({
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

Finally, use the store in our app. Add the following to the `src/main.ts` file:

- Add an import: `import store from './store'`
- Add `use(store)` to the chain of calls after `createApp(App)`

## State

The first thing we should do is define what our state looks like. We will do that

So far all we need is a session.

```typescript
interface State {
  session: Session | null;
}

const state = {
  session: null,
};
```

Then we can add the state to the store as such:

```typescript
export default createStore({
  state,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

## Mutations

Mutations are functions that are used to modify the state. The mutations that you define are the only items within your systen that modify the store's state. They are syncronous, and thus rarely access anything other than the state. This makes the very easy to test. First, though, let's export the mutations as a object from our store so we can easily test them.

In Vuex parlance, mutations are committed. They can be committed from anywhere in the code, but are most commonly committed from within the store, either fromk an action or from another mutation.

```typescript
export const mutations = {};
```

Then add a `tests/unit/store/mutations.spec.ts` file that we will use to test our mutations.

```typescript
import { mutations } from '@/store';
import { Session } from '@/models';

const session: Session = {
  user: {
    id: 314159,
    firstName: 'Pumpkin',
    lastName: 'Pi',
    email: 'ppi@math.org',
  },
  token: 'thisisnotatoken',
};

describe('root mutations', () => {
  describe('SET_SESSION', () => {});

  describe('CLEAR_SESSION', () => {});
});
```

Let's create a test for the `SET_SESSION` mutation:

```typescript
describe('SET_SESSION', () => {
  it('sets the session', () => {
    const state = { teas: [] };
    mutations.SET_SESSION(state, session);
    expect(state).toEqual({ teas: [], session });
  });
});
```

The point of the `teas` on the state is just to show we don't touch other parts of the state. It is not actually something that is a part of our root state (yet). The code in `src/state/index.ts` that satisfies this is pretty easy:

```typescript
export const mutations = {
  SET_SESSION: (state: State, session: Session) => (state.session = session),
};
```

**Code Challenge:** write the test and the code for the `CLEAR_SESSION` mutation. Have a look at the end of this lab if you run into issues or have questions.

Finally, include the mutations in your store:

```typescript
export default createStore({
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

## Actions

Actions are similar to mutations, the differences being that:

- Instead of mutating the state, actions commit mutations.
- Actions can contain arbitrary asynchronous operations.

In Vuex parlance, actions are "dispatched" from other portions of your application in order to act upon the state.

We will start with three distinct actions:

- login
- logout
- initialize

First create a `tests/unit/store/actions.ts` file with the following skeleton code:

```typescript
import { ActionContext } from 'vuex';
import { actions } from '@/store';
import AuthenticationService from '@/services/AuthenticationService';
import SessionService from '@/services/SessionService';
import { Session } from '@/models';

jest.mock('@/services/AuthenticationService');
jest.mock('@/services/SessionService');
const context: ActionContext<any, any> = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  state: {},
  rootGetters: {},
  rootState: {},
};

const session: Session = {
  token: '12341234',
  user: {
    id: 42,
    firstName: 'Douglas',
    lastName: 'Adams',
    email: 'fish@yummy.com',
  },
};

describe('root actions', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('login', () => {});

  describe('logout', () => {});

  describe('initialize', () => {});
});
```

In `src/store/index.ts`, create a skeleton for the `actions` as well:

```typescript
export const actions = {
  async login(
    { commit }: ActionContext<State, State>,
    credentials: { email: string; password: string },
  ): Promise<boolean> {
    return false;
  },

  async logout({ commit }: ActionContext<State, State>): Promise<void> {
    return undefined;
  },

  async initialize({ commit }: ActionContext<State, State>): Promise<void> {
    return undefined;
  },
};
```

**Note:** `ActionContext` will need to be imported from `vuex` at the top of the file.

### Logout

The logout is the most straight forward, so let's start there. We need to handle the logout with our API, clear the session storage, and commit the clearing of the session within the state. Here is what those requirements look like expressed as tests:

```typescript
describe('logout', () => {
  it('logs out', async () => {
    await actions.logout(context);
    expect(AuthenticationService.logout).toHaveBeenCalledTimes(1);
  });

  it('clears the session storage', async () => {
    await actions.logout(context);
    expect(SessionService.clear).toHaveBeenCalledTimes(1);
  });

  it('commits the CLEAR_SESSION mutation', async () => {
    await actions.logout(context);
    expect(context.commit).toHaveBeenCalledTimes(1);
    expect(context.commit).toHaveBeenCalledWith('CLEAR_SESSION');
  });
});
```

In the code, that translates to:

```typescript
...
import AuthenticationService from '@/services/AuthenticationService';
import SessionService from '@/services/SessionService';
...
export const actions = {
...
  async logout({ commit }: ActionContext<State, State>): Promise<void> {
    await AuthenticationService.logout();
    await SessionService.clear();
    commit('CLEAR_SESSION');
  },
...
};
```

### Login

The Login takes a little bit more work because the login itself may fail. We will build this one up a little at a time. First, though, is the fact that we need to call the authentication login correctly:

```typescript
describe('login', () => {
  const credentials = {
    email: 'test@test.com',
    password: 'thisisatest',
  };

  it('calls the login', () => {
    actions.login(context, credentials);
    expect(AuthenticationService.login).toHaveBeenCalledTimes(1);
    expect(AuthenticationService.login).toHaveBeenCalledWith(
      'test@test.com',
      'thisisatest',
    );
  });
});
```

The code in the action looks like this:

```typescript
  async login(
    { commit }: ActionContext<State, State>,
    credentials: { email: string; password: string },
  ): Promise<boolean> {
    const response = await AuthenticationService.login(
      credentials.email,
      credentials.password
    );
    return false;
  },
```

Next add a `describe('on failure')` within the `describe('login')` with the following contents:

```typescript
describe('on failure', () => {
  beforeEach(() => {
    (AuthenticationService.login as any).mockResolvedValue({
      success: false,
    });
  });

  it('does not store the session', async () => {
    await actions.login(context, credentials);
    expect(SessionService.set).not.toHaveBeenCalled();
  });

  it('does not commit any state changes', async () => {
    await actions.login(context, credentials);
    expect(context.commit).not.toHaveBeenCalled();
  });

  it('resolves false', async () => {
    expect(await actions.login(context, credentials)).toBe(false);
  });
});
```

These tests should pass without any changes to the action itself.

The final set of tests are for the case when the login succeeds. This is basically the opposite of the tests we just wrote:

```TypeScript
    describe('on success', () => {
      beforeEach(() => {
        (AuthenticationService.login as any).mockResolvedValue({
          success: true,
          user: session.user,
          token:session.token
        });
      });

      it('stores the session', async () => {
        await actions.login(context, credentials);
        expect(SessionService.set).toHaveBeenCalledTimes(1);
        expect(SessionService.set).toHaveBeenCalledWith(session.user, session.token);
      });

      it('commits the session', async () => {
        await actions.login(context, credentials);
        expect(context.commit).toHaveBeenCalledTimes(1);
        expect(context.commit).toHaveBeenCalledWith('SET_SESSION', session);
      });

      it('resolves true', async () => {
        expect(await actions.login(context, credentials)).toBe(true);
      });
    });
```

The code for the action is pretty straight forward:

```typescript
  async login(
    { commit }: ActionContext<State, State>,
    credentials: { email: string; password: string },
  ): Promise<boolean> {
    const response = await AuthenticationService.login(
      credentials.email,
      credentials.password,
    );
    if (response && response.success && response.user && response.token) {
      SessionService.set(response.user, response.token);
      commit('SET_SESSION', {
        user: response.user,
        token: response.token,
      });
    }
    return !!response && response.success;
  },
```

Note that anything unpacking and repacking the reponse is making sure we actually _have_ a response. Also, the `!!` syntax on the final like coerces the value to a boolean (just in case you have not seen that syntax before).

### Initialize

When we start up the application, there is some initialzation of the store that will need to occur. Currently that is just loading the session information from storage if it exists.

```typescript
describe('initialize', () => {
  it('gets the current session from storage', async () => {
    await actions.initialize(context);
    expect(SessionService.get).toHaveBeenCalledTimes(1);
  });

  it('does not commit the session if there is not one', async () => {
    await actions.initialize(context);
    expect(context.commit).not.toHaveBeenCalled();
  });

  it('commits the session if there is one', async () => {
    (SessionService.get as any).mockResolvedValue(session);
    await actions.initialize(context);
    expect(context.commit).toHaveBeenCalledTimes(1);
    expect(context.commit).toHaveBeenCalledWith('SET_SESSION', session);
  });
});
```

The code for the action is then as follows:

```typescript
  async initialize({ commit }: ActionContext<State, State>): Promise<void> {
    const session = await SessionService.get();
    if (session) {
      commit('SET_SESSION', session);
    }
  },
```

## Modules

Notice that we did everything at the root level for within our store. As our application grows, we will want to look into using <a href="https://vuex.vuejs.org/guide/modules.html" target="_blank">modules</a>. However, we are currently dealing with a fairly core concept within our application so it makes sense that it should be defined at the root level.

We aren't going to do anything here, I just wanted to make sure you were aware that these existed.

## Initialize the Store

We need to initialize the store, and thus load our session information if we have any, before we mount the application. We can do this in `src/main.ts` by adding a method that dispatches the initialize. We can then wait for it to finish just like we wait for the router to be ready before mounting the app.

```typescript
function initializeStore(): Promise<void> {
  return store.dispatch('initialize');
}

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store)
  .use(VuelidatePlugin);

Promise.all([initializeStore(), router.isReady()]).then(() => {
  app.mount('#app');
});
```

## Conclusion

All of the various pieces have now been assembled into a system that will handle our workflow. In the next lab we will implement that workflow.

By the way, here is the test and the code for the `CLEAR_SESSION` code challenge in case you need it:

```typescript
describe('CLEAR_SESSION', () => {
  it('clears the session', () => {
    const state = { teas: [], session };
    mutations.CLEAR_SESSION(state);
    expect(state).toEqual({ teas: [], session: null });
  });
});
```

```typescript
CLEAR_SESSION: (state: State) => (state.session = null),
```
