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

For this training application, we don't have a lot of extra styling so we will put the styles right into the `src/global.scss` file:

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

## Using the Ionic Color Generator 

Go to our <a href="https://ionicframework.com/docs/theming/color-generator" target="_blank">online color generator</a>. This allows you to specify various colors in the color scheme. Only the base value for each of the defined colors needs to be specified. The `-shade` and `-tint` variants will be automatically calculated, though the calculated values can be changed if so desired.

- Go to the Online Color Generator
- Change the `Primary` color to `#085a9e`
- Replace the `Primary` set of colors in the `:root` section in the `src/theme/variables.scss` file


```scss
--ion-color-primary: #085a9e;
--ion-color-primary-rgb: 8, 90, 158;
--ion-color-primary-contrast: #ffffff;
--ion-color-primary-contrast-rgb: 255, 255, 255;
--ion-color-primary-shade: #074f8b;
--ion-color-primary-tint: #216ba8;
```

The `src/theme/variables.scss` file also contains the color scheme for "dark mode."  For dark mode, we have two options. We can either remove it entirely by removing the dark mode section, or we can update the color scheme. Since it is always better for the user to respect their color options, lets do the latter. We will calculate a `Primary` color set that is more appropriate for our darker theme.

- Go to the Online Color Generator
- Change the `Primary` color to `#424242`
- Replace the `Primary` set of colors in the dark theme `body` section in the `src/theme/variables.scss` file

```scss
  --ion-color-primary: #424242;
  --ion-color-primary-rgb: 66,66,66;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255,255,255;
  --ion-color-primary-shade: #3a3a3a;
  --ion-color-primary-tint: #555555;
```


## Apply Colors

Right now, most of the application is sky blue (or black). That is because most of the components in the application are using the default background color. To change this, specify the `Primary` color for the tab bar and each page's header.

- Add `color="primary"` in the `ion-tab-bar` in `src/app/tabs/tabs.page.html`
- Add the following styling to the `global.scss` file

```scss
ion-toolbar {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}
```

This shows two different ways to apply the color to a component. The `color="primary"` was used on the `ion-tab-bar` because it is less work for the one tab bar that we have. The Custom CSS Property values were set for the `ion-toolbar` to avoid having to add `color="primary"` to the tollbar in every page of our application. In many cases it is better to use the `color` property as it will fully apply all related shades and tints as needed.

## Conclusion

You have learned how to apply basic theming and styling to the application. You should commit your changes at this point.
