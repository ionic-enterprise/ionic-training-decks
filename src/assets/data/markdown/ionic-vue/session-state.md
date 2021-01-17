# Lab: Manage the Session State

The application needs to know about the current state of the session. However, you will notice that both of our services are stateless. We could use `SessionVaultService.get()` each time we need to know if we have a session or not, but that seems wasteful. It would be better if we had something inside our application that was in charge of managing the state of the application for us. Enter <a href="https://next.vuex.vuejs.org" target="_blank">vuex</a>.

In this lab you will learn how to create a basic Vuex store.

## Installation and Setup

First we need the Vuex package:

```bash
$ npm install vuex@next
```

Next, create a `src\store` folder and in there, create an `index.ts` file. Here is the template:

```typescript
import { createStore, createLogger } from 'vuex';

const debug = process.env.NODE_ENV === 'development';

export default createStore({
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

Finally, use the store in our app. Add the following to the `src/main.ts` file:

- Add an import: `import store from './store'`
- Add `use(store)` to the chain of calls after `createApp(App)`

## State

The first thing we should do is define what our state looks like. So far all we need is a session. Create a `src/store/state.ts` file with the following contents:

```typescript
import { Session } from '@/models';

export interface State {
  session: Session | null;
}

export const state = {
  session: null,
};
```

Then we can add the state to the store as such:

```typescript
import { createStore, createLogger } from 'vuex';
import { state } from './state';

export default createStore({
  state,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

## Mutations

Mutations are functions that are used to modify the state. The mutations that you define are the only items within your systen that modify the store's state. They are syncronous, and thus rarely access anything other than the state. This makes the very easy to test. First, though, let's export the mutations as a object from our store so we can easily test them.

In Vuex parlance, mutations are committed. They can be committed from anywhere in the code, but are most commonly committed from within the store, either from an action or from another mutation.

Create a `src/store/mutations.ts` file with the following contents:

```typescript
import { State } from './state';
import { Session } from '@/models';

export const mutations = {};
```

Then add a `tests/unit/store/mutations.spec.ts` file that we will use to test our mutations. At this time, our root state consists of our session, and the only things we will need to do to it are set it and clear it, so we will have two mutations: SET_SESSION and CLEAR_SESSION.

```typescript
import { mutations } from '@/store/mutations';
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

Let's create a test for the `SET_SESSION` mutation. Since mutations are just regular JavaScript functions we can easily test them by calling them directly:

```typescript
describe('SET_SESSION', () => {
  it('sets the session', () => {
    const state = { session: null };
    mutations.SET_SESSION(state, session);
    expect(state).toEqual({ session });
  });
});
```

The code in `src/state/mutations.ts` that satisfies this is pretty easy.

```typescript
export const mutations = {
  SET_SESSION: (state: State, session: Session) => (state.session = session),
};
```

**Code Challenge:** write the test and the code for the `CLEAR_SESSION` mutation. Have a look at the end of this lab if you run into issues or have questions.

Finally, include the mutations in your store.

```typescript
...
import { mutations } from './mutations';
...
export default createStore({
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
```

## Actions

Actions are simple JavaScript functions just like mutations, the differences being that:

- Instead of mutating the state, actions commit mutations.
- Actions can contain arbitrary asynchronous operations.

In Vuex parlance, actions are "dispatched" from other portions of your application in order to act upon the state.

We will start with four distinct actions at the root of our store:

- login
- logout
- restore
- clear

Notice that the first three are logically actions taken by the application as the user interacts with it. The last action (`clear`) it an action dispatched within the store itself to let the store know it should clear its data. There will be a similar in-store root action called `load` that will instruct certain store modules (not discussed yet) to load their data.

First create a `tests/unit/store/actions.spec.ts` file with the following skeleton code:

```typescript
import { ActionContext } from 'vuex';
import { actions } from '@/store/actions';
import AuthenticationService from '@/services/AuthenticationService';
import SessionVaultService from '@/services/SessionVaultService';
import { Session } from '@/models';

jest.mock('@/services/AuthenticationService');
jest.mock('@/services/SessionVaultService');

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

  describe('clear', () => {});

  describe('login', () => {});

  describe('logout', () => {});

  describe('restore', () => {});
});
```

In `src/store/actions.ts` (new file), create a skeleton for the `actions` as well:

```typescript
import { ActionContext } from 'vuex';

import AuthenticationService from '@/services/AuthenticationService';
import SessionVaultService from '@/services/SessionVaultService';

import { State } from './state';
import { Session } from '@/models';

export const actions = {
  async login(
    { commit }: ActionContext<State, State>,
    credentials: { email: string; password: string },
  ): Promise<boolean> {
    return false;
  },

  async logout({ dispatch }: ActionContext<State, State>): Promise<void> {
    return undefined;
  },

  async restore({ commit }: ActionContext<State, State>): Promise<void> {
    return undefined;
  },

  clear({ commit }: ActionContext<State, State>): void {
    return undefined;
  },
};
```

### Clear

The `clear` action is easiest of the bunch so let's start there. Notice that it is not `async`. Actions can be syncronous. We will start by filling out the test:

```TypeScript
  describe('clear', () => {
    it('commits CLEAR_SESSION', () => {
      actions.clear(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('CLEAR_SESSION');
    });
  });
```

The code for that is as simple as it sounds:

```TypeScript
  clear({ commit }: ActionContext<State, State>): void {
    commit('CLEAR_SESSION');
  },
```

Notice that just like mutations, actions are just JavaScript functions, so it is very easy to test them by calling them directly. The only thing that makes them harder than mutations is the amount of mocking that is often required.

### Logout

The logout is also fairly simple, so let's do that one next. We need to handle the logout with our API, clear the session storage, and dispatch the `clear` action. Here is what those requirements look like expressed as tests:

```typescript
describe('logout', () => {
  it('logs out', async () => {
    await actions.logout(context);
    expect(AuthenticationService.logout).toHaveBeenCalledTimes(1);
  });

  it('clears the session storage', async () => {
    await actions.logout(context);
    expect(SessionVaultService.clear).toHaveBeenCalledTimes(1);
  });

  it('dispatches the clear action', async () => {
    await actions.logout(context);
    expect(context.dispatch).toHaveBeenCalledTimes(1);
    expect(context.dispatch).toHaveBeenCalledWith('clear');
  });
});
```

In the code, that translates to:

```typescript
  async logout({ dispatch }: ActionContext<State, State>): Promise<void> {
    await AuthenticationService.logout();
    await SessionVaultService.clear();
    dispatch('clear');
  },
```

### Login

The Login takes a little bit more work because the login itself may fail. We will build this one up a little at a time. The first step is to call the authentication login method correctly:

```typescript
describe('login', () => {
  beforeEach(() => {
    (AuthenticationService.login as any).mockResolvedValue({
      success: false,
    });
  });

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
    expect(SessionVaultService.set).not.toHaveBeenCalled();
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
        expect(SessionVaultService.set).toHaveBeenCalledTimes(1);
        expect(SessionVaultService.set).toHaveBeenCalledWith(session);
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
    if (response.success && response.user && response.token) {
      const session: Session = {
        user: response.user,
        token: response.token
      };
      commit('SET_SESSION', session);
      SessionVaultService.set(session);
    }
    return response.success;
  },
```

### restore

When we start up the application, there is some initialzation of the store that will need to occur. Currently that is just loading the session information from storage if it exists.

```typescript
describe('restore', () => {
  it('gets the current session from storage', async () => {
    await actions.restore(context);
    expect(SessionVaultService.get).toHaveBeenCalledTimes(1);
  });

  describe('without a stored session', () => {
    it('does not commit the session', async () => {
      await actions.restore(context);
      expect(context.commit).not.toHaveBeenCalled();
    });
  });

  describe('with a stored session', () => {
    beforeEach(() => {
      (SessionVaultService.get as any).mockResolvedValue(session);
    });

    it('commits the session', async () => {
      await actions.restore(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('SET_SESSION', session);
    });
  });
});
```

The two inner `describe()`'s may seem like overkill now, but that will come in handy later. It is generally best to nest different paths through the code in their own `describe()`.

The code for the action is then as follows:

```typescript
  async restore({ commit }: ActionContext<State, State>): Promise<void> {
    const session = await SessionVaultService.get();
    if (session) {
      commit('SET_SESSION', session);
    }
  },
```

### Add the Actions to the Store

Using the mutations as a model, add the actions to the store.

## Modules

Notice that we did everything at the root level for within our store. As our application grows, we will want to look into using <a href="https://vuex.vuejs.org/guide/modules.html" target="_blank">modules</a>. However, we are currently dealing with a fairly core concept within our application so it makes sense that it should be defined at the root level.

We aren't going to do anything here, I just wanted to make sure you were aware that these existed. These will come into play as we expand our application. This is also the reason we have the `clear` action that currently just seems like an extra layer of abstraction.

## Conclusion

All of the various pieces have now been assembled into a system that will handle our workflow. In the next lab we will implement that workflow.

By the way, here is the test and the code for the `CLEAR_SESSION` code challenge in case you need it:

```typescript
describe('CLEAR_SESSION', () => {
  it('clears the session', () => {
    const state = { session };
    mutations.CLEAR_SESSION(state);
    expect(state).toEqual({ session: null });
  });
});
```

```typescript
CLEAR_SESSION: (state: State) => (state.session = null),
```
