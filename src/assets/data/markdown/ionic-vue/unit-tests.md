# Lab: Unit Tests

The starter application was built with some minimal test scaffolding. However, at this time it is just the scaffolding for a generic starter application and does not apply to the application that we have. In this lab we will learn:

- how to run the unit tests
- how to organize the unit tests
- some basic unit testing techniques

## Running the Tests

To run the existing unit test, run the following command:

```bash
$ npm run test:unit
```

There are two things we should note right away:

1. The current test fails.
1. The command runs the tests once and then exits.

The first item we will fix as we go.

For the second item, it would be nice if we could run the tests continuously during our development process and have them re-run each time we make a change. We _could_ do that with the following command:

```bash
$ npm run test:unit -- --watch
```

However, that is a lot of extra typing for something a developer will be doing every day, so let's add a script to our `package.json` file to make our developer's lives easier.

```json
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "test:dev": "vue-cli-service test:unit --watch",
    "test:unit": "vue-cli-service test:unit",
    "test:e2e": "vue-cli-service test:e2e",
    "lint": "vue-cli-service lint"
  },
```

Note the addition of the `test:dev` script. Right now, we have one test and it references a component that doesn't actually exist. Let's simplify that test a bit so we can test our new script:

```typescript
describe('HelloWorld.vue', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
```

Run the following command:

```bash
$ npm run test:dev
```

Jest should run our one test (which should pass) and then wait for changes. Try changing a one of the `true` values to `false`. The test should re-run and fail. Change the value back to `true` and the test should pass again. We have our general workflow in place. Leave the test runner running. Next we will start to add tests for our components.

## Scaffold the Tests for Our Application

Our one current test does nothing. We really would like to have our various components tested. Here is what we currently have:

- `App.vue`
- `views/Home.vue`

These components do not currently do much, so now is a really good time to scaffold the tests for them so we can build the tests up as we go. On the filesystem, we will build a structure of unit tests under `tests/unit` that mimics our file structure under `src`. Thise keeps the tests out of the way of our code while still keeping them easy to find.

### Configuration

Before we start coding our tests, we need to add one line to our `jest.config.js` file:

```JavaScript
module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transformIgnorePatterns: ["/node_modules/(?!\@ionic)"],
  transform: {
    '^.+\\.vue$': 'vue-jest'
  }
}
```

Note the <a href="https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization" target="_blank">`transformIgnorePatterns`</a> line. This tells `jest` to transform any of the `@ionic` modules while continuing to ignore the rest of the items under `node_modules`.

### App.vue

Have a look at `src/App.vue`. It does not do much that is testable, but we can make sure that it renders, so let's create a test that does just that. Create a file called `tests/unit/App.spec.ts`. Note that this follows the path and general naming convension of our `src`, but the `spec.ts` extension let's jest know that this is a TypeScript unit test file.

```typescript
import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });
});
```

Let's take a closer look at this test. First, we <a href="https://vue-test-utils.vuejs.org/guides/common-tips.html#shallow-mounting">shallow mount</a> the component. This renders the component within a virtual DOM test wrapper so we can access it and query its contents. However, it stubs any child components, making the test more efficient than if we did a full `mount`.

Next we make sure the wrapper is not empty by calling `exists()` on it. Had our component failed to render, we probably would have gotten exceptions out of the test, but even if we did not the wrapper would certainly be empty. Since it is not empty and we did not get any exceptions, we can assume the App component renders.

There is not much else we can effectively test here, so let's move on to the Home page.

### Home.vue

Have a look at `src/views/Home.vue`. What shoud we test here? We do not want to write too many tests, since we will be changing this all some time soon. Let's just test that the header has a proper title and that the container div has the text we expect. When we change this page later, the title test will still be valid, but the "container" one will require some heavy modification.

Create a file called `tests/unit/views/Home.spec.ts` with the following contents:

```typescript
import { mount } from '@vue/test-utils';
import Home from '@/views/Home.vue';

describe('Home.vue', () => {
  it('displays the title', () => {
    const wrapper = mount(Home);
    const titles = wrapper.findAllComponents('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Blank');
    expect(titles[1].text()).toBe('Blank');
  });

  it('displays the default text', () => {
    const wrapper = mount(Home);
    const container = wrapper.find('#container');
    expect(container.text()).toContain('Ready to create an app?');
  });
});
```

There are few key items to note with this test.

- The tests use `mount()` instead of `shallowMount()` since we want to query some actual DOM content in this case.
- The family of "find" methods take CSS selectors and find the matching item(s) returning either a `Wrapper` or `WrapperArray`
  - `find` - find the first element matching the selector
  - `findComponent` - find the first Vue component matching the selector
  - `findAll` - find all of the elements matching the selector
  - `findAllComponents` - find all of the Vue components matching the selector
- The Home page has two titles and they must should match. We find them both and check them.

## Clean-up

The `tests/unit/example.spec.ts` is not testing anything in your application and is no longer very useful to us, so let's just remove it.

## Conclusion

We now have our unit testing infrastructure in place and we have a handful of passing unit tests. This gives us a solid basis of tests as we begin building out our application.
