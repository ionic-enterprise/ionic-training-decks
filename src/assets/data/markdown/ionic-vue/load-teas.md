# Lab: Load Teas

In this lab, you will learn

## Create a TeaService

The first thing we need to to is create some templates for our service and test.

**`src/services/TeaService.spec.ts`**

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

First things first. We need to make the API call to get the data.

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
      .then(res => res.data));
  },
```

But there is a bit of a problem. The data that comes back from the API is not in the shape we want for our application. This is a common issue that needs to be handled in the service. Specifically, the backend team has not decided how to handle the tea images yet, so what we will do for now is map the images to our own set of assets based on the IDs of the tea.

In our tests, let's express this difference as two different sets of data: the raw HTTP data, and the expected data.

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

The HTTP get returns the teas in one shape, we expect the results in the other shape.

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

The first (and currently _only_) place that we land after logging in needs these teas. Furthermore we know from our user stories that this data is pretty central to the rest of our app, so let's add it to the root level of our store. When adding an item to the store, we need to think about:

- How does this change the shape of the state?
- What mutations are required?
- What actions effect this part of the state?

### State

Updating `src/store/state.ts` is pretty straight forward:

```TypeScript
// Add this to the State interface
  teas: Array<Tea>;


// Add this to the state object
  teas: [],
```

### Mutations

Thinking about the required mutations, this part of the state is very similar in needs to the `session`. It needs to be set when we get the data, and it needs to be cleared at appropriate times.

With that in mind, we start be adding a couple of values to our `MutationsTypes` enumeration in `src/store/mutations.ts`:

```TypeScript
export enum MutationTypes {
  CLEAR_SESSION = 'CLEAR_SESSION',
  CLEAR_TEAS = 'CLEAR_TEAS', // Add this...
  SET_SESSION = 'SET_SESSION',
  SET_TEAS = 'SET_TEAS', // Add this... 
}
```

Then we can go about writing up our tests in `tests/unit/store/mutations.spec.ts`.

The first thing we will need is some data to work with:

```TypwScript
import { Session, Tea } from '@/models';
...
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
```

With that in place, we can write the actual tests:

```TypeScript
  describe('SET_TEAS', () => {
    it('sets the teas', () => {
      const state = { teas: [], session };
      mutations.SET_TEAS(state, teas);
      expect(state).toEqual({ teas, session });
    });
  });

  describe('CLEAR_TEAS', () => {
    it('set the teas to an empty array', () => {
      const state = { teas, session };
      mutations.CLEAR_TEAS(state);
      expect(state).toEqual({ teas: [], session });
    });
  });
```

**Challenge:** Based on the contents of the tests and the existing sesssion mutations, create the mutations for the teas.See the code at the conclusion of this lab if you get stuck.

### Actions

The actions are a little bit more involved, but we will start with just the basics, loading the tea.

First, add a `loadTeas` to the `ActionType` in `src/store/actions.ts`.

```TypeScript
  loadTeas = 'loadTeas',
```

Now we can begin tackling this in the test (`tests/unit/store/actions.spec.ts`).

```TypeScript
import TeaService from '@/services/TeaService';
import { Session, Tea } from '@/models';
...
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
...
  describe(ActionTypes.loadTeas, () => {
    beforeEach(() => {
      (TeaService.getAll as any).mockResolvedValue(teas);
    });

    it('gets the teas', async () => {
      await actions.loadTeas(context);
      expect(TeaService.getAll).toHaveBeenCalledTimes(1);
    });

    it('commits the teas', async () => {
      await actions.loadTeas(context);
      expect(context.commit).toHaveBeenCalledTimes(1);
      expect(context.commit).toHaveBeenCalledWith(MutationTypes.SET_TEAS, teas);
    });
  });

```

The code that needs to be added to `src/store/actions.ts` is pretty straight forward and looks similar to some of the code we have already written. We just need to grab the teas and then commit them:

```TypeScript
  async [ActionTypes.loadTeas]({
    commit,
  }: ActionContext<State, State>): Promise<void> {
    const teas = await TeaService.getAll();
    commit(MutationTypes.SET_TEAS, teas);
  },
```

Now that the basics are in place, let's think about what we need to do with some of the other actions.

- When we log in, we should load the teas to they are available to the rest of the application.
- When we log out, we don't want the teas hanging out. Whoever logs in next may not have access to them.
- When we initialize the app, we need to grab the teas if we are logged in.

One of the keys of the above is that neither the login nor the initialization should be slowed down by the loading of the teas, so we need to make sure we are not waiting for that action to complete.

#### Update the Logout Action

Let's do the logout first, since that is easy.

Change the "commits the CLEAR_SESSION" test to also include clearing the teas.

```TypeScript
    it('commits the CLEAR_SESSION and CLEAR_TEAS mutations', async () => {
      await actions.logout(context);
      expect(context.commit).toHaveBeenCalledTimes(2);
      expect(context.commit).toHaveBeenCalledWith(MutationTypes.CLEAR_SESSION);
      expect(context.commit).toHaveBeenCalledWith(MutationTypes.CLEAR_TEAS);
    });
```

Modifying the code in `src/store/actions.ts` to satisfy this test is left as an exercise for the reader.

#### Update the Login Action

The login action has two different outcomes: the user can fail to login, or they can succeed. We only want to load the teas in the latter case. First, add a test within the "on failure" section of the test to ensure we don't do anything:

```TypeScript
      it('does not dispatch any further actions', async () => {
        await actions.login(context, credentials);
        expect(context.dispatch).not.toHaveBeenCalled();
      });
```

That test will pass out of the box because, well, we weren't dispatching any further actions to begin with. So let's move on to the case where the user succeeds in logging in. In this case, we _do_ want to load the teas. Add the following test within the "on success" section of tests.

```TypeScript
      it(`dispatches the ${ActionTypes.loadTeas} action`, async () => {
        await actions.login(context, credentials);
        expect(context.dispatch).toHaveBeenCalledTimes(1);
        expect(context.dispatch).toHaveBeenCalledWith(ActionTypes.loadTeas);
      });
```

Now let's swtich over to the actions code and modify the login action to handle this. Add a `dispatch()` right after the commit of "SET_SESSION" as such:

```TypeScript
    if (response && response.success && response.user && response.token) {
      SessionService.set(response.user, response.token);
      commit(MutationTypes.SET_SESSION, {
        user: response.user,
        token: response.token,
      });
      dispatch(ActionTypes.loadTeas);
    }
```

#### Update the Initialization Action

Here was also have two conditions: we can start the app without a stored session or with a stored session. We only want to try to load the teas in the latter case. Let's refactor our tests to have "without a stored session" and "with a stored session" group of tests. The full refactoring with the "dispatch" tests is shown here.

```TypeScript
  describe(ActionTypes.initialize, () => {
    it('gets the current session from storage', async () => {
      await actions.initialize(context);
      expect(SessionService.get).toHaveBeenCalledTimes(1);
    });

    describe('without a stored session', () => {
      it('does not commit the session if there is not one', async () => {
        await actions.initialize(context);
        expect(context.commit).not.toHaveBeenCalled();
      });

      it('does not dispatch any further actions', async () => {
        await actions.initialize(context);
        expect(context.dispatch).not.toHaveBeenCalled();
      });
    });

    describe('with a stored session', () => {
      beforeEach(() => {
        (SessionService.get as any).mockResolvedValue(session);
      });

      it('commits the session', async () => {
        await actions.initialize(context);
        expect(context.commit).toHaveBeenCalledTimes(1);
        expect(context.commit).toHaveBeenCalledWith(
          MutationTypes.SET_SESSION,
          session,
        );
      });

      it('dispatches a load of the teas', async () => {
        await actions.initialize(context);
        expect(context.dispatch).toHaveBeenCalledTimes(1);
        expect(context.dispatch).toHaveBeenCalledWith(ActionTypes.loadTeas);
      });
    });
  });
```

At this point, the "dispatches a load of the teas" test should be the only one failing. The code perform this is similar to the code for the login action. Adding it is left as an exercise for reader. Refer to the code in the "Conclusion" section if you get stuck or have problems.

At this point, the store should be ready to go. Let's move on to the final stage of using the fetched teas in the page.

## Updating the Tea Page

The tea page will now get its data from our Vuex store rather than having it hard code inside of it, so the test should be changed to reflect that.

First, defined a test set of teas on the store's state. Do this in the `beforeEach()` right after the `store.dispatch = jest.fn()` line.

```TypeScript
    store.state['teas'] = [
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
    ];
```

Next, a couple of the tests have lines that get the list of teas from the component instance. They look like this:

```TypeScript
    const teas = wrapper.vm.teaData as Array<TeaModel>;
```

Remove those lines, as we as where we import `Tea as TeaModel` at the top of the file.

Finally, change the `expect()` calls to compare against the state insetad of the teas array that we are no longer grabbing. As a example:

```diff
-    expect(title.text()).toBe(teas[idx].name);
+    expect(title.text()).toBe(store.state.teas[idx].name);
```

This applies to both the `name` and the `description` tests.

Now we can go change `src/views/Tea.vue`. The only item defined in our `data()` function is the `teaData`, which we will now be getting from the Vuex store, so we can completely remove the `data()` function.

In our `computed` `teaRows()`, we need to get the data from the store's state now as such:

```diff
-    this.teaData.forEach(t => {
+    this.store.state.teas.forEach(t => {
```

Finally, we need to make sure the store is available within our view, so import `useStore` a call it in our `setup()`:

```TypeScript
import { useStore } from 'vuex';
...
  setup() {
    const store = useStore();
    return { logOutOutline, store };
  },
```

All tests should be passing at this point and when we log in we should see the teas that we fetched from the backend API.

## Conclusion

Our store now contains tea information that we fetch from our HTTP backend, and our Tea view is using that data rather than hard coding its own data.

Here are the samples for a couple of the code challenges, just in case you need to refer to them.

### Mutations

```TypeScript
  [MutationTypes.CLEAR_TEAS]: (state: State) => (state.teas = []),
  [MutationTypes.SET_TEAS]: (state: State, teas: Array<Tea>) =>
    (state.teas = teas),
```

### Full Login and Initialization Actions

```TypeScript
  async [ActionTypes.login](
    { commit, dispatch }: ActionContext<State, State>,
    credentials: { email: string; password: string },
  ): Promise<boolean> {
    const response = await AuthenticationService.login(
      credentials.email,
      credentials.password,
    );
    if (response && response.success && response.user && response.token) {
      SessionService.set(response.user, response.token);
      commit(MutationTypes.SET_SESSION, {
        user: response.user,
        token: response.token,
      });
      dispatch(ActionTypes.loadTeas);
    }
    return !!response && response.success;
  },

...

  async [ActionTypes.initialize]({
    commit,
    dispatch,
  }: ActionContext<State, State>): Promise<void> {
    const session = await SessionService.get();
    if (session) {
      commit(MutationTypes.SET_SESSION, session);
      dispatch(ActionTypes.loadTeas);
    }
  },

```
