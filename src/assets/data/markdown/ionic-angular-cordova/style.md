# Lab: Style the App

In this lab, you will learn how to:

- Apply global themes and styles
- Theme the application using Ioinic Studio (or our online color generator)
- Apply different colors within the application
- Style the status bar

## Global Theming and Styling

The global theming and styling of an application is controlled via two different files: `src/theme/variables.scss` and `src/global.scss`. The majority of theming and styling for the application should occur through these two files.

### `src/theme/variables.scss`

The `src/theme/variables.scss` file contains a collection of custom properties (AKA "CSS variables") that are used to define the color theme of the application. Since this is a weather application, a nice sky blue color might be nice for the background.

Add `--ion-background-color: #b9dbf7;` within the `:root` scope in this file.

### `src/global.scss`

It is best to do as much styling as possible globally to give the application a consistent look and feel. Notice the existing imports. This is also a best practice. Create files that group the styles together in a manner that makes sense for the application.

For this training application, we don't have a lot of extra styling so we will put the styles right into the `src/global/scss` file:

```scss
.primary-value {
  font-size: 36px;
}

.secondary-value {
  font-size: 24px;
}

ion-item {
  --inner-padding-top: 12px;
  --inner-padding-bottom: 12px;
}
```

## Using the Ionic Studio Theming Editor

**Note:** if you do not have Ioinc Studio, you can use our <a href="https://ionicframework.com/docs/theming/color-generator" target="_blank">online color generator</a> and then manually update `src/theme/variables.scss` by copying the output of the generator.

Ionic Studio include a theming editor that allows you to easy specify the color theme for the appliction. The theming editor reads the current `src/theme/variables.scss` file and applies that color theme to a sample page so the color theme can be seen as it is edited.

With the theming editor, only the base value for each of the defined colors needs to be specified. The `-shade` and `-tint` variants will be automatically calculated, though the calculated values can be changed if so desired.

- Open the project in Ioinc Studio
- Open the theming editor, is bottom icon on left
- Change the `Primary` color to `#085a9e`
- Change the `Secondary` color to `#f4a942`

In both cases, the `-shade` and `-tint` variants were automatically calculated. Have a look at those values by clicking on the `Primary` and `Secondary` colors. Save the changes.

Look at the `src/app/variables.scss` file and verify that the changes have been saved.

```scss
/** primary **/
--ion-color-primary: #085a9e;
--ion-color-primary-rgb: 8, 90, 158;
--ion-color-primary-contrast: #ffffff;
--ion-color-primary-contrast-rgb: 255, 255, 255;
--ion-color-primary-shade: #074f8b;
--ion-color-primary-tint: #216ba8;

/** secondary **/
--ion-color-secondary: #f4a942;
--ion-color-secondary-rgb: 244, 169, 66;
--ion-color-secondary-contrast: #000000;
--ion-color-secondary-contrast-rgb: 0, 0, 0;
--ion-color-secondary-shade: #d7953a;
--ion-color-secondary-tint: #f5b255;
```

## Apply Colors

Right now, most of the application is sky blue. That is because most of the components in the application are using the default background color. To change this, specify the `Primary` color for the tab bar and each page's header.

- Add `color="primary"` in the `ion-tab-bar` in `src/app/tabs/tabs.page.html`
- Add the following styling to the `global.scss` file

```scss
ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}
```

This shows two different ways to apply the color to a component. The `color="primary"` was used on the `ion-tab-bar` because it is less work for the one tab bar that we have. The Custom CSS Property values were set for the `ion-toolbar` to avoid having to add `color="primary"` to the tollbar in every page of our application.

## Style the Status Bar

Run the application on a device or emulator. Notice that the status bar text is black. On Android, the status bar itself may also be black, making the status bar text invisible.

There is another issue, but only on Android. The status bar color. Android guidelines <a href="https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-statusbar/#android-quirks" target="_blank">call for the status bar color to be different from the application's title bar</a>, which it is, but most Android applications pick a color that is only slightly different.

We can fix all of that by:

1. Using the "Light Content" style instead of the default content.
1. Setting the background color for the status bar to `#074f8b` (the hex value for `--ion-color-primary-shade`), but only if the current platform is `Android`

This changes the requirements for the application component. Following TDD, we should do this one step at a time to craft our code, first writing a test, then writing the code to satisfy that test.

The following steps require changes to two files:

- `src/app/app.component.spec.ts`
- `src/app/app.component.ts`

### Step 0 - Update the `statusBar` Mock

The status bar mock is currently created in `app.component.spec.ts` as such: `statusBar = jasmine.createSpyObj('StatusBar', ['styleDefault']);`

We are going to use two different methods: `styleLightContent()` and `backgroundColorByHexString()`

Change the status bar mock creation to reflect that: `statusBar = jasmine.createSpyObj('StatusBar', ['styleLightContent', 'backgroundColorByHexString']);`

### Step 1 - Change the Status Bar Style

Currently there is a test that verifies the following requirement: `it('sets the default status bar style when ready'...`.

1. Change the title of the test to reflect the new requirement
1. Change the content of the test to match the new requirement

```TypeScript
    it('sets the light content status bar style when ready', async () => {
      const platform = TestBed.get(Platform);
      TestBed.createComponent(AppComponent);
      expect(statusBar.styleLightContent).not.toHaveBeenCalled();
      await platform.ready();
      expect(statusBar.styleLightContent).toHaveBeenCalledTimes(1);
    });
```

A couple of tests should now be failing. Update the code to make that test pass.

### Step 2 - Change the Background Color on Android

This requirement has two different cases, one for Android and one for everything else. The `Platform` service has a method called `is()` that returns true if the current platform meets a specified constraint and false otherwise.

The mock for the `Platform` looks like this:

```TypeScript
export function createPlatformMock() {
  return jasmine.createSpyObj('Platform', {
    is: false,
    ready: Promise.resolve()
  });
}
```

#### Step 2.1 - Check that the background is not set

So the default behavior is the `false` case. Let's create a test for that now:

```TypeScript
it('does not set the background color by default', async () => {
  const platform = TestBed.get(Platform);
  TestBed.createComponent(AppComponent);
  expect(statusBar.backgroundColorByHexString).not.toHaveBeenCalled();
  await platform.ready();
  expect(statusBar.backgroundColorByHexString).not.toHaveBeenCalled();
});
```

This test passes already. There is nothing to do at this time.

#### Step 2.2 - Check that the background is set for Android

If the platform is Android we need to set the background color for the status bar. Let's write a test for that as well. For this test, we will set up `platform.is()` to return `true`, but only if called with a parameter of 'android'.

```TypeScript
it('sets the background color if the current platform is android', async () => {
  const platform = TestBed.get(Platform);
  platform.is.withArgs('android').and.returnValue(true);
  TestBed.createComponent(AppComponent);
  expect(statusBar.backgroundColorByHexString).not.toHaveBeenCalled();
  await platform.ready();
  expect(statusBar.backgroundColorByHexString).toHaveBeenCalledTimes(1);
  expect(statusBar.backgroundColorByHexString).toHaveBeenCalledWith('#074f8b');
});
```

This test fails, so let's write some code that makes it pass without the other tests failing.

### Check Your Code

When complete, the code should look like this:

```TypeScript
initializeApp() {
  this.platform.ready().then(() => {
    this.statusBar.styleLightContent();
    if (this.platform.is('android')) {
      this.statusBar.backgroundColorByHexString('#074f8b');
    }
    this.splashScreen.hide();
  });
}
```

## Conclusion

You have learned how to apply basic theming and styling to the application.

You have also exercised a little Test Driven Development. If you continuously build your application in this manner, you will have a full set of tests that are run with each change. This gives you more confidence that your current changes are not breaking your existing code.

You should commit your changes at this point.
