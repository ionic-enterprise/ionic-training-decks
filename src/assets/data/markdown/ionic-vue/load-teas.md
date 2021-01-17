# Lab: Load Teas

In this lab, you will learn:

- how to create a basic HTTP service
- how to add a module to the store
- how to use the data in a view

## Create a TeaService

The first thing we need to to is create some templates for our service and test.

**`src/services/TeaService.ts`**

```TypeScript
import { client } from './api';
import { Tea } from '@/models';

export default {
  async getAll(): Promise<Array<Tea>> {
    return [];
  },
};
```

**`tests/unit/services/TeaService.spec.ts`**

```TypeScript
import { client } from '@/services/api';
import TeaService from '@/services/TeaService';

import { Tea } from '@/models';

describe('TeaService', () => {
  let expectedTeas: Array<Tea>;
  let httpResultTeas: Array<{ id: number; name: string; description: string }>;

  function initializeTestData() {}

  beforeEach(() => {
    initializeTestData();
  });

  describe('getAll', () => {
    beforeEach(() => {
      client.get = jest.fn().mockResolvedValue({});
    });

    it('gets the tea categories', async () => {});

    it('transforms the tea data', async () => {});
  });
});
```

In this case, I scaffolded the test for you already specifying the two requirements that we have for our `getAll()` method. It needs to:

- get the data
- transform the data

So let's tackle those requirements one at a time. First, we need to make the API call to get the data.

```TypeScript
    it('gets the tea categories', async () => {
      await TeaService.getAll();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/tea-categories');
    });
```

In order to satify that test, we can just perform the basic "get" pattern of sending a GET requiest to the backend API and then returning the data.

```TypeScript
  async getAll(): Promise<Array<Tea>> {
    return client
      .get('/tea-categories')
      .then(res => res.data);
  },
```

But there is a bit of a problem. The data that comes back from the API is not in the shape we want for our application. This is a common issue that needs to be handled in the service. Specifically, the backend team has not decided how to handle the tea images yet, so what we will do for now is map the images to our own set of assets based on the IDs of the tea.

This is where the second requirement, the requirement to transform the data, comes in to play. In our tests, let's express the difference between the two formats as two different sets of data: the raw HTTP data, and the expected data. Update the `initializeTestData()` method as such:

```TypeScript
  function initializeTestData() {
    expectedTeas = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
      },
      {
        id: 2,
        name: 'Black',
        image: 'assets/img/black.jpg',
        description: 'Black tea description.',
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'assets/img/herbal.jpg',
        description: 'Herbal Infusion description.',
      },
      {
        id: 4,
        name: 'Oolong',
        image: 'assets/img/oolong.jpg',
        description: 'Oolong tea description.',
      },
      {
        id: 5,
        name: 'Dark',
        image: 'assets/img/dark.jpg',
        description: 'Dark tea description.',
      },
      {
        id: 6,
        name: 'Puer',
        image: 'assets/img/puer.jpg',
        description: 'Puer tea description.',
      },
      {
        id: 7,
        name: 'White',
        image: 'assets/img/white.jpg',
        description: 'White tea description.',
      },
      {
        id: 8,
        name: 'Yellow',
        image: 'assets/img/yellow.jpg',
        description: 'Yellow tea description.',
      },
    ];
    httpResultTeas = expectedTeas.map((t: Tea) => {
      const tea = { ...t };
      delete tea.image;
      return tea;
    });
  }
```

What we have here is the `expectedTeas` with the data in the shape we want within the domain of our application. The `httpResultTeas` are _almost_ the same, just without the `image` property, so we strip that. The test to make sure the service reshapes the data properly is then fairly straight forward.

```TypeScript
    it('transforms the tea data', async () => {
      (client.get as any).mockResolvedValue({ data: httpResultTeas });
      const teas = await TeaService.getAll();
      expect(teas).toEqual(expectedTeas);
    });
```

The HTTP `GET` returns the teas in one shape, we expect the results in the other shape.

So, let's get down to coding this in `src/services/TeaService.ts`. The first thing we will do is define a type for the data coming back from the HTTP API and the shell of a transforming function.

```TypeScript
interface RawData {
  id: number;
  name: string;
  description: string;
}

function unpackData(data: Array<RawData>): Array<Tea> {
  return [];
}
```

We can then also update the promise handling in our `getAll()` to ensure the transform is called if we have data:

```TypeScript
      .then(res => res.data && unpackData(res.data));
```

Looking at the data we have coming back, we have eight tea categories with IDs 1 through 8, so for this data it it pretty easy to map the tea to an image using the ID. First, create an array of the image names in the right order (this can either be global to the file or within the `unpackData()` function):

```TypeScript
const images: Array<string> = [
  'green',
  'black',
  'herbal',
  'oolong',
  'dark',
  'puer',
  'white',
  'yellow',
];
```

Then in `unpackData()` map the data, adding in the image property in the format required:

```TypeScript
  return data.map(t => ({ ...t, image: `assets/img/${images[t.id - 1]}.jpg` }));
```

Obviously, this is a fairly contrived example and it does not compensate for changes such as someone adding a tea category or changing the IDs in some way, etc. However, let's say that in the future the backend team decides to add a "Type Code" to the tea category that does a better job of mapping this tea to an image within your system, you only have to go to this service to make that change.

The same applies of this decide to shorten the property names in order to save on bytes going over the air. You still only need to change this service. The rest of your system is insulated from the external API changes by the use of this service.

## Add Teas to the Store

In order to keep the store orrderly, we will add the teas as a namespaced module. This means that the getters, mutations, and actions are also all namespeced to the module. This makes the module self contained and easier to maintain.

The one exception to the namespacing is that actions _can_ be marked as "root" actions. If we have an action called "drink", for example, we would normally have to dispatch it as such: `this.$store.dispatch('teas/drink')`. This would dispatch the "drink" action within the "teas" module.

Now let's say we defined the action with `root: true`. If we do this we can dispatch the action as such: `this.$store.dispatch('drink')`. The result of this call is that the "drink" action is dispatched within any module that has the "drink" action defined with `{root: true}`. So if we also had the "drink" action defined as root in the "coffee" module then the "drink" action would execure in the "teas" module and the "coffee" module.

With that in mind, we should think about the actions that may be common within the modules we have in our store. This allows us to define a consistent set of behaviors for our modules which makes it easier for developers to understand what is going on within the code.

Here is what I see as some good candidates for a module that defines a collection of data:

- load: Loads the data, could be root if we want the data to load globaly or namespaced if we want more control over the loading of the data
- clear: Clears out the data, mostly likely this is always root
- save: Save (create or update) an item of data, always namespaced
- delete: Remove an item of data, always namespaced

It then makes sense to have a set of mutations that mirror these actions to some degree. For example:

- SET: sets the collection
- CLEAR: empties the collection
- MERGE: modify an item if it is already in the collection, otherwise add it
- DELETE: remove the item from the collection

We also need to take some time to think about:

- the shape of our state
- getters that may be required for our state

### State

Create a `src/store/teas/state.ts` file with the following contents:

```TypeScript
import { Tea } from '@/models';

export interface State {
  list: Array<Tea>;
}

export const state: State = {
  list: [],
};

export const getters = {
  find: (state: State) => (id: number): Tea | undefined =>
    state.list.find(t => t.id === id),
};
```

Basically, we want a list of teas with a getter that allows us to find a specific tea. The reason we use `list` property name in the state is that when we add the module to our store it will be added as `teas` so the full path to the tea list then becomes `this.$store.state.teas.list`

### Mutations

Thinking about the required mutations, this part of the state is very similar in needs to the `session`. It needs to be set when we get the data, and it needs to be cleared at appropriate times. Since the module is namespaced, we can use very generic names. We will use `SET` and `CLEAR`.

We can go about writing up our tests in `tests/unit/store/teas/mutations.spec.ts`

```TypeScript
import { mutations } from '@/store/teas/mutations';
import { Tea } from '@/models';

const teas: Array<Tea> = [
  {
    id: 1,
    name: 'Green',
    image: 'assets/img/green.jpg',
    description: 'Green tea description',
  },
  {
    id: 2,
    name: 'Black',
    image: 'assets/img/black.jpg',
    description: 'A fully oxidized tea',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'assets/img/herbal.jpg',
    description: 'Herbal infusions are not actually "tea"',
  },
];

describe('tea mutations', () => {
  describe('CLEAR', () => {
    it('set the teas to an empty array', () => {
      const state = { list: teas };
      mutations.CLEAR(state);
      expect(state).toEqual({ list: [] });
    });
  });

  describe('SET', () => {
    it('sets the teas', () => {
      const state = { list: [] };
      mutations.SET(state, teas);
      expect(state).toEqual({ list: teas });
    });
  });
});
```

**Challenge:** Based on the contents of the tests and the existing session mutations, create the mutations for the teas. You will need to create a `src/store/teas/mutations.ts` file. See the code at the conclusion of this lab if you get stuck.

### Actions

We need to think about the actions we need for the teas, and whether they should be namespaced or if they should be root level actions. Here are the actions we will need to take within this module:

- load
- clear

Since the tea list page is the first page we load after login, and since there are user stories in the backlog where other pages will also need this data, it makes sense to load the tea data up front when the store dispatches the root-level "load".

The "clear" should be root level in all of our modules so all data is cleared whenever the root level "clear" is dispatched.

So both of these should be `root: true` acitons.

We will start with the `clear` action since it is the easiest of the two. We can begin tackling this in the test (this is a new file you will need to create named `tests/unit/store/teas/actions.spec.ts`).

```TypeScript
import { ActionContext } from 'vuex';
import { actions } from '@/store/teas/actions';

const context: ActionContext<any, any> = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  getters: {},
  state: {},
  rootGetters: {},
  rootState: {},
};

describe('tea actions', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('clear', () => {
    it('commits CLEAR', () => {
      actions.clear.handler(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('CLEAR');
    });
  });
});
```

With the test in place, we can now create the `src/store/teas/actions.ts` file with the following contents:

```TypeScript
import { ActionContext } from 'vuex';

import TeaService from '@/services/TeaService';

import { State } from './state';
import { State as RootState } from '../state';

export const actions = {
  clear: {
    root: true,
    handler({ commit }: ActionContext<State, RootState>): void {
      commit('CLEAR');
    },
  },
};
```

Notice the sort of odd syntax for the action. That is because we are defining this action with `root: true` so rather than just having a function we have an object with the `root: true` setting and a special function called `handler()` with the logic.

Next we can add the tests that are required for the load action:

```TypeScript
...
import TeaService from '@/services/TeaService';
import { Tea } from '@/models';

jest.mock('@/services/TeaService');

...

const teas: Array<Tea> = [
  {
    id: 1,
    name: 'Green',
    image: 'assets/img/green.jpg',
    description: 'Green teas have the oxidation process stopped.',
  },
  {
    id: 2,
    name: 'Black',
    image: 'assets/img/black.jpg',
    description: 'A fully oxidized tea.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'assets/img/herbal.jpg',
    description: 'Herbal infusions are not actually tea.',
  },
];

describe('tea actions', () => {
...
  describe('load', () => {
    beforeEach(() => {
      (TeaService.getAll as any).mockResolvedValue(teas);
    });

    it('gets the teas', async () => {
      await actions.load.handler(context);
      expect(TeaService.getAll).toHaveBeenCalledTimes(1);
    });

    it('commits the teas', async () => {
      await actions.load.handler(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith('SET', teas);
    });
  });
});

```

Then we can add the `load` action itself. Remember that we want this to be a `root: true` action.

```TypeScript
  load: {
    root: true,
    async handler({ commit }: ActionContext<State, RootState>): Promise<void> {
      const teas = await TeaService.getAll();
      commit('SET', teas);
    },
  },
```

#### Update the Root Actions

The root actions need to be modified to dispatch the `clear` and `load` actions at the appropriate times. We will need to update the following test and code files:

- `tests/unit/store/actions.spec.ts`
- `src/store/actions.ts`

##### Restore Action

The `restore` action has two different cases: with a stored session and without a stored session. With a stored session we need to dispatch a `load` action. Without we do not.

```TypeScript
  describe('restore', () => {
    ...
    describe('without a stored session', () => {
      ...
      it('does not dispatch any further actions', async () => {
        await actions.restore(context);
        expect(context.dispatch).not.toHaveBeenCalled();
      });
    });

    describe('with a stored session', () => {
      ...
      it('dispatches the load action', async () => {
        await actions.restore(context);
        expect(context.dispatch).toHaveBeenCalledTimes(1);
        expect(context.dispatch).toHaveBeenCalledWith('load');
      });
    });
  });
```

Update the code accordingly. You will need to:

- destructure the `dispatch` from the context (first argument for the action)
- call the dispatch if we have a session

##### Login Action

The `login` action also has two different cases: with a successful login and with a failed login.

```TypeScript
  describe('login', () => {
    ...
    describe('on failure', () => {
      ...
      it('does not dispatch any further actions', async () => {
        await actions.login(context, credentials);
        expect(context.dispatch).not.toHaveBeenCalled();
      });
      ...
    });

    describe('on success', () => {
      ...
      it('dispatches the load action', async () => {
        await actions.login(context, credentials);
        expect(context.dispatch).toHaveBeenCalledTimes(1);
        expect(context.dispatch).toHaveBeenCalledWith('load');
      });
      ...
    });
  });
```

Update the code accordingly. You will need to:

- destructure the `dispatch` from the context (first argument for the action)
- call the dispatch if the login succeeded

##### Logout Action

The `logout` action is already dispatching the `clear` so we are good to go here.

### Putting it all Together

Each module in the store will have its own `index.ts` file. Create a `src/store/index.ts` file:

```TypeScript
import { state, getters } from './state';
import { mutations } from './mutations';
import { actions } from './actions';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
```

Then add the module to `src/store/index.ts`:

```TypeScript
...
import TeasModule from './teas';
...
export default createStore({
  state,
  getters,
  mutations,
  actions,
  modules: {
    teas: TeasModule,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});

```

## Update the Tea List Page

Now that we have this put together, we can update the `TeaList` page to show the actual teas from our store rather than the hard coded teas that are being displayed right now.

Modify the test first. Since we are not changing anything about how the page works, but are only changing the source of our data, all we need to do is modify the test to load that source (our store) up front.

```TypeScript
  ...
  let teas: Array<Tea>;
  ...

  beforeEach(async () => {
    teas = [
      // Copy the tea data from the `TeaList.vue` file to here...
    ];
    store.commit('teas/SET', teas);
    ...
  });
  ...
```

We will then remove our hard coded `teaData` data and use the Vuex `mapState()` helper function to create a computed property called `teaData` which reads the appropriate part of the state to get the data. We need to also make a minor tweak to the typing in our `teaRows()` computed data property and we are on our way.

```diff
--- a/src/views/TeaList.vue
+++ b/src/views/TeaList.vue
@@ -69,6 +69,7 @@ import {
   IonTitle,
   IonToolbar,
 } from '@ionic/vue';
+import { mapState } from 'vuex';
 import { defineComponent } from 'vue';
 import { logOutOutline } from 'ionicons/icons';

@@ -77,10 +78,13 @@ import { Tea } from '@/models';
 export default defineComponent({
   name: 'TeaList',
   computed: {
+    ...mapState('teas', {
+      teaData: 'list',
+    }),
     teaRows(): Array<Array<Tea>> {
       const teaMatrix: Array<Array<Tea>> = [];
       let row: Array<Tea> = [];
-      this.teaData.forEach(t => {
+      this.teaData.forEach((t: Tea) => {
         row.push(t);
         if (row.length === 4) {
           teaMatrix.push(row);
@@ -94,68 +98,6 @@ export default defineComponent({
       return teaMatrix;
     },
   },
-  data() {
-    return {
-      teaData: [
-        // Remove all of the tea data. Not shown in diff...
-      ],
-    };
-  },
```

## Conclusion

Our store now contains tea information that we fetch from our HTTP backend, and our Tea view is using that data rather than hard coding its own data.

Here are the modifications for the code challenges, just in case you need to refer to them.

**`src/store/teas/mutations.ts`**

```TypeScript
import { State } from './state';
import { Tea } from '@/models';

export const mutations = {
  SET: (state: State, teas: Array<Tea>): Array<Tea> => (state.list = teas),
  CLEAR: (state: State): Array<Tea> => (state.list = []),
};
```

**`src/store/actions.ts`**

```diff
--- a/src/store/actions.ts
+++ b/src/store/actions.ts
@@ -8,7 +8,7 @@ import { Session } from '@/models';

 export const actions = {
   async login(
-    { commit }: ActionContext<State, State>,
+    { commit, dispatch }: ActionContext<State, State>,
     credentials: { email: string; password: string },
   ): Promise<boolean> {
     const response = await AuthenticationService.login(
@@ -21,6 +21,7 @@ export const actions = {
         token: response.token,
       };
       commit('SET_SESSION', session);
+      dispatch('load');
       SessionVaultService.set(session);
     }
     return response?.success;
@@ -32,10 +33,11 @@ export const actions = {
     dispatch('clear');
   },

-  async restore({ commit }: ActionContext<State, State>): Promise<void> {
+  async restore({ commit, dispatch }: ActionContext<State, State>): Promise<void> {
     const session = await SessionVaultService.get();
     if (session) {
       commit('SET_SESSION', session);
+      dispatch('load');
     }
   },
```
