# Lab: Style the App

In this lab, you will learn how to:

- Apply global themes and styles
- Theme the application using our online color generator
- Apply different colors within the application

## Global Theming and Styling

The global theming an application is controlled via the `src/theme/variables.css` file. We will add a second file called `src/theme/styles.css` which we will use to specify the global styling of the application.

### `src/theme/variables.css`

The `src/theme/variables.css` file contains a collection of custom properties (AKA "CSS variables") that are used to define the color theme of the application. Since this is a weather application, a nice sky blue color might be nice for the background.

Add `--ion-background-color: #b9dbf7;` within the `:root` scope in this file.

### `src/theme/styles.css`

**Note:** this file does not exist, you will need to create it yourself. Be sure to also import it in your `App.tsx` file just like the `variables.css` file is.

It is best to do as much styling as possible globally to give the application a consistent look and feel. For this training application, we don't have a lot of extra styling so we will put the styles right into the `src/theme/styles.css` file:

```css
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

## Using the Online Color Generator

You can use our <a href="https://ionicframework.com/docs/theming/color-generator" target="_blank">online color generator</a> to generate a color theme for your application. You can then update `src/theme/variables.css` by copying the output of the generator. Using the color generator, only the base value for each of the defined colors needs to be specified. The `-shade` and `-tint` variants will be automatically calculated, though the calculated values can be changed if so desired.

- Load the online color generator
- Change the `Primary` color to `#085a9e`
- Change the `Secondary` color to `#f4a942`

In both cases, the `-shade` and `-tint` variants were automatically calculated. Have a look at those values by clicking on the `Primary` and `Secondary` colors. Save the changes.

Look at the `src/app/variables.css` file and verify that the changes have been saved.

```css
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
- Add the following styling to the `styles.css` file

```css
ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}
```

This shows two different ways to apply the color to a component. The `color="primary"` was used on the `ion-tab-bar` because it is less work for the one tab bar that we have. The Custom CSS Property values were set for the `ion-toolbar` to avoid having to add `color="primary"` to the tollbar in every page of our application. In many cases it is better to use the `color` property as it will fully apply all related shades and tints as needed.

## Conclusion

You have learned how to apply basic theming and styling to the application.

You should commit your changes at this point.
