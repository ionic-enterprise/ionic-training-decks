# Lab: Style the App 

In this lab, you will learn how to:

* Apply global themses and styles
* Theme the application using Ioinic Studio
* Apply different colors within the application
* Style the status bar

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

.item-ios,
.item-md {
  padding-left: 0;
}

.item-inner {
  padding: 12px;
}
```

## Using the Ionic Studio Theming Editor

**Note:** if you do not have Ioinc Studio, you can manually update `src/theme/variables.scss` as outlined below.

Ionic Studio include a theming editor that allows you to easy specify the color theme for the appliction. The theming editor reads the current `src/theme/variables.scss` file and applies that color theme to a sample page so the color theme can be seen as it is edited.

With the theming editor, only the base value for each of the defined colors needs to be specified. The `-shade` and `-tint` variants will be automatically calculated, though the calculated values can be changed if so desired.

* Open the project in Ioinc Studio
* Open the theming editor, is bottom icon on left
* Change the `Primary` color to `#085a9e`
* Change the `Secondary` color to `#f4a942`

In both cases, the `-shade` and `-tint` variants were automatically calculated. Have a look at those values by clicking on the `Primary` and `Secondary` colors. Save the changes.

Look at the `src/app/variables.scss` file and verify that the changes have been saved.

```scss
  /** primary **/
  --ion-color-primary: #085a9e;
  --ion-color-primary-rgb: 8,90,158;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255,255,255;
  --ion-color-primary-shade: #074f8b;
  --ion-color-primary-tint: #216ba8;
  /** secondary **/
  --ion-color-secondary: #f4a942;
  --ion-color-secondary-rgb: 244,169,66;
  --ion-color-secondary-contrast: #000000;
  --ion-color-secondary-contrast-rgb: 0,0,0;
  --ion-color-secondary-shade: #d7953a;
  --ion-color-secondary-tint: #f5b255;
```

## Apply Colors

Right now, most of the application is sky blue. That is because most of the components in the application are using the default background color. To change this, specify the `Primary` color for the tab bar and each page's header.

* Add `color="primary"` in the `ion-tab-bar` in `src/app/tabs/tabs.page.html` 
* Add `color="primary"` in the `ion-toolbar` in each of the other pages. 

## Style the Status Bar

Run the application on a device or emulator. Notice that the status bar text is dark. That can be changed by using the "Light Content" style instead of the default style. In `src/app/app.component.ts`, change `this.statusBar.styleDefault()` to `this.statusBar.styleLightContent()`.

Depending on which version of Android the application is run on, the status bar may be black or a rather ugly shade of teal. Let's specify a color that more closely matches out application's header while still being different (as per the Android guidelines). For this, we will use the same value as specified by `--ion-color-primary-shade`. This change in status bar color should only apply to Adroid, however, as the iOS specs call for a consistent color.

When complete, the code should look like this:


```TypeScript
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      if (this.platform.is('android')) {
        this.statusBar.backgroundColorByHexString('#074f8b');
      }
    });
  }
```

<!-- TODO: Add a section on unit testing considerations. -->

## Conclusion

You have learned how to apply basic theming and styling to the application. You should commit your changes at this point.
