# Lab: The About Page

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

**Note:** this is an "extra credit" lab and can be skipped without affecting the main functionality of the application.

## Get the Data

Modify the application's `tsconfig.json` file to the code to resolve JSON files:

```json
  "compilerOptions": {
...
    "resolveJsonModule": true,
...
```

This will allow us to read the `package.json` file and get some important information from it which we can then return via our `setup()` function. Note that there is no reason for this data to be reactive.

**Note:** You may need to add the `author` node to the `package.json` file. You can just your your name like this: `"author": "Jackie Smith",`.

```typescript
  import { author, description, name, version } from '../../package.json';

...
    setup() {
      return { author, description, name, version };
    },
```

We can then update the template or the view.

```html
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>About Tea Taster</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-text-center ion-padding main-content">
      <ion-list>
        <ion-list-header>About</ion-list-header>
        <ion-item>
          <ion-label>Name</ion-label>
          <ion-note slot="end">{{ name }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Description</ion-label>
          <ion-note slot="end">{{ description }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Version</ion-label>
          <ion-note slot="end">{{ version }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Author</ion-label>
          <ion-note slot="end">{{ author }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
```

**Note:** If you change the `ion-title` value like I did here you will also need to reflect that change in your test.

## Move the Logout Logic

Currently, the logout logic is on the first page. Once the user has logged in, it is doubtful they will need to logout, so it would make more sense to put that functionality on a page like the "My Account" page, or "My Profile". We don't have one of those, but the about page will do for now.

We start by moving the logout related tests from the `TeaList` view's test to the `About` view's test. You will need to add a couple of imports, etc, but I leave that up to you at this point.

```typescript
it('performs a logout when the logout button is clicked', async () => {
  const { logout } = useAuth();
  const wrapper = await mountView();
  const button = wrapper.find('[data-testid="logout-button"]');
  router.replace = jest.fn();
  await button.trigger('click');
  expect(logout).toHaveBeenCalledTimes(1);
});

it('navigates to the login after the logout action is complete', async () => {
  const wrapper = await mountView();
  const button = wrapper.find('[data-testid="logout-button"]');
  router.replace = jest.fn();
  await button.trigger('click');
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/login');
});
```

I leave it up to you to move the proper code from `src/views/TeaList.vue` to `src/views/About.vue` and then clean up the `TeaList` code.

Be sure that:

- All of your tests are passing.
- You have no lint errors.
- Your app builds cleanly.
- Your app runs in the browser without warnings or errors in the console.
- Your app runs well on your devices.

If any of these are not the case, we should spend some time doing a little debugging.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to 1.0.0 in your `package.json` file! 🥳🎉🤓
