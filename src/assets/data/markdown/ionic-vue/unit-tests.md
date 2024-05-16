# Lab: Unit Tests

The starter application was built with some minimal test scaffolding. However, at this time it is just the scaffolding for a generic starter application and does not apply to the application that we have. In this lab we will learn:

- how to run the unit tests
- how to organize the unit tests
- some basic unit testing techniques

## Running the Tests

To run the existing unit test, run the following command:

```bash
npm run test:unit
```

This command runs the unit tests in watch mode, which is great for development, but is not the only option we want. It would be nice to also have an option that runs all of the tests once and then exists and another option that runs all of the tests and generates a coverage report. We will create the following test commands:

- `test`: run all of the tests once and exit
- `test:dev`: run the tests in "development mode" (that is, just like `test:unit` currently does)
- `test:cov`: run the tests once and generate a coverage report

In order to facilitate the coverage report generation, we need to install the `@vitest/coverage-v8` package as a development dependency:

```bash
npm i -D @vitest/coverage-v8
```

We can then update the `package.json` file to:

- Rename `test:unit` to `test:dev`.
- Create the `test` script.
- Create the `test:cov` script.

```json
  "scripts": {
    "build": "vue-tsc && vite build",
    "dev": "vite",
    "prepare": "husky",
    "preview": "vite preview",
    "lint": "eslint",
    "test": "vitest run",
    "test:cov": "vitest run --coverage",
    "test:dev": "vitest",
    "test:e2e": "cypress run"
  },
```

Now when we want to start development, we can queue up our test server by running the following command:

```bash
npm run test:dev
```

Try `npm test` and `npm run test:cov` as well to see how their execution differs.

We have our general workflow in place. Leave the test runner running. Next we will start to add tests for our components.

**Note:** if you are using VS Code and have the proper Vite extensions installed you can also run Vite and Vitest directly from the IDE. Whether you use these scripts or the VS Code extension is strictly a matter of taste.

## Scaffold the Tests for Our Application

We currently have a single test in `tests/unit/example.spec.ts`. It is a nice example, but it is not going to scale well. Since unit tests are intended to test the various parts of our system in isolation, it makes sense that the file structure for our tests will resemble the file structure of our application.

Our application currently has the following components:

- `App.vue`
- `views/HomePage.vue`

These components do not currently do much, so now is a really good time to scaffold the tests for them so we can build the tests up as we go. On the file system, we will build a structure of unit tests under `tests/unit` that mimics our file structure under `src`. This keeps the tests out of the way of our code while still making them easy to find.

### App.vue

Have a look at `src/App.vue`. It does not do much that is testable, but we can make sure that it renders, so let's create a test that does just that. Create a file called `src/__tests__/App.spec.ts`. Note that this follows the path and general naming convention of `src/App.vue`, but the `spec.ts` extension lets vitest know that this is a TypeScript unit test file.

```typescript
import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from '@/App.vue';

describe('App.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });
});
```

Let's take a closer look at this test. First, we <a href="https://vue-test-utils.vuejs.org/guides/common-tips.html#shallow-mounting" target="_blank">shallow mount</a> the component. This renders the component within a virtual DOM test wrapper so we can access it and query its contents. However, it stubs any child components, making the test more efficient than if we did a full `mount`.

Next we make sure the wrapper is not empty by calling `exists()` on it. Had our component failed to render, we probably would have gotten exceptions out of the test, but even if we did not the wrapper would certainly be empty. Since it is not empty and we did not get any exceptions, we can assume the App component renders.

There is not much else we can effectively test here, so let's move on to the Home page.

**Note:** some editors will provide an error such as `Cannot find module '@/App.vue' or its corresponding type declarations.` This does not cause any issues with the test itself, but to remove the issue in the editor modify the `src/vite-env.d.ts` as such:

```typescript
/// <reference types="vite/client" />

declare module '*.vue';
```

### HomePage.vue

The `tests/unit/example.spec.ts` test is testing `HomePage.vue`, so let's just start with a little housekeeping to make this more obvious:

- `mkdir src/views/__tests__`
- `git mv tests/unit/example.spec.ts src/views/__tests__/HomePage.spec.ts`

**Note:** the starter puts all unit tests in `tests/unit` but I prefer to have them near the sources. Vitest is flexible here. Do what works best for you. This training will use the `__tests__` folders under `src`.

Have a look at `src/views/HomePage.vue`. What should we test here? We do not want to write too many tests, since we will be changing this all some time soon. Let's just test that the header has a proper title and that the container div has the text we expect.

Let's just make a slight modification to `src/views/__tests__/HomePage.spec.ts`:

```typescript
import HomePage from '@/views/HomePage.vue';
import { IonTitle } from '@ionic/vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('HomePage.vue', () => {
  it('displays the title', () => {
    const wrapper = mount(HomePage);
    const titles = wrapper.findAllComponents(IonTitle);
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Blank');
    expect(titles[1].text()).toBe('Blank');
  });

  it('displays the default text', () => {
    const wrapper = mount(HomePage);
    const container = wrapper.find('#container');
    expect(container.text()).toContain('Ready to create an app?');
  });
});
```

There are few key items to note with this test.

- The test was using `test()` and we changed to using `it()`. This is a matter of personal taste, and you can use either one.
- The test was already using `mount()` instead of `shallowMount()`. This is because we want to query some actual DOM content.
- The "find" methods take CSS selectors and find the matching item(s) returning either a `DOMWrapper` or array of `DOMWrapper`.
  - `find` - find the DOM first element matching the selector
  - `findAll` - find all of the DOM elements matching the selector
- The Home page has two titles and they must should match. We find them both and check them.

The Vue test utilities also provide "findComponent" methods (not shown here) which are used to access Vue components. They return a `VueWrapper` or an array of `VueWrapper`. We will use these to obtain wrappers to the Vue component when we need to perform an operation that we cannot perform via the DOM element. These functions are:

- `findComponent` - find the first Vue component matching the selector
- `findAllComponents` - find all of the Vue components matching the selector

## Conclusion

We now have our unit testing infrastructure in place and we have a handful of passing unit tests. This gives us a solid basis of tests as we begin building out our application.
